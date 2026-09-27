# Resource Library — deliberately small

> 🔴 **Version drift is the #1 way to learn the wrong thing here.** The current system is **LifeOS 7.40.4**. Most blog posts and videos — including the author's own from 2025 and early 2026 — describe **PAI 4.x/5.x**, which had modes, effort tiers, seven phases, and PRDs. All four were abolished. **Tier 1.5 below is the only fully current source.** Read everything else for philosophy and motivation, never for architecture.

**Rule: one input per day.** More than that is procrastination wearing a lab coat. Everything here is either the primary source or a single good secondary. Nothing is here twice.

Legend: ✅ URL fetched and confirmed live on 2026-08-29 · 🔗 URL taken from a primary source (repo README / search index) · 🔎 no stable URL — search the exact phrase on the named channel.

---

## Tier 0 — Primary documentation (the only thing that never goes stale)

> ⚠️ **The docs moved.** `docs.claude.com/en/docs/claude-code/*` now 301-redirects to **`code.claude.com/docs/en/*`**. Use the new host; old links in blog posts still work but bounce.

| Page | URL | Used in |
|---|---|---|
| **Full docs index (machine-readable)** | <https://code.claude.com/docs/llms.txt> ✅ | W1 |
| Memory & CLAUDE.md | <https://code.claude.com/docs/en/memory> ✅ | W1, W5 |
| Skills | <https://code.claude.com/docs/en/skills> ✅ | W2 |
| Hooks — guide | <https://code.claude.com/docs/en/hooks-guide> ✅ | W3 |
| Hooks — full reference (event schemas, JSON I/O) | <https://code.claude.com/docs/en/hooks> ✅ | W3 |
| Subagents | <https://code.claude.com/docs/en/sub-agents> ✅ | W4 |
| Settings (incl. statusLine, permissions) | <https://code.claude.com/docs/en/settings> ✅ | W6 |
| Plugins (packaging to share) | <https://code.claude.com/docs/en/plugins> ✅ | W7 |
| MCP | <https://code.claude.com/docs/en/mcp> ✅ | D3 |

**When a URL 404s:** fetch `llms.txt` and find the page by title. Don't guess paths.

---

## Tier 1 — Anthropic Engineering (read these once, properly)

| # | Article | URL | Week |
|---|---|---|---|
| A1 | Equipping agents for the real world with Agent Skills | <https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills> ✅ | W2 |
| A2 | Building effective agents | <https://www.anthropic.com/engineering/building-effective-agents> 🔗 | W4 |
| A3 | Effective context engineering for AI agents | <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> ✅ | W5, D4 |
| A4 | Writing effective tools for AI agents | <https://www.anthropic.com/engineering/writing-tools-for-agents> ✅ | D3 |

---

## Tier 1.5 — The 7.x source of truth (read these *in your trial install*, not on GitHub)

After Week 1 Day 1 you have a real LifeOS 7.40.4 tree at `~/.lifeos-trial/`. These files are the current spec. Nothing else on this page is guaranteed to describe the system as it is today.

| File (relative to the install) | What it settles | Week |
|---|---|---|
| `skills/LifeOS/INSTALL.md` | how it installs; additive rules; `--apply` dry-run contract; per-harness honesty table | W1, W7 |
| `skills/LifeOS/Workflows/{Setup,Interview,Update,Uninstall}.md` | markdown as executable procedure — the pattern you'll copy for clients | W1, W7 |
| `LIFEOS/DOCUMENTATION/SystemUserBoundary.md` | the four zones, the four allowed access patterns | W1, W7 |
| `LIFEOS/DOCUMENTATION/CoreComponents.md` | the 23 components, plainly | W1 |
| `LIFEOS/ALGORITHM/v8.20.2.md` | the 16 completion claims, teeth tags, spend doctrine | W4 |
| `LIFEOS/DOCUMENTATION/ISA/ISAFormat.md` | ISA slot shapes, the Splitting and Variation tests | W4 |
| `LIFEOS/RULES/Verification.md` | evidence coverage, temporal fidelity, parity mechanics | W4 |
| `LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` + `LIFEOS/CORTEX_INDEX_POLICY.json` | Cortex tiers and index policy | W5 |
| `LIFEOS/DOCUMENTATION/Testing/TestingDoctrine.md` | what "tested" is allowed to mean | W4, D5 |
| `LIFEOS/TOOLS/Doctor.ts` | capability probing; loud degradation | W6 |
| `skills/LifeOS/Tools/*.ts` (10 installer tools) | the installer you'll clone for the capstone | W7 |


---

## Tier 2 — The author of the thing you're copying

