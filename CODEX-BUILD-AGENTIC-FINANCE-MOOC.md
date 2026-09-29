# Codex Master Prompt — Build a local MOOC-style Agentic Finance course

You are working inside the repository:

```
BorisSolomonia/Agentic_PAI_Learning
```

Your task is to build a **locally runnable, exercise-first MOOC-style course** for Boris that teaches him to architect and build production AI-agent systems for finance and operations.

Do not build a generic “learn AI agents” tutorial.

The course must be benchmarked against the University of Helsinki Java Programming MOOC:
https://java-programming.mooc.fi/

Reference source repository:
https://github.com/rage/java-programming

The benchmark matters because it teaches through:
- explicit learning objectives;
- short conceptual explanations;
- many concrete exercises;
- automatic testing;
- progressive multi-part exercises;
- weekly parts;
- larger open-ended capstone exercises;
- visible progression from guided to independent work.

The new course must preserve those strengths, but adapt them to agent architecture and Boris’s actual business context.

---

# 1. Boris’s real goal

Boris is not trying to become a beginner prompt engineer.

He has:
- 15+ years of finance / CFO / accounting / IFRS / management accounting experience;
- ERP/business-process experience;
- strong Excel / Power Query / SQL skills;
- ~5 years Java / Spring Boot;
- React;
- GCP / Docker / Caddy / deployment experience;
- experience with APIs, OAuth, Telegram bots, databases and full-stack systems.

His goal is to become very good at:

1. **architecting production AI agents;**
2. **building them quickly with AI coding tools;**
3. **understanding the architecture deeply enough to own the decisions;**
4. **specializing in Agentic Finance / finance & operations automation;**
5. **building real portfolio systems from actual business workflows;**
6. **being able to choose between one model call, deterministic workflow, tool-using agent, specialist agents and orchestrator;**
7. **knowing alternatives and why one architecture is chosen over another;**
8. **using NotebookLM as a source-grounded learning/comparison system;**
9. **using Upwork market demand as an external reality check;**
10. **eventually being able to solve unseen real client problems independently.**

He is comfortable using AI to implement code, but he must own:
- system boundaries;
- tool contracts;
- state;
- memory;
- deterministic vs probabilistic logic;
- agent boundaries;
- orchestration;
- evals;
- safety;
- deployment.

The course must therefore teach **architecture through creation**.

---

# 2. Current real business process slice

Do not invent the rest of the business.

The only business slice currently known is:

```
Customer
  ↓
sends order message in Viber
  ↓
Seller receives multiple customer messages
  ↓
Seller aggregates orders
  ↓
Seller sends aggregated message to Manager
  ↓
Manager needs product / quantity / price / inventory context
  ↓
Manager creates operational result
```

Known message fields often include:
- customer name;
- product;
- quantity;
- price;

but real messages vary.

Possible future capabilities may include:
- reading customer messages;
- extracting/normalizing orders;
- helping sellers aggregate orders;
- aggregating seller outputs for manager;
- querying inventory;
- validating product/price;
- handling ambiguity;
- routing exceptions;
- later specialist agents and orchestration.

These are **candidate capabilities only**.

Never assume:
- every human role becomes an agent;
- every business step needs an LLM;
- an orchestrator is required;
- vector search is required;
- multi-agent is better.

The course must teach Boris how to decide.

---

# 3. Existing repository files you MUST use

Before writing code, deeply inspect these files:

```
AGENTIC-FINANCE-30D.md
AGENT-ARCHITECTURE-GUIDE.md
COURSE.md
ALTERNATIVES.md
CHECKLIST.md
LEARNING-STRUCTURE.md
PROGRESS.md
CHAPTERS.md
CURRICULUM.md
NEXT-STEPS.md
ENGINE-ROOM-GAPS.md
ANALYSIS-LifeOS-vs-PAI.md
research/
build/myos/
build/notes/
```

Also inspect the current repository tree.

Do not delete or overwrite valuable existing research.

