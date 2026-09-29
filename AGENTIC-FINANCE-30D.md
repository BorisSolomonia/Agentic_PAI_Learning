# Agentic Finance MOOC — Curriculum

**Purpose:** learn to architect and build production AI-agent systems for finance and operations by building a real system, not by finishing a framework course.

**Cadence:** 2 hours/day × 5 days/week = 10 hours/week.

**Benchmark:** University of Helsinki Java Programming MOOC. The benchmark course is organized into weekly parts, each part contains focused lessons with explicit learning objectives, explanations and many programming exercises, and later parts culminate in larger open-ended exercises. This curriculum copies that *learning architecture*, not the Java content.

**Applied business:** the first known process slice is:

**Customer message → Seller → order interpretation/aggregation → Manager → product / price / inventory context → consolidated operational order**

Only this slice is assumed. Boris will progressively provide the remaining business process. The course must not invent it.

**Parallel references:**  
- `COURSE.md` — LifeOS/harness theory and mechanisms  
- `AGENT-ARCHITECTURE-GUIDE.md` — decision method  
- `ALTERNATIVES.md` — deep design alternatives  
- `CHECKLIST.md` — safety/verification rules  
- NotebookLM — source-grounded comparison, recall, quizzes and synthesis  
- Udemy — targeted runtime-agent instruction, pulled in when the current build needs it

---

# How to use this curriculum

Do not read the whole repository every day.

For each day, follow the same loop:

1. **Whole-picture position** — understand which piece of the agent system you are learning.
2. **Learning objectives** — know what you must be able to explain by the end.
3. **Read/watch** — only the sources listed for that day.
4. **NotebookLM** — write your prediction first, then compare sources and inspect citations.
5. **Alternatives** — read the relevant `ALTERNATIVES.md` decisions.
6. **Build** — produce working code.
7. **Break/evaluate** — deliberately cause failures and measure them.
8. **Teach back** — explain the concept without notes.
9. **Commit evidence** — code, tests, ADR, examples, eval result.
10. **Trello Done** only when proof passes.

The course is **creation-first**. Reading exists to answer a design question that blocks the build.

---

# The whole system you are building

Keep this chain visible while studying:

```text
BUSINESS EVENT
    ↓
INPUT / CHANNEL
(Viber now; other channels later)
    ↓
INTAKE / NORMALIZATION
    ↓
LLM INTERPRETATION
(structured extraction / classification / reasoning)
    ↓
AGENT LOOP
(decide what to do next)
    ↓
TOOLS
(product, price, inventory, customer, etc.)
    ↓
DETERMINISTIC BUSINESS LOGIC
(validation, arithmetic, rules)
    ↓
STATE
(current order / workflow progress)
    ↓
OPTIONAL SPECIALIST AGENTS
(only when their own mission/context/tools/evals justify them)
    ↓
ORCHESTRATION
(deterministic or agentic)
    ↓
HUMAN APPROVAL / SIDE EFFECTS
    ↓
OUTPUT / ACTION
    ↓
TRACE + EVAL + AUDIT
    ↓
MEMORY / RETRIEVAL
(only for information that semantically belongs there)
```

Every daily lesson must answer:

- Where am I in this chain?
- What does this piece depend on?
- What depends on this piece?
- What happens if I remove it?
- What are the realistic alternatives?
- Why is the chosen implementation justified *for this process*?

---

# Source registry

Use primary sources first.

## S0 — Benchmark: course design

- Helsinki Java Programming MOOC: https://java-programming.mooc.fi/
- Example lesson structure: https://java-programming.mooc.fi/part-1/1-starting-programming/
- Larger exercises: https://java-programming.mooc.fi/part-7/3-larger-exercises/
- Source repository: https://github.com/rage/java-programming

## S1 — Main agent fundamentals

