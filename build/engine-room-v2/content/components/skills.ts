import type { Component } from '../schema';

export const component: Component = {
  id: 'skills',
  name: 'Skills',
  box: 'capability',
  status: 'Code shipped. This install carries 75 skill folders under `skills/`, each one a `SKILL.md` plus, usually, workflow files and small programs.',
  summary: 'A skill is a folder of instructions that switches itself on when you describe a task that matches it, so you never have to remember which one to ask for.',
  purpose: 'Domain know-how otherwise lives in a person\'s head and gets re-explained every session. A skill parks that know-how in a file and has it activate on the words you already use, so the procedure arrives with the request instead of after it.',
  who: 'lifeos',
  trigger: 'At session start [[Claude Code]] reads only the [[frontmatter]] of every `skills/*/SKILL.md`. When your [[prompt]] matches the `USE WHEN` clause in one of those one-line descriptions, the [[skill]] is invoked and its full body loads. You can also name one directly.',
  input: 'Your request in plain words, plus whatever the skill body then chooses to read: its own [[workflow]] files, reference documents, and a per-user customization folder if one exists.',
  output: 'Instructions loaded into the [[context window]] for this turn, a routing decision naming which workflow to follow, and often a [[deterministic]] command the model then runs.',
  files: [
    { path: 'skills/Research/SKILL.md', mode: 'read', note: 'a real skill: single-line description ending in USE WHEN, then a workflow routing table' },
    { path: 'skills/Research/Workflows/QuickResearch.md', mode: 'read', note: 'one workflow file, loaded only when the routing table picks it' },
    { path: 'skills/CreateSkill/SKILL.md', mode: 'read', note: 'the skill that creates and edits skills; hand-rolling skill files is forbidden' },
    { path: 'hooks/AlgorithmNudge.hook.ts', mode: 'exec', note: 'parses every USE WHEN phrase into an index and nudges when a prompt matches an unused skill' },
    { path: 'LIFEOS/MEMORY/STATE/skill-usewhen-index.json', mode: 'read+write', note: 'the cached phrase index; a stale one triggers a detached rebuild rather than a slow turn' },
  ],
  how: 'A skill is a directory. `SKILL.md` at the top holds [[frontmatter]] with a `name` and a single-line `description` that must contain the words `USE WHEN` followed by intent triggers. Only that frontmatter is loaded at session start, which is why the description has a character ceiling: `LIFEOS/DOCUMENTATION/Skills/SkillSystem.md` warns that descriptions past roughly 650 characters cause skills to be dropped from the session listing silently, making the skill invisible.\n\nThe body is a routing table, not a procedure. It maps a trigger phrase to a file under `Workflows/`, and only the matched workflow gets read. `skills/Research/SKILL.md` shows the shape: one description, then a table with a row per workflow. Deterministic work lives in `Tools/` as real programs rather than as prose the model re-derives.\n\nTwo rules carry most of the weight. The first is the authoring standard in the same doc: a skill states what a finished result looks like and what the constraints are, not a numbered choreography of how to think, because a step-list caps a capable model and rots as models improve. The second is the naming rule. A leading underscore on the directory name is the release boundary. `TitleCase` folders ship publicly and may contain nothing identity-bound; `_ALLCAPS` folders never leave the machine, and release tooling skips them by the pattern in `hooks/lib/containment-zones.ts`.',
  sources: [
    'LIFEOS/DOCUMENTATION/Skills/SkillSystem.md',
    'skills/CreateSkill/SKILL.md',
    'skills/Research/SKILL.md',
    'hooks/AlgorithmNudge.hook.ts:L1-L110',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    { name: 'A menu of named commands you invoke by hand', tradeoff: 'Wins total predictability, because nothing fires unless you ask. Costs recall: with dozens of them, you have to know the menu, and the capability you forgot is the capability you do not have.' },
    { name: 'One large system prompt holding every procedure', tradeoff: 'Wins guaranteed availability, since nothing has to be matched or loaded. Costs the [[context window]]: every token spent on a procedure you are not using is a token unavailable to the work, and the file grows until it is unmaintainable.' },
    { name: 'An [[MCP server]] per capability', tradeoff: 'Wins portability across harnesses and a typed contract. Costs a protocol layer to run and maintain, and every server\'s tool schemas sit in [[context]] whether or not the task needs them.' },
  ],
  why: 'LifeOS picked self-activating folders because the failure it fears most is a capability that exists and does not fire. Matching on intent phrases means the right procedure arrives when you describe the work, without you knowing the catalogue. The frontmatter-only load keeps the resting cost to one line per skill. The price is real and worth naming: routing is text matching against a description someone wrote, so a skill can miss when you phrase the request in words the author did not anticipate, and it can also fire when you did not want it. That is why the system keeps a separate index of every `USE WHEN` phrase and nudges rather than silently deciding.',
  examples: [
    { field: 'distribution', text: 'A wholesaler writes a skill for the monthly debtor review: pull the aged receivables by customer, flag anyone over sixty days, cross-check against open orders before anyone is put on stop. The `USE WHEN` line lists the words the sales manager actually says, like debtors, overdue, aged balance and credit stop. Nobody opens a manual; typing "run the debtor review for October" loads the procedure, and the deterministic part, the aging query, is a program in the skill folder rather than SQL retyped each month.' },
    { field: 'kitchen', text: 'A restaurant kitchen keeps a laminated card for each dish at the station where it is cooked, not in a binder in the office. The card is short and says what the finished plate looks like, and the detailed prep sheet hangs behind it for whoever needs it. The cook does not go looking for the card; it is already at the station the moment that ticket comes up.' },
  ],
  related: ['tools', 'agents', 'hooks', 'algorithm', 'boundary'],
  without: 'Without this: the harness still has a skill mechanism, but the shelf is empty, so every domain procedure gets re-explained from memory at the start of each session.',
  failure: 'A skill that should have fired stays silent and the model improvises the procedure from scratch, almost always because the `USE WHEN` clause does not contain the words the person actually typed.',
};