Treat:
- `AGENTIC-FINANCE-30D.md` as the curriculum contract;
- `AGENT-ARCHITECTURE-GUIDE.md` as the architecture decision method;
- `ALTERNATIVES.md` as the local alternatives library;
- `COURSE.md` as the LifeOS/harness parallel reference;
- `CHECKLIST.md` as “must-never-forget” rules.

The new local MOOC course should link into these rather than duplicate everything.

---

# 4. Deep benchmark: Helsinki Java MOOC

Inspect the benchmark directly:

Main:
https://java-programming.mooc.fi/

Example beginner lesson:
https://java-programming.mooc.fi/part-1/1-starting-programming/

Example larger exercise:
https://java-programming.mooc.fi/part-7/3-larger-exercises/

Source repo:
https://github.com/rage/java-programming

Study at least:
- course navigation;
- part/week organization;
- lesson page structure;
- learning objectives;
- quizzes;
- programming exercise presentation;
- multi-part exercises;
- sample outputs;
- larger exercises;
- local tooling / automated testing;
- content source format;
- progress model.

Do not clone the old Gatsby implementation blindly.

Extract the pedagogical model.

The equivalent we want is:

```text
WEEK / PART
  ↓
DAY / LESSON
  ↓
LEARNING OBJECTIVES
  ↓
WHERE THIS FITS IN THE WHOLE SYSTEM
  ↓
CONCEPT EXPLANATION
  ↓
SMALL EXAMPLE
  ↓
SOURCE READING
  ↓
NOTEBOOKLM COMPARISON
  ↓
EXERCISE
  ↓
AUTOMATED TEST
  ↓
BREAK-IT EXERCISE
  ↓
TEACH-BACK
  ↓
PROGRESS
  ↓
WEEKLY CAPSTONE
```

The user studies 2 hours/day × 5 days/week = ~10 hours/week.

This maps very well to one MOOC-style “Part” per week.

---

# 5. Technical architecture for the local course

Use a **hybrid architecture** unless repository constraints clearly justify a better one:

## Course UI

Use:
- Next.js;
- TypeScript;
- React;
- MDX or structured Markdown content;
- local-first execution;
- no cloud dependency required for the course site itself.

Why:
- Boris already knows React/Next.js;
- the content is naturally documentation/course-like;
- interactive progress/exercise components can be embedded;
- the application can run locally.

If another stack is materially better, document the alternative in an ADR before changing.

## Exercise runtime

Use **Python** for agent exercises by default.

Why:
- the current agent ecosystem and course sources are strongly Python-oriented;
- OpenAI Agents SDK / LangGraph / CrewAI / many examples are Python-first;
- Boris already knows Java/Spring, so Python adds the most useful complementary runtime knowledge;
- the local course UI can remain TypeScript.

Python is a default, not ideology. The course must explicitly compare TypeScript where relevant.

## Testing

Use:
- pytest for Python exercises;
- deterministic tests wherever possible;
- local golden/eval fixtures;
- optional provider-backed integration tests clearly separated from offline tests.

The learner must be able to run tests from the terminal.

Preferred command shape:

```bash
npm run course
npm run test:exercise -- week01/day03
```

or equivalent.

A browser “Run tests” button is desirable if safely implemented locally, but the CLI must remain the source of truth.

Do not build an unsafe arbitrary-code execution server exposed outside localhost.

## Progress

Implement local progress storage.

Possible options:
- JSON file;
- SQLite;
- browser localStorage plus exported progress file.

Prefer a simple design with a durable local file / SQLite if progress needs to survive browser changes.

Progress must record:
- day/lesson;
- exercises passed;
- eval status;
- teach-back complete;
- optional NotebookLM done;
- timestamp;
- evidence links/paths.

## Exercise solutions

Do not put complete solutions directly next to the exercise.

Preferred:
- hidden/reference solutions outside the normal lesson path;
- optional “reveal after attempt” mechanism;
- or instructor/reference folder excluded from default UI.

