# Alternatives, part A · decisions D1 to D8

**Written 2026-09-25.** Eight decisions the course makes in steps 2 to 12, each with the real options, how each
one is built, and a verdict for two worlds: a personal system (myos, LifeOS) and a product for strangers (the
RS.GE Agent). Companion to `COURSE.md`; the vendor facts behind the COMPARE tables are in `research/01…05`.

**How every claim here was checked.** Every LifeOS path was opened under `~/.claude` on 2026-09-25 (LifeOS
7.40.4, Claude Code 2.1.282). Every RS.GE path was opened under `/mnt/c/Users/Boris/Dell/Projects/APPS/RS.GE_Agent`
(ISA progress 19/37 on 2026-09-22). Claims about other products carry a URL fetched on 2026-09-25, or a pointer
into `research/0N-*.md` (fetched 2026-09-24). Where a fact could not be checked it says "not verified".

**Your files today, so the exercises do not depend on them:** `build/myos/.claude/hooks/guard.ts` line 46 still
has the broken `/\/g` pattern from step 6.2, so the guard fails open; there is no `myos` alias in `~/.bashrc`;
Part 2's `data/`, `config/` and `tests/` folders do not exist yet. Every "Try it" below creates its own files under
`build/myos/try/dN/` (or `~/try-d5/` for the one that needs a real Linux symlink) and touches nothing you built.

Words used throughout, once: **token** = the unit the model reads and is billed in, about three quarters of a word;
**frontmatter** = the `---` block at the top of a markdown file that holds settings; **stdin / exit code** = what
is piped into a program, and the number it returns when it ends; **glob** = a file pattern such as `data/**`;
**symlink** = a signpost file that points at another folder; **migration** = a numbered SQL file that changes a
database once, in order; **RLS** = row-level security, the database refusing to show rows that are not yours;
**MCP** = the open protocol that lets any AI app call a tool server; **schema** = the declared shape of an input.

---

<a id="d1"></a>
## D1 · How context reaches the model

**The question:** How does the text the model needs on a turn (who you are, where things live, the rules of this
folder) get in front of it, and what does each road cost on every turn?
**Where the course meets it:** steps 2, 4, 6 · **LifeOS today:** a routing-table `~/.claude/CLAUDE.md` with six
top-level `@` imports (lines 6 and 9 to 13: `ARCHITECTURE_SUMMARY`, `PRINCIPAL_TELOS`, `PRINCIPAL_IDENTITY`,
`DA_IDENTITY`, `PROJECTS`, `OPERATIONAL_RULES`), plus hooks that inject per-prompt context · **RS.GE today:** no
CLAUDE.md in the repo; `packages/core/src/agent-loop.ts` builds each turn in code (`AgentTurn { prompt,
systemPrompt? }`, line 25 to 30) and per-tenant facts arrive as rows through `packages/memory/src/prefill.ts`.

**In kid words:** five ways to brief a new worker: a note left on the desk of the room he walks into, a note that
says "the folder is on shelf 3", a card the office prints fresh for every customer, a library he searches only when
he needs a fact, and a sticky note that appears only when he opens one particular drawer.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · Context file found by folder | `./CLAUDE.md` or `./.claude/CLAUDE.md`; `~/.claude/CLAUDE.md`; parents load at launch, subfolders on demand; `AGENTS.md` read only when no `CLAUDE.md` is in the folder or above it | zero code; the tool does the loading; shared through git | paid every turn; fails silently; depends on the launch folder | one person, one machine, stable facts |
| 2 · `@` import vs plain pointer | `@USER/IDENTITY.md` (expanded at launch, up to four hops) vs a table row `USER/ · identity` (loads nothing) | an import is guaranteed present; a pointer is free until needed | imports cost tokens forever; a pointer relies on the model choosing to read | import what must always be true; point at the rest |
| 3 · Built in code per turn (RS.GE) | `sdk.query({ prompt, options: { systemPrompt } })`; facts from `withTenant` + `currentProfileFacts` | per-customer; tested like code; no folder needed | a developer changes a sentence; must set `settingSources` or the server's own `~/.claude` leaks in | many users, a service, nobody at a keyboard |
| 4 · Retrieved on demand | LifeOS `LIFEOS/TOOLS/MemoryRetriever.ts` (BM25 top 5, threshold 0.20) injected as `## RELEVANT MEMORY`; Anthropic's client-side memory tool | knowledge bigger than the context window; only the relevant slice loads | a miss is silent; needs an index or a tool call | the archive is large |
| 5 · Path-scoped rule | `.claude/rules/csv.md` with `paths: ["data/**"]`; `~/.claude/rules/` for personal ones; Cursor globs; Copilot `applyTo` | paid only when a matching file is touched; deterministic | blind to what you asked; skipped if `project` is left out of `--setting-sources` | a rule belongs to a file type or folder |
| 6 · Injected by a hook each prompt | `UserPromptSubmit` hook prints `additionalContext`; LifeOS `hooks/MemoryTurnStart.hook.ts`, `LoadContext.hook.ts` | computed fresh (dates, state, memory deltas); the model only reads it | a program to maintain; a crashing hook injects nothing and says nothing | facts that change daily |

### How each one is built
**1 · Context file found by folder.** Claude Code looks for `CLAUDE.md` in the launch folder and every parent,
loads them at start, and loads a subfolder's file when it first reads a file there. `AGENTS.md` (the open format,
60-plus tools) is read only when there is no `CLAUDE.md` in the folder or above it; your `~/.claude/CLAUDE.md`
does not count for that test. Codex concatenates `AGENTS.md` from the git root down to your folder, nearest wins,
32 KiB cap. Gemini joins `GEMINI.md` from global, workspace and subfolders.

**2 · `@` import vs plain pointer.** One character decides the cost:
```
@USER/IDENTITY.md          ← loaded into context at launch; may import further, up to four hops
| `USER/` | identity |     ← a pointer: loads nothing, tells the model where to look
```
Relative paths resolve from the file that holds the import, not from the shell. This is why the real LifeOS lists
its five identity files at the top of `CLAUDE.md` instead of letting `PRINCIPAL_IDENTITY.md` import them: Claude
Code does follow transitive imports (four hops), but LifeOS chose one flat list so nothing hides two hops away.

**3 · Built in code per turn.** RS.GE has no folder to find a file in. The turn is a typed object:
```ts
// packages/core/src/agent-loop.ts, lines 25-30 and 108-121
export interface AgentTurn { readonly prompt: string; readonly systemPrompt?: string; readonly rung?: string; readonly maxTurns?: number; }
const response = sdk.query({ prompt: turn.prompt, options: { model, env, canUseTool, allowedTools, ...(turn.systemPrompt === undefined ? {} : { systemPrompt: turn.systemPrompt }) } });
```
What the tenant already told the product comes from rows: `withTenant(sql, tenantId, tx => currentProfileFacts(tx))`
in `packages/db/src/repositories.ts` (line 258), turned into proposals by `packages/memory/src/prefill.ts`, every
one labelled `source: memory` with its provenance. Nothing calls the loop yet (COURSE step 6 MIRROR), and the loop
never sets `settingSources`, so a live server would also load the server user's `~/.claude` (Linear BOR-148).

**4 · Retrieved on demand.** LifeOS: `getRelevantContext(query)` in `LIFEOS/TOOLS/MemoryRetriever.ts` scores the
`MEMORY/KNOWLEDGE` notes with BM25 (a word-frequency search, no model) and injects the top five above a threshold
(`LIFEOS/DOCUMENTATION/Memory/MemorySystem.md`, line 172). Anthropic's memory tool (`memory_20250818`) is the API
version of the same idea: the model asks to `view /memories/...`, your code returns the file. RS.GE implements that
handler in `packages/core/src/memory-handler.ts` with a Postgres store, and its header says a note "can never move
a number".

**5 · Path-scoped rule.** A markdown file with frontmatter:
```md
---
paths: ["data/**", "**/*.csv"]
---
Every file under data/ is synthetic. Never paste real 9 Tones rows here.
```
Placed in `.claude/rules/`, it loads only when Claude touches a matching file. Without `paths:` it is always on.
Neither `~/.claude/rules/` nor a `paths:` rule exists anywhere under `~/.claude` today (checked 2026-09-25).

**6 · Injected by a hook.** A program registered on `UserPromptSubmit` prints JSON:
`{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"today is …"}}`. LifeOS's
`MemoryTurnStart.hook.ts` and `LoadContext.hook.ts` do this (registered in `~/.claude/settings.json`); D7 shows the
same shape used for routing.

### Better or worse?
- **For a personal system (myos, LifeOS):** files, in this order: import what must be true every turn (identity,
  purpose, the operational rules), point at the rest, use a `paths:` rule for anything that belongs to a folder,
  and let a hook inject what changes daily. LifeOS does exactly this. The cost is tokens and you can see it:
  `/context` is the only honest report.
- **For a product for strangers (the RS.GE Agent):** build the packet in code from rows, per tenant, and test it.
  A folder file is wrong three times over: a service has no launch folder, one file cannot hold ten thousand
  identities, and anything the server user keeps in `~/.claude` would leak into a taxpayer's session.
- **The trap:** silence. A context file that did not load raises no error, and a loop that omits `settingSources`
  loads everything. Both are the same lesson: check what loaded, never assume it.

