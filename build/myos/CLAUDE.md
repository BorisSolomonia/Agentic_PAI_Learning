<!--
═══ WHY THIS FILE EXISTS ════════════════════════════════════════
This is the note on the desk the worker reads before starting. It is the only
context that loads before the first word, so it must say where everything is
and nothing else — every line here is paid for on every turn, forever.
═══ HOW IT WORKS ═════════════════════════════════════════════════
The harness looks for CLAUDE.md in the folder it was launched in and that
folder's parents, and puts it in front of the model as a message. Lines
starting with @ pull in another file, one level deep only. Nothing announces a
file that failed to load; `/context` is the only honest report of what is
actually in there. In: this file plus its imports. Out: a model that knows
where to look instead of guessing.
═══ WHAT BREAKS WITHOUT IT ═══════════════════════════════════════
No error, ever. Just an assistant that quietly knows less: wrong paths, a
stranger's tone, and goals it has never read.
═══ MIRROR ═══════════════════════════════════════════════════════
LifeOS: CLAUDE.md   RS.GE: packages/core/src/agent-loop.ts — a terminal tool
loads a file from a folder; a service has no folder and no person at a
keyboard, so it assembles the same packet in code on every turn.
-->

# myos

Boris's personal Life OS. This file is a map, not a rulebook.

| Path | What is there |
|---|---|
| `USER/` | Boris's own content: identity, goals, voice, projects. Nothing outside it assumes his specifics. |
| `.claude/skills/<name>/SKILL.md` | Capabilities. The harness finds them here and nowhere else. |
| `.claude/hooks/` | Enforcement programs. Inert until registered in `.claude/settings.json`. |
| `.claude/settings.json` | The wiring: which hook runs at which event. |
| `SYSTEM_PROMPT.md` | The constitution. Not editable from inside a session — `guard.ts` refuses. |

@USER/IDENTITY.md
@USER/TELOS.md
