# Engine Room — gap analysis and rebuild spec

**Status:** built as `build/engine-room-v2` on 2026-09-11 (launcher repointed; v1 preserved). · **Date:** 2026-09-11 · **App inspected:** `build/engine-room` (built with the OpenAI "sites" starter,
vinext + React + shadcn; content in `app/model.ts`, `app/lifecycle.ts`, `app/catalog.json`; pinned to
public LifeOS commit `5e2f2e8`, 2026-09-03) · **Your spec:** your message of 2026-09-11.

**Verdict in one line:** the app is an honest, well-verified *parts catalog with a lifecycle
overview*. It answers **what is there**. It does not answer **why, how exactly, what else could
have been done, or how to build my own** — which is the whole of what you asked for. Of your
fourteen requirements it meets two fully, six partially, six not at all.

---

## 1. What the app actually contains (so the gaps are measured, not felt)

| Surface | What's in it | Depth |
|---|---|---|
| **Prompt A–Z** | 14 stages A–N; each has lane (USER / HARNESS / LIFEOS HOOKS / MODEL / TOOLS / RETURN), certainty (always / conditional / choice / background), *why*, *what happens*, *what it leaves*, source links | 5 fields per stage |
| **Engine** | 25 parts in 5 groups on a physical-engine drawing; each part: analogy, kind, status, summary, in / does / out, one example, one failure, related parts, 3 detail bullets, source links | ~12 fields per part, 3 bullets of depth |
| **Try examples** | 5 scenarios (fix checkout, remember a lesson, capture an article, trace dependencies, simple question), 5–9 steps each, each step: part, input, doing, output, optional branch | prose, no payloads |
| **Parts catalog** | same 25 parts as cards + the 56 shipped skills | inventory |
| **Files & wiring** | 1,949 file links from the public clone + 11 hook-event groups | inventory |
| **Your starter** | the four `build/myos` files and what their existence does *not* prove | 1 screen |
| **Terminology** | ~30 terms, each with a one-line meaning and a workshop analogy | separate tab |
| **Field examples** | 5 whole-flow analogies (software repair, kitchen, newsroom, warehouse, trip) | whole flow only |

Two things it does well and the rebuild must keep: it is **scrupulously honest** about what is
private / blueprint / optional, and every claim links to a pinned source file.

---

## 2. Your requirements, scored

| # | You asked for | Status | Where the gap is |
|---|---|---|---|
| 1 | **Distinguish LifeOS vs not-LifeOS in the flow** | ◐ partial | Lanes exist (HARNESS vs LIFEOS HOOKS vs MODEL) but there is no explicit per-step tag, no counterfactual ("without LifeOS this step would be…"), and no way to strip LifeOS away and see the bare Claude Code path beside it. The reader has to infer it from a lane label. |
| 2 | **Session start shown in detail: what loads, which files, how, why** | ✗ missing | The entire startup is **one card** (stage A: "The engine is already primed"). The real startup is eight distinct moves touching ~12 named files (§4 below). None are shown. |
| 3 | **Then the prompt: what fires, which files, how, why** | ◐ partial | Stages B–E name the hooks but never show the mechanism: the JSON that arrives on stdin, the text that leaves on stdout, how stdout becomes context. "A UserPromptSubmit event payload" is a phrase, not a picture. |
| 4 | **Every small step: purpose · how implemented · LifeOS or not · how triggered · input · output · alternatives · real-life example** | ◐ 4 of 8 | Each stage has why / happens / leaves / sources. **Missing on every step:** alternatives, a per-step real-life example, an explicit LifeOS-or-not field, and the trigger mechanism (event + matcher + exit-code semantics). |
| 5 | **Why the parts are connected this way and not another** | ✗ missing | No part and no step anywhere says "the alternative was X; LifeOS chose Y because Z". The design space is never shown. |
| 6 | **Terminology explained so a teen understands** | ◐ partial | 30 terms in a separate tab. Inline, stage H still says "PreToolUse", "matcher", "exit code 2", "additionalContext" with no definition where the reader meets them. Missing terms the app itself uses: matcher, stdin/stdout, async hook, additionalContext, system-reminder, `@`-import, symlink, JSONL, frontmatter, probe/falsifier, ISC. |
| 7 | **Real-life examples from different fields, per feature** | ◐ partial | Five analogies exist for the *whole* flow, and the engine metaphor is one fixed lens. Nothing per part or per step; no second field for any single feature. |
| 8 | **Need of each part, its operation, purpose, why it solves it** | ◐ partial | summary / in / does / out / failure cover need and operation. "Why *this* solves it" and "what it costs" are absent; 3 detail bullets per part is thin for "very detailed". |
| 9 | **Visual demonstration of files being activated** | ✗ missing | "Files & wiring" is a searchable list of 1,949 links — an inventory, not a demonstration. Nothing lights up as a step touches it; read vs write is not shown. |
| 10 | **A page on how to build similar projects** | ✗ missing | Absent. "Your starter" describes four files and stops. |
| 11 | **What is needed in any case vs only for LifeOS** | ✗ missing | Absent. |
| 12 | **Where the LifeOS agent and a distribution-org agent overlap and differ** | ✗ missing | Absent. |
| 13 | **If LifeOS is too large for the distribution org, discuss alternatives** | ✗ missing | Absent. No alternative harness, framework, or approach is named anywhere. |
| 14 | **Visual + text teaching, detailed enough for a rookie** | ◐ partial | Visual: one static engine SVG and a step rail. Text: reference-grade, not teaching-grade — there is no path through the seven tabs, no "start here", no question, no checkpoint. It is a manual, not a lesson. |

