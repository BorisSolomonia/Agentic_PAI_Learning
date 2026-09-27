import type { Section, Step } from './schema';

/**
 * Part 1 — Session start: the eight moves from typing `lifeos` to the prompt box.
 * Ground truth: ~/.bashrc line 132, LIFEOS/TOOLS/lifeos.ts (cmdLaunch), settings.json hooks block,
 * hooks/README.md fire order, hooks/LoadContext.hook.ts header, USER/CUSTOMIZATIONS/statusline.sh.
 * Nothing here has been sent to a model until S8 — that is the point of the part.
 */

const S1: Step = {
  id: 'S1',
  title: 'You type `lifeos`',
  who: 'you',
  purpose: 'Start a session that knows you, instead of a blank one. The word `lifeos` is a shortcut; what it expands to is the first LifeOS decision you meet.',
  trigger: 'You press Enter in a terminal. Bash looks the word up in its [[alias]] table before it looks for a program.',
  input: 'Five characters on a command line.',
  output: 'Bash replaces them with the full command stored in the alias and runs that instead.',
  files: [
    { path: '~/.bashrc', mode: 'read', note: 'line 132 holds the alias; bash reads this file once when the terminal opens' },
  ],
  how: `An alias is a one-line substitution. On this machine the line reads:

\`alias lifeos='bun ~/.claude/LIFEOS/TOOLS/lifeos.ts -s ~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md'\`

So typing \`lifeos\` is exactly the same as typing that whole command. Nothing about LifeOS has run yet; this is the shell doing text replacement. The \`-s\` flag hands the [[launcher]] the path of the file that will become the constitution in S2.`,
  sources: ['~/.bashrc', 'LIFEOS/TOOLS/lifeos.ts:L1-L22'],
  alternatives: [
    { name: 'Type the full command every time', tradeoff: 'Nothing to install, nothing to forget. You will mistype it by day three, and nobody else on the machine discovers it.' },
    { name: 'A wrapper script on the PATH', tradeoff: 'Works from any shell, survives a new terminal type, can be versioned. One more file to install, and the installer has to know where your PATH is.' },
    { name: 'Replace `claude` itself', tradeoff: 'Every session gets LifeOS whether you want it or not. Breaks the moment you need a plain session to debug LifeOS, which is exactly when you need one.' },
  ],
  why: 'LifeOS keeps plain `claude` and adds `lifeos` beside it. That is the cheapest possible install, it is one line to remove, and it leaves you a clean session for comparison. Part 2 of the chapter book uses that comparison as a test. The cost is that the alias lives in a dot-file the installer has to edit, and a new shell (zsh, fish) needs its own line.',
  examples: [
    { field: 'distribution', text: 'A sales rep does not dial the warehouse\'s eleven-digit number; a speed-dial key labelled "WH" does it. The key is not the warehouse and it is not the call. It is the substitution that makes the right call the easy one.' },
    { field: 'hospital', text: 'A ward has a "code blue" button. Pressing it is one action that expands into a whole procedure: page the team, unlock the crash cart, start the clock. The button holds no medicine; it holds the expansion.' },
  ],
  watch: 'The shell swaps five letters for a sixty-character command. No LifeOS code has run.',
};

