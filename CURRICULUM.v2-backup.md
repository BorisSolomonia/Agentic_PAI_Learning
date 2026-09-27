# Curriculum — Build a LifeOS-class Personal/Org AI System

**Owner:** Boris · **Started:** 2026-08-29 · **Home:** `C:\Users\Boris\Dell\stuff\Docs\Learning\AI\PAI`
**Goal:** `{ Phase 1 — build the same class of system as fast as possible, using AI wherever possible; Phase 2 — go deep on each part. }`
**Target version: LifeOS 7.40.4 (current), not PAI 4.x.** Every pattern below is the 7.x shape. Where the old shape still shows up in blog posts and videos, it's flagged.
**Definition of done for Phase 1:** you can be handed a new organisation on Monday and have a working, installable, verified AI system for it by Friday.

---

## 0. Hours at a glance

| Phase | Stages | **Hours** | @10 h/week | @20 h/week |
|---|---|---|---|---|
| **Phase 1 — BUILD** | 9 stages, 7 weeks | **78 h** | **8 weeks ← your lane** | 4 weeks |
| **Phase 2 — DEPTH** | 8 stages | **92 h** | **10 weeks ← your lane** | 5 weeks |
| **Total** | 17 | **170 h** | **18 weeks** | 9 weeks |

**Your settings (confirmed 2026-08-29):** 10 h/week · 2 h × 5 days · capstone = **9T ERP** · **you have never hand-written a skill or a hook** — so W2 and W3 stay at full length, they are the two weeks that turn you from user into builder · **you build everything with AI, you do not hand-write code** — Phase 1 requires zero hand-coding, and Phase 2's D1 is *read-and-verify*, not *author*. See "On not writing the code yourself" below.

### Phase 1 stage budget

| # | Stage | Hours | Week |
|---|---|---|---|
| 0 | Ground truth — what is harness, what is system | 4 | W1 |
| 1 | Context layer — CLAUDE.md, identity, TELOS | 8 | W1 |
| 2 | Skills — self-triggering capability | 10 | W2 |
| 3 | Hooks — deterministic enforcement | 12 | W3 |
| 4 | Agents & delegation | 6 | W4 |
| 5 | The ISA — defining and verifying "done" | 6 | W4 |
| 6 | Memory — capture, curate, recall | 10 | W5 |
| 7 | Voice + Dashboard — make it visible | 8 | W6 |
| 8 | **Capstone** — ship it for an organisation | 14 | W7 |
| | **Total** | **78** | |

### Phase 2 stage budget

| # | Stage | Hours |
|---|---|---|
| D1 | TypeScript + Bun — **read and verify** (not author) | 8 |
| D2 | Claude Agent SDK — programmatic, headless agents | 12 |
| D3 | MCP — build your own server | 12 |
| D4 | Context engineering at scale | 12 |
| D5 | Evals — proving behaviour, not just output | 12 |
| D6 | Security — injection, permissions, data classification | 12 |
| D7 | Execution layer — actions, pipelines, flows, schedules (Arbol-class) | 12 |
| D8 | Productisation — install, upgrade, SYSTEM/USER boundary, change ledger | 12 |
| | **Total** | **92** |

---

## 1. How a day works (the loop — 2 h)

| Block | Min | What |
|---|---|---|
| 🎧 **INPUT** | 20 | One resource. Watch at 1.5×, or read once. Not two. |
| 🔨 **BUILD** | 70 | Build the day's artifact. Use Claude Code to write it — that is the point. |
| ✅ **PROVE** | 15 | Run the day's check command. Paste the real output. |
| 📝 **LOG** | 15 | One row in `PROGRESS.md` + a 3-sentence teach-back in your own words. |

**Rules of the loop**
1. **No day without an artifact.** A file, a hook, a skill — something on disk with a path.
2. **No artifact without a check.** A command whose output proves it works. "It should work" doesn't count.
3. **The teach-back is the real test.** If you can't explain it in 3 sentences without jargon, the day is amber, not green.
4. **Ask Claude to build it, then make Claude explain it back to you line by line.** Phase 1 is about *directing* correctly; Phase 2 is about writing it yourself.

