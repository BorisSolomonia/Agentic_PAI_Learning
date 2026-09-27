# How this course is structured, and why

**Written 2026-09-19 for the v6 course (1 hour a day, build LifeOS by doing).** This file answers one
question before any step is written: *of the ways people learn to build things by doing, which one
fits Boris, and what does it cost?* The steps themselves live in `COURSE.md`.

---

## 1. What I know about how you learn (evidence, not guesses)

| Trait | Evidence from our work | What it demands of the course |
|---|---|---|
| **Visual first** | "you removed all the visualizations, that's a huge mistake" (Engine Room, 2026-09-11) | Every step opens with a picture of where you are in the machine, not a paragraph |
| **Do → fail → learn** | The eight principles you brought (2026-09-07); "it is impossible to learn the way you offered, start by doing" | Practice gets most of each hour; every step breaks something on purpose |
| **Structure before building** | "my main flow is to have structures first; 9 Tones was built incorrectly and I spent a lot to correct it" (Q3.3) | The whole system's shape is drawn on day 1, and every step names where its piece sits |
| **Details are the most important** | Q2.3; "you have to measure correctly to govern correctly" | Every file you create is explained line-group by line-group, and commented |
| **Repeated mistakes are deadly** | Q2.5, trust lost through repetition | A failure log that is re-read at every checkpoint; the same gap twice triggers a re-drill |
| **Builds with AI, doesn't hand-author** | "I don't need to read TS to debug it if I build it with AI" (2026-08-29) | You direct and verify; the AI writes; but you must be able to *read* what was written |
| **Crisis-biased, mornings slip** | Q2.6; sessions start ~13:30, run past midnight on half of days | One fixed hour, same time, a hard stop; steps that fit the hour, never spill |
| **Wants measurable progress** | first brief: "daily and weekly measurable progress" | Each step ends in a command whose output is pass or fail; nothing else counts |
| **Goal: build similar agents ASAP, with confidence** | first brief; RS.GE Agent is priority #1 and named "the practice ground" | The course must transfer to the RS.GE Agent, not stay a toy |

---

## 2. Five ways to learn building by doing, stress-tested against that profile

Scores are 1–5 on four criteria: **Fit** (matches the traits above), **Speed** (hours to confident
building), **Confidence** (does it produce the ability to build alone), **Risk** (5 = lowest risk of
stalling or shallow learning).