- Anthropic — Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/
- OpenAI Agents SDK — tools: https://openai.github.io/openai-agents-python/tools/
- OpenAI Agents SDK — multi-agent: https://openai.github.io/openai-agents-python/multi_agent/
- OpenAI Agents SDK — handoffs: https://openai.github.io/openai-agents-python/handoffs/
- OpenAI Agents SDK — tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI Agents SDK — testing: https://openai.github.io/openai-agents-python/testing/
- Google ADK — agents: https://google.github.io/adk-docs/agents/
- Google ADK — workflows: https://google.github.io/adk-docs/workflows/
- LangChain/LangGraph learning docs: https://docs.langchain.com/oss/python/learn
- CrewAI Flows: https://docs.crewai.com/en/concepts/flows
- Model Context Protocol: https://modelcontextprotocol.io/

## S2 — Structured outputs / schemas / tool calls

- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Gemini function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Anthropic — Writing tools for agents: https://www.anthropic.com/engineering/writing-tools-for-agents
- Pydantic docs: https://docs.pydantic.dev/latest/

## S3 — Python runtime foundations

- Python async/await: https://docs.python.org/3/library/asyncio-task.html
- Python typing: https://docs.python.org/3/library/typing.html
- pytest: https://docs.pytest.org/en/stable/
- HTTPX: https://www.python-httpx.org/

## S4 — Evaluation / observability / security

- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI Agents SDK testing: https://openai.github.io/openai-agents-python/testing/
- LangSmith evaluation concepts: https://docs.langchain.com/langsmith/evaluation
- OWASP LLM Prompt Injection Prevention: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html

## S5 — NotebookLM learning layer

Master notebook:
https://notebook.google.com/notebook/a6068935-ef1d-444f-8827-dc2be63d4d95

- NotebookLM help: https://support.google.com/notebooklm/
- Google NotebookLM learning features / quizzes / flashcards: https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-student-features/
- NotebookLM research/source discovery: https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/
- NotebookLM video/studio features: https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-video-overviews-studio-upgrades/

## S6 — User's main video course

- Udemy — The Complete Agentic AI Engineering Course: https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/learn/lecture/49820721#notes

Do not watch Udemy linearly. Select the lesson that matches the mechanism being built today.

---

# Week 1 — From business process to one reliable agent loop

## Weekly whole-picture goal

At the end of Week 1 you should have one small but real vertical slice:

```text
unstructured customer order message
        ↓
structured OrderCandidate
        ↓
deterministic validation
        ↓
typed product / inventory tool
        ↓
agent/tool loop
        ↓
traceable result
        ↓
repeatable eval
```

This is intentionally **not yet a multi-agent system**.

Why: if you cannot build, inspect, test and explain one reliable loop, adding more agents multiplies uncertainty rather than capability.

### Week 1 depends on

- your existing software-engineering knowledge;
- basic Python ability;
- an LLM API/provider;
- synthetic order examples.

### Week 1 unlocks

- stateful order aggregation;
- specialist-agent boundaries;
- orchestration;
- memory/retrieval;
- channel integration;
- production evaluation.

---

## Day 1 — Process decomposition: workflow vs LLM call vs agent

### What you learn

You learn to look at a business process and identify which parts are:

- deterministic workflow;
- extraction;
- classification;
- retrieval;
- reasoning;
- human judgment;
- truly agentic decision-making.

You also learn the difference between:

1. deterministic code;
2. one LLM call;
3. tool-using agent loop;
4. multi-agent system.

### Why this matters / whole-picture position

**Position in chain:** before implementation — this is the architectural boundary-setting step.

Everything later depends on this decomposition. If you classify the process incorrectly, later choices about tools, state, agents and orchestrators will also be wrong.

### Depends on

- only the real business flow and example messages.

### Unlocks

- schema design;
- tool boundaries;
- deciding whether an agent is justified at all.

### Read online

- S1 Anthropic — Building effective agents.
- S1 OpenAI Agents SDK overview.
- S1 Google ADK agents.
- S1 LangChain/LangGraph learning overview.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §1–§3.
- `COURSE.md` Steps 7–8 overview.
- `ALTERNATIVES.md` D6–D8.

### Alternatives to understand

From `ALTERNATIVES.md`:
- D6 capability packaging;
- D7 capability triggering;
- D8 where tools/scripts/config live.

Also compare:
- plain deterministic workflow;
- one structured model call;
- one agent with tools;
- multiple specialist agents.

### NotebookLM — write your answer first

Ask after writing your prediction:

1. What exact property makes a system “agentic” rather than merely AI-powered?
2. Where do the sources recommend a workflow instead of an agent?
3. What evidence would justify moving from one model call to a loop?
4. What additional failure modes appear when a second agent is added?
5. For the current order process, which steps appear deterministic and which appear ambiguous?
6. Cite every important claim and show where the sources disagree.

### Implement

Create:

```
build/agentic-finance/process/first-order-slice.md
build/agentic-finance/decisions/ADR-001-process-decomposition.md
```

Map:

```text
Customer message → Seller → aggregation → Manager → inventory context
```

Classify every known step.

Then build the smallest executable spike:

```text
raw synthetic message → OrderCandidate → print
```

Do not add a framework unless the spike requires it.

### Exercise 1A — message samples

Create at least 8 synthetic examples:
- normal one-product order;
- missing quantity;
- multiple products;
- colloquial product name;
- customer name omitted;
- price omitted;
- conflicting quantity;
- instruction-like text inside message.

### Break / evaluate

Try at least 3 cases that should fail or escalate.

### Day outcome

You can explain:

- why the process is not automatically a multi-agent system;
- what part currently needs model interpretation;
- what remains deterministic;
- what evidence would justify a future specialist agent.

**Artifact:** process map + ADR-001 + tiny runnable spike + sample messages.

---

## Day 2 — Structured outputs: turn language into a contract

### What you learn

You learn how unstructured language becomes validated structured data using schemas.

Core distinction:

```text
LLM can propose structure
≠
business data is correct
```

### Whole-picture position

```text
customer message
    ↓
[STRUCTURED EXTRACTION] ← TODAY
    ↓
validation
    ↓
tools / business logic
```

Without a stable structured boundary, tools and deterministic code cannot safely consume model output.

### Depends on

- Day 1 process decomposition;
- representative message examples.

### Unlocks

- typed tools;
- deterministic validation;
- repeatable evals;
- provider comparison.

### Read online

- S2 Gemini structured output.
- S2 Pydantic docs.
- S1 OpenAI Agents SDK relevant structured/agent examples.
- S6 Udemy structured output/tool-calling material relevant to this mechanism.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §4 agent mission and §5 tool boundary.
- `COURSE.md` Step 7.
- `ALTERNATIVES.md` D6 and D9.

### Alternatives

Compare:
- regex/parser;
- model returns free text;
- model returns JSON by prompt convention;
- schema-constrained structured output;
- extraction + deterministic post-validation.

### NotebookLM questions

1. What does schema validation guarantee?
2. What can schema validation *not* guarantee?
3. When is a parser better than an LLM?
4. How should unknown/missing fields be represented?
5. Should price be extracted, retrieved, or both?
6. What is the difference between syntactic validity and business validity?

### Implement

Create an `OrderCandidate` schema.

Minimum conceptual fields:
- customer reference;
- one or more order lines;
- raw product text;
- quantity;
- unit if relevant;
- stated price if present;
- ambiguity/missing-field indicators;
- source message identifier.

Do not hardcode the business product catalog in the prompt.

### Exercise 2A

Parse the 8+ Day-1 messages into the same schema.

### Exercise 2B

Make malformed cases fail safely rather than silently inventing fields.

### Break / evaluate

Measure:
- schema-valid rate;
- missing-field detection;
- false invented values.

### Day outcome

You can explain where the structured-output layer sits and why every downstream tool depends on it.

**Artifact:** schema + extraction implementation + tests/examples + ADR update.

---

## Day 3 — Tool calling: LLM chooses; code executes

### What you learn

You learn the mechanical agent/tool loop:

```text
user/input
   ↓
model
   ↓
tool proposal + arguments
   ↓
application validation
   ↓
deterministic tool code
   ↓
tool result
   ↓
model / final result
```

### Whole-picture position

This is the bridge between probabilistic interpretation and trusted business systems.

### Depends on

- Day 2 typed schema;
- deterministic functions or synthetic data source.

### Unlocks

- inventory/product/customer lookups;
- agent loops;
- safe read-only business integration;
- orchestration later.

### Read online

