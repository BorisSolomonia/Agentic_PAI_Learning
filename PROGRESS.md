# Progress — the measured record

**This file is the input to everything.** I read it before I change the curriculum. If it isn't logged, it didn't happen.

---

## 0. Knowledge baseline

*Filled in at kickoff. Rewritten only when a gate proves the estimate wrong.*

### 0.1 What I inferred from ~10 months of prior work together

| Area | Estimated level | Evidence |
|---|---|---|
| Directing AI to build real software | **Expert** | 9T ERP, BachmannLogi, Brooks, Optimo, Tasty, GirchiFin — all built via Claude Code |
| Backend concepts (Spring Boot, Postgres, Flyway, Maven/Gradle, REST, tests) | **Strong (as director)** | migration checksum rules, CORS/WebConfig gotchas, golden-baseline diffs, surefire report traps |
| Frontend (Next.js, React, charts) | **Strong (as director)** | prod `next start` restart discipline, dataviz decisions, dual-axis rules |
| Ops (WSL↔Windows, Docker, Railway, Cloudflare, git flow) | **Strong** | Railway CLI, `git.exe push`, docker exec psql, port hygiene |
| Data/analytics modelling | **Expert (domain)** | GL account_role registry, CCC/DSO/DPO, bitemporal rule tables, cash-flow forecasting |
| **Writing TypeScript by hand** | **Not applicable — by choice** | confirmed 2026-08-29: builds with AI, does not hand-author. Phase 1 requires none. |
| **Claude Code hooks** | **None (confirmed)** | `DesignDirectives.hook.ts` exists but I wrote it — W3 stays at full 12 h |
| **SKILL.md authoring** | **None (confirmed)** | uses ~66 skills daily, has authored zero — W2 stays at full 10 h |
| **Subagents / delegation design** | **Medium** | you request parallel work but haven't specified agent files |
| **MCP servers** | **Unknown** | you use Linear MCP; unclear if you've built one |
| **Agent SDK / headless agents** | **Unknown** | no evidence either way |
| **Evals** | **Low** | no eval work seen |
| **LifeOS architecture (ISA, Cortex, Arbol, Atlas…)** | **Low** | asked what the difference is |
| **Your actual install state** | **Hybrid — corrected 2026-08-29** | LifeOS **7.1.1** fully installed and live (`lifeos` alias, USER symlink populated, `LIFEOS/MEMORY` 35 MB / 291 files in 9 days) **under a PAI 4.0.3 `CLAUDE.md`**. See `MIGRATION-PAI-to-LifeOS.md` §1. |
| **TELOS** | **Never filled in** | all `TELOS/` files still the 2026-07-13 templates — the intent layer the system runs on is empty |

**Working assumption for the plan:** *very strong director, unknown hand-coder, low on the five extension primitives.* Phase 1 leans on directing (your strength) to build the primitives; Phase 2 makes you the hand-coder.

### 0.2 What I confirmed (your answers)

> _To fill in. Correct anything above that's wrong — each correction removes or adds hours._

*Answered 2026-08-29.*

| Question | Your answer | Effect on plan |
|---|---|---|
| Hours per week available? | **~10 h — 2 h × 5 days** | Phase 1 = 8 calendar weeks, Phase 2 = 10 |
| Ever written a `SKILL.md` yourself? | **No — only directed** | W2 stays at full **10 h** |
| Ever written a hook yourself? | **No — only directed** | W3 stays at full **12 h** |
| Can you write & debug TypeScript unaided? | **"I don't need to read it to debug it if I build it with AI"** | Phase 1 needs **zero** hand-coding. D1 shrinks **12 h → 8 h** and is re-aimed at *read & verify*, not author. Reasoning in `CURRICULUM.md` §4. |
| Have you built an MCP server? | *unanswered* | D3 stays for now — tell me if you have |
| Do you know what an ISA / PRD-with-probes is? | *partly — you run PAI's PRD daily* | W4 stays; ISA-specific parts only |
| Bun installed and working? | *unverified* | **W3 blocker — check before Week 3** |
| Capstone org? | **9T ERP** | W7 targets reconciliation / debtors / month-close |

---

## 1. Daily log

**One row per build day.** `Conf` = 1–5, how well you could rebuild it tomorrow from scratch. `TB` = teach-back: 🟢 explained cleanly in 3 sentences / 🟡 needed notes / 🔴 couldn't.

