# Migrating your install to current LifeOS — without losing what it knows about you

*2026-08-29. Every claim below was read off your actual machine or out of the shipped installer docs. Nothing was changed.*

---

## 1. First, the correction: you are not on PAI 4.0.3

I said that in the analysis file. Looking at the machine properly, it's wrong in an important way. **You are running a hybrid**, and the hybrid is the actual problem.

| What I found | Evidence |
|---|---|
| LifeOS **7.1.1 is properly installed and live** | `~/.bashrc:132` — `alias lifeos='bun ~/.claude/LIFEOS/TOOLS/lifeos.ts -s ~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md'`, added 2026-07-13 |
| The LifeOS runtime is real, not a folder | `LIFEOS/TOOLS/` has `lifeos.ts`, `Doctor.ts`, `models.ts`, `Inference.ts`, `CarrierProbe.ts` |
| The installer skill is present | `skills/LifeOS/` with `Tools/` (11 tools) + `Workflows/` |
| Your USER tree is **live and correctly mounted** | `LIFEOS/USER` → symlink → `~/.config/LIFEOS/USER`, populated: `PRINCIPAL/`, `DIGITAL_ASSISTANT/`, `TELOS/`, `CONFIG/OPERATIONAL_RULES.md`, `PROJECTS.md`, `CONTACTS.md` |
| The LifeOS memory system is **the one actually running** | `LIFEOS/MEMORY/` = 35 MB, **291 files** written in the last 9 days (vs 16 in the old root `MEMORY/`) |
| **But `CLAUDE.md` is still PAI 4.0.3** | byte-identical to `CLAUDE.md.pai-4.0.3`; mandates NATIVE/ALGORITHM/MINIMAL modes and the 7-phase v3.7.0 Algorithm |

**So what's actually happening every session:** you load a **7.1.1 constitution** (`LIFEOS_SYSTEM_PROMPT.md`, via the `lifeos` alias) on top of a **4.0.3 CLAUDE.md** that orders modes, effort tiers, and seven fixed phases — the exact machinery LifeOS 8.x deleted on purpose. The two documents disagree, and CLAUDE.md wins on tone because it's loud and specific.

That's not a maintenance backlog. It's a contradiction you pay for on every single turn.

**Also found:** your `TELOS/` files are all dated **2026-07-13** and are still the shipped templates. `TELOS.md` is 2,299 bytes of scaffold. The whole "intent engineering" layer — the thing the system is *for* — has never been filled in. That is a bigger quality loss than being 39 versions behind.

---

## 2. Is it a good idea? — Yes, and it's more urgent than a version bump

**Recommendation: update, staged, this week.** Not because 7.40.4 is shinier, but because you are currently in the one state that's worse than either endpoint — two constitutions fighting.

**What you actually gain, 7.1.1 → 7.40.4** (39 releases; these are the ones that touch your work, not the changelog):

| Gain | Why it matters to *you* specifically |
|---|---|
| **Effort tiers abolished** | No more "declare Standard/Advanced, hit the ISC floor" ceremony before work starts. Spend is discovered from the task. Your quick asks stop paying phase tax. |
| **ISA replaces PRD** | Every claim names the probe that would falsify it. Applied to 9T: "reconciliation matches the file" isn't a checkbox, it's a SELECT you must run. |
| **Parity claims (rule 16)** | *"Previous functionality was restored or improved, never silently lost — proven against a captured baseline."* This is the golden-baseline-diff discipline you already invented by hand, enforced by the system. |
| **Class-sweep (rule 9)** | Fix one bug → one grep enumerates every sibling before the claim closes. You've been burned by this repeatedly (the CORS/WebConfig class, the stale-jar class). |
| **Ask-fidelity gate (rule 10)** | Every explicit ask met, skipped-with-reason, or surfaced — logged. No more quiet scope narrowing. |
| **Doctor** | `bun LIFEOS/TOOLS/Doctor.ts` — probes browser, codex, Cloudflare, ElevenLabs; degraded features say so instead of silently pretending. |
| **Atlas** | Graph of everything you own — domains, servers, keys, devices. You've had credentials on public repos **twice** (Camora, GirchiFin). This is the system that would have caught it. |
| **Ledger** | "What changed, when, at what version, verified how." |
| **Idempotent Update path** | The reason this is worth doing once: after this, every future update is four commands. |