const S2: Step = {
  id: 'S2',
  title: 'The launcher builds the real command',
  who: 'lifeos',
  purpose: 'Start Claude Code with the constitution attached, in the right folder, with the right billing, and tell the house that a session began. Claude Code has no flag that does all of this; the launcher is where LifeOS decides how a session is born.',
  trigger: 'The alias from S1 runs `bun LIFEOS/TOOLS/lifeos.ts`. The script\'s `cmdLaunch()` function runs when no sub-command (`update`, `version`, `mcp`) was given.',
  input: 'The `-s` path from the alias; optional flags (`-m` for an [[MCP]] profile, `--resume`, `--local`); the current environment variables.',
  output: 'A child process: `claude --append-system-prompt-file ~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md` running inside `~/.claude`, with `ANTHROPIC_API_KEY` removed from its environment and `CLAUDE_CODE_WORKFLOWS=1` added.',
  files: [
    { path: 'LIFEOS/TOOLS/lifeos.ts', mode: 'exec', note: 'the launcher itself; cmdLaunch() is the function that runs here' },
    { path: 'LIFEOS/TOOLS/Banner.ts', mode: 'exec', note: 'prints the neofetch-style banner before Claude starts' },
    { path: 'LIFEOS/VERSION', mode: 'read', note: 'the banner shows the LifeOS version from here' },
    { path: 'LIFEOS/LIFEOS_SYSTEM_PROMPT.md', mode: 'read', note: 'existence is checked here; Claude Code reads the contents in S3' },
  ],
  how: `\`cmdLaunch()\` in \`LIFEOS/TOOLS/lifeos.ts\` does seven small things in order:

1. **Checks that \`claude\` exists** by running \`claude --version\`. No Claude Code, no session; it stops with a clear error.
2. **Prints the banner** by running \`LIFEOS/TOOLS/Banner.ts\`, which reads \`LIFEOS/VERSION\` and picks a layout for your terminal width.
3. **Builds the argument list.** It starts with \`claude\` and, if the system-prompt file exists, appends \`--append-system-prompt-file <path>\`. This one flag is the whole difference between \`claude\` and \`lifeos\`: it tells Claude Code to read that markdown file and add it to its own [[system prompt]].
4. **Handles an MCP profile** if you passed \`-m\`: it points the \`.mcp.json\` [[symlink]] at the chosen profile so Claude Code loads those [[MCP server]]s. On this machine there is no \`.mcp.json\` right now, so no MCP servers load at start.
5. **Changes directory to \`~/.claude\`** (unless \`--local\`). This matters more than it looks: Claude Code finds \`CLAUDE.md\` relative to where it starts, so this is what makes S4 find the right file.
6. **Sends a voice line** to [[Pulse]] on port 31337 (\`/notify/personality\`) with the startup catchphrase. It is fire-and-forget: if Pulse is down, nothing waits and nothing breaks.
7. **Strips \`ANTHROPIC_API_KEY\`** from the environment so the session bills to your subscription, not to an API key, then spawns \`claude\` with the built arguments and waits for it to exit.`,
  sources: ['LIFEOS/TOOLS/lifeos.ts:L490-L575', 'LIFEOS/TOOLS/Banner.ts:L1-L12'],
  alternatives: [
    { name: 'Put the flag in the alias directly', tradeoff: 'Simpler: `alias lifeos=\'claude --append-system-prompt-file …\'`. You lose the banner, the MCP profiles, the billing guard and the voice line, and every extra behaviour becomes another alias.' },
    { name: 'A Claude Code plugin or settings key', tradeoff: 'Claude Code has no settings key that appends a system-prompt file; it is a launch flag only. So this alternative does not exist today, which is itself a lesson: the harness decides which extension points you get.' },
    { name: 'A shell script instead of a TypeScript program', tradeoff: 'Fewer dependencies (no [[bun]]). Harder to test, harder to grow; the MCP profile logic and the git-worktree guard would be painful in bash.' },
  ],
  why: 'LifeOS wants one command that produces a fully-formed session, and it wants to add behaviour to that command over time without touching the alias again. A small program is the only shape that gives both. The cost is a hard dependency on `bun` before Claude even starts, and a launcher that must track Claude Code\'s flags as they change.',
  examples: [
    { field: 'distribution', text: 'Before a delivery van leaves, a dispatcher runs the pre-trip: check the driver has a licence, load the route sheet, set the fuel card to the company account not the driver\'s, and radio the depot that van 7 is out. None of that is driving. All of it decides what kind of trip it will be.' },
    { field: 'airport', text: 'A pilot does not just start the engines. The pre-flight checklist loads the flight plan into the computer, confirms the aircraft is airworthy, and tells the tower the flight exists. The launcher is that checklist, and the appended system prompt is the flight plan.' },
  ],
  payloads: [
    { label: 'the process that gets spawned (argv)', text: '["claude", "--append-system-prompt-file", "/home/<you>/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md"]\n// cwd: /home/<you>/.claude\n// env: ANTHROPIC_API_KEY removed · CLAUDE_CODE_WORKFLOWS=1 added' },
    { label: 'voice notification (POST to Pulse, ignored if Pulse is down)', text: 'POST http://localhost:31337/notify/personality\n{"message": "[🎯 focused] <startup catchphrase from settings.json>"}' },
  ],
  without: 'Without this: you would type `claude`. No banner, no appended constitution, no billing guard, no voice line; Claude Code starts with only its own defaults, in whatever folder you happen to be in.',
  watch: 'Banner prints. A child `claude` process starts with one extra flag. Still no model involved.',
};

