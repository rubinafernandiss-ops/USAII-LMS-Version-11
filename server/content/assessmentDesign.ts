/**
 * Assessment design for the two USAII courses: what each question measures,
 * which learning objective each final assessment question assesses, and the
 * rubric each applied activity is scored against.
 *
 * The course files themselves are generated from the source documents and are
 * not hand-edited, so this design is kept here and applied on top of them.
 * `applyAssessmentDesign` only fills in what is missing, so it is safe to run
 * on a live database: anything an instructor has since set in Course Builder
 * is never overwritten.
 */
import type { Course, QuestionKind, RubricCriterion } from '../../shared/types';

/** Questions that put the learner in a workplace situation and ask for a judgment. Everything else is Knowledge. */
const SCENARIO = new Set([
  // AI Fluency for the Workplace: lesson checks
  'q18', 'q19', 'q20', 'q39', 'q94', 'q95', 'q113', 'q131',
  // AI Fluency for the Workplace: final assessment
  'q168', 'q169', 'q171', 'q179', 'q182',
  // Prompt and Context Engineering: lesson checks
  'q217', 'q234', 'q302', 'q319',
  // Prompt and Context Engineering: final assessment
  'q339', 'q347', 'q349',
]);

/** Final assessment question → the lesson whose learning objective it assesses. Unlisted = whole course. */
const FINAL_OBJECTIVE: Record<string, string> = {
  q168: 'af-d1', q169: 'af-d1', q170: 'af-d1', q171: 'af-d1',
  q172: 'af-d3', q173: 'af-d3', q174: 'af-d3', q175: 'af-d3',
  q176: 'af-d6', q177: 'af-d5', q178: 'af-d6', q179: 'af-d6',
  q180: 'af-d7', q181: 'af-d7', q182: 'af-d7', q183: 'af-d7',
  q338: 'pc-d1', q339: 'pc-d3', q340: 'pc-d4', q341: 'pc-d4',
  q342: 'pc-d5', q343: 'pc-d5', q344: 'pc-d6', q345: 'pc-d6',
  q346: 'pc-d7', q347: 'pc-d7', q348: 'pc-d7', q349: 'pc-d8',
  q350: 'pc-d9', q351: 'pc-d9', q352: 'pc-d9',
  // q353 (the order of the whole canvas) is a course-wide question.
};

const c = (id: string, label: string, description: string): RubricCriterion => ({ id, label, description });