| # | Structure | What it is | Fit | Speed | Conf. | Risk | Total |
|---|---|---|---|---|---|---|---|
| 1 | **Cognitive apprenticeship** (Collins, Brown & Newman, 1989) | Expert models the work out loud, learner does it with coaching, scaffolding is withdrawn on a schedule ("fading") until the learner works alone | 5 | 4 | 5 | 4 | **18** |
| 2 | **Whole game first** (Perkins, *Making Learning Whole*, 2009; fast.ai's top-down method) | Play a junior version of the whole game on day one, then work on the hard parts, never learn a part without the whole in view | 5 | 5 | 3 | 4 | **17** |
| 3 | **Deliberate practice** (Ericsson, *Peak*, 2016) | Isolate one subskill, drill it with immediate feedback at the edge of ability, repeat until automatic | 3 | 3 | 5 | 3 | **14** |
| 4 | **Kata / breakable toys** (Dave Thomas's code kata; Hoover & Oshineye, *Apprenticeship Patterns*, 2009) | Rebuild the same small thing from scratch repeatedly, timed, in a sandbox where breaking it costs nothing | 4 | 3 | 5 | 4 | **16** |
| 5 | **Mastery learning + spaced retrieval** (Bloom, 1968; Bjork's desirable difficulties) | Do not advance until the current unit is passed; recall from memory at growing intervals instead of re-reading | 4 | 2 | 4 | 5 | **15** |

**Where each one breaks for you, specifically:**

- **Apprenticeship alone** has one failure mode and it is yours: fading never happens. "You direct, I
  write, you verify" is the apprenticeship's *first* stage, and it is comfortable. If the course
  never withdraws me, you finish 60 hours able to direct and unable to build.
- **Whole game alone** produces a working system fast and a shallow understanding of its parts; it
  is how most people "learn" AI agents in a weekend and cannot rebuild one a month later.
- **Deliberate practice alone** is drills without a product; it violates your structure-first and
  build-the-real-thing instincts and it is boring, which kills a one-hour-a-day habit.
- **Kata alone** is repetition without a map; you would rebuild hooks beautifully and never know
  where hooks sit in the whole.
- **Mastery alone** is slow and, for a crisis-biased schedule, a missed day becomes a missed week.

---

## 3. The pick: apprenticeship with a fading schedule, inside a whole-game frame, gated by mastery, with kata rebuilds at checkpoints

One spine, three supports. Each one covers the others' failure mode.

**The spine: cognitive apprenticeship with fading written into the calendar.** Every step has a
**fade level**, and the level only goes up:

| Level | Who does what | When |
|---|---|---|
| **F0 · Watch** | I build it and narrate every file; you run the proof | Days 1–3 only |
| **F1 · Direct** | You write the prompt; I build; you read every file and run the proof | Part 1 |
| **F2 · Specify** | You write the spec (what the file must do, what would prove it wrong); I build; you find one thing I got wrong before you run the proof | Parts 2–3 |
| **F3 · Edit** | I build a version with one deliberate defect; you find it and fix it, with me only answering questions | Parts 3–4 |
| **F4 · Build** | You build it with any AI you like; I only verify and grade | Parts 5–7 |
| **F5 · Teach** | You explain the piece to a stranger (the Feynman test) and rebuild it timed | Every checkpoint |

The level a step sits at is printed on the step. That is the single most important number in the
course, because it is the one that turns "built with AI" into "can build".

**Support 1: whole game first (Perkins).** Day 1 ends with a three-file system that runs end to end:
a context file, one skill, one hook that blocks. Ugly, tiny, real. Every later step is "make one part
of the machine you already have better", never "learn a part you have not seen working". The Engine
Room app is the picture of the whole game; each step points at its station.

**Support 2: mastery gates, with a rule for missed days.** A step is passed when its proof command
passes and its recall block is answered closed-book. Not passed means the next day repeats it; the
plan moves, the sequence does not. **Missed-day rule:** a missed day is not made up. The plan slides
one day. Two misses in a week trigger a 20-minute "rebuild yesterday" session instead of a new step,
because the cost of a gap is forgetting, and the cure is rebuilding, not catching up.

**Support 3: kata rebuilds at every checkpoint.** At the end of each part, one hour: blank folder,
timer, rebuild the part's core from memory with AI, target time printed on the step. The gap between
your time and the target is the honest confidence number, and it is the only number the course
reports upward.

**What is not in the pick, and why:** no reading days (your rule), no video (cannot verify
timestamps from this machine, so none are given), no lectures longer than the ten-minute Orient
block at the top of each step.

---

## 4. Tools that already do part of this

- **`/teach` (Matt Pocock's catalog, installed here).** A teaching workspace with a `MISSION.md`,
  per-lesson HTML pages, and `learning-records/` that work like our failure log. It is user-invoked:
  you type `/teach <topic>` inside a folder. It is a good fit for a *single* concept you want drilled
  in one session (e.g. "hooks that block"), and a poor fit for a 60-hour sequenced course. I use its
  learning-record idea; the course itself stays in markdown you can read anywhere.
- **`/grill-me` and `/wizard`** (same catalog) are for shaping a half-formed idea by questioning. Useful
  at F2, when you write a spec and want it attacked before I build.
- **The Engine Room app** is the map. Every step names the station to look at.

---

## 5. Size of the course (estimates, to be fixed by your answers)

| Scope | Steps (1 h each) | Calendar at 1 h/day, 5 days/week | Confidence target at the end |
|---|---|---|---|
| **Core five boxes** (context · skills · hooks · memory · verification) | ~35 | 7 weeks | rebuild the core from a blank folder in one afternoon |
| **Core + visible + giveable** (adds dashboard, doctor, statusline, installer, README) | ~50 | 10 weeks | ship it to one other person |
| **Everything shipped in LifeOS** (adds Atlas, Ledger, Synapse/Conduit, voice, Pulse in full) | ~70 | 14 weeks | maintain a fork of LifeOS itself |

*To build the same thing professionally, with AI, knowing exactly what you want:* roughly 25–35 hours
for the core, 45 for the giveable version. The course costs about a third more than a build, because
a third of every hour is breaking, recalling and rebuilding, which is the part that makes it stick.

---

## 6. How a step is laid out (the contract every step in `COURSE.md` keeps)

```
Step N · <title>                                   fade F2 · 60 min · station: <engine station>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHERE YOU ARE      the machine so far, drawn; the piece you add today highlighted
WHAT · WHY         what you are building, why the system needs it, in kid words        (5 min)
REAL WORLD         the same mechanism in a warehouse / hospital / kitchen              (2 min)
HOW                the mechanism, then the file(s), each explained + commented         (8 min)
BUILD              the prompt (or spec, or the defect hunt, per fade level)            (25 min)
BREAK              predict → break → read the error → fix → log the gap               (10 min)
PROVE              the one command; its output decides pass/fail                       (5 min)
RECALL             closed book, three questions                                        (5 min)
FILES CREATED      every file: name · why it exists · how it works · commented?
MEASURE            what goes in PROGRESS.md today (one line, one number)
```
