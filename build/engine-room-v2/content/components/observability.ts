import type { Component } from '../schema';

export const component: Component = {
  id: 'observability',
  name: 'Observability',
  box: 'none',
  status: 'Code shipped. The writers and the reading module both ship and run with no setup. The display half needs Pulse running, and the security page inside that dashboard is excluded from the public release.',
  summary: 'Every tool the assistant uses gets written down as one line in a file, so you can watch what it actually did instead of trusting what it said.',
  purpose:
    'A [[model]] can report that it ran a command. That report is a claim, not proof. Recording every [[tool call]] as it happens gives you an independent record you can check the story against.',
  who: 'lifeos',
  trigger:
    'Two [[hook]] registrations on the same [[lifecycle event]] family. EventLogger.hook.ts is registered on PostToolUse with an empty [[matcher]], so it fires after every single tool call, and separately on PostToolUseFailure, ConfigChange, and StopFailure. AgentInvocation.hook.ts fires before and after each [[subagent]] runs.',
  input:
    'The hook input on [[stdin]]: which tool ran, the arguments it was given, whether it succeeded, the [[session]] id, and the timestamp.',
  output:
    'One appended line of [[JSONL]] per event, in a file chosen by event type. Nothing is sent anywhere and nothing is held in memory. Errors go to [[stderr]] and the hook exits zero, so a broken logger can never block a [[turn]].',
  files: [
    { path: 'hooks/EventLogger.hook.ts', mode: 'exec', note: 'the one writer; five older loggers were merged into it' },
    { path: 'hooks/AgentInvocation.hook.ts', mode: 'exec', note: 'subagent start and stop events' },
    { path: 'hooks/PostToolObserver.hook.ts', mode: 'exec', note: 'the other catch-all PostToolUse hook, which returns context rather than logging' },
    { path: 'LIFEOS/MEMORY/OBSERVABILITY/tool-activity.jsonl', mode: 'write', note: 'the main activity stream, read back 100 lines at a time' },
    { path: 'LIFEOS/MEMORY/OBSERVABILITY/tool-failures.jsonl', mode: 'write', note: 'the parallel stream for failed calls' },
    { path: 'LIFEOS/PULSE/Observability/observability.ts', mode: 'exec', note: 'the reader: tails each file on request and merges them newest first' },
  ],
  how: `The design is described in LIFEOS/DOCUMENTATION/Observability/ObservabilitySystem.md and it is deliberately dull. Writers only append to local files. Nothing pushes, nothing queues, nothing buffers.

hooks/EventLogger.hook.ts is the single writer. Its own header explains that it absorbed five separate logger files in 2026, and that it now dispatches on the event name it was handed: a normal tool call goes to tool-activity.jsonl, a failed one to tool-failures.jsonl, a settings edit to config-changes.jsonl, and a Stop failure to a dated security log. When the tool was a [[skill]], it writes a second line to the skill execution log as well. Every path is wrapped so that any error prints to stderr and the process still exits zero.

Reading is pull-only. The Pulse module at LIFEOS/PULSE/Observability/observability.ts reads the tail of each file when someone asks, merges the lines newest first, caps the result, and serves it. The dashboard asks every three seconds. So the gap between something happening and you seeing it is one poll interval, and the only moving part is a file append. A dashboard that crashes loses nothing, because the events were never in flight to begin with.`,
  sources: [
    'LIFEOS/DOCUMENTATION/Observability/ObservabilitySystem.md',
    'hooks/EventLogger.hook.ts:L1-L40',
    'hooks/PostToolObserver.hook.ts:L1-L20',
    'LIFEOS/DOCUMENTATION/Memory/MemorySystem.md',
  ],
  alternatives: [
    {
      name: 'A hosted telemetry service',
      tradeoff:
        'Wins searchable history, dashboards you did not build, and alerting for free. Costs you the thing that made the record trustworthy: your command lines and file paths now live on someone else\'s server, and the pipeline breaks when the network does.',
    },
    {
      name: 'A local database with a writer process',
      tradeoff:
        'Wins real queries, indexes, and no file-tailing tricks. Costs a second always-on process that every [[hook]] must reach, so a hook now fails when the database is locked, and observability becomes something that can take the session down with it.',
    },
    {
      name: 'Trust the transcript',
      tradeoff:
        'Costs nothing to build, since the conversation already records what the assistant said it did. Wins nothing you can rely on: the transcript is the model\'s own account, so it cannot be [[evidence]] about the model.',
    },
  ],
  why:
    'The whole point is an independent record, so the record has to survive whatever broke. Appending a line to a local file is about the only write that always works: no network, no lock, no second process. That buys honesty at the cost of convenience. There is no query language, retention is a fixed number of lines per stream, and if nobody looks at the dashboard the events just sit there. LifeOS accepts that, and adds a separate health check that warns when the logs grow past 256 MiB or thirty days.',
  examples: [
    {
      field: 'distribution',
      text:
        'Every scan in the warehouse writes one line to a log the moment it happens: who scanned, which pallet, which door, and whether the scan was rejected. Nobody is asked to fill in a form afterwards. When a customer says a delivery never arrived, the argument is settled by the scan record rather than by the driver\'s memory, and rejected scans sit in their own file so a failing handheld is visible without reading every good scan.',
    },
    {
      field: 'airport',
      text:
        'The flight data recorder writes continuously to local storage and sends nothing anywhere. It is not there to help the pilot fly. It is there so that afterwards there is a record nobody had to remember to make, and a separate channel captures faults so that an intermittent sensor shows up as its own pattern.',
    },
  ],
  related: ['pulse', 'hooks', 'learning', 'cortex', 'doctor'],
  without:
    'Without this: the only account of what the assistant did is the assistant\'s own summary, and a tool that failed silently leaves no trace at all.',
  failure:
    'The activity feed stops advancing while work is plainly still happening, or the newest line in the log is hours older than the newest thing you did.',
};