The point is creation, not copying.

---

# 6. Required course repository structure

Create something close to:

```
course/
  README.md
  package.json
  app/ or src/
  components/
    LearningObjectives.*
    WholePicture.*
    DependencyChain.*
    SourceList.*
    LocalReading.*
    NotebookLab.*
    Alternatives.*
    Exercise.*
    BreakIt.*
    Proof.*
    TeachBack.*
    WeeklyGate.*
    Progress.*
  content/
    week-01/
      index.mdx
      day-01.mdx
      day-02.mdx
      day-03.mdx
      day-04.mdx
      day-05.mdx
    week-02/
      index.mdx
      day-06.mdx
      day-07.mdx
      day-08.mdx
      day-09.mdx
      day-10.mdx
  curriculum/
    manifest.ts or manifest.json
    sources.ts or sources.json
  exercises/
    week-01/
      day-01/
      day-02/
      ...
    week-02/
      ...
  grader/
  progress/
  public/
```

The exact tree may change if you can justify a cleaner design.

Do not create huge abstractions before they are used.

---

# 7. Every day MUST use the same pedagogical contract

Each daily lesson page must visibly contain these sections.

## A. Day title

Short and concrete.

Example:

```
Day 3 — Tool calling: LLM chooses; code executes
```

## B. Learning objectives

3–6 measurable statements beginning with verbs such as:
- explain;
- distinguish;
- implement;
- test;
- compare;
- justify.

## C. Whole-picture position

Show:
- where today’s component sits in the full agent system;
- what comes before it;
- what comes after it.

Use a simple visual chain/diagram.

Example:

```
message
  ↓
schema
  ↓
[TOOL BOUNDARY] ← TODAY
  ↓
business logic / data
```

## D. Depends on

Explicit prerequisites.

## E. Unlocks

What future lessons/components rely on today.

## F. What it is used for in real systems

At least 2 real examples:
- current 9_Tones/order flow;
- generic production agent example.

## G. Core explanation

Teach the concept clearly.

Do not write encyclopedic walls of text.

Use:
- short theory;
- code;
- diagrams;
- examples.

## H. Alternatives

For every important design choice:
- list serious alternatives;
- link to the relevant `ALTERNATIVES.md` section;
- link to primary external sources;
- explain what differentiates them;
- do NOT prescribe “best” without context.

## I. Online sources

List exact links and what to read.

Never say only “read OpenAI docs.”

Specify:
- source;
- section/topic;
- why it matters today.

## J. Local source reading

List exact local files/sections:
- `COURSE.md`;
- `ALTERNATIVES.md`;
- `CHECKLIST.md`;
- research file;
- LifeOS reference when relevant.

## K. Udemy

If relevant:
- say which concept/section to watch;
- do not require linear course completion;
- mark it optional if equivalent primary-source material is enough.

## L. NotebookLM lab

Every important day must include:

**Before NotebookLM**
- prediction questions Boris answers himself.

**Sources to select/add**
- exact source list.

**Questions**
- 4–8 hard comparison questions.

**Citation check**
- require opening important citations.

**After implementation**
- quiz/flashcards or synthesis when useful.

NotebookLM is a source-grounded learning tool.
It must not make the architecture decision.

## M. Build exercise

The course must always produce working code or an architecture artifact.

Exercises should be progressive and concrete.

Use multiple parts where appropriate, like MOOC.fi.

Example:

```
Exercise 3.1 — define a product tool
Exercise 3.2 — validate arguments
Exercise 3.3 — call from model
Exercise 3.4 — log provenance
```

## N. Automated tests

Every code exercise gets:
- starter files;
- tests;
- expected behavior;
- clear command.

Tests must distinguish:
- deterministic offline checks;
- provider-backed tests requiring API keys.

## O. Break it

Every day includes at least one deliberate failure.

Examples:
- malformed input;
- repeated tool call;
- stale inventory;
- duplicate message;
- prompt injection;
- timeout;
- missing field.

