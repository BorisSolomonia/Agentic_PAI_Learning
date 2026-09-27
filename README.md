# Learning: build a LifeOS-class AI system

## Interactive visual guide

Double-click **[OPEN-ENGINE-ROOM.cmd](OPEN-ENGINE-ROOM.cmd)** to open **Engine Room v2**: six parts in a guided order (the three layers → session start → one prompt end to end → the 25 parts → build one → the distribution agent). Every step carries the same nine fields, a **Strip LifeOS** switch shows the bare Claude Code path, the file tree lights up as steps touch files, and 103 terms are defined inline. Generated from **your** install (names, sizes and wiring only, never contents). Source: `build/engine-room-v2/`; the old app is preserved untouched at `build/engine-room/`. Gap analysis that produced it: [ENGINE-ROOM-GAPS.md](ENGINE-ROOM-GAPS.md).

Rebuild after editing content: `cd build/engine-room-v2 && bun scripts/inventory.ts && bun scripts/build.ts` (the build runs `validate.ts` first and refuses to ship a step with a missing field or a dead path).

Five files. Read them in this order.

| File | What it is | Who writes it |
|---|---|---|
| **[ANALYSIS-LifeOS-vs-PAI.md](ANALYSIS-LifeOS-vs-PAI.md)** | What `danielmiessler/LifeOS` (7.40.4) is, and exactly how it differs from the PAI 4.0.3 running in `~/.claude` | me, from a real clone + diff |
| **[MIGRATION-PAI-to-LifeOS.md](MIGRATION-PAI-to-LifeOS.md)** | How to move your live install to LifeOS 7.40.4 without losing anything — what's overwritten, what's orphaned, what's safe, and the rollback | me, from your machine + the shipped installer docs |
| **[CURRICULUM.md](CURRICULUM.md)** | The plan. Hours per phase, per stage, per week. Weekly build deliverables and binary gates. **Targets LifeOS 7.40.4, not PAI 4.x.** | me, rewritten from your logs |
| **[RESOURCES.md](RESOURCES.md)** | The whole reading/watching list — deliberately small, one input per day, verified URLs | me |
| **[PROGRESS.md](PROGRESS.md)** | Your daily log, gate results, score, confusions, retros, and the curriculum changelog | **you** (I score and summarise) |
| `build/` | Everything you actually build | you + Claude |

## The contract

**You do:** the 2 h daily loop, and one row in `PROGRESS.md` per day. That's it.
**I do:** rebalance hours, swap resources that didn't land, cut stages you've already outgrown, and log every change in the changelog.

## Starting

1. Read `MIGRATION-PAI-to-LifeOS.md` §1 — your machine is not in the state either of us assumed.
2. Run **Stage A** (the snapshot). 10 minutes, today, regardless of everything else.
3. `mkdir build` and clone the reference:
   `git clone --depth 1 https://github.com/danielmiessler/LifeOS build/lifeos-reference`
4. Start Week 1, Day 1 — which *is* the trial install (`CLAUDE_CONFIG_DIR=~/.lifeos-trial`). Learning and migrating are the same first step.

## The one rule

**Never build directly in `~/.claude` until Week 7.** Your live install is production — six client projects run through it. Break it and you lose days you don't have. Phase 1 builds go in `build/myos/`; the LifeOS you're studying goes in `~/.lifeos-trial/` via `CLAUDE_CONFIG_DIR`. The live tree is touched exactly once, deliberately, at Migration Stage C.
