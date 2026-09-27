# Research: Subagents and Multi-Agent Systems Across Providers

Compiled 2026-09-24 for the subagents chapter. Question set: (1) how work is handed to a second agent, (2) what that agent receives, (3) what comes back to the first agent, (4) whether it can nest. Primary sources only (official docs, official repos, first-party blogs); anything else is marked `secondary`. Anything neither page nor search could confirm is marked `UNVERIFIED` rather than guessed.

---

## 1. OpenAI Agents SDK — handoffs vs. agents-as-tools

- The SDK ships two distinct primitives: **handoffs** (transfer control to another agent) and **agents-as-tools** (call another agent while keeping control). (source: https://openai.github.io/openai-agents-python/multi_agent/ § LLM-driven orchestration — Agents as tools / Handoffs)
- A handoff is declared by listing agents (or `handoff()`-wrapped agents) in an `Agent`'s `handoffs` param; `handoff()` takes `tool_name_override`, `tool_description_override`, an `on_handoff` callback, and an `input_type` schema for structured tool-call arguments. (source: https://openai.github.io/openai-agents-python/handoffs/ § Handoffs)
- Default history behavior on a handoff: "it's as though the new agent takes over the conversation, and gets to see the entire previous conversation history" — full transfer, not a fresh context — though an `input_filter` can trim what the new agent sees, and an (opt-in, off-by-default) nested-handoff-history feature can compact older segments. (source: https://openai.github.io/openai-agents-python/handoffs/ § Handoffs)
- Agents-as-tools (`Agent.as_tool()`) is recommended when you want "structured input for a nested specialist without transferring the conversation" — the manager agent stays in control, invokes the specialist like any tool, and receives its output to combine with other specialists' results. (source: https://openai.github.io/openai-agents-python/handoffs/ § Handoffs; https://openai.github.io/openai-agents-python/multi_agent/ § Agents as tools)
- The two compose freely: "a triage agent might hand off to a specialist, and that specialist can still call other agents as tools for narrow subtasks" — nesting across both mechanisms is explicit. (source: https://openai.github.io/openai-agents-python/multi_agent/ § combining handoffs and agents-as-tools)
- A third, non-LLM option is also documented: code-based orchestration — structured-output classifiers, sequential chaining, evaluator/optimizer loops, and `asyncio.gather` for running agents in parallel. (source: https://openai.github.io/openai-agents-python/multi_agent/ § Orchestrating via code)

## 2. OpenAI Codex CLI

- Delegation is currently user- or config-triggered: explicit phrasing ("spawn two agents," "delegate this in parallel," "use one agent per point") or an applicable `AGENTS.md`/skill instruction that requests it; OpenAI states subagents launch only when asked, though "Ultra" intelligence-level sessions can delegate proactively. (source: https://learn.chatgpt.com/docs/agent-configuration/subagents § Subagents — note: `developers.openai.com/codex/subagents` 308-redirects here)
- A subagent is described as "a child thread launched under the control of a parent session," aimed at read-heavy, parallelizable work — codebase research, review, triage, log analysis. (source: https://learn.chatgpt.com/docs/agent-configuration/subagents § Subagents)
- What context a subagent actually receives (full parent history vs. a written brief) is **not** spelled out on this page beyond "inherits model and tool" settings — UNVERIFIED.
- What returns to the parent is a **summary**, not a transcript: "consolidated response," distilled takeaways so the main thread keeps "requirements, decisions, and final outputs," with per-subagent status shown in "Active" / "Done" lists. (source: https://learn.chatgpt.com/docs/agent-configuration/subagents § Subagents)
- Nesting (a subagent spawning its own subagent) is not addressed on this page — UNVERIFIED.

## 3. Gemini CLI

- Subagents are Markdown files with YAML frontmatter at `.gemini/agents/*.md` (project) or `~/.gemini/agents/*.md` (user), and are "exposed to the main agent as a tool of the same name." (source: https://geminicli.com/docs/core/subagents/ § How They Work)
- Three trigger paths: automatic delegation (the main model decides), explicit forcing via `@agent_name`, and the underlying tool-call mechanism itself. (source: https://geminicli.com/docs/core/subagents/ § Delegation Mechanisms)
- Each subagent runs in "a separate context loop": isolated history that "does not bloat the main agent's context," and only the tools explicitly granted to it (not the full tool registry). (source: https://geminicli.com/docs/core/subagents/ § Context and Isolation)
- Return value: the subagent "reports back to the main agent with its findings" once done — a result, not its working transcript. (source: https://geminicli.com/docs/core/subagents/ § Return Values)
- Nesting is explicitly disallowed: "subagents cannot call other subagents," even one holding the `*` tool wildcard — stated purpose is preventing infinite loops and excess token use. (source: https://geminicli.com/docs/core/subagents/ § Nesting Restrictions)
- Gemini CLI additionally documents remote subagents over an Agent-to-Agent (A2A) protocol at a dedicated doc page (https://geminicli.com/docs/core/remote-agents/); its existence is confirmed via search indexing but its mechanism was not directly fetched — UNVERIFIED in detail.

## 4. Cursor

Cursor ships three separate, distinctly named mechanisms worth keeping apart in the chapter:

- **Subagents (in-session):** the parent launches one with a prompt containing "all necessary context," because a subagent starts with a "clean context" and has no access to prior conversation. (source: https://cursor.com/docs/subagents § Delegation and Context)
- What returns to the parent is "a final message with its results" only: "Intermediate output stays in the subagent. The parent only sees the final summary." (source: https://cursor.com/docs/subagents § What Subagents Return)
- Two execution modes: **foreground** ("Blocks until the subagent completes. Returns the result immediately") and **background** ("Returns immediately. The subagent works independently"). (source: https://cursor.com/docs/subagents § Foreground vs background)
- Nesting is capped at one level: "A subagent launched by another subagent can't launch further ones." (source: https://cursor.com/docs/subagents § FAQ)
- **Background/Cloud agents (separate feature):** a task moves to a dedicated remote VM with "your repository, dependencies, secrets, and network access"; it plans, edits, runs commands and tests unattended over minutes or hours. (source: https://cursor.com/help/ai-features/background-agents)
- It reports back by attaching "videos, screenshots, and logs to the pull request, so you can validate the work without checking out the branch," and the VM is "sandboxed and isolated from your local machine, so the agent's commands never touch your environment." (source: https://cursor.com/help/ai-features/background-agents § How do background agents show their work? / Security Isolation)
- **Projects / coordinator pattern:** for larger work, Cursor's own docs describe "a coordinator agent [that] plans the work and delegates it to other agents," though the context-passing mechanics of that delegation aren't detailed further on this page. (source: https://cursor.com/docs/agent/overview § Delegation & Coordination)
- **Parallel agents via git worktrees:** `secondary` — per third-party coverage, Cursor 2.0 (Oct 2025) added running agents in parallel using git worktrees or remote machines so concurrent agents can't overwrite each other's files, and Cursor 3's "Agents Window" (reported launch April 2, 2026) runs agents across local workspaces, cloud, worktrees, and remote SSH, with up to 8 simultaneous agents mentioned. Not verified against a Cursor-owned page directly. (secondary sources: https://dev.to/arifszn/git-worktrees-the-power-behind-cursors-parallel-agents-19j1 ; https://www.agentpatterns.ai/tools/cursor/agents-window/)

## 5. GitHub Copilot

- **Custom agents (`.agent.md`):** Markdown files with YAML frontmatter defining "prompts, tools, and MCP servers"; stored at `.github/agents/*.agent.md` (repo/org/enterprise, shared) or `~/.copilot/agents/*.agent.md` (personal). Selecting one "instantiates the custom agent" in the Copilot Chat panel, CLI, or a cloud-agent task in place of default behavior. (source: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents § Agent profile format)
- Whether one custom agent can delegate to another custom agent is not specified on this page — UNVERIFIED.
- **Copilot coding agent** (the autonomous cloud agent, distinct from a custom-agent profile): triggered by assigning a GitHub issue to Copilot, an `@copilot` mention, VS Code, or a schedule/event; it runs inside an ephemeral GitHub Actions environment, explores the repo, writes changes, and opens a pull request for review. (source: https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent § About GitHub Copilot cloud agent)
- Context is frozen at assignment time: it receives "the issue title, description, and existing comments," but **not** comments added afterward — follow-ups have to go on the resulting pull request instead. (source: https://docs.github.com/copilot/how-tos/use-copilot-agents/coding-agent/assign-copilot-to-an-issue § Assigning issues to Copilot)
- One task maps to one branch and exactly one pull request; the coding agent does not delegate to or spawn other agents itself, though a team can register several distinct custom-agent profiles for different task types. (source: https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent § About GitHub Copilot cloud agent)

## 6. LangGraph — supervisor and swarm

- **Supervisor** (`langgraph-supervisor`): delegation runs through a handoff tool that returns a `Command` object routing execution to the chosen sub-agent — the LLM picks the tool, the framework performs the routing. (source: https://github.com/langchain-ai/langgraph-supervisor-py)
- Default context: "`create_handoff_tool` passes full message history (all of the messages generated in the supervisor up to this point), as well as a tool message indicating successful handoff." (source: https://github.com/langchain-ai/langgraph-supervisor-py § Customizing handoff tools)
- What returns to the supervisor is configurable: `"full_history"` (everything the sub-agent produced) or `"last_message"` (only its final answer). (source: https://github.com/langchain-ai/langgraph-supervisor-py § Message History Management)
- Sub-agents cannot talk to each other directly: "the supervisor controls all communication flow and task delegation" — strict hub-and-spoke. (source: https://github.com/langchain-ai/langgraph-supervisor-py)
- **Swarm** (`langgraph-swarm`): peer agents hand off directly to one another via a `create_handoff_tool()`-generated tool returning a `Command`; by default all agents share a single `messages` state key, though isolated per-agent histories are possible with a custom state schema. (source: https://github.com/langchain-ai/langgraph-swarm-py § Handoff Tool / State Sharing)
- An `active_agent` field, persisted via the graph's checkpointer, "remembers which agent was last active, ensuring that on subsequent interactions, the conversation resumes with that agent" — this is swarm's stand-in for cross-turn session state. (source: https://github.com/langchain-ai/langgraph-swarm-py § Active agent memory)
- Repeated, bidirectional handoffs are supported (reference example: two agents handing control back and forth); nesting a swarm inside a swarm is not addressed — UNVERIFIED.

## 7. CrewAI

- **Hierarchical process:** a manager agent — auto-generated from a `manager_llm`, or supplied as a custom `manager_agent` — dynamically assigns tasks to worker agents by capability and reviews output before proceeding, versus **sequential** process where task order is fixed and "the output of one task serv[es] as context for the next." (source: https://docs.crewai.com/concepts/processes § Hierarchical Process / Sequential Process)
- Independent of hierarchical mode, **any** agent with `allow_delegation=True` automatically gets two tools: `Delegate work to coworker(task, context, coworker)` and `Ask question to coworker(question, context, coworker)`. (source: https://docs.crewai.com/en/concepts/collaboration § How Agent Collaboration Works)
- The receiving agent gets a task/question string, a context string, and the identity of the delegating coworker — a written brief, not the delegator's full transcript. (source: https://docs.crewai.com/en/concepts/collaboration)
- What flows back to the delegating agent beyond "the coworker's answer" isn't detailed on this page — UNVERIFIED.
- Live caveat for the chapter: CrewAI's own issue tracker has an open bug report that hierarchical-process manager agents can fail to actually delegate to workers even with `allow_delegation=True` set — documented behavior and shipped behavior can diverge. (source: https://github.com/crewAIInc/crewAI/issues/4783)
- Whether a delegate can itself delegate further (chained delegation) isn't addressed — UNVERIFIED.

## 8. Google Agent Development Kit (ADK)

- **`sub_agents`** is the hierarchical-composition mechanism: pass a list of specialist agents to a parent's `sub_agents=[...]`; the parent LLM decides whether to transfer based on each sub-agent's own `description`. (source: https://adk.dev/tutorials/agent-team/ § Step 3: Building an Agent Team — Delegation for Greetings & Farewells)
- Unlike every other system surveyed here, ADK sub-agents do **not** get an isolated context — they run inside "the same session context as the parent," sharing `session.state` and the same session/user/app identifiers, so state one agent's tools write is visible to the others. (source: https://adk.dev/tutorials/agent-team/ § Context and Session State Transfer)
- Control returns to the root agent automatically once the sub-agent finishes; no documented "break" signal, just a plain return into the conversation loop. (source: https://adk.dev/tutorials/agent-team/ § Return Flow and Control)
- **`AgentTool`** is ADK's separate, explicit mechanism for calling another agent the way you'd call a function tool (conceptually parallel to OpenAI's agents-as-tools), keeping the caller in control rather than transferring the session. Its existence is confirmed by ADK's own documentation index, but the exact shape of what it returns to the caller was not confirmed against a fetched page in this pass — UNVERIFIED in detail. (source: https://google.github.io/adk-docs/ — general site index, AgentTool subpage not directly fetched)
- Whether `sub_agents` delegation nests (a sub-agent that itself has `sub_agents`) is not addressed in the tutorial — UNVERIFIED.

## 9. Microsoft Agent Framework / AutoGen

- **AutoGen is in maintenance mode:** Microsoft's own overview states Agent Framework is "the direct successor, created by the same teams," combining "AutoGen's simple abstractions for single- and multi-agent patterns with Semantic Kernel's enterprise-grade features," and points new users to Agent Framework via a dedicated AutoGen migration guide. (source: https://learn.microsoft.com/en-us/agent-framework/overview/ § Why Agent Framework?)
- Agent Framework's multi-agent primitive is the **Workflow**: "Functional and graph-based workflows that connect agents and functions through explicit execution paths" — typed nodes and edges replace an LLM-driven "who speaks next" manager. (source: https://learn.microsoft.com/en-us/agent-framework/overview/ § [Agent Framework brings together four primary areas])
- Whether Workflows support nesting (a workflow node that is itself a sub-workflow) is not stated on the overview page — UNVERIFIED.
- **AutoGen's Group Chat** pattern (still live in AutoGen's maintained "stable" docs) works differently: a Group Chat Manager makes an LLM call over the accumulated message history plus the list of participant roles to pick the next speaker, and explicitly "make[s] sure the group chat manager always picks a different participant to speak next." (source: https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/design-patterns/group-chat.html § Group Chat Manager)
- Every participant sees the full shared conversation: each agent extends its own local `_chat_history` with every new `GroupChatMessage` published to the group, so there is no per-agent context isolation inside a group chat. (source: https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/design-patterns/group-chat.html § Message Protocol)
- There's no single consolidated "return value" — the chat just stops once the manager detects a termination condition (the worked example looks for an "APPROVED" keyword), and the result lives distributed across participants' message histories. (source: https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/design-patterns/group-chat.html)
- Nesting is explicit and supported: "It is also possible to nest group chats into a hierarchy with each participant a recursive group chat." (source: https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/design-patterns/group-chat.html)

## 10. Anthropic — "How we built our multi-agent research system"

- Architecture is **orchestrator-worker**: a lead agent coordinates and delegates to subagents operating in parallel, each spun up with "an objective, an output format, guidance on the tools and sources to use, and clear task boundaries" — a written brief, not shared memory. (source: https://www.anthropic.com/engineering/multi-agent-research-system § Architecture overview)
- Subagents act as "intelligent filters": they explore in their own parallel context windows, then condense before reporting back — e.g. returning "a list of companies to the lead agent so it can compile a final answer," not their raw research trace. (source: https://www.anthropic.com/engineering/multi-agent-research-system)
- Reported cost, the figure the chapter needs: "agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats." (source: https://www.anthropic.com/engineering/multi-agent-research-system § Benefits of a multi-agent system)
- When it's worth it: "tasks that involve heavy parallelization, information that exceeds single context windows, and interfacing with numerous complex tools." (source: https://www.anthropic.com/engineering/multi-agent-research-system)
- When it isn't: "domains that require all agents to share the same context or involve many dependencies between agents are not a good fit for multi-agent systems today" — this is the direct point of tension with Cognition's argument below. (source: https://www.anthropic.com/engineering/multi-agent-research-system)

## 11. Cognition — "Don't Build Multi-Agents"

- Core failure mode: **context fragmentation**. The worked example has two agents independently build halves of a Flappy Bird clone; each picks a visual style with no visibility into the other's choice, and the halves don't match.
- Principle 1: "Share context, and share full agent traces, not just individual messages" — passing only the original task instruction is insufficient once a real task spans multiple turns and tool calls that shaped how it was interpreted.
- Principle 2: "Actions carry implicit decisions, and conflicting decisions carry bad results" — agents working in parallel without visibility into each other's intermediate actions will make incompatible assumptions.
- Prescription: prefer "a single-threaded linear agent" with continuous context over splitting work across agents that can't see each other's reasoning. The piece concedes this runs into context-window limits on very long tasks, but argues reliability and architectural simplicity win for most real applications.
- (source for all of the above: https://cognition.ai/blog/dont-build-multi-agents — 301-redirects to https://cognition.com/blog/dont-build-multi-agents)

---

## Summary table

| System | Hand-off mechanism | What the second agent receives | What returns to the first agent | Nesting |
|---|---|---|---|---|
| OpenAI Agents SDK | `handoff()` (control transfer) **or** `Agent.as_tool()` (tool call) | Full conversation history by default (handoff); a structured input (as-tool) | Nothing further — new agent now owns the thread (handoff); the sub-agent's output (as-tool) | Yes — handoff target can itself call agents as tools |
| OpenAI Codex CLI | User- or `AGENTS.md`-triggered "spawn/delegate" request | UNVERIFIED (not detailed in docs) | Condensed summary / consolidated response | UNVERIFIED |
| Gemini CLI | Tool call to a `.md`-defined subagent (`@agent` or automatic) | Isolated context; only its explicitly granted tools | Its findings only | No — explicitly disallowed |
| Cursor (subagents) | In-session launch with an explicit prompt | "Clean" fresh context plus whatever the parent writes into the prompt | Final message only, no intermediate output | One level only |
| Cursor (background/cloud agents) | Task sent to a dedicated remote VM | Full repo, deps, secrets, network access on that VM | A pull request with attached videos/screenshots/logs | Separate mechanism, not nested |
| GitHub Copilot (coding agent) | Issue assignment / `@copilot` mention | Issue title, description, comments as of assignment time | One pull request per task | No delegation described |
| LangGraph (supervisor) | Handoff tool → `Command` | Full message history by default | Full history or last-message only (configurable) | Sub-agents can't talk directly; deeper nesting UNVERIFIED |
| LangGraph (swarm) | Peer `create_handoff_tool()` call → `Command` | Shared `messages` state (default) | Control plus shared state to whichever agent is now active | Bidirectional/repeated handoffs yes; swarm-of-swarms UNVERIFIED |
| CrewAI | Auto-injected "Delegate work to coworker" tool | A task string + context string + asker identity | The coworker's answer (detail UNVERIFIED) | UNVERIFIED; hierarchical delegation itself has an open bug report |
| Google ADK (`sub_agents`) | LLM-driven transfer based on sub-agent `description` | Same session context/state as parent (shared, not isolated) | Control returns to parent automatically | UNVERIFIED |
| Google ADK (`AgentTool`) | Explicit tool call | Structured tool input | Sub-agent's output; caller keeps control | UNVERIFIED |
| Microsoft Agent Framework | Graph Workflow, typed node/edge | Defined by the workflow edge | Defined by the workflow edge | UNVERIFIED |
| AutoGen (Group Chat) | Manager LLM selects next speaker | Full shared conversation history | No single return value — ends on a termination condition | Yes, explicitly (recursive group chats) |

---

*Fetch budget used: 27 page fetches + 9 searches. Redirects hit and re-fetched: `cognition.ai`→`cognition.com`, `developers.openai.com/codex/subagents`→`learn.chatgpt.com`, `google.github.io/adk-docs/...`→`adk.dev/...`.*

---

## Corrections after re-checking (2026-09-24, by LifeOS, on the vendors' own pages)

- **Cursor nesting is two levels, not one.** cursor.com/docs/subagents: *"The main agent and its direct
  subagents can launch subagents, but a subagent launched by another subagent can't launch further ones."*
  The same page says Cursor also reads subagent files from `.claude/agents/` and `.codex/agents/`.
- **Google ADK "same session state as the parent" could not be confirmed.** Two fetches of
  adk.dev/tutorials/agent-team/ found no sentence saying sub-agents share the parent's session or that control
  returns to the parent. COURSE.md step 12 marks those cells "not stated".
- **Claude Code subagents run in the background by default** in interactive sessions (fork mode on), and their
  permission prompts surface in the main session naming the subagent (code.claude.com/docs/en/sub-agents).
- **Anthropic's multi-agent post** is dated June 13, 2025; **Cognition's** is by Walden Yan, June 12, 2025.