const S3: Step = {
  id: 'S3',
  title: 'Claude Code reads its settings',
  who: 'claude-code',
  purpose: 'Claude Code needs to know which model to use, which programs to run at which moments, what to allow without asking, and what to show in the status bar. All of that lives in one JSON file it reads before anything else.',
  trigger: 'Process start. Claude Code always reads `~/.claude/settings.json` (plus any project-level settings) as its first act; there is no way to skip it.',
  input: '`settings.json`: 33 top-level keys on this machine. The ones that matter for the next five moves are `model`, `hooks`, `statusLine`, `permissions` and `env`.',
  output: 'An in-memory configuration: the model pin (`claude-fable-5-1[1m]`), 90 hook registrations across 11 events, the status-line command, the permission mode (`auto`), and six environment variables including `PAI_DIR`.',
  files: [
    { path: 'settings.json', mode: 'read', note: 'the INTERFACE-zone file: LifeOS writes it (S5 merges into it), Claude Code reads it' },
    { path: 'LIFEOS/LIFEOS_SYSTEM_PROMPT.md', mode: 'read', note: 'read now because of the --append-system-prompt-file flag from S2' },
  ],
  how: `This is a [[Claude Code]] move, and it would happen with an empty \`settings.json\` too. What makes it a LifeOS moment is *what is in the file*: LifeOS wrote almost all of it.

- **\`model\`** pins the session to a model alias. LifeOS's rule is that the main session always runs on the top rung; a [[hook]] in S5 later checks the pin against reality.
- **\`hooks\`** is a map from [[lifecycle event]] name to a list of commands. Claude Code will run these commands at those moments; it does not know or care that they are LifeOS scripts. This map is how every 🟩 step in Part 2 gets its chance to run.
- **\`statusLine.command\`** names the script that draws the bottom bar (S7). On this machine it points into the USER zone, at a wrapper you wrote.
- **\`permissions\`** holds allow / deny / ask lists and \`defaultMode: auto\`. Advice from LifeOS is not authority; this block is the authority.
- **\`env\`** sets variables every hook will see, including \`PAI_DIR=~/.claude\`, which is why some hook commands are written as \`\${PAI_DIR}/hooks/…\`.

At the same moment, because of the flag from S2, Claude Code reads \`LIFEOS_SYSTEM_PROMPT.md\` and appends its text to its own system prompt. That text is now above the conversation, at instruction level, before any file in S4 is read.`,
  sources: ['settings.json', 'LIFEOS/DOCUMENTATION/Config/ConfigSystem.md', 'hooks/README.md:L476-L526'],
  alternatives: [
    { name: 'Configuration in environment variables only', tradeoff: 'Nothing to parse and easy to override per shell. Impossible to express a list of hooks per event, and invisible to a newcomer who cannot run `env`.' },
    { name: 'Configuration in code (a TypeScript file)', tradeoff: 'Type-checked and can compute values. The harness would have to execute your code just to learn its own settings, which is a security hole and a chicken-and-egg problem.' },
    { name: 'Many small files, one per concern', tradeoff: 'Each piece is readable on its own. The harness has to glob and merge them, and "which file wins" becomes a support question.' },
  ],
  why: 'Claude Code chose one JSON file and LifeOS has no say in that. What LifeOS chose is to treat the file as an INTERFACE: shipped defaults in a system file, your overrides in a user file, merged into `settings.json` by a script at S5. That way an update can change the defaults without deleting your overrides. Two honest notes about this machine: neither input file (`settings.system.json`, `USER/CONFIG/settings.user.json`) exists here any more, so the merge at S5 runs and does nothing and `settings.json` is effectively hand-maintained; and the nine hooks registered twice are leftovers of the migration that produced this file, which a merge that only ever adds could never have cleaned up.',
  examples: [
    { field: 'distribution', text: 'The warehouse management system loads its configuration at start: which printer prints pick lists, which scanner beeps on a short pick, which users may approve a credit note. The config is not the warehouse; it decides how the warehouse behaves today.' },
    { field: 'orchestra', text: 'Before the first note, every player reads the same seating plan and the same programme. The conductor did not write the hall\'s rules about where the brass sit, but the programme for tonight is his.' },
  ],
  payloads: [
    { label: 'settings.json, the five keys that matter (abbreviated, values are real shapes)', text: `{
  "model": "claude-fable-5-1[1m]",
  "permissions": { "defaultMode": "auto", "allow": [ …16 rules… ], "deny": [], "ask": [ … ] },
  "env": { "PAI_DIR": "/home/<you>/.claude", "PROJECTS_DIR": "…", "BASH_DEFAULT_TIMEOUT_MS": "…", … },
  "statusLine": { "type": "command", "command": "$HOME/.config/LIFEOS/USER/CUSTOMIZATIONS/statusline.sh", "refreshInterval": 5 },
  "hooks": {
    "SessionStart":     [ { "matcher": "", "hooks": [ { "type": "command", "command": "…/hooks/LoadContext.hook.ts" }, … ] } ],
    "UserPromptSubmit": [ … 10 entries … ],
    "PreToolUse":       [ { "matcher": "Bash|Write|Edit|MultiEdit", "hooks": [ { "command": "…/hooks/PreToolGuard.hook.ts" } ] }, … ],
    "PostToolUse":      [ … 32 entries … ],
    "Stop":             [ … 11 entries … ],
    "SessionEnd":       [ … 10 entries … ]
  }
}` },
  ],
  watch: 'One JSON file becomes the session\'s wiring diagram. The constitution file is read and appended above everything.',
};

