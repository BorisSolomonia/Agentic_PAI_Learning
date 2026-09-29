# Agentic Finance — 30-day applied learning track

**Started:** 2026-09-28  
**Cadence:** 2 hours × 5 days/week; weekends off.  
**Execution:** Trello is the commitment system; Calendar protects time; GitHub is the knowledge/code/evidence source of truth.  
**Parallel theory track:** COURSE.md.  
**Architecture method:** AGENT-ARCHITECTURE-GUIDE.md.  
**Master learning notebook:** https://notebook.google.com/notebook/a6068935-ef1d-444f-8827-dc2be63d4d95

This track does not replace COURSE.md. COURSE.md teaches the mechanisms of a LifeOS-class harness. This file applies those mechanisms to real business processes while also pulling in Udemy, primary vendor documentation, reference implementations, security/evaluation material, and competing architecture patterns.

The business process is revealed progressively. Do not invent the remaining process. Each newly described slice changes the architecture only after it is analyzed.

---

# 1. Outcome

The target is not “finish a course.”

The target is to become able to take a real finance/operations process and:

- map it;
- decide what should be deterministic software vs model reasoning;
- decide whether an agent is needed;
- design tools and schemas;
- choose state/memory/retrieval architecture;
- decide single-agent vs specialist agents vs orchestrator;
- compare model/framework/provider alternatives;
- implement with AI assistance while owning the architecture;
- build evals and tracing;
- add approvals/guards;
- deploy a usable system;
- explain why the architecture is the way it is and when it should change.

The platform may eventually contain many agents with distinct missions plus one or more orchestrators. That is an outcome to earn, not a Day-1 assumption.

---

# 2. Current known business slice

The first small slice currently known is:

**Customer → Viber message → Seller → seller aggregates orders → Manager → inventory / product / price context → consolidated operational order**

Known message content often includes:

- customer name;
- product;
- quantity;
- price;

but message shape varies.

Potential capabilities may eventually include:

- interpreting customer messages received by sellers;
- turning heterogeneous messages into structured order candidates;
- helping a seller aggregate multiple customer orders;
- aggregating seller outputs for the manager;
- checking product/inventory/price data;
- identifying missing/ambiguous information;
- routing exceptions to a human.

These are candidate capabilities. They are not yet guaranteed to be separate agents.

Boris will provide the remaining business process incrementally. Every new slice is processed with AGENT-ARCHITECTURE-GUIDE.md before implementation.

---

# 3. Weekly operating system

## Source of truth

**GitHub**
- architecture;
- code;
- ADRs;
- source packs;
- eval datasets/results;
- failure evidence.

**Trello**
- Agentic Finance = upstream option pool;
- week sprint = committed work;
- Today = started work;
- Done = finished work.

**Google Calendar**
- protected execution time;
- descriptive session plan.

## Kanban policies

Commitment point: card moves into **week sprint**.

Started point: card moves into **Today**.

Finished point: the card’s proof/eval and teach-back conditions pass, then it moves to **Done**.

WIP:
- Agentic Finance work in Today: normally 1 primary card;
- do not start a replacement merely because the active item became uncomfortable;
- mark a blocker and resolve it or deliberately decommit it.

One build/learning card should normally fit in one 2-hour block and end in an observable artifact.

Once a card enters week sprint, keep it stable unless:
- an architectural assumption was disproven;
- a real customer/Upwork opportunity gives a better version of the same learning objective;
- a blocker makes the task impossible.

Everything remaining in Agentic Finance can be reordered freely.

Friday feedback loop:
**evidence + failures + new business-process detail + Upwork signals → next week’s sprint.**

Kanban sources:
- Kanban University principles/practices: https://kanban.university/principles-general-practices-kanban-method/
- Atlassian WIP guidance: https://www.atlassian.com/agile/kanban/wip-limits
- Trello automation docs: https://support.atlassian.com/trello/docs/create-and-manage-automations/
- Trello dates/cards: https://support.atlassian.com/trello/docs/adding-dates-to-cards/

---

# 4. Daily session shapes

The session type follows the work; it is not mechanically identical every day.

## Architecture-heavy day — 11:15–13:15

