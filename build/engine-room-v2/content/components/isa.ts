import type { Component } from '../schema';

export const component: Component = {
  id: 'isa',
  name: 'ISA',
  box: 'verification',
  status: 'Specification shipped. The format spec, the ISA skill with its six workflows, and the structural gate all ship in the public release. The ISA files themselves are written by you and the system as work happens.',
  summary: 'One document that says what finished looks like, written as statements that can each be proved wrong, so the same file is the plan, the test list and the status report.',
  purpose: 'Most work starts without a written, testable definition of finished, so done drifts and nobody can say where it went wrong. The [[ISA]] forces the definition onto the page before the build, where the gap between what you meant and what the system heard becomes visible.',
  who: 'lifeos',
  trigger: 'The [[Algorithm]] scaffolds or reads one at the start of substantial work. The ISA [[skill]] fires when a [[prompt]] matches its trigger words, such as "ISA", "ideal state", "articulating done" or "grill me". After that, every write to an ISA file fires `hooks/ISASync.hook.ts` and `hooks/CheckpointPerISC.hook.ts` on PostToolUse.',
  input: 'Your stated goal, captured word for word into [[frontmatter]] and never paraphrased, plus everything the run discovers as it proceeds: constraints, failed probes, corrections, things that turned out not to matter.',
  output: 'A [[markdown]] file with fixed sections and a machine-readable header. `progress: 3/8` is a count of closed claims, not an opinion. For anything with a lasting identity the file survives the run and becomes that thing\'s current state of record.',
  files: [
    { path: 'skills/ISA/SKILL.md', mode: 'read', note: 'the six workflows: scaffold, interview, check completeness, reconcile, seed, append' },
    { path: 'LIFEOS/TOOLS/ISAGate.ts', mode: 'exec', note: 'the deterministic structural gate; exits 2 on hard violations at close' },
    { path: 'hooks/ISASync.hook.ts', mode: 'exec', note: 'PostToolUse on Write, Edit and MultiEdit; mirrors ISA frontmatter to the work registry' },
    { path: 'hooks/CheckpointPerISC.hook.ts', mode: 'exec', note: 'PostToolUse on the same tools; commits each claim transition' },
    { path: 'LIFEOS/MEMORY/STATE/work.json', mode: 'write', note: 'the registry the dashboard reads; written by the sync hook, never by hand' },
    { path: 'LIFEOS/MEMORY/WORK', mode: 'write', note: 'where a one-shot task ISA lives, one directory per work slug' },
  ],
  how: 'The unit is the [[ISC]], an Ideal State Criterion: one atomic statement about what done means, small enough that a single yes-or-no [[probe]] settles it. The standard comes from David Deutsch: a good explanation is hard to vary, meaning every part is load-bearing. An ISC set has that property when removing or weakening any claim changes what done means. If a claim can be deleted and nobody notices, it was decoration.\n\nThree rules make it operational, and they run through the whole system. Every [[claim]] names its [[falsifier]], because a claim with no nameable probe is a wish. Universal claims beat example claims, because "one test email arrived" passes while the mail system is broken and "mail flows at the baseline rate over the measured window" does not. And [[evidence]] is part of the deliverable, so a closed claim carries the commit, the test name or the probe reference that closed it.\n\nThe file has a fixed section order, and the sections carry the standing questions: what is broken now, what does success feel like, what are we deliberately not building, what must this never turn into, and what would prove each claim. One section is unusual and worth knowing. `## Not yet specified` holds fog: things that are in scope but still too dim to state as claims. The graduation test is whether you can state the question precisely, not answer it. Speculative criteria invented to fill a gap look like articulation and steer like noise, so the ISA holds the unknown honestly instead. Fog has to be empty at close.\n\nThe teeth are split deliberately. `LIFEOS/TOOLS/ISAGate.ts` runs inside the [[Stop gate]] chain and hard-blocks a close on three structural facts a throwaway entry cannot fake: unresolved fog, a progress field not in M-over-N form, and a missing trace back to the stated goal. Anything a count could game, such as requiring a minimum number of anti-claims, stays advisory and is only surfaced, because blocking on a count just manufactures the count.',
  sources: [
    'LIFEOS/DOCUMENTATION/ISA/ISASystem.md',
    'LIFEOS/DOCUMENTATION/ISA/ISAFormat.md:L93-L150',
    'skills/ISA/SKILL.md:L1-L60',
    'LIFEOS/TOOLS/ISAGate.ts:L1-L30',
    'LIFEOS/ALGORITHM/v8.20.2.md',
  ],
  alternatives: [
    { name: 'A spec document plus a separate test suite', tradeoff: 'Wins on familiarity and on letting specialists own each artifact. Costs synchronisation: four artifacts that start aligned drift the moment they are separated, the spec rots, and the tests end up testing what was easy to test rather than what was promised.' },
    { name: 'Tickets in a tracker, one per piece of work', tradeoff: 'Wins on assignment, notifications and a team-wide view of who is doing what. Costs the shape of done, because a ticket holds a task rather than a criterion, and closing it is a human clicking a button rather than a [[probe]] passing.' },
    { name: 'Acceptance criteria written as prose in the request', tradeoff: 'Wins on speed, since it costs one extra paragraph. Costs falsifiability, because prose criteria can be softened mid-run without anyone noticing, and there is nowhere for what the work taught you to be written down.' },
  ],
  why: 'The ISA collapses spec, test suite, acceptance gate and status into one file, so there is nothing to keep in sync. That is the whole wager: articulating the ideal state is most of the work, not documentation of the work. The choice costs real effort up front, on tasks where you would rather just start, and it demands a discipline most people find unnatural, which is writing down what would prove you wrong. It also has a failure mode the format tries to prevent: forcing false precision on parts of the work that are genuinely unknown, which is what the fog section exists to absorb. LifeOS accepts the cost because you cannot climb a hill you have not defined, and because a failed probe then asks a useful question. Is the build wrong, or was the claim wrong? Either answer improves something.',
  examples: [
    { field: 'distribution', text: 'Before rebuilding the van loading list, the wholesaler writes it as claims: every order due today appears on exactly one van manifest, the manifest total in cases equals the sum of its lines, a driver on a phone can read the stop sequence without zooming, and an order cancelled after 6am disappears from the manifest before the van leaves. The anti-claim is the one that saves the project. This must never let the same pallet be assigned to two vans, and that is checkable with one query.' },
    { field: 'newsroom', text: 'An editor writes the finished state of an investigation before the reporting starts: every figure traces to a named document, two independent sources back the central allegation, the subject was given a right of reply on the record, and no sentence asserts motive without a quote. Each is a yes-or-no check somebody other than the reporter can run. "It reads well" is not on the list, because nothing could prove it false at 11pm on deadline.' },
  ],
  related: ['algorithm', 'telos', 'bunker', 'cortex', 'observability'],
  without: 'Without this: the definition of done lives in someone\'s head, changes quietly as the work gets hard, and cannot be checked by anyone else.',
  failure: 'You notice it is broken when a task is declared complete while the file still lists open questions, or when the claims are so vague that any output would pass them.',
};
