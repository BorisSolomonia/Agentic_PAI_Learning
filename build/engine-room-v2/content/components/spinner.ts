import type { Component } from '../schema';

export const component: Component = {
  id: 'spinner',
  name: 'Spinner & tooltips',
  box: 'none',
  status: 'Optional, needs setup. The dashboard tooltip components ship as real code. The spinner half is configuration you supply: the verb list and the tips live in [[settings.json]], and the customization directory and the sync tool that the documentation names are not present in this install, so on a fresh setup you write the verbs yourself.',
  summary: 'The small stuff: your own word for what the system is doing while it works, and an explanation attached to every number on the dashboard so you never have to go and look it up.',
  purpose:
    'Two different problems that share one answer. A generic spinner tells you nothing and makes the system feel like a stock tool. A dashboard dense enough to be useful is dense enough to be confusing, and sending the reader to a manual means they will not read it.',
  who: 'lifeos',
  trigger:
    'The verb appears whenever the [[harness]] is working and the [[statusline]] refreshes, roughly once a second. The tips rotate during longer operations. A tooltip fires on hover over a chart point, a badge, or a metric tile in the dashboard.',
  input:
    'The verb vocabulary and its icon, colour, and animation, plus the tip strings, all read from [[settings.json]]. For a tooltip: the data point under the cursor and, for a freshness marker, when that panel\'s data source was last refreshed.',
  output:
    'An animated working word in your terminal status line instead of a generic spinner. A rotating tip beside it. A small panel next to whatever you hovered, explaining the value, its label, and its series.',
  files: [
    { path: 'settings.json', mode: 'read+write', note: 'the live config: the verb list and the tip overrides' },
    { path: 'LIFEOS/LIFEOS_StatusLine.sh', mode: 'exec', note: 'the shipped status line renderer, which draws the other rows around the verb' },
    { path: 'LIFEOS/PULSE/Observability/src/components/ui/chart.tsx', mode: 'read', note: 'the one shared chart tooltip used everywhere' },
    { path: 'LIFEOS/PULSE/Observability/src/components/FreshnessIndicator.tsx', mode: 'read', note: 'the per-panel staleness marker' },
    { path: 'LIFEOS/PULSE/modules/tab-freshness.ts', mode: 'exec', note: 'where every tab declares its data sources, so the marker can resolve' },
    { path: 'LIFEOS/PULSE/Observability/src/app/globals.css', mode: 'read', note: 'tooltip styling and the shared colour tokens' },
  ],
  how: `LIFEOS/DOCUMENTATION/Spinner/SpinnerSystem.md is careful to split two features that share a strip of screen. Verbs are the animated working word with its icon, colour, and animation. Tips are short informational strings shown during longer work. They fail in completely different ways, which is why they are separated.

Both follow one rule: the source of truth sits upstream of the live config, and a [[tool]] rather than a hand edit moves a change into it. The verb vocabulary is meant to live as customization files in the [[USER zone]], with a sync tool pushing them out to settings.json. Hand-editing the live config works for one session and is then overwritten, which the documentation draws as the anti-pattern the whole design exists to prevent. Worth knowing for a fresh install: neither the customization directory nor the sync tool is present here, and the shipped status line script contains no spinner code at all, because the animated verb is drawn by [[Claude Code]] itself from settings.json. LifeOS supplies the vocabulary; the harness supplies the animation.

Tips rot in a way verbs cannot. A verb is cosmetic, but a tip makes a factual claim, such as how many skills or hooks exist, so it goes stale the moment the system changes underneath it. The fix is never to edit the strings by hand but to run the maintenance workflow that re-audits every tip against the current counts and versions. Tooltips, documented in LIFEOS/DOCUMENTATION/Pulse/Tooltips.md, take the opposite approach to staleness: rather than hiding it, every panel wears a marker saying how current its data is, so a stale panel is visibly stale instead of silently wrong.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Spinner/SpinnerSystem.md',
    'LIFEOS/DOCUMENTATION/Pulse/Tooltips.md',
    'LIFEOS/DOCUMENTATION/Pulse/PulseMetadata.md:L1-L60',
    'LIFEOS/LIFEOS_StatusLine.sh:L1580-L1600',
  ],
  alternatives: [
    {
      name: 'The stock spinner and no tooltips',
      tradeoff:
        'Costs nothing to build and nothing to maintain. Costs comprehension on the dashboard side, because every unlabelled number becomes a question the reader either asks someone or, far more likely, quietly ignores.',
    },
    {
      name: 'A help page or a legend explaining the metrics',
      tradeoff:
        'Wins room to explain properly, with diagrams and worked examples if you want them. Costs the trip: an explanation one click away from the number is an explanation almost nobody reads, and it drifts out of date invisibly.',
    },
    {
      name: 'Edit the live config directly',
      tradeoff:
        'Fastest possible change, with no tool and no sync step. Costs the change itself, because the next sync overwrites it, and you are left debugging why an edit you clearly made stopped applying.',
    },
  ],
  why:
    'The tooltip choice is the substantial one: carry the explanation to the number rather than making the reader go find it, and let a panel show its own staleness rather than presenting old data with a confident face. The verb is smaller and the documentation says so plainly, calling it a detail most tools never bother with. Both cost maintenance in the same place, which is the honest downside. Tips make factual claims and rot, tooltips duplicate meaning that also lives in the docs, and the only thing keeping either true is remembering to run the reconciling tool after the system changes.',
  examples: [
    {
      field: 'distribution',
      text:
        'Every printed pick list carries the timestamp of the stock snapshot it was built from, so a picker can see at a glance that the counts are from this morning rather than last Tuesday. And the depot board does not say "variance 4.2 percent" and leave it there. It says which count, over which period, against which expected figure, right where the number sits.',
    },
    {
      field: 'museum',
      text:
        'A museum puts the explanation on the wall beside the object, not in a catalogue at the entrance, because a visitor who has to go and fetch the meaning walks past instead. Each label also carries the date it was written, so a claim the research has since overturned reads as old rather than as quietly wrong.',
    },
  ],
  related: ['pulse', 'doctor', 'observability', 'ledger'],
  without:
    'Without this: the terminal shows a generic spinner that tells you nothing, and every number on the dashboard needs someone who already knows what it means.',
  failure:
    'A tip states a count that is plainly wrong, such as a number of skills you know changed last month, which means the reconciling tool has not been run since.',
};