**The honest costs**

1. **`CLAUDE.md` gets overwritten** (backed up automatically). Your PAI-4.0.3 mode formats go away — that's the point, but any rule you care about must be moved first (§4).
2. **Voice port moves.** Your hooks POST to `localhost:8888` (`VoiceServer/`). LifeOS 7.x routes voice through **Pulse on :31337**. Voice goes quiet until Pulse is installed or you repoint it. Not data loss, but you'll notice on day one.
3. **Some components are concept-only in the public release.** Bunker ships as a design doc; Arbol's cloud worker tree is private. You get the pattern, not the maintainer's implementation.
4. **Windows/WSL caveats.** You're fine: `bun 1.3.12` ✅ and `systemd=true` in `/etc/wsl.conf` ✅, so the systemd-based background jobs can run. The macOS menu-bar app is genuinely macOS-only — skip it.

**If you'd rather not touch the live system yet** — §3 Stage B gives you a zero-risk full install in a separate config dir. That is the right first move regardless.

---

## 3. The migration, staged

### Stage A — Snapshot (10 min, do this even if you do nothing else)

```bash
cp -r ~/.claude ~/.claude-backup-$(date +%Y%m%d)
cp -r ~/.config/LIFEOS ~/.config/LIFEOS-backup-$(date +%Y%m%d)
cp ~/.bashrc ~/.bashrc.pre-lifeos-$(date +%Y%m%d)
```

Three copies, because your data lives in three places: the config root, the XDG USER mount, and the shell rc that wires the launcher.

### Stage B — Rehearse it somewhere harmless (60–90 min) ← **do this first**

Claude Code reads `CLAUDE_CONFIG_DIR` to relocate the whole config root *(confirmed in the official settings docs: "To keep the home-directory files somewhere else, set `CLAUDE_CONFIG_DIR`; Claude Code then stores your settings, session history, and plugins there instead.")*

```bash
export CLAUDE_CONFIG_DIR=~/.lifeos-trial
mkdir -p ~/.lifeos-trial
# then, in a Claude Code session started with that env var set:
#   "Read https://ourlifeos.ai/install and install LifeOS for me."
```

You get a **complete, current 7.40.4 install** with zero risk to your working system. Run the Interview, see what the TELOS interview actually asks, break things freely. **This is also Week 1 of the curriculum** — you learn the installer by being installed.

### Stage C — Update the real install (1–2 h, on a day with no client deadline)

Your 7.1.1 skill **does not have `OverlaySystem.ts`** — it ships with the newer payload. So the fetch must come first.

```bash
cd ~/.claude/skills/LifeOS

# 1. environment + version check
bun Tools/DetectEnv.ts

# 2. fetch the current payload (additive; replaces only the LifeOS skill dir, backing up the old one)
bash install/install.sh

# 3. RE-READ the new skill's Workflows/Update.md — steps change between versions
#    then, from it:
bun Tools/OverlaySystem.ts --config-root ~/.claude          # dry run — prints the plan, writes NOTHING
bun Tools/OverlaySystem.ts --config-root ~/.claude --apply   # the real overlay
bun Tools/InstallHooks.ts --apply
bun Tools/ScaffoldUser.ts --apply
bun Tools/ActivateImports.ts --apply
bun LIFEOS/TOOLS/Doctor.ts
```

> ⚠️ **The single biggest trap, and it's documented in the repo itself:** every one of these tools is **dry-run by default**. Without `--apply` they print a success-shaped JSON plan and change nothing. The LifeOS docs shipped the update path *without the flag* from 2026-07-08 to 2026-07-31, and the entire update was a silent no-op for everyone who followed them. **Run the dry run, read the plan, then re-run with `--apply`.**

### Stage D — Reconcile (30 min)

`OverlaySystem` backs the old `CLAUDE.md` up to `CLAUDE.md.pre-overlay-<timestamp>.bak`. Open it beside the new one and move anything you still want — but **not back into CLAUDE.md** (§4).

### Stage E — Fill TELOS (2 h, the highest-value hour in this whole document)

```
lifeos
> run the LifeOS Interview workflow
```

It interviews you and writes mission, goals, problems, strategies, beliefs, challenges. Until this exists, every recommendation the system makes is framed against a template.

---

