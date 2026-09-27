import type { Component } from '../schema';

export const component: Component = {
  id: 'agents',
  name: 'Subagents',
  box: 'capability',
  status: 'Code shipped. The [[dispatch]] mechanism belongs to [[Claude Code]]; this install adds 18 agent definition files under `agents/` and a routing doctrine on top.',
  summary: 'A subagent is a second copy of the assistant, started with its own fresh context and its own instructions, that goes off and does one piece of the work and reports back.',
  purpose: 'Some work is wide rather than deep: five files to survey, three angles to argue, one audit that should not be done by whoever built the thing. One [[context window]] doing all of it in sequence is slow and fills up with material the final answer never needs.',
  who: 'claude-code',
  trigger: 'The model calls the `Agent` tool with a `subagent_type` and a [[prompt]]. Types are the harness built-ins plus every file in `agents/`. Two [[hook]]s fire around the call: a [[Pulse]] HTTP route at `localhost:31337/hooks/agent-guard` before it, and `hooks/AgentInvocation.hook.ts` both before and after.',
  input: 'A prompt describing the job and, optionally, a `model` [[alias]] naming which [[rung]] to run on. Omitting `model` means the subagent inherits the session\'s model, which the doctrine treats as the correct default.',
  output: 'One report back to the caller. Only that report enters the caller\'s [[context]]; everything the subagent read along the way stays in its own window and is discarded.',
  files: [
    { path: 'agents/Max.md', mode: 'read', note: 'a file-backed agent: [[frontmatter]] pins a model tier, a persona and a permission list that denies Edit and Write' },
    { path: 'agents/Forge.md', mode: 'read', note: 'the cross-vendor counterpart, run through a different vendor\'s command-line coding model' },
    { path: 'hooks/AgentInvocation.hook.ts', mode: 'exec', note: 'records which subagent ran, for how long, and which model it actually carried; observes only, never rewrites the call' },
    { path: 'LIFEOS/TOOLS/models.ts', mode: 'read', note: 'where the tier aliases resolve, so no dispatch pins a dated model ID' },
  ],
  how: '`LIFEOS/DOCUMENTATION/Agents/AgentSystem.md` separates three things people routinely confuse. Built-in subagent types like `Explore` and `general-purpose` are internal machinery with no personality. File-backed agents in `agents/` are persistent identities: `agents/Max.md` carries a persona, a voice, a pinned model tier and a permission block that denies Edit, Write and NotebookEdit outright, so it can read and attack an artifact but never modify it. Custom agents are neither; they are written as an inline brief in the prompt itself and launched with `general-purpose`.\n\nThe rule that catches people is that asking for "specialized agents" and reaching for a bare built-in type produces several identical generic workers. What makes an agent custom is the distinct brief, the role and the angle it argues from, written straight into the prompt text. There is no composition tool and no trait registry; the doc gives a vocabulary of expertise, personality and approach words to draw on when writing prose.\n\nModel selection went the same way. The old rule was to name a model on every dispatch, and it was retired because a named model is the thing that goes stale. The default now is inheritance. When a different [[rung]] genuinely is warranted, you pass a tier [[alias]] rather than a pinned ID, because the harness resolves an alias to the newest model in that tier. `hooks/AgentInvocation.hook.ts` records which model each dispatch actually carried, and its header is explicit that it observes and never injects, because an injector that silently flattens every dispatch to one rung fails quietly rather than loudly.',
  sources: [
    'LIFEOS/DOCUMENTATION/Agents/AgentSystem.md',
    'agents/Max.md:L1-L30',
    'agents/Forge.md:L1-L25',
    'hooks/AgentInvocation.hook.ts:L1-L45',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    { name: 'Do all of it in one [[context]], one step at a time', tradeoff: 'Wins shared state and zero coordination cost, since every step sees everything the earlier ones saw. Costs wall-clock time and a context window that fills with material the final answer never needs.' },
    { name: 'A fixed roster of specialist types, one per job title', tradeoff: 'Wins predictability and a short menu. Costs staleness and false precision: LifeOS shipped `Architect`, `Designer` and `Engineer` types and retired all three, because a brief written for the actual task beats a title chosen from a list.' },
    { name: 'Hosted agents that run unattended in the cloud', tradeoff: 'Wins durability, since the session survives a disconnect and can run for hours in a sandbox. Costs coordination overhead that exceeds the benefit under about thirty minutes, and those agents do not load this system\'s [[CLAUDE.md]] or its skills.' },
  ],
  why: 'The choice here is deliberately thin. Subagents are a harness mechanism, and the canonical component map says outright that things a good harness already provides are not counted as LifeOS features. So LifeOS adds only what the mechanism lacks: a routing rule for which of the three systems a request belongs to, a handful of file-backed agents where the difference is real rather than cosmetic, and a hook that records what actually ran. The two file-backed agents worth knowing are the ones that buy a genuinely different opinion, one pinned to the top Anthropic rung and read-only, one run through a different vendor\'s model so that it does not share the blind spots of the model that wrote the code. The cost is that every dispatch is a fresh context that knows only what its brief says, so a badly written brief produces confident work on the wrong problem, and you find out only when the report comes back.',
  examples: [
    { field: 'distribution', text: 'A wholesaler wants last quarter reviewed across nine sales territories. One subagent per territory pulls that territory\'s invoices, returns and credit notes and reports three numbers, so nine reviews run at once and only twenty-seven numbers come back to the manager rather than nine full ledgers. The margin policy question, whether the rep discounting scheme is defensible at all, does not fan out. That is one hard judgment, so it goes to the read-only deep-analysis agent instead.' },
    { field: 'hospital', text: 'A hospital ward does not send the same doctor to read a scan they ordered and interpreted. The scan goes to a radiologist who was not in the room and does not know what everyone expects to find. The point is not extra hands; it is a second reader whose assumptions are not the first reader\'s assumptions, which is exactly why the cross-vendor audit agent is never allowed to audit work it wrote itself.' },
  ],
  related: ['skills', 'algorithm', 'hooks', 'arbol', 'observability'],
  failure: 'You ask for specialized agents and get several copies of one generic worker, because the dispatch reached for a bare built-in type instead of writing a distinct brief per agent. The other tell is a subagent returning confident work on the wrong problem, which means the brief, not the model, was wrong.',
};