const S4: Step = {
  id: 'S4',
  title: 'Claude Code reads `CLAUDE.md` and follows its six imports',
  who: 'claude-code',
  purpose: 'Give the model standing knowledge about this folder before you type. Claude Code provides the mechanism; LifeOS decides what the file says and which six files it pulls in.',
  trigger: 'Claude Code looks for `CLAUDE.md` in the current directory (which S2 set to `~/.claude`) and in its parents, and for each line beginning with `@` it reads the named file too. This happens once, at start; edits to these files during a session are not seen until the next one.',
  input: '`CLAUDE.md` (a routing table, about a hundred lines) and the six files it names.',
  output: 'Seven markdown files, concatenated, placed into the conversation as the first user-level message. The model has not seen them yet; they are staged.',
  files: [
    { path: 'CLAUDE.md', mode: 'read', note: 'the routing table; mostly pointers, almost no rules' },
    { path: 'LIFEOS/DOCUMENTATION/ARCHITECTURE_SUMMARY.md', mode: 'read', note: 'import 1: what the system is, one screen' },
    { path: 'LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md', mode: 'read', note: 'import 2: your goals, auto-generated from TELOS.md' },
    { path: 'LIFEOS/USER/PRINCIPAL/PRINCIPAL_IDENTITY.md', mode: 'read', note: 'import 3: who you are' },
    { path: 'LIFEOS/USER/DIGITAL_ASSISTANT/DA_IDENTITY.md', mode: 'read', note: 'import 4: who the assistant is' },
    { path: 'LIFEOS/USER/PROJECTS.md', mode: 'read', note: 'import 5: your eight projects and the aliases you use for them' },
    { path: 'LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md', mode: 'read', note: 'import 6: your standing rules' },
  ],
  how: `The [[@-import]] line is the entire mechanism: a line that starts with \`@\` followed by a path. Claude Code reads that file and adds it. It does **not** follow imports inside imported files, which is why all six are listed at the top level of \`CLAUDE.md\` and not chained.

Four of the six imports live in \`LIFEOS/USER/\`. On this machine that folder is a [[symlink]] to \`~/.config/LIFEOS/USER\`, outside the tree that updates overwrite. So the files that make the system *yours* are physically somewhere an update cannot reach, while the file that names them (\`CLAUDE.md\`) is shipped and replaceable. That split is Part 4's whole subject.

Notice the cost: every one of these files is loaded on **every** session, whether or not you use it. That is why \`CLAUDE.md\` is a table of pointers and the big documents are *named* here but not imported; the model loads those on demand.`,
  sources: ['CLAUDE.md', 'LIFEOS/DOCUMENTATION/Config/ConfigSystem.md', 'LIFEOS/DOCUMENTATION/SystemUserBoundary.md'],
  alternatives: [
    { name: 'One big CLAUDE.md with everything inline', tradeoff: 'No imports to break. One file that identity, projects and rules all fight over, overwritten as a whole by any update.' },
    { name: 'Inject everything from a hook instead of imports', tradeoff: 'Full control over what loads when. Slower, invisible to `/context`, and the file is no longer a thing you can open and read.' },
    { name: 'Retrieve context by search each turn', tradeoff: 'Scales to thousands of facts. Might not retrieve the one that mattered, and identity is precisely the fact you never want missed.' },
  ],
  why: 'Identity, projects and rules change on different clocks and are owned by different people (you, versus the LifeOS author). Six small files with one owner each, wired by a shipped table, is the shape that lets updates and your edits coexist. It costs tokens on every session, which is why LifeOS fights to keep these files short.',
  examples: [
    { field: 'distribution', text: 'A new sales rep\'s first-day pack: one cover sheet that points at the price list, the customer list, the credit rules and the route map, each kept by the person who owns it. The cover sheet is reprinted every month; the price list is only reprinted when prices change.' },
    { field: 'school', text: 'A substitute teacher gets a one-page note on the desk: where the register is, which two pupils need the front row, what the class was doing yesterday. The note is short so it gets read; the full curriculum stays on the shelf.' },
  ],
  payloads: [
    { label: 'the six lines that do the work (from CLAUDE.md)', text: `@LIFEOS/DOCUMENTATION/ARCHITECTURE_SUMMARY.md
@LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md
@LIFEOS/USER/PRINCIPAL/PRINCIPAL_IDENTITY.md
@LIFEOS/USER/DIGITAL_ASSISTANT/DA_IDENTITY.md
@LIFEOS/USER/PROJECTS.md
@LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` },
  ],
  watch: 'Seven files are read and staged. Four of them come from outside the update-overwritable tree.',
};

