import type { Component } from '../schema';

export const component: Component = {
  id: 'synapse',
  name: 'Synapse',
  box: 'context',
  status: 'Partial, private infrastructure. The dashboard module and the archive schema ship, and the first two phases are documented as live since 2026-07-08. The capture endpoint, the graders and the ledger itself run on the maintainer\'s own cloud account and are not in the public release payload.',
  summary: 'The one door everything you find has to walk through: it saves the thing instantly, scores it against what you are trying to do, and sends it where it belongs.',
  purpose: 'Interesting things arrive through a dozen channels and get lost in all of them. [[Synapse]] gives every input one contract, keeps the raw thing forever the instant it arrives, and decides where it goes rather than leaving that to you.',
  who: 'lifeos',
  trigger: 'Any capture surface firing: a browser hotkey on a page, a bookmark sweep, a voice marker on a wearable, a [[Feed]] item, a manual capture from the command line. Each posts one record to the capture contract. Grading and routing then run asynchronously, off the capture path.',
  input: 'One record per captured thing, with a fixed shape: which surface produced it, that surface\'s own id for the item, a URL or the raw content, a timestamp, what kind of thing it is, and whether it is public or personal.',
  output: 'A permanent row in the amber ledger, plus zero or more destinations for the items that earn one: a note in the [[knowledge archive]], a work issue, a newsletter slot, a blog seed, or a new monitored source.',
  files: [
    { path: 'LIFEOS/PULSE/modules/synapse.ts', mode: 'exec', note: 'the dashboard module serving the live capture stream at the synapse tab' },
    { path: 'LIFEOS/MEMORY/KNOWLEDGE/_schema.md', mode: 'read', note: 'the schema a promoted ledger row must satisfy to become an idea note' },
    { path: 'LIFEOS/TOOLS/HarvestExecutor.ts', mode: 'exec', note: 'the local writer for the classify-and-route path' },
    { path: 'amber ledger (append-only cloud database)', mode: 'read+write', virtual: true, note: 'not a file in this tree; runs on the maintainer\'s own cloud account' },
    { path: 'grading workers (cloud)', mode: 'exec', virtual: true, note: 'summarize and classify workers hosted on Arbol; per-install private infrastructure' },
  ],
  how: 'The order of the four stages is the whole design, and the load-bearing part is that preservation comes first. The raw record is written to the amber ledger the instant it is caught, unconditionally, before any grader can reject it and before any router can drop it. That is write-ahead-log behaviour: nothing entering Synapse is ever lost, even if every step after it crashes. The ledger is append-only, raw rows are immutable, and grading enriches them rather than rewriting them.\n\nGrading runs next, asynchronously, so a capture never waits on a model call. The graders answer a specific question, and the phrasing matters. Not "is this good" but "is this good for what this person is actually trying to do". The important one is the classifier that scores an item against [[TELOS]], because it is the only grader tied to your stated mission, goals, problems and strategies rather than to generic quality.\n\nRouting turns a score into a destination. There are ten routes, from knowledge and blog seed through to none, and an item opens a work issue when its score clears the threshold and its classification is action-shaped. The rule that makes the system trustworthy is the split between the two: routing is conditional on the score, preservation never is. A weak signal earns no destination and still lives in the ledger forever.\n\nThe fourth stage is the one most capture systems skip. Something journaled and never dug back out is a write-only archive, so resurfacing is part of the contract: search, the dashboard tab, and promotion of the best rows into curated notes. Deduplication keeps that usable, since the same article arriving from three surfaces normalises to one row.',
  sources: [
    'LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
    'LIFEOS/DOCUMENTATION/Memory/MemorySystem.md',
  ],
  alternatives: [
    { name: 'A read-later app plus browser bookmarks', tradeoff: 'Wins immediately, with nothing to build and good mobile capture. Costs permanence and judgement: read-later queues delete old items, bookmarks have no notion of what you are working on, and both leave the triage to you at exactly the moment you have no time for it.' },
    { name: 'Grade first, then store only what scores well', tradeoff: 'Wins on a clean store with no clutter, and it is cheaper. Costs everything the grader got wrong, permanently. A half-formed thought that scores badly today is the one you want in two years, and once it is discarded there is no appeal.' },
    { name: 'One purpose-built pipeline per source', tradeoff: 'Wins on fitting each source exactly, with no shared contract to compromise on. Costs multiplication: adding a twelfth input means inventing a twelfth pipeline, and grading logic drifts apart across them until no two sources are comparable.' },
  ],
  why: 'Splitting preservation from routing is the choice that defines Synapse. Storage is cheap and judgement is unreliable, so the system refuses to let a grader decide what survives. It only lets it decide what gets your attention. Naming one router also means adding a new input is wiring, not a new project. The costs are real and worth stating plainly. The ledger grows forever and nothing prunes it. The grade is only as good as the [[TELOS]] behind it, so a stale TELOS quietly mis-sorts everything. And the honest limit for a reader of the public release is that most of this runs on the maintainer\'s own cloud account, so what ships is the contract and the architecture rather than something you can start today.',
  examples: [
    { field: 'distribution', text: 'Everything a wholesaler catches goes into one intake: a supplier price list emailed to a rep, a photo of a competitor shelf, a customer complaint taken over the phone. It is logged the moment it arrives with who caught it and when. Only then does anything grade it. The price list opens a task because margins are a stated goal this quarter, the shelf photo just sits in the log, and in six months the shelf photo is the evidence that a competitor changed pack size before anyone noticed.' },
    { field: 'hospital', text: 'Triage is exactly this shape. Every arrival is registered first, with a timestamp, before anyone judges how sick they are. Then a score decides who is seen next. Nobody is turned away at the door for scoring low, and the register is what lets you answer months later how many people came in with a given symptom, including the ones nothing happened to.' },
  ],
  related: ['cortex', 'feed', 'conduit', 'telos', 'arbol'],
  without: 'Without this: each capture surface goes somewhere different, nothing is scored against your goals, and finding a thing you saved two years ago depends on remembering which app you saved it in.',
  failure: 'You notice it is broken when you remember capturing something and cannot find it anywhere, or when the ledger keeps filling while nothing has been routed to a destination in weeks.',
};
