import type { Component } from '../schema';

export const component: Component = {
  id: 'pulse',
  name: 'Pulse',
  box: 'none',
  status: 'Optional, needs setup. The daemon, its job config, and both service files ship in the public release, but nothing starts until you install the service yourself. One subsystem inside it, the Digital Assistant module under LIFEOS/PULSE/Assistant/, is excluded from the public release, and the security dashboard page is excluded too.',
  summary: 'One always-on program on your own machine that runs the scheduled chores and serves the web page where you watch the whole system work.',
  purpose:
    'A [[LifeOS]] install spreads state across hundreds of files, and a lot of small jobs need to run on a timer. Without one place that both runs those jobs and shows the result, you cannot tell whether the system is working or quietly broken.',
  who: 'lifeos',
  trigger:
    'A service supervisor starts it at login and keeps it alive: [[launchd]] via com.lifeos.pulse.plist on macOS, systemd via com.lifeos.pulse.service on Linux. After startup it never stops. A heartbeat loop wakes at most every 60 seconds to check which jobs are due, and an HTTP server answers requests on port 31337 the whole time.',
  input:
    'PULSE.toml, which holds every scheduled job and the on/off switch for each module. The per-job history in state/state.json. Whatever files each module reads to build its page, for example the change registry for the Ledger page.',
  output:
    'A local web surface on 127.0.0.1:31337: the dashboard pages plus roughly forty JSON endpoints. Dispatched job output, routed to spoken [[voice server]] playback, a phone push, email, or just the log. A rewritten state file after every job.',
  files: [
    { path: 'LIFEOS/PULSE/pulse.ts', mode: 'exec', note: 'the daemon: startup, module init, heartbeat loop' },
    { path: 'LIFEOS/PULSE/PULSE.toml', mode: 'read', note: 'every job and every module switch' },
    { path: 'LIFEOS/PULSE/state', mode: 'read+write', note: 'per-job last run, result, failure count; written atomically after each job' },
    { path: 'LIFEOS/PULSE/modules/ledger.ts', mode: 'exec', note: 'one of 34 page modules, each owning all data access for its tab' },
    { path: 'LIFEOS/PULSE/com.lifeos.pulse.service', mode: 'read', note: 'the systemd user unit, templated at install time' },
    { path: 'LIFEOS/PULSE/manage.sh', mode: 'exec', note: 'start, stop, status, install' },
  ],
  how: `Pulse is one [[bun]] process, described in LIFEOS/DOCUMENTATION/Pulse/PulseSystem.md and implemented in LIFEOS/PULSE/pulse.ts. At startup it loads PULSE.toml, loads the saved state, starts every enabled module, opens the HTTP server on port 31337, and then enters a loop that never exits.

Each tick of that loop walks every enabled job. For each one it asks four questions in order. Does the [[cron]] expression match this minute? Has the circuit breaker tripped, meaning three failures in a row and less than six hours since the last try? Then it runs the job, as a shell command or as a headless [[model]] call. Then it looks at what came back. If the output is one of a few agreed sentinel words like NO_EVENTS, Pulse logs "nothing to report" and sends nothing. Anything else gets dispatched to the channel the job names. State is written after every job, not at shutdown, so a crash loses at most the job in flight.

The web half is the same process wearing a second hat. Every page is two pieces: a module under LIFEOS/PULSE/modules/ that owns all file reads and API calls for that tab, and a static page that fetches from it and holds no data of its own. Modules fail one probe at a time, so a broken data source greys out one panel instead of blanking the page. If Pulse is down the whole surface is simply gone, which is why the security-sensitive [[hook]] checks it also serves are explicitly allowed to [[fail-open]] while the real security hooks stay in-process.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Pulse/PulseSystem.md',
    'LIFEOS/DOCUMENTATION/Services/BackgroundServices.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
    'LIFEOS/DOCUMENTATION/Observability/ObservabilitySystem.md',
  ],
  alternatives: [
    {
      name: 'One scheduler entry per job, the design Pulse replaced',
      tradeoff:
        'A shell script and its own service file for each chore. You get real isolation, since one broken job cannot take the others down. You pay by having a dozen places to look when something stops, and no list anywhere of what is actually running.',
    },
    {
      name: 'A hosted dashboard with cloud cron',
      tradeoff:
        'Wins uptime, works when your laptop is shut, and is reachable from anywhere. Costs you the privacy boundary: your calendar, your email triage, and your whole life index would have to leave the machine to be displayed.',
    },
    {
      name: "The harness's own scheduled agents",
      tradeoff:
        'No infrastructure at all, and each run gets the full power of a [[Claude Code]] [[session]]. Costs a full session in tokens for every run, which is far too expensive for a check that fires every five minutes and usually finds nothing.',
    },
  ],
  why:
    'The jobs LifeOS wants are mostly cheap and mostly find nothing, so paying a session per run was never affordable, and the data they touch is exactly the data that should not leave the laptop. One local daemon answers both. The cost is real and worth naming: it is a single point of failure. When Pulse is down the dashboard, the spoken notifications, the scheduled work, and several data endpoints all vanish together, and the only signal is that things went quiet.',
  examples: [
    {
      field: 'distribution',
      text:
        'A wholesaler runs one small always-on server in the office. Every ten minutes it checks whether any van has been idle past its delivery window, every hour it rechecks which customers crossed their credit limit, and every night it recomputes stock cover. Most checks return the equivalent of "nothing to report" and stay silent, and the same machine serves the one screen in the warehouse office that shows today\'s routes, today\'s picks, and which checks last ran.',
    },
    {
      field: 'hospital',
      text:
        'A ward has one monitoring station rather than an alarm box per bed. It polls each patient on its own cadence, stays quiet when readings are in range, escalates by a routing rule when they are not, and displays every bed on one board. If the station itself dies, the ward loses all of it at once, which is why it is the machine with the backup power.',
    },
  ],
  related: ['observability', 'voice', 'atlas', 'ledger', 'doctor', 'spinner'],
  without:
    'Without this: every recurring job needs its own scheduler entry and its own log, and there is no single screen that answers what the system did today.',
  failure:
    'The dashboard at localhost:31337 refuses the connection and notifications you expect simply stop arriving, with nothing announcing the outage.',
};
