import type { Component } from '../schema';

export const component: Component = {
  id: 'conduit',
  name: 'Conduit',
  box: 'context',
  status: 'Code shipped. The capture command, the installer, the hourly read and the dashboard module all ship in the public release. It is opt-in and switched off until you install it, its scheduler is macOS-only as written, and its data directory does not exist until you run it.',
  summary: 'A quiet recorder of where your attention actually went today, so the system can compare what you did against what you said you wanted.',
  purpose: 'The system already knows your [[ideal state]] from [[TELOS]], but had no idea what you actually do all day, so it could not answer whether you are working on the right things. [[Conduit]] supplies the missing half: an observed record of where attention went.',
  who: 'lifeos',
  trigger: 'A [[launchd]] job named `com.lifeos.conduit` runs `conduit capture` every 120 seconds. A second hourly job runs the content-type read. Nothing here is triggered by a [[prompt]] or by you, which is the point: it has to run whether or not anyone is watching.',
  input: 'Three adapters, each fault-isolated so one failing does not stop the others: which application is in front, new commits in the repositories you listed, and coding sessions read from the work event log.',
  output: 'One [[JSONL]] line per signal in an append-only daily file, then a single [[deterministic]] daily record in both machine and human form. That record feeds [[Cortex]], the dashboard, and the observed side of the gap computation.',
  files: [
    { path: 'LIFEOS/PULSE/Conduit/conduit.ts', mode: 'exec', note: 'the CLI: capture, rollup, today, status, init' },
    { path: 'LIFEOS/PULSE/Conduit/InstallConduit.ts', mode: 'exec', note: 'installs and loads the scheduled job, or removes it' },
    { path: 'LIFEOS/PULSE/Conduit/BuildInsight.ts', mode: 'exec', note: 'the hourly content-type read, the only part that calls a model' },
    { path: 'LIFEOS/PULSE/modules/conduit.ts', mode: 'exec', note: 'the read-only dashboard API; holds zero data of its own' },
    { path: 'LIFEOS/TOOLS/UpdateLifeosState.ts', mode: 'exec', note: 'folds the observed signal into the state file the dashboard rings read' },
    { path: 'LIFEOS/USER/CONDUIT', mode: 'read+write', virtual: true, note: 'config, raw events and daily records; created by conduit init and absent until then' },
  ],
  how: 'Capture is cheap and dumb on purpose. Every two minutes the job wakes, asks three adapters what they see, and appends one line per signal. An event carries a timestamp, a type, the adapter that produced it, and a dimension key such as an application name or a repository. It never carries keystrokes, window titles or message content. That restriction is what makes the whole thing acceptable to run continuously.\n\nRollup is a pure function. `buildDailyRecord` takes the day\'s events and returns the record with no side effects and no model involved. Each focus event contributes one poll interval to that application\'s time, which has a pleasant property: a sleeping machine fires no polls, so a night of sleep cannot inflate anything. A small static map splits applications into creation, consumption and neutral, and you can edit it, because the classification is a proxy and everyone\'s proxy is different.\n\nOne thing is deliberately absent. Conduit never produces a single alignment score. The stated reason is that one number invites gaming, so what you get is the distribution plus the record and the judgement stays yours. The same discipline governs how it touches [[TELOS]]: TELOS owns the ideal state, Conduit owns the observed state, and neither writes the other\'s file. They meet only where the gap is computed.\n\nThe one non-deterministic part is quarantined. Answering what kind of work came in is not something a static rule can do, so `BuildInsight.ts` runs hourly, builds a bounded metadata-only summary of top applications, commit subjects and session names, and asks the cheapest model rung. It skips the call entirely on an idle hour, and a failed read never overwrites a good one. The dashboard tab reads that cached file and never calls a model when you open it.',
  sources: [
    'LIFEOS/DOCUMENTATION/Conduit/ConduitSystem.md',
    'LIFEOS/DOCUMENTATION/Memory/MemorySystem.md',
    'LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md',
  ],
  alternatives: [
    { name: 'A commercial time-tracking app', tradeoff: 'Wins on polish, mobile coverage and reports you do not have to build. Costs where the data lives, since it leaves your machine, and it cannot be joined to your own goals because the vendor has never heard of them.' },
    { name: 'Screenshots or full activity capture', tradeoff: 'Wins on completeness, catching browser tabs and documents that a front-window poll misses entirely. Costs a permanent record of everything you read and wrote, which is a much larger thing to protect and a much worse thing to leak.' },
    { name: 'Just ask the person at the end of the day', tradeoff: 'Wins on zero infrastructure and on capturing intent, which no sensor can see. Costs accuracy in a predictable direction, because self-reported time reliably flatters the reporter and the afternoon that disappeared is the part nobody remembers.' },
  ],
  why: 'Conduit is a mirror you pull rather than a watcher that pushes, and almost every design decision follows from that. Metadata only, so continuous capture is defensible. Local only, so there is nothing to leak. A pure rollup and a static classifier, so today\'s number can be recomputed and explained tomorrow. Per-source opt-in and a real off switch, so consent is granular. The price is admitted honestly in its own documentation: version one watches the front window, new commits and coding sessions, and has no browser adapter, so a day of research in a browser reads as almost empty. The system is built to say "no browser adapter yet" rather than "you did nothing", because a sensor that dresses up a blind spot as a verdict is worse than one that has no opinion.',
  examples: [
    { field: 'distribution', text: 'A depot manager believes the morning goes on route planning. The record shows ninety minutes in the planning tool and four hours in email and the phone. Nothing accuses anybody. The distribution is simply laid out, and the useful move is obvious: the four hours are mostly order corrections, which is a data-capture problem upstream rather than a discipline problem in the depot.' },
    { field: 'school', text: 'A teacher logging what actually filled each period finds that the twelve minutes budgeted for admin is really twenty-five, every day, and it eats the end of the lesson rather than the start. That is a timetable finding, not a personal failing. The log had to be kept mechanically to be believed, because reconstructing it from memory on Friday produces the timetable you meant to run.' },
  ],
  related: ['telos', 'cortex', 'synapse', 'feed', 'pulse'],
  without: 'Without this: the system knows what you want and has no idea what you actually did, so it can only ever compare your goals against your own description of your week.',
  failure: 'You notice it is broken when the daily record is empty on a day you know you worked, or when the dashboard tab keeps showing the same day for a week because the scheduled job stopped firing.',
};