- S1 OpenAI Agents SDK tools.
- S2 Anthropic — Writing tools for agents.
- S2 Gemini function calling.
- S3 Python typing.
- S6 corresponding Udemy tool-calling lesson.

### Read locally

- `COURSE.md` Steps 7–9.
- `ALTERNATIVES.md` D8–D9.
- `CHECKLIST.md` CK-014, CK-017.

### Alternatives

Compare:
- tool calling;
- model generates code;
- SQL exposed directly;
- business API;
- MCP server;
- one coarse business tool vs many CRUD tools.

### NotebookLM questions

1. What makes a good tool boundary?
2. Why should the model not compute authoritative money/inventory numbers?
3. When are many small tools worse than one semantic tool?
4. What validation belongs below the prompt?
5. Compare native function calling vs MCP conceptually.

### Implement

Build one deterministic read-only tool, e.g.:

```python
resolve_product(raw_name)
```

and/or:

```python
get_inventory(product_id)
```

Synthetic source data is enough.

Log:
- proposed tool;
- arguments;
- validation result;
- tool result;
- source/provenance.

### Break / evaluate

- invalid tool argument;
- unknown product;
- unnecessary tool call;
- product ambiguity;
- tool error.

### Day outcome

You can draw the tool loop from memory and point to the exact line where LLM work ends and deterministic code begins.

---

## Day 4 — Build the agent loop from first principles

### What you learn

You learn the loop itself instead of hiding it behind a framework.

A minimal agent loop repeatedly:

1. assembles context;
2. asks the model;
3. inspects structured response/tool call;
4. executes permitted tool;
5. appends observation;
6. asks again;
7. stops on a clear completion condition.

### Whole-picture position

```text
interpretation
    ↓
[AGENT LOOP] ← TODAY
    ↙      ↘
 tools    stop/final
```

The loop is the control mechanism that later frameworks abstract.

### Depends on

- Day 2 schemas;
- Day 3 typed tools.

### Unlocks

- framework comparison;
- stateful workflows;
- retries;
- specialist agents;
- orchestrators.

### Read online

- S1 OpenAI Agents SDK overview.
- S1 Anthropic building effective agents.
- S3 Python asyncio tasks.
- S6 Udemy framework-free/basic agent-loop lesson.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §3–§5.
- `COURSE.md` Steps 7–11 selectively.
- `ALTERNATIVES.md` D6–D11.

### Alternatives

Compare:
- raw while-loop;
- OpenAI Agents SDK;
- LangGraph;
- Google ADK;
- CrewAI Flow;
- deterministic state machine with occasional model calls.

### NotebookLM questions

1. Which responsibilities belong to the loop regardless of framework?
2. Which framework features are convenience vs architectural necessity?
3. How can a loop run forever accidentally?
4. What stop conditions are production-worthy?
5. When should the loop be deterministic instead of model-controlled?

### Implement

Build a minimal loop without a multi-agent framework first.

Requirements:
- max iterations;
- typed tool allowlist;
- validation;
- final-result schema;
- tool error handling;
- trace/run ID.

Then optionally reproduce the same behavior with one framework to understand the abstraction.

### Break / evaluate

- infinite/ repeated tool request;
- tool throws;
- model asks for unavailable tool;
- empty/invalid final result.

### Day outcome

You understand the reusable control loop beneath agent frameworks.

---

## Day 5 — Evaluation, tracing and Week-1 capstone

### What you learn

You learn that “it worked once” is not evidence.

You build:
- eval dataset;
- deterministic assertions;
- traces;
- failure taxonomy.

### Whole-picture position

```text
EVERY COMPONENT
     ↓
[TRACE + EVAL] ← TODAY
     ↓
architecture decisions based on evidence
```

Evaluation is not a final-week activity. It controls whether the architecture is allowed to grow.

### Depends on

- Days 1–4 working slice.

### Unlocks

- safe iteration;
- provider/framework comparison;
- multi-agent decision gates;
- market-ready confidence.

### Read online

- S4 OpenAI tracing.
- S4 OpenAI testing.
- S4 LangSmith evaluation concepts.
- S4 OWASP prompt injection prevention.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §11–§13.
- `CHECKLIST.md` verification/capability rules.
- `COURSE.md` Step 13 and preview verification/evals sections.
- `ALTERNATIVES.md` D12, D19, D20.