| # | Piece | URL | Week |
|---|---|---|---|
| B1 | Building Your Own Personal AI Infrastructure ⚠️ *PAI-era architecture — read for the why* | <https://danielmiessler.com/blog/personal-ai-infrastructure> ✅ | W1 |
| B2 | Building a Personal AI Infrastructure (Dec 2025) ⚠️ *pre-7.x — modes/tiers shown here are gone* | <https://danielmiessler.com/blog/personal-ai-infrastructure-december-2025> ✅ | W7 |
| B3 | Building Your Own AI-powered Life Management System | <https://newsletter.danielmiessler.com/p/building-your-own-ai-powered-life-management-system> ✅ | W1 optional |
| B4 | **The repo itself** — clone it, it is the best textbook here | <https://github.com/danielmiessler/LifeOS> ✅ | every week |

**How to read B4:** don't read it top to bottom. Each week, open only the part that matches the week —
W1 `install/CLAUDE.template.md` + `DOCUMENTATION/CoreComponents.md` · W2 `skills/*/SKILL.md` · W3 `Tools/InstallHooks.ts` · W4 `ALGORITHM/v8.20.2.md` + `DOCUMENTATION/ISA/ISAFormat.md` · W5 `DOCUMENTATION/Memory/MemorySystem.md` + `CORTEX_INDEX_POLICY.json` · W6 `PULSE/` · W7 `Tools/*.ts` + `Workflows/Setup.md` + `DOCUMENTATION/SystemUserBoundary.md`.

---

## Tier 3 — Video (watch at 1.5×, one per week maximum)

| # | Video | URL | Week |
|---|---|---|---|
| V1 | LifeOS walkthrough — the author's own tour | <https://youtu.be/Le0DLrn7ta0> 🔗 | W1 |
| V2 | Build the Ultimate Personal AI Infrastructure / Life Operating System | <https://www.youtube.com/watch?v=e0UlR2QdczU> 🔗 | W6 |
| V3 | PAI v5.0.0 — ships a Life OS on Claude Code ⚠️ *v5 architecture, superseded by 7.x* | <https://www.youtube.com/watch?v=qEGItnB4VYI> 🔗 | W7 |
| V4 | IndyDevDan — channel (credited in the LifeOS README as an influence) | <https://www.youtube.com/@indydevdan> ✅ | W2, W3, W4 |
| V5 | Anthropic — official channel | <https://www.youtube.com/@anthropic-ai> ✅ | W5 |
| V6 | Anthropic webinar — Claude Code advanced patterns | <https://website.anthropic.com/webinars/claude-code-advanced-patterns> 🔗 | W4 |

**🔎 Exact search phrases** (channel search, not YouTube-wide — YouTube-wide is where you lose an hour):
- W2 → `I finally CRACKED Claude Agent Skills` on V4
- W3 → `Claude Code hooks` on V4
- W4 → `Claude Code subagents` on V4
- W5 → `context engineering` on V5

---

## Tier 4 — Working code to read (better than any tutorial)

| # | Repo / path | Why | Week |
|---|---|---|---|
| C1 | `~/.claude/hooks/` — your own 51 hooks | real, production, already running on your machine | W3, W5 |
| C2 | `~/.claude/skills/CreateSkill`, `ISA`, `Telos` | the shape to copy | W2, W4 |
| C3 | disler/claude-code-hooks-mastery | the standard hooks teaching repo | <https://github.com/disler/claude-code-hooks-mastery> ✅ · W3 |
| C4 | anthropics/skills | official skill examples | <https://github.com/anthropics/skills> ✅ · W2 |
| C5 | agentskills.io — the open SKILL.md standard | portable across Claude Code / Codex / others | <https://agentskills.io> 🔗 · W2, D8 |

---

## Tier 5 — Secondary explainers (use only if the primary didn't land)

| Topic | Source |
|---|---|
| The five layers, explained plainly | alexop.dev, *Understanding Claude Code's Full Stack* — <https://alexop.dev/posts/understanding-claude-code-full-stack/> ✅ |
| Hooks, worked examples | DataCamp — <https://www.datacamp.com/tutorial/claude-code-hooks> ✅ |
| Hooks, full event/handler reference | hidekazu-konishi.com — <https://hidekazu-konishi.com/entry/claude_code_hooks_complete_guide.html> ✅ |
| Agent SDK, hands-on | hidekazu-konishi.com — <https://hidekazu-konishi.com/entry/claude_agent_sdk_complete_guide.html> ✅ · D2 |

---

## Anti-resources — do not spend time here in Phase 1

- ❌ LangChain / LangGraph / CrewAI / AutoGen tutorials. Different paradigm, zero transfer to what you're building.
- ❌ "Top 50 Claude Code tips" listicles. You need five primitives, not fifty tips.
- ❌ Prompt-engineering courses. The bottleneck is architecture, not wording.
- ❌ Building your own model / fine-tuning. Not on this path.
- ❌ Reading LifeOS end-to-end in week 1. 1,989 files. Read the week's slice only.
- ❌ **Copying anything with modes, effort tiers, seven phases, or a PRD.** That's PAI 4.x. It was deliberately removed. If a tutorial teaches it, it's out of date.
