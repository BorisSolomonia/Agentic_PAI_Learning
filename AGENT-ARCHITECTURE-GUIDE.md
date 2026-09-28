# Agent Architecture Guide — decide before you multiply agents

This guide is the reusable decision method for the applied Agentic Finance track.

The purpose is not to force one framework, provider, model, database, memory system, or multi-agent pattern. The purpose is to make every important architectural choice explicit, evidence-backed, testable, and reversible.

## The rule

For every new business-process slice:

1. Map the real process before naming agents.
2. Separate deterministic rules from uncertain interpretation.
3. Decide whether AI is needed at all.
4. If AI is needed, decide whether it needs a tool, one agent, multiple agents, or an orchestrator.
5. Research the meaningful architectural alternatives deeply.
6. Record the choice, why it won, and what evidence would make you reverse it.
7. Build the smallest vertical slice.
8. Break it deliberately.
9. Evaluate it against real or synthetic cases.
10. Update the architecture diagram only after evidence.

An agent does not earn a place in the architecture because the business has a department with the same name.

An inventory balance is normally code or SQL.
A price lookup is normally a tool.
A customer-message interpretation task may justify an LLM.
A specialist agent is justified only when a bounded reasoning mission benefits from its own instructions, tools, context, evaluation surface, or lifecycle.
An orchestrator is justified only when coordination itself becomes a real problem.

---

# 1. Start with the process, not the framework

For each process stage, write:

## Business stage

**Actor:** Who currently does the work?

**Trigger:** What starts the work?

**Input:** Messages, files, database rows, API events, human requests, etc.

**Current action:** What does the human/system do now?

**Output:** What must exist when the stage is complete?

**Downstream consumer:** Who or what uses the result?

**Business consequence of error:** inconvenience / lost time / wrong order / wrong stock / wrong money / compliance risk / customer harm.

**Examples:** At least 5 real-looking examples, including 2 ugly edge cases.

**Unknowns:** What do we still need from Boris before architecture can be considered stable?

---

# 2. Classify every decision in the process

Before adding an LLM, classify the work.

| Type | Use when | Typical implementation |
|---|---|---|
| Deterministic calculation | Same inputs must produce the same exact answer | SQL, Python/TS code, Decimal/integer money logic |
| Deterministic rule | A business rule can be stated precisely | validation, rule table, state machine, config |
| Retrieval | The answer already exists somewhere | SQL query, API, indexed documents, search |
| Extraction | Unstructured input must become structured fields | schema-constrained LLM or parser |
| Classification | Input must be assigned to known categories | rules first when sufficient; model when ambiguity matters |
| Reasoning | Several facts must be combined and the path depends on context | LLM/agent |
| Workflow | The order of known steps is predetermined | code, graph, queue, scheduler |
| Agentic decision | The system must decide which step/tool to use next | agent loop |
| Human judgment | Consequential ambiguity cannot be safely automated | approval/review UI |
| Side effect | The world changes | explicit permission, audit, idempotency, rollback where possible |

For finance and operations, the default rule is:

**LLM interprets. Code computes. Database stores facts. Human approves consequential ambiguity.**

This is a starting heuristic, not doctrine. Evidence can overturn it.

---

# 3. Decide whether this should be an agent

Ask these questions in order:

1. Is the task fully specified by deterministic steps?
   - Yes → build a workflow, not an agent.
2. Is the only AI need extraction or classification?
   - Yes → start with one model call with structured output, not an autonomous loop.
3. Does the task need to choose among tools or change its plan after observing results?
   - Yes → an agent loop may be justified.
4. Does the task require long-running work, retries, checkpoints, or resumable state?
   - Maybe → compare agent runtime vs durable workflow engine.
5. Does a separate reasoning mission need its own context/tools/evals?
   - Yes → a specialist agent may be justified.
6. Does coordination among specialists require judgment?
   - Yes → compare orchestrator agent vs deterministic orchestration.
7. Can the same result be obtained more safely with code?
   - If yes, prefer code for the safety-critical part.

Record the answer. Never leave “agent” as an assumption.

---

# 4. Define an agent mission

If an agent is justified, define it before implementation.

## Mission template

**Name:** business-readable, not framework-readable.

**One-sentence mission:** exactly what outcome this agent owns.

**Does not own:** explicitly state adjacent responsibilities it must not absorb.

**Inputs:** structured and unstructured.

**Outputs:** schema where possible.

**Tools:** only tools needed for the mission.

**Context:** what the model sees and why.

**State:** what must survive within a run.

**Durable memory:** what, if anything, must survive across runs.

