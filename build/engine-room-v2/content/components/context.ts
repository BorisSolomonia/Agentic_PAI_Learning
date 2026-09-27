import type { Component } from '../schema';

export const component: Component = {
  id: 'context',
  name: 'Context & configuration',
  box: 'context',
  status: 'Code shipped. The launcher, the constitutional rules file, the routing table and the settings merge driver all ship in the public release and run on every session start.',
  summary: 'The machinery that decides what the AI already knows the moment you start talking to it, before you type a single word.',
  purpose: 'A fresh [[model]] knows nothing about you, your rules, or your machine. This layer loads a fixed set of files into the [[context window]] at startup so the first [[prompt]] of a [[session]] lands on a system that is already oriented.',
  who: 'lifeos',
  trigger: 'You type the [[launcher]] [[alias]] `lifeos`. That runs `bun ~/.claude/LIFEOS/TOOLS/lifeos.ts`, which spawns the real [[Claude Code]] binary with `--append-system-prompt-file` pointing at the LifeOS rules file. It then reads [[CLAUDE.md]] and follows its top-level [[@-import]] lines.',
  input: 'Four things on disk: the constitutional rules at `LIFEOS/LIFEOS_SYSTEM_PROMPT.md`, the routing table `CLAUDE.md`, the files that table imports, and [[settings.json]] for hooks, permissions and environment.',
  output: 'A session that starts with the rules at the highest instruction layer, your identity and project files already in [[context]], and every [[hook]] registered. Nothing is retrieved on demand. It is simply there.',
  files: [
    { path: 'LIFEOS/TOOLS/lifeos.ts', mode: 'exec', note: 'the launcher; builds the argument list and spawns claude' },
    { path: 'LIFEOS/LIFEOS_SYSTEM_PROMPT.md', mode: 'read', note: 'constitutional rules, appended to the harness system prompt at launch' },
    { path: 'CLAUDE.md', mode: 'read', note: 'the routing table and the list of top-level imports' },
    { path: 'LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md', mode: 'read', note: 'one of the six files CLAUDE.md imports at startup' },
    { path: 'LIFEOS/TOOLS/MergeSettings.ts', mode: 'exec', note: 'deep-merges the system defaults and the user overlay into the generated settings file' },
    { path: 'settings.json', mode: 'read+write', note: 'generated, then read by the harness for hooks, permissions and environment' },
  ],
  how: 'Start with the launcher, because it is the part people miss. `LIFEOS/TOOLS/lifeos.ts` is a small [[bun]] [[TypeScript]] program. Its launch function checks that the file exists and then pushes `--append-system-prompt-file` with the path to `LIFEOS/LIFEOS_SYSTEM_PROMPT.md` onto the argument list before spawning `claude`. That flag matters because the [[system prompt]] layer outranks everything else. The same function deletes the API key from the child environment on purpose, so the session bills against the subscription rather than the API.\n\nNext comes the routing table. `CLAUDE.md` is deliberately thin. It says where things live and it lists six files to import at the top level. `LIFEOS/DOCUMENTATION/Config/ConfigSystem.md` explains the constraint that forces the shape: the harness does not follow an [[@-import]] found inside an already-imported file. Nesting them would look tidy and load nothing, so every identity file gets its own line in the top-level list.\n\nLast is the split between the framework and your life. The documented contract in ConfigSystem.md is a [[SYSTEM zone]] that ships publicly and a [[USER zone]] that stays private, mounted into the tree by [[symlink]], with `LIFEOS/TOOLS/MergeSettings.ts` deep-merging a system defaults file and a user [[overlay]] into the generated [[settings.json]] at session start. The user half wins on any conflict. The generated file is the one the harness actually reads, which is why hand-editing it is wasted work: the next session rebuilds it from the two sources.',
  sources: [
    'CLAUDE.md',
    'LIFEOS/DOCUMENTATION/Config/ConfigSystem.md',
    'LIFEOS/TOOLS/lifeos.ts:L493-L570',
    'LIFEOS/LIFEOS_SYSTEM_PROMPT.md:L1-L60',
  ],
  alternatives: [
    { name: 'One enormous CLAUDE.md holding everything', tradeoff: 'Wins on simplicity, since there is one file and no import rules to learn. Costs [[token]] budget on every session and makes the public and private halves impossible to separate, so the framework can never be shared without shipping your life with it.' },
    { name: 'Load context on demand through an [[MCP server]]', tradeoff: 'Wins on paying only for what a task needs, and the data can live anywhere. Costs a running service on the startup path, and it is retrieval rather than context: the model has to know it should ask, which is exactly the thing a fresh session does not know.' },
    { name: 'Bake the rules into a fine-tuned model', tradeoff: 'Wins on rules that cannot be forgotten or edited away, at zero context cost. Costs the ability to change anything today, and your goals change faster than a training run. A [[dry run]] of a rule change becomes a retraining project.' },
  ],
  why: 'LifeOS puts the non-negotiable rules in the [[system prompt]] layer and everything else in an import list because the two need different authority. Rules that must never be overridden go where nothing outranks them. Facts about your life go in files you can edit between sessions and see in a diff. Splitting system from user by [[zone]] and merging at runtime is what lets the framework ship publicly while your version stays yours. The cost is paid on every single session: this context is loaded whether the task needs it or not, and it is the largest fixed [[token]] charge in the system. LifeOS takes that trade because a session that starts oriented beats a session that has to be told, and because a rule that loads conditionally is a rule that eventually does not load.',
  examples: [
    { field: 'distribution', text: 'A wholesaler keeps one standing rule that no price, tax rate or customer name may be written as a literal in code. Put it in the constitution and every developer session starts holding it, including the one at 7pm when someone just wants the invoice screen to work. Put it in a wiki page instead and it binds only the people who happened to read the wiki that week.' },
    { field: 'airport', text: 'A ground-handling crew has a briefing board every shift starts at: today\'s stand allocations, the standing safety rules, who is on shift. Nobody asks for it and nobody looks it up. It is read before the first aircraft moves, which is why it works. The startup import list is that board, and the constitution is the part of it that never changes between shifts.' },
  ],
  related: ['telos', 'boundary', 'hooks', 'algorithm', 'security'],
  without: 'Without this: every session starts blank, the rules bind only when you remember to paste them, and your identity files sit on disk unread.',
  failure: 'You notice it is broken when the assistant asks something it should already know from a startup file, or when a rule you wrote down gets violated on the first turn of a fresh session.',
};
