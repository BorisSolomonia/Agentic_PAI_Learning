import type { Section } from './schema';

/** Part 4 — Build one. What every agent needs, what only a LifeOS-class agent adds, the 12-file minimum. */
export const part4: Section = {
  id: 'p4',
  number: 4,
  title: 'Build one',
  subtitle: 'What any agent needs, what only a LifeOS-class agent adds, and the twelve files that get you from an empty folder to a system with teeth.',
  kind: 'build',
  body: `
## The one question this page answers

*If I build my own, what do I need in any case, and what is LifeOS-specific?*

The honest answer is a table with two columns. The left column is what every agent has, whether it is LifeOS, a customer-service bot, or a coding assistant. The right column is what you add when you want LifeOS's specific guarantees: it knows you, it enforces, it remembers, it will not lie about being done. You can stop after the left column and have a working assistant. You cannot stop after the left column and have *this*.

| Any agent needs | Only a LifeOS-class agent adds | Which box |
|---|---|---|
| A [[context]] file the [[harness]] loads before the first word | A split constitution: non-negotiables in the [[system prompt]], a routing table in [[CLAUDE.md]] | 1 Context |
| An identity or purpose statement | [[TELOS]] as the scoring standard every suggestion is measured against, with dates | 1 Context |
| At least one capability the model can reach for | [[skill]]s that self-trigger on plain sentences via a USE WHEN index | 2 Capability |
| A way to run real code | Deterministic [[hook]]s that can rewrite or block a [[tool call]] before it runs | 3 Control |
| A permission floor the model cannot talk past | The SYSTEM / USER [[zone]] boundary and an [[installer]] that never deletes | 3 Control |
| A log of what happened | A [[memory]] tier with a hot layer, retrieval, curation and a health check | 4 Memory |
| Some notion of "done" | An [[ISA]] with a [[falsifier]] per claim, and a Stop gate that refuses "done" without [[evidence]] | 5 Verification |
| — | A dashboard, a voice, a doctor, a status line | Output only |

Read the left column again. It is short. That is the encouraging part: a working agent is five things, and you built three of them in the first four chapters of the book.

## The twelve-file minimum

Below is the smallest tree that has one file per row of the table above, mapped to the chapter in \`CHAPTERS.md\` that builds it. This is the same \`build/myos\` you are already building; the mapping is what the old Engine Room could not show you.

\`\`\`
myos/
├─ CLAUDE.md                     routing table            Chapter 1, 4        box 1
├─ SYSTEM_PROMPT.md              constitution             Chapter 4           box 1
├─ USER/
│  ├─ IDENTITY.md                who you are              Chapter 2           box 1
│  ├─ TELOS.md                   what you want            Chapter 3           box 1
│  └─ RULES.md                   your standing rules      Chapter 5           box 1
├─ skills/
│  └─ first/SKILL.md             one capability           Chapter 7, 8        box 2
├─ hooks/
│  ├─ banner.ts                  SessionStart, prints     Chapter 14          box 3
│  ├─ inject.ts                  UserPromptSubmit, adds   Chapter 15          box 3
│  └─ guard.ts                   PreToolUse, exit 2       Chapter 16          box 3
├─ memory/
│  ├─ write.ts                   Stop, appends            Chapter 22          box 4
│  └─ recall.ts                  UserPromptSubmit, reads  Chapter 23          box 4
├─ ISA.md                        what done means          Chapter 27          box 5
└─ settings.json                 wires the hooks          Chapter 14          interface
\`\`\`

Twelve authored files plus the settings file. Every one of them has a bigger sibling in Part 3: \`CLAUDE.md\` grows into Context & configuration; \`hooks/guard.ts\` grows into PreToolGuard with four checks; \`memory/\` grows into Cortex. The shape does not change as it grows. That is the whole reason the small version is worth building first.

## Build order, and why

The chapter book's order is dependency order, not importance order, and Part 0 already told you the leverage ranking. Restated here because it decides what you build when you have only one hour:

1. **Context first (chapters 1–6).** Nothing else can be tested without a session that knows something.
2. **One skill (7–8).** Cheap, satisfying, and it proves the harness loads things on demand.
3. **Enforcement (14–16).** The first hook that blocks is the moment the system stops being a suggestion. If you build nothing else from Part 3, build \`guard.ts\`.
4. **Memory (22–23).** Only after enforcement, because memory without rules just remembers wrong things reliably.
5. **Verification (27–29).** Highest leverage, built last, because you cannot verify what does not exist.

## The five LifeOS ideas worth taking anywhere

If you build for someone else and can carry only five things from LifeOS, carry these. Each is a *shape*, not a file; each fits any harness and any domain.

| Idea | The shape | Where it came from |
|---|---|---|
| **Evidence before "done"** | Every claim names the check that would prove it false; nothing closes without that check's output | ISA + VerificationGate |
| **Hooks as guards, not advice** | The few things that must never happen are code with an exit code, not sentences in a prompt | PreToolGuard |
| **Zone boundary** | Sort every file by who owns it; updates overwrite one side and never touch the other | SystemUserBoundary |
| **Skill file format** | One markdown front page with USE WHEN phrases, optional workflows, optional real scripts | SkillSystem |
| **Append-only event log** | Every action is one JSONL line; nobody reads it on a good day | EventLogger |

Everything else in Part 3 is either personal (voice, tabs, TELOS), infrastructure (Pulse, Atlas, Ledger), or private (Arbol, Feed, Bunker). Useful, but not the part that transfers.

## What you do not need to understand to build this

You asked, at the very start, whether you needed to read TypeScript to build with AI. The honest answer for this page: you need to *read* the twelve files well enough to know which box each one is in and what it would do if it broke. You do not need to write them. You direct; the model writes; you run the probe. Every chapter in the book is built that way, and so is this app.
`,
  breakIt: [
    'Take your current `build/myos` and draw it as the twelve-file tree above. Mark each file that exists green and each that does not red. The red ones are your next chapters, in dependency order.',
    'Delete (move aside) `hooks/guard.ts` from the tree in your head and ask: which of the five guarantees is gone? Then do the same for `memory/recall.ts`. If you cannot name the guarantee, re-read the two-column table.',
    'Try to add a sixth "idea worth taking anywhere" from Part 3. Argue for it. Most candidates turn out to be personal or infrastructure, which is the lesson.',
  ],
  recall: [
    'Closed book: the left column of the table. Five rows, five boxes.',
    'The twelve files, grouped by box, from memory.',
    'The five ideas that transfer, and for each, one sentence on the shape.',
  ],
  transfer: [
    'Sketch the twelve-file tree for the 9T agent (Part 5 gives the answer). Which files keep their names, which get renamed (IDENTITY → COMPANY), which disappear?',
    'For BachmannLogi: which two of the five transferable ideas would you sell them first? Write the one-paragraph pitch for each.',
  ],
};