**Three further defects you didn't name but will hit:**

- **It is built from the public clone, not your machine.** Correct for privacy, but it means it
  cannot show what actually happens when *you* type `lifeos`: your USER symlink into
  `~/.config/LIFEOS`, your nine-line statusline wrapper, your `OPERATIONAL_RULES.md`, your six
  `@`-imports. A teaching app about *your* system has to be generated from *your* install, with
  contents redacted and only names, sizes and wiring kept.
- **The model itself is never explained.** Stages F, G and L say "the model interprets / chooses /
  repeats", but nowhere does the app say what a model *is* and *is not*: text in, text out, no
  memory, no filesystem, cannot act. That one paragraph is the foundation; without it every hook
  and file looks like magic.
- **The engine metaphor is load-bearing everywhere, and it strains.** TELOS as "steering wheel"
  and Ledger as "service record" are fine; "fuel reservoir" for memory and "cylinders" for skills
  mislead more than they help. One lens for 25 parts was always going to crack.

---

## 3. What the rebuilt app is

**Purpose sentence:** *An app that teaches how a LifeOS-class agent works — step by step, file by
file, with the LifeOS layer separable from the harness underneath — well enough that you can build
one for a distribution company, or decide not to.*

**Shape: a guided path, not seven tabs.** Six parts, in order, with the same five-section rhythm
inside every step: **Orient → Watch it run → Break it → Recall → Transfer** (your v5.0 teaching
shape, carried into the app).

| Part | What it teaches | Pages |
|---|---|---|
| **0. The three layers** | Model · harness (Claude Code) · LifeOS. What each can and cannot do. The five-box agent loop. The colour code used everywhere after. | 2 |
| **1. Session start** | The eight moves from typing `lifeos` to the first prompt box, every file touched, in order, with why | 8 |
| **2. One prompt, end to end** | From Enter to the answer: every hook, every payload, every fork, with the **Strip LifeOS** toggle | 14 |
| **3. The parts** | The 25 components, each with the full 9-field schema, three-field examples, and the design space | 25 |
| **4. Build one** | What every agent needs vs what only LifeOS needs; the minimum viable harness in 12 files; where to add each LifeOS idea and when not to | 6 |
| **5. The distribution agent** | 9T's agent: users, tasks, data; the overlap/difference map; four alternative architectures scored; a recommendation | 5 |

### 3.1 The per-step schema — same nine fields on every one of the ~50 steps