## 2. How a week works

- **5 build days × 2 h = 10 h.**
- Each week ends with a **GATE**: one binary command. It passes or it doesn't. No partial credit.
- Gate fails → the next week starts with a 2 h repair block, and the week's hours shift by one. That is normal, not failure.
- After each gate, spend 10 min on the **retro** at the bottom of `PROGRESS.md`. Those retros are what rewrite this curriculum.

## 3. Scoring (so progress is measurable, not felt)

| Metric | How it's counted | Phase-1 target |
|---|---|---|
| **Gates passed** | 7 weekly gates, binary | 7/7 |
| **Artifacts shipped** | files on disk with a path in the log | ≥ 35 |
| **Hours logged** | sum of the log's hours column | ≥ 70/78 |
| **Teach-back green rate** | days you explained it cleanly ÷ days | ≥ 80% |
| **First-pass direction rate** | days where your *first* instruction produced an artifact that passed the check — no correction round | ≥ 50% by W7 |

---

## 4. On not writing the code yourself

You said it plainly: *if I build it with AI, I don't need to read it to debug it.* For Phase 1 that is **correct and the plan is built that way** — you will not hand-write a line. Directing is your actual skill and it's the one that transfers to clients.

Two places where it stops being true, and they're the reason D1 survives into Phase 2 (shrunk to 8 h, and re-aimed at *reading*, not *authoring*):

1. **You can't verify what you can't read.** The entire system you're copying rests on one rule — *no claim closes without evidence*. When a hook reports "blocked ✅" you need to be able to open it and see that it actually returns exit code 2, and not just prints the word. That's reading, not writing. It's the difference between a system that works and one that only reports that it works.
2. **The loop.** Roughly one bug in ten sends AI in circles — it "fixes" the same thing three times. The exit is always someone reading the twelve lines that matter. Without that, a 20-minute bug becomes a lost afternoon. You already do this in Java and SQL; hooks are 60-line TypeScript files, a far smaller ask.

**What this changes in practice:** nothing in Phase 1. In Phase 2, D1's gate is *"here are three hooks, one is subtly wrong — find it without running it."* Not *"write one from scratch."*

---

## 5. What you're learning: LifeOS 7.x, not PAI 4.x

Most of the writing and video about this system on the internet describes **PAI 4.x/5.x**, which is what's on your machine's `CLAUDE.md`. The architecture changed. Learn the current shape; recognise the old one so you don't copy it.

| PAI 4.x (the old shape) | LifeOS 7.x (what you build) | Week |
|---|---|---|
| Modes — NATIVE / ALGORITHM / MINIMAL, declared per response | **No modes.** One loop. The response format is a contract in the system prompt, separate from how the work happens | W1 |
| Effort tiers — Standard→Comprehensive, with ISC floors | **No tiers.** Spend is discovered from the claims and their evidence | W4 |
| 7 fixed phases: Observe→Think→Plan→Build→Execute→Verify→Learn | **16 outcome claims**, each tagged HOOK (blocks mechanically) / CHECK (a gate the run runs) / SELF (attestation) | W4 |
| **PRD.md** — checkbox criteria, dies with the task | **ISA.md** — each claim names the probe that would falsify it; lives with the thing, outlives the run | W4 |
| Rules live in `CLAUDE.md` | `CLAUDE.md` is a **routing table**; the constitution is a separate system prompt loaded with `--append-system-prompt-file` by a launcher | W1 |
| `MEMORY/` folders | **Cortex** — tiered store with an index policy, autonomic capture, typed knowledge | W5 |
| Everything in one tree | **Four zones**: SYSTEM (ships) / USER (private, symlinked out) / INTERFACE (the contract between them) / RUNTIME (ephemeral) | W1, W7 |
| Ad-hoc scripts | **Arbol**: Actions → Pipelines → Flows, deterministic, scheduled, inspectable | Phase 2 D7 |
| — | **Doctor** — probe every external capability; degrade **loudly**, never silently | W6 |
| — | **Atlas** (graph of everything you own) · **Ledger** (what changed, when, verified how) | Phase 2 D8 |

