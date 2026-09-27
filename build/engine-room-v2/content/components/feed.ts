import type { Component } from '../schema';

export const component: Component = {
  id: 'feed',
  name: 'Feed',
  box: 'context',
  status: 'Blueprint only, private implementation. Its own documentation states plainly that no Feed implementation ships with the open-source release. What you get is the architecture, the schemas and the queries, as reference for building your own.',
  summary: 'A watcher on the outside world: it reads the sources you chose, scores every item, and decides which ones are worth interrupting you for.',
  purpose: 'Following hundreds of sources by hand means either missing the one thing that mattered or drowning in the rest. [[Feed]] turns a stream of items into routed decisions, so a rare urgent item reaches you in minutes and the other thousand archive silently.',
  who: 'lifeos',
  trigger: 'A scheduled poller, running on a [[cron]] trigger, checks each source on its own interval. Nothing here is triggered by you. An item entering the pipeline then moves through four stages on queues, so a slow transcript never blocks a fast article.',
  input: 'A registry of sources you chose, each with a category, a priority, topic tags, platform URLs, a poll interval, and a flag saying whether it can be processed in the cloud or needs a local machine.',
  output: 'A stored item carrying a one-sentence summary, a one-paragraph summary, a quality score and labels, plus a routing decision: notify now, hold for the daily digest, hold for the weekly, or archive without telling anyone.',
  files: [
    { path: 'LIFEOS/DOCUMENTATION/Feed/FeedSystem.md', mode: 'read', note: 'the blueprint, and the only Feed artifact in the public release' },
    { path: 'LIFEOS/DOCUMENTATION/Arbol/ArbolSystem.md', mode: 'read', note: 'the cloud execution platform the pipeline is described as running on' },
    { path: 'LIFEOS/MEMORY/KNOWLEDGE', mode: 'write', note: 'where high-value items are harvested into curated notes, closing the loop back into memory' },
    { path: 'feed_sources and feed_items tables', mode: 'read+write', virtual: true, note: 'a cloud database, not files in this tree' },
    { path: 'ingest, summarize, rate and route workers', mode: 'exec', virtual: true, note: 'four cloud functions, one per stage; private infrastructure' },
  ],
  how: 'Four stages, and every item walks all four regardless of how good it turns out to be. Ingest fetches and normalises. The fallback chain is worth copying: try full article extraction first, then the full-text field many feeds publish, then the short description, and skip anything under 200 characters entirely rather than pay a [[model]] call to summarise a stub. A bare URL is never sent to the model, because a link is not content.\n\nSummarize produces two lengths on purpose, because they have different jobs. One sentence is for an alert you read on a phone. One paragraph is for a dashboard or a digest where you are deciding whether to open the thing.\n\nRate is where the design and the reality diverge, and the documentation says so out loud. The design has five dimensions plus a fixed twenty-label taxonomy, with the taxonomy kept small and fixed so labels stay comparable across items and over years. As of the note dated 2026-06-11, the live deployment writes only the quality score. The tier column is null on every item, and the routing rules table exists with zero rows in it, so no rule fires.\n\nRoute is a pure logic engine with no model in it. A rule is a set of conditions joined by AND, and an item that matches all of them triggers that rule\'s actions at that rule\'s priority. Keeping this stage [[deterministic]] is what makes the behaviour explainable: you can read a rule and know exactly why something interrupted you.\n\nTwo operational details make it survive contact with the real internet. The poller treats a successful fetch that parses to zero items as a soft failure rather than a success, which is what catches a dead feed that still returns a valid page. And each source carries rolling seven-day quality metrics, so a source that produces a lot of low-scoring items is automatically demoted instead of being pruned by hand.',
  sources: [
    'LIFEOS/DOCUMENTATION/Feed/FeedSystem.md',
    'LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    { name: 'A normal RSS reader', tradeoff: 'Wins on being free, instant and something you already know how to use. Costs the decision: a reader shows you everything and leaves triage to you, so the unread count grows until you declare bankruptcy and lose the important item along with the noise.' },
    { name: 'A curated newsletter or an algorithmic timeline', tradeoff: 'Wins on zero maintenance and on editors with better taste than your rules. Costs control of the ranking, which is tuned to someone else\'s objective, and your own goals never enter the scoring at all.' },
    { name: 'Rank every item with a model at read time', tradeoff: 'Wins on flexibility, since you can change the question without changing a rule. Costs money per item and explainability, because you cannot show anyone why an item was ranked first, and a scoring change silently rewrites history.' },
  ],
  why: 'Feed pays the same evaluation cost on every item and then lets deterministic rules decide the destination. That split is deliberate: judgement is expensive and belongs where a model is genuinely better, and routing is cheap and belongs where a human can read it. Scoring against [[TELOS]] rather than generic quality is what separates this from a recommender, since a merely excellent article about something you are not doing should archive. The costs are steep and the documentation does not hide them. It needs a cloud account, a database, queues and a local machine for transcripts. Every polled item costs a little money whether or not it turns out to matter. And the honest gap between the five-dimension design and the one score actually written in production is the reminder that a blueprint is not a running system.',
  examples: [
    { field: 'distribution', text: 'A wholesaler watches supplier price announcements, a customs tariff page, two competitor sites and a haulage-strike news feed. A tariff change on a category they import is urgent and reaches the buyer within minutes. A competitor blog post about their company culture scores low and archives without a word. Same pipeline, same cost to evaluate both, and only one of them earned an interruption.' },
    { field: 'farm', text: 'A grower watches forecasts, a pest-alert service, and grain prices. A frost warning inside the next 48 hours during blossom wakes somebody at 4am. The same warning in July is archived, because the rule is not "frost" alone but frost joined with the season and the crop stage. That conjunction is exactly what a deterministic rule expresses well and a general summariser does not.' },
  ],
  related: ['synapse', 'conduit', 'arbol', 'cortex', 'telos'],
  without: 'Without this: watching the outside world is manual, so you see what you happened to open, and a source you stopped checking goes quiet without anyone noticing.',
  failure: 'You notice it is broken when a source stops producing items while its status still looks healthy, or when everything routes to archive and the alerts you built it for never arrive.',
};