| Field | What it must contain |
|---|---|
| **Purpose** | The problem this step exists to solve, one sentence |
| **Who does it** | 🟦 **Claude Code** (happens with or without LifeOS) · 🟩 **LifeOS** (a LifeOS file or hook; remove LifeOS and it vanishes) · 🟨 **Model** (the LLM's own reasoning) · ⬜ **You** |
| **Trigger** | The exact mechanism: event name, matcher, sync or async, what exit code 0 / 2 means here |
| **Input → Output** | The real shape: a redacted sample of the JSON on stdin and the text on stdout, or the file read and the file written |
| **Files touched** | Named, with **read** / **write** direction, lit up on the file tree beside the step |
| **How it's implemented** | The mechanism in plain words, then the source path and line range |
| **Alternatives** | The 2–4 other ways this could be done, and what LifeOS's choice costs |
| **Why this way** | The reason the alternative lost, in one paragraph |
| **In another field** | The same move in **two** unrelated fields: one always from distribution (warehouse, route, debtor call, stock count); one from elsewhere (kitchen, hospital, airport, newsroom) |

Every term on first use is underlined and defined inline on hover and in a side panel; the glossary
grows to ~60 terms and is never the only place a term is explained.

### 3.2 The Strip-LifeOS toggle (requirement 1, done properly)

One switch at the top of Parts 1 and 2. **On:** the full path. **Off:** every 🟩 step greys out
and collapses, and the remaining 🟦 + 🟨 path is what plain `claude` does. Under each greyed step a
one-liner: *"Without this: the model would have to remember X on its own"* / *"Without this: no
rule stops the write"*. That is the single most instructive view in the whole app and it is the
one the current build cannot produce.

### 3.3 Session start — the eight moves (requirement 2), from your real install

Verified against your `.bashrc`, `LIFEOS/TOOLS/lifeos.ts`, `settings.json`, and the pinned
`hooks/README.md` fire order.

| # | Move | Who | Files touched |
|---|---|---|---|
| S1 | You type `lifeos`; bash expands the alias | ⬜ 🟩 | `~/.bashrc` line 132 |
| S2 | `lifeos.ts` picks the MCP profile, prints the banner, spawns `claude --append-system-prompt-file LIFEOS_SYSTEM_PROMPT.md` | 🟩 | `LIFEOS/TOOLS/lifeos.ts`, `.mcp.json`, `LIFEOS_SYSTEM_PROMPT.md` (read) |
| S3 | Claude Code starts and reads its configuration: model pin, hooks block, statusline command, permissions | 🟦 | `settings.json` |
| S4 | Claude Code reads `CLAUDE.md` and resolves the six `@`-imports | 🟦 mechanism, 🟩 content | `CLAUDE.md`, `ARCHITECTURE_SUMMARY.md`, `PRINCIPAL_TELOS.md`, `PRINCIPAL_IDENTITY.md`, `DA_IDENTITY.md`, `PROJECTS.md`, `OPERATIONAL_RULES.md` |
| S5 | `SessionStart` fires; five hooks run in order: HookHealer → KittyEnvPersist → **LoadContext** (reads MEMORY/WORK, STATE/progress, advisory findings; writes a `<system-reminder>` to stdout) → FreshnessCache (async) → SettingsBackport + Merge (async) | 🟩 | `hooks/*.hook.ts`, `MEMORY/WORK/*`, `MEMORY/STATE/*` |
| S6 | Claude Code assembles the context: its own base prompt + the appended system prompt + `CLAUDE.md` + imports + every hook's stdout | 🟦 | in memory only |
| S7 | The statusline command runs for the first time: your USER-zone wrapper calls the shipped script and filters 23 lines to 9 | 🟩 | `USER/CUSTOMIZATIONS/statusline.sh` → `LIFEOS/LIFEOS_StatusLine.sh`, `LIFEOS_STATE.json` |
| S8 | The prompt box appears. Nothing has been sent to a model yet. | 🟦 | — |

The teaching point of S8 is the one the current app buries: **the model has not been involved at
all**. Everything so far is files being read by a program. That reframes the whole system for a
rookie.

### 3.4 The prompt path (requirement 3) — 14 stages kept, each expanded

The current A–N skeleton is correct and survives. Each stage gains the nine fields, and three
stages split because they hide too much: **C** (the nine UserPromptSubmit hooks become nine
visible rows with async marked), **H** (PreToolUse becomes: matcher check → ContextReduction rewrite
→ PreToolGuard decision → exit-code semantics), **M** (the eight Stop hooks become eight rows, with
StopGates as the one that can bounce the answer).

### 3.5 Part 4 — Build one (requirements 10 and 11)

A two-column page: **needed by any agent** vs **needed only if you want LifeOS's guarantees**.

| Any agent needs | Only a LifeOS-class agent adds |
|---|---|
| a context file the harness loads | a split constitution (system prompt vs routing table) |
| an identity / purpose file | TELOS as the scoring standard for every suggestion |
| at least one skill | skills that self-trigger on plain sentences |
| a way to run real code | deterministic hooks that can block |
| a log | ISA + evidence gates that refuse "done" without proof |
| — | a memory tier with curation and a health check |
| — | the SYSTEM / USER zone boundary and an installer |
| — | a dashboard, voice, doctor |

Then the **minimum viable harness in 12 files**, each mapped to the LifeOS part it grows into,
which is exactly the `build/myos` path in `CHAPTERS.md` — the app and the book point at each
other.

### 3.6 Part 5 — The distribution agent (requirements 12 and 13)

⚠️ **Assumption:** "my distribution organization" = **9T**, the Georgian trading company behind
9T ERP (sellers, customers, debtors, products, delivery, cars). Redirect me if you meant another
business.

**Who uses it, what for:** owner (daily brief, cash gap, exceptions) · sellers (customer notes,
debtor follow-up, order capture) · warehouse (stock, picks) · accountant (reconciliation,
RS.ge, bank) — against ERP Postgres, RS.ge, TBC / BOG.

**The overlap map, LifeOS box by box:**

| LifeOS idea | Personal LifeOS | 9T distribution agent | Verdict |
|---|---|---|---|
| Context file | who Boris is | what 9T is: products, regions, price rules, seasons | **same mechanism, different file** |
| TELOS | life goals | company KPIs: DSO, margin, fill rate | **same idea, must be numeric** |
| Skills | 75 skills on your machine (56 shipped) | ~8 business skills: debtor call, stock check, route, daily brief | **same format, far fewer** |
| Hooks | 67, mostly about the DA's own behaviour | ~6, all about money and writes: no write to GL without a matching source row | **same mechanism, different targets** |
| Memory | one person's facts | per-customer notes, shared across sellers, with an audit trail | **different: multi-user, must be a database** |
| Verification / ISA | evidence before "done" | reconciliation controls: Σ parts = declared total | **identical, and you already build this in 9T ERP** |
| Zone boundary | SYSTEM vs USER | product vs tenant config | **same principle** |
| Pulse / voice / Kitty / Atlas / Daemon | central | irrelevant | **drop** |
| Single principal, terminal sessions | the whole design | many users, roles, auth, scheduled jobs, a chat or API surface | **different shape entirely** |

**Where LifeOS is too large:** 67 hooks, a personal memory system, Pulse, voice, Atlas and the
installer are dead weight for a company agent; the single-principal assumption is structurally
wrong for multi-user work; and terminal sessions are the wrong surface for sellers on phones.

**Four alternatives, scored on the page** (fit to 9T · build cost · LifeOS ideas kept · risk):

1. **Thin harness inside `9T_erp`** — `CLAUDE.md` + skills + 6 guard hooks in the repo; agents
   help *build and operate* the ERP from the terminal. Cheapest; keeps 5 LifeOS ideas; not a
   product sellers can use.
2. **Claude Agent SDK service** — the same skills and guards, run as a service behind a chat or
   API surface with roles; scheduled jobs; memory in Postgres. Medium cost; the shape that fits
   sellers and the owner.
3. **Workflow engine + LLM steps** (n8n / Temporal) — deterministic pipelines with a model only
   where judgement is needed. Best for scheduled reconciliation and notifications; weakest for
   open-ended questions.
4. **Fork LifeOS** — everything for free, everything wrong-shaped; you'd spend the first month
   deleting.

**Recommendation the page will argue for:** 1 now, 2 when a second user needs it, 3 for the
nightly jobs; borrow exactly five things from LifeOS — the ISA / evidence discipline, hooks as
guards, the zone boundary, the skill file format, and the event log. Everything else stays personal.

---

## 4. Build decisions I'll take unless you redirect

1. **Rebuild clean, don't extend.** The current stack (vinext beta + wrangler + Cloudflare plugin +
   7,600 lines of generated shadcn components) is a deployment starter, not a teaching site, and
   it runs on npm. The rebuild is a static site generated by a **bun + TypeScript** script from
   content files, no framework: opens from the same `OPEN-ENGINE-ROOM.cmd`, same port, zero
   runtime dependencies. The current app stays at `build/engine-room-v1` for reference.
2. **Generate the inventory from your real install, redacted.** A script walks `~/.claude` and
   `~/.config/LIFEOS`, keeps file names, sizes, event wiring and `@`-import edges, and keeps
   **no contents** of USER, MEMORY or `.env`. The app shows *your* startup, not the clone's.
3. **The distribution org is 9T.** See the ⚠️ above.

**Order of work:** Part 0 and Part 1 first (they are what you said you couldn't see), then Part 2
with the toggle, then Parts 4 and 5, then the 25 parts last — because they are the reference
layer and the current app already has a usable version of them.

**Estimated size:** ~50 steps × 9 fields, 25 parts × 9 fields, 60 terms, ~120 field examples.
That is a content project of roughly 40,000 words plus the renderer. I'll ship it in the order
above so each part is usable before the next starts.