const S5: Step = {
  id: 'S5',
  title: 'The `SessionStart` event fires five LifeOS hooks',
  who: 'lifeos',
  purpose: 'Do the things a fresh session needs that no static file can do: repair hooks that lost their execute bit, remember the terminal so later hooks can control it, inject what happened in *previous* sessions, warm the status-bar cache, and merge the shipped settings with your overrides.',
  trigger: 'Claude Code raises the `SessionStart` [[lifecycle event]] and runs every command registered under `hooks.SessionStart` in `settings.json`, in order. Each command gets one JSON object on [[stdin]]. Sync hooks run one after another and Claude Code waits; async hooks are started and forgotten.',
  input: 'One JSON object per hook on stdin: `session_id`, `transcript_path`, `cwd`, `hook_event_name: "SessionStart"`, `source` (`startup`, `resume`, `clear` or `compact`).',
  output: 'Whatever each hook prints on [[stdout]] is added to the conversation as context. `LoadContext` prints a `<system-reminder>` block; the others print a line or nothing. Side effects on disk: a heartbeat file, the freshness cache, a merged `settings.json`.',
  files: [
    { path: 'hooks/HookHealer.hook.ts', mode: 'exec', note: 'registered as "bun <path>" so it can never lose its own exec bit' },
    { path: 'hooks/KittyEnvPersist.hook.ts', mode: 'exec', note: 'saves KITTY_LISTEN_ON / KITTY_WINDOW_ID so Stop hooks can colour the tab later' },
    { path: 'hooks/LoadContext.hook.ts', mode: 'exec', note: 'the one that prints context: active work, advisory findings, learning readback' },
    { path: 'LIFEOS/MEMORY/', mode: 'read', note: 'LoadContext reads MEMORY/WORK (recent sessions) and MEMORY/STATE (progress, advisory findings)' },
    { path: 'LIFEOS/TOOLS/FreshnessCache.ts', mode: 'exec', note: 'async: precomputes the A–F freshness grade that the 🧠 MEMORY line in every reply reads (P2.4)' },
    { path: 'LIFEOS/USER/CACHE/freshness.json', mode: 'write', note: 'the cache FreshnessCache writes and MemoryDeltaSurface reads on every prompt' },
    { path: 'LIFEOS/TOOLS/SettingsBackport.ts', mode: 'exec', note: 'async: pulls hand-edits in settings.json back into the user layer' },
    { path: 'LIFEOS/TOOLS/MergeSettings.ts', mode: 'exec', note: 'async: system defaults + user overrides → settings.json; on this machine both inputs are absent, so it does nothing' },
    { path: 'settings.json', mode: 'write', note: 'the merge\'s output target; unchanged here because the inputs are missing' },
  ],
  hook: {
    name: 'SessionStart registrations',
    event: 'SessionStart',
    matcher: '',
    async: false,
    exitSemantics: 'Exit 0 = fine, stdout becomes context. A SessionStart hook cannot block anything; there is nothing to block yet. A non-zero exit is logged and the session continues.',
  },
  how: `The intended order (from \`hooks/README.md\`) is:

1. **HookHealer** — scans every command in \`settings.json\`, checks the script exists and is executable, and runs \`chmod +x\` on any that lost the bit. Why: the Write tool creates files as 0644, and a hook that is not executable fails silently forever. Prints a 🩹 line only if it fixed something.
2. **KittyEnvPersist** — copies two environment variables to disk. Why: hooks that fire later (at Stop, at SessionEnd) run without a terminal and could not otherwise find the tab to colour.
3. **LoadContext** — the important one. Reads \`MEMORY/WORK/\` for sessions in the last 48 hours, \`MEMORY/STATE/progress/\` for tracked projects, the advisory findings from the last session's integrity checks, and the learning readback. Prints all of it inside a \`<system-reminder>\` block on stdout. Skipped for [[subagent]]s.
4. **FreshnessCache** (async) — computes the A–F freshness grade and the stalest file, writes \`USER/CACHE/freshness.json\` so the per-prompt memory hook (P2.4), which prints the 🧠 MEMORY line in every reply, reads a number instead of computing one.
5. **SettingsBackport + MergeSettings** (async) — the settings pipeline. Backport copies any hand edit you made to \`settings.json\` into the user layer; Merge rebuilds \`settings.json\` from the shipped defaults plus your layer. That is the design. On this machine neither \`settings.system.json\` nor \`USER/CONFIG/settings.user.json\` exists, so both steps run and change nothing; your \`settings.json\` is the only copy.

**On this machine the list is longer than five.** \`settings.json\` registers KittyEnvPersist and LoadContext twice: once as \`\${PAI_DIR}/hooks/…\` (a leftover from the PAI-era install) and once as \`$HOME/.claude/hooks/…\`. Both paths resolve to the same file, so LoadContext runs twice per start and prints its context twice. They date from the migration that built this file; a merge that only ever adds could not have removed them, and today the merge does not even have inputs to run on. The file tree on the right marks every duplicate with ⚠. This is not a LifeOS bug; it is what "an update never deletes your entries" costs.`,
  sources: ['hooks/README.md:L163-L192', 'hooks/LoadContext.hook.ts:L1-L40', 'hooks/HookHealer.hook.ts:L1-L30', 'settings.json'],
  alternatives: [
    { name: 'Put previous-session context in a file and import it', tradeoff: 'Simpler and visible in `/context`. The file would have to be rewritten at every session end, and it could not react to *this* start (resume vs fresh).' },
    { name: 'One hook that does everything', tradeoff: 'One process instead of five. One crash takes all five down, and you cannot make one of them async.' },
    { name: 'No session-start hooks; let the model ask', tradeoff: 'Zero start-up cost. The model does not know there is anything to ask about; unfinished work from yesterday is simply gone.' },
  ],
  why: 'A static file cannot know what happened yesterday or whether this is a resume. A hook can. Splitting into five keeps each one small enough to reason about and lets the slow ones (freshness, merge) run async so the prompt box appears fast. The cost is that hook order and hook duplication are invisible unless you read `settings.json`, which is exactly what this page makes you do.',
  examples: [
    { field: 'distribution', text: 'The morning depot routine before the first van leaves: check every scanner is charged (HookHealer), note which bay each van is in (KittyEnvPersist), read yesterday\'s exceptions log aloud to the crew (LoadContext), print the day\'s stock summary once so nobody recounts it (FreshnessCache), and apply last night\'s price-list update to the handhelds (MergeSettings).' },
    { field: 'hospital', text: 'Shift handover on a ward. The incoming nurse does not read the whole patient file; she gets a handover sheet of what changed overnight and what is still open. That sheet is LoadContext. The bed-board update is the async cache.' },
  ],
  payloads: [
    { label: 'stdin — what every SessionStart hook receives', text: `{
  "session_id": "0f3c2a…",
  "transcript_path": "/home/<you>/.claude/projects/-home-<you>--claude/0f3c2a….jsonl",
  "cwd": "/home/<you>/.claude",
  "hook_event_name": "SessionStart",
  "source": "startup"
}` },
    { label: 'stdout of LoadContext — becomes context (real shape, contents abbreviated)', text: `✅ LifeOS session ready...

<system-reminder>
LifeOS Dynamic Context (Auto-loaded at Session Start)

## Advisory Findings
**Advisory findings from the last session (12):**
  [memory-dirs] a MEMORY subfolder is listed as active but does not exist on disk …
  …and 9 more — see MEMORY/STATE/events.jsonl

## Active work (last 48h)
  - <slug> · phase: climbing · 3/12 claims
</system-reminder>` },
    { label: 'stdout of HookHealer — only when something needed fixing', text: '🩹 HookHealer: chmod +x hooks/SomeNew.hook.ts (was 0644)' },
  ],
  without: 'Without this: nothing from previous sessions reaches the model at start, no active-work summary, no advisory findings, and a hook that lost its execute bit stays broken until a human notices.',
  watch: 'Five programs run in sequence (two of them twice on this machine). One of them prints a block of text that will sit in the conversation before your first word.',
};

