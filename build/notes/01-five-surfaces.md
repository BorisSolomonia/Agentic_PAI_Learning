# Step 1 — The five extension points

**Goal of this file:** prove to myself that all 23 LifeOS "components" are built from five
things Claude Code provides, by tracing at least one component per surface back to the folder
its code lives in.

**Status:** 1 of 5 sections done (Hooks, written with Claude as the worked example).
Four remaining: context files, skills, subagents, MCP.

---

## Surface 2 of 5 — HOOKS  ✅ done

### What the surface is

A hook is a program Claude Code runs **automatically at a fixed moment** in a session:
when it starts, before a tool runs, after I send a prompt, when the turn ends. Two properties
matter. It fires whether or not the model decides it should, and it can **block** an action by
exiting with code 2. That is the difference between a rule the model tries to follow and a rule
it cannot break.

Where they live on my machine: `~/.claude/hooks/*.hook.ts` (68 files), wired by the `hooks`
block in `~/.claude/settings.json`.

### LifeOS component built on it: **Cortex**, the memory system

`CoreComponents.md §10` describes Cortex as *"the memory system… hooks and an autonomic
reviewer consolidate what each session taught."* It names hooks itself, so this is the
component to trace.

### What I found, in order

**1. Six files carry the name.** `ls hooks/ | grep -i memory` returns `LoadMemory`,
`MemoryDeltaSurface`, `MemoryHealthGate`, `MemoryReviewFire`, `MemoryTurnStart`,
`RelationshipMemory`. So the memory system is not one program. It is six small ones.

**2. Only four are wired, at three different moments.** Reading the `hooks` block of
`settings.json`:

| Event | Hook | What it's for |
|---|---|---|
| `UserPromptSubmit` | `MemoryTurnStart` | fires as I press enter, injects what's known about me |
| `Stop` | `MemoryReviewFire` | fires when the turn ends, decides what was worth learning |
| `Stop` | `MemoryHealthGate` | checks the memory system is healthy |
| `SessionEnd` | `MemoryHealthGate` | same check when the session closes |

So memory is a **write at the end, read at the beginning** loop. That shape is the whole design.

**3. The surprise, and the reason tracing beats reading.** `MemoryDeltaSurface.hook.ts` is the
file that produces the `🧠 MEMORY:` line I see on every response. It is **not in settings.json
at all**. Grepping for who mentions it:

```
hooks/MemoryTurnStart.hook.ts:32:import { run as deltaSurface } from "./MemoryDeltaSurface.hook";
```

It is a **library, not a hook**, despite the `.hook.ts` name. `MemoryTurnStart` is the one
Claude Code calls, and it calls three others in sequence. I would never have learned this by
reading documentation, because no document says it.

**4. Where the data ends up.** The hooks read and write `~/.claude/LIFEOS/MEMORY/`
(`KNOWLEDGE`, `LEARNING`, `OBSERVABILITY`, `STATE`, `WORK`, …) plus two hot files,
`USER/PRINCIPAL/PRINCIPAL_MEMORY.md` (8,588 bytes, last written 22:53 tonight) and
`USER/DIGITAL_ASSISTANT/DA_MEMORY.md`.

### The chain, end to end

```
I press enter
   └─ UserPromptSubmit fires
        └─ MemoryTurnStart.hook.ts            (the only wired entry point)
             ├─ reads  USER/PRINCIPAL/PRINCIPAL_MEMORY.md   → injects who I am
             └─ calls  MemoryDeltaSurface.run()             → prints the 🧠 MEMORY line
I get my answer, turn ends
   └─ Stop fires
        └─ MemoryReviewFire.hook.ts
             └─ writes new facts into LIFEOS/MEMORY/ and the hot files
```

### What this told me

Cortex has no magic in it. It is **six ~200-line files plus a folder of markdown**, wired to
three lifecycle events. I could rebuild a working version of this in a day. The intelligence is
not in the code, it is in the *decisions*: which moments to hook, what counts as durable enough
to write down, and how much to inject without eating the context budget.

### Copyable pattern

**One wired entry point per event, calling small single-purpose modules.** Not five hooks racing
on the same event. That keeps ordering explicit and makes each piece testable on its own.

---

## Surface 1 of 5 — CONTEXT FILES  ⬜ to do

Candidate component: **TELOS**. Start at `CoreComponents.md §5`.
Where to look: `~/.claude/CLAUDE.md` and `~/.claude/LIFEOS/USER/**/*.md` (17 files).
Question to answer: how does a plain markdown file get into the model's head, and what limits it?

## Surface 3 of 5 — SKILLS  ⬜ to do

Candidate component: **The Skill System** (`§14`) or **Atlas** (`§12`).
Where to look: `~/.claude/skills/*/SKILL.md` (70 dirs).
Question: what makes a skill load itself without being named?

## Surface 4 of 5 — SUBAGENTS  ⬜ to do

Candidate component: the second-look pass in the Algorithm.
Where to look: `~/.claude/agents/*.md` (18 files), especially `Max.md` and `Forge.md`.
Question: what does a subagent get that the main conversation doesn't, and what does it lose?

## Surface 5 of 5 — MCP  ⬜ to do

Candidate component: the Linear integration.
Where to look: `mcpServers` in `settings.json` (1 server).
Question: why is this a separate mechanism instead of just a skill that shells out?

---

## Components that fit NO surface — the interesting residue

Note these as I go. **Pulse** already looks like one: it is an ordinary web server on port 31337
that hooks talk to over HTTP, not an extension point at all. If several components land here,
that is a finding worth its own paragraph, because it means LifeOS is partly a normal
application wearing a plugin costume.
