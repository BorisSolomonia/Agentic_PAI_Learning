import type { Component } from '../schema';

export const component: Component = {
  id: 'atlas',
  name: 'Atlas',
  box: 'memory',
  status: 'Code shipped. The command-line tool, the store, all eight collectors, the installer, and the hint hook ship in the public release. The background service is opt-in, the database is per-machine and lives outside every git repository, and the maintainer\'s own state-of-record file for Atlas is not in the public payload.',
  summary: 'A map of everything you own online, kept as a graph so you can ask what a single deletion would break.',
  purpose:
    'You cannot climb from [[current state]] to [[ideal state]] without an honest picture of the current state. Domains, servers, repositories, services, devices, and credentials otherwise live in a dozen dashboards, and nobody can answer what depends on what.',
  who: 'lifeos',
  trigger:
    'Two paths, and they are not equal. The slow one is reconciliation: a background service ticks every fifteen minutes and runs a full sync when the last one is over an hour old. The fast one is a hint: hooks/AtlasEventCapture.hook.ts fires on PostToolUse for Bash, Write, Edit, and MultiEdit, and when the command looks like a deploy or a DNS change it appends a hint line. You can also run any command by hand.',
  input:
    'The sources of authority themselves, never a cached copy: a cloud provider API, the GitHub command-line tool listing repositories, the project registry file, the service definitions on this machine, and the credential registry.',
  output:
    'Rows in a local [[SQLite]] database, each carrying which [[collector]] saw it and when it was first and last seen. A redacted snapshot file for the dashboard. Answers on [[stdout]] for questions like what does this own, what relies on this, and what is nobody watching.',
  files: [
    { path: 'LIFEOS/ATLAS/Atlas.ts', mode: 'exec', note: 'the command-line entry point for sync, tick, owns, blast, stale, sql' },
    { path: 'LIFEOS/ATLAS/Store.ts', mode: 'exec', note: 'the store: upserts, observations, the sweep rules' },
    { path: 'LIFEOS/ATLAS/collectors/Cloudflare.ts', mode: 'exec', note: 'one of eight collectors, each owning one source of authority' },
    { path: 'hooks/AtlasEventCapture.hook.ts', mode: 'exec', note: 'writes hints only, never facts' },
    { path: '~/.local/state/lifeos/atlas', mode: 'read+write', note: 'the database, the redacted snapshot, and the hint file, deliberately outside both git repositories' },
    { path: 'LIFEOS/ATLAS/InstallAtlas.ts', mode: 'exec', note: 'installs the fifteen-minute background service' },
    { path: 'LIFEOS/PULSE/modules/atlas.ts', mode: 'exec', note: 'reads the exported snapshot for the dashboard, never the live database' },
  ],
  how: `LIFEOS/DOCUMENTATION/Atlas/AtlasSystem.md sets out three rules that explain the whole design.

First, observations rather than assertions. The same domain can be seen by three different collectors at once, and they all attach to one asset. The asset stays alive while any collector still sees it, and only goes stale when every one of them has stopped. One source going quiet therefore expires that source\'s view, never the thing itself.

Second, sweeping is gated hard. Marking observations as gone happens only after a run that succeeded, enumerated completely, and was a full run rather than a targeted one, and even then only within that collector\'s own observations. A rate limit or a half-read page makes the run partial, and a partial run sweeps nothing. That is what stops a flaky API from quietly deleting your map.

Third, hints are latency and reconciliation is truth. The [[hook]] never writes a fact. It appends a line saying "something touched Cloudflare", the service wakes, and the collector goes and asks Cloudflare what is actually true. A hint that is missed or malformed costs nothing at all, because the hourly cycle heals it. On top of the [[graph]], the questions are the point: LIFEOS/ATLAS/Atlas.ts answers what a deletion would orphan, what depends on a given asset, and which serving domains nobody is monitoring. Those answers are treated as derived [[evidence]] for a [[blast radius]] check, and the tool prints a reminder to confirm against the provider before deleting anything.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Atlas/AtlasSystem.md',
    'hooks/AtlasEventCapture.hook.ts:L1-L50',
    'LIFEOS/DOCUMENTATION/Services/BackgroundServices.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    {
      name: 'A hand-maintained inventory list',
      tradeoff:
        'Wins by being free and readable by anyone. Costs accuracy immediately, because a list is only correct on the day it was written, and nothing forces it to notice that a service was deleted six weeks ago.',
    },
    {
      name: 'A real graph database with a server',
      tradeoff:
        'Wins expressive queries and a mature ecosystem, and it is what the system Atlas is modelled on actually uses. Costs a running server process, which does not fit a setup where several processes read the same store with no daemon at all.',
    },
    {
      name: 'Query each provider dashboard when you need an answer',
      tradeoff:
        'Always current by definition, and needs no storage. Cannot answer the only questions that matter here, because the dependency between a domain in one provider and a repository in another exists nowhere except in your head.',
    },
  ],
  why:
    'The questions Atlas exists to answer are all about relationships across providers, so a graph was required, and no single dashboard could ever hold it. Embedded SQLite won over a graph server because it matches a multi-process, no-daemon machine. The price is worth stating plainly. The map is local only and outside git, because even with no secret values in it a complete picture of your estate is exactly what an attacker wants. And absence is easy to get wrong: an early version called most services orphaned because the collector only knew one of the six ways a service can be reached, which is why the docs now demand complete edge coverage before any query is allowed to claim something is unused.',
  examples: [
    {
      field: 'distribution',
      text:
        'The wholesaler holds one graph of customers, delivery addresses, routes, vans, and the reps who own each account, rebuilt nightly from the systems that actually own each fact. When a rep leaves, the question is not "who was on their list" but "which customers, which standing orders, and which route assignments now have no owner", and one query answers it. A van sold last month stops being observed by the fleet source and shows up as stale rather than silently disappearing from the map.',
    },
    {
      field: 'orchestra',
      text:
        'An orchestra keeps a live map of players, instruments, parts, and the works in the repertoire, drawn from the sources that own each fact rather than from a printed list. Before dropping a piece from the season, one question answers what else it would strand: the guest soloist booked only for it, the hired harp, the rehearsal slot. And a player who has not appeared on any roster for a season shows as inactive rather than being deleted by the first roster that forgot to mention them.',
    },
  ],
  related: ['pulse', 'security', 'hooks', 'cortex', 'ledger'],
  without:
    'Without this: nobody can answer what deleting a domain would break, and services you stopped using stay on the mental list forever.',
  failure:
    'Everything the dashboard shows is dated a week ago, or a thing you deleted yesterday is still listed as live because no run has succeeded since.',
};