const S6: Step = {
  id: 'S6',
  title: 'Claude Code assembles the context',
  who: 'claude-code',
  purpose: 'Turn everything gathered so far into the one thing a model can read: a single ordered pile of text. Nothing new is created here; the order is the decision.',
  trigger: 'Automatic, after the SessionStart hooks return. Claude Code builds the message list it will send on the first turn.',
  input: 'Its own base system prompt; the appended `LIFEOS_SYSTEM_PROMPT.md` (S3); `CLAUDE.md` plus six imports (S4); every SessionStart hook\'s stdout (S5); the tool definitions it will offer the model.',
  output: 'One assembled [[context]], in memory, ordered from most to least authoritative. Not yet sent anywhere.',
  files: [
    { path: 'process memory', mode: 'read', note: 'nothing on disk; the assembled context lives only inside the running claude process', virtual: true },
  ],
  how: `Order is authority. From the top:

1. **Claude Code's own system prompt** — Anthropic's instructions about tools, safety and format. You never see it and cannot change it.
2. **\`LIFEOS_SYSTEM_PROMPT.md\`, appended** — the LifeOS constitution, at the same level as Anthropic's text. This is where "never assert without verification" and the output format live. Being *here* rather than in \`CLAUDE.md\` is why the model treats them as rules rather than suggestions.
3. **\`CLAUDE.md\` and its six imports** — delivered as a user-level message, below the system prompt. Weighed, not obeyed.
4. **Hook output** — every \`<system-reminder>\` from S5, also at message level.
5. **Tool definitions** — the list of things the model may ask for: Read, Write, Bash, the skills, any MCP tools.

The point that matters for a rookie: **all of this costs [[token]]s on every turn, forever**. The [[context window]] is finite. Every line in an imported file is a line the model reads before it reads your question. That single fact explains most of LifeOS's design choices: short identity files, on-demand documentation, hooks that print one line instead of a page.`,
  sources: ['LIFEOS/DOCUMENTATION/Config/ConfigSystem.md', 'hooks/LoadContext.hook.ts:L1-L40', 'LIFEOS/LIFEOS_SYSTEM_PROMPT.md:L1-L40'],
  alternatives: [
    { name: 'Send only the system prompt and let the model fetch the rest', tradeoff: 'Small first turn. The model must decide to fetch, and might not; identity becomes optional.' },
    { name: 'Compress everything into a summary first', tradeoff: 'Fewer tokens. A summary of your rules is not your rules; the one clause that mattered is the one the summariser dropped.' },
    { name: 'Put rules and identity all in the system prompt', tradeoff: 'Maximum authority for everything. Maximum rigidity too, and Claude Code offers only one file-append flag, so it would all be one file again.' },
  ],
  why: 'LifeOS accepts the token cost in exchange for certainty: identity and rules are present on every turn, no fetch required. It pays that cost down by keeping the always-loaded set small and pushing everything else behind pointers. The choice of *which* level each thing goes to (constitution above, routing table below) is the most important design decision in Part 1, and it is invisible unless you know this step exists.',
  examples: [
    { field: 'distribution', text: 'The driver\'s clipboard before pulling out: the company rules on top (signed, cannot be changed on the road), then today\'s route sheet, then yesterday\'s notes about which customer\'s gate sticks. Same information every day, in the same order, and the order tells the driver what wins when two sheets disagree.' },
    { field: 'newsroom', text: 'A reporter\'s brief: the paper\'s legal rules first (unchangeable), then the editor\'s notes for this story, then the clippings from last time. Every page in that folder is a page the reporter reads before writing a word, so the folder is kept thin.' },
  ],
  payloads: [
    { label: 'the assembled order (what the model will receive, top to bottom)', text: `[system]  Claude Code base prompt (Anthropic)
[system]  + LIFEOS_SYSTEM_PROMPT.md            ← --append-system-prompt-file
[user]    CLAUDE.md
[user]    + ARCHITECTURE_SUMMARY.md, PRINCIPAL_TELOS.md, PRINCIPAL_IDENTITY.md,
          DA_IDENTITY.md, PROJECTS.md, OPERATIONAL_RULES.md    ← @-imports
[user]    <system-reminder> … LoadContext stdout … </system-reminder>
[tools]   Read, Write, Edit, Bash, Grep, Agent, Skill, … (+ MCP tools if any)` },
  ],
  watch: 'Nothing runs. Text is stacked in a fixed order. The order is what gives the constitution authority over the routing table.',
};

