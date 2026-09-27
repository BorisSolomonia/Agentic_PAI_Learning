---
name: greet
description: Greet Boris by name and by the project he is busiest with. USE WHEN the user says "greet me", "who am I", "say hello", "introduce me", or starts a session wanting to be recognised before work begins.
---

<!--
═══ WHY THIS FILE EXISTS ════════════════════════════════════════
A harness with no skills can only answer. This file gives the system one
thing it can *do* on request that it did not know how to do before: look up
who the person is and say hello like it has met him.
═══ HOW IT WORKS ═════════════════════════════════════════════════
Claude Code scans .claude/skills/*/SKILL.md when a session starts and keeps
only the front matter in context. When a sentence matches a USE WHEN phrase
in `description`, this whole file is loaded and the model follows the body.
In comes a greeting request; out goes a greeting built from USER/IDENTITY.md.
No code executes at any point — this is instructions, not a program.
═══ WHAT BREAKS WITHOUT IT ═══════════════════════════════════════
Nothing errors. The system simply has no capability of its own: every
greeting is generic, and box 2 of the five is empty.
═══ MIRROR ═══════════════════════════════════════════════════════
LifeOS: skills/*/SKILL.md   RS.GE: packages/interview — a capability as a
typed TypeScript package, because a markdown skill is cheap and untestable
while a product's capability must have tests.
-->

# Greet

Greet Boris as someone who knows him, not as a stranger.

## Workflow

1. Read `USER/IDENTITY.md` from the project root. Do not guess from memory.
2. Take his name, and pick the **busiest project**: the one with the most
   moving parts in the "Active projects" table, preferring `owned` posture
   over `client` when it is a close call.
3. Say hello in two sentences, maximum:
   - line one: his name, and one true detail about how he works;
   - line two: the busiest project by name, and its one-line description in
     your own words.
4. Stop there. Do not offer a task list, do not ask what he wants to do next.

## Rules

- If `USER/IDENTITY.md` is missing or unreadable, say so plainly and greet by
  nothing but the file path you failed to read. Never invent a name.
- Never quote the identity file verbatim; a greeting that reads like a
  database row is a failed greeting.