- 11:15–11:35 — NotebookLM source study/comparison.
- 11:35–11:50 — prediction + architecture decision.
- 11:50–12:50 — build the smallest vertical slice.
- 12:50–13:05 — break/test/eval.
- 13:05–13:15 — closed-book teach-back + NotebookLM quiz/check.

## Build-heavy day

- 10–15 min targeted source check.
- 75–85 min implementation.
- 15–20 min eval/trace/failure analysis.
- 10 min teach-back and ADR update.

## Friday review

Use part of the main 2-hour block for:
- eval results;
- failure log;
- architecture decisions that changed;
- NotebookLM cumulative quiz;
- Upwork pattern synthesis;
- next-week sprint pull.

## Upwork market scan — 13:45–14:00 weekdays

ChatGPT is the primary triage layer:
- identify jobs aligned with finance/ERP/operations + agent engineering;
- classify BUILD NOW / LEARN GAP / SKIP;
- extract hidden architecture requirements;
- identify the single capability gap;
- judge portfolio/profile fit;
- draft a tailored bid when appropriate.

Codex is primarily for technical execution after a job is selected:
- inspect repos;
- prototype;
- estimate from code;
- implement/test.

A future scan becomes more profile-aware once Boris provides his exact Upwork profile URL.

---

# 5. Source policy

For every consequential architecture decision the course provides a **Notebook Source Pack**.

A source pack should normally include:
- primary framework/model/vendor docs;
- one or more competing architecture sources;
- reference implementation/repository;
- evaluation or security/limitation material;
- domain-specific material when relevant.

Prefer primary sources. Tutorials are secondary.

The purpose is not to ask NotebookLM “which is best?” The purpose is to understand:
- what problem each pattern solves;
- how it works;
- what it costs;
- where state and authority live;
- how it fails;
- when a simpler deterministic approach wins.

---

# 6. NotebookLM learning protocol

NotebookLM is the source-grounded learning and synthesis layer, not the architecture decision-maker.

Official feature references:
- NotebookLM Help: https://support.google.com/notebooklm/answer/16246230
- learning features / quizzes / flashcards: https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-student-features/
- source selection + mobile quizzes/flashcards: https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-app-quizzes-flashcards/
- research upgrades: https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/
- Audio Overviews: https://blog.google/innovation-and-ai/products/notebooklm-audio-overviews/
- Video Overviews / Studio / Mind Maps: https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-video-overviews-studio-upgrades/

Use corresponding features deliberately:

| Feature | Course use |
|---|---|
| grounded chat + citations | compare architectural claims and open source passages |
| source selection | isolate only the alternatives being compared |
| Discover Sources / research | expand the design space before important decisions |
| Mind Maps | understand relationships among loop, tools, state, memory, agents, orchestration |
| quizzes | post-build mastery check |
| flashcards | precise distinctions and vocabulary |
| Learning Guide / reports | first-pass synthesis before implementation |
| Audio Overview | reinforcement outside the protected build block |
| Video Overview | visual reinforcement for architecture-heavy concepts |
| notes | prediction, source disagreement, decision rationale |

Rule: write your prediction before NotebookLM gives you the comparison.

---

# 7. Core sources used throughout the track

## Main course

Udemy — The Complete Agentic AI Engineering Course:
https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/learn/lecture/49820721#notes

Use the relevant lesson when today’s build reaches that mechanism. Do not wait to finish the course linearly before building.

## Reference architecture

Daniel Miessler LifeOS:
https://github.com/danielmiessler/LifeOS

Local curriculum/reference:
- COURSE.md
- ALTERNATIVES.md
- CHECKLIST.md
- research/
- build/myos/
- build/notes/FAILURES.md

## Agent architecture alternatives

Anthropic — Building effective agents:
https://www.anthropic.com/engineering/building-effective-agents

Anthropic — Building Effective AI Agents architecture guide:
https://resources.anthropic.com/building-effective-ai-agents

OpenAI Agents SDK:
https://openai.github.io/openai-agents-python/

OpenAI agent orchestration:
https://openai.github.io/openai-agents-python/multi_agent/

