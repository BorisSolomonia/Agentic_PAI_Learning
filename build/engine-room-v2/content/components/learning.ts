import type { Component } from '../schema';

export const component: Component = {
  id: 'learning',
  name: 'Learning & memory review',
  box: 'memory',
  status: 'Code shipped. The hooks, the reviewer, the guards, and the pattern tool all ship and run unattended. The reviewer spends real money on a [[model]] call each time it fires, so its cadence is a setting you own.',
  summary: 'After a conversation goes quiet, a second program reads it back, decides what is worth keeping, and rewrites the memory file so the next conversation starts knowing it.',
  purpose:
    'Nothing carries from one [[session]] to the next unless something writes it down, and asking the assistant to remember to save things fails exactly when the session was hard. This is the machinery that captures what a run taught without anyone remembering to ask.',
  who: 'lifeos',
  trigger:
    'Three separate clocks. MemoryReviewFire.hook.ts runs on every Stop and fires the reviewer only when three conditions hold at once: eight or more turns in this session, thirty or more minutes since the last review anywhere, and two minutes idle. WorkCompletionLearning.hook.ts runs at SessionEnd. SatisfactionCapture.hook.ts runs on UserPromptSubmit and reacts to what you just typed.',
  input:
    'The session [[transcript]], read back a fixed number of exchanges at a time. The current contents of the [[memory]] file being curated. The work record for the session that just ended. Your own words, when you type a bare number as a rating or an explicit correction.',
  output:
    'A rewritten [[hot layer]] memory file, a new note in the learning tree, a queued proposal awaiting your yes or no, a rating appended to a ratings log, and an audit row for the reviewer run itself.',
  files: [
    { path: 'hooks/MemoryReviewFire.hook.ts', mode: 'exec', note: 'owns the whole review cadence and spawns the reviewer' },
    { path: 'LIFEOS/TOOLS/MemoryReviewer.ts', mode: 'exec', note: 'reads the transcript, calls inference once, routes each typed item' },
    { path: 'hooks/WorkCompletionLearning.hook.ts', mode: 'exec', note: 'turns a finished work session into a learning note' },
    { path: 'hooks/SatisfactionCapture.hook.ts', mode: 'exec', note: 'catches ratings and explicit corrections with no model call' },
    { path: 'LIFEOS/TOOLS/LearningPatternSynthesis.ts', mode: 'exec', note: 'aggregates ratings and failure streams into recurring patterns' },
    { path: 'LIFEOS/MEMORY/LEARNING/SIGNALS/ratings.jsonl', mode: 'write', note: 'every satisfaction rating, one line each' },
    { path: 'LIFEOS/USER/CONFIG/memory-review.json', mode: 'read', note: 'the three cadence numbers, yours to change' },
    { path: 'LIFEOS/TOOLS/MemoryRestore.ts', mode: 'exec', note: 'puts back a snapshot when a review went wrong' },
  ],
  how: `The review loop is described in LIFEOS/DOCUMENTATION/Memory/MemorySystem.md and driven by hooks/MemoryReviewFire.hook.ts. The hook itself does no thinking. It counts turns, checks the two clocks, and when all three gates pass it spawns LIFEOS/TOOLS/MemoryReviewer.ts as a detached process and stamps the global clock. The turn counter is per session and the rate limit is global, on purpose: whether a conversation moved enough is a question about one transcript, while how much [[inference]] to buy is a question about the whole machine.

The reviewer runs in what the docs call [[curation]] mode, and this is the interesting part. It reads the memory file\'s current entries plus recent conversation, then returns the entire desired next state rather than a list of additions. Forgetting is therefore just omission: a stale fact is dropped by leaving it out, a contradicted one is superseded. Because a whole-file overwrite can destroy everything, two guards sit inside the write lock. One blocks a result that is nearly empty or that deletes more than half the entries while adding nothing. The other catches slow erosion, where each write is a little smaller than the last. Every write also copies the old file into a ring of thirty snapshots first, so any single bad review is reversible.

The other two paths need no model at all. hooks/WorkCompletionLearning.hook.ts fires at SessionEnd, reads the work record, and writes a learning note only when the session actually did something: files changed, or several items in the work directory. hooks/SatisfactionCapture.hook.ts matches on shapes in your own prompt, a bare number or a phrase like "no, that is wrong", and files the low ones as a full failure capture with the complaint kept verbatim. LIFEOS/TOOLS/LearningPatternSynthesis.ts later reads those streams looking for a failure class that keeps recurring.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Memory/MemorySystem.md',
    'hooks/MemoryReviewFire.hook.ts:L1-L45',
    'hooks/WorkCompletionLearning.hook.ts:L1-L50',
    'hooks/SatisfactionCapture.hook.ts:L1-L35',
    'LIFEOS/TOOLS/LearningPatternSynthesis.ts:L1-L35',
  ],
  alternatives: [
    {
      name: 'Ask the assistant to save what matters at the end of each run',
      tradeoff:
        'Free, and needs no code. Fails in the exact cases you care about, because a long or frustrating session is the one where the instruction gets dropped, and you find out months later that nothing was saved.',
    },
    {
      name: 'Append everything and never delete',
      tradeoff:
        'Wins simplicity and safety: no overwrite can ever lose a fact. Costs correctness over time, because a memory that only grows fills its budget with stale and contradicted entries, and the contradiction never gets resolved.',
    },
    {
      name: 'Review after every single turn',
      tradeoff:
        'Wins freshness, since nothing is ever more than one turn out of date. Costs a model call per turn, which is both slow and expensive, and produces mostly noise because a single turn rarely teaches anything durable.',
    },
  ],
  why:
    'Curation beat appending because the memory file has a hard size cap, and a system that can only add eventually jams. Full-state replace also makes the write atomic, which is easier to reason about than a set of edit verbs. The cost is severe and LifeOS treats it that way: overwriting a whole file blindly once wiped the live memory during an audit, so the guards, the snapshot ring, and the restore tool exist because that actually happened. The cadence gates are the other half of the price, keeping the model call to a handful a day at the cost of memory that lags a live conversation by up to half an hour.',
  examples: [
    {
      field: 'distribution',
      text:
        'Nobody asks a sales rep to write up their day. Instead, at the end of the week the customer card gets rewritten from scratch: the note that this customer pays late is dropped once three months of payments arrive on time, and the note about who actually signs off on orders replaces the outdated one. Complaints are filed verbatim in their own place, and when the same complaint appears from four customers in a month it stops being an incident and becomes a process problem someone has to fix.',
    },
    {
      field: 'newsroom',
      text:
        'A desk keeps one live file per running story, and rewrites it rather than stacking corrections at the bottom. A detail that turns out to be wrong is removed, not annotated, so a reporter picking the story up at midnight reads the current state and not an archaeology of it. Every version is kept in the background, so a rewrite that went too far can be pulled back.',
    },
  ],
  related: ['cortex', 'observability', 'hooks', 'telos', 'algorithm'],
  without:
    'Without this: every session starts from zero, and the same mistake gets made again next week because nothing recorded that it was a mistake the first time.',
  failure:
    'The memory file stops changing while you keep telling it new things, or it shrinks over a few days until rules you set months ago have quietly vanished.',
};