**Authority:** read-only / propose / draft / execute with approval / execute autonomously.

**Stop conditions:** success, ambiguity, timeout, tool failure, max iterations, human escalation.

**Evidence:** what the agent must show to support its conclusion.

**Eval set:** representative cases plus edge cases.

**Failure modes:** hallucinated fields, wrong tool, stale inventory, duplicate order, wrong customer, wrong price, etc.

---

# 5. Tool boundary design

For every tool ask:

**What exact capability is this?**

**Why is it a tool instead of model reasoning?**

**Input schema:** minimal fields, strong types, enums where possible.

**Output schema:** return the evidence the agent needs, not a dump of the whole system.

**Read or write?**

**Idempotent?**

**Permission required?**

**Source of truth?**

**Failure behavior?**

**Timeout/retry policy?**

**Audit fields?**

**Can deterministic validation reject bad model arguments before execution?**

Prefer coarse, semantically meaningful tools over hundreds of low-level CRUD functions when that improves reliability. But do not make one mega-tool that hides all business logic.

---

# 6. Single-agent vs multi-agent decision

Do not split by department names. Split by reasoning boundary.

A specialist agent is justified when at least one of these is true:

- it needs a materially different system instruction;
- it needs a different tool surface;
- it needs context isolation to reduce noise or risk;
- it has a separate eval set and measurable mission;
- it can be executed independently or in parallel;
- it requires a different model because cost/latency/quality tradeoffs differ;
- its output forms a clean contract consumed by another component.

Keep one agent when splitting would only create extra prompts, handoffs, latency, failure points, and debugging complexity.

## Orchestration alternatives to compare

- deterministic sequence in code;
- router/classifier → deterministic branch;
- manager/orchestrator agent calling specialists as tools;
- handoff where specialist takes over;
- graph/state-machine orchestration;
- event-driven workflow/queue;
- parallel specialist calls with deterministic aggregation;
- evaluator-optimizer loop;
- human-directed routing.

The orchestrator itself must have a mission. “Coordinate everything” is not a sufficient mission.

---

# 7. State, memory, retrieval — never call all three “memory”

For every piece of information ask what it semantically is.

| Information | Candidate home |
|---|---|
| current turn variables | in-memory run context |
| current workflow progress | state object / durable workflow state |
| customer payment terms | relational database |
| product master and inventory | database / ERP API |
| latest price | database/API with timestamp |
| accounting policy | versioned document store + retrieval |
| user preference | profile/config row |
| previous investigation | event log / case table |
| lessons from prior cases | curated episodic memory |
| raw conversation history | transcript/audit archive |
| semantic lookup across documents | BM25/vector/hybrid retrieval |
| entity relationships | relational joins first; graph only when graph queries truly matter |
| recomputable fact | often no memory at all |

## Memory alternatives to research when relevant

- context window only;
- file/Markdown hot memory;
- relational rows;
- temporal/versioned relational rows;
- document/KV store;
- event sourcing/log;
- BM25 lexical retrieval;
- vector retrieval;
- hybrid retrieval;
- knowledge graph;
- LLM-generated episodic summaries;
- provider-managed conversation/session memory;
- no durable memory / recomputation.

The course should compare these at the architectural-pattern level before choosing a vendor.

---

# 8. Model and provider decision

Separate three choices:

1. **Build-time coding agent** — Codex, Claude Code, Gemini CLI, etc.
2. **Runtime framework/harness** — raw API loop, OpenAI Agents SDK, LangGraph, CrewAI, Google ADK, custom framework, etc.
3. **Runtime model** — OpenAI, Claude, Gemini, smaller/local model, or no model.

Never infer runtime model choice from the coding tool used to build the software.

For a runtime model comparison record:

- task being measured;
- dataset/eval cases;
- correctness;
- tool-selection accuracy;
- structured-output validity;
- latency;
- cost;
- context needs;
- privacy/data constraints;
- failure profile;
- model-specific capabilities;
- portability cost.

Use the same eval set when comparing providers.

---

# 9. Retrieval/RAG decision

Do not reach for RAG when a SQL query is the right answer.

Ask:

- Is the needed fact structured and current? → SQL/API.
- Is it in a known document with exact identifiers? → direct document lookup may be enough.
- Is semantic matching required across many documents? → retrieval becomes relevant.
- Is lexical precision important for product codes/names? → BM25/hybrid may beat pure vector search.
- Is freshness critical? → retrieval index needs update policy and source timestamp.
- Does the answer require citations/provenance? → carry source IDs/chunks through the result.
- Is the corpus small enough to fit directly? → simpler context injection may be better.