LangChain/LangGraph learning/multi-agent patterns:
https://docs.langchain.com/oss/python/learn

CrewAI Flows:
https://docs.crewai.com/en/concepts/flows

Google Agent Development Kit:
https://google.github.io/adk-docs/agents/
https://google.github.io/adk-docs/workflows/

Model Context Protocol:
https://modelcontextprotocol.io/

## Tool design / security / evals

Anthropic — Writing effective tools for agents:
https://www.anthropic.com/engineering/writing-tools-for-agents

OpenAI Agents SDK tools:
https://openai.github.io/openai-agents-python/tools/

Gemini function calling:
https://ai.google.dev/gemini-api/docs/function-calling

Gemini structured output:
https://ai.google.dev/gemini-api/docs/structured-output

OWASP prompt injection prevention:
https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html

OpenAI Agents SDK tracing:
https://openai.github.io/openai-agents-python/tracing/

OpenAI Agents SDK deterministic testing:
https://openai.github.io/openai-agents-python/testing/

LangSmith evaluation types:
https://docs.langchain.com/langsmith/evaluation-types

---

# 8. Week 1 — detailed plan

This first week is intentionally only four execution sessions because the plan is being activated after Monday’s protected block has already passed. Friday still closes the week and generates Week 2.

The objective is not to finish the order system. It is to learn and prove the first architectural primitives on the first real business slice.

---

## Session 1 — Tue 2026-09-29
# Model the first business slice + build one tiny vertical slice

### Outcome

A real process map exists for:
**customer message → seller → aggregate → manager → inventory context**

and one synthetic message can travel through a minimal executable path into a structured order candidate.

### Business questions

Clarify only what is necessary from the process already known:
- who receives which message;
- what seller currently changes/combines;
- what manager needs;
- what inventory data is needed and when;
- what may be missing/ambiguous.

Do not invent the remaining 98% of the business.

### Architecture decision

Classify each known step:
- deterministic workflow;
- extraction;
- reasoning;
- retrieval/tool;
- possible future agent;
- human judgment.

Do not decide “two agents” merely because two humans currently touch the order.

### COURSE/LifeOS mirror

Read/review:
- COURSE.md Part 2 intro and Steps 7–9.
- ALTERNATIVES D6–D9.
- build/notes/01-five-surfaces.md.

Focus question:
**What is an agent mechanically, and which capability here actually needs one?**

### Notebook Source Pack

Add/select:
- Anthropic building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- OpenAI Agents SDK overview: https://openai.github.io/openai-agents-python/
- Google ADK agents: https://google.github.io/adk-docs/agents/
- LangGraph/LangChain learning patterns: https://docs.langchain.com/oss/python/learn
- LifeOS: https://github.com/danielmiessler/LifeOS
- AGENT-ARCHITECTURE-GUIDE.md from this repo.

NotebookLM questions:
1. Compare workflow, augmented LLM, agent loop, and multi-agent system.
2. What evidence would justify moving from one model call to an agent loop?
3. Where do these sources explicitly favor simpler architecture?
4. Which parts of the current order slice are likely deterministic?
5. Show citations for each answer.

Before asking: write your prediction.

### Build

Use synthetic but realistic order messages.

Minimum executable slice:
**message string → structured OrderCandidate → printed result**

No production Viber integration yet.

### Break it

Use at least:
- missing quantity;
- two products in one message;
- unknown product wording.

### Proof

Repository contains:
- process diagram/Markdown;
- initial ADR;
- executable minimal slice;
- 3 example inputs and results.

### Teach-back

Explain without notes:
- why this is not yet a multi-agent architecture;
- what the model is doing;
- what deterministic software will eventually surround it;
- what would justify an orchestrator later.

---

## Session 2 — Wed 2026-09-30
# Own the agent loop + structured extraction/tool boundary

### Outcome

A minimal loop can receive an order-related message, produce validated structured intent, decide whether a tool is needed, call a typed tool, observe the result, and return a result.

### Core lesson

A tool call is not magic:
**model proposes structured action → application validates → code executes → result returns → model continues.**

### Architecture decisions

Compare:
- raw model/API loop;
- OpenAI Agents SDK;
- LangGraph;
- CrewAI Flow;
- Google ADK;
- deterministic workflow with one extraction call.

