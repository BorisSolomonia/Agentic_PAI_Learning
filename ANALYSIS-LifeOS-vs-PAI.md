# LifeOS (public repo) vs the PAI 4.0.3 running in `~/.claude`

*Written 2026-08-29. Evidence: `git clone --depth 1 https://github.com/danielmiessler/LifeOS` (1,989 files) diffed against the live install in `~/.claude`.*

> ⚠️ **Corrected later the same day.** This file says "you run PAI 4.0.3". That's true of your `CLAUDE.md` and understates the rest: **LifeOS 7.1.1 is fully installed and live on your machine** — `lifeos` launcher alias, populated USER tree symlinked to `~/.config/LIFEOS/USER`, and a 35 MB `LIFEOS/MEMORY` that is the memory system actually running. You are running a **7.1.1 runtime under a 4.0.3 constitution**. The version comparison below is still accurate; the diagnosis of *your* machine lives in **[MIGRATION-PAI-to-LifeOS.md §1](MIGRATION-PAI-to-LifeOS.md)**.

---

## 1. One-paragraph answer

They are the **same lineage, three years of evolution apart**. What you run is **PAI 4.0.3** — a *modes* system: every response picks NATIVE / ALGORITHM / MINIMAL, and ALGORITHM walks seven fixed phases (Observe → Think → Plan → Build → Execute → Verify → Learn) writing a **PRD.md** with checkbox criteria. What the repo ships is **LifeOS 7.40.4** — modes and effort tiers have been **deleted**. There is one loop, no phases, and the artifact is an **ISA** (Ideal State Artifact) whose every claim names the *tool probe that would falsify it*. Around that core, LifeOS added ~12 named subsystems that simply do not exist in your tree (Cortex, Arbol, Atlas, Ledger, Synapse, Conduit, Bunker, Hermes, Pulse, Observability, Spinner, Freshness). Your machine is in a **half-migrated state**: there is a `LIFEOS/` folder at version **7.1.1** sitting next to a `CLAUDE.md` that is still **PAI 4.0.3**.

---

## 2. Version ground truth (measured, not claimed)

| Thing | Your machine | Public repo |
|---|---|---|
| `LIFEOS/VERSION` | **7.1.1** | **7.40.4** |
| Active `CLAUDE.md` | PAI 4.0.3 (modes) | `CLAUDE.template.md` (routing table only) |
| Algorithm | `PAI/Algorithm/v3.7.0.md` | `LIFEOS/ALGORITHM/v8.20.2.md` |
| System prompt | *(none — rules live in CLAUDE.md)* | `LIFEOS_SYSTEM_PROMPT.md` v3.7.3, loaded via `--append-system-prompt-file` |
| Memory | `MEMORY/` (LEARNING, RELATIONSHIP, STATE, VOICE, WORK) | **Cortex** v8.3.0 (`CORTEX_INDEX_POLICY.json`, tiered) |
| Skills | 66 dirs | 57 dirs (48 shared) |
| Hooks | 51 `*.hook.ts` | shipped by `Tools/InstallHooks.ts` |
| `LIFEOS/TOOLS/*` | 152 files | 186 files |

You also have a **`CLAUDE.md.pai-4.0.3`** backup byte-identical to the live `CLAUDE.md` — evidence the 7.1.1 upgrade landed the folders but the routing file was rolled back.

---

## 3. The four differences that actually matter

### 3.1 Effort tiers were abolished
PAI 4.0.3 makes you classify first: Standard / Extended / Advanced / Deep / Comprehensive, each with an ISC floor (8/16/24/40/64) and a time budget. LifeOS 8.x deletes the whole idea:

> *"I don't classify the work into an effort tier or predict how hard to go before I start; there is the desired outcome and my judgment about how to reach it."*

Spend — intelligence, parallelism, verification depth, money — is **discovered from the claims**, not predicted from a label. **This is the single biggest behavioural change**, and the reason `Router/RouterSystem.md` is marked RETIRED in the repo.

### 3.2 PRD → ISA: criteria became falsifiable claims
| PAI 4.0.3 PRD | LifeOS ISA |
|---|---|
| `- [ ] ISC-1: text` — a checkbox | a **claim** that names the probe that would falsify it |
| Verified in the VERIFY phase | closed only on **tool evidence of the right modality** (file→Read, HTTP→`curl -i`, UI→real browser, schema→SELECT, deploy→live probe) |
| Lives in `MEMORY/WORK/{slug}/PRD.md` | lives at `<project>/ISA.md` for anything with **persistent identity** — the ISA *is* the app's current state between runs |
| Dies with the task | `bunker test` re-runs its probes on demand |

Plus rules with no PAI equivalent: **class-sweep** (fix one bug → grep every sibling), **ask-fidelity** (every explicit ask met, skipped-with-reason, or surfaced — logged to JSONL), **parity claims** (never silently lose working functionality; capture a baseline *before* the change).

### 3.3 Seven phases → one loop
`v3.7.0` = 7 phase headers, voice announcement per phase, PRD edit per phase, mandatory ISC floors. `v8.20.2` = **16 "a run is complete when" claims**, each tagged HOOK (blocks mechanically) / CHECK (a gate the run executes) / SELF (attestation, watched for decay). The ceremony moved from *the model performing phases* to *code enforcing outcomes*.

