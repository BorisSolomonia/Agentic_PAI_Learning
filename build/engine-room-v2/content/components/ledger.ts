import type { Component } from '../schema';

export const component: Component = {
  id: 'ledger',
  name: 'Ledger',
  box: 'memory',
  status: 'Partial, private infrastructure. The versioning scheme, the drift nag, the registry writer, the deploy recorder, and the dashboard page all ship. The tools that classify a change, roll every component version, and sync and tag the repositories live in an underscore-prefixed maintenance [[skill]] that is excluded from the public release, so the commands the documentation names will not resolve on a fresh install.',
  summary: 'The part of the system that decides how big a change was, writes down that it happened, and refuses to ship it until the checks are fresh.',
  purpose:
    'A system that edits itself needs an answer to one question: what changed, when, at what version, and verified how. Left to memory, that answer rots, and the person has to ask the machine whether it bumped its own version.',
  who: 'lifeos',
  trigger:
    'Three moments. A change lands and the classifier reads the difference since the last tag. A deployment lands and the deploy recorder is called by the gated deploy path. And on any UserPromptSubmit, hooks/VersionDrift.hook.ts checks whether unversioned change has piled up and injects a nag line if it has.',
  input:
    'The difference between the working tree and the last version tag, restricted to a fixed list of core paths. The current version files. For a deployment: the project, the target, the domain, the commit, and whether it succeeded.',
  output:
    'A version number rolled at two zoom levels, the whole system and the one subsystem touched. One [[markdown]] file per change in an append-only registry, plus a regenerated flat history. One appended line per deployment. A nag line in your [[context]] when drift is real.',
  files: [
    { path: 'LIFEOS/VERSION', mode: 'read+write', note: 'the single rolled-up number for the whole system' },
    { path: 'hooks/VersionDrift.hook.ts', mode: 'exec', note: 'the nag: ten changed core files, or any drift on a tag older than 48 hours' },
    { path: 'LIFEOS/TOOLS/CreateUpdate.ts', mode: 'exec', note: 'writes the one registry file per change, and enforces a real title' },
    { path: 'LIFEOS/TOOLS/LedgerDeployEvent.ts', mode: 'exec', note: 'appends the deploy event with commit and project version' },
    { path: 'LIFEOS/ALGORITHM/LATEST', mode: 'read', note: 'one of the component version lines that rolls alongside the umbrella' },
    { path: 'LIFEOS/PULSE/modules/ledger.ts', mode: 'exec', note: 'the read surface: versions, registry, deploys, drift, last integrity stamp' },
  ],
  how: `LIFEOS/DOCUMENTATION/Ledger/LedgerSystem.md gives the test for what belongs here: does it decide, record, or propagate a version, or record and gate a change. Everything else is somebody else\'s job, and the document is emphatic that Ledger is a record and a read surface, never an orchestrator. It adds no background process.

The scheme is three numbers, always: major, feature, patch. What matters is that the level chooses the ceremony. A patch applies itself with a visible notice. A feature needs a one-line confirmation at ship time. A major stops cold and requires a conversation with a human before any number moves. The classifier decides the level from the actual difference, so the ceremony is not a matter of how important the author feels the change is.

Two numbers move for one change: the subsystem\'s own line and the whole-system umbrella in LIFEOS/VERSION. Those are not duplicates. They are the same fact at two zoom levels. LIFEOS/TOOLS/CreateUpdate.ts then writes one file into the change registry under the memory tree, and the flat history is regenerated from those files rather than hand-edited. The teeth are in hooks/VersionDrift.hook.ts, whose own header says why it exists: versioning used to depend on the assistant remembering, until the principal had to ask whether the versions had been bumped properly and the answer was no. The [[hook]] is fully [[deterministic]], calls no [[model]], and stays silent when a bump is already in flight or the change set is small.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Ledger/LedgerSystem.md',
    'hooks/VersionDrift.hook.ts:L1-L40',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
    'LIFEOS/DOCUMENTATION/Pulse/PulseSystem.md',
  ],
  alternatives: [
    {
      name: 'Git history alone',
      tradeoff:
        'Already there, complete, and free. Answers what the bytes were but not what the change meant, so it cannot tell you which changes were structural, which were verified, or what version any given subsystem was at on a given day.',
    },
    {
      name: 'A hand-written changelog',
      tradeoff:
        'Wins readability, and a human decides what deserves an entry. Costs discipline you will not have: the entries stop when the week gets busy, and nothing in the system notices that they stopped.',
    },
    {
      name: 'Automatic versioning from commit messages',
      tradeoff:
        'Wins by needing no judgment at ship time, since the level is parsed from a prefix. Costs the human gate that structural changes need, because a breaking change is then one keystroke away from shipping unreviewed.',
    },
  ],
  why:
    'The reason this is a subsystem rather than a habit is that every part of it had already failed as a habit. The nag exists because a bump was missed, the enforced title exists because registry entries were meaningless, and the refusal to tag without a fresh integrity stamp exists because the check kept being skipped. Building the record as code buys a history nobody has to remember to write. The cost is ceremony on every change, an extra gate before shipping, and a fair amount of tooling that, in the public release, simply is not there, so the concepts arrive without the commands.',
  examples: [
    {
      field: 'distribution',
      text:
        'A price list is never edited in place. A change gets classified first: a corrected typo in a product name is one thing, a new discount band is another, and dropping a whole customer tier is a third that needs the commercial director in the room before anything moves. Every version of the list is kept with the date it took effect, so an invoice raised in March can still be re-derived exactly, and a deployment record notes which price version each depot actually received.',
    },
    {
      field: 'kitchen',
      text:
        'A restaurant kitchen dates and labels every prepared item, and logs recipe changes with who approved them. Swapping a garnish is a note. Changing an allergen is a conversation with the head chef before anything is served. Months later, when a customer complains, the question of what was actually in the dish that night has an answer that does not depend on anyone remembering.',
    },
  ],
  related: ['atlas', 'pulse', 'doctor', 'hooks', 'boundary'],
  without:
    'Without this: the system edits itself for weeks with no version moving and no record written, and the only way to find out what changed is to read the diff.',
  failure:
    'You notice when the version number has not moved in weeks of real work, or when a change you clearly remember making has no entry anywhere in the record.',
};