## P. Proof

Define exactly what counts as completion.

## Q. Teach-back

3–7 closed-book questions.

## R. “Reconsider when”

For architecture decisions, define evidence that would justify changing the decision.

---

# 8. Week structure

The course is organized by **weeks/parts**.

Each week should have:

## Week overview

- whole-system goal;
- exact artifact built by Friday;
- dependency on prior week;
- what it unlocks;
- source pack;
- mastery criteria.

## Days 1–4

Build new concepts in small increments.

## Day 5

Weekly capstone / integration / eval / architecture gate.

Day 5 should resemble Helsinki MOOC’s larger open-ended exercises:
- less scaffolding;
- more independent design;
- multiple concepts combined;
- tests/evidence required.

---

# 9. Implement ONLY Weeks 1–2 now

Use the current `AGENTIC-FINANCE-30D.md` as the content contract.

Do not author detailed Week 3+ lessons yet.

Why:
- Boris will provide more of the real business process;
- architecture will change based on Week 1–2 eval evidence;
- Upwork may expose relevant market gaps;
- future lessons should be generated adaptively.

Create stubs only for later weeks if navigation requires them.

---

# 10. Week 1 content

Theme:

**From business process to one reliable agent loop**

By Friday, the learner must have:

```
unstructured order message
  ↓
structured OrderCandidate
  ↓
deterministic validation
  ↓
typed product/inventory tool
  ↓
minimal agent loop
  ↓
trace
  ↓
repeatable eval
```

## Day 1
Process decomposition:
- workflow vs extraction vs reasoning vs retrieval vs agentic decision;
- deterministic workflow vs one model call vs agent loop vs multi-agent.

Build:
- process map;
- ADR;
- smallest message → OrderCandidate spike.

## Day 2
Structured outputs / contracts.

Build:
- Pydantic `OrderCandidate`;
- extraction;
- malformed/missing-field cases.

## Day 3
Tool calling and deterministic truth.

Build:
- product resolver / inventory tool;
- argument validation;
- provenance.

## Day 4
Agent loop from first principles.

Build:
- minimal loop;
- iteration limit;
- tool allowlist;
- final schema;
- error path;
- trace ID.

## Day 5
Evaluation / tracing / capstone.

Build:
- at least 15 eval cases;
- deterministic assertions;
- failure taxonomy;
- Week-1 architecture diagram;
- mastery gate.

---

# 11. Week 2 content

Theme:

**State, memory, specialization and orchestration**

## Day 6
State:
- context vs run state vs durable workflow state vs business DB.

Build:
- `OrderSession` or equivalent;
- multi-message seller aggregate;
- duplicate/retry tests.

## Day 7
Memory/retrieval:
- storage by semantics;
- SQL vs file vs vector vs BM25 vs graph vs provider memory vs no memory.

Build:
- storage map;
- only the storage actually needed now;
- read-back through a second path.

## Day 8
Specialist agents:
- split by reasoning boundary, not organization chart.

Build:
- compare single-agent + deterministic aggregation vs specialist split;
- implement simpler one first unless evidence supports split;
- ADR “Does Agent #2 exist yet?”

## Day 9
Orchestration:
- fixed workflow;
- router;
- manager agent;
- agent-as-tool;
- handoff;
- graph/state machine;
- event queue;
- parallel fan-out/fan-in.

Build:
- synthetic multi-seller flow;
- deterministic orchestration first;
- agentic branch only if justified.

## Day 10
Week-2 capstone.

Build:
- architecture-v1;
- runnable synthetic mini-batch;
- at least 20 eval cases;
- ADR set;
- trace/eval report;
- closed-book architecture reconstruction.

---

# 12. Required source library

The course must incorporate these sources and link them from the exact lesson where they matter.

## Benchmark / pedagogy

https://java-programming.mooc.fi/
https://java-programming.mooc.fi/part-1/1-starting-programming/
https://java-programming.mooc.fi/part-7/3-larger-exercises/
https://github.com/rage/java-programming