Choose one primary implementation for the exercise and record why.

Language decision:
Python is the default for this track because the Udemy and current agent ecosystem make it efficient for learning. TypeScript remains a valid alternative and should be selected when the product/runtime evidence favors it.

### COURSE/LifeOS mirror

- COURSE Step 7 — capability packaging.
- Step 8 — triggering/routing.
- Step 9 — numbers from code.
- ALTERNATIVES D6–D9.

### Notebook Source Pack

- Udemy course: https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/learn/lecture/49820721#notes
- OpenAI tools: https://openai.github.io/openai-agents-python/tools/
- Gemini function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Anthropic tool design: https://www.anthropic.com/engineering/writing-tools-for-agents
- CrewAI Flows: https://docs.crewai.com/en/concepts/flows
- Google ADK workflows: https://google.github.io/adk-docs/workflows/
- LangGraph/LangChain: https://docs.langchain.com/oss/python/learn

NotebookLM comparison:
- who owns the loop;
- where state lives;
- how tools are described;
- how errors propagate;
- how much framework machinery appears;
- what is portable.

### Build

Implement at least one typed read-only tool such as:
- resolve_product(name)
or
- get_product_info(product_id)

The tool may use synthetic data.

### Break it

- invalid tool arguments;
- unknown product;
- model chooses tool when it should not;
- ambiguous product name.

### Proof

Log:
- model input;
- proposed structured/tool action;
- validated arguments;
- deterministic tool result;
- final output.

### Teach-back

Draw the loop from memory and explain exactly where the LLM stops and ordinary code begins.

---

## Session 3 — Thu 2026-10-01
# Put business truth below the model: validation + inventory/price tool

### Outcome

The model cannot invent inventory/price as business truth. A deterministic source returns the values and validation catches impossible/ambiguous order fields.

### Architecture decisions

Compare:
- model arithmetic/guessing;
- deterministic Python/TS code;
- SQL;
- API;
- MCP tool;
- cached snapshot.

For each field decide source of truth:
customer, product, quantity, price, inventory.

### COURSE/LifeOS mirror

- COURSE Steps 9–10.
- ALTERNATIVES D9 — numbers.
- D10 — untrusted data.
- CHECKLIST.md safeguards relevant to deterministic guarantees.

### Notebook Source Pack

- OpenAI Agents SDK tools: https://openai.github.io/openai-agents-python/tools/
- Anthropic tool design: https://www.anthropic.com/engineering/writing-tools-for-agents
- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- OWASP prompt injection: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- ALTERNATIVES.md D9–D10 from this repo.

NotebookLM questions:
1. Which guarantees can a schema provide and which require business validation?
2. Why is structured JSON not enough for correctness?
3. Where should exact inventory and price be computed/retrieved?
4. What untrusted text from customer messages must never become authority?

### Build

Add deterministic validation and one source-of-truth tool:
- inventory lookup or product/price lookup.

Keep business values in data/config/source tables, not prompt text.

### Eval cases

At least 10 synthetic messages including:
- misspelling;
- missing quantity;
- decimal quantity if invalid;
- wrong/unknown price;
- unknown SKU;
- multiple items;
- customer message containing instruction-like text.

### Proof

For every case record:
- extraction;
- validation result;
- tool called/not called;
- source value;
- final status;
- error/escalation if applicable.

### Teach-back

Explain why “the LLM returned valid JSON” is not evidence that the order is correct.

---

## Session 4 — Fri 2026-10-02
# Evals + traces + decide whether a second agent is earned

### Outcome

A repeatable eval harness exists, traces expose failures, and the first evidence-backed decision is made about whether seller aggregation should remain one capability or become a separate specialist agent.

### Architecture decisions

Compare:
- one extraction/decision component;
- single agent with tools;
- specialist “message interpreter” + deterministic aggregation;
- two specialist agents;
- manager/orchestrator agent;
- deterministic orchestrator;
- graph/workflow.

No multi-agent implementation merely for practice. Split only if the mission boundary is real.

### COURSE/LifeOS mirror

