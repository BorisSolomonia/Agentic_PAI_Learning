import type { Component } from '../schema';

export const component: Component = {
  id: 'hooks',
  name: 'Hooks',
  box: 'control',
  status: 'Code shipped. `hooks/` holds 68 hook scripts on this install, registered across eleven events in `settings.json`.',
  summary: 'A hook is a small program the harness runs automatically at a fixed moment, so a thing you want done every time gets done whether or not the model remembers.',
  purpose: 'Some behaviour must not depend on judgment. Tagging fetched web pages as untrusted, blocking a write that would leak private data, announcing that a long job finished: these should happen every time, and asking a model to remember them is a promise it will eventually break.',
  who: 'claude-code',
  trigger: '[[Claude Code]] fires a named [[lifecycle event]]: SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SessionEnd and others. For each event it reads the blocks under that name in [[settings.json]], keeps the blocks whose [[matcher]] matches the tool name, and runs each command in order.',
  input: 'A JSON object on [[stdin]] carrying `session_id`, `transcript_path` and `hook_event_name`, plus event-specific fields such as `tool_name`, `tool_input` and `tool_response`.',
  output: 'An [[exit code]] plus two streams. Exit 0 allows the turn to proceed. [[exit code 2]] blocks the [[tool call]] and sends the [[stderr]] message back to the model as the reason. [[stdout]] may carry JSON with an [[additionalContext]] field, which is injected into the turn as text the model reads.',
  files: [
    { path: 'settings.json', mode: 'read', note: 'the registration table; event name, then matcher, then command, with optional [[timeout]] and async flag' },
    { path: 'hooks/PreToolGuard.hook.ts', mode: 'exec', note: 'the single blocking dispatcher on PreToolUse; reads stdin once and routes by tool to isolated checks' },
    { path: 'hooks/Safety.hook.ts', mode: 'exec', note: 'one file serving two events, tagging incoming web content and classifying outgoing tool calls' },
    { path: 'hooks/ContextReduction.hook.sh', mode: 'exec', note: 'the one hook that rewrites a command rather than allowing or blocking it' },
    { path: 'hooks/lib/hook-io.ts', mode: 'read', note: 'the shared helper every hook uses to read stdin, so the parsing is not written 68 times' },
    { path: 'hooks/README.md', mode: 'read', note: 'the on-disk registry and execution diagram' },
  ],
  how: 'Registration is a table in [[settings.json]]. Under each event name sits a list of blocks; each block has an optional [[matcher]] and a list of commands. A matcher of `Bash` runs the hook only on Bash calls, `Bash|Write|Edit|MultiEdit` runs it on any of four, `mcp__.*` matches every [[MCP]] tool, and an empty matcher matches everything. Hooks in the same event run one after another in the order written, which is why the docs warn that a hook that hangs stops the ones behind it.\n\nThe contract is deliberately tiny, and it is the whole mechanism. Exit 0 means proceed. [[exit code 2]] means block, and whatever the hook printed to [[stderr]] is handed to the model as the explanation. Printing JSON with an [[additionalContext]] field on [[stdout]] injects text into the turn. That is enough to build a guard, a context injector and a logger, and nothing else is needed.\n\nTwo scheduling flags decide cost. A hook marked `async` is fired and not waited for, which is right for logging and voice; a synchronous hook holds the turn until it exits, which is the only correct setting for anything that must block. `hooks/PreToolGuard.hook.ts` shows the consolidation pattern that follows from this: rather than four separate blocking hooks each parsing stdin, one dispatcher parses once and calls four isolated checks, each wrapped in its own error handler and each keeping its own failure policy. Its header names the [[blast radius]] plainly, that one process now carries four guards, and names the mitigation, that the dispatcher body is about thirty lines and does no parsing of its own.',
  sources: [
    'LIFEOS/DOCUMENTATION/Hooks/HookSystem.md',
    'hooks/README.md:L1-L60',
    'hooks/PreToolGuard.hook.ts:L1-L50',
    'settings.json',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    { name: 'Write the rule into the [[system prompt]] and trust the model', tradeoff: 'Wins zero code, instant edits, and behaviour that adapts to context. Costs certainty: it happens most of the time rather than every time, and the exceptions are exactly the sessions where it mattered.' },
    { name: 'A wrapper process around the whole assistant', tradeoff: 'Wins complete control over what goes in and out, with no dependence on the harness exposing the right events. Costs re-implementing a moving target, and the wrapper breaks on every upstream change.' },
    { name: 'Check afterwards in continuous integration or a review step', tradeoff: 'Wins a clean separation and no runtime cost at all. Costs timing: the bad write already landed, so you are cleaning up rather than preventing, and the fix is no longer one line.' },
  ],
  why: 'The test the system applies is a good one to steal: a behaviour earns a hook only when all three hold, that it should happen every time, that it can be decided mechanically with no judgment, and that forgetting it is costly. Auto-tagging untrusted web content passes. Writing better commit messages fails, because it is a judgment the model should make in context, and encoding it would either misfire or do nothing. The price of getting this right is a hot path. Sixty-eight scripts sit on session events, a slow synchronous one stalls every turn, and a hook that loses its exec bit stops firing without saying so, which is why one of the SessionStart hooks exists purely to re-check the exec bit on every registered script.',
  examples: [
    { field: 'distribution', text: 'A wholesaler wires a check that runs before any write to the master price file. It compares the incoming line against the current one, and if a unit price moves more than thirty percent it exits with the block code and prints the two prices, so the model reads back exactly why it was stopped. Nobody had to remember the policy, and the same guard fires whether the write came from an import script, a correction or an assistant halfway through a bigger job.' },
    { field: 'airport', text: 'A jet bridge cannot retract while the aircraft door sensor reads open. That is not a rule the crew are asked to remember under time pressure; it is an interlock wired into the machine, and it fires the same way on the calmest morning and the worst delay. The two things that make it work are the ones that make a hook work: it is bound to a specific moment, and it refuses rather than advises.' },
  ],
  related: ['security', 'boundary', 'observability', 'voice', 'cortex'],
  failure: 'Something that should happen every time silently stops: no spoken line at the end of a run, no untrusted-content tag on a fetched page, no block on a forbidden write. The usual causes are a lost exec bit, a path that no longer resolves, or a hook registered under an event that never fires.',
};