## Current course / reference repo

Local:
```
COURSE.md
ALTERNATIVES.md
AGENT-ARCHITECTURE-GUIDE.md
AGENTIC-FINANCE-30D.md
CHECKLIST.md
LEARNING-STRUCTURE.md
PROGRESS.md
CHAPTERS.md
research/
build/myos/
build/notes/
```

## Agent architecture

Anthropic — Building effective agents  
https://www.anthropic.com/engineering/building-effective-agents

Anthropic — Writing tools for agents  
https://www.anthropic.com/engineering/writing-tools-for-agents

OpenAI Agents SDK  
https://openai.github.io/openai-agents-python/

OpenAI tools  
https://openai.github.io/openai-agents-python/tools/

OpenAI multi-agent  
https://openai.github.io/openai-agents-python/multi_agent/

OpenAI handoffs  
https://openai.github.io/openai-agents-python/handoffs/

OpenAI tracing  
https://openai.github.io/openai-agents-python/tracing/

OpenAI testing  
https://openai.github.io/openai-agents-python/testing/

Google ADK agents  
https://google.github.io/adk-docs/agents/

Google ADK workflows  
https://google.github.io/adk-docs/workflows/

LangChain/LangGraph learning docs  
https://docs.langchain.com/oss/python/learn

CrewAI Flows  
https://docs.crewai.com/en/concepts/flows

Model Context Protocol  
https://modelcontextprotocol.io/

## Structured data / runtime

Gemini structured output  
https://ai.google.dev/gemini-api/docs/structured-output

Gemini function calling  
https://ai.google.dev/gemini-api/docs/function-calling

Pydantic  
https://docs.pydantic.dev/latest/

Python asyncio  
https://docs.python.org/3/library/asyncio-task.html

Python typing  
https://docs.python.org/3/library/typing.html

pytest  
https://docs.pytest.org/en/stable/

HTTPX  
https://www.python-httpx.org/

## Security / evaluation

OWASP prompt injection prevention  
https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html

LangSmith evaluation  
https://docs.langchain.com/langsmith/evaluation

## NotebookLM

Master notebook:
https://notebook.google.com/notebook/a6068935-ef1d-444f-8827-dc2be63d4d95

NotebookLM help:
https://support.google.com/notebooklm/

NotebookLM learning features:
https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-student-features/

NotebookLM research:
https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/

NotebookLM video/studio:
https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-video-overviews-studio-upgrades/

## Udemy

The Complete Agentic AI Engineering Course:
https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/learn/lecture/49820721#notes

Use it selectively based on the daily build.

---

# 13. Exercise quality rules

Exercises must not be fake “fill in one line” tasks unless teaching one tiny syntax/mechanism.

Prefer:
- realistic synthetic business data;
- incomplete starter implementation;
- tests;
- concrete expected behavior;
- meaningful edge cases.

Every lesson should have a progression:

```text
understand
→ small isolated build
→ integrate
→ break
→ prove
→ explain
```

Weekly capstones reduce scaffolding.

Do not let Codex solve the exercise for the learner through the lesson content.

---

# 14. Finance/operations truth rules

Throughout the course:

**LLM interprets.**
**Code computes.**
**Database/API stores/returns business facts.**
**Human approves consequential ambiguity.**

Treat this as a starting heuristic, not dogma.

Specific rules:
- money arithmetic is deterministic;
- inventory balances are not invented by the model;
- current price comes from a source of truth;
- customer/product identity must have deterministic IDs or explicit ambiguity handling;
- source/provenance is carried through important results;
- no secrets in logs;
- real customer data is never committed to the learning repo;
- synthetic/anonymized data only.

---

# 15. Multi-agent rule

Do not teach multi-agent as a goal.

Teach it as an architectural decision.

A second agent must earn its existence through one or more of:
- materially different mission;
- different context;
- different tools;
- separate eval surface;
- independent lifecycle;
- different model requirements;
- parallelism benefit;
- security/isolation benefit.