| # | Date | Wk·Day | Planned h | Actual h | Input used | Artifact (path) | Check output | Conf | TB |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | W1·D1 | 2 | | | | |
| | | | |
| 2 | | W1·D2 | 2 | | | | | | |
| 3 | | W1·D3 | 2 | | | | | | |
| 4 | | W1·D4 | 2 | | | | | | |
| 5 | | W1·D5 | 2 | | | | | | |
| 6 | | W2·D1 | 2 | | | | | | |
| 7 | | W2·D2 | 2 | | | | | | |
| 8 | | W2·D3 | 2 | | | | | | |
| 9 | | W2·D4 | 2 | | | | | | |
| 10 | | W2·D5 | 2 | | | | | | |
| 11 | | W3·D1 | 2.4 | | | | | | |
| 12 | | W3·D2 | 2.4 | | | | | | |
| 13 | | W3·D3 | 2.4 | | | | | | |
| 14 | | W3·D4 | 2.4 | | | | | | |
| 15 | | W3·D5 | 2.4 | | | | | | |
| 16 | | W4·D1 | 2.4 | | | | | | |
| 17 | | W4·D2 | 2.4 | | | | | | |
| 18 | | W4·D3 | 2.4 | | | | | | |
| 19 | | W4·D4 | 2.4 | | | | | | |
| 20 | | W4·D5 | 2.4 | | | | | | |
| 21 | | W5·D1 | 2 | | | | | | |
| 22 | | W5·D2 | 2 | | | | | | |
| 23 | | W5·D3 | 2 | | | | | | |
| 24 | | W5·D4 | 2 | | | | | | |
| 25 | | W5·D5 | 2 | | | | | | |
| 26 | | W6·D1 | 2 | | | | | | |
| 27 | | W6·D2 | 2 | | | | | | |
| 28 | | W6·D3 | 2 | | | | | | |
| 29 | | W6·D4 | 2 | | | | | | |
| 30 | | W7·D1 | 3 | | | | | | |
| 31 | | W7·D2 | 3 | | | | | | |
| 32 | | W7·D3 | 3 | | | | | | |
| 33 | | W7·D4 | 3 | | | | | | |
| 34 | | W7·D5 | 2 | | | | | | |

---

## 2. Weekly gate scorecard

| Wk | Gate | Attempted | Result | Evidence (paste the real output) |
|---|---|---|---|---|
| 1 | Cold-start test — 5/5 questions right, zero prompting | | ⬜ | |
| 2 | Unnamed trigger — skill fires on 3/3 natural phrasings | | ⬜ | |
| 3 | The wall — forbidden action blocked 3/3 + all logged | | ⬜ | |
| 4 | Honest run — the planted false claim is caught by the gate | | ⬜ | |
| 5 | Two sessions — Monday's fact used on Friday, unprompted | | ⬜ | |
| 6 | Show someone — a non-technical person narrates the dashboard | | ⬜ | |
| 7 | Handover — someone else installs it and completes a task | | ⬜ | |

**Phase 1 exit:** ⬜ all 7 gates green.

---

## 3. Running score

| Metric | Target | Current |
|---|---|---|
| Gates passed | 7/7 | 0/7 |
| Artifacts shipped | ≥ 35 | 0 |
| Hours logged | ≥ 70 / 78 | 0 |
| Teach-back green rate | ≥ 80 % | — |
| First-pass direction rate (first instruction → artifact passes the check) | ≥ 50 % by W7 | — |

---

## 4. Open confusions

*Anything you didn't understand. One line each. I convert every line here into either a replacement resource or an extra day — a restatement of the same source is not an answer.*

| # | Date | What I didn't get | Resolved by | Date closed |
|---|---|---|---|---|
| | | | | |

---

## 5. Weekly retro (10 min, after each gate)

Answer four questions. Terse is fine.

1. What took longer than planned, and why?
2. What resource was a waste of time?
3. What did I build that I could **not** rebuild tomorrow?
4. What do I now want that isn't in the curriculum?

| Wk | 1. Overran | 2. Wasted | 3. Can't rebuild | 4. Want added |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |

---

## 6. Curriculum changelog

*Every change to `CURRICULUM.md`, with the reason and the source of the reason. This is how the learning path improves — no silent edits.*