const S7: Step = {
  id: 'S7',
  title: 'The status line draws for the first time',
  who: 'lifeos',
  purpose: 'Show, without asking, the things you would otherwise have to ask for: usage limits, the memory grade, TELOS progress, the model in use. The bar is the one always-visible surface of the whole system.',
  trigger: 'Claude Code runs the `statusLine.command` from `settings.json` now and then every 5 seconds (`refreshInterval`), piping a JSON object about the session into it, and prints whatever comes back on stdout at the bottom of the terminal.',
  input: 'JSON on stdin from Claude Code (model, working directory, cost so far), plus the cache files the script actually reads most of its numbers from: usage limits, the memory review state and how full the two hot-memory files are, the TELOS percentages.',
  output: 'Nine lines of text. The shipped script produces 23; the wrapper in your USER zone filters and reorders them so the usage line is second and can never be the one clipped off the bottom.',
  files: [
    { path: '~/.config/LIFEOS/USER/CUSTOMIZATIONS/statusline.sh', mode: 'exec', note: 'your wrapper, in the USER zone: runs the shipped script and filters 23 lines to 9' },
    { path: 'LIFEOS/LIFEOS_StatusLine.sh', mode: 'exec', note: 'the shipped script; updates still flow through it' },
    { path: 'LIFEOS/MEMORY/', mode: 'read', note: 'review-state.json: when memory was last reviewed and whether one is due' },
    { path: 'LIFEOS/USER/PRINCIPAL/PRINCIPAL_MEMORY.md', mode: 'read', note: 'measured for the "% FULL" figure on the 🧠 line, never displayed' },
    { path: 'LIFEOS/USER/TELOS/LIFEOS_STATE.json', mode: 'read', note: 'the TELOS dimension percentages the rings show' },
  ],
  how: `Claude Code owns the mechanism: run a command, show its stdout. LifeOS owns the script. And on this machine there is a third layer: \`settings.json\` points not at the shipped \`LIFEOS/LIFEOS_StatusLine.sh\` but at \`~/.config/LIFEOS/USER/CUSTOMIZATIONS/statusline.sh\`, a wrapper you wrote. The wrapper calls the shipped script, then drops the version line, the model list, the quote and the decorative rules, squashes the four-line startup breakdown into one, and moves the usage row to line 2.

Why a wrapper and not an edit? Because the shipped script is in the SYSTEM [[zone]]: the next update overwrites it and your edit dies. The wrapper is in the USER zone, so it survives, and upstream improvements to the real script still flow through it. That is the System/User boundary doing its job on a nine-line shell script.`,
  sources: ['~/.config/LIFEOS/USER/CUSTOMIZATIONS/statusline.sh', 'LIFEOS/LIFEOS_StatusLine.sh', 'settings.json'],
  alternatives: [
    { name: 'Edit the shipped script directly', tradeoff: 'Fastest. Gone at the next update, and you will not notice until the bar looks wrong.' },
    { name: 'Copy the shipped script into USER and point at the copy', tradeoff: 'Survives updates. Now you maintain a fork and never receive upstream fixes.' },
    { name: 'No status line', tradeoff: 'Nothing to maintain. You ask "how much of my weekly limit is left?" and spend a turn every time.' },
  ],
  why: 'A wrapper that filters the shipped output is the only shape that survives updates *and* keeps receiving them. It costs a small fragility: if the upstream script changes its line layout, the wrapper\'s patterns stop matching and the bar shows too much again. That is a known, visible failure, which beats a silent one.',
  examples: [
    { field: 'distribution', text: 'The depot\'s wall screen shows vans out, orders picked, and cash collected today. Head office ships the screen software; the depot manager configured which three numbers are big and which twenty are small. When head office updates the software, the manager\'s layout survives because it is stored on the depot side.' },
    { field: 'airport', text: 'The departures board runs on the airport\'s software, but each airline chooses which of its flights are highlighted and how. The board is upgraded by the airport; the highlights belong to the airline.' },
  ],
  payloads: [
    { label: 'stdin — what Claude Code pipes to the status-line command (abbreviated shape)', text: `{
  "session_id": "0f3c2a…",
  "model": { "id": "claude-…", "display_name": "…" },
  "workspace": { "current_dir": "/home/<you>/.claude" },
  "cost": { "total_cost_usd": 0.0, "total_duration_ms": 1200 },
  "context_window": { … }
}` },
    { label: 'stdout — the nine lines (values illustrative)', text: `LifeOS  ·  <model>  ·  ~/.claude
📊  5HR 8% ↻ 20:59  │  WK 10% ↻ SAT 13:59  │  FB 0%  │  SUB CR:$0/$50·OFF
🧠  OK · REVIEWED 2H AGO · NEXT IN 5 TURNS · 33% FULL
… (six more lines: TELOS rings, active work, session name)` },
  ],
  without: 'Without this: Claude Code shows its own default bar (model and folder). No usage percentages, no memory grade, no TELOS rings, and you spend a turn asking for each.',
  watch: 'A script runs every five seconds and prints nine lines. Your wrapper sits between Claude Code and the shipped script.',
};

