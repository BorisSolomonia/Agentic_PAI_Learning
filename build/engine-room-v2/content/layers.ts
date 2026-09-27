import type { Section } from './schema';

/** Part 0 — the three layers and the five boxes. The one hour of upfront theory. */
export const part0: Section = {
  id: 'p0',
  number: 0,
  title: 'The three layers',
  subtitle: 'What a model is, what Claude Code adds, what LifeOS adds on top — and the colour code used on every page after this one.',
  kind: 'orient',
  body: `
## Start here: what a model actually is

A [[model]] is a function. Text goes in, text comes out. That is the whole thing. It has:

- **no memory** — when the reply is finished, it has forgotten the conversation
- **no filesystem** — it cannot open, read or save a file
- **no hands** — it cannot run a command, click a button or send a message
- **no clock** — it does not know what day it is unless someone tells it

Everything that *looks* like memory, action or awareness in an AI assistant is done by a program **around** the model. That program hands the model a pile of text, reads the text it produces, and acts on it. If you remember one sentence from this whole app, make it this one: **the model never does anything; the harness does everything, and the model only decides.**

> **In a warehouse:** the model is the dispatcher sitting in a windowless office with a radio. The dispatcher decides what to do next but cannot see the shelves, cannot lift a box, and forgets yesterday's shifts unless someone leaves a note on the desk. The warehouse — forklifts, scanners, the note on the desk — is the harness.

## The three layers

| Layer | What it is | It **can** | It **cannot** |
|---|---|---|---|
| 🟨 **Model** | Claude, the language model | reason, plan, write text, decide which tool to ask for | remember, read a file, run anything, act without being asked |
| 🟦 **Claude Code** | Anthropic's terminal program that runs the model in a loop | read and write files, run commands, call tools, load context files, fire [[hook]]s at fixed moments, ask you for permission | know who you are, know what you want, keep any rule you didn't write down, verify its own claims |
| 🟩 **LifeOS** | Daniel Miessler's set of files and scripts placed *inside* Claude Code's folders | tell the model who you are and what you want, add capabilities, block dangerous actions, remember across sessions, refuse to call work "done" without evidence | run without Claude Code — it is a passenger, not a vehicle |

The important shape: **LifeOS is not a program you run.** It is a set of markdown files, TypeScript scripts and one JSON settings file that Claude Code *finds* in its own folders and *uses* according to its own rules. Delete every LifeOS file and Claude Code still works; it just knows nothing about you and stops you from nothing.

> **In a kitchen:** the model is the head chef's brain. Claude Code is the kitchen — stoves, knives, the pass, the rule that every plate goes through the pass. LifeOS is the restaurant's *own* recipe book, allergy list, and the sign on the wall saying "no dish leaves without the ticket checked". The kitchen would work without the book; it just wouldn't be *this* restaurant.

## The colour code

Every step on every page carries one of four tags. When a page asks "is this a LifeOS step or not?", this is the answer:

- 🟦 **Claude Code** — happens with or without LifeOS. Remove every LifeOS file and this still runs.
- 🟩 **LifeOS** — a LifeOS file or script did this. Remove LifeOS and it vanishes. On Parts 1 and 2 there is a switch, **Strip LifeOS**, that greys these out so you can see the bare path underneath.
- 🟨 **Model** — the model's own reasoning. Nobody wrote code for this; it is what the model decided.
- ⬜ **You** — a human did something.

## The five boxes: how any agent loops

Strip the names off and every AI agent — LifeOS, a customer-service bot, a coding assistant — is the same loop. Five boxes. Learn them once and you can place any product's features in ninety seconds.

\`\`\`
  you type
     │
     ▼
 ┌───────────────────┐   1 · CONTEXT  — assembled before the model sees a single word
 │ context assembled │ ◄── context files (CLAUDE.md, @-imports)
 └────────┬──────────┘ ◄── memory recalled from earlier sessions
          │            ◄── hooks that inject text at prompt time
          ▼
 ┌───────────────────┐   2 · CAPABILITY — what it can reach for
 │  model decides    │ ◄── skills (instructions loaded on demand)
 └────────┬──────────┘ ◄── tools and MCP servers (things that actually run)
          │
          ▼
 ┌───────────────────┐   3 · CONTROL — fires whether or not the model wanted it
 │  tool executes    │ ◄── hooks (can BLOCK by exiting with code 2)
 └────────┬──────────┘
          │
          ▼
 ┌───────────────────┐   5 · VERIFICATION — is it actually done?
 │  observe result   │ ──► evidence gates, tests, probes
 └────────┬──────────┘
          ├── not done ──► back to the top
          ▼  turn ends
 ┌───────────────────┐   4 · MEMORY — what survives to next time
 │   write memory    │ ──► files that box 1 will read tomorrow
 └───────────────────┘
\`\`\`

**Memory is a slow wire back into context.** Writing a memory is pointless unless something reads it at the top of the next loop. Half of all broken memory systems are broken on the *read* side.

**Control is the only box with teeth.** Boxes 1, 2 and 4 are *suggestions* the model can weigh and lose. A hook is code; it runs whether the model likes it or not.

**Verification decides when the loop stops.** Without it, the loop stops when the model *feels* finished — the single most expensive failure in this whole field.

**Capability is where everyone starts and what matters least on its own.** A brilliant skill fed bad context produces confident nonsense.

## The design space, box by box

You are not learning *the* way to build an agent. You are learning one defensible route through a space of choices. Here is the space:

| Box | Ways people build it | What LifeOS chose | What that choice costs |
|---|---|---|---|
| 1 Context | (a) always-loaded files · (b) loaded on demand · (c) retrieved by search | (a) for identity, (b) for docs, (c) for memory | (a) costs tokens on every session forever, so it must stay small |
| 2 Capability | (a) plain prompt · (b) markdown skill · (c) skill + real script · (d) MCP server · (e) subagent | (b) and (c) heavily, (d) sparingly, (e) for parallel work | markdown skills are trivial to write and impossible to unit-test |
| 3 Control | (a) ask nicely · (b) system prompt · (c) hooks that inject · (d) hooks that block | all four, layered by how non-negotiable the rule is | 68 hooks run on every event; a slow hook makes every turn slow |
| 4 Memory | (a) append-only log · (b) curated markdown · (c) vector database · (d) typed graph | (b) hot files + (d) a knowledge archive | curation costs a review pass at the end of sessions |
| 5 Verification | (a) the model says "done" · (b) deterministic check · (c) second model reviews · (d) evidence required per claim | (d), enforced by (b) | slowest option, and the only honest one |

## Where LifeOS's 25 parts sit

Part 3 of this app walks through all 25 components. Here is the map you'll use to place them:

| Box | LifeOS components |
|---|---|
| 1 Context | TELOS · Context & configuration · Cortex (the read side) · Conduit · Synapse |
| 2 Capability | Skills · Tools & integrations · Subagents · Arbol · Hermes |
| 3 Control | Hooks · Security · System/User boundary |
| 4 Memory | Cortex (the write side) · Learning & memory review · Atlas · Ledger |
| 5 Verification | The Algorithm · ISA · Bunker · Doctor |
| none (output only) | Pulse · Observability · Voice · Spinner & tooltips |

Notice that Cortex sits in two boxes. That is not sloppiness; it is the whole design. A memory system *is* a write box wired to a read box, and any product that only has one of the two is broken.

## Why this architecture and not another

Two other shapes were possible, and both exist in the wild:

- **A wrapper app.** Build your own program that calls the model's API directly, with your own loop, your own tools, your own UI. Full control, and you rebuild everything Claude Code already ships: permissions, file tools, the terminal, the transcript. LifeOS rejected this because Anthropic improves Claude Code weekly and a wrapper would fall behind every week.
- **A single big prompt.** Put identity, rules, memory and instructions into one enormous system prompt. Simple, and it fails at exactly the three things LifeOS cares about most: nothing is enforced (it's all suggestion), nothing survives an update (one file, overwritten), and nothing is verifiable (the prompt can't check its own claims).

LifeOS picked the third shape: **live inside the harness's own extension points and add teeth where the harness has none.** The cost is that it is a passenger — every LifeOS feature is bounded by what Claude Code allows a hook or a context file to do. The benefit is that it rides every harness upgrade for free.
`,
  breakIt: [
    'In a scratch folder with no `CLAUDE.md`, run `claude -p "who am I?"`. Then run the same inside `~/.claude`. Write down, before you run either, which will know you and why.',
    'Predict: if every LifeOS hook were deleted but the context files kept, what would still work? Then check Part 2 with the Strip-LifeOS switch off and count what survives.',
    'Which box, removed, makes the other four useless? Decide, then argue with your answer using the kitchen example.',
  ],
  recall: [
    'Close this page. Redraw the five-box loop on paper with the arrows.',
    'Say the three layers and one thing each *cannot* do.',
    'What is the difference between a skill and a hook? If your answer is not "a skill is offered, a hook just happens", read the Control row again.',
  ],
  transfer: [
    'Take Optimo, your Wolt sync middleware. Write its five boxes: what it knows at start-up, what it can do, what fires on a schedule regardless, what it persists, how it decides a sync succeeded. This map is not about AI.',
    'Take a delivery van driver at 9T. Same five boxes: the route sheet is context, the van is capability, the speed limiter is control, the signed delivery note is memory, the customer\'s signature is verification.',
  ],
};