### Alternatives

Compare:
- manual spot testing;
- deterministic unit/integration evals;
- golden datasets;
- model-as-judge;
- human review;
- online production metrics.

### NotebookLM questions

1. Which properties can be checked deterministically?
2. When is model-as-judge legitimate?
3. What should an agent trace contain?
4. What sensitive fields should not be logged?
5. What failure patterns would justify changing the architecture?

### Implement — Week 1 capstone

Build a repeatable eval dataset of at least 15 messages.

Check:
- schema validity;
- missing-field handling;
- product resolution;
- expected/forbidden tool calls;
- exact tool provenance;
- stop condition;
- no invented inventory/price;
- graceful error/escalation.

### Weekly mastery gate

Without notes, draw:

```text
message → schema → loop → tool → deterministic truth → result → trace/eval
```

Explain:
- alternatives at every boundary;
- one failure for each boundary;
- why multiple agents are not yet automatically justified.

**Week 1 portfolio artifact:** one small reliable order-intake agent slice with evals and architecture ADRs.

---

# Week 2 — State, memory, specialization and orchestration

## Weekly whole-picture goal

Week 1 produced one reliable loop.

Week 2 answers:

> How does this become a system that can handle a multi-message/multi-seller business process without turning every step into an agent?

Target shape:

```text
messages
   ↓
interpretation
   ↓
ORDER / WORKFLOW STATE
   ↓
deterministic aggregation
   ↓
specialist reasoning capability only where justified
   ↓
orchestration choice
   ↓
manager-ready result
   ↓
eval + trace
```

### Depends on

- reliable Week-1 loop;
- structured outputs;
- typed tools;
- eval harness.

### Unlocks

- real seller aggregation;
- manager aggregation;
- human approvals;
- later channel integration;
- durable workflows;
- production multi-agent architecture.

---

## Day 6 — State: what the system knows *during* a workflow

### What you learn

You learn the distinction between:
- message/context;
- run state;
- durable workflow state;
- business database;
- memory.

### Whole-picture position

```text
agent/tool loop
    ↓
[STATE] ← TODAY
    ↓
multiple messages / steps / retries
```

State makes multi-step behavior reliable. Without it, the system repeatedly reconstructs or guesses what happened.

### Depends on

- Week 1 schemas and loop.

### Unlocks

- seller aggregation;
- resumability;
- retries;
- orchestration.

### Read online

- S1 Google ADK workflows.
- S1 LangChain/LangGraph learning docs on state/workflows.
- S3 Python typing/dataclasses or Pydantic where relevant.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §7.
- `ALTERNATIVES.md` D17–D18.
- `COURSE.md` memory/state-relevant sections.

### Alternatives

Compare:
- local in-memory state;
- explicit state object;
- relational workflow row;
- event log/event sourcing;
- framework checkpoint state;
- reconstruct from transcript.

### NotebookLM questions

1. What is state vs memory?
2. What should survive a process restart?
3. What belongs in SQL instead of model context?
4. How would event sourcing differ from updating one order aggregate row?
5. What is the simplest sufficient design for seller aggregation today?

### Implement

Add an explicit `OrderSession` or equivalent state model.

Process multiple synthetic customer messages into one seller-level draft aggregate.

Do not use long-term “AI memory” for business truth.

### Break / evaluate

- duplicate message;
- retry after failure;
- conflicting update;
- process restart simulation.

### Day outcome

You can explain where every piece of current workflow state lives and why.

---

## Day 7 — Memory and retrieval: choose storage by semantics

### What you learn

You learn that “memory” is not one feature.

You separate:
- state;
- business facts;
- profile/config;
- policies/documents;
- episodic history;
- retrieval indexes;
- transcript/archive.

### Whole-picture position

```text
current workflow state
        ↓
facts that must survive
        ↓
[DB / MEMORY / RETRIEVAL] ← TODAY
```

### Depends on

- Day 6 state semantics.

### Unlocks

- policies/procedures;
- historical cases;
- customer/product knowledge;
- RAG when genuinely needed.

### Read online