**The four 8.x rules that carry the most weight** — you'll implement all four in W4:
1. **Evidence modality** — a claim closes only on the right kind of proof (file→Read, HTTP→`curl -i`, schema→SELECT, UI→real browser). "Should work" is forbidden.
2. **Class-sweep** — fix one bug, then one grep enumerates every sibling before the claim closes.
3. **Ask-fidelity** — every explicit ask met, skipped-with-a-reason, or surfaced. Logged.
4. **Parity** — never silently lose working functionality; capture a baseline *before* the change and prove the flow still runs at that rate.

---

# PHASE 1 — BUILD

Working directory for everything you build: `C:\Users\Boris\Dell\stuff\Docs\Learning\AI\PAI\build\`
Your system-under-construction lives at `build\myos\` and installs into a **test** Claude Code project — **never** into `~/.claude` until W7. Breaking your working PAI mid-week costs you days.

---

## WEEK 1 — Ground truth + the Context Layer (12 h)

> **Stage 0 (4 h) + Stage 1 (8 h)** — 5 days × 2.4 h

**Week goal:** you have watched LifeOS 7.40.4 install itself, you know the four zones, and a fresh session in your own scaffold knows who you are — with the constitution loading through *your* launcher, not through `CLAUDE.md`.

| Day | 2.4 h | Artifact | Check |
|---|---|---|---|
| 1 | **Get installed, safely.** `export CLAUDE_CONFIG_DIR=~/.lifeos-trial`, then tell a session: *"Read https://ourlifeos.ai/install and install LifeOS for me."* Watch every step; it narrates itself. | `build/notes/01-install-log.md` — annotate what each of the 10 tools did | `bun ~/.lifeos-trial/LIFEOS/TOOLS/Doctor.ts` prints a capability table |
| 2 | **The four zones**: SYSTEM / USER / INTERFACE / RUNTIME. Read `DOCUMENTATION/SystemUserBoundary.md` from the trial install. | `build/notes/02-zones.md` — classify 20 real paths from the trial tree | ≥ 18/20 correct against the doc's tables |
| 3 | **The split constitution.** `CLAUDE.md` = routing table. The rules live in a system prompt loaded by a launcher (`--append-system-prompt-file`). This is the single biggest structural idea in 7.x. | `build/myos/CLAUDE.md` + `build/myos/SYSTEM_PROMPT.md` + a `myos` shell alias | launch via `myos` → the model quotes a rule that exists **only** in the system prompt; launch plain `claude` → it doesn't |
| 4 | **Identity + the INTERFACE zone.** `@`-imports for identity; your standing rules in `USER/CONFIG/OPERATIONAL_RULES.md` so no update can ever clobber them. | `USER/IDENTITY.md`, `USER/PROJECTS.md`, `USER/CONFIG/OPERATIONAL_RULES.md` | fresh session answers "what am I working on?" correctly |
| 5 | **TELOS.** Run the Interview workflow in the trial install against yourself — then write your own for `myos`. Don't type it cold; be interviewed. | `build/myos/USER/TELOS/TELOS.md` | fresh session recommends a next action that cites your TELOS |

**🚦 GATE 1 — "The cold-start test, plus the split."** (a) Open a new session in `build/myos/` and ask five questions you never answer twice: *Who am I? My three active projects? My #1 goal this quarter? What rule must you never break with me? Where do my notes live?* (b) Prove the constitution is separable. **Pass = 5/5 correct with zero prompting, AND `myos` loads the constitution while plain `claude` demonstrably does not.**

**Sources (three, no more)**
- 📄 Docs: <https://code.claude.com/docs/en/memory> · env vars incl. `CLAUDE_CONFIG_DIR`: <https://code.claude.com/docs/en/env-vars> · index: <https://code.claude.com/docs/llms.txt>
- 📰 **Primary, current**: `skills/LifeOS/INSTALL.md` + `DOCUMENTATION/SystemUserBoundary.md` + `DOCUMENTATION/CoreComponents.md` in your trial install. *(Daniel's blog posts describe PAI 4.x/5.x — read them for philosophy, not architecture.)*
- 📺 *LifeOS walkthrough* — <https://youtu.be/Le0DLrn7ta0> (the current system; older PAI videos show the abolished mode/tier shape)

---

## WEEK 2 — Skills (10 h)

> **Stage 2**

**Week goal:** three working skills, one of which fires *without you naming it*.

| Day | 2 h | Artifact | Check |
|---|---|---|---|
| 1 | `SKILL.md` anatomy: frontmatter `name` + `description`, and **why the description is the whole trigger**. Progressive disclosure. | `build/myos/skills/Standup/SKILL.md` — a pure-prompt skill | `/standup` runs it |
| 2 | Rewrite the description as a **USE WHEN / NOT FOR** trigger. Test 10 phrasings. | `build/notes/w2-trigger-tests.md` — 10 sentences, fired y/n | ≥ 8/10 fire; 0 false fires on the NOT-FOR list |
| 3 | Skills with **bundled code**: a `tools/` script the skill calls. | `skills/Reconcile/` with `SKILL.md` + `tools/check.ts` | skill runs the script, output appears in the transcript |
| 4 | Skills that **compose**: one skill invoking another; reference files loaded on demand. | `skills/Report/` using `Reconcile` | transcript shows both loaded |
| 5 | Steal properly: read 3 real skills from your `~/.claude/skills/` (`ISA`, `CreateSkill`, `Telos`) and copy the *shape*. | `build/notes/w2-patterns.md` — 5 patterns you're adopting | each pattern has a named source file |

**🚦 GATE 2 — "The unnamed trigger."** Say a sentence in a fresh session that describes the work in your own words, never naming the skill. **Pass = the skill loads on its own, 3 out of 3 different phrasings.**

**Sources**
- 📄 Docs: <https://code.claude.com/docs/en/skills>
- 📰 Anthropic Engineering, *Equipping agents for the real world with Agent Skills* — <https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills> · examples: <https://github.com/anthropics/skills>
- 📺 IndyDevDan — 🔎 search his channel for *"I finally CRACKED Claude Agent Skills"* — <https://www.youtube.com/@indydevdan>

---

## WEEK 3 — Hooks (12 h)

> **Stage 3 — the highest-value week in Phase 1.** Hooks are where "the guardrails are code, not good intentions."

**Week goal:** four hooks that make the system behave the same way every single time, without depending on the model remembering.

| Day | 2 h | Artifact | Check |
|---|---|---|---|
| 1 | Lifecycle events, `settings.json` wiring, JSON on stdin, exit codes (0 = proceed, 2 = block). | `hooks/Hello.hook.ts` on `SessionStart` | your banner prints on every new session |
| 2 | **Context injection**: `UserPromptSubmit` adds text the model must see. | `hooks/LoadContext.hook.ts` | ask "what did you just receive?" → your injected block is quoted back |
| 3 | **Enforcement**: `PreToolUse` blocks a forbidden action. | `hooks/Guard.hook.ts` — blocks writes to a protected path | attempt the write → blocked, with your message |
| 4 | **Reaction**: `PostToolUse` + `Stop` — log every tool call to JSONL, notify on finish. | `hooks/Observe.hook.ts` → `logs/events.jsonl` | `wc -l logs/events.jsonl` grows during a run |
| 5 | Read 4 real ones from `~/.claude/hooks/` (`LoadMemory`, `VerificationGate`, `SafetyHook`, `PreToolGuard`) and diff them against yours. | `build/notes/w3-hook-patterns.md` | 5 concrete improvements applied to your four hooks |

**🚦 GATE 3 — "The wall."** In a fresh session, ask Claude to do the forbidden thing three different ways (direct, indirect, "just this once"). **Pass = blocked 3/3, and `logs/events.jsonl` contains all three attempts.**

**Sources**
- 📄 Docs: guide <https://code.claude.com/docs/en/hooks-guide> · full reference <https://code.claude.com/docs/en/hooks>
- 📰 DataCamp, *Claude Code Hooks: A Practical Guide* — <https://www.datacamp.com/tutorial/claude-code-hooks> · working repo: <https://github.com/disler/claude-code-hooks-mastery>
- 📺 🔎 *"Claude Code hooks mastery"* on <https://www.youtube.com/@indydevdan>

---

## WEEK 4 — Agents + the ISA (12 h)

> **Stage 4 (6 h) + Stage 5 (6 h)**

**Week goal:** work gets parallelised when it should be, and "done" is written down *before* building and closed only on evidence.

| Day | 2 h | Artifact | Check |
|---|---|---|---|
| 1 | Subagents: separate context, own tools, when *not* to use one (the inline-answer rule). | `build/myos/agents/Auditor.md` + `agents/Researcher.md` | both appear in the agent list |
| 2 | Fan-out: 3 agents in parallel, results merged by you. | `build/notes/w4-fanout.md` with wall-clock timings | parallel wall-clock < serial sum |
| 3 | **ISA format** (read `ALGORITHM/v8.20.2.md` + `DOCUMENTATION/ISA/ISAFormat.md` in the trial install): goal verbatim, vision, out-of-scope, anti-claims, claims — *each naming the probe that would falsify it*. Note there are **no effort tiers and no phases**. | `build/myos/ISA-TEMPLATE.md` | every claim row has a probe column; zero tier/phase fields |
| 4 | **The four rules**: evidence modality · class-sweep · ask-fidelity · parity-against-baseline. Write them as one rule file, and tag each claim HOOK / CHECK / SELF. | `build/myos/RULES/Verification.md` | ≥ 8 modalities; all four rules present with teeth tags |
| 5 | `hooks/VerificationGate.hook.ts` — refuse to mark a claim `[x]` without evidence in the same turn. | the hook | deliberately fake a pass → hook blocks it |

**🚦 GATE 4 — "The honest run."** Run one real task end-to-end against an ISA you wrote first. Include **one claim you know will fail**. **Pass = the failing claim is caught by the gate, not by you.**

**Sources**
- 📄 Docs: <https://code.claude.com/docs/en/sub-agents>
- 📰 Anthropic Engineering, *Building effective agents* — <https://www.anthropic.com/engineering/building-effective-agents>
- 📺 🔎 *"Claude Code subagents"* on <https://www.youtube.com/@indydevdan> · or Anthropic's *Claude Code advanced patterns* webinar — <https://website.anthropic.com/webinars/claude-code-advanced-patterns>

---

## WEEK 5 — Memory, Cortex-shaped (10 h)

> **Stage 6 — this is what makes it feel alive.**

**Week goal:** something learned on Monday is used, unprompted, on Friday.

| Day | 2 h | Artifact | Check |
|---|---|---|---|
| 1 | Read `CORTEX_INDEX_POLICY.json` + `DOCUMENTATION/Memory/MemorySystem.md` in the trial install. Memory shapes: hot-layer facts vs typed knowledge graph vs episodic work history. Design yours on paper first. | `build/notes/w5-memory-design.md` | 3 tiers named, each with a write rule, a read rule, and an index policy |
| 2 | **Capture**: a hook that writes a memory file when something durable is learned. | `hooks/MemoryWrite.hook.ts` + `MEMORY/` | a session produces a real memory file |
| 3 | **Recall**: a `SessionStart`/`UserPromptSubmit` hook that injects the relevant subset (not everything). | `hooks/MemoryRecall.hook.ts` | injected block is ≤ 2 KB and relevant |
| 4 | **Curation**: dedupe, supersede, delete. Write the policy, then a script that enforces it. | `MEMORY/POLICY.md` + `tools/curate.ts` | duplicate memory is merged, not doubled |
| 5 | Compare with the real thing: read `~/.claude/hooks/LoadMemory.hook.ts` and `MemoryDeltaSurface.hook.ts`. | `build/notes/w5-diff.md` | 5 improvements applied |

**🚦 GATE 5 — "Two sessions."** Session A: tell it one non-obvious fact about a project. Close it. Session B (fresh, next day): ask a question whose good answer requires that fact. **Pass = it uses the fact without you mentioning it.**

**Sources**
- 📄 Docs: <https://code.claude.com/docs/en/memory>
- 📰 Anthropic Engineering, *Effective context engineering for AI agents* — <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- 📺 🔎 *"Claude Code memory / context engineering"* — <https://www.youtube.com/@anthropic-ai>

---

## WEEK 6 — Voice + Dashboard (8 h)

> **Stage 7 — 4 build days this week.** Make the invisible visible; this is what sells it to a client.

| Day | 2 h | Artifact | Check |
|---|---|---|---|
| 1 | A tiny notification server (Bun HTTP, one POST endpoint) + a `Stop` hook that calls it. | `build/myos/server/notify.ts` | `curl` the endpoint → you hear/see it |
| 2 | Text-to-speech: wire ElevenLabs (or the OS voice as a free fallback) + a voice config file. | `server/voices.json` | a completed run speaks |
| 3 | An **Observability** page reading `logs/events.jsonl` + your ISA files — one card per run, claims closed vs open. | `server/dashboard/` | page shows a live run, claims counted |
| 4 | Statusline + **your own Doctor**: probe each external capability your system assumes (browser, TTS, DB, API keys) and print live ✅ / broken ❌ + fix command / declined ⏸. Degrade **loudly**. | `statusline.sh` + `tools/doctor.ts` | unplug one capability → Doctor says so, with the fix command |

**🚦 GATE 6 — "Show someone."** Run a real task while a non-technical person watches the dashboard. **Pass = they can tell you what the system is doing, without you narrating.**

**Sources**
- 📄 Docs: <https://code.claude.com/docs/en/settings> (statusLine, hooks config)
- 📰 alexop.dev, *Understanding Claude Code's Full Stack* — <https://alexop.dev/posts/understanding-claude-code-full-stack/>
- 📺 *Build the Ultimate Personal AI Infrastructure / Life Operating System* — <https://www.youtube.com/watch?v=e0UlR2QdczU>

---

## WEEK 7 — CAPSTONE: ship it for an organisation (14 h)

> **Stage 8 — 5 days × ~3 h.** Target: **9T ERP** (confirmed).

**Week goal:** a colleague installs it in 10 minutes on a clean machine and it works.

| Day | ~3 h | Artifact | Check |
|---|---|---|---|
| 1 | **Interview the org, not the code.** Run your TELOS interview against the business: what does it want, what breaks, what must never happen. | `capstone/ORG_TELOS.md` | 5 goals, 5 problems, 5 hard rules |
| 2 | Three domain skills for 9T's real recurring work: **source-file reconciliation**, **debtor/AR review**, **month-close pack**. | `capstone/skills/*` | each fires on a natural sentence |
| 3 | Two guard hooks encoding 9T's real non-negotiables: **never edit an applied Flyway migration**, **never commit — leave changes staged for Boris's git flow**. | `capstone/hooks/*` | each blocks a real attempt |
| 4 | The **installer**, LifeOS-style: dry-run by default + explicit `--apply`, additive, never deletes, backs up before overwriting, skips symlinks. Plus the four-zone boundary written down. | `capstone/install/` + `SYSTEM_USER_BOUNDARY.md` | dry run writes zero bytes (`diff -rq` before/after is empty); `--apply` installs on a clean machine ≤ 10 min |
| 5 | The **handover doc** — for a rookie, with examples. Then run one real work task through it end-to-end. | `capstone/README.md` + one completed ISA with evidence | someone else completes a task using only the README |

**🚦 GATE 7 — "The handover."** Give it to one other person with no verbal explanation. **Pass = they install it and complete one real task.**

**Sources**
- 📄 <https://code.claude.com/docs/en/plugins> (packaging to share) · the LifeOS installer itself: `LifeOS/Tools/*.ts` + `LifeOS/Workflows/Setup.md`
- 📰 Daniel Miessler, *Building a Personal AI Infrastructure (Dec 2025 version)* — <https://danielmiessler.com/blog/personal-ai-infrastructure-december-2025>
- 📺 *PAI — Daniel Miessler ships a Life OS on Claude Code* — <https://www.youtube.com/watch?v=qEGItnB4VYI>

---

### ✅ Phase 1 exit criteria (all five, or you're not done)

1. Cold-start test passes on **your** system (Gate 1) **and** on the org system.
2. A forbidden action is blocked by code, three ways (Gate 3).
3. A false claim is caught by your verification gate, not by you (Gate 4).
4. A fact from session A is used in session B (Gate 5).
5. Someone else installed it and completed a task from the README alone (Gate 7).

---

# PHASE 2 — DEPTH (92 h)

Phase 2 flips the ratio: **you review, Claude writes.** You still don't have to author code from a blank file — but you do have to be able to *judge* what came back. Each stage is ~12 h = 6 days of the same 2 h loop, and each ends with a gate.

| # | Stage | What you'll be able to do | Gate |
|---|---|---|---|
| **D1** | **TypeScript + Bun — read & verify** (8 h) | open any hook or tool Claude wrote and say what it does, where it fails, and whether it matches the claim | given 3 hooks — one of which is subtly wrong — find the broken one without running it |
| **D2** | **Claude Agent SDK** (12 h) | build agents that run without a terminal — cron, webhook, server | a headless agent runs on a schedule with `maxTurns` + budget caps |
| **D3** | **MCP servers** (12 h) | expose *any* system (Postgres, Linear, your ERP) as native tools | your own MCP server serving 3 tools against the 9T database |
| **D4** | **Context engineering at scale** (12 h) | keep quality up as context grows; compaction, retrieval, sub-agent isolation | same task at 10 k and 150 k context, measured quality delta |
| **D5** | **Evals** (12 h) | prove behaviour statistically, not anecdotally (pass@k / pass^k) | an eval suite that fails when you regress a skill's trigger |
| **D6** | **Security** (12 h) | prompt injection, tool permissions, data classification, egress control | a red-team run against your own system; every finding closed |
| **D7** | **Execution layer** (12 h) | Actions → Pipelines → Flows: scheduled, deterministic, inspectable work | a nightly flow that runs, verifies itself, and reports |
| **D8** | **Productisation** (12 h) | install, upgrade, roll back, version, never clobber user data | v1→v2 upgrade on a live install with zero user-data loss |

**Phase 2 core reading** (deep, not wide): Anthropic Engineering — *Writing tools for agents* <https://www.anthropic.com/engineering/writing-tools-for-agents> · the Agent SDK docs · `LIFEOS/DOCUMENTATION/Testing/TestingDoctrine.md` and `RULES/Verification.md` in the cloned repo · the `agentskills.io` open standard <https://agentskills.io>.

---

## Curriculum maintenance

This file is **not fixed**. It changes from your feedback, in this conversation:

- Tell me *"W3 day 2 took 4 h, not 2"* → I rebalance the hours and reprint the affected week.
- Tell me *"I didn't understand X"* → that becomes an extra day, with a different resource (not the same one restated).
- Tell me *"I already know Y"* → the stage is cut, hours drop, the calendar pulls in.
- Every change is appended to the **Curriculum changelog** at the bottom of `PROGRESS.md`, with the reason.

Log first, then tell me. The log is the input.