Record chunking, indexing, filtering, ranking, provenance, stale-data policy and evals.

---

# 10. Human approval and side effects

Authority levels:

0. Observe only.
1. Analyze and explain.
2. Propose an action.
3. Draft the exact action.
4. Execute after explicit approval.
5. Execute autonomously within a narrow policy.

For the first learning month, prefer levels 0–4. Consequential financial or customer-facing actions should not silently jump to level 5.

For every write action define:

- who authorizes it;
- what exactly is shown for approval;
- whether approval is single-use;
- idempotency key;
- audit event;
- rollback/correction path;
- timeout/expiry;
- protection against stale data.

---

# 11. Security boundary

Treat customer messages, web content, emails, documents, and third-party tool output as untrusted data.

Compare:

- strict structured extraction;
- schema validation;
- allowlisted fields;
- least-privilege tools;
- read/write separation;
- permission gates;
- isolated “reader” model vs privileged actor;
- prompt-injection screening;
- deterministic rule enforcement below prompts;
- human approval.

A text instruction is advice. A deterministic guard is authority.

---

# 12. Evals before confidence

Each capability needs an eval set early, not at the end.

Minimum categories:

- happy path;
- missing field;
- ambiguous customer/product;
- malformed quantity/price;
- multiple products in one message;
- contradictory lines;
- stale inventory;
- tool failure;
- duplicate message;
- adversarial/untrusted instruction;
- case where no action should be taken.

Measure where possible:

- field extraction accuracy;
- expected tool call;
- forbidden tool call rate;
- exact numeric correctness;
- false positive/false negative rates;
- completion rate;
- human correction rate;
- latency;
- token/cost;
- traceability/evidence quality.

Use deterministic evaluators for deterministic properties. Use model judges only for genuinely subjective criteria, and calibrate them against human examples.

---

# 13. Observability

At minimum capture:

- run ID;
- timestamp;
- agent/model/version;
- prompt/config version;
- tool calls and arguments after redaction;
- tool results/provenance;
- errors/retries;
- duration;
- final structured output;
- approval events;
- eval result;
- cost/token metrics where available.

Do not log secrets or entire sensitive payloads merely because tracing makes it easy.

---

# 14. Deployment decision

Compare only when deployment becomes real:

- local CLI;
- local service/API;
- container on VM;
- serverless;
- managed agent runtime;
- durable workflow engine plus agent workers;
- queue/event-driven services.

For a product other people will use, require reproducible setup, secrets management, health checks, authentication/authorization where appropriate, logs, and a safe update path.

---

# 15. Architecture Decision Record template

Use one record for every consequential decision.

## ADR-NNN — <decision>

**Business problem**

**Decision**

**Alternatives considered**

**Evidence/source links**

**Why this option now**

**What we are deliberately not solving yet**

**Risks**

**Eval/proof**

**Reconsider when**

**Date**

The key field is **Reconsider when**. Architecture is allowed to change, but it should change because evidence changed.

---

# 16. Deep-alternatives rule

“Deep” means:

- cover the meaningful architectural categories;
- use primary sources first;
- include at least one competing approach;
- include limitations/failure/security material;
- include real implementation examples when useful;
- distinguish concepts from vendors.

“Deep” does not mean:

- compare every library in existence;
- delay a small experiment for days;
- collect sources without making a decision.

The learning loop is:

**Research design space → predict → compare in NotebookLM → inspect citations → decide → build → break → eval → teach back → update ADR.**

---

# 17. NotebookLM protocol

Master notebook:
https://notebook.google.com/notebook/a6068935-ef1d-444f-8827-dc2be63d4d95

For a consequential architecture decision:

1. Add the source pack from AGENTIC-FINANCE-30D.md.
2. Temporarily select only the sources relevant to the current decision.
3. Before asking NotebookLM, write your prediction.
4. Ask it to compare the approaches and cite each claim.
5. Open at least two cited source passages.
6. Generate a Mind Map when relationships matter.
7. After building, generate a hard quiz/flashcards.
8. Answer closed-book.
9. Use “explain” only after committing to an answer.
10. Record any source disagreement in the ADR.

Audio/Video Overviews are reinforcement, not proof of mastery.

---

# 18. Mastery gate

A component is not learned merely because AI generated working code.

You should be able to:

1. explain what problem it solves;
2. locate it inside the agent loop/system;
3. explain its inputs and outputs;
4. separate LLM work from deterministic code;
5. name serious alternatives;
6. explain when the alternatives are preferable;
7. break/test it deliberately;
8. direct a similar implementation without copying the original.

If one of these is weak, the next task should expose that weakness rather than hiding it.