Every extra agent adds:
- prompt/context;
- latency;
- cost;
- handoff errors;
- observability complexity;
- coordination failure.

The course must make these tradeoffs visible.

---

# 16. Alternatives rule

For every major concept, link to the local `ALTERNATIVES.md` decision when one exists.

When local alternatives do not cover an important new decision:
- add a new decision section to `ALTERNATIVES.md`;
- include primary sources;
- compare how each option is implemented;
- gains;
- costs;
- when it wins;
- a small “try it” exercise.

Likely new decisions eventually needed:
- raw loop vs agent framework;
- runtime provider/model choice;
- model routing;
- deterministic workflow vs graph engine;
- single agent vs specialists;
- orchestrator patterns;
- MCP vs native integration;
- eval architecture;
- tracing/observability stack.

---

# 17. NotebookLM rule

NotebookLM is mandatory on architecture-heavy days.

For each NotebookLM block:

1. learner writes prediction;
2. sources are selected;
3. learner asks comparison questions;
4. learner opens citations;
5. learner records disagreement/uncertainty;
6. learner makes own decision;
7. after implementation, learner uses quiz/flashcards/synthesis where useful.

Do not phrase NotebookLM work as “ask which option is best.”

---

# 18. Progress and mastery

Each lesson completion should be represented by more than a checkbox.

Capture:

```
lesson
exercise tests
eval result
break-it result
teach-back complete
ADR created/updated
NotebookLM comparison done
time spent
notes / open confusion
```

Weekly gate requires:
- runnable artifact;
- tests/evals;
- architecture diagram;
- closed-book explanation;
- evidence-backed ADRs.

---

# 19. UI expectations

Benchmark the readability of MOOC.fi.

The local course should feel like a real learning product, not a raw docs folder.

Requirements:
- left sidebar: Week → Day;
- progress visible;
- clear “Learning Objectives” box;
- “Where this fits” visual block;
- source cards;
- local reading links;
- NotebookLM prompt block;
- alternatives block;
- exercise cards;
- test command;
- break-it block;
- proof block;
- teach-back;
- next lesson link.

Avoid excessive dashboard/card clutter.

Use cards only when they communicate a semantic teaching unit.

Prioritize reading flow.

---

# 20. Commands / developer experience

At minimum:

```bash
cd course
npm install
npm run dev
```

and a documented exercise command.

Prefer one-command bootstrap if practical.

Provide:
- `.env.example`;
- clear provider API-key setup;
- offline tests that run without an API key;
- integration tests skipped when key absent;
- Windows-friendly instructions because Boris develops on Windows + WSL.

---

# 21. Deliverables

When done, produce:

1. runnable local course app;
2. Week 1 fully authored;
3. Week 2 fully authored;
4. exercises for all 10 days;
5. automated tests;
6. progress tracking;
7. NotebookLM blocks;
8. exact source links;
9. local-source deep links/references;
10. architecture diagrams/whole-picture blocks;
11. weekly capstones;
12. README with start command;
13. ADR explaining course technical architecture;
14. no detailed Week 3+ content yet;
15. update `START-HERE.md` so the learner starts the local course instead of reading raw Markdown.

---

# 22. Definition of done

Do not claim complete until all of these pass:

- fresh install works;
- course starts locally;
- Week 1 and Week 2 navigation works;
- every day has all required pedagogical sections;
- every coding day has a runnable exercise;
- offline tests run;
- progress can be recorded;
- source links render;
- NotebookLM questions are present;
- local repo references are present;
- every day explains its position in the whole system;
- every day lists dependencies and what it unlocks;
- every major design choice exposes alternatives;
- Week 1 capstone integrates Days 1–4;
- Week 2 capstone integrates Weeks 1–2;
- real business details beyond the known process slice were not fabricated.

After implementation, print:
- exact start commands;
- file tree;
- what was created;
- test results;
- known limitations;
- what information Boris should provide before Week 3 is authored.
