# START HERE — Agentic Finance

This is the entry point for the applied Agentic Finance learning path.

Do **not** read the entire repository before starting.
Do **not** finish COURSE.md before building.
Do **not** start by choosing a framework.

The daily loop is:

**Trello card → AGENTIC-FINANCE-30D session → targeted COURSE/ALTERNATIVES reading → NotebookLM source comparison → architecture decision → build in build/agentic-finance → test/eval → teach-back → evidence → Done**

---

## 0. Update your local clone

Existing local repo:

```powershell
cd C:\Users\Boris\Dell\stuff\Docs\Learning\AI\PAI
git status
git pull origin main
```

If this repository does not exist locally:

```powershell
cd C:\Users\Boris\Dell\stuff\Docs\Learning\AI
git clone https://github.com/BorisSolomonia/Agentic_PAI_Learning.git PAI
cd PAI
```

Verify:

```powershell
git log -1 --oneline
```

---

## 1. What each file is for

### AGENTIC-FINANCE-30D.md — open this first every day

This is the applied daily path.

Today, go directly to the current session. Do not read the entire file first.

It tells you:
- the business slice;
- the exact learning objective;
- what to read from COURSE.md;
- what sources to load into NotebookLM;
- the architecture question;
- what to build;
- how to break it;
- what proof is required.

### AGENT-ARCHITECTURE-GUIDE.md — use as a decision checklist

Do not memorize it.

For the first session, read only:
- §1 Start with the process;
- §2 Classify every decision;
- §3 Decide whether this should be an agent.

Return to later sections only when the current architecture reaches tools, memory, multi-agent design, security, evals, etc.

### COURSE.md — parallel theory/reference

Do not restart from Step 1.

For the applied track, read only the steps referenced by today's AGENTIC-FINANCE-30D session.

For Week 1 Session 1:
- COURSE.md Steps 7–9;
- ALTERNATIVES.md D6–D9;
- build/notes/01-five-surfaces.md as a short architecture reference.

### build/agentic-finance/ — code/work artifacts

This is the applied practice workspace.

Do not put the new applied Agentic Finance implementation inside build/myos/.

LifeOS/myos remains a reference/practice system; Agentic Finance is the applied system.

---

## 2. NotebookLM

Master notebook:
https://notebook.google.com/notebook/a6068935-ef1d-444f-8827-dc2be63d4d95

Important: ChatGPT cannot currently edit that private NotebookLM notebook directly. The course provides the source pack and questions; **you add/select those sources inside NotebookLM manually**.

For Session 1, add these sources:

1. Anthropic — Building effective agents  
   https://www.anthropic.com/engineering/building-effective-agents

2. OpenAI Agents SDK overview  
   https://openai.github.io/openai-agents-python/

3. Google ADK — Agents  
   https://google.github.io/adk-docs/agents/

4. LangChain/LangGraph learning docs  
   https://docs.langchain.com/oss/python/learn

5. LifeOS  
   https://github.com/danielmiessler/LifeOS

6. This repo's AGENT-ARCHITECTURE-GUIDE.md  
   https://github.com/BorisSolomonia/Agentic_PAI_Learning/blob/main/AGENT-ARCHITECTURE-GUIDE.md

Before asking NotebookLM anything, write your own prediction.

Session 1 questions:
- What is the difference between a deterministic workflow, one LLM call, an agent loop and a multi-agent system?
- What evidence justifies moving from one model call to an agent loop?
- Where do the sources recommend simpler architecture?
- Which parts of the current order process are probably deterministic?
- What would justify a separate specialist agent?

Open citations for important claims. NotebookLM is a learning/research layer, not the architecture decision-maker.

---

## 3. Session 1 exact sequence

Trello card:
**W1.1 — Map first order-process slice + vertical slice**

At the beginning of the session move it:
**week sprint → Today**

### 11:15–11:35 — Learn/compare

Open:
- AGENTIC-FINANCE-30D.md → Session 1;
- AGENT-ARCHITECTURE-GUIDE.md §1–§3;
- COURSE.md Steps 7–9;
- ALTERNATIVES.md D6–D9;
- NotebookLM source pack above.

Write your prediction first, then use NotebookLM.

### 11:35–11:50 — Architecture

Map the known process:

**Customer message → Seller → aggregation → Manager → inventory context**

For each step classify:
- deterministic rule/workflow;
- extraction;
- retrieval/tool;
- reasoning;
- human judgment;
- unknown.

Do not invent missing business process.

Create your first ADR in:

```
build/agentic-finance/decisions/ADR-001-first-order-slice.md
```

### 11:50–12:50 — Build

Build only the smallest vertical slice:

**raw synthetic customer message → structured OrderCandidate → output**

No Viber integration yet.
No orchestrator yet.
No multi-agent framework yet.

The point is to understand the first boundary.

### 12:50–13:05 — Break it

Test:
- missing quantity;
- two products;
- unknown product wording.

Record failures rather than hiding them.

### 13:05–13:15 — Teach back

Without notes answer:

1. What exactly did the model do?
2. What should deterministic code do?
3. Why is this not yet a multi-agent system?
4. What evidence could justify a separate specialist agent?
5. What would justify an orchestrator?

If you cannot answer one, that becomes a learning gap.

### Finish

Save:
- process map;
- ADR-001;
- code;
- example inputs/outputs;
- failure notes.

Commit the artifact.

Move Trello card:
**Today → Done**
only if its proof conditions pass.

---

## 4. What NOT to do on Day 1

Do not:
- read all 65 COURSE steps;
- read all of ALTERNATIVES.md;
- choose “the best agent framework” globally;
- build Viber integration;
- create five agents because five business roles exist;
- build production inventory integration;
- spend the full two hours watching Udemy;
- let NotebookLM choose the architecture for you.

The first day's goal is much smaller:

> **Understand one real business slice well enough to make one justified architecture decision and produce one working vertical slice.**