| Date | Change | Reason | Triggered by |
|---|---|---|---|
| 2026-08-29 | v1.0 created — Phase 1 (78 h / 7 wk) + Phase 2 (96 h / 8 stages) | initial build | Boris's brief |
| 2026-08-29 | v1.1 — calendar fixed to 10 h/wk; capstone named **9T ERP** with its three real skills and two real guard hooks; W2 + W3 confirmed at full length | baseline answered: has directed but never authored a skill or hook | AskUserQuestion |
| 2026-09-01 | **v4.0 — CHAPTERS.md replaces the step list as the primary path.** Build-first: 42 one-hour chapters, each shipping a working piece of a personal LifeOS clone, arranged in 7 parts. Every chapter states Why / Where you are / Where you'll be / Do / Proof / Learned. Chapters 1-6 written in full; later parts written as he reaches them | you said learning by reading was the wrong shape and to start by doing | your message |
| 2026-09-01 | Build decisions locked: **personal LifeOS clone** · **Boris directs, Claude writes, Boris verifies** · **1-hour chapters** · **built on Claude Code** | AskUserQuestion | your answers |
| 2026-08-30 | **v3.0 — rebuilt as 24 numbered rookie steps** with a verified source RANGE on every step (exact sections to read, and what to skip). Phase 1 cut 78 h → 62 h because the install/repair work already happened for real. Course search done: no LifeOS course exists; three Claude Code courses listed with a recommendation to skip them | you asked for step-by-step with precisely-scoped sources | your message |
| 2026-08-30 | Video sources **removed from the core path**. YouTube blocks transcript fetching here and the pages expose no chapter markers, so I could not verify a single timestamp. Inventing one would break the rule the request was made to enforce | honesty over coverage | verification attempt failed |
| 2026-08-30 | Rule **"SOURCE RANGES, NEVER WHOLE SOURCES"** written into `USER/CONFIG/OPERATIONAL_RULES.md` so it applies to every future answer, not just this file | you said this approach must be learned for the future | your message |
| 2026-08-29 | v2.0 — **curriculum retargeted from PAI 4.x to LifeOS 7.40.4**: new §5 concept-mapping table; W1 rebuilt around a zero-risk trial install (`CLAUDE_CONFIG_DIR`), the four SYSTEM/USER/INTERFACE/RUNTIME zones, and the split constitution (system prompt + launcher); W4 now teaches the four 8.x rules with HOOK/CHECK/SELF teeth; W5 renamed Cortex-shaped; W6 gains a Doctor; W7 installer follows the dry-run/`--apply` contract | you asked to learn the current version, not the old one | your message |
| 2026-08-29 | v2.0 — `RESOURCES.md` gains **Tier 1.5** (the 7.x source of truth, read inside your own trial install) + version-drift warnings on every PAI-era article and video | most public material describes the abolished architecture | discovery while verifying sources |
| 2026-08-29 | v1.1 — **D1 cut 12 h → 8 h** and re-aimed from *author TypeScript* to *read & verify TypeScript*; Phase 2 total 96 → **92 h**; scoring metric "unassisted rate" replaced with **"first-pass direction rate"** | you build with AI and don't hand-author — the metric was measuring a skill you're deliberately not acquiring | your answer, verbatim |
| 2026-09-07 | **v5.0 — CHAPTERS.md rebuilt around 8 learning principles.** Added Chapter 0 (the agent map, 5 boxes). Every chapter gained **Capability / Orient / Break it on purpose / Recall / Transfer**; Build capped at 25 min. New `build/notes/FAILURES.md` + failure review at each checkpoint decides what comes next. Arc reorganised by the 5 boxes. 42 h → 43 h | you couldn't see why stage 1 mattered, where it sat in an agent, or what alternatives existed; and you wanted do → fail → learn instead of read → build | your message, verbatim |
| 2026-09-11 | **Engine Room v2 built** (`build/engine-room-v2`, launcher repointed). Six guided parts; every step/component has 9 fields (purpose · who 🟦🟩🟨⬜ · trigger · input→output with real payload shapes · files lit read/write · how + source · alternatives · why · two field examples incl. distribution); Strip-LifeOS toggle; inventory generated from the real install, redacted; 25 component pages written by three delegates from source and validated on disk; 103-term inline glossary; real-Chrome verified | the old app was a parts catalog, not a teaching app; you listed 14 requirements, it met 2 (see ENGINE-ROOM-GAPS.md) | your message, verbatim |
| 2026-09-11 | **Engine Room v2: the live engine added.** Animated diagram above every flow (21 stations coloured by layer, wires, a token that travels each move's hops, ▶ play / step / speed, car-ignition caption per move); Part 3 lights each component's home; Part 0 shows the whole machine; Strip-LifeOS greys the 🟩 stations. Nothing removed | you: "you removed all the visualizations, that's a huge mistake" — correct, v1's engine drawing and animated request were its spine | your message, verbatim |
| 2026-09-19 | **v6.0 — COURSE.md: 65 one-hour steps, 1/day, 3 stages (core 35 · visible+giveable 15 · rest-except-voice 15), every step with a LifeOS→RS.GE mirror line and a fade level F0–F5; LEARNING-STRUCTURE.md scores 5 learning-by-doing structures and picks apprenticeship-with-fading + whole-game + mastery gates + kata; Linear project *Learning agents* holds deadlines; week 1 (steps 1–5) written in full | you asked for 1 h/day steps with total hours, what/where/how/why + real-world example per step, every AI-written file explained and commented, measurable daily progress, and the 5 best structures stress-tested against how you learn | your message + 4 answers, verbatim |
| 2026-09-24 | **v6.1 — COURSE.md: Step 6 and Part 2 (steps 7–13) written in full**, with Appendices A and B. Part 2 grows one capability all week (`sales-brief` over a synthetic 9 Tones-style sales file: skill → measured trigger → script + awk check → a hostile second export read through a map → `/brief` → a reconciler subagent → checkpoint + bank-statement kata). New in every step: **COMPARE** (alternatives, and the same feature in Codex, Gemini CLI, Cursor, Copilot and frameworks, every row with a vendor source checked 2026-09-24; notes in `research/01…05`), **HOW IT REALLY WORKS** with where each piece lands in the request, ✋ **YOUR HANDS** edits, commands-explained tables. Five week-1 corrections: the step-1 guard never worked (syntax error, exit 1, fails open); every session also loaded your real LifeOS (fixed with `--setting-sources project,local` in the alias); step 3's RS.GE mirror was wrong; `@` imports go four hops, not one; step 5's BREAK now backs up first. Rule 3: fade rises within a part. PATH KEY and contents added. Linear: BOR-133..135 moved to 25, 28, 29 Sep; BOR-140..147 created for steps 6–13 (30 Sep – 9 Oct); BOR-148 opened in RS.GE_Agent for the same leak in the agent loop | you: "it has to be continued, think more for next steps, make more doing oriented, slightly more explanations, show more alternatives, how these features are implemented in other agent systems"; the corrections come from measuring your files on 2026-09-24 | your message, verbatim + measurement |
| 2026-09-25 | **v6.1 review fixes.** An independent reviewer read Part 2 cold (report: `~/.claude/LIFEOS/MEMORY/WORK/course-v6-part2-continuation/review-part2.md`); every finding re-checked before fixing. Step 8's runner feeds `</dev/null` to `claude`, which otherwise swallowed the rest of the test file and ran one test instead of eight; the CSV keeps its column row (only the WHY/HOW block is dropped); every hand edit of `settings.json` is checked with `jq empty`, since an invalid file is silently ignored in headless runs; the planted-defect builds in steps 11–12 run headless and blind, sealed answers in `tests/`; step 6.6 also switches off Claude Code's own auto memory (`autoMemoryEnabled: false`); the failure-review pattern counts entries like `## 10.3`; step 8's paths-gate break runs FIRE lines only; smaller wording fixes in 6.5, 6.7, 10, 13.3, 13.4 | a second look found a step that would silently run one test in eight, and a "blind" plant that the edit prompts would have shown | independent review, re-verified |
| 2026-09-25 | **v6.2 — CHECKLIST.md, marks, and ALTERNATIVES.md.** `CHECKLIST.md` holds the must-never-forget rules (24 to start, each with why, a check command, where it lives in LifeOS and the RS.GE Agent, and its decision). You add to it by ending any course line with `<!-- ck -->`: `tools/checklist.ts` finds the marks (dry run by default, `--apply` files them into the Inbox and stamps each mark with its CK number), and the new LifeOS hook `CourseChecklist.hook.ts` tells me at every session start when marks are waiting, so I file them the same session (rule in OPERATIONAL_RULES). `ALTERNATIVES.md` holds 23 design decisions (D1–D23) across every part of the course, each with how every option is built, gains, costs, and a verdict for a personal system versus a product. Every written step now names its decisions; steps 3–5 got a short alternatives table (their BUILD and BREAK each gave up minutes to make room). Course rules 8 and 9 | you: "I need checklist file that lists very important details…", "action logic based on which you will detect what has to be in this document", "this course must teach me alternatives… the same must be done for each part" | your message, verbatim |
| | | | |

---

## 7. Evidence vault

Paste raw command output here rather than in the tables — the tables should stay readable. Reference by day number.

<details><summary>Day 1</summary>

```
```
</details>

---

## 8. v6 daily log (COURSE.md) — one line per step, the only input to the next week

`Pass` = proof command passed AND recall answered closed-book. `Recall` = questions answered without looking, out of the step's own count (3 in week 1, 4 from step 7, 9 at step 6, 8 at step 13). `Fade` = the level printed on the step. **Missed day:** write the date and `—`; two `—` in one week trigger a 20-min rebuild session before the next step.

| Step | Date | Pass | Proof output (paste the deciding line) | Recall | Fade | Min | FAILURES.md category logged |
|---|---|---|---|---|---|---|---|
| 1 | | | | /3 | F0 | | |
| 2 | | | | /3 | F1 | | |
| 3 | | | | /3 | F1 | | |
| 4 | | | | /3 | F1 | | |
| 5 | | | | /3 | F2 | | |
| 6 | | | | /9 | F5 | | |
| 7 | | | | /4 | F1 | | |
| 8 | | | | /4 | F2 | | |
| 9 | | | | /4 | F2 | | |
| 10 | | | | /4 | F2 | | |
| 11 | | | | /4 | F3 | | |
| 12 | | | | /4 | F3 | | |
| 13 | | | *(also: top failure category → how Part 3 opens)* | /8 | F5 | | |