const S8: Step = {
  id: 'S8',
  title: 'The prompt box appears. No model has been called.',
  who: 'claude-code',
  purpose: 'Wait for you. This step exists on the page to make one fact impossible to miss: everything in Part 1 happened without a language model.',
  trigger: 'Claude Code finishes start-up and shows its input prompt.',
  input: 'Nothing.',
  output: 'A blinking cursor, a status bar, and a session that is fully prepared but has not spent a single [[token]].',
  files: [
    { path: 'nothing on disk', mode: 'read', note: 'no file is touched; the session is idle', virtual: true },
  ],
  how: `Look back at S1–S7: a shell substitution, a small program, a JSON read, seven markdown reads, five scripts, a text assembly, a status script. Every one of those is ordinary code doing ordinary things with files. The [[model]] has not been involved once.

This is the fact that turns "AI system" from magic into engineering. The intelligence has not started; the *preparation* has. And preparation is the part you can read, test, break and rebuild. When Part 2 begins with you pressing Enter, the first thing that happens is still not the model: nine more hooks run first.`,
  sources: ['LIFEOS/DOCUMENTATION/CoreComponents.md', 'hooks/README.md:L120-L135'],
  alternatives: [
    { name: 'Call the model at start to say hello', tradeoff: 'Friendlier. Spends tokens on every session for nothing, and the greeting becomes the thing that goes stale.' },
    { name: 'Pre-warm the model with the context so the first reply is faster', tradeoff: 'Saves a second on the first turn. Costs a full context send even if you close the terminal without typing.' },
  ],
  why: 'LifeOS spends nothing until you ask for something. That is the same instinct as the rest of the system: dynamic range, from trivial to heavy, discovered from the work rather than assumed at the door. The cost is a plain cursor instead of a greeting, which is the right trade.',
  examples: [
    { field: 'distribution', text: 'The van is loaded, the route sheet is on the dash, the fuel card is set, the depot knows van 7 is out. The engine is off. Nothing has been delivered and no fuel has burned. Everything that decides how the day goes has already happened.' },
    { field: 'kitchen', text: 'Mise en place is done: every ingredient chopped, every pan on its hook, the ticket rail empty. No dish has been cooked. The first order is the first time the stove matters.' },
  ],
  watch: 'Idle. Prepared. Zero tokens spent. Press Enter to start Part 2.',
};

export const part1: Section = {
  id: 'p1',
  number: 1,
  title: 'Session start',
  subtitle: 'The eight moves from typing `lifeos` to the prompt box, every file they touch, and the one fact they share: no model is involved.',
  kind: 'flow',
  toggle: true,
  body: `
This part answers your question exactly as you asked it: *LifeOS is loaded in the terminal; what parts are involved, what files are activated, how, and why?*

Eight moves. Each one has the same nine fields. The file tree on the right lights up the files each move reads (blue), writes (orange) or runs (green). Flip **Strip LifeOS** at the top to grey out the 🟩 moves and see what plain \`claude\` does on its own: five of the eight survive, and three vanish.

Everything on this page was verified against **your** machine, not the public repository: the alias on line 132 of your \`.bashrc\`, the launcher, your \`settings.json\`, and the fire order in the hooks README. Where your machine differs from the shipped design, the page says so (see the duplicate registrations in S5).
`,
  steps: [S1, S2, S3, S4, S5, S6, S7, S8],
  breakIt: [
    'Predict first, then run `claude` (not `lifeos`) from `~/.claude` and ask "quote the first rule in your system prompt". Then run `lifeos` and ask the same. Write the two answers side by side. Which move (S2 or S3) made the difference?',
    'Predict what `/context` will list, then run it inside a `lifeos` session. Count the memory files. Does it show seven (CLAUDE.md + six imports) or something else? If something else, which move is wrong on this page?',
    'Comment out one `@`-import line in `CLAUDE.md` (put `#` in front), start a fresh session, and ask a question that file would answer. Notice there is no error anywhere. Put the line back. Log the gap in `build/notes/FAILURES.md` under `context`.',
    'Open `settings.json` and find the two `LoadContext` registrations under SessionStart. Predict what happens if you delete the `${PAI_DIR}` one: does anything break? Do not delete it yet; write the prediction down and ask me.',
  ],
  recall: [
    'Close this page. List the eight moves in order from memory, with the colour of each.',
    'Which single flag turns `claude` into `lifeos`? Which move adds it?',
    'Name the four files that come from outside the update-overwritable tree, and say why they live there.',
    'At the end of S8, how many times has a model been called? Why does that matter?',
  ],
  transfer: [
    'Write the eight-move start-up of 9T ERP\'s backend as the same table: the `.bat` you run, what it reads (`application.yml`), what it wires (Flyway migrations), what it prints (the startup banner), and the moment it is "ready but idle" (listening on :8081 with no request yet).',
    'For the 9T agent in Part 5: which of these eight moves would exist unchanged, which change, and which disappear? (Hint: S1, S2 and S7 are terminal things; a service has none of them.)',
  ],
};
