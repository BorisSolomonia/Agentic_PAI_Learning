# Claude Code Skills, Subagents, and Headless Mode — Factual Reference

**Research date:** 2026-09-24  
**Scope:** Official Claude Code documentation at https://code.claude.com/docs/en/

---

## Skills

### 1. Where skills can live and name clash resolution

Skills load from five locations with explicit priority: (1) Enterprise → (2) Personal (~/.claude/skills/) → (3) Project (.claude/skills/) → (4) Nested subdirectories → (5) Plugin → (6) claude.ai sync.  When two skills share a name, Enterprise over Personal, Personal over Project. A project skill replaces a bundled skill, but not its aliases. Plugin skills are namespaced as /plugin-name:skill-name, so they coexist with local skills. Synced skills from claude.ai run as /anthropic-skills:<name> when a name clash occurs. (source: https://code.claude.com/docs/en/skills § Resolve skills that share a name)

### 2. SKILL.md frontmatter fields

**Required fields:** name (optional; defaults to directory name), description (recommended).  
**Control invocation:** disable-model-invocation (prevent Claude from auto-invoking), user-invocable (prevent user invocation).  
**Execution:** allowed-tools (grant permission without prompting), disallowed-tools (deny specific tools), model (override session model), effort (override effort level), context (set to fork to run in subagent), agent (which subagent type for context: fork).  
**Advanced:** when_to_use (additional trigger hints), argument-hint (autocomplete label), arguments (named positional args), paths (glob patterns to limit when auto-invoked), shell (bash or powershell), metadata (free-form YAML), hooks (lifecycle hooks when invoked), background (when context: fork, set to false to wait for result), license, compatibility.  
All fields optional except name. (source: https://code.claude.com/docs/en/skills § Frontmatter reference)

### 3. What enters model context and limits

**What loads:** skill description (always in context) + full skill content (loads on invocation). Combined descriptions of custom subagents exceeding 15,000 tokens trigger a warning at startup; individual skill descriptions are truncated at 1,536 characters in skill listings (description + when_to_use combined). The 1,536-character cap reduces context usage. (source: https://code.claude.com/docs/en/skills § Frontmatter reference and https://code.claude.com/docs/en/subagents § Built-in subagents)

### 4. How skill content enters context and lifecycle

When you or Claude invoke a skill, the rendered SKILL.md content enters as a single message and stays across later turns. Supporting files can be referenced via markdown links but must be explicitly opened by Claude; scripts are executed and output injected, not the source code. Dynamic context injection (! commands) runs before Claude sees the skill body, with output inlined. If the rendered content is identical to what's already in context, Claude Code appends a short note instead of a second copy. (source: https://code.claude.com/docs/en/skills § Skill content lifecycle)

### 5. Invocation methods and arguments

**User invocation:** type `/skill-name` in the prompt or `/<nested-path>:skill-name` for nested skills.  
**Model invocation:** Claude loads automatically based on description.  
**Argument syntax:** $ARGUMENTS (all args), $N or $ARGUMENTS[N] (indexed, 0-based), $name (named argument from arguments frontmatter), ${CLAUDE_SESSION_ID}, ${CLAUDE_EFFORT}, ${CLAUDE_SKILL_DIR}, ${CLAUDE_PROJECT_DIR}, ${CLAUDE_PLUGIN_ROOT}, ${CLAUDE_PLUGIN_DATA}.  
**Dynamic context injection:** `!`command`` on its own line runs the command before Claude reads the skill, inlining output. (source: https://code.claude.com/docs/en/skills § Available string substitutions and Dynamic context injection)

### 6. .claude/commands still exist

Custom commands in .claude/commands/*.md still work. They support the same frontmatter as skills except `name` and `paths`, which don't apply to command files. Skills are preferred for new work because skills also support supporting files and directories. (source: https://code.claude.com/docs/en/skills § Create your first skill)

### 7. Mid-session skill edits picked up without restart

Claude Code watches skill directories (.claude/skills/, ~/.claude/skills/, and --add-dir directories' .claude/skills/) for changes. When you add, edit, or remove a SKILL.md or supporting files, Claude Code picks up the change within a few seconds, without a restart. For a skill folder that is also a plugin, changes to hooks/, .mcp.json, agents/, and output-styles/ need /reload-plugins. If the .claude/skills/ directory itself didn't exist when the session started, restart Claude Code so it can watch the new directory. (source: https://code.claude.com/docs/en/skills § Edit a skill during a session)

### 8. /skills command and /context categories

The `/skills` command lists available skills, grouped by source (personal, project, nested, plugin, claude.ai sync). No `/context` command is documented in the official skills page; `/context` does not appear to report skills. (source: https://code.claude.com/docs/en/skills § Overall reference and skills section index)

---

## Subagents

### 9. Subagent file locations and frontmatter fields

**Locations (priority):** Managed settings → --agents CLI flag → .claude/agents/ (project) → ~/.claude/agents/ (personal) → plugins.  
**Frontmatter fields:** name (required), description (required), tools (comma-separated or YAML list), disallowedTools (deny list), model (sonnet, opus, haiku, fable, or full ID), permissionMode (default, acceptEdits, auto, dontAsk, plan, bypassPermissions), maxTurns (agentic turn limit), skills (preload list), mcpServers (inline or referenced), hooks, memory (user, project, local), background (true/false for background or foreground), effort (low/medium/high/xhigh/max), isolation (worktree), color, initialPrompt, omitClaudeMd, experimental (cacheTtl). (source: https://code.claude.com/docs/en/subagents § Frontmatter reference)

### 10. What subagent receives at startup

A subagent receives: its system prompt (the markdown body from its file), NOT the parent conversation history, CLAUDE.md files (unless omitClaudeMd: true), git status snapshot, any preloaded skills (full content, not descriptions), specified MCP servers, and basic environment details like working directory. It does NOT receive the main conversation's context or messages. (source: https://code.claude.com/docs/en/subagents § Write subagent files and What loads at startup)

### 11. Can subagents spawn other subagents

Yes. A subagent can spawn other subagents using the Agent tool while a depth limit allows it (depth limit prevents infinite spawning). The Agent tool is available to subagents unless disallowedTools removes it or it hits the depth limit. (source: https://code.claude.com/docs/en/subagents § Available tools and Let subagents spawn their own subagents)

### 12. Built-in subagents and invocation

**Built-in types:** Explore (fast, read-only, for searching/analyzing codebases), Plan (read-only exploration with detailed reasoning), General-purpose (fallback when no subagent_type is specified and no user subagent covers the task).  
**Invocation:** Claude automatically delegates when a task matches a subagent's description. Users cannot directly invoke subagents with a slash command; delegation is automatic or via @-mention syntax in some contexts. The `/agents` command no longer opens an interactive wizard (as of v2.1.198); it now prints a reminder to ask Claude or edit .claude/agents/ directly. (source: https://code.claude.com/docs/en/subagents § Built-in subagents and Quickstart)

### 13. Project skills/subagents in headless (-p) mode

Project skills and subagents **are available in headless (-p) mode** unless you pass `--bare` (which skips autodiscovery) or `--safe-mode`. In bare mode, project .claude/skills/ is still loaded from --add-dir directories, but .claude/agents/ is not. To see tool calls in headless output: use `--output-format stream-json --verbose` to receive newline-delimited JSON events where each tool_use and tool_result appears. The `--forward-subagent-text` flag or CLAUDE_CODE_FORWARD_SUBAGENT_TEXT environment variable includes subagent text and thinking blocks. (source: https://code.claude.com/docs/en/headless § Run Claude Code programmatically and Follow subagent messages)

### 14. Hook exit codes and PreToolUse behavior

**Exit 0:** Success; action proceeds; JSON output is read for structured decisions.  
**Exit 2:** Blocking error (special exit code); blocks the action on PreToolUse and other compatible events; the block cannot be overridden (even JSON permissionDecision: "allow" cannot override); action does NOT proceed.  
**Other non-zero codes (exit 1, etc.):** Non-blocking errors; action proceeds despite the error; Claude Code reports a hook error notice with stderr; if valid JSON is provided, JSON decisions are honored.  
**PreToolUse hook behavior:** If the PreToolUse hook exits 2, the tool call is blocked and does not run. If it exits 0 or any other value, the tool call proceeds. (source: https://code.claude.com/docs/en/hooks § Hook exit codes)

---

## Agent SDK (TypeScript @anthropic-ai/claude-agent-sdk)

### 15(a). Does query() load filesystem settings by default?

Yes. By default `query()` loads filesystem settings when no `settingSources` / `setting_sources` is explicitly set. Default behavior includes both 'user' and 'project' sources, so CLAUDE.md and .claude/settings.json load automatically. Pass `settingSources: []` (TypeScript) or `setting_sources: []` (Python) to disable all filesystem settings; a non-empty array loads only the named sources ('user', 'project', 'local', 'managed'). (source: https://code.claude.com/docs/en/agent-sdk/configuration § Load settings files and https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts § CLAUDE.md files for project-level instructions)

### 15(b). Default system prompt when systemPrompt is omitted

When `systemPrompt` / `system_prompt` is omitted, the Agent SDK uses a **minimal default prompt** that covers tool calling but omits the claude_code preset's content: no security rules, safety instructions, or environment context. This **differs from CLI mode (`claude -p`)**, which uses the full claude_code preset by default. To get the preset in the SDK, explicitly set `systemPrompt: { type: "preset", preset: "claude_code" }` (TypeScript) or `system_prompt={"type": "preset", "preset": "claude_code"}` (Python). To append custom instructions to the preset: `systemPrompt: { type: "preset", preset: "claude_code", append: "..." }`. (source: https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts § How system prompts work and Decide on a starting point)

### 15(c). How skills and subagents are enabled in the SDK

**Skills:** Load automatically when `settingSources` includes 'user' or 'project' (enabled by default). The SDK reads .claude/skills/ and ~/.claude/skills/ on startup. Control invocation via the Skill tool: don't list it in `allowedTools` or add it to `disallowedTools` to restrict access.  
**Subagents:** Enabled via the `agents` / `agents` option, which accepts a Record<string, AgentDefinition> mapping names to agent definitions. The Agent tool must be in tools for Claude to spawn subagents; restrict via Agent(name, name2) syntax in tools to specify which types can be spawned. (source: https://code.claude.com/docs/en/agent-sdk/configuration § Configure specific features and Permissions § Allow and deny rules)

### 15(d). canUseTool callback vs PreToolUse hooks — which runs first?

**PreToolUse hooks run first** (Step 1 in the permission evaluation order), before deny rules, ask rules, permission mode, allow rules, and the canUseTool callback. A hook that returns allow does not skip the later steps; all rules and modes are still evaluated.  
**canUseTool callback runs last** (Step 6, only if no earlier step resolved the request). **Critically: canUseTool is NOT called for tools auto-approved by allowedTools, permission modes (bypassPermissions, acceptEdits), or allow rules.** Only tools that need approval and match no earlier rule fall through to the callback. A hook allow also doesn't prevent the callback from being called; a hook deny does block it. (source: https://code.claude.com/docs/en/agent-sdk/permissions § How permissions are evaluated)

---

## Surprising findings for mid-2025 learners

1. **Skills load dynamically without restart:** SKILL.md changes are picked up within seconds while a session runs (requires Claude Code v2.1+ watchdog).
2. **Exit code 2 is the ONLY blocking exit code:** Exit 1 (conventional Unix failure) does NOT block in hooks; only exit 2 blocks. This counterintuitive rule is easy to miss.
3. **Subagents receive zero conversation history:** They start fresh with only their system prompt, preloaded skills, and the delegation prompt—no access to prior turns.
4. **The 1,536-character cap is per skill description in the listing:** Each skill's combined description + when_to_use is truncated there, reducing context on startup.
5. **Synced skills from claude.ai can't modify a clause in dynamic context injection:** Synced skills (from your claude.ai account) have their ! command lines replaced with a placeholder in non-cloud sessions; the feature doesn't fully work cross-session.