- COURSE Step 12 — subagent/checker.
- Step 13 — checkpoint/kata.
- ALTERNATIVES D12.
- Later preview: COURSE Steps 29–35 verification and Step 63 evals.

### Notebook Source Pack

- OpenAI orchestration: https://openai.github.io/openai-agents-python/multi_agent/
- OpenAI handoffs: https://openai.github.io/openai-agents-python/handoffs/
- Anthropic building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- Google ADK workflows: https://google.github.io/adk-docs/workflows/
- CrewAI Flows: https://docs.crewai.com/en/concepts/flows
- LangGraph/LangChain multi-agent learning: https://docs.langchain.com/oss/python/learn
- OpenAI tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI deterministic SDK testing: https://openai.github.io/openai-agents-python/testing/
- LangSmith evaluation types: https://docs.langchain.com/langsmith/evaluation-types

### Build

Create a small eval dataset from the week’s examples.

Deterministic checks first:
- required fields;
- valid product resolution;
- expected tool call;
- forbidden tool call;
- exact inventory/price provenance;
- structured-output validity.

Add subjective/model judge only if a truly subjective output exists.

### Friday NotebookLM review

With only this week’s sources selected:
1. list the architectural decisions made;
2. show source evidence for each;
3. list disagreements among sources;
4. generate a hard cumulative quiz;
5. generate a Mind Map of message → model → validation → tools → state → output → eval.

Boris answers the quiz closed-book before reading explanations.

### Week-2 planning

Inputs:
- eval failures;
- business process additions Boris provides;
- architecture decisions still unresolved;
- Upwork job patterns;
- Udemy/LifeOS next mechanisms.

Pull only the next week into Trello week sprint.

### Proof

Week 1 is complete only if:
- the vertical slice runs;
- deterministic truth is separated from model interpretation;
- the eval set can be rerun;
- at least one failure has been deliberately created and explained;
- Boris can draw the current architecture from memory;
- an ADR states whether another agent is justified yet and why.

---

# 9. Week 2–4 — adaptive spine, not fabricated daily tasks

These are capability areas, not fixed dates. Friday planning decides sequence.

Potential areas:
- seller aggregation state;
- manager-level consolidation;
- inventory reservation/availability logic;
- customer/product entity resolution;
- retries and idempotency;
- durable workflow state;
- memory vs database vs retrieval;
- approval workflows;
- Viber/Telegram/other channel integration;
- queues/events;
- observability;
- specialist-agent boundaries;
- orchestrator patterns;
- MCP;
- RAG only where a real document-retrieval problem exists;
- deployment/API/UI;
- provider/model benchmarking;
- real Upwork brief substitution.

Every item must trace back to a real process need or a deliberate learning gap.

---

# 10. Upwork learning loop

Daily scan classification:

## BUILD NOW
You can deliver the core architecture safely with current skills.

Action:
- analyze fit;
- identify proof/portfolio evidence;
- consider bidding immediately.

## LEARN GAP
The job is strongly aligned but exposes one or two missing capabilities.

Action:
- name the precise gap;
- decide whether it belongs in the learning path;
- if yes, add it to Agentic Finance backlog;
- do not let unrelated job requirements hijack the curriculum.

## SKIP
Weak domain fit, unrealistic brief, poor learning value, unsafe scope, or demand that does not strengthen the target profession.

Preferred market intersection:
**finance/ERP/operations expertise + software engineering + production agent architecture.**

Do not compete primarily as “someone who knows an agent framework.”

---

# 11. Daily card contract

Every Trello learning card should contain:

**Outcome**

**Business reason**

**Agent concept**

**Architecture location**

**Sources**

**Decision**

**Alternatives**

**Build**

**Break it**

**Proof/eval**

**Teach-back**

**Artifact**

**Reconsider when**

The card is Done only when proof and teach-back pass.

---

# 12. Mastery standard

For every major component be able to:
1. explain the problem it solves;
2. locate it in the system;
3. explain inputs/outputs;
4. distinguish model vs deterministic code;
5. describe serious alternatives;
6. explain when alternatives win;
7. break/test it deliberately;
8. direct a similar build with AI without copying the original.

That is the standard for “I know it.”
