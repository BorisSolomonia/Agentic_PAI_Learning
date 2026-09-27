import type { Component } from '../schema';

export const component: Component = {
  id: 'arbol',
  name: 'Arbol',
  box: 'capability',
  status: 'Blueprint only, private implementation. The concept document ships in the public release; no worker, action or flow code ships with it, and the local runner tree `LIFEOS/ARBOL/` does not exist on this install.',
  summary: 'Arbol is the part of the system that keeps working while your laptop is shut, running small jobs on a schedule out on someone else\'s servers.',
  purpose: 'A session-bound assistant only knows what was true the last time you sat down. Watching a source, transforming a signal or scanning a deployed site has to happen on a clock, not on your attention.',
  who: 'lifeos',
  trigger: 'A Cloudflare [[cron]] trigger fires a Flow worker\'s scheduled handler at its configured interval. Every flow also exposes a public `/health` endpoint and an authenticated `/trigger` endpoint for a manual run. The same actions run locally from a command with no schedule at all.',
  input: 'Whatever the flow\'s configured source produces: an RSS feed, an API response, a webhook payload. Inside a pipeline, each action receives the accumulated JSON output of every action before it.',
  output: 'A result written to the flow\'s configured destination, which may be an email, a database or an API, plus a JSON envelope per action carrying `success`, the action name, a duration and the output object.',
  files: [
    { path: 'LIFEOS/DOCUMENTATION/Arbol/ArbolSystem.md', mode: 'read', note: 'the concept document, which is the whole of what ships publicly' },
    { path: 'LIFEOS/DOCUMENTATION/Tools/Cli.md', mode: 'read', note: 'the local runner and its pipe model, also marked as excluded from the public payload' },
    { path: 'LIFEOS/USER/CUSTOMIZATIONS/ARBOL', mode: 'read+write', note: 'where an install keeps its own actions and workers; named by the docs, private by zone, not opened here' },
    { path: 'Cloudflare Workers at the edge', mode: 'exec', virtual: true, note: 'not a file in this tree; the deployed runtime where flows actually execute' },
  ],
  how: 'Everything in Arbol is built from three things that stack. An Action is one unit of work, prefixed `A_`, that turns JSON into JSON and knows nothing about anything else. A Pipeline, prefixed `P_`, is an ordered list of actions where the output of one becomes the input of the next. A Flow, prefixed `F_`, is the only layer that owns a clock: it names a source, a pipeline, a destination and a schedule.\n\nThe chain works because of the passthrough pattern. Each action destructures the field it needs and spreads everything else forward, so the last action in a chain can still see a title the first action produced three hops ago. Context accumulates rather than evaporating at each step, which is what lets an action stay ignorant of the pipeline it sits in.\n\nTwo details matter for judgment. Workers come in two grades, and the selection rule is to default to the lightweight one and upgrade only when the action genuinely needs network calls, secrets or bindings. And cost is a design input, not an afterthought: the doc works the arithmetic out loud, noting that a five-minute interval over thirty items is about 8,640 model calls a day, and that the fixes are longer intervals, deduplication and filtering rather than a bigger budget. Arbol is also where the hourly outside-in security scan of the deployed estate runs, which is the same system as the [[Bunker]] security plane under a different name.',
  sources: [
    'LIFEOS/DOCUMENTATION/Arbol/ArbolSystem.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
    'LIFEOS/DOCUMENTATION/Tools/Cli.md',
    'LIFEOS/DOCUMENTATION/Security/README.md',
  ],
  alternatives: [
    { name: 'A scheduled job on your own machine', tradeoff: 'Wins simplicity, zero cloud cost and no deployment step. Costs availability: the job runs only when the machine is awake and connected, which is exactly the condition the component exists to remove.' },
    { name: 'One long-running server process you own', tradeoff: 'Wins the ability to hold state between runs and to react instantly. Costs operations: a machine to patch, a process to keep alive, and a cold start that is yours to solve rather than the platform\'s.' },
    { name: 'One monolithic script per scheduled job', tradeoff: 'Wins directness, since the whole job reads top to bottom in one file. Costs reuse and testing: the summarize step cannot be run or fixed on its own, and the tenth job re-implements what the first nine already did.' },
  ],
  why: 'Splitting into three primitives buys one property that a monolithic scheduled script cannot: each layer refuses to know something. Actions do not know about schedules, pipelines do not know about sources, and only flows watch the clock, so an action can be tested by hand with one JSON object and reused in any chain. The composition is deliberately Unix-shaped, output piping into input, so the same units run locally for development and at the edge for production with no code change. The cost is honest and large. This is private infrastructure. The public release ships the design and nothing else, so a reader who wants this has to build it against someone else\'s cloud account, and the running bill scales with how often the flows fire.',
  examples: [
    { field: 'distribution', text: 'A wholesaler wants an exceptions email at 6am rather than a dashboard nobody opens. One action pulls last night\'s warehouse stock file, a second compares it against open orders, a third writes the shortfall lines in plain language. A flow wires the source, the schedule and the sales manager\'s inbox. Nothing runs on anyone\'s laptop, and the rating action can be tested on its own with one order line before it is ever put in the chain.' },
    { field: 'farm', text: 'An irrigation controller does not wait for the farmer to decide it is time. A moisture sensor is one unit, the decision rule is another, the valve is a third, and a timer wires them into a cycle that runs at dawn whether or not anybody is awake. Replace the sensor and the decision rule does not change, which is the same reason an action never knows which pipeline it sits in.' },
  ],
  related: ['tools', 'bunker', 'security', 'synapse', 'feed'],
  without: 'Without this: nothing in the system runs while the laptop is closed, so its picture of the current state is only ever as fresh as your last session.',
  failure: 'A digest, alert or scan that is supposed to arrive on a schedule simply does not, and no session log shows anything wrong, because the run happens entirely outside every session.',
};