- primary documentation for any storage/retrieval approach actually considered.
- S1 framework memory/state docs if used.
- do not pick a vector database yet unless a real semantic-retrieval problem exists.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §7 and §9.
- `ALTERNATIVES.md` D17–D18.

### Alternatives

From D17–D18 and architecture guide:
- context-only;
- Markdown/file memory;
- relational DB;
- temporal relational rows;
- event log;
- document store;
- BM25;
- vector search;
- hybrid retrieval;
- graph;
- provider-managed memory;
- no durable memory/recompute.

### NotebookLM questions

1. For each current business fact, where should it live?
2. Which current data requires semantic retrieval? Maybe none.
3. When does vector search lose to SQL/BM25?
4. What should never be summarized away?
5. What forgetting/versioning policy is required?

### Implement

Create a storage map for the current order process.

Implement only the storage needed by the current build, likely structured data/state.

Create at least one read-back test through a second path.

### Break / evaluate

- stale record;
- old price vs current price;
- duplicate entity;
- missing history.

### Day outcome

You can reject “add a vector database” unless the process produces an actual retrieval need.

---

## Day 8 — Specialist agents: when another agent earns a mission

### What you learn

You learn to split by **reasoning boundary**, not organization chart.

A specialist agent is justified when it needs materially different:
- mission/instructions;
- tools;
- context;
- eval set;
- model;
- lifecycle;
- authority.

### Whole-picture position

```text
reliable single agent + tools
        ↓
[SPECIALIZATION DECISION] ← TODAY
        ↓
possible specialist agents
```

### Depends on

- reliable one-agent loop;
- clear tool/state boundaries;
- eval evidence.

### Unlocks

- multi-agent design;
- parallel work;
- isolation;
- orchestrator decisions.

### Read online

- S1 OpenAI multi-agent.
- S1 OpenAI handoffs.
- S1 Anthropic effective agents.
- S1 Google ADK agents.
- S1 CrewAI flows.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §6.
- `COURSE.md` Step 12.
- `ALTERNATIVES.md` D12.

### Alternatives

Compare:
- one agent with tools;
- agent-as-tool specialist;
- handoff;
- deterministic subroutine;
- parallel model calls;
- no split.

### NotebookLM questions

1. What problem does a second agent solve that a tool cannot?
2. What new failure modes does delegation introduce?
3. Compare agent-as-tool vs handoff.
4. Which context should be isolated?
5. For the current process, is message interpretation a true specialist mission yet?

### Implement

Take one candidate split, such as:
- Order Interpreter
- Seller Aggregation capability

Design both versions:
A. one agent + deterministic aggregation;
B. specialist agent separation.

Implement the simpler version first unless eval evidence favors the split.

### Break / evaluate

Compare:
- correctness;
- latency;
- token/cost;
- trace complexity;
- handoff errors.

### Day outcome

Write ADR: **Does Agent #2 exist yet?**  
“Yes” and “no” are both valid if evidence supports them.

---

## Day 9 — Orchestration: deterministic workflow vs manager agent

### What you learn

You learn orchestration patterns and when coordination itself needs reasoning.

### Whole-picture position

```text
capabilities / specialist agents
            ↓
[ORCHESTRATION] ← TODAY
            ↓
manager-ready result / action
```

### Depends on

- Day 8 specialist boundaries;
- Day 6 state.

### Unlocks

- many sellers;
- parallelism;
- multi-step manager workflows;
- durable production workflow.

### Read online

- S1 OpenAI multi-agent orchestration.
- S1 Google ADK workflows.
- S1 LangGraph.
- S1 CrewAI Flows.
- S3 Python asyncio.

### Read locally

- `AGENT-ARCHITECTURE-GUIDE.md` §6.
- `ALTERNATIVES.md` D7, D11, D12, D23.

### Alternatives

Compare:
- fixed sequential workflow;
- router → deterministic branch;
- orchestrator/manager agent;
- specialists as tools;
- handoffs;
- graph/state machine;
- event-driven queue;
- parallel fan-out/fan-in;
- human-directed routing.

### NotebookLM questions

1. Which orchestration decisions are deterministic in our current process?
2. When does a manager agent add value?
3. What can run concurrently?
4. What state must the orchestrator own?
5. How do retries/idempotency change the design?
6. What is the simplest architecture that can later grow?