## 4. What happens to each store — the actual answer to "will I lose my info"

`OverlaySystem` **overwrites only system-owned paths, never deletes, and skips symlinks.** Per the shipped `Workflows/Update.md`: it touches `hooks/`, `skills/`, `agents/`, `LIFEOS/{TOOLS,DOCUMENTATION,ALGORITHM,RULES,PULSE}`, `CLAUDE.md`, and the system prompt — and *"never touches `USER/`, `LIFEOS/MEMORY/`, or `settings.json`."*

| Store | Size | Fate | What you must do |
|---|---|---|---|
| `~/.config/LIFEOS/USER/**` (identity, TELOS, PRINCIPAL_MEMORY, DA_MEMORY, OPERATIONAL_RULES, PROJECTS) | live | ✅ **untouched** — it's a symlink, and Overlay skips symlinks | nothing |
| `LIFEOS/MEMORY/**` — the memory that's actually running | 35 MB | ✅ **untouched** by name | nothing |
| `projects/-home-dmin--claude/memory/` — 65 native Claude Code memory files + `MEMORY.md` | 492 KB | ✅ **untouched** — this is the harness's own store, LifeOS doesn't know it exists | nothing |
| `settings.json` (48 KB, 79 hook entries) | | ✅ never overwritten; `InstallHooks` **merges** with dedup and backs it up first | diff the backup afterwards |
| `MEMORY/**` at root (old PAI tree, WORK history) | 4.3 MB | ⚠️ **orphaned** — survives, stops being read | decide: migrate `WORK/` into `LIFEOS/MEMORY/WORK/`, or archive |
| `PAI/**` incl. `PAI/USER/` (TELOS, PROJECTS, AISTEERINGRULES) | 116 KB | ⚠️ **orphaned** — the 7.x tree doesn't exist any more | copy AISTEERINGRULES content into `USER/CONFIG/OPERATIONAL_RULES.md` **before** Stage C |
| `CLAUDE.md` | | 🔴 **overwritten**, backed up to `.pre-overlay-*.bak` | Stage D |
| `hooks/` — your 51 hooks | 1 MB | 🟡 same-named files overwritten; extras (e.g. `DesignDirectives.hook.ts`) survive | `diff -rq` your backup vs the new tree afterwards |
| `skills/` — 18 skills LifeOS doesn't ship | 25 MB | 🟡 survive (nothing to overwrite), but they sit in the SYSTEM zone | if a future release ever collides, LifeOS's convention is an `_` prefix for private skills |
| `VoiceServer/` on :8888 | 80 KB | 🟡 survives; the new hooks call **:31337** instead | install Pulse, or repoint the new voice hook at 8888 |
| `~/.bashrc` `pai` alias → `PAI/Tools/pai.ts` | | 🟡 points at a tree 7.x abandoned | repoint it at the `lifeos` launcher; the installer offers to do this |

**Summary in one line: nothing is deleted. Two things get overwritten (CLAUDE.md and same-named system files, both backed up), and two things get orphaned (`MEMORY/` root and `PAI/`).** The risk is silent disconnection, not loss.

### The one thing to do *before* Stage C

Your standing rules — `NOTHING IS HARDCODED`, the design directives, the git-flow rule (never commit, leave changes staged) — currently live in files that the 7.x tree treats as gone. Move them into **`~/.config/LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md`**, which is the **INTERFACE zone**: `@`-imported by CLAUDE.md, owned by you, and *never* touched by any future update. Do that once and the problem never recurs.

---

## 5. Rollback

```bash
rm -rf ~/.claude && mv ~/.claude-backup-YYYYMMDD ~/.claude
rm -rf ~/.config/LIFEOS && mv ~/.config/LIFEOS-backup-YYYYMMDD ~/.config/LIFEOS
cp ~/.bashrc.pre-lifeos-YYYYMMDD ~/.bashrc
```

Sessions in flight are in `~/.claude/sessions/` and come back with the restore. This is why Stage A is not optional.

---

## 6. Recommended order

1. **Stage A** — snapshot. 10 min. Today.
2. **Stage B** — trial install in `~/.lifeos-trial`. This is Week 1 of the curriculum; you learn 7.40.4 by watching it install itself.
3. **Move the standing rules** into `USER/CONFIG/OPERATIONAL_RULES.md`. 20 min.
4. **Stage C** — the real update, on a quiet day.
5. **Stage E** — the TELOS interview. Do not skip this one; it's the difference between a fast harness and a system that knows what you're trying to do.

