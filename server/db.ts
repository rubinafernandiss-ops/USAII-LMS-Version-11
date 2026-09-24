// Lightweight persistent JSON database with atomic, debounced writes.
// Swappable for PostgreSQL later: all access goes through `db()` and `save()`.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Database } from '../shared/types';
import { applyAssessmentDesign } from './content/assessmentDesign';

const USAII_COURSES = new Set(['c_ai_fluency', 'c_prompt_context']);

export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, 'data');
// UPLOAD_DIR can point at a persistent disk on a host (see render.yaml). Default: ./uploads
export const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(ROOT, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const DB_VERSION = 6;

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

let state: Database | null = null;
let timer: NodeJS.Timeout | null = null;

export function uid(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export const nowIso = () => new Date().toISOString();

export function loadDb(seed: () => Database): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
      if (parsed.version === DB_VERSION) {
        state = parsed;
        return state;
      }
      // Version 4 → 5: the administrator role was retired. Keep every learner,
      // course, and record; hand anything the administrator owned to an instructor.
      // Version 4 → 5 → 6. Each step keeps every learner, course, and record.
      if (parsed.version === 4 || parsed.version === 5) {
        let next = parsed;
        if (next.version === 4) {
          next = migrateRemoveAdmin(next);
          console.log('[db] Updated data: the administrator role has been removed. Nothing else changed.');
        }
        next = migrateMetrics(next);
        console.log('[db] Updated data: Comprehension and Mastery are ready. Nothing else changed.');
        state = next;
        flush();
        return state;
      }
      console.log('[db] Data format changed. Re-seeding demo data.');
    } catch (e) {
      const backup = DB_FILE + `.corrupt-${Date.now()}`;
      fs.copyFileSync(DB_FILE, backup);
      console.warn(`[db] Could not read database. Backup saved to ${backup}. Re-seeding.`);
    }
  }
  state = seed();
  flush();
  return state;
}

export function replaceDb(next: Database) {
  state = next;
  flush();
}

export function db(): Database {
  if (!state) throw new Error('Database not loaded');
  return state;
}

export function save() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 150);
}

export function flush() {
  if (!state) return;
  timer = null;
  const data = JSON.stringify(state);
  const tmp = DB_FILE + '.tmp';
  try {
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, DB_FILE);
  } catch {
    // Some Windows setups (antivirus / file indexers) briefly lock files; fall back to a direct write.
    fs.writeFileSync(DB_FILE, data);
  }
}

process.on('exit', flush);
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    flush();
    process.exit(0);
  });
}

/** Remove administrator accounts and anything that only existed for them. */
function migrateRemoveAdmin(d: Database): Database {
  const legacy = d as unknown as { users: { id: string; role: string; active: boolean }[] };
  const adminIds = new Set(legacy.users.filter((u) => u.role === 'admin').map((u) => u.id));
  const heir = d.users.find((u) => u.role === 'instructor' && u.active) ?? d.users.find((u) => u.role === 'instructor');
  d.users = d.users.filter((u) => !adminIds.has(u.id));
  if (heir) for (const c of d.courses) if (adminIds.has(c.createdBy)) c.createdBy = heir.id;
  // Instructor-to-administrator questions no longer have anyone to answer them.
  d.threads = d.threads.filter((t) => !(t.authorRole === 'instructor' && t.audience === 'instructor'));
  d.notifications = d.notifications.filter((n) => !adminIds.has(n.userId));
  d.audit = d.audit.filter((a) => !adminIds.has(a.actorId));
  // Live sessions were retired too: drop their records, events, and alerts.
  delete (d as unknown as { officeHours?: unknown }).officeHours;
  d.events = d.events.filter((e) => (e.type as string) !== 'attend');
  d.notifications = d.notifications.filter((n) => (n.kind as string) !== 'office_hours');
  d.version = 5;
  return d;
}

/**
 * 5 → 6: Comprehension and Mastery. Adds the assessment design (question types, final
 * assessment objectives, activity rubrics) to the two USAII courses where it is missing.
 * Learner records are untouched: older attempts are read from their answers, and
 * activities count toward Mastery once an instructor scores them against the rubric.
 */
function migrateMetrics(d: Database): Database {
  for (const c of d.courses) if (USAII_COURSES.has(c.id)) applyAssessmentDesign(c);
  // Feedback saved before 5.3 without a type came from the quick check-in.
  for (const f of d.feedback ?? []) if (!f.kind) f.kind = 'pulse';
  d.version = DB_VERSION;
  return d;
}