### Implement

Build a tiny orchestrated flow over synthetic data.

Example:
- interpret two seller batches;
- obtain deterministic inventory;
- aggregate result;
- produce manager-ready draft.

Start deterministic. Add agentic routing only if there is a real branch requiring judgment.

### Break / evaluate

- one branch fails;
- one specialist times out;
- duplicated batch;
- concurrent inventory result differs;
- orchestrator repeats work.

### Day outcome

You can explain the difference between business manager, manager agent, workflow orchestrator and deterministic aggregation.

---

## Day 10 — Week-2 capstone: evidence-backed architecture v1

### What you learn

You learn to integrate process, state, tools, agents, orchestration and evals into one architecture without over-agentifying the business.

### Whole-picture position

This is the first architecture checkpoint.

### Depends on

Everything in Weeks 1–2.

### Unlocks

Week 3+, which may include:
- actual channel integration;
- human approval;
- durable DB;
- authentication/security;
- MCP;
- RAG if justified;
- provider/model benchmarking;
- deployment;
- further business process stages.

### Read online

Only sources needed to resolve the failures discovered during the week.

### Read locally

- Week 1–2 ADRs.
- `AGENT-ARCHITECTURE-GUIDE.md` mastery gate.
- relevant `CHECKLIST.md`.
- `PROGRESS.md`.

### NotebookLM weekly synthesis

Select only sources actually used in Weeks 1–2.

Ask:

1. Reconstruct our current architecture from the sources and ADR claims.
2. Which decisions are strongly evidenced?
3. Which decisions remain assumptions?
4. Where do the sources disagree?
5. Generate a difficult cumulative quiz.
6. Generate a Mind Map from business event to eval/audit.
7. Give 5 architecture-change scenarios; Boris must decide what he would change and why.

Answer closed-book first.

### Implement — Week-2 capstone

Produce:

```
build/agentic-finance/
  architecture/
    architecture-v1.md
  decisions/
    ADR-001...
    ADR-00N...
  src/
  tests/
  evals/
  traces/
```

System should process a synthetic mini-batch:

```text
customer messages
   ↓
structured candidates
   ↓
seller grouping/state
   ↓
product/inventory tools
   ↓
aggregation / justified agent boundaries
   ↓
manager-ready draft
   ↓
trace + eval
```

### Required proof

- architecture diagram;
- runnable command;
- automated tests/evals;
- at least 20 representative cases;
- deliberate failures;
- ADR for each major boundary;
- explanation of one rejected alternative at each major boundary;
- closed-book architecture reconstruction.

### Week-2 outcome

You do not merely know the names of agent frameworks.

You can take a real business slice and justify:
- where LLMs belong;
- where code belongs;
- where data/state belongs;
- whether multiple agents belong;
- how coordination works;
- how correctness is measured.

---

# Weeks 3+ — adaptive, generated only after evidence

Do not write detailed future daily lessons yet.

At the end of Week 2, generate Week 3 from:

```text
new business-process details
+ failures/eval results
+ architecture gaps
+ NotebookLM weak areas
+ Upwork demand
+ Udemy/LifeOS mechanisms not yet mastered
= next weekly part
```

Likely future modules, only when justified:

- human approval and consequential actions;
- Viber/Telegram/channel adapters;
- identity/auth/tenant isolation;
- durable SQL state and event processing;
- retries/idempotency/queues;
- MCP;
- policies/documents and RAG;
- model/provider benchmarking and routing;
- observability/cost;
- deployment/API/UI;
- accounting/finance specialist agents;
- wider 9_Tones business process;
- external Upwork brief as transfer exam.

---

# Definition of mastery

For every major component, Boris must be able to:

1. explain the problem it solves;
2. place it in the whole architecture;
3. state what it depends on;
4. state what depends on it;
5. explain inputs/outputs;
6. distinguish LLM reasoning from deterministic code;
7. name serious alternatives;
8. explain when those alternatives win;
9. break/test it deliberately;
10. direct a similar implementation with AI without copying the original.

If a day produces code but not this understanding, the day is not complete.