### 3.4 CLAUDE.md became a routing table, rules moved to the system prompt
Your `CLAUDE.md` **is** the constitution — modes, output formats, critical rules. In LifeOS, `CLAUDE.md` is 90 lines of "where things live", with exactly one mandatory `@`-import (`ARCHITECTURE_SUMMARY.md`) and five identity imports that the installer *uncomments* after the interview. Everything constitutional lives in `LIFEOS_SYSTEM_PROMPT.md`, injected via `--append-system-prompt-file`. **Why it matters for you:** context budget. Rules in the system prompt don't compete with the routing table for the model's attention, and a routing table can grow without cost.

---

## 4. Subsystems in LifeOS 7.40.4 that are absent from your install

| Component | What it is | Why you'd want it |
|---|---|---|
| **Cortex** | the memory system as a product — autonomic capture, tiered curation, typed knowledge graph | your `MEMORY/` is folders; Cortex is a policy (`CORTEX_INDEX_POLICY.json`) |
| **Arbol** | execution layer: **Actions** (do one thing) → **Pipelines** (compose) → **Flows** (bind to schedule/event) + cloud runner | deterministic steps handle routing/validation; models only make bounded judgments — this is the "9T nightly reconciliation" shape |
| **Atlas** | graph of everything you own — domains, servers, apps, keys, devices; collectors for Cloudflare, GitHub, systemd, launchd, secrets | you have Railway + Cloudflare + 6 repos + credentials-on-public-repo incidents. This is the fix. |
| **Ledger** | change-tracking authority: versioning, update registry, integrity gate, deploy events | "what changed, when, at what version, verified how" |
| **Synapse** | input router — one capture contract → amber ledger (write-ahead journal) → graded vs TELOS → routed | nothing interesting gets away |
| **Conduit** | sensory layer, local current-state capture feeding memory + TELOS | |
| **Bunker** | universal application harness: app owns the experience, Bunker owns data/backups/deploys/rollback/health/identity/security; **the app's ISA doubles as its test suite** | *concept doc only in the public release* — reference implementation is private |
| **Pulse** | the Life Dashboard on `:31337` — work kanban, wiki, voice, iMessage/Siri | you have a VoiceServer on `:8888` and no dashboard |
| **Observability** | live kanban of runs; ascent states Traverse → Marking → Ascending → Anchoring → Camped → Cairn | progress = verified claims, not log lines |
| **Hermes** | optional second front door — talk to your system as an agent from elsewhere, same memory/identity/security | |
| **Freshness** (`pai-freshness-v1`) | `last_updated / last_reviewed / convention` frontmatter on every doc + a rot detector | |
| **Spinner verbs / Tooltips** | custom statusline verbs; self-explaining dashboard | polish, but it's what makes it feel like a product |

Retired in the repo, still live in your tree: **Delegation** and **Router** (agent orchestration is now native harness surface).

---

## 5. Skill inventory delta

**In the repo, not on your machine (9):** `Cortex`, `DetectAI`, `Novelty`, `SecurityMarketData`, `SuggestSkills`, `Teach`, `ThreatModel`, `Tldraw`, `Vitals`.

**On your machine, not in the repo (18):** `Agents`, `ContentAnalysis`, `ContextSearch`, `Delegation`, `Harvest`, `Investigation`, `Knowledge`, `Media`, `Scraping`, `Security`, `Thinking`, `Utilities` *(older PAI umbrella skills that LifeOS split up)*, plus 6 third-party ones you installed yourself: `find-skills`, `frontend-design`, `high-end-visual-design`, `systematic-debugging`, `use-railway`, `web-design-guidelines`.

48 skills are common to both. **Read this as: the skill layer is stable; the architecture layer is what churned.**

---

## 6. How it installs (this is itself a lesson)

LifeOS is **installed by an AI**. The documented install is a *prompt*:

```
Read https://ourlifeos.ai/install and install LifeOS for me.
```

The `LifeOS/Tools/` directory is the installer, written in TypeScript for Bun: `DetectEnv` → `ScanConflicts` → `DeployCore` → `DeployComponents` → `InstallHooks` → `InstallSettings` → `ScaffoldUser` → `LinkUser` → `ActivateImports` → `SeedPulse`, with `lib/atomic-write.ts` underneath. `Workflows/` holds `Setup.md`, `Interview.md`, `Update.md`, `Uninstall.md` — **markdown files that the AI executes as procedures.**

That is the pattern you are going to copy for organisations: *the installer is a skill, the setup is an interview, the config is written by the agent, and the boundary between SYSTEM (upgradeable) and USER (never touched) is enforced by a documented rule* (`SystemUserBoundary.md`).

---

## 7. What this means for your goal

You do **not** need to catch up to 7.40.4 to build these for clients. You need the **five primitives** everything above is built from:

1. **Context files** — CLAUDE.md as routing table + identity/TELOS files (`@`-imports)
2. **Skills** — self-triggering domain capability, `SKILL.md` + tools
3. **Hooks** — deterministic enforcement at lifecycle events (this is where "the guardrails are code, not good intentions" lives)
4. **Subagents / delegation** — isolation and parallelism
5. **An artifact that defines done and gets verified** — ISA/PRD + evidence rules

Everything else — Atlas, Ledger, Pulse, Arbol — is *those five primitives applied to a domain*. Atlas is a skill + collectors + a JSON store. Ledger is a hook + a registry file. Pulse is a Bun server reading JSONL that hooks wrote. **That is the whole trick, and it is why Phase 1 of the curriculum is six weeks and not six months.**