### Try it (5 min)
Make a rule that only wakes up when a data file is opened, and watch your parent `CLAUDE.md` load with it.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
mkdir -p try/d1/.claude/rules try/d1/data
printf -- '---\npaths: ["data/**"]\n---\nEvery file under data/ is synthetic demo data. When you use this rule, say the exact words SYNTHETIC-RULE-LOADED.\n' > try/d1/.claude/rules/data.md
echo 'date,net' > try/d1/data/demo.csv
cd try/d1
claude --setting-sources project,local -p "Read data/demo.csv and tell me what rule applies to that folder." --output-format json | jq -r .result
claude --setting-sources project,local -p "Which instruction files are loaded right now? File names only." --output-format json | jq -r .result
```
Expected: the first answer contains `SYNTHETIC-RULE-LOADED` (the rule attached when the file was read); the second
names `CLAUDE.md` from the parent folder `myos` (parents load at launch) and, if it lists the rule at all, notes it
is path-scoped. If the first answer has no marker, the model answered without reading the file: ask again with
"use the Read tool on data/demo.csv first".

| Command | What it does |
|---|---|
| `mkdir -p try/d1/.claude/rules try/d1/data` | make the two folders, and any missing parents, no error if they exist |
| `printf -- '…' > file` | write the rule file; `--` stops printf reading the leading `---` as an option; `\n` is a line break |
| `echo 'date,net' > try/d1/data/demo.csv` | a one-line file that matches the glob `data/**` |
| `claude --setting-sources project,local -p "…"` | one headless run, this folder's settings only, never your real LifeOS |
| `--output-format json \| jq -r .result` | print only the final answer text |

Clean up when done (only what you created): `cd ../.. && rm -r try/d1`.

### Sources
- Claude Code memory docs, sections "How CLAUDE.md files load", "Import additional files", "Organize rules with .claude/rules/", "AGENTS.md" (fetched 2026-09-25): https://code.claude.com/docs/en/memory
- Anthropic memory tool, "How it works" and "Path traversal protection" (fetched 2026-09-25): https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- Codex, Gemini, Cursor, Copilot context files: `research/02-context-files-other-systems.md` (summary table)
- Agentic search vs an index; "just in time" retrieval: `research/04-tools-and-data-access.md` §2 and §4
- LifeOS: `~/.claude/CLAUDE.md` lines 6, 9-13 · `~/.claude/LIFEOS/TOOLS/MemoryRetriever.ts` · `~/.claude/LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` line 172 · `~/.claude/hooks/MemoryTurnStart.hook.ts`, `LoadContext.hook.ts` · `~/.claude/settings.json` (UserPromptSubmit, SessionStart)
- RS.GE: `packages/core/src/agent-loop.ts` lines 25-30, 108-121 · `packages/memory/src/prefill.ts` header · `packages/db/src/repositories.ts` line 258 · `packages/core/src/memory-handler.ts` lines 1-17 · COURSE.md step 6 MIRROR (BOR-148)

---

<a id="d2"></a>
## D2 · Where the constitution (system prompt) lives and how it is built

**The question:** Where do the rules that must outrank the conversation live, and what builds the text that lands in
the model's `system` field on every request?
**Where the course meets it:** steps 3, 6 · **LifeOS today:** one file, `~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md`,
appended by the launcher `~/.claude/LIFEOS/TOOLS/lifeos.ts` (`cmdLaunch`, lines 503 to 506, and again in `cmdPrompt`,
lines 704 to 707) with `--append-system-prompt-file`; the alias in `~/.bashrc` line 132 · **RS.GE today:**
`packages/core/src/agent-loop.ts` line 117 passes an optional `turn.systemPrompt` string into the Agent SDK. Nothing
composes it: no file, no function, no test. `model-client.ts` only picks the model (`config/runtime.json` →
`model.rungs`) and holds the tenant's key. The plumbing for a prompt version exists (`audit_events.prompt_version`
in migration `0003`, `ModelInvocation.promptVersion` in `model-client.ts` line 62) and no caller fills it.

**In kid words:** the sign on the wall. You can bolt your sign under the shop's own sign (append), take the shop's
sign down and hang only yours (replace), have a printer make a fresh sign for every customer from a template and
that customer's file (composed in code), keep one sign with blanks to fill in (template), or hang no sign and rely
on the note on the desk (rules only in the context file).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · Append with a launch flag | `claude --append-system-prompt-file SYSTEM_PROMPT.md`; LifeOS `lifeos.ts` 503-506 | keeps Claude Code's own tool and safety text; one file you edit by hand | needs a launcher or alias; one prompt per launch | a personal system |
| 2 · Replace the whole prompt | `--system-prompt-file`; SDK `systemPrompt: "…"`; Gemini `GEMINI_SYSTEM_MD`; Codex `model_instructions_file` | every word is yours | the built-in tool guidance and safety rules are gone unless you rewrite them | a non-coding agent with its own identity |
| 3 · Composed in code per request from `config/` + data | `buildSystemPrompt(tenant, form)` reads versioned `config/prompts/*.md`, renders the tenant card, returns `[static, BOUNDARY, dynamic]` + a version | per tenant, per form, tested, versioned, auditable | a developer for every wording change; tenant text at the top authority level if you are careless | a product |
| 4 · Template with variables | `{{VARIABLE}}` inside XML tags; LifeOS `{PRINCIPAL.NAME}` placeholders; RS.GE `t(key, {vars})` | one file, many instances | no logic; values must be escaped | one shape, few blanks |
| 5 · SDK preset `claude_code` + `append` | `systemPrompt: { type: "preset", preset: "claude_code", append: "…" }` | the CLI's prompt plus yours; `excludeDynamicSections` for cache | only for Claude-Code-like agents | a coding agent built on the SDK |
| 6 · Rules only in the context file | a "Rules" section in `CLAUDE.md` | nothing to launch | lands among the messages: weighed, not obeyed (step 3 pressure test) | a toy |

### How each one is built
**1 · Append with a flag.** The whole mechanism is one line in a launcher:
```ts
// ~/.claude/LIFEOS/TOOLS/lifeos.ts, lines 503-506
const systemPromptFile = options.systemPrompt ?? join(CLAUDE_DIR, "LIFEOS", "LIFEOS_SYSTEM_PROMPT.md");
if (existsSync(systemPromptFile)) args.push("--append-system-prompt-file", systemPromptFile);
```
The text lands in the request's `system` field after Claude Code's own instructions, is resent every turn and is
never summarised away. The step 3 alias is the same flag without the program.

**2 · Replace.** `claude --system-prompt-file mine.md`, or in the SDK `systemPrompt: customPrompt`. The SDK docs
say plainly: "The SDK sends only what you provide", and their comparison table marks default tools "Lost (unless
included)" and built-in safety "Must be added". When `systemPrompt` is omitted altogether, the SDK uses a
*minimal* prompt that "omits … security and safety instructions". That is RS.GE's state today whenever
`turn.systemPrompt` is undefined.

**3 · Composed in code per request.** This is the option you asked about ("how is it built based on config/"). The
RS.GE repo does not have it yet; here is the shape that fits its conventions:
```
config/prompts/
  constitution.v3.md                 # never changes per tenant; the version is in the file name
  declaration/vat.v2.md              # the rules of one form, one file per form version
  tenant-card.template.md            # "Taxpayer {tin}, filing mode {filing_mode}, period {period}"
packages/core/src/system-prompt.ts   # the composer
test/system-prompt.test.ts           # snapshot per (form, locale); "static part contains no tenant text"
```
```ts
// packages/core/src/system-prompt.ts (design, not in the repo)
import { SYSTEM_PROMPT_DYNAMIC_BOUNDARY } from "@anthropic-ai/claude-agent-sdk";
export function buildSystemPrompt(input: { declarationType: string; definitionVersion: string; facts: ProfileFactRow[]; locale: string }) {
  const constitution = readPrompt("constitution");                                  // config/prompts/constitution.v3.md
  const form = readPrompt(`declaration/${input.declarationType}`);                    // config/prompts/declaration/vat.v2.md
  const card = t("prompt.tenantCard", cardVars(input.facts), input.locale);           // typed facts only, never free text
  return { text: [constitution.text, form.text, SYSTEM_PROMPT_DYNAMIC_BOUNDARY, card],
           promptVersion: `${constitution.version}+${form.version}` };                // → audit_events.prompt_version
}
```
The SDK's array form with `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` sends the static part as one cached block and the
per-request part as a second one; the CLI equivalent is a line containing only `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__`
inside a `--system-prompt-file` (v2.1.275+). `agent-loop.ts` would pass `text` as `systemPrompt` and
`modelClient.authorize({ modelId, purpose, promptVersion })` would write the version into the audit row that already
has the column. Why it is an alternative: it is the only road that gives ten thousand tenants different prompts,
proves with a snapshot test what words the model saw, and can say afterwards which prompt version produced a
filing. Why it is worse for you personally: a sentence change is a code change plus a test run.

**4 · Template with variables.** Anthropic's own guidance shows the shape: fixed instructions plus
`{{ANNUAL_REPORT}}`-style blanks inside XML tags. LifeOS SYSTEM files carry `{PRINCIPAL.NAME}` and
`{DA_IDENTITY.NAME}` placeholders (`SystemUserBoundary.md`); RS.GE fills `{placeholders}` in `packages/config/src/i18n.ts`.

**5 · Preset + append.** `systemPrompt: { type: "preset", preset: "claude_code", append: "…" }` keeps everything
the CLI has and adds yours; `excludeDynamicSections: true` moves the per-machine context out of the system prompt
so different machines share a cache entry.

**6 · Rules only in CLAUDE.md.** No mechanism at all: the text arrives as a message. Step 3's BREAK measures how
often "answer in three bullets" survives "ignore the project file". Levels change probability, not certainty.

### Better or worse?
- **For a personal system (myos, LifeOS):** append (1). One file, edited by a human outside the loop, guarded by a
  hook from inside it. Replacing (2) throws away tool guidance you did not write and cannot see.
- **For a product for strangers (the RS.GE Agent):** compose (3) from a static constitution file, a per-form file and
  typed tenant facts, with the boundary marker and a prompt version in every audit row. Until that exists, at least
  pass a fixed constitution: today a turn with no `systemPrompt` runs on the SDK's minimal prompt.
- **The trap:** putting untrusted text at the top authority level. Tenant free text (a document, a chat line) must
  never be composed into the system prompt; RS.GE already keeps documents out of prompts
  (`packages/interview/src/documents.ts`, "no code path from a document to a prompt"). Compose facts, never prose.

### Try it (5 min)
Build a five-line composer: constitution file plus one "tenant" fact, then change the file and see the prompt change
without touching code.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
mkdir -p try/d2/config/prompts
printf '# Constitution v1\nRule: answer in exactly one sentence.\n' > try/d2/config/prompts/constitution.v1.md
cat > try/d2/compose.ts <<'EOF'
// A system prompt composed per "request": one static file + one dynamic line.
const constitution = await Bun.file(`${import.meta.dir}/config/prompts/constitution.v1.md`).text();
const tenant = { name: process.argv[2] ?? "Demo Ltd", mode: process.argv[3] ?? "review_only" };
console.log(`${constitution}\n\n__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__\nTenant: ${tenant.name}. Filing mode: ${tenant.mode}.`);
EOF
bun try/d2/compose.ts "Nine Tones (demo)" fill_and_save > try/d2/prompt.txt && cat try/d2/prompt.txt
claude --setting-sources project,local --append-system-prompt-file try/d2/prompt.txt -p "Who is the tenant and what is the filing mode?" --output-format json | jq -r .result
printf '# Constitution v2\nRule: answer in exactly one sentence, and start it with the word CONSTITUTION.\n' > try/d2/config/prompts/constitution.v2.md
sed -i 's/constitution.v1.md/constitution.v2.md/' try/d2/compose.ts && bun try/d2/compose.ts "Nine Tones (demo)" > try/d2/prompt.txt
claude --setting-sources project,local --append-system-prompt-file try/d2/prompt.txt -p "Who is the tenant?" --output-format json | jq -r .result
```
Expected: the first answer names the tenant and the mode in one sentence; the second starts with `CONSTITUTION`.
The wording came from a file with a version in its name; the code only assembled it.

| Command | What it does |
|---|---|
| `cat > file <<'EOF' … EOF` | write everything between the two `EOF` lines into the file, exactly as typed |
| `import.meta.dir` | the folder of the script itself, so it finds `config/` from any shell folder (see D8) |
| `bun try/d2/compose.ts "…" fill_and_save > try/d2/prompt.txt` | run the composer with two arguments, save its output |
| `--append-system-prompt-file try/d2/prompt.txt` | the composed text goes to the `system` field |
| `sed -i 's/A/B/' file` | replace A with B inside the file, in place: the composer now reads v2 |

### Sources
- Agent SDK, "Modifying system prompts": minimal default, preset + append, custom string, `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`, comparison table (fetched 2026-09-25): https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts
- `claude --help` on this machine (2.1.282): `--append-system-prompt[-file]`, `--system-prompt[-file]`, `--exclude-dynamic-system-prompt-sections`
- Anthropic prompting guide, `{{VARIABLE}}` blanks inside XML tags (the "prompt templates and variables" URL redirected here on 2026-09-25): https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Codex `model_instructions_file` / `developer_instructions`, Gemini `GEMINI_SYSTEM_MD`, Aider `system_prompt_prefix`, Cursor and Copilot none: `research/02-context-files-other-systems.md` (Q4 rows)
- LifeOS: `~/.claude/LIFEOS/TOOLS/lifeos.ts` lines 503-506, 704-707 · `~/.bashrc` line 132 · `~/.claude/LIFEOS/DOCUMENTATION/SystemUserBoundary.md` (placeholders)
- RS.GE: `packages/core/src/agent-loop.ts` lines 27, 98, 117 · `packages/core/src/model-client.ts` lines 62, 153-159 · `packages/db/migrations/0003_rules_audit_billing_secrets.sql` (`prompt_version`, `rules_version`) · `packages/config/src/i18n.ts` · `packages/interview/src/documents.ts` (via COURSE step 10 MIRROR) · `grep -rn systemPrompt packages apps` on 2026-09-25: no composer

---

<a id="d3"></a>
## D3 · How a session starts

**The question:** What runs between "I want the assistant" and the first model call, and who decides the flags?
**Where the course meets it:** step 3 · **LifeOS today:** `~/.bashrc` line 132, `alias lifeos='bun
~/.claude/LIFEOS/TOOLS/lifeos.ts -s ~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md'`, which runs `cmdLaunch()` (lines 492
to 571) and then `claude` · **RS.GE today:** `bun run start` → `apps/agent/src/index.ts` `main()`: refuse if an
operator vendor key is present (exit 1), refuse without the vault key (exit 3), connect, migrate, check the app role
(exit 2), point the audit at Postgres, serve `/health` and the doors on `PORT` or `config/runtime.json`
`health.defaultPort` 8787.

**In kid words:** how you get into the workshop. A nickname you shout (alias). A receptionist who checks your badge,
hands you the folder and only then opens the door (launcher program). A settings card you carry in your pocket
(settings files and `--settings`). A factory that will not open its doors at all if a safety check fails (service
boot guard). A button inside the office software (IDE profile).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · Shell alias | one line in `~/.bashrc`: `alias myos='cd … && claude --setting-sources project,local --append-system-prompt-file SYSTEM_PROMPT.md'` | one line; you can read every flag | not available inside scripts (step 8); no checks; per shell | one person, one machine |
| 2 · Launcher program | LifeOS `lifeos.ts`: check `claude` exists, banner, add the flag, MCP profile, `--resume`, `cd ~/.claude`, strip `ANTHROPIC_API_KEY`, spawn | checks and logic; the same flags for `-p` runs | a program to maintain; the flags are hidden from you | several flags, several checks |
| 3 · Settings and env files, `--settings` | precedence: managed > `--settings` > `.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json`; `--setting-sources`; `CLAUDE_CONFIG_DIR` | declarative; shared through git; no program | an invalid file is silently ignored in `-p`; the system prompt is a flag, not a setting (no settings key found; not verified in the full reference) | a team, project-scoped rules |
| 4 · Service that boots and refuses unsafely | RS.GE `index.ts` exit codes 1-4; `boot-guard.ts` reads `config/vendor-key-env-vars.json` | fail-closed; nobody types; every start identical | must be observable (`/health`, logs) because nobody watches it start | a product |
| 5 · Desktop / IDE profile | VS Code extension bundles its own CLI; shares `~/.claude/settings.json`; `claudeCode.initialPermissionMode`, `environmentVariables`, `claudeProcessWrapper`, `useTerminal` | no terminal; diffs in the editor; same history (`claude --resume`) | extension-only knobs; a system-prompt flag has no GUI box (a wrapper executable could add it: not verified) | you live in the editor |

### How each one is built
**1 · Alias.** The step 3 line, still missing from `~/.bashrc` today. Aliases live in the interactive shell only:
`tests/run-triggers.sh` in step 8 has to spell the flags out.

**2 · Launcher program.** What LifeOS's `cmdLaunch()` does, in order (lines 492 to 571): `requireClaudeCli()`;
`displayBanner()`; push `--append-system-prompt-file`; apply an MCP profile if asked; forward `--resume [id]`;
refuse `--local` in a main checkout that uses worktrees; `process.chdir(~/.claude)` unless `--local`; pass unknown
flags through; send the voice line; then:
```ts
const launchEnv = { ...process.env };
delete launchEnv.ANTHROPIC_API_KEY;          // subscription billing, never API-key billing
launchEnv.CLAUDE_CODE_WORKFLOWS = "1";
const proc = spawn(args, { stdio: ["inherit", "inherit", "inherit"], env: launchEnv });
```
`cmdPrompt()` (lines 694 to 722) repeats the flag for one-shot `-p` runs; its comment records why: "without this,
one-shots ran bare Claude Code".

**3 · Settings files.** Five levels, highest first: managed settings, `claude --settings '{"model":"…"}'` (inline
JSON or a file path), `.claude/settings.local.json`, `.claude/settings.json`, `~/.claude/settings.json`.
`--setting-sources user,project,local` picks which files load at all (myos uses `project,local`).
`CLAUDE_CONFIG_DIR` moves the whole home folder, which is how the course's week-1 trial install stayed separate.
Environment variables are not a level; each pair is decided on its own.

**4 · Service boot.** The order in `apps/agent/src/index.ts` is the design:
```ts
try { assertNoOperatorVendorKey(); } catch { process.exit(EXIT_VENDOR_KEY_PRESENT); }   // before any DB or network
try { assertVaultKeyPresent(); }      catch { process.exit(EXIT_VAULT_KEY_MISSING); }
sql = connect(); await migrate(sql); if (!(await appRoleExists(sql))) throw …;         // exit 2 with databaseHint()
setAuditSink(postgresAuditSink(sql));
Bun.serve({ port, fetch: … /health … });
```
`boot-guard.ts` reads six variable names from `config/vendor-key-env-vars.json`, refuses when `NODE_ENV` is one of
`productionNodeEnvValues` (`["production"]`) and only warns otherwise. The message comes from `config/i18n`.

**5 · IDE profile.** The VS Code extension reads the same `~/.claude/settings.json` as the CLI (hooks, MCP servers,
environment). Extension-only settings: `initialPermissionMode`, `environmentVariables` (for the Claude process),
`claudeProcessWrapper` (an executable used to launch the process), `useTerminal`. `claude --resume` in the terminal
continues an extension conversation.

### Better or worse?
- **For a personal system (myos, LifeOS):** an alias first; a launcher once there is a check worth running before
  the first token. LifeOS's launcher earns its keep with one line: deleting `ANTHROPIC_API_KEY` so a session bills
  the subscription, not the API. That is a money check, and a money check belongs in code.
- **For a product for strangers (the RS.GE Agent):** the service boot with fail-closed guards, in the order "refuse
  before you connect". The launcher is the deploy script; nobody types anything.
- **The trap:** two traps, one per world. Personal: a launcher that hides the flags makes `/context` your only truth,
  and an alias does not exist inside a script. Product: `productionNodeEnvValues` decides what production means; a box
  with `NODE_ENV` unset is treated as development and only *warns* about an operator key.

### Try it (5 min)
A twelve-line launcher that checks, refuses, shows its flags and starts. Nothing in myos is edited.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
mkdir -p try/d3 && cat > try/d3/launch.ts <<'EOF'
// A launcher: check the tool, refuse an unsafe environment, show the flags, start.
const version = Bun.spawnSync(["claude", "--version"]);
if (version.exitCode !== 0) { console.error("refusing: claude is not installed"); process.exit(1); }
if (process.env.ANTHROPIC_API_KEY) { console.error("refusing: ANTHROPIC_API_KEY is set; this machine bills by subscription"); process.exit(2); }
const args = ["claude", "--setting-sources", "project,local", "--append-system-prompt-file", "SYSTEM_PROMPT.md", ...process.argv.slice(2)];
console.error("starting:", args.join(" "));
const proc = Bun.spawn(args, { stdio: ["inherit", "inherit", "inherit"], cwd: `${import.meta.dir}/../..` });
process.exit(await proc.exited);
EOF
bun try/d3/launch.ts -p "Reply with the single word ok."
ANTHROPIC_API_KEY=fake bun try/d3/launch.ts -p "Reply ok"; echo "exit=$?"
```
Expected: run 1 prints `starting: claude --setting-sources project,local …` and then `ok`; run 2 prints the refusal
and `exit=2`, and never starts `claude`. That is LifeOS's key-strip and RS.GE's boot guard in one file.

| Command | What it does |
|---|---|
| `Bun.spawnSync(["claude","--version"])` | run a command and wait; `exitCode !== 0` means it failed or is missing |
| `process.argv.slice(2)` | everything you typed after the script name, passed on to `claude` |
| `cwd: import.meta.dir + "/../.."` | start `claude` in `myos`, two folders above the script, so `SYSTEM_PROMPT.md` is found |
| `ANTHROPIC_API_KEY=fake bun …` | set the variable for this one command only; your shell keeps it unset |
| `echo "exit=$?"` | print the exit code of the command that just finished |

### Sources
- Claude Code settings: "Settings precedence", "Change a setting for one session" (`--settings`), `CLAUDE_CONFIG_DIR` (fetched 2026-09-25): https://code.claude.com/docs/en/settings
- Claude Code in VS Code: "Extension settings", "VS Code extension vs. CLI" (fetched 2026-09-25): https://code.claude.com/docs/en/vs-code
- `claude --help` on this machine (2.1.282): `--settings`, `--setting-sources`, `--bare`, `--agents`, `--plugin-dir`
- Aider searches home → git root → cwd; Gemini's four-tier settings precedence: `research/02-context-files-other-systems.md`
- LifeOS: `~/.bashrc` lines 128-133 · `~/.claude/LIFEOS/TOOLS/lifeos.ts` lines 492-571 (`cmdLaunch`), 694-722 (`cmdPrompt`)
- RS.GE: `apps/agent/src/index.ts` lines 15-18, 21-60, 87 · `packages/core/src/boot-guard.ts` lines 7, 34-39, 70-78 · `config/vendor-key-env-vars.json` · `config/runtime.json` (`health`) · `package.json` scripts · `.env.example`

---

<a id="d4"></a>
## D4 · Where identity and purpose live

**The question:** Where does "who is this person and what do they want" live, so the model has it when it matters
and it stays true as time passes?
**Where the course meets it:** step 4 · **LifeOS today:** markdown imported every session: `LIFEOS/USER/PRINCIPAL/
PRINCIPAL_IDENTITY.md`, `LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md` (auto-generated from `TELOS.md`), `LIFEOS/USER/
DIGITAL_ASSISTANT/DA_IDENTITY.md`, `LIFEOS/USER/PROJECTS.md`, `LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md`; the DA's
name also sits in `settings.json` under `daidentity` · **RS.GE today:** rows. `profile_facts` (migration `0002`)
with `valid_from`, `valid_to`, `source`, `changed_by`, `reason`; `putProfileFact` (`packages/db/src/repositories.ts`
line 201) closes the live row and inserts a new one; `profileFactAt(key, at)` (line 239) answers "what was true on
that day"; a preference is a fact too (`packages/memory/src/preferences.ts`); purpose is the form's own definition
plus `config/rules/*.json`, not a document.

**In kid words:** a card in your wallet (a file), a ledger where a changed line is never erased, only dated and
closed (rows with validity), a wall of pinned notes joined by string (a graph), a phone call to head office before
every answer (an external system fetched per turn), and a tattoo (baked into the system prompt).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · Markdown imported each session (LifeOS) | `@LIFEOS/USER/PRINCIPAL/PRINCIPAL_IDENTITY.md` at the top of `CLAUDE.md`; `TELOS.md` → `GenerateTelosSummary.ts` → `PRINCIPAL_TELOS.md` | readable; you edit it; git history; no code | paid every turn; one person only; "last reviewed" is a promise; contradictions go unnoticed (step 4 BREAK) | one principal |
| 2 · Rows with validity intervals (RS.GE) | `profile_facts(key, value, valid_from, valid_to, source, changed_by, reason)`; close-then-insert | many people; history for free; who, when, why; RLS isolates | a database and migrations; a sentence becomes a key and a value | more than one user, or history is a legal need |
| 3 · Knowledge graph | LifeOS `MEMORY/KNOWLEDGE/{People,Companies,Ideas,Research}/*.md` with typed `related:` links, walked by `LIFEOS/TOOLS/KnowledgeGraph.ts`; Graphiti (temporal graph, validity windows, provenance) | relations and "what changed when" | another store; extraction quality; heavy for one person | many entities with relations |
| 4 · External CRM / API fetched per turn | an MCP server (`.mcp.json` row, tool `mcp__crm__get_contact`) or a `fetch()` in the turn builder; the client-side memory tool is the same shape for the model's own notes | always current; one source of truth; no copy to drift | latency; availability; content arrives untrusted; auth per tenant | the truth already lives elsewhere |
| 5 · Baked into the system prompt | identity text in `--append-system-prompt-file`; LifeOS `settings.json` `daidentity` read by hooks | highest authority; never forgotten | one identity per launch; a restart to change it; the assistant's identity and the person's facts get mixed | the assistant's own name and voice |

### How each one is built
**1 · Markdown imported each session.** `~/.claude/CLAUDE.md` lines 9 to 13 import five USER files; each carries a
`pai-freshness-v1` frontmatter with `last_reviewed`. `PRINCIPAL_TELOS.md` opens with "Auto-generated from TELOS
source files. Do not edit manually", produced by `LIFEOS/TOOLS/GenerateTelosSummary.ts`. Your `myos` copy is
`USER/IDENTITY.md` (54 lines today) and `USER/TELOS.md` (60 lines, `Last reviewed: 2026-09-02`).

**2 · Rows with validity intervals.**
```sql
-- packages/db/migrations/0002_profile_and_filings.sql: a fact is never overwritten
create table profile_facts ( id uuid primary key, tenant_id uuid not null references tenants(id),
  key text not null, value jsonb not null, valid_from timestamptz not null default now(), valid_to timestamptz,
  source text not null references fact_sources(code), changed_by text not null, changed_at timestamptz, reason text );
create unique index profile_facts_current_uidx on profile_facts (tenant_id, key) where valid_to is null;
```
```ts
// packages/db/src/repositories.ts, putProfileFact (line 201): close the live row, open a new one
await tx`update profile_facts set valid_to = now() where key = ${input.key} and valid_to is null`;
await tx`insert into profile_facts (tenant_id, key, value, source, changed_by, reason, correction_id) values (…)`;
```
Keys come from templates in `config/memory/settings.json` (`context.{declarationType}.{context}`,
`preference.{key}`), filled by `packages/memory/src/keys.ts`. There is no preferences table: "a preference is an
interval-versioned profile fact, the same way the vault records consent" (`preferences.ts` header).

**3 · Knowledge graph.** LifeOS's archive is markdown with a typed envelope (`kb-v3`: `id`, `type`, `tags`,
`related`), and `bun LIFEOS/TOOLS/KnowledgeGraph.ts traverse <slug> --hops 2` walks the links. Graphiti is the
product-grade version: "temporal context graphs" where each fact has "a validity window: when it became true, and
when (if ever) it was superseded", with provenance to the source; Neo4j, FalkorDB or Neptune underneath; Apache-2.0.

**4 · External system per turn.** Either a tool the model calls (MCP: `mcp__crm__get_contact`, permissioned by
name) or code that fetches before the model speaks. Anthropic's memory tool shows the client-side shape: the model
asks for `view /memories/taxpayer/profile.md`, your handler serves one tenant's store and must reject every path
outside `/memories`. RS.GE's `memory-handler.ts` does exactly that, twice-validated, with a Postgres store.

**5 · Baked in.** `settings.json` → `daidentity: { name: "LifeOS", … }`; `DA_IDENTITY.md` says the same name and
tells you to keep it in step with `CONFIG/LIFEOS_CONFIG.toml`. Three homes for one fact is the cost of this option.

### Better or worse?
- **For a personal system (myos, LifeOS):** files for identity and purpose (they change slowly and you edit them by
  hand), the graph for people and companies, hook-injected facts for "today". Keep the assistant's name in one
  place, not three.
- **For a product for strangers (the RS.GE Agent):** rows with intervals for everything about a tenant, including
  preferences; purpose is the declaration's definition and the rules table; a document value is a seed with the
  original kept (`filing_lines.value` and `document_value`). Never a file per tenant.
- **The trap:** a file is a snapshot with a date on it that nobody checks; a row answers "what was true in March"
  because it must. And in a product, a fact a tenant typed is data, not an instruction: RS.GE's notes "can never
  move a number", and its typed facts move through functions that carry provenance.

### Try it (5 min)
Build the interval-versioned fact in memory with bun's built-in SQLite, and compare it with your file's only notion of
time.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
mkdir -p try/d4 && cat > try/d4/facts.ts <<'EOF'
// Identity as rows: never overwrite, close the old row and open a new one.
import { Database } from "bun:sqlite";
const db = new Database(":memory:");
db.run(`create table facts (key text, value text, valid_from text, valid_to text)`);
const put = (key: string, value: string, at: string) => {
  db.run(`update facts set valid_to = ? where key = ? and valid_to is null`, [at, key]);
  db.run(`insert into facts values (?, ?, ?, null)`, [key, value, at]);
};
put("filing_mode", "review_only", "2026-03-01");
put("filing_mode", "fill_and_save", "2026-04-15");
const at = (key: string, when: string) =>
  db.query(`select value from facts where key = ? and valid_from <= ? and (valid_to is null or valid_to > ?)`).get(key, when, when);
console.log("in March:", at("filing_mode", "2026-03-20"));
console.log("in May:  ", at("filing_mode", "2026-05-01"));
console.table(db.query(`select * from facts`).all());
EOF
bun try/d4/facts.ts
grep -n 'Last reviewed' USER/TELOS.md
```
Expected: March → `review_only`, May → `fill_and_save`, and a table with two rows, the first closed on 2026-04-15.
The `grep` prints one line: the file knows only when someone last looked at it.

| Command | What it does |
|---|---|
| `import { Database } from "bun:sqlite"` | bun ships a small SQL database; `":memory:"` keeps it in RAM, nothing is written to disk |
| `db.run(sql, [params])` | run a statement with values filled in safely |
| `db.query(sql).get(a, b, c)` | run a query and return the first row |
| `console.table(rows)` | print rows as a table |
| `grep -n 'Last reviewed' USER/TELOS.md` | find the line and its number; the file is only read |

### Sources
- Anthropic memory tool: client-side, `/memories`, path traversal protection (fetched 2026-09-25): https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- Graphiti README: temporal context graphs, validity windows, provenance, databases, license (fetched 2026-09-25): https://github.com/getzep/graphiti
- MCP tool naming and `.mcp.json` (fetched 2026-09-25): https://code.claude.com/docs/en/mcp
- Untrusted content in tool results: `research/04-tools-and-data-access.md` §3
- LifeOS: `~/.claude/CLAUDE.md` lines 9-13 · `~/.claude/LIFEOS/USER/TELOS/PRINCIPAL_TELOS.md` header · `~/.claude/LIFEOS/TOOLS/GenerateTelosSummary.ts`, `KnowledgeGraph.ts` · `~/.claude/LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` lines 375, 846 · `~/.claude/settings.json` `daidentity` · `~/.claude/LIFEOS/USER/DIGITAL_ASSISTANT/DA_IDENTITY.md`
- RS.GE: `packages/db/migrations/0002_profile_and_filings.sql` · `packages/db/src/repositories.ts` lines 201-270 · `packages/memory/src/preferences.ts` header, `keys.ts`, `config/memory/settings.json` (`factKeys`) · `packages/core/src/memory-handler.ts` lines 1-17

---

<a id="d5"></a>
## D5 · The part no update may touch

**The question:** When the system is updated (a release, a deploy, a migration), which files or rows are guaranteed
to survive, and what enforces the guarantee rather than promising it?
**Where the course meets it:** steps 5, 6; the first item on your own checklist · **LifeOS today:** four zones
(`LIFEOS/DOCUMENTATION/SystemUserBoundary.md`); `~/.claude/LIFEOS/USER` → `~/.config/LIFEOS/USER` and
`~/.claude/LIFEOS/MEMORY` → `~/.config/LIFEOS/USER/MEMORY` (both symlinks, `readlink -f` 2026-09-25); the updater
`skills/LifeOS/Tools/OverlaySystem.ts` writes only the trees on its `SYSTEM_TREES` list · **RS.GE today:** product
config in `config/*.json` and code; tenant data in tables keyed by `tenant_id`; `packages/db/migrations/
0004_row_level_security.sql` (ENABLE + FORCE, policy on `app.tenant_id`); `0005_application_role.sql` (`rsge_app`,
because a superuser bypasses RLS); `packages/db/src/migrate.ts` refuses an applied migration whose checksum changed.

**In kid words:** the landlord may repaint the walls but never touch your furniture. Six ways to make sure: keep the
furniture in a different building (symlink out), give the painter a list of walls (whitelist), let your settings win
over the defaults (layering), a bank vault where each customer's box opens only with that customer's key (database
with RLS), your own copy of the whole house (fork), and the way Unix has sorted files since the 1970s (`/usr`,
`/etc`, `/var`).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · Zones + a symlink out of the update tree (LifeOS) | `ln -s ~/.config/LIFEOS/USER ~/.claude/LIFEOS/USER`; zone tables in `SystemUserBoundary.md`; `SystemFileGuard` at write time | a location, not a rule: wiping `~/.claude` cannot reach USER; two private repos | backups must follow the link (your 2026-08-29 rule); shared INTERFACE files (`CLAUDE.md`, `settings.json`) | files on one machine |
| 2 · Whitelist overlay that never deletes (LifeOS) | `OverlaySystem.ts`: `SYSTEM_TREES` list; skips symlinks; backs up `CLAUDE.md` and the system prompt; dry-run by default; `VERSION` last | absence from the list is the safety; your own hooks and skills survive; recoverable | old files are never removed; a renamed file leaves its ghost | updates are file copies |
| 3 · Settings layering, user overrides | Claude Code: managed > `--settings` > local > project > user; LifeOS design `settings.system.json` + `USER/CONFIG/settings.user.json` → `MergeSettings.ts` | defaults update, your keys win | arrays replace unless annotated `{"__merge":"append"}`; a hand edit to a generated file is lost | config, not content |
| 4 · Database split, product config vs tenant rows, RLS (RS.GE) | `enable` + `force row level security`; policy `tenant_id = current_setting('app.tenant_id')`; `set local role rsge_app`; add-only migrations with checksums | the kernel refuses cross-tenant reads; an update is a new migration; history intact | superusers bypass RLS; an edited applied migration stops the boot; tests must run as the app role | many tenants |
| 5 · Fork or branch per user | a fork is "a separate repository with its own settings"; a branch is "part of one repository" | total freedom per user | a merge on every update; N copies to secure; personal data in a repo | every user is a developer |
| 6 · The Unix convention | FHS: `/usr` "shareable, read-only data"; `/etc` "host-specific system configuration"; `/var` "variable data files" | forty years of practice; package managers never overwrite `/etc` | the OS does not enforce it for your tree; you must map it | designing any tree: name the zones first |

### How each one is built
**1 · Zones + symlink.** SYSTEM ships and is overwritten; USER is never touched; INTERFACE is the contract both sides
write; RUNTIME is throwaway. The USER bytes live at the XDG-style path `~/.config/LIFEOS/USER/`; the link under
`~/.claude/` exists only so the `@` imports resolve. `hooks/PreToolGuard.hook.ts` runs `SystemFileGuard.check` before
every Write and Edit and blocks USER-shaped content landing in a SYSTEM file.

**2 · Whitelist overlay.**
```ts
// ~/.claude/skills/LifeOS/Tools/OverlaySystem.ts
const SKIP_DIRS = new Set(["node_modules", ".git", "MEMORY", "USER", "out", ".next"]);              // line 44
const SYSTEM_TREES = [["hooks","hooks"],["skills","skills"],["agents","agents"],["LIFEOS/TOOLS","LIFEOS/TOOLS"], …]; // line 50
if (st.isSymbolicLink()) continue;   // never follow or replace symlinks (USER is one)                 // line 132
const bak = `${dst}.pre-overlay-${stamp()}.bak`;   // CLAUDE.md and the system prompt are backed up first // line 185
```
"Nothing is ever DELETED. A file is written only where the payload ships one at the same relative path." Your
`~/.claude/CLAUDE.md.pre-overlay-2026-08-29T12-14-28-349Z.bak` is that line having run.

**3 · Settings layering.** Claude Code merges five levels; a key at a higher level wins. LifeOS's own doc describes a
merge of `settings.system.json` and `settings.user.json` into a generated `settings.json`; on this machine neither
source file exists (checked 2026-09-25), so `settings.json` is the file edited in practice and the SessionStart
`MergeSettings` command has nothing to merge.

**4 · Database split.**
```sql
-- 0004: unset tenant means NOTHING, never everything
alter table profile_facts enable row level security;
alter table profile_facts force  row level security;
create policy profile_facts_tenant_isolation on profile_facts
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
-- 0005: a superuser bypasses every policy, so tenant queries run as an ordinary role
create role rsge_app nologin;
```
```ts
// packages/db/src/client.ts, withTenant (line 94): one transaction, one tenant
await tx.unsafe(`set local role ${role}`);
await tx`select set_config(${settingName}, ${tenantId}, true)`;
```
Postgres's own words: "Table owners normally bypass row security … a table owner can choose to be subject to row
security with ALTER TABLE ... FORCE ROW LEVEL SECURITY" and "Superusers and roles with the BYPASSRLS attribute always
bypass the row security system". Product-wide values (`rule_versions`, migration `0003`) are deliberately not
tenant-scoped: "a wrong rate is wrong for everyone, so fixing it fixes it once". Every migration file opens with
"Never edit this file once it has been applied"; `migrate.ts` (lines 70 to 78) enforces it with a checksum.

**5 · Fork.** GitHub: "A branch is part of one repository. A fork is a separate repository with its own settings and
collaboration space." Public personal-agent setups are shared this way; a product never is.

**6 · Unix.** The FHS 2x2: shareable/static (`/usr`), unshareable/static (`/etc`), variable (`/var`). LifeOS maps
SYSTEM ≈ `/usr`, USER and INTERFACE ≈ `/etc`, RUNTIME and MEMORY ≈ `/var`; RS.GE maps repo ≈ `/usr`, `config/` ≈
`/etc`, the database ≈ `/var`.

### Better or worse?
- **For a personal system (myos, LifeOS):** all three of 1, 2 and 6 together, which is what LifeOS does: name the
  zones, put USER physically outside the update tree, and let the updater carry a list of what it may overwrite.
- **For a product for strangers (the RS.GE Agent):** 4, with 6 as the map: config in the repo, tenant rows behind
  RLS, migrations that only add. Never a fork per tenant, never a folder per tenant.
- **The trap:** every customisation a client loses in an upgrade was in the wrong zone (step 5's fake update). Two
  quieter traps: a backup that copies the symlink instead of the folder it points to, and RLS that "passes against a
  lie" because the test connected as the owner (the reason `0005` and `FORCE` exist).

### Try it (5 min)
Wipe a "system" tree that holds a symlink and watch the user data survive. On the Linux side of WSL, because
`ln -s` on the Windows drive does not behave like Linux (not verified either way; this avoids the question).
```bash
mkdir -p ~/try-d5/userdata ~/try-d5/system/hooks
echo "my personal rule" > ~/try-d5/userdata/RULES.md
echo "shipped hook" > ~/try-d5/system/hooks/a.hook.ts
ln -s ../userdata ~/try-d5/system/USER
ls -la ~/try-d5/system
cat ~/try-d5/system/USER/RULES.md
rm -rf ~/try-d5/system/hooks ~/try-d5/system/USER
ls ~/try-d5/system; cat ~/try-d5/userdata/RULES.md
readlink -f ~/.claude/LIFEOS/USER
sed -n '130,133p' ~/.claude/skills/LifeOS/Tools/OverlaySystem.ts
```
Expected: `ls -la` shows `USER -> ../userdata`; the file is readable through the link; after the "update" the system
folder is empty and `cat ~/try-d5/userdata/RULES.md` still prints your rule. The last two lines show the real
LifeOS link target and the updater's "never follow symlinks" line.

| Command | What it does |
|---|---|
| `ln -s ../userdata ~/try-d5/system/USER` | make a signpost named `USER` that points at the folder next door |
| `ls -la` | list with details; a symlink shows as `name -> target` |
| `rm -rf …/hooks …/USER` | delete the hooks folder and the signpost. `rm` on a symlink removes the link, not the target |
| `readlink -f path` | print where a signpost finally points |
| `sed -n '130,133p' file` | print lines 130 to 133 only; the file is not changed |

Clean up: `rm -r ~/try-d5`.

### Sources
- PostgreSQL, "Row Security Policies": default deny, FORCE for owners, superuser bypass (fetched 2026-09-25): https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Filesystem Hierarchy Standard 3.0: `/usr`, `/etc`, `/var`, shareable vs static (fetched 2026-09-25): https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html
- GitHub, "About forks" (fetched 2026-09-25): https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks
- Claude Code settings precedence (fetched 2026-09-25): https://code.claude.com/docs/en/settings
- The twelve-factor app, "Config" (fetched 2026-09-25): https://12factor.net/config
- LifeOS: `~/.claude/LIFEOS/DOCUMENTATION/SystemUserBoundary.md` (v1.2.7) · `~/.claude/LIFEOS/DOCUMENTATION/Config/ConfigSystem.md` (v1.4.4) · `~/.claude/skills/LifeOS/Tools/OverlaySystem.ts` lines 20-26, 44, 50-59, 132, 172-185, 282 · `readlink -f ~/.claude/LIFEOS/USER` and `…/MEMORY` on 2026-09-25 · `~/.claude/hooks/PreToolGuard.hook.ts` header · `~/.claude/LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` ("Backup rule for LifeOS memory", "Flyway migration safety")
- RS.GE: `packages/db/migrations/0001` header, `0003` (`rule_versions` comment), `0004`, `0005` · `packages/db/src/client.ts` lines 73-105 · `packages/db/src/migrate.ts` lines 63-80

---

<a id="d6"></a>
## D6 · How a capability is packaged

**The question:** In what unit do you give the system a new ability, so that it can be found, loaded only when
needed, tested, and handed to someone else?
**Where the course meets it:** step 7 · **LifeOS today:** about 75 skill folders in `~/.claude/skills/<TitleCase>/`
(each `SKILL.md` plus `Workflows/` and, in 23 of them, `Tools/*.ts`, per `LIFEOS/DOCUMENTATION/Skills/SkillSystem.md`);
18 subagents in `~/.claude/agents/*.md`; two plugins in `~/.claude/plugins/installed_plugins.json`
(`mattpocock-skills@claude-plugins-official` 1.2.3, `typesafe@typesafe-ai` 0.5.7); one MCP server in
`settings.json` → `mcpServers` (`cloudflare`); and a `skills/CLAUDE.md` that loads when Claude works in that folder ·
**RS.GE today:** thirteen workspace packages under `packages/` (`config`, `core`, `db`, `declarations`, `interview`,
`memory`, `review`, `front-door`, `portal`, `rsge-read`, `second-check`, `vault`, `billing`), tests in `test/`
(`bunfig.toml` → `root = "./test"`), no skills, no subagents; the hosted MCP server is ISC-30, open: not built yet.

**In kid words:** a paragraph in the staff manual (a section in the context file), a recipe card with its own drawer
of tools (a skill folder), a vending machine anyone can plug into (an MCP server), a toolbox sold as one kit (a
plugin), a factory part with a test certificate (a code package with tests), and a colleague you send to do it in
another room (a subagent).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · A section in `CLAUDE.md` | `## Sales file` with rules under it | no trigger to get wrong | paid every turn; nothing can travel with it; grows forever | three lines everyone needs |
| 2 · A skill folder (agentskills.io) | `.claude/skills/sales-brief/SKILL.md` (`name`, `description`) + `scripts/`, `references/`, `assets/`; Claude Code extras `allowed-tools`, `paths`, `disable-model-invocation` | paid only when used; one folder works in 40+ tools; scripts ride along | model-chosen; the text has no test of its own; 1,536-character listing cap | a personal system; any capability where instructions matter |
| 3 · An MCP server | `.mcp.json` → `{"mcpServers":{"brief":{"command":"bun","args":["server.ts"]}}}`; `claude mcp add`; tools appear as `mcp__brief__sales_brief` | schema-checked inputs; any client (Claude, ChatGPT, Cursor); permission per tool | a process to run and secure; tool descriptions cost context; auth for remote | strangers' clients must call your tools |
| 4 · A plugin bundle | `.claude-plugin/plugin.json` + `skills/`, `agents/`, `hooks/hooks.json`, `.mcp.json`; installed from a marketplace or `--plugin-dir`; cached under `~/.claude/plugins/` | one install, a version, updates; namespaced `/plugin:skill` | "part of every session": every description costs context always; its hooks run as you | giving a set to others (steps 43 to 50) |
| 5 · A code package with tests (RS.GE) | `packages/interview/{package.json,src/}`, `"@rsge/interview": "workspace:*"`, `test/interview-*.test.ts`, `bun test` | typed, tested, reviewed; no trigger; the model gets two typed jobs | a developer for every change; nothing a user can edit without code (hence `config/`) | correctness is money |
| 6 · A subagent | `.claude/agents/reconciler.md` (`name`, `description`, `tools`, `model`, `omitClaudeMd`) whose body is its own system prompt | clean context; its own tools; parallel | no conversation history; about 15x the tokens of a chat; "a second model agreeing is not a source" | an independent check; wide read-heavy work |

### How each one is built
**1 · Section.** Nothing to build; that is the point and the problem. It is loaded before you type anything and
nothing measures whether it helped.

**2 · Skill folder.** The open spec requires two fields and a folder name that matches:
```
.claude/skills/sales-brief/
  SKILL.md         ---  name: sales-brief  ·  description: Answers questions about … Use when …  ---
  references/columns.md
  scripts/brief.ts
```
Loads in three levels (description always, body on use, files on demand). LifeOS adds its own conventions on top:
TitleCase folder, `Workflows/*.md`, `Tools/*.ts`, a `## Customization` block that reads
`LIFEOS/USER/CUSTOMIZATIONS/SKILLS/<Name>/PREFERENCES.md`, and `_ALLCAPS` for private skills.

**3 · MCP server.** A program that answers "which tools do you have" and "run tool X with these arguments", over
stdin/stdout (`stdio`) or HTTP. Registered per project in `.mcp.json` (with `${VAR}` expansion for secrets), per user
in `~/.claude.json`, or by `claude mcp add --transport stdio brief -- bun server.ts`. LifeOS registers `cloudflare`
in `settings.json`. RS.GE's path (a) (ISC-30) is this: the taxpayer's own ChatGPT or Claude calls the product's tools
and the server never calls a model for them.

**4 · Plugin.** The installed one on your disk shows the shape:
`~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/.claude-plugin/plugin.json` lists
`"skills": ["./skills/engineering/tdd", …]`, and the same folder holds `skills/`, `scripts/`, `docs/`. Its skills run
as `/mattpocock-skills:tdd`. The docs' warning: an enabled plugin is part of every session, and "for each skill,
agent, and command that Claude can invoke on its own, the name and description are in Claude's context on every
turn". Your TypeSafe rule ("re-read the diff before it is used, a later version could add hooks") is the plugin cost
in one line.

**5 · Code package.** `packages/interview/src/model.ts` gives the model exactly two typed jobs and says of itself
"It decides nothing"; `packages/interview/src/plan.ts` decides. `bun test` runs about 90 files from `test/` against
fakes in `test/helpers/` (`fake-portal.ts`, `fake-telegram.ts`, `fake-bog.ts`, `fake-model-vendor.ts`), so no test
needs a key or a network. A capability here is a folder of source plus its tests, wired by `workspaces: ["apps/*",
"packages/*"]` in the root `package.json`.

**6 · Subagent.** One markdown file; the body becomes the subagent's system prompt; it receives the task message
and `CLAUDE.md` (unless `omitClaudeMd: true`) and returns its final report only. LifeOS's `agents/Max.md` is the
read-only second look; `hooks/AgentInvocation.hook.ts` logs every dispatch.

### Better or worse?
- **For a personal system (myos, LifeOS):** the skill folder is the unit; a subagent for a check that must not see
  the working; a plugin only when you give a set away; MCP when a tool must be callable from outside the terminal.
- **For a product for strangers (the RS.GE Agent):** packages with tests, plus MCP as the door for other people's
  clients. Never a markdown skill inside the product's own loop: nothing in RS.GE is a skill today, and that is
  right, because a skill is text the model may or may not follow and a filing is money.
- **The trap:** the unit decides the test, and a section has none. A skill is tested by a trigger suite (step 8),
  its script by a spec and a second road (step 9), a package by `bun test`, a plugin by reading its hooks before
  install. A product trap on top: RS.GE's loop, run on Boris's machine without `settingSources`, would load all 75
  personal skills into a stranger's session.

### Try it (5 min)
See four packagings on disk (read-only), then wrap `greet` as a plugin and watch it load with a namespaced name.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
head -4 .claude/skills/greet/SKILL.md
jq '{name, version, first_skills: .skills[0:3]}' ~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/.claude-plugin/plugin.json
jq '.mcpServers | keys' ~/.claude/settings.json
ls /mnt/c/Users/Boris/Dell/Projects/APPS/RS.GE_Agent/packages/interview/src; ls /mnt/c/Users/Boris/Dell/Projects/APPS/RS.GE_Agent/test | grep -c '^interview-'
mkdir -p try/d6/greet-plugin/.claude-plugin try/d6/greet-plugin/skills && cp -r .claude/skills/greet try/d6/greet-plugin/skills/greet
printf '{ "name": "greet-plugin", "version": "0.0.1", "description": "greet, packaged as a plugin" }\n' > try/d6/greet-plugin/.claude-plugin/plugin.json
claude --setting-sources project,local --plugin-dir try/d6/greet-plugin -p "Reply ok." --output-format stream-json --verbose </dev/null | jq -r 'select(.type=="system" and .subtype=="init") | .skills[]'
```
Expected: the skill's frontmatter; the plugin's name, version and three skill paths; `["cloudflare"]`; nine source
files and ten `interview-` tests; then a skills list holding `greet` twice: once plain, once as
`greet-plugin:greet`. If the namespaced one is missing, run `claude --plugin-dir try/d6/greet-plugin` and type
`/plugin` to see what the loader says.

| Command | What it does |
|---|---|
| `jq '{name, version, first_skills: .skills[0:3]}' file` | pick three fields out of a JSON file and print them |
| `ls … \| grep -c '^interview-'` | count the test files whose names start with `interview-` |
| `cp -r A B` | copy a whole folder |
| `--plugin-dir try/d6/greet-plugin` | load a plugin from a folder for this session only |
| `--output-format stream-json --verbose </dev/null \| jq … .skills[]` | list the skills the session loaded, from its first event; `</dev/null` gives `claude` an empty input |

Clean up: `rm -r try/d6`.

### Sources
- Agent Skills specification: folder layout, required fields, progressive disclosure: `research/03-skills-commands-other-systems.md` §1.2 (agentskills.io/specification)
- Claude Code plugins overview: manifest, components, marketplaces, install scopes, "What an enabled plugin adds" (fetched 2026-09-25): https://code.claude.com/docs/en/plugins
- Claude Code MCP: scopes, `.mcp.json`, `claude mcp add`, tool naming (fetched 2026-09-25): https://code.claude.com/docs/en/mcp
- MCP standard, transports, governance: `research/04-tools-and-data-access.md` §1
- Subagents: what one receives, nesting, the 15x figure: `research/01-claude-code-skills-subagents.md` §9-12, `research/05-subagents-and-multi-agent.md` §10
- LifeOS: `~/.claude/LIFEOS/DOCUMENTATION/Skills/SkillSystem.md` (v1.6.3) · `ls ~/.claude/skills`, `ls -d ~/.claude/skills/*/Tools` (23) · `~/.claude/agents/` (18) · `~/.claude/plugins/installed_plugins.json` · `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/.claude-plugin/plugin.json` · `~/.claude/settings.json` `mcpServers`, `enabledPlugins` · `~/.claude/skills/CLAUDE.md`
- RS.GE: `package.json` (`workspaces`) · `bunfig.toml` · `ls packages`, `ls test`, `ls test/helpers` · `packages/interview/src/model.ts` · `ISA.md` line 162 (ISC-30 open)

---

<a id="d7"></a>
## D7 · How a capability is triggered

**The question:** Who decides that a capability runs on this turn: the model, a pattern, a person, or code?
**Where the course meets it:** steps 8, 11 · **LifeOS today:** three ways at once. Skill descriptions with `USE
WHEN` lists (the model decides); `hooks/AlgorithmNudge.hook.ts` on `UserPromptSubmit`, which matches the prompt
against phrases parsed from every `skills/*/SKILL.md` into `LIFEOS/MEMORY/STATE/skill-usewhen-index.json` and injects
"This prompt matches USE WHEN of: X" (line 685) as `additionalContext` (line 908); and user-only skills
(`disable-model-invocation: true`: Interview, Loop, Optimize, Migrate, LifeOS). No `paths:` rule exists anywhere
under `~/.claude` · **RS.GE today:** no trigger. `packages/interview/src/plan.ts` derives the questions from the
declaration's definition minus what memory already answers; bot commands are rows in `config/front-door.json`
(`start`, `help`, `declare` / `დეკლარაცია`, `mode` / `რეჟიმი`, `review` / `გადახედვა`), matched after the slash.

**In kid words:** a smoke alarm that judges the air (the model), a door switch that turns the light on when that one
door opens (a file glob), a receptionist who reads your note and stamps "room 3" on it (a hook that routes), a
doorbell (a manual command), and a conveyor belt where the machine already knows the next station (a route derived
by code).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · A description the model judges | `description:` + `when_to_use:` (cut together at 1,536 characters); measured with `tests/run-triggers.sh` | understands phrasings it has never seen | probabilistic; differs per model; must be measured | free text from a person |
| 2 · A file glob | skill `paths: "data/**"`; `.claude/rules/*.md` with `paths:`; Cursor globs; Copilot `applyTo`; Windsurf `glob` | certain and free; no model involved | blind to what you asked | a rule that belongs to files |
| 3 · A prompt hook that routes deterministically (LifeOS) | `UserPromptSubmit` → lowercase prompt → phrase table → `additionalContext`; 60-minute cooldown per skill; always exit 0 | certain, under 20 ms, logged; measurable | keyword misses; index freshness (6 h); advisory only | a nudge for forgotten capabilities |
| 4 · A manual command | `disable-model-invocation: true` + `/brief 2026-08` with `$0`; `.claude/commands/*.md`; Codex `/prompts:`; Gemini TOML; Windsurf workflows "manual-only" | never fires by surprise | never fires by itself | anything with a side effect or a cost |
| 5 · A route derived by code (RS.GE) | `plan.ts`: inputs of the form minus memory's answers; phases from `config/interview/settings.json`; an invariant proved after ordering | nothing to misfire; every question changes a number | only for a known form; a new form is a definition plus a plan file | the job is closed |

### How each one is built
**1 · Description.** Third person, what and when, key words first, a "not for" clause; then a suite that counts
`Skill` tool calls, never the wording of the answer (step 8). Anthropic's guide: build evaluations first, and there
is no built-in way to run them.

**2 · Glob.** `paths:` in a skill offers it only while a matching file is in play; in a rule it loads the rule when
such a file is read. Step 8's BREAK measures what that does to a FIRE score: sentences that touch no file stop firing.

**3 · Hook routing.** LifeOS's real router, in code:
```ts
// ~/.claude/hooks/AlgorithmNudge.hook.ts
const INDEX_PATH = join(PAI, 'LIFEOS', 'MEMORY', 'STATE', 'skill-usewhen-index.json');   // line 81
const ROUTE_COOLDOWN_MS = 60 * 60 * 1000;  // per-skill routing cooldown                    // line 86
export function matchSkills(prompt, index) {                                                // line 351
  const p = prompt.toLowerCase();
  // multiword phrases of 7+ characters match as substrings; single words of 6+ characters
  // match on unicode word boundaries (so Georgian and Cyrillic phrases work, public issue #1787)
  … if (hits.length === 0 || hits.length > ROUTE_MAX_MATCHES) return [];   // more than 6 hits = a generic prompt = noise
  return hits.sort((a, b) => b.phrase.length - a.phrase.length).slice(0, 3);
}
out.push(`This prompt matches USE WHEN of: ${matches…} — if the work lands there, invoke the skill rather than handrolling.`); // line 685
console.log(JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext: text } }));                             // line 908
```
The index is rebuilt detached when older than six hours (`--rebuild-index`), never on the hot path. The header
explains why it only advises: "A Stop-blocking variant was adversarially killed … it Goodharts into token dispatches".

**4 · Manual command.** One frontmatter line removes the model's right to start it; arguments arrive as
`$ARGUMENTS`, `$0`, `$1`. The trap across tools: Codex's `$1` is the first argument, Claude Code's is the second.

**5 · Derived route.** The whole judgement of the interview is one rule: "a question that cannot change a number is a
question that must never be asked".
```ts
// packages/interview/src/plan.ts
const [PHASE_PREFERENCE, PHASE_DISCRIMINATOR, PHASE_INPUT] = ["preference", "discriminator", "input"];   // line 214
function phaseRank(phase) { const order = interviewSettings().phases.order; … }   // the order is data, line 202
function isDiscriminator(key, governed, inFormulas) { return (governed.get(key) ?? []).length > 0 || inFormulas.has(key); }
export function assertDiscriminatorsComeFirst(definition, questions) { … }       // proved, not assumed
```
`classifyInputsInTransaction` (from `@rsge/memory`) sorts every input into asked, proposed, computed or not
applicable; `buildSkipped` returns what was *not* asked and why; `preferenceValues` refuses a preference whose
answers are not a closed set in `config/reference`. The commands are rows (`config/front-door.json` → `commands.rows`,
`{ code, aliases }`) and the adapter "dispatches on the code, never on the word".

### Better or worse?
- **For a personal system (myos, LifeOS):** a measured description for open requests, a manual command for anything
  with a side effect, and a hook nudge for the capabilities you keep forgetting you own. LifeOS runs all three; the
  gap is that nothing measures the first two with a suite like step 8's.
- **For a product for strangers (the RS.GE Agent):** the route is computed from the form, commands are data a
  translator can edit, and the model only phrases questions and reads answers. A free-text intent classifier where a
  form-derived route exists would be a step backwards.
- **The trap:** measuring the wrong thing. An answer can sound like the skill without the skill loading; only the
  `Skill` tool call counts. And an advisory nudge is not enforcement: the model may ignore it, which LifeOS accepts on
  purpose. When a trigger must hold, it is a hook that blocks (Part 3) or code (RS.GE), never a description.

### Try it (5 min)
A router with no model in it, then a look at LifeOS's real phrase table.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
mkdir -p try/d7 && cat > try/d7/route.ts <<'EOF'
// A deterministic prompt router: phrase table in, one JSON nudge out. No model, no tokens.
const routes: Record<string, string[]> = { "sales-brief": ["sales", "გაყიდვები", "seller"], "greet": ["who am i", "say hello"] };
const input = JSON.parse(await Bun.stdin.text());
const p = String(input.prompt ?? "").toLowerCase();
const hits = Object.entries(routes).filter(([, phrases]) => phrases.some((ph) => p.includes(ph))).map(([skill]) => skill);
if (hits.length) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: `This prompt matches: ${hits.join(", ")}. Use that skill rather than improvising.` } }));
EOF
for s in "how did sales go in august" "say hello" "explain the VAT rules"; do echo "{\"prompt\":\"$s\"}" | bun try/d7/route.ts; echo "[$s] exit=$?"; done
jq '.entries | length' ~/.claude/LIFEOS/MEMORY/STATE/skill-usewhen-index.json
jq '.entries[] | select(.skill=="Sales") | .phrases[0:6]' ~/.claude/LIFEOS/MEMORY/STATE/skill-usewhen-index.json
```
Expected: a JSON nudge naming `sales-brief`, one naming `greet`, nothing for the VAT sentence, all three `exit=0`;
then the number of LifeOS skills in the index and the first six phrases LifeOS's `Sales` skill fires on. To wire your
router for real you would add it under `UserPromptSubmit` in `.claude/settings.json`; leave that for Part 3.

| Command | What it does |
|---|---|
| `for s in A B C; do …; done` | run the block once per sentence, with `$s` set to it |
| `echo "{\"prompt\":\"$s\"}" \| bun try/d7/route.ts` | send a JSON object shaped like a real `UserPromptSubmit` payload into the router's stdin |
| `jq '.entries \| length' file` | count entries in the index; the file is only read |
| `jq '.entries[] \| select(.skill=="Sales") \| .phrases[0:6]' file` | the first six trigger phrases of one skill |

### Sources
- Trigger modes across Cursor, Copilot, Windsurf, Codex; description guidance: `research/03-skills-commands-other-systems.md` §3 and §4
- Skill frontmatter (`paths`, `disable-model-invocation`, `when_to_use`, 1,536 cap), hook exit codes: `research/01-claude-code-skills-subagents.md` §2, §5, §14
- LifeOS: `~/.claude/hooks/AlgorithmNudge.hook.ts` lines 4, 30-32, 59-62, 81, 86-89, 322-331, 351-380, 685, 908 · `~/.claude/LIFEOS/MEMORY/STATE/skill-usewhen-index.json` (exists, rebuilt 2026-09-25) · `~/.claude/settings.json` (`UserPromptSubmit` list) · user-only skills per COURSE.md step 11 MIRROR
- RS.GE: `packages/interview/src/plan.ts` lines 1-19, 202-214, 384 onwards · `config/interview/settings.json` (`phases.order`) · `config/front-door.json` (`commands.rows`) · `packages/front-door/src/config.ts` (`CommandRow`) · `test/interview-plan.test.ts`, `test/front-door-telegram.test.ts`

---

<a id="d8"></a>
## D8 · Where tools and scripts live, and how they find their config

**The question:** Where does a deterministic script live so that the agent, a test and a person can all run it, and
how does it find its settings without a hardcoded path or a lucky shell folder?
**Where the course meets it:** steps 9, 12 · **LifeOS today:** three homes. A global toolbox `~/.claude/LIFEOS/TOOLS/`
(205 entries: `Inference.ts`, `Doctor.ts`, `models.ts`, `LifeosConfig.ts`…); per-skill `skills/<Name>/Tools/*.ts`
(23 skills), called from `SKILL.md` by full path, for example `bun run ~/.claude/skills/Agents/Tools/ComposeAgent.ts
--task …` (`skills/Agents/SKILL.md` line 164; no LifeOS skill uses `${CLAUDE_SKILL_DIR}`); and hooks in
`~/.claude/hooks/`, registered in `settings.json` as `$HOME/.claude/hooks/X.hook.ts` or `${PAI_DIR}/hooks/X`
(`env.PAI_DIR`). Config discovery: `join(homedir(), '.claude')` with env overrides (`AlgorithmNudge.hook.ts` lines 71
to 81), the typed loader `LIFEOS/TOOLS/LifeosConfig.ts` over `LIFEOS/USER/CONFIG/LIFEOS_CONFIG.toml`, and
`hooks/lib/resolve-bin.ts` to find `bun` when a hook's PATH is minimal. Your project shims live in `~/.claude/bin/`
(`9t-mvn`, `brooks-gradle`, `camora-mvn`…) · **RS.GE today:** code in `packages/*/src`, one-off scripts in `scripts/`
(`secret-scan.ts`, `no-owner-key.sh`, `build-declaration-versions.ts`…), tests in `test/` with fakes in
`test/helpers/`. Config discovery: `packages/config/src/paths.ts` `repoRoot()` walks up from the file's own folder to
the `package.json` that declares `workspaces`; `loadJson("config/x.json")` caches; env-variable *names* live in
config (`database.urlEnvVar: "DATABASE_URL"`) and `envValue()` reads them; `.env.example` documents them.

**In kid words:** where a tool hangs: in the recipe card's own drawer (the skill folder), on the workshop wall (the
project's `tools/`), in the company's central toolbox (a global folder), in a vending machine (MCP), in every shop
in town (a CLI on PATH), or on a rented bench in someone else's building (a vendor sandbox). And how a tool finds its
instructions: walk up the street until you see the factory sign (a marker file), a note in your pocket (an
environment variable), "wherever I happen to stand" (the current folder), someone tells you (a flag), ask the office
(a database).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| 1 · Inside the skill folder | `scripts/brief.ts`; `allowed-tools: Bash(bun ${CLAUDE_SKILL_DIR}/scripts/brief.ts *)` | travels with the skill; found by the tool from any shell folder | shared code gets copied between skills | one skill owns the script |
| 2 · Project `tools/` or `tests/` | `tests/recon.sh`, `tests/run-triggers.sh`; RS.GE `scripts/`, `test/` | one place, versioned with the project, run by CI | not portable with a skill | project-wide checks |
| 3 · A global toolbox | LifeOS `LIFEOS/TOOLS/`, `skills/<Name>/Tools/` addressed as `~/.claude/…` | one copy reused by hooks and skills | absolute paths tie to one install; 205 files nobody indexes | many hooks share code |
| 4 · An MCP server | `.mcp.json` row; `mcp__brief__sales_brief`; schema-checked input | typed inputs; any client; permission per tool | a process to run; descriptions in context; auth | outside callers |
| 5 · An installed CLI on PATH | `atlas`, `jq`, `gh`; `~/.claude/bin/` shims; `allowed-tools: Bash(atlas *)` | any shell, any script | install per machine; version drift; a hook's PATH may be minimal | a tool used from many places |
| 6 · A vendor sandbox | Anthropic code execution, OpenAI Code Interpreter | nothing to install | the file leaves the machine; no internet inside; not for company data | throwaway analysis of public data |

**Config discovery, the second half of the question:**

| Way | Built as | Gains | Costs |
|---|---|---|---|
| walk up to a marker file | RS.GE `repoRoot()`: from `import.meta.dir` up to `package.json` with `workspaces`; git's `.git`; Aider's home → git root → cwd search | works from any shell folder, in tests too | one marker to agree on |
| an environment variable | `PAI_DIR`, `LIFEOS_WORK_JSON`; twelve-factor "store config in environment variables"; RS.GE names of variables in config | per-deploy without code; secrets never in files | invisible until it is missing; the litmus test: could the repo be open-sourced right now? |
| the current folder | `./config.json` | nothing to build | breaks the moment the shell is elsewhere (your WSL → Windows CWD leak rule) |
| a flag | `lifeos -s <file>`, `OverlaySystem.ts --config-root <dir>` | explicit; testable | every caller must pass it |
| a database | RS.GE `rule_versions`, `plan_terms`; interval-versioned | editable by a user, history free, no deploy | a connection before the first answer |

### How each one is built
**1 · Skill folder.** The open spec reserves `scripts/`, `references/`, `assets/` inside the skill; Claude Code
substitutes `${CLAUDE_SKILL_DIR}` with the skill's own folder before the command runs, so `bun
${CLAUDE_SKILL_DIR}/scripts/brief.ts --month 2026-08` works whatever the shell folder is, and the `allowed-tools`
line can name exactly that command. Only the script's output enters the context, never its code.

**2 · Project tools.** RS.GE's `package.json` names them: `"secret-scan": "bun run scripts/secret-scan.ts"`,
`"test": "bun test"` (root `./test` from `bunfig.toml`), `"migrate": "bun run packages/db/src/migrate.ts"`. A script,
a test and the app all resolve config through the same `repoRoot()`.

**3 · Global toolbox.** LifeOS reaches its tools by absolute path (`$HOME/.claude/hooks/…` in `settings.json`;
`~/.claude/skills/Agents/Tools/ComposeAgent.ts` in `SKILL.md`), with `${PAI_DIR}` as the one indirection. Hooks
locate `bun` through `resolveBun()` ("Detached / unref'd hook subprocesses can get a minimal PATH"), and user config
through `LifeosConfig.ts`: "No system file directly opens any file under LIFEOS/USER/ for these values; the
path-rooting happens here."

**4 · MCP.** See D6 option 3; the difference from a script is a declared input schema and a name a permission rule
can target.

**5 · CLI on PATH.** `~/.claude/bin/9t-mvn` stages a `.bat` on the Windows side and runs Maven there; a shim like
this is why "which JDK" is decided in one file and not in every prompt.

**6 · Vendor sandbox.** Anthropic's code execution tool runs "in a secure, sandboxed environment" with no outbound
network; the file is uploaded first. Fine for synthetic data; out of the question for 9 Tones rows.

**Marker-file walk-up, the RS.GE way:**
```ts
// packages/config/src/paths.ts
export function repoRoot(): string {
  let dir = import.meta.dir;                                   // this FILE's folder, not the shell's
  for (;;) {
    const candidate = join(dir, "package.json");
    if (existsSync(candidate) && "workspaces" in JSON.parse(readFileSync(candidate, "utf8"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error("Could not find the repository root …");
    dir = parent;
  }
}
export function fromRepoRoot(p: string) { return isAbsolute(p) ? p : resolve(repoRoot(), p); }
```
And the env-variable half: `runtimeConfig().database.urlEnvVar` is the *name* `"DATABASE_URL"`, read by
`envValue(name)`; the boot message that tells you it is missing is built from config too (`databaseHint()`).

### Better or worse?
- **For a personal system (myos, LifeOS):** a script that belongs to one skill lives in that skill's `scripts/` and is
  addressed with `${CLAUDE_SKILL_DIR}`; shared code lives in one toolbox found by a marker or an environment
  variable, never by `~/.claude` literals. Your question, "is it the best way to build and locate tools": LifeOS's
  *location* (a `Tools/` folder inside each skill, a `TOOLS/` toolbox for shared code) is right; its *addressing*
  (absolute `~/.claude/…` paths in every SKILL.md and hook registration) is the weaker half. It works on one
  machine and breaks the day the tree moves (`CLAUDE_CONFIG_DIR`) or a skill is shipped as a plugin. Good enough for
  one person; not the form to copy.
- **For a product for strangers (the RS.GE Agent):** `packages/*` for code, `scripts/` for one-offs, `test/` for
  proof, one `repoRoot()` walk-up for all three, env-variable names in config and secrets only in the environment.
  That is the best of the six for a product, and the repo already does it. The one addition its plan names is MCP
  (ISC-30), for other people's clients.
- **The trap:** the current folder. A tool that finds its config "where the shell happens to be" passes on your
  machine and fails in a hook, a test, a cron job or a Windows call from WSL. The second trap is a permission line
  wider than the tool: `Bash(awk *)` allows everything awk can `system()`; name the script, not the language.

### Try it (5 min)
Build the walk-up, run it from a deep folder and from `/tmp`, and see the same config found both times.
```bash
cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos
mkdir -p try/d8/deep/er && printf '{ "currency": "GEL", "top_shops": 5 }\n' > try/d8/brief.json
cat > try/d8/deep/er/find-config.ts <<'EOF'
// Walk up from THIS FILE, never from the shell's folder, until brief.json is found.
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
let dir = import.meta.dir;
for (;;) {
  const candidate = join(dir, "brief.json");
  if (existsSync(candidate)) { console.log("found", candidate, JSON.parse(await Bun.file(candidate).text())); break; }
  const parent = dirname(dir);
  if (parent === dir) { console.error("no brief.json above", import.meta.dir); process.exit(2); }
  dir = parent;
}
EOF
(cd try/d8/deep/er && bun find-config.ts)
(cd /tmp && bun /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos/try/d8/deep/er/find-config.ts)
sed -n '8,26p' /mnt/c/Users/Boris/Dell/Projects/APPS/RS.GE_Agent/packages/config/src/paths.ts
```
Expected: both runs print `found …/try/d8/brief.json { currency: "GEL", top_shops: 5 }`, once from three folders
down and once from `/tmp`. The last command shows RS.GE's `repoRoot()`, the same loop with `package.json` +
`workspaces` as the marker.

| Command | What it does |
|---|---|
| `(cd folder && command)` | run the command inside that folder, then come back automatically; the parentheses make a throwaway shell |
| `import.meta.dir` | the folder of the script file itself |
| `dirname(dir)` | the parent folder; when the parent equals the folder you are at the top of the disk |
| `sed -n '8,26p' file` | print lines 8 to 26 of the file, nothing else, nothing changed |

Clean up: `rm -r try/d8`.

### Sources
- Agent Skills spec (`scripts/`, `references/`, `assets/`): `research/03-skills-commands-other-systems.md` §1.2 · `${CLAUDE_SKILL_DIR}` and other substitutions: `research/01-claude-code-skills-subagents.md` §5
- Client tools vs server tools, code execution sandbox, MCP: `research/04-tools-and-data-access.md` §1
- Claude Code MCP config and tool names (fetched 2026-09-25): https://code.claude.com/docs/en/mcp
- The twelve-factor app, "Config" (fetched 2026-09-25): https://12factor.net/config
- Aider's config search order: `research/02-context-files-other-systems.md` (Aider, Q5)
- LifeOS: `ls ~/.claude/LIFEOS/TOOLS` (205) · `ls -d ~/.claude/skills/*/Tools` (23) · `~/.claude/skills/Agents/SKILL.md` line 164 · `grep -rl CLAUDE_SKILL_DIR ~/.claude/skills` (none) · `~/.claude/hooks/lib/resolve-bin.ts` · `~/.claude/hooks/AlgorithmNudge.hook.ts` lines 71-81 · `~/.claude/LIFEOS/TOOLS/LifeosConfig.ts` header · `~/.claude/settings.json` (`env`, hook commands) · `~/.claude/bin/` · `~/.claude/LIFEOS/DOCUMENTATION/Tools/CliFirstArchitecture.md` · `~/.claude/LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` (WSL → Windows CWD leak; "if changing it requires a deploy, it is hardcoded")
- RS.GE: `packages/config/src/paths.ts`, `load.ts`, `runtime.ts` · `packages/db/src/client.ts` lines 19-27 · `package.json` scripts · `bunfig.toml` · `ls scripts`, `ls test/helpers` · `.env.example`
