import type { Component } from '../schema';

export const component: Component = {
  id: 'tools',
  name: 'Tools & integrations',
  box: 'capability',
  status: 'Code shipped. `LIFEOS/TOOLS/` holds 177 TypeScript programs on this install. The [[MCP]] side is configured in a `.mcp.json` file that this install does not currently have.',
  summary: 'Anything the system has to do the same way every time is written as a small command you can run yourself, and the model just decides when to run it and with which options.',
  purpose: 'A model asked to redo a mechanical job from scratch each time will produce a slightly different answer each time. Writing the mechanical part as a command makes it repeatable, testable and inspectable, and shrinks the model\'s job to choosing the flags.',
  who: 'claude-code',
  trigger: 'A LifeOS [[tool]] runs when the model issues a Bash [[tool call]] naming it, for example `bun ~/.claude/LIFEOS/TOOLS/GetTranscript.ts <url>`. An [[MCP server]] works differently: [[Claude Code]] connects to it at startup from a config file and exposes each of its remote tools as a callable named `mcp__<server>__<tool>`, which the model then calls like any other tool.',
  input: 'Command-line arguments and flags, or standard input, or for an [[MCP]] tool a JSON argument object matching the server\'s published schema.',
  output: 'Text or JSON on [[stdout]] plus an [[exit code]]. Diagnostics go to [[stderr]] so that [[stdout]] stays clean enough to pipe into the next command.',
  files: [
    { path: 'LIFEOS/TOOLS/Inference.ts', mode: 'exec', note: 'the one sanctioned way to make a model call from a script; four run levels, and it reports which model actually ran' },
    { path: 'LIFEOS/TOOLS/models.ts', mode: 'read', note: 'the single registry of current model IDs; consumers pass a tier [[alias]] so they never go stale' },
    { path: 'LIFEOS/TOOLS/GetTranscript.ts', mode: 'exec', note: 'a plain single-purpose utility: URL in, transcript out' },
    { path: 'LIFEOS/TOOLS/Doctor.ts', mode: 'exec', note: 'probes the outside tools the doctrine assumes but the install does not ship, and writes an advisory manifest' },
    { path: 'LIFEOS/DOCUMENTATION/Tools/Tools.md', mode: 'read', note: 'the catalogue; adding a tool means adding a section here' },
  ],
  how: 'The rule in `LIFEOS/DOCUMENTATION/Tools/CliFirstArchitecture.md` is three steps in a fixed order: write down what must happen every time, build a [[deterministic]] command with explicit flags, test that command with no model involved at all, and only then wrap it in prompting. The load-bearing step is the third one. A tool that works perfectly without any model is a tool the model can be trusted to call.\n\nEach utility is a single flat file in `LIFEOS/TOOLS/` with a TitleCase name, documented in `Tools.md`. The dividing line against building a [[skill]] is sharp: one command with parameters is a tool, while multiple workflows or state or a decision about how to proceed is a skill. `Inference.ts` is the interesting case, because it is the tool through which every other script talks to a model. Scripts are forbidden from importing a vendor SDK directly; they call `Inference.ts`, which owns authentication, retries, timeouts and defaults, reads back from the response which model actually answered, and logs any downgrade.\n\nFor [[MCP]] the same document draws a boundary with one question: who calls it. If this harness is the caller, build a command, because the schemas stay out of [[context]] and the thing survives protocol revisions untouched. If somebody else\'s client is the caller, serve [[MCP]], because a command cannot serve a remote client and cannot do per-user authentication. Wrapping a third-party API for your own use is a command, every time.',
  sources: [
    'LIFEOS/DOCUMENTATION/Tools/Tools.md',
    'LIFEOS/DOCUMENTATION/Tools/CliFirstArchitecture.md',
    'LIFEOS/DOCUMENTATION/Tools/Cli.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
  ],
  alternatives: [
    { name: 'Ask the model to write the code fresh each time', tradeoff: 'Wins zero setup and total flexibility. Costs reproducibility: run the same file twice and you can get two different answers, with no way to test the behaviour separately, because it lives in a [[prompt]] that drifts.' },
    { name: 'Expose every capability as an [[MCP server]]', tradeoff: 'Wins a typed contract and reuse by other clients. Costs a protocol layer to run, schemas occupying [[context]] whether used or not, and exposure to spec revisions that a plain command never notices.' },
    { name: 'A shared library the model imports rather than a command', tradeoff: 'Wins type safety and no process spawn. Costs the ability to run and test the thing by hand from a shell, which is exactly the property that makes a failure debuggable after the fact.' },
  ],
  why: 'The system is built on the claim that prompts orchestrate and code executes, so anything repeated gets a command. That buys three things at once: the same input gives the same output, you can inspect the exact command that produced a bad result, and you can test the behaviour with no model in the loop. The cost is friction. Every new capability is a file to write, a section to document and a name to keep flat, and the doc is explicit that this is the wrong trade for a genuine one-off, where a direct question is faster and building a tool is over-engineering. The `Doctor.ts` probe exists because of the other cost: commands that depend on outside binaries degrade silently, so something has to check they are still there.',
  examples: [
    { field: 'distribution', text: 'A wholesaler receives supplier price lists as spreadsheets where the effective date is written five different ways. Instead of asking a model to tidy each file, they build one command that takes the file, the column and an explicit rule for ambiguous dates, and writes a clean file. Same file, same flags, same output, and the day-versus-month rule is a visible flag rather than a guess buried in a prompt. The model\'s remaining job is to read "fix the dates, they are US format" and pick the right flag.' },
    { field: 'newsroom', text: 'A newsroom does not let each reporter invent their own way to check a photo\'s metadata before publication. There is one script on the desk machine that reports the capture time, the camera and whether the file was edited. Everyone runs the same script, so two reporters checking the same photo get the same answer, and a wrong answer can be traced to the script rather than to whoever ran it.' },
  ],
  related: ['skills', 'arbol', 'doctor', 'hooks', 'agents'],
  failure: 'The same task yields a different answer on two runs, or nobody can reproduce a step from the shell, which means the work was improvised in a [[prompt]] instead of run as a command.',
};
