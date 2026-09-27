import type { Component } from '../schema';

export const component: Component = {
  id: 'telos',
  name: 'TELOS',
  box: 'context',
  status: 'Templates shipped. The starter scaffolds under LIFEOS/USER_TEMPLATES/ and the Telos skill ship with the release. What goes inside your own TELOS files is yours to write, and the setup flow interviews you to draw it out.',
  summary: 'A set of files where you write down who you are and what you are trying to do, so the AI judges its answers against your real life instead of a generic one.',
  purpose: 'Give a model a vague ask and you get confident motion in a random direction. [[TELOS]] holds your mission, goals, problems and strategies in writing, so every task can be framed against what you actually want.',
  who: 'lifeos',
  trigger: '[[CLAUDE.md]] carries a top-level [[@-import]] of `LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md`. [[Claude Code]] reads that file into [[context]] at the start of every [[session]], with no command from you. Separately, the Telos [[skill]] fires when a [[prompt]] matches its trigger phrases, such as "my goals" or "add to TELOS".',
  input: 'Your own answers about mission, goals, problems, strategies, beliefs and challenges, written into the files under `LIFEOS/USER/TELOS/`. The shipped templates give you the shape so you are not staring at a blank file.',
  output: 'A short generated derivative, `PRINCIPAL_TELOS.md`, that is small enough to load on every session. Also `LIFEOS_STATE.json`, the per-dimension percentages that the [[Pulse]] dashboard rings and the [[statusline]] read.',
  files: [
    { path: 'LIFEOS/USER/TELOS/TELOS.md', mode: 'read', note: 'the source of truth you write, one H2 section per kind of thing' },
    { path: 'LIFEOS/TOOLS/GenerateTelosSummary.ts', mode: 'exec', note: 'reads the TELOS source files and writes the compressed summary' },
    { path: 'LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md', mode: 'read+write', note: 'the generated ~60-line derivative; written by the tool, read by every session' },
    { path: 'LIFEOS/USER/TELOS/LIFEOS_STATE.json', mode: 'read', note: 'dimension percentages the dashboard rings and the statusline show' },
    { path: 'LIFEOS/USER_TEMPLATES/Goals.md', mode: 'read', note: 'a shipped starter scaffold you copy into your own tree and edit' },
  ],
  how: 'You write the long version once. `LIFEOS/USER/TELOS/TELOS.md` holds mission, goals, problems, strategies, narratives, challenges and more, each as its own H2 section. The Telos skill at `skills/Telos/SKILL.md` is the safe way in: its Update workflow takes a timestamped backup before it edits and logs the change, so a bad edit never silently eats a year of thinking.\n\nThe long version is too big to load on every turn, so `LIFEOS/TOOLS/GenerateTelosSummary.ts` reads the source sections and writes a compressed summary of roughly sixty lines to `PRINCIPAL_TELOS.md`. That file header says generated, never hand-authored, and it carries a timestamp so staleness is detectable. Compression is structural: it keeps the causal chain from mission to goal to problem to strategy rather than just the first N characters.\n\nThe last step is the wiring. `CLAUDE.md` lists `PRINCIPAL_TELOS.md` as a top-level import, and `LIFEOS/DOCUMENTATION/Config/ConfigSystem.md` explains why it has to be top-level: the harness does not follow imports from inside an imported file. So every identity file gets its own line in the routing table or it never loads at all.',
  sources: [
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
    'LIFEOS/DOCUMENTATION/LifeOs/LifeOsThesis.md',
    'skills/Telos/SKILL.md',
    'LIFEOS/USER_TEMPLATES/README.md',
    'LIFEOS/TOOLS/GenerateTelosSummary.ts:L1-L40',
    'LIFEOS/DOCUMENTATION/Config/ConfigSystem.md',
  ],
  alternatives: [
    { name: 'Restate your goals in every prompt', tradeoff: 'Wins on freshness, because you say exactly what matters today. Costs you the same paragraph typed forever, and it decays: the version you type when tired is shorter than the version you type when sharp, so the system quietly gets less direction on your worst days.' },
    { name: 'A long free-form notes file the model may read', tradeoff: 'Wins on zero structure and zero tooling. Costs you loading: a file nobody imports is a file nobody reads, and a file too big to load every [[turn]] gets skipped exactly when the [[context window]] is tight. Nothing keeps a summary in step with the long version.' },
    { name: 'Keep goals in a project tracker and query them over [[MCP]]', tradeoff: 'Wins on being the tool your team already uses, with real permissions and history. Costs a network call and a live service on the [[current state]] path, and trackers hold tasks rather than mission, so the why never makes it across.' },
  ],
  why: 'LifeOS split the artifact in two because the two jobs pull in opposite directions. The thing you write wants to be long, argued and personal. The thing that loads on every session wants to be short enough that nobody is tempted to skip it. A generated derivative gets both, and generation is what keeps them honest, since a hand-maintained summary drifts from its source within weeks. The price is real: a generated file can go stale if the tool is not run, the compression drops nuance you might have wanted, and none of this works until you sit down and answer hard questions about your own life. LifeOS accepts that cost because the alternative is a system that gives everyone the same answer.',
  examples: [
    { field: 'distribution', text: 'A drinks wholesaler writes down that the goal for this year is cutting days-sales-outstanding from 45 to 30 without losing a top-20 customer, and that the standing problem is reps quoting discounts nobody re-approves. From then on, a request for a debtor report is not answered generically. The system knows the report has to make the overdue-and-large customers findable, and that a discount column is load-bearing rather than decoration.' },
    { field: 'hospital', text: 'A ward writes down that the mission is discharging patients before noon and that the bottleneck is pharmacy turnaround, not bed cleaning. A request to "improve the discharge board" then gets judged against that. A pretty board that hides the pharmacy clock fails the stated goal even though it looks better than what was there before.' },
  ],
  related: ['context', 'isa', 'algorithm', 'conduit', 'cortex'],
  without: 'Without this: every answer is written for a generic person, and you re-type your own goals into the prompt each time you want them considered.',
  failure: 'You notice it is broken when the system starts giving textbook advice that would suit anyone, or when it recommends something that contradicts a decision you made months ago and wrote down.',
};
