import type { Component } from '../schema';

export const component: Component = {
  id: 'doctor',
  name: 'Doctor & freshness',
  box: 'verification',
  status: 'Code shipped. The prober, the freshness library, the cache writer, and the dashboard page all ship and run offline by default. One honest gap: the freshness documentation still describes a grade line on the [[statusline]], and the shipped statusline script records that this line was removed in May 2026, so the grades now surface through the dashboard rather than the terminal.',
  summary: 'Two checkers that ask whether the tools the system assumes it has still work, and whether the files describing your life have been read by a human recently enough to trust.',
  purpose:
    'Both halves attack the same failure. A capability that is assumed but never checked breaks silently, and a file about your life that nobody has reviewed in months looks identical to one reviewed yesterday, so the system acts with confidence on ground that has moved.',
  who: 'lifeos',
  trigger:
    'You run the [[Doctor]] yourself, or the install [[skill]] routes you to it when you ask what is broken. The dashboard also shells it with a thirty-second cache. The freshness half has three writers instead: any timestamp bump rewrites the cache, the dashboard rewrites it when its own cache flips, and a SessionStart [[hook]] rewrites it to catch a file that simply aged past its window overnight.',
  input:
    'For the Doctor: the presence and response of each external tool, plus core wiring like [[hook]] interpreter resolution. For freshness: the [[frontmatter]] of the constitutional files, specifically the last-reviewed timestamp, and the per-file threshold.',
  output:
    'An advisory capability manifest listing each capability in one of four states, with a copy-paste fix command for anything broken. A letter grade from A to F per file plus an overall grade, and a ranked list of what is most overdue.',
  files: [
    { path: 'LIFEOS/TOOLS/Doctor.ts', mode: 'exec', note: 'the prober and the manifest writer' },
    { path: 'LIFEOS/MEMORY/STATE/capabilities.json', mode: 'write', note: 'the manifest, carrying a salted integrity hash' },
    { path: 'LIFEOS/MEMORY/STATE/doctor-heartbeat.json', mode: 'write', note: 'when the checker last actually ran' },
    { path: 'LIFEOS/TOOLS/TelosFreshness.ts', mode: 'exec', note: 'the one freshness library, readers and writers both' },
    { path: 'LIFEOS/TOOLS/FreshnessCache.ts', mode: 'exec', note: 'writes the tiny mirror the render path reads' },
    { path: 'LIFEOS/USER/CACHE/freshness.json', mode: 'write', note: 'the mirror: private, atomically written, capped under 4KB' },
    { path: 'LIFEOS/PULSE/modules/doctor.ts', mode: 'exec', note: 'read-only health surface; holds no truth of its own' },
    { path: 'LIFEOS/LIFEOS_StatusLine.sh', mode: 'exec', note: 'the terminal render path, which must never make a network call' },
  ],
  how: `The header of LIFEOS/TOOLS/Doctor.ts states the design contract, and the interesting parts are all restraints. The manifest is an advisory cache with a time to live, never truth, so anything doctrine actually depends on re-verifies live rather than trusting the file. There are four states and the fourth is the good idea: alongside live, broken, and stale sits declined, which is permanently silent. Opting out of a capability is a legitimate way to run the system, not a defect to be nagged about. There are no scores and no percentages, only a diagnostic register. And the default run is never fatal: it exits zero, every [[probe]] is bounded by a timeout, and network probes only fire when you ask for them and only for capabilities you actually configured.

The freshness half turns on one distinction, set out in LIFEOS/DOCUMENTATION/Freshness/FreshnessSystem.md. Two timestamps live in the [[frontmatter]] of every constitutional file. One answers when the bytes last changed. The other answers when a human last vouched for the content. Only the second drives the grade. So a migration that reformats a file bumps the first and the grade correctly stays at F, and a file nobody has read in six months cannot show an A just because a generator touched it.

Thresholds are per file and reflect review cadence rather than change cadence: the operational current-state section is a week, the project registry a month, the assistant\'s own identity six months. The grade is the ratio of review age to that threshold, mapped onto A through F, and the whole set averages into one letter. Because the terminal render path runs every second and must never block, LIFEOS/TOOLS/FreshnessCache.ts writes a tiny file that the shell reads directly, and the documentation is explicit that a missing cache degrades to a dash rather than hanging.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Freshness/FreshnessSystem.md',
    'LIFEOS/TOOLS/Doctor.ts:L1-L45',
    'skills/LifeOS/SKILL.md:L30-L45',
    'LIFEOS/LIFEOS_StatusLine.sh:L1586-L1594',
    'LIFEOS/DOCUMENTATION/Pulse/PulseSystem.md',
  ],
  alternatives: [
    {
      name: 'Check the capability at the moment you need it',
      tradeoff:
        'Always accurate, since nothing is cached and nothing can be stale. Costs you every discovery at the worst time, because you learn the browser tool is broken halfway through the job that needed it rather than the day it broke.',
    },
    {
      name: 'A single health score out of a hundred',
      tradeoff:
        'Wins glanceability, and one number is easy to put on a dashboard. Costs the only thing you can act on, because a score of 82 does not tell you which capability is down or what command fixes it, and it makes a deliberate opt-out look like damage.',
    },
    {
      name: 'Grade the file by when it last changed',
      tradeoff:
        'Trivial to compute, since the file system already knows. Measures the wrong thing entirely: an automatic generator rewriting a file every night would show a permanent A on content no human has looked at in a year.',
    },
  ],
  why:
    'Both halves are built around the same conclusion: the dangerous state is confident and wrong, not missing. That is why the Doctor keeps a diagnostic register instead of a score, why declined is a first-class silent state, and why the manifest carries a tamper hash while still being treated as untrusted by anything that matters. It is why freshness splits the two timestamps, since collapsing them would turn the grade into noise within a week. The cost is a permanent low-level nag surface, plus a real trap the docs name outright: bump the review timestamp from a generator once, and the whole signal quietly becomes a lie.',
  examples: [
    {
      field: 'distribution',
      text:
        'Two different checks in the same depot. The morning walk-around confirms the tools work: the forklift charges, the label printer prints, the handheld scanner reads a test barcode, and a van deliberately off the road is marked as such so it never shows as a fault again. Separately, every customer\'s credit limit and delivery window carries the date a human last confirmed it, because a limit set two years ago looks exactly like one confirmed last week until the file says otherwise.',
    },
    {
      field: 'farm',
      text:
        'A farmer checks the equipment on a schedule and records which machines are simply retired, so they stop showing up as broken. Soil tests carry their own clock: a field tested this spring is trusted, a field last tested four years ago is not, and the plan for it waits on a new test rather than assuming last time still holds.',
    },
  ],
  related: ['pulse', 'telos', 'ledger', 'security', 'observability'],
  without:
    'Without this: a capability the system depends on can be dead for months with nothing saying so, and the files describing your life age past usefulness without ever looking any different.',
  failure:
    'The health page shows a checker that last ran more than a week ago, which means the thing meant to notice problems is itself one of them.',
};
