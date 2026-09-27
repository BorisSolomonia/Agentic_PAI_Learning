# Skills, Triggers, and Commands Across Agent Systems — Factual Reference

**Research date:** 2026-09-24
**Scope:** Official docs/repos for OpenAI Codex CLI, Cursor, Gemini CLI, GitHub Copilot/VS Code, Goose, Amp, OpenCode, Windsurf, Continue, plus the Agent Skills open specification (agentskills.io) and Anthropic's own docs. Claude Code's own skill/subagent mechanics are covered in depth in `01-claude-code-skills-subagents.md` and are only summarized here for comparison.

---

## 1. Agent Skills as an open format

### 1.1 Who publishes the spec, and its history

- The Agent Skills format was originally developed and announced by Anthropic on October 16, 2025, in the engineering blog post "Equipping agents for the real world with Agent Skills." (source: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills § original post)
- On December 18, 2025, Anthropic published Agent Skills as an open, cross-platform standard. The same post carries the update note: "We've published Agent Skills as an open standard for cross-platform portability. (December 18, 2025)" (source: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills § update note)
- The canonical spec now lives at agentskills.io, described there as "originally developed by Anthropic, released as an open standard, and has been adopted by a growing number of agent products... open to contributions from the broader ecosystem." (source: https://agentskills.io § Open development)
- The reference repository is github.com/agentskills/agentskills: code is Apache-2.0, documentation is CC-BY-4.0, and it takes outside contributions via `CONTRIBUTING.md` — governance is no longer solely Anthropic's even though Anthropic originated the format. (source: https://github.com/agentskills/agentskills § README/LICENSE)
- Anthropic's own spec file at `github.com/anthropics/skills` is now just a stub redirecting to agentskills.io/specification — one canonical spec, not parallel forks. (source: https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)
- Same-day corroboration: GitHub's own changelog entry for Copilot's Agent Skills support is also dated December 18, 2025. (source: https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/)

### 1.2 What the format requires

- Folder layout: a skill is a directory containing at minimum a `SKILL.md` file. Optional conventional subdirectories: `scripts/` (executable code), `references/` (documentation), `assets/` (templates/resources). (source: https://agentskills.io/specification § Directory structure)
- `SKILL.md` = YAML frontmatter + Markdown body. Only two fields are required at the spec level:
  - `name` — 1–64 chars, lowercase unicode alphanumerics and hyphens only, no leading/trailing/consecutive hyphens, must match the parent directory name exactly.
  - `description` — 1–1024 chars, non-empty, must state both what the skill does and when to use it.
  (source: https://agentskills.io/specification § `name` field / § `description` field)
- Optional spec-level fields: `license`, `compatibility` (≤500 chars, environment requirements), `metadata` (free-form string map), `allowed-tools` (space-separated pre-approved tools, marked "Experimental — support may vary between agent implementations"). Spec-compliant runtimes must ignore frontmatter keys they don't recognize. (source: https://agentskills.io/specification § Frontmatter table)
- Progressive disclosure is part of the spec itself, not a Claude-only implementation detail: metadata (~100 tokens) loads for every skill at startup; the full body loads only once a skill activates; bundled scripts/references/assets load only as referenced. Recommended body limit: under 500 lines. (source: https://agentskills.io/specification § Progressive disclosure)
- Anthropic's own products layer extra, non-spec constraints on top: Claude's `name`/`description` fields additionally forbid XML tags and the reserved words "anthropic" and "claude" — these are Claude-specific, not part of the open spec. (source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview § Skill structure)
- Claude Code adds its own optional frontmatter beyond the spec (`when_to_use`, `user-invocable`, `disable-model-invocation`, `arguments`, `argument-hint`, `context: fork`, etc.) — full list in `01-claude-code-skills-subagents.md` §2. (source: https://code.claude.com/docs/en/skills § Frontmatter reference)

### 1.3 Product-by-product support (as of September 2026)

agentskills.io's own "Client Showcase" names 40+ adopting products, including Claude, Claude Code, ChatGPT & Codex, Cursor, Gemini CLI, GitHub Copilot, VS Code, Goose, Amp, OpenCode, Letta, Kiro, Junie, Roo Code, and Spring AI. (source: https://agentskills.io § Client Showcase)

**OpenAI Codex CLI** — supports SKILL.md. Discovery order: repo-level `.agents/skills` (searched from cwd up through parent directories to the repo root) → user-level `$HOME/.agents/skills` → admin-level `/etc/codex/skills` → built-in system skills. Invocation is both model-decided ("implicit invocation" on a description match) and user-typed (`$skill-name` or the `/skills` command). (source: https://learn.chatgpt.com/docs/build-skills § Where Codex loads local skills / § How ChatGPT and Codex use skills)

**Cursor** — supports SKILL.md. Discovers from four directories: project `.cursor/skills/` and `.agents/skills/`; user `~/.cursor/skills/` and `~/.agents/skills/`; plus legacy `.claude/skills/` and `.codex/skills/` kept for backward compatibility. Invocation is both automatic (agent judges relevance against the description, unless `disable-model-invocation: true`) and manual (type `/skill-name`, or bind a skill to a Custom Mode). (source: https://cursor.com/docs/skills § Skill directories / § Disabling automatic invocation)

**Gemini CLI** — supports SKILL.md. Discovery tiers, lowest to highest precedence: built-in → extension-bundled → user (`~/.gemini/skills/` or `~/.agents/skills/`) → workspace (`.gemini/skills/` or `.agents/skills/`); the `.agents/skills` alias outranks `.gemini/skills` within the same tier. Invocation: model-decided via an `activate_skill` tool call (shows a confirmation naming the skill and directory), or manual via `/skills` in-session or the `gemini skills` terminal command. (source: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md § Discovery tiers / § Precedence and aliases)

**GitHub Copilot / VS Code** — supports SKILL.md; announced 2025-12-18 (experimental in VS Code 1.108), stable from early January 2026. Discovery: project `.github/skills/`, `.claude/skills/`, `.agents/skills/`; personal `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`. Invocation is both automatic (description match) and manual (`/` menu); `user-invocable: false` and `disable-model-invocation: true` narrow this per skill. (source: https://code.visualstudio.com/docs/agent-customization/agent-skills § SKILL.md file format / § Use skills as slash commands)

**Goose** (Block) — supports SKILL.md. Discovery: global `~/.agents/skills/`; project `.agents/skills/`; plugin-provided `~/.agents/plugins/<plugin-name>/`; legacy `~/.claude/skills/` and `.goose/skills/` still read. Invocation is both automatic ("when your request clearly matches a skill's purpose") and explicit (natural-language request, or `/skills code-review edge-case-finder`-style CLI syntax). (source: https://goose-docs.ai/docs/guides/context-engineering/using-skills/ § Skill Locations / § Skill Invocation Methods). Note: agentskills.io's showcase still links Goose's docs at the older `block.github.io/goose` GitHub Pages URL, which now 404s — the docs have moved to goose-docs.ai.

**Amp** (Sourcegraph) — supports SKILL.md. An eleven-step precedence chain; the core of it: `~/.config/agents/skills/` and `~/.agents/skills/` (machine-wide) → `.agents/skills/` and `.claude/skills/` (project, searched through parent directories) → `~/.claude/skills/` → configured `amp.skills.path` directories → built-in → personal/workspace hosted skill repositories. Local and built-in skills mask repository skills of the same name. Invocation is documented as automatic only: "Amp lists every discovered skill for the model. The model sees each skill's name and description and uses them to decide when to load it" — no manual slash-invocation is documented on this page. (source: https://ampcode.com/docs/customize/skills § Skill Sources and Precedence / § Skill Invocation)

**OpenCode** — supports SKILL.md with a distinctive dual format: a skill can be a single `<source>/skill-id.md` file OR a full `<source>/skill-id/SKILL.md` directory (most other tools require the directory form). Discovery: global `~/.config/opencode/skills`, `~/.claude/skills`, `~/.agents/skills`; project `.opencode/skills`, `.claude/skills`, `.agents/skills` (searched upward to the project root); extra paths configurable via `opencode.json`. Invocation is model-decided by default (the agent calls a `skill` tool with the exact ID), suppressible per-skill via `metadata."opencode/autoinvoke": false`. (source: https://opencode.ai/v2/docs/skills/ § Discovery / § Frontmatter)

**Claude Code** (for comparison) — personal `~/.claude/skills/`, project `.claude/skills/`; both model-decided and user-typed (`/skill-name`) invocation. Full mechanics in `01-claude-code-skills-subagents.md` §§1–8. (source: https://code.claude.com/docs/en/skills)

---

## 2. Custom slash commands / reusable prompts

**OpenAI Codex CLI — custom prompts**
- Location: Markdown files directly inside `~/.codex/prompts/` (subdirectories not scanned). (source: https://learn.chatgpt.com/docs/custom-prompts § file location)
- Argument syntax: positional `$1`–`$9` (space-separated args) and `$ARGUMENTS` (all of them); named placeholders via uppercase names (e.g. `$FILE`, `$TICKET_ID`) supplied as `KEY=value` at call time (quote values with spaces, e.g. `FOCUS="loading state"`); `$$` escapes to a literal `$`. Frontmatter supports `description` and `argument-hint`. (source: https://learn.chatgpt.com/docs/custom-prompts § Add metadata and arguments)
- Invocation: type `/`, then `prompts:<name>` (e.g. `/prompts:draftpr`). The doc itself flags custom prompts as being superseded by Skills going forward. (source: https://learn.chatgpt.com/docs/custom-prompts § Invoke and manage custom commands)

**Cursor — commands**
- Location: project `.cursor/commands/[command].md`; global `~/.cursor/commands/`. (source: https://cursor.com/docs/context/commands; https://cursor.com/changelog/1-6)
- Format: a plain Markdown file. Community convention structures it with "Objective" and "Requirements" sections, but this is not a required schema.
- Arguments: no placeholder syntax (no `$1`, `$ARGUMENTS`, `{{args}}`) is documented in Cursor's commands doc or its 1.6 changelog announcing the feature — confirmed absent, not merely unfound. The command's Markdown body is inserted as the prompt as-is.
- Invocation: type `/` in the Agent input and pick the command from the dropdown. (source: https://cursor.com/changelog/1-6 § slash commands)

**Gemini CLI — custom commands (TOML)**
- Location: user `~/.gemini/commands/`; project `<project-root>/.gemini/commands/` (project overrides user on name collision). Subdirectories namespace commands with a colon, e.g. `git/commit.toml` → `/git:commit`. (source: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md § File Locations / § Naming & Namespacing)
- Required field: `prompt` (string, the text sent to Gemini). Optional: `description` (shown in `/help`).
- Argument placeholder: `{{args}}` substitutes the user-typed text after the command name — raw outside shell blocks, automatically shell-escaped inside them.
- Shell-injection syntax: `!{...}` executes a shell command and injects its output; requires balanced braces and a user confirmation dialog before running.
- File-injection syntax: `@{...}` embeds file/directory content (including images, PDFs, audio, video), respecting `.gitignore`/`.geminiignore`.
- Processing order: `@{...}` (file injection) → `!{...}` (shell) → `{{args}}` (argument substitution). (source: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md § Key Syntax Elements)

**GitHub Copilot — prompt files**
- Location: `.github/prompts/*.prompt.md` at the workspace root; recognized automatically by VS Code and Visual Studio 17.10+, also supported in JetBrains IDEs. (source: https://code.visualstudio.com/docs/agent-customization/prompt-files; https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file)
- Format: Markdown with the `.prompt.md` extension and an optional YAML frontmatter header.
- Invocation: always manual — typed as a slash command in Copilot Chat (e.g. `/explain-code`) — unlike custom instructions (`*.instructions.md`), which can apply automatically. (source: https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file § how prompt files differ from custom instructions)

**Windsurf — workflows**
- Windsurf's documentation has moved: `docs.windsurf.com` now redirects to `docs.devin.ai`, and the product is documented there as "Devin Desktop" (Cognition), with `.windsurf/` kept only as a legacy fallback path. (source: https://docs.devin.ai/desktop/cascade/workflows — redirect target of https://docs.windsurf.com/windsurf/cascade/workflows)
- Location: workspace `.devin/workflows/*.md` (preferred) or `.windsurf/workflows/*.md` (legacy); global `~/.codeium/windsurf/global_workflows/*.md`; enterprise system-level paths also documented (e.g. `/etc/devin/workflows/`).
- Format: a Markdown file with a title, a description, and a numbered series of steps; capped at 12,000 characters.
- Arguments: not documented — no parameter-passing mechanism is described.
- Invocation: manual-only, via `/[workflow-name]`. Quoted directly: "Workflows are manual-only — Cascade will never invoke a workflow automatically." Workflows may call other workflows using the same slash syntax. (source: https://docs.devin.ai/desktop/cascade/workflows § How it works / § Workflow Storage Locations)

**Continue**
- Two documented mechanisms, with version drift between them:
  1. Config-based: register a prompt block in `config.yaml` under `prompts:` (`- uses: namespace/prompt-name`); the prompt file's own frontmatter carries `name`, `description`, and `invokable: true` to expose it as a slash command. Usable in Chat/Plan/Agent mode by typing `/`, or from the CLI as `cn --prompt <namespace>/<name> "additional instructions"`. (source: https://docs.continue.dev/customize/prompts; https://docs.continue.dev/customize/deep-dives/prompts)
  2. File-based "Prompt files (experimental)": `.prompt`-extension files templated with Handlebars syntax and context-provider variables, with a YAML "preamble" above a `---` separator for model parameters. **UNVERIFIED**: the exact current directory — older docs say a top-level `.prompts/` folder, other references say `~/.continue/prompts` or workspace `/.continue/prompts`. Continue's own issue tracker documents this as inconsistent between versions. (source: https://docs.continue.dev/features/prompt-files; discrepancy noted at https://github.com/continuedev/continue/issues/2969 and .../issues/2990)

---

## 3. Trigger modes — model-decided vs. deterministic pattern

**Cursor rules** — four modes, set via `.mdc` frontmatter (`description`, `globs`, `alwaysApply`) in `.cursor/rules/`, or globally via Customize → Rules:
- **Always** (`alwaysApply: true`) — deterministic; included in every request regardless of context.
- **Auto Attached** — deterministic; triggered when a file in context matches the rule's `globs` pattern.
- **Agent Requested** — model-decided; the model reads the rule's `description` and judges relevance.
- **Manual** — user-typed; applied only when explicitly @-mentioned (`@rule-name`).
Plain `.md` files in `.cursor/rules/` are ignored — the extension must be `.mdc`. `AGENTS.md` is a simpler, frontmatter-free alternative. (source: https://cursor.com/docs/context/rules § Rule anatomy / § Project rules — the official page describes these four concepts; the exact labels above match Cursor's community-documented UI dropdown text and are corroborated independently across Cursor's own community forum and multiple third-party guides)

**GitHub Copilot custom instructions** — two independent trigger mechanisms on `*.instructions.md` files (default location `.github/instructions/`):
- **`applyTo` glob** — deterministic, e.g. `applyTo: "**/*.ts,**/*.tsx"`; VS Code auto-attaches the file whenever a matching file is created or modified.
- **`description`** — model-decided, task-relevance-based loading.
- If both are omitted, the file must be attached manually to a chat request. (source: https://code.visualstudio.com/docs/agent-customization/custom-instructions § Instructions file format; https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot § applyTo glob syntax)

**Windsurf/Devin rules ("Memories & Rules")** — a single `trigger` frontmatter field takes four values:
- **`always_on`** ("Always On") — deterministic; full content in every system prompt.
- **`model_decision`** ("Model Decision") — model-decided; only the description loads until Cascade judges it relevant, then it reads the full file.
- **`glob`** ("Glob") — deterministic; applied when Cascade reads/edits a file matching the rule's `globs` pattern.
- **`manual`** ("Manual") — user-typed; inactive until `@rule-name` is typed.
Workspace rule files cap at 12,000 characters; global rules cap at 6,000. (source: https://docs.devin.ai/desktop/cascade/memories § Activation Modes)

**Pattern across all three:** every product separates "the model reads a natural-language description and judges relevance" (Cursor's Agent Requested, Copilot's bare `description`, Windsurf's Model Decision) from "a glob deterministically matches the file being touched" (Cursor's Auto Attached, Copilot's `applyTo`, Windsurf's Glob), plus an always-on tier and a manual/@-mention tier. The four-way taxonomy is structurally identical across all three; only field names and value spellings differ.

---

## 4. Published guidance on writing a good trigger description

- **Third person, always.** "The description is injected into the system prompt, and inconsistent point-of-view can cause discovery problems." Good: "Processes Excel files and generates reports." Avoid: "I can help you..." / "You can use this to...". (source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices § Writing effective descriptions)
- **Say what it does AND when to use it, with concrete keywords.** "Include both what the Skill does and specific triggers/contexts for when to use it" — e.g. naming ".xlsx" and "Excel" explicitly rather than writing "Helps with documents." Each skill gets exactly one description, and with 100+ skills installed it is what the model uses to pick the right one. (source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices § Writing effective descriptions)
- **Use gerund-form names** (`processing-pdfs`, not `pdf-helper` or `utils`) so the name signals the activity itself. (source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices § Naming conventions)
- **Put the key use case first**, and use the Claude-Code-specific `when_to_use` field for trigger phrases/example requests, separate from the core `description` — the two are truncated together at 1,536 characters in the skill listing. (source: https://code.claude.com/docs/en/skills § Frontmatter reference)
- **Test discovery, don't assume it.** Anthropic frames this as build-evaluate-iterate: write at least three evaluation scenarios, run them, and treat a missed trigger as a description bug to fix, not a one-time task. (source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices § Build evaluations first)
- **UNVERIFIED / not found in Anthropic's current wording:** several third-party mirrors (e.g. a community "superpowers" skills repository) attribute the phrase "make descriptions a little bit pushy" and "Claude has a tendency to undertrigger skills" to Anthropic. Direct fetches of both current official pages (platform.claude.com best-practices and code.claude.com/docs/en/skills) do not contain this wording as of 2026-09-24 — it may be from an earlier doc revision or a third-party paraphrase. Not attributed to Anthropic here without a live citation.

---

## Summary table

| Product | Skills (SKILL.md) | Discovery path(s) | Skill invocation | Slash-command/prompt format | Argument syntax |
|---|---|---|---|---|---|
| Claude Code | Yes (native origin) | `~/.claude/skills/` (personal), `.claude/skills/` (project) | Model (description) + `/skill-name` | `.claude/commands/*.md` | `$ARGUMENTS`, `$N`, `$name` (see file 01) |
| OpenAI Codex CLI | Yes | `.agents/skills` (repo→root), `$HOME/.agents/skills`, `/etc/codex/skills` | Model ("implicit") + `$skill-name`/`/skills` | `~/.codex/prompts/*.md` via `/prompts:<name>` | `$1`–`$9`, `$ARGUMENTS`, named `KEY=value`, `$$` |
| Cursor | Yes | `.cursor/skills/`, `.agents/skills/` (project); `~/.cursor/skills/`, `~/.agents/skills/` (user); legacy `.claude/`, `.codex/` | Model (unless disabled) + `/skill-name` | `.cursor/commands/*.md`, `~/.cursor/commands/` via `/` | None documented — body inserted as-is |
| Gemini CLI | Yes | built-in → extension → `~/.gemini/skills/`\|`~/.agents/skills/` → `.gemini/skills/`\|`.agents/skills/` | Model (`activate_skill` tool) + `/skills` | `.gemini/commands/*.toml`, `~/.gemini/commands/` | `{{args}}`; shell `!{...}`; file `@{...}` |
| GitHub Copilot / VS Code | Yes (since 2025-12-18) | `.github/skills/`, `.claude/skills/`, `.agents/skills/` (project); `~/.copilot/skills/` etc. (personal) | Model (description) + `/` menu | `.github/prompts/*.prompt.md` via `/name` | None (manual-only; no placeholders documented) |
| Goose | Yes | `~/.agents/skills/` (global), `.agents/skills/` (project), `~/.agents/plugins/<name>/`; legacy `~/.claude/skills/`, `.goose/skills/` | Model (match) + explicit request/`/skills` CLI | No distinct custom-command doc found | UNVERIFIED |
| Amp | Yes | 11-step precedence chain; core: `~/.agents/skills/`, `.agents/skills/`+parents, `.claude/skills/`+parents, `amp.skills.path` | Model only (documented) | No distinct custom-command doc found | UNVERIFIED |
| OpenCode | Yes | global `~/.config/opencode/skills` etc.; project `.opencode/skills` etc. (walks to project root) | Model (`skill` tool call), opt-out via metadata flag | No distinct custom-command doc found | UNVERIFIED |
| Windsurf (Devin Desktop) | Out of Q1 scope — not checked | — | — | `.devin/workflows/*.md` (pref.) / `.windsurf/workflows/*.md` (legacy) via `/name` | None documented; manual-only |
| Continue | Out of Q1 scope — not checked | — | — | `config.yaml` `prompts:` block, or experimental `.prompt` files (location UNVERIFIED) | Handlebars templating; `invokable: true` exposes as slash command |

---

## Notes on verification

- All fetches performed 2026-09-24 against live documentation. Version/date markers are quoted where the page showed one (VS Code Agent Skills doc last updated 9/16/2026; GitHub Copilot changelog dated 2025-12-18; Anthropic's Agent Skills post dated 2025-10-16, updated 2025-12-18).
- Two products' documentation moved domains since their agentskills.io listing was last updated: Goose (`block.github.io/goose` → `goose-docs.ai`, old URL 404s) and Windsurf (`docs.windsurf.com` → `docs.devin.ai`, rebranded "Devin Desktop" under Cognition). Both redirects/404s were confirmed live, not assumed.
- Everything marked UNVERIFIED above was checked against at least one primary-source attempt that either 404'd, redirected to an unrelated stub, or simply didn't document the specific fact — none are guesses.