/** Observable criteria for each applied activity, keyed by lesson id. */
const RUBRICS: Record<string, RubricCriterion[]> = {
  /* ---------------- AI Fluency for the Workplace ---------------- */
  'af-d1': [
    c('af-d1-r1', 'Real, specific tasks', 'Lists five or more tasks actually done at work last week, one plain line each.'),
    c('af-d1-r2', 'Correct dependency for each task', 'Names what a good result depends on: general language, private records, or exact numbers.'),
    c('af-d1-r3', 'Sound AI helps or do-it-myself call', 'Each call follows from the dependency. Tasks needing private data or exact figures stay with the learner.'),
    c('af-d1-r4', 'Job type or reason given', 'Every AI-helps task has a job type; every do-it-myself task has a short reason.'),
    c('af-d1-r5', 'One task chosen for this week', 'Circles one realistic AI-helps task to use this week.'),
  ],
  // The five criteria recommended for the personal AI use-case list.
  'af-d2': [
    c('af-d2-r1', 'Appropriate task selection', 'Use cases are specific, recurring tasks, not broad categories such as "emails".'),
    c('af-d2-r2', 'Clear expected business value', 'States what a good result would save or improve each time.'),
    c('af-d2-r3', 'Recognition of accuracy, privacy, or human-review requirements', 'Notes where facts must be checked, data must be protected, or a person must review.'),
    c('af-d2-r4', 'Suitability of the proposed AI use', 'The top use case plays to what AI does well and avoids what it cannot do reliably.'),
    c('af-d2-r5', 'Practical next steps', 'Explains why this use case comes first and how it will be built on.'),
  ],
  'af-d3': [
    c('af-d3-r1', 'All four elements present', 'Task, role, constraints, and format are each stated.'),
    c('af-d3-r2', 'Constraints are concrete', 'Length, tone, audience, or scope limits are specific enough to check.'),
    c('af-d3-r3', 'Prompt was tested on a real task', 'The final prompt is the version that produced a usable result.'),
    c('af-d3-r4', 'Revision is explained', 'Names what changed between the first and final version, and why.'),
  ],
  'af-d4': [
    c('af-d4-r1', 'Clear task and audience', 'States the writing or summarizing task and who reads the output.'),
    c('af-d4-r2', 'Repeatable steps', 'Steps are ordered and could be followed again next time.'),
    c('af-d4-r3', 'Review against the brief', 'Includes reading the draft against what the reader needs, not just polishing wording.'),
    c('af-d4-r4', 'Appropriate for AI', 'The task is a sound fit for AI writing or summarization.'),
  ],
  'af-d5': [
    c('af-d5-r1', 'Clear planning or analysis task', 'Names a real planning or analysis task the workflow handles.'),
    c('af-d5-r2', 'Repeatable steps', 'Steps are ordered and specific enough to reuse.'),
    c('af-d5-r3', 'Heavier review built in', 'Checks assumptions, dates, figures, and dependencies before relying on the plan.'),
    c('af-d5-r4', 'A check that is never skipped', 'Names one concrete check tied to the risk of this task.'),
  ],
  'af-d6': [
    c('af-d6-r1', 'Facts are verified', 'Says where facts are confirmed, with a real source.'),
    c('af-d6-r2', 'Missing content is checked', 'Checks for anything the task needed that the output left out.'),
    c('af-d6-r3', 'Format and tone are checked', 'Compares the output with what was asked for.'),
    c('af-d6-r4', 'Sign-off test', 'Asks whether the learner would put their name on it as it stands.'),
    c('af-d6-r5', 'Use-case-specific check', 'Adds one extra check that fits the learner\'s own use case.'),
  ],
  'af-d7': [
    c('af-d7-r1', 'Sensitive data is removed or masked', 'Names what is removed or masked before prompting.'),
    c('af-d7-r2', 'Approved tool for the data', 'Confirms the tool is approved for this kind of data.'),
    c('af-d7-r3', 'Facts verified against a real source', 'Lists facts that are always verified, and the source used.'),
    c('af-d7-r4', 'Decisions stay with people', 'Names decisions never handed to AI.'),
    c('af-d7-r5', 'Human sign-off', 'A person signs the final version.'),
  ],
  'af-d8': [
    c('af-d8-r1', 'Recurring use case with a trigger', 'The workflow serves a task that repeats, with a clear trigger.'),
    c('af-d8-r2', 'Complete steps', 'Material, prompt, review, and safeguard steps are all present.'),
    c('af-d8-r3', 'Builds on earlier work', 'Uses the prompt, review checklist, and safeguards from earlier days.'),
    c('af-d8-r4', 'Tested and improved', 'Tested on a real task, with what was fixed after testing.'),
  ],
  'af-d9': [
    c('af-d9-r1', 'Specific schedule', 'Names the workflow, the day, and the time it will run.'),
    c('af-d9-r2', 'Stakeholders and disclosure considered', 'Identifies who receives or reviews the output and whether they need to know AI was involved.'),
    c('af-d9-r3', 'Approval addressed', 'Names any approval needed first and how it will be obtained.'),
    c('af-d9-r4', 'Obstacle and plan', 'Names a realistic obstacle and a concrete plan for it.'),
    c('af-d9-r5', 'Mid-week checkpoint', 'Sets a checkpoint day to review progress.'),
  ],

  /* ---------------- Prompt and Context Engineering ---------------- */
  'pc-d1': [
    c('pc-d1-r1', 'All four elements present', 'Task, role, constraints, and format are each stated.'),
    c('pc-d1-r2', 'Elements are specific', 'Each element is concrete enough to change the output.'),
    c('pc-d1-r3', 'Assembled prompt is coherent', 'The elements combine into one usable prompt.'),
    c('pc-d1-r4', 'Output was reviewed', 'The first output is recorded and compared with the brief.'),
  ],
  'pc-d2': [
    c('pc-d2-r1', 'Patterns fit repeatable work', 'Each pattern is for a task that recurs.'),
    c('pc-d2-r2', 'Fixed parts stay fixed', 'Role, constraints, and format are stable across uses.'),
    c('pc-d2-r3', 'Slots hold what changes', 'Curly-brace slots hold only the details that vary each time.'),
    c('pc-d2-r4', 'Three distinct patterns', 'Three patterns are complete and serve different tasks.'),
  ],
  'pc-d3': [
    c('pc-d3-r1', 'Tested on several cases', 'The pattern is run on three different cases.'),
    c('pc-d3-r2', 'Judged against criteria', 'Each case is judged for accuracy, completeness, format, and constraints.'),
    c('pc-d3-r3', 'Wording fixes separated from knowledge gaps', 'Failures fixable by wording are kept apart from failures caused by missing knowledge.'),
    c('pc-d3-r4', 'Missing knowledge named', 'States the knowledge each ceiling failure needed.'),
  ],
  'pc-d4': [
    c('pc-d4-r1', 'Knowledge-dependent use case', 'The task depends on knowledge the model does not have.'),
    c('pc-d4-r2', 'Prompting limit identified', 'Names the knowledge prompting alone cannot supply.'),
    c('pc-d4-r3', 'Stakeholders identified', 'Names who relies on the output.'),
    c('pc-d4-r4', 'Cost of error stated', 'States what a wrong answer would cost.'),
  ],
  'pc-d5': [
    c('pc-d5-r1', 'Sources are specific', 'Each source is a named document, example, or record, not a broad category such as "policies".'),
    c('pc-d5-r2', 'Location and type given', 'Says where each source lives and what type it is.'),
    c('pc-d5-r3', 'Sensitive data handled', 'Flags sources with sensitive data to sanitize or substitute.'),
    c('pc-d5-r4', 'Matches the use case', 'The sources are the ones this task actually needs.'),
  ],
  'pc-d6': [
    c('pc-d6-r1', 'Each source has a job', 'States what each source contributes to the answer.'),
    c('pc-d6-r2', 'Only the needed portion', 'Trims each source to the part the answer depends on.'),
    c('pc-d6-r3', 'Currency and ownership', 'Records how current each source is and who owns it.'),
    c('pc-d6-r4', 'Examples used well', 'Explains what each worked example teaches the model.'),
    c('pc-d6-r5', 'Source order', 'Sets the order in which the answer draws on the sources.'),
  ],
  'pc-d7': [
    c('pc-d7-r1', 'Clear boundaries', 'Each guardrail states a clear boundary.'),
    c('pc-d7-r2', 'A fallback for every guardrail', 'Says what the system does instead when a boundary is reached.'),
    c('pc-d7-r3', 'Human escalation', 'Names cases that must go to a person, and who.'),
    c('pc-d7-r4', 'Policy limits respected', 'Lists the policy or compliance limits the output must respect.'),
    c('pc-d7-r5', 'Tested against an edge case', 'Records an edge case tried against a guardrail, and the result.'),
  ],
  'pc-d8': [
    c('pc-d8-r1', 'Flow is mapped step by step', 'Each step names its tool, memory, and state.'),
    c('pc-d8-r2', 'Memory and state are complete', 'Earlier interactions and the current status carry through the flow.'),
    c('pc-d8-r3', 'Human step identified', 'Names the step where a person acts.'),
    c('pc-d8-r4', 'Limits on the AI', 'States what the AI is not allowed to do on its own.'),
  ],
  'pc-d9': [
    c('pc-d9-r1', 'Complete review checks', 'Checks grounding, guardrails, completeness, format, and human approval.'),
    c('pc-d9-r2', 'Clear ownership', 'Names who reviews, who signs off, and who re-verifies sources, and how often.'),
    c('pc-d9-r3', 'Fail path defined', 'Says what happens when a check fails.'),
    c('pc-d9-r4', 'End-to-end test', 'Records an end-to-end test case and its result.'),
  ],
};

/** Fill in assessment design that is missing. Returns true if anything changed. */
export function applyAssessmentDesign(course: Course): boolean {
  let changed = false;
  const lessonIds = new Set(course.modules.flatMap((m) => m.lessons.map((l) => l.id)));
  const tag = (q: { id: string; kind?: QuestionKind }) => {
    if (q.kind) return;
    q.kind = SCENARIO.has(q.id) ? 'scenario' : 'knowledge';
    changed = true;
  };
  for (const m of course.modules)
    for (const l of m.lessons) {
      l.check.forEach(tag);
      const rubric = RUBRICS[l.id];
      if (l.activity && rubric && !l.activity.rubric?.length) {
        l.activity.rubric = rubric.map((x) => ({ ...x }));
        changed = true;
      }
    }
  for (const q of course.finalExam?.questions ?? []) {
    tag(q);
    const obj = FINAL_OBJECTIVE[q.id];
    if (!q.objectiveId && obj && lessonIds.has(obj)) {
      q.objectiveId = obj;
      changed = true;
    }
  }
  return changed;
}