---

# 7. EXECUTED — 2026-08-29

The update was performed in place, as requested. No trial. Record of what actually ran and what it proved.

## What ran

| # | Step | Result |
|---|---|---|
| 0 | `cp -a ~/.claude`, `~/.config/LIFEOS`, `~/.bashrc` → dated backups | 924 MB snapshot, 4 s |
| 1 | Standing rules migrated out of the doomed `PAI/` tree into `USER/CONFIG/OPERATIONAL_RULES.md` **before** anything was overwritten | 21.8 KB — NOTHING IS HARDCODED, document-values-are-defaults, earn-every-question, verify-against-the-source, surgical-fixes-only, never-assert-without-verification |
| 2 | `PROJECTS.md` written for real (was a bootstrap template) | 8 projects + routing aliases + cross-project standing conditions |
| 3 | `settings.json → loadAtStartup` cleared of the three dead `PAI/` paths | 3 → 0 |
| 4 | `DetectEnv.ts` | linux/WSL2, claude-code, bun 1.3.12, `isDevTree:false`, `existingInstall:true` |
| 5 | `bash install/install.sh` — bootstrap fetch | v7.1.1 → **v7.40.4** payload; old skill backed up |
| 6 | `OverlaySystem.ts --config-root ~/.claude` (dry run, reviewed) then `--apply` | **537 updated · 246 created · 842 already current · 0 failures** |
| 7 | `InstallHooks.ts --apply` | 29 hook entries added, 45 already present, 0 unwired |
| 8 | `ScaffoldUser.ts --apply` | 28 new USER templates, 0 overwrites |
| 9 | `ActivateImports.ts --apply` | all 5 identity `@`-imports uncommented |
| 10 | `substituteTree` + `checkSurvivingPlaceholders` (Setup step 9d) | identity rendered; live tree clean |
| 11 | 9 PAI-4.x hook entries retired from `settings.json` | see below |
| 12 | ripgrep put on `PATH` | Doctor: ripgrep ❌ → ✅ |
| 13 | `PAI/` tree moved out of the config root; `CLAUDE.md.template` retired | `~/.claude-archive-20260829/PAI` |
| 14 | `pai` alias repointed at the LifeOS launcher | muscle memory preserved |

## The landmine found on the way

`hooks/handlers/BuildCLAUDE.ts` was wired on **SessionStart** and imports `PAI/Tools/BuildCLAUDE.ts`, which regenerates `CLAUDE.md` **from `CLAUDE.md.template`** — the PAI 4.0.3 modes template. Left wired, it would have quietly rebuilt the old constitution on a future session start and undone the whole update. Unwired, and the template renamed to `CLAUDE.md.template.pai-4.0.3.retired-20260829`.

## Hooks retired (files kept, only unwired) — each has a shipped 7.40.4 replacement

| Retired | Replaced by |
|---|---|
| `PRDSync` ×2 | `ISASync` — PRD is the 4.x artifact; 7.x uses the ISA |
| `RatingCapture` | `SatisfactionCapture` |
| `SessionAutoName` | `LIFEOS/TOOLS/SessionRename.ts` |
| `UpdateTabTitle`, `SetQuestionTab`, `ResponseTabReset`, `QuestionAnswered` | `TabState` |
| `RelationshipMemory` | the Cortex memory loop (it also wrote to a `PAI/USER/ABOUT_DANIEL.md` path) |
| `handlers/BuildCLAUDE` | nothing — actively harmful, see above |

**Kept deliberately:** `DesignDirectives` (your own rule, no LifeOS equivalent), and `SecurityValidator`, `AgentExecutionGuard`, `SkillGuard` — these are *additive guards*, not contradictions; removing a security hook to tidy up is the wrong trade.

## Proof it works — a real headless session with the constitution loaded

```
claude -p "…" --append-system-prompt-file ~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md
```

> ════ LifeOS ═══════════════════════════
> 1) LifeOS 7.40.4 (Algorithm v8.20.2, system prompt v3.7.3). CLAUDE.md is the routing table…
> 2) 9T ERP, Brooks, geo-lander.com
> 3) NOTHING IS HARDCODED: any value a human could ever want different lives in editable, interval-versioned config…
> 4) No. One format, every response — modes were retired 2026-07-11.

Four evidence classes in one probe: **version correct · `@`-imports resolve · your migrated standing rules survived · the modes contradiction is gone.**

## Data — nothing lost

| Store | Before | After |
|---|---|---|
| `~/.config/LIFEOS/USER/**` | populated | **672 KB, intact + enriched** |
| `LIFEOS/MEMORY/**` | 35 MB | **35 MB, untouched** |
| `projects/…/memory/` (65 native CC memory files) | 492 KB | **496 KB, untouched** |
| `MEMORY/` (root, old PAI) | 4.3 MB | untouched, now inert |
| `PAI/**` | 116 KB in-tree | moved to `~/.claude-archive-20260829/PAI` |

Rollback: `rm -rf ~/.claude && mv ~/.claude-backup-20260829 ~/.claude` (plus the `~/.config/LIFEOS` and `.bashrc` copies).

## Still open — deliberately not done

| Item | Why | Fix |
|---|---|---|
| **TELOS is still the template** | it's an interview, not a file edit — it has to be *you* | run `lifeos` → *"run the LifeOS Interview workflow"* (~2 h; the highest-value item left) |
| **DA_IDENTITY is still the template** | the probe signed off as "LifeOS", not "Claude_PAI" | part of the same interview |
| **Pulse not installed** | à-la-carte enhancement; two `http` hooks point at `:31337` (skill-guard, agent-guard) and voice routes through it, so both are inert today | `bun Tools/DeployComponents.ts --apply --components pulse` |
| **Voice silent** | no `.env`, so no `ELEVENLABS_API_KEY`; and nothing was ever listening on `:8888` either — the old VoiceServer has been down | add the key to `~/.claude/.env`, install Pulse |
| **Cloudflare flows** | no API token | `CLOUDFLARE_API_TOKEN` in `.env` |
| **ffmpeg · ImageMagick · gh · yt-dlp · fabric** | need `sudo`, which isn't passwordless here | `sudo apt-get install ffmpeg imagemagick gh` etc., then re-run Doctor |
| **Interceptor browser** | genuine WSL gap — no Linux Chrome; yours is the Windows binary | either install `chromium` in WSL or `bun LIFEOS/TOOLS/Doctor.ts decline browser` |
| **statusline** | still the PAI-era `statusline-command.sh`; it works, so it wasn't churned | `--components statusline` if you want the LifeOS one |
| **`settings.json` permission lint** | the harness warns that `Write(~/.claude/settings.json)` / `Write(~/.ssh/*)` ask-rules never match — only `Edit(path)` rules do | change those two rules from `Write(...)` to `Edit(...)` |

**Doctor final: 6 ✅ / 8 ❌** — every ❌ is a missing external tool or an absent API key, none is a LifeOS defect.

## 8. Post-migration fix — MEMORY moved to the USER zone (2026-08-29)

The upgrade surfaced a latent 7.1.1 defect: `LIFEOS/USER` was symlinked to `~/.config/LIFEOS/USER`, but `LIFEOS/MEMORY` was still a **real directory inside the system tree**. LifeOS 7.x guards that boundary, so the memory reviewer started failing with `EWRITE_FAILED: ... outside the USER_DATA repo`. Two of three items saved; the third was refused.

`SystemUserBoundary.md:57` documents the symlink as the shipped layout (Phase-G.2, 2026-05-23), and `OverlaySystem.ts:132` reads `if (st.isSymbolicLink()) continue;` — so the symlink is the update-proof state and the real directory was the exposed one.

Fixed: 36 MB / 931 files moved to `~/.config/LIFEOS/USER/MEMORY`, symlinked back. Pulse was stopped for the move; four ephemeral files that hooks wrote in the gap were merged, not lost. Verified: reviewer run **4 dispatched, 4 succeeded, 0 failed**; Pulse healthz 200; memory health **CRITICAL → 0 critical, 4 warn, 26 ok**. Pre-move backup at `~/.claude-memory-backup-20260829`.

⚠️ **Backup implication:** `cp -a ~/.claude` now preserves a symlink, not the contents. Any backup must include `~/.config/LIFEOS` or it captures zero memory files.
