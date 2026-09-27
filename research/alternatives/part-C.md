# Alternatives, part C: decisions D17 to D23

> Written 2026-09-25 for COURSE.md Part 4 (memory), Part 5 (verification), Stage B (event log,
> installer, settings merge) and Stage C (Atlas, Ledger, Synapse, learning router). Every LifeOS path
> was opened under `~/.claude` and every RS.GE path under
> `/mnt/c/Users/Boris/Dell/Projects/APPS/RS.GE_Agent` on that date. "Not built yet" and "not verified"
> mean exactly that. Claims about other products cite a URL fetched 2026-09-24 or 2026-09-25.
> "Try it" paths are relative to `build/myos`; everything they write goes under `build/myos/try/`,
> which can be deleted at any time. No shell command in this file starts a `claude` session.

| ID | Decision | Course steps |
|---|---|---|
| [D17](#d17) | Where memory lives and what loads when | 22 to 25 |
| [D18](#d18) | How memory is written and curated | 23, 26, 27 |
| [D19](#d19) | How "done" is decided | 29 to 35 |
| [D20](#d20) | What gets logged, and where | 18, 36 |
| [D21](#d21) | How installs and updates stay safe | 43 to 46 |
| [D22](#d22) | Knowing what you own and what changed | 51 to 54 |
| [D23](#d23) | Capture first, route later | 55 to 59 |

---

<a id="d17"></a>
## D17 · Where memory lives and what loads when

**The question:** Where does the system keep what it learned about the person, and which part of it is put in front of the model at the start of each turn?
**Where the course meets it:** steps 22 to 25 · **LifeOS today:** two small markdown files injected by a prompt hook, plus BM25 word search over notes, no vector index (`~/.claude/hooks/MemoryTurnStart.hook.ts`) · **RS.GE today:** Postgres rows with validity intervals, per tenant, assembled per turn in code; nothing loads at session start (`packages/db/migrations/0002_profile_and_filings.sql`, `packages/memory/src/prefill.ts`)

**In kid words:** Memory is a shoebox of notes. The question is which notes you tape to the wall so you see them every morning, which stay in the box until you go looking, and who is allowed to write on them.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. Markdown hot layer, loaded every session | Two capped files, printed by a UserPromptSubmit hook | No lookup; readable and editable by hand; diffable | Paid on every turn; a cap forces forgetting; one person only | One user, one machine, facts that matter daily |
| B. Database rows with validity intervals | `profile_facts(key, value, valid_from, valid_to, source)`, one live row per key | History for free; "what was true in March" answerable; isolation by the database | A schema and a query per read; nothing loads for free | Many users, money, audits |
| C. Search on demand (BM25 or vectors) | Scan or index notes; inject only hits above a threshold | Big corpus, small context | A miss is silent; vectors need an embedding service; BM25 misses synonyms | Notes outgrow the wall |
| D. Claude Code auto memory | `~/.claude/projects/<project>/memory/MEMORY.md`; first 200 lines or 25 KB load | Free, built in, the model writes it | Model-decided content; per project folder; a second memory beside your own | Solo dev on one repo, zero setup |
| E. Provider-side memory tool | `{"type":"memory_20250818","name":"memory"}`; your handler stores files under `/memories` | The model keeps its own notes; storage is yours | Free text only; paths and secrets must be guarded; notes are not facts | An agent that must carry progress across sessions |
| F. Session transcripts as the archive | Harness JSONL under `~/.claude/projects/`; mined later | Nothing lost; no design needed | Raw, huge, expires; nothing structured until mined | As the source a curator reads, never as the memory |

### How each one is built
**A. Markdown hot layer.** LifeOS keeps `LIFEOS/USER/PRINCIPAL/PRINCIPAL_MEMORY.md` and `LIFEOS/USER/DIGITAL_ASSISTANT/DA_MEMORY.md`, each capped at 48 entries of 256 chars (`hooks/LoadMemory.hook.ts`). The hook prints them inside `<lifeos-memory>` tags on stdout; the harness adds that text to the prompt. The gate in `MemoryTurnStart.hook.ts` sends them on a session's first prompt, whenever their hash changed, or every 20 turns (`REFRESH_TURNS = 20`), so the same 1.5K tokens are not repeated every turn.
```
hooks.json → UserPromptSubmit → MemoryTurnStart.hook.ts
  1. LoadMemory.run()          → <lifeos-memory>        (hot files, gated)
  2. MemoryDeltaSurface.run()  → <lifeos-memory-delta>  (the 🧠 line, see D18)
  3. getRelevantContext(prompt, {topK: 5, threshold: 0.20}) → <lifeos-ground>
```
**B. Rows with validity intervals.** RS.GE `packages/db/migrations/0002_profile_and_filings.sql`:
```sql
create table profile_facts (
  tenant_id uuid not null, key text not null, value jsonb not null,
  valid_from timestamptz not null default now(), valid_to timestamptz,
  source text not null references fact_sources(code), changed_by text not null, reason text);
create unique index profile_facts_current_uidx
  on profile_facts (tenant_id, key) where valid_to is null;   -- one live row per key
```
A change closes the old row (`valid_to`) and opens a new one. `profileFactAt(key, at)` in `packages/db/src/repositories.ts` answers "what was in force then". `prefill.ts` builds proposals for one declaration and one period, each tagged `source: memory` with provenance (which fact or which prior filing line, recorded when) and a `needsReReading` flag past the source's freshness window.
**C. Search on demand.** LifeOS `LIFEOS/TOOLS/MemoryRetriever.ts` is BM25 (word matching, no model call) over KNOWLEDGE, a recency-bounded slice of LEARNING (500 notes) and the two hot files; learning notes score at 0.7x; below 0.20 nothing is injected. `LIFEOS/CORTEX_INDEX_POLICY.json` declares `no-index-v1`: no vector index exists. Anthropic's retrieval post reports BM25 plus embeddings cut top-20 retrieval failures by 49% against 35% for embeddings alone, so a vector store is an addition, not a replacement.
**D. Claude Code auto memory.** Per project folder: `~/.claude/projects/<project>/memory/MEMORY.md` plus topic files; the first 200 lines or 25 KB load every session; off with `"autoMemoryEnabled": false`. For a service on the Agent SDK the isolation recipe is `settingSources: []` plus `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` (verified 2026-09-24, course step 6.6).
**E. Provider-side memory tool.** RS.GE implements the handler in `packages/core/src/memory-handler.ts` (every path checked twice: as text, then after resolving) and stores notes as rows in `memory_notes` (`packages/memory/src/notes.ts`) under forced row-level security. The rule written in the file: nothing reads a note to decide a number.
**F. Transcripts.** LifeOS reads the newest harness transcript from `~/.claude/projects/` in `LIFEOS/TOOLS/MemoryReviewer.ts` and `SessionHarvester.ts`. The harness deletes transcripts after `cleanupPeriodDays`; that key is not set in his `settings.json`, so the default applies.

### Better or worse?
- **For a personal system (myos, LifeOS):** A plus C. The hot files are the wall; BM25 is the box. Use D only if you turn A off. B is overkill for one person until the question "what did I believe in March" comes up.
- **For a product for strangers (the RS.GE Agent):** B, with E only for free-text notes that never decide a number. A markdown file per tenant on a shared disk is isolated by nothing but the code that builds the path; a row is isolated by the database (comment in `0006_memory.sql`). No hot layer: each turn assembles context from rows, so every fact carries `source`, `valid_from` and `reason`.
- **The trap:** two memories at once. `MemorySystem.md` says auto memory is disabled by design, but on this machine `grep autoMemoryEnabled ~/.claude/settings.json` finds nothing and `~/.claude/projects/-home-dmin--claude/memory/MEMORY.md` exists (checked 2026-09-25). The harness writes one memory while Cortex writes another, and neither knows the other's facts. Step 6.6 found the same class of leak for myos.

### Try it (5 min)
Measure what "always loaded" costs against "loaded on demand".
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d17`
2. `wc -c USER/IDENTITY.md USER/TELOS.md CLAUDE.md` then divide the total by 4: a rough token count paid on every turn.
3. `printf 'Boris prefers metric units\nBackend runs on :8081\nNever edit an applied migration\n' > try/d17/hot.md`
4. `head -n 2 try/d17/hot.md` shows what a "first N lines" cap does: line 3 is silently gone, exactly like `MEMORY.md` past 200 lines.
5. `grep -ril "migration" USER try | head` is the on-demand path: only matching files are named; nothing else enters context.

| Command | What it does |
|---|---|
| `mkdir -p try/d17` | makes the scratch folder; no error if it exists |
| `wc -c FILE...` | counts bytes per file; bytes divided by 4 is a rough token estimate |
| `printf '...' > file` | writes three lines into a new file |
| `head -n 2 file` | prints only the first two lines |
| `grep -ril WORD DIR` | lists files containing WORD, ignoring case, recursively |

### Sources
- LifeOS: `~/.claude/LIFEOS/DOCUMENTATION/Memory/MemorySystem.md`, `~/.claude/hooks/MemoryTurnStart.hook.ts`, `~/.claude/hooks/LoadMemory.hook.ts`, `~/.claude/LIFEOS/TOOLS/MemoryRetriever.ts`, `~/.claude/LIFEOS/CORTEX_INDEX_POLICY.json`, `~/.claude/hooks/hooks.json`
- RS.GE: `packages/db/migrations/0002_profile_and_filings.sql`, `packages/db/migrations/0006_memory.sql`, `packages/db/src/repositories.ts`, `packages/memory/src/prefill.ts`, `packages/memory/src/notes.ts`, `packages/core/src/memory-handler.ts`, `packages/db/DB.md`
- Claude Code memory (auto memory path, 200 lines / 25 KB, `autoMemoryEnabled`, imports four hops deep): https://code.claude.com/docs/en/memory
- Anthropic memory tool (`memory_20250818`, client-side, `/memories`, path traversal): https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- BM25 plus embeddings numbers: https://www.anthropic.com/news/contextual-retrieval
- Mem0, a hosted or self-hosted memory layer: https://docs.mem0.ai/ · Letta, stateful agents: https://docs.letta.com/ (memory-block details not verified on the overview page)
- Agent SDK isolation (`settingSources: []`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`): verified 2026-09-24 by the course; URL not re-fetched here

---

<a id="d18"></a>
## D18 · How memory is written and curated

**The question:** Who is allowed to write a memory, when, and how does a wrong or stale entry leave?
**Where the course meets it:** steps 23, 26, 27 · **LifeOS today:** a Stop hook fires a model reviewer after 8 turns and 30 minutes; the reviewer returns the full desired set and code replaces the file behind shrink guards and snapshots; a deterministic 🧠 line reports what changed (`~/.claude/hooks/MemoryReviewFire.hook.ts`, `~/.claude/LIFEOS/TOOLS/MemoryReviewer.ts`, `~/.claude/hooks/MemoryDeltaSurface.hook.ts`) · **RS.GE today:** memory changes only on a typed event; a correction is a row that closes the old fact and opens the new one in one transaction (`packages/memory/src/corrections.ts`)

**In kid words:** Someone has to tidy the notes on the wall. You can let a helper rewrite the whole wall every evening (and keep a photo in case), or you can only let a note change when you say "that one is wrong, it is X", keeping the old note with a date crossed through.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. Written at session end by a hook | A Stop or SessionEnd hook appends what the turn learned | Simple; nothing forgotten between sessions | Append-only grows forever; nobody removes the stale | First version of any personal system |
| B. Written on correction | "That was wrong" writes a row with old value, new value, reason | High signal; provenance free; nothing written by guessing | Learns only when told; needs a typed target | Money, law, anything a stranger relies on |
| C. Model proposes, code decides | The model returns typed items; code routes by type and permission tier; low confidence goes to a queue | Finds patterns you would miss; code holds the pen | A prompt becomes a security boundary; needs guards | A personal curator with a human review queue |
| D. Append-only vs supersede vs delete | Append rows; or close an interval and open a new row; or replace the file | Append keeps history; supersede keeps both; delete keeps context small | Delete loses history; append needs "latest wins" readers | Supersede for facts; delete only with a snapshot |
| E. A reviewer on a cadence | Every N turns and M minutes, reread the whole set and return the new desired set | Merges duplicates; forgetting is omission | Whole-file blast radius; needs guards and snapshots | When the hot layer has a hard cap |
| F. A status line computed by code | A hook reads the write log and prints one line the model echoes verbatim | You see every change; the model cannot grade itself | One more hook to keep alive; silence looks like health | Always, once anything writes memory on its own |

### How each one is built
**A. Hook at the end.** In `hooks.json`, `Stop` runs `MemoryReviewFire.hook.ts` and `SessionEnd` runs `WorkCompletionLearning.hook.ts`. The smallest form is ten lines: read `transcript_path` from stdin, take the last exchange, append one line to a file. Step 23 builds that.
**B. On correction.** RS.GE `recordCorrection()` writes the `corrections` row (`rejected_value`, `corrected_value`, `document_value`, `scope`, `period`, `proposed_from`, `reason`, `changed_by`); for a standing answer it then opens a new `profile_facts` row with `source = user` and `correction_id` (migration `0007`); then an audit row `memory.corrected`; all in one transaction. `suppressionFor()` keeps a rejected value from being proposed again, comparing numbers after decimal normalisation so `15000` and `15000.00` are one number. A `period_only` rejection binds one month; `until_changed` binds every later month until the taxpayer names that value as correct.
**C. Model proposes, code decides.** LifeOS `MemoryReviewer.ts` sends the last 20 exchanges to `Inference.ts` and parses `{items:[...]}`. Each item has a `type` from `LIFEOS/TOOLS/MemoryTypes.ts` (memory, idea, knowledge, proposal); `MutationTier.ts` decides the permission: tier A auto-write (the two hot files), B logged append (PROJECTS, CONTACTS, KNOWLEDGE), C propose-only (identity files), D untouchable (hooks, settings, code). Proposals at confidence 0.70 or more auto-apply; the rest wait in `MEMORY/OBSERVABILITY/pending-proposals.jsonl` for `ProposalDecide.ts`.
**D. Append, supersede, delete.** RS.GE supersedes: close `valid_to`, open a new row, never overwrite. LifeOS deletes by omission: the reviewer returns `op: "set"` with the full desired list and `MemoryWriter.setEntries` replaces the file, refusing `ESUSPECT_SHRINK` (near-empty, or more than half dropped with no additions) and `ESUSPECT_EROSION` (a net drop of 2 or more), after copying the old file to `MEMORY/OBSERVABILITY/memory-snapshots/` (last 30 per file; `MemoryRestore.ts` puts one back). Tier B appends, one audit row per write in `tier-b-writes.jsonl`.
**E. Cadence.** `LIFEOS/USER/CONFIG/memory-review.json`: `turn_threshold: 8`, `min_minutes_between: 30`, `idle_threshold: 2`, `confidence_threshold: 0.70`. The turn count is per session (`MEMORY/STATE/memory-review/<session>.json`); the minute clock is global, so ten sessions cannot run ten reviews in one window.
**F. Status line.** `MemoryDeltaSurface.hook.ts` reads `memory-writes.jsonl` past a cursor, counts rows whose writer is `MemorySystem.add`, and prints one line: `+N learned, −M dropped, a sample, a freshness grade (n/t fresh)`. A sample that looks like an instruction is withheld and marked instruction-shaped, because a memory can come from a web page. The hook touches `MEMORY/STATE/delta-surface-heartbeat` every run and `MemoryHealthCheck.ts` goes critical if writes continue while the heartbeat is dead; that guard exists because the line was dead for five days before anyone noticed.

### Better or worse?
- **For a personal system (myos, LifeOS):** A first (step 23), F the same week, then C with a queue. E only when a cap forces it, never without snapshots. The reviewer earns its place because nobody types "remember this" every time.
- **For a product for strangers (the RS.GE Agent):** B only, with D as supersede. No model-written memory decides anything: `memory_notes` is text the model keeps for itself. A rate correction is routed to `product_feedback` for the operator, not into the rules table (`feedback.ts`). ISC-19 (a rejected value never returns across three sessions) is still open in `ISA.md`: the code exists, the eval does not.
- **The trap:** a curator that only adds. LifeOS hit the cap-jam (`EAT_CAP`), then slow erosion where each write was a tenth smaller until 12 rules died in 48 hours; both guards were written after the loss. Decide the forgetting rule before the first automatic write.

### Try it (5 min)
Supersede-not-overwrite with two JSON lines and one query.
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d18`
2. `printf '{"key":"vat_rate","value":"18","valid_from":"2026-01-01","valid_to":"2026-09-01","source":"document"}\n{"key":"vat_rate","value":"20","valid_from":"2026-09-01","valid_to":null,"source":"user","reason":"Boris corrected it"}\n' > try/d18/facts.jsonl`
3. `jq -c 'select(.valid_to == null)' try/d18/facts.jsonl` prints what is true now.
4. `jq -c 'select(.valid_from <= "2026-06-01" and (.valid_to == null or .valid_to > "2026-06-01"))' try/d18/facts.jsonl` prints what was true in June: the old row, still there.
5. Delete line 1 in an editor and rerun step 4: nothing. That is what overwrite costs. Put the line back.

| Command | What it does |
|---|---|
| `printf '...\n...\n' > file` | writes two JSON lines, one fact per line |
| `jq -c 'select(COND)' file` | prints only the lines where COND is true |
| `.valid_to == null` | "still open": the live row |
| `.valid_from <= D and (...)` | the interval test: opened before D and not closed by D |

### Sources
- LifeOS: `~/.claude/hooks/MemoryReviewFire.hook.ts`, `~/.claude/LIFEOS/TOOLS/MemoryReviewer.ts`, `~/.claude/LIFEOS/TOOLS/MemoryTypes.ts`, `~/.claude/LIFEOS/TOOLS/MutationTier.ts`, `~/.claude/LIFEOS/TOOLS/MemoryWriter.ts`, `~/.claude/LIFEOS/TOOLS/MemoryRestore.ts`, `~/.claude/hooks/MemoryDeltaSurface.hook.ts`, `~/.claude/hooks/MemoryHealthGate.hook.ts`, `~/.claude/LIFEOS/USER/CONFIG/memory-review.json`, `~/.claude/LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` (§ Curation, not appending; § Data-loss guard)
- RS.GE: `packages/memory/src/corrections.ts`, `packages/memory/src/feedback.ts`, `packages/memory/src/notes.ts`, `packages/db/migrations/0007_correction_provenance.sql`, `ISA.md` (ISC-18 closed, ISC-19 open), `test/memory-corrections.test.ts`
- Claude Code Stop hook input (`transcript_path`, `last_assistant_message`, `stop_hook_active`): https://code.claude.com/docs/en/hooks
- Anthropic memory tool guidance (sensitive data, size caps, expiry): https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool

---

<a id="d19"></a>
## D19 · How "done" is decided

**The question:** What has to be true, and shown, before the system may say a piece of work is finished?
**Where the course meets it:** steps 29 to 35 (also 19 and 63) · **LifeOS today:** claims with probes in an ISA, a Stop hook that blocks "done" when the transcript holds no evidence, and a read-only second agent (`~/.claude/LIFEOS/DOCUMENTATION/ISA/ISAFormat.md`, `~/.claude/hooks/VerificationGate.hook.ts`, `~/.claude/agents/Max.md`) · **RS.GE today:** `ISA.md` at the repo root (`progress: 19/37`; the course row says 18/37), `bun test` over 75-plus test files, a second computation that shares no code, and an approval token that exists only if the hash of what was shown equals the hash of what is now (`packages/second-check/src/check.ts`, `packages/review/src/approve.ts`)

**In kid words:** "I finished my homework" is a claim. Done is when the teacher can see the finished page. The options are different teachers: a checklist, a robot marker, a gatekeeper who reads your diary, a second student, a hundred re-tries, or a human.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. Claims with probes (ISA) | One file; each claim names the command that would prove it false | "Done" is written before the work; anyone can rerun the probe | Good claims are hard to write; a probe can be wrong | Every piece of work, both systems |
| B. Tests and CI | `bun test`, typecheck, scripts that exit 1 | Cheap, repeatable, catches regressions | Tests prove the code, not the idea; green is not correct | Code with a stable contract |
| C. A Stop-hook gate | A hook reads the last message and the transcript; blocks a claim without evidence | Works even when the model is sure; rewording does not pass it | False positives; fail-open by design; sees only tool calls | A personal system where the model reports to you |
| D. A second agent | A fresh-context reviewer that never built the thing | Finds what the builder cannot see | Tokens; fooled by a brief that names the expected answer | High-stakes closes; audits |
| E. Evals, pass^k | Run the same case k times; all k must pass | Measures reliability, not luck | Needs cases and a grader; slow | Behaviour one probe cannot close |
| F. Human review | A person looks and signs | The only proof for taste, law, money | Slow; the human must be told what to look at | Anything irreversible or for strangers |
| G. Evidence by modality | File: read it; command: its output; page: a real browser; number: recompute another way | Stops "curl 200" passing for "the page works" | Tools per modality | Always, as the rule the others apply |

### How each one is built
**A. ISA.** LifeOS `ISAFormat.md` v2.21.0: a claim is `- [ ] ISC-N: <sentence> (probe: <command>)`; frontmatter carries `phase` and `progress: closed/total`; three verifier classes: deterministic (a tool says no), judged (a rubric-bound model), attested (the principal signs a dated verdict). Only deterministic rows may block a gate. RS.GE `ISA.md` has the same shape: features F0 to F14, anti-claims such as ISC-8 and ISC-20, a `## Verification` log naming the evidence that closed each claim, and `## Remaining Work` listing what waits on Boris.
**B. Tests.** RS.GE `package.json`: `"test": "bun test"`, `"typecheck": "bun x tsc --noEmit"`, plus scripts that exit 1 on a finding (`secret-scan`, `check:declarations`). `test/second-check-mutation.test.ts` corrupts a line and asserts the check catches it; `test/second-check-property.test.ts` runs 1,000 generated filings through both paths.
**C. Stop gate.** `hooks.json` registers `StopGates.hook.ts` on `Stop`; it runs FormatGate, VerificationGate, ISACloseGate, ISAFoldGate, ISAGate, DeployRegistrationGate, WritingGate, and the first `decision: "block"` wins. `VerificationGate.hook.ts` blocks only if all hold: not a recovery pass (`stop_hook_active`), a claim of a blocking type survives the negation and question guards, the transcript shows this turn did mutating work of that type, the required evidence is absent (for a web claim: a browser probe after the deploy, read by `hooks/lib/transcript-evidence.ts`), and no subagent ran. Every decision goes to `MEMORY/OBSERVABILITY/verification-gate.jsonl`; any error fails open. `ISACloseGate.hook.ts` blocks once when "done" is claimed and the ISA has not been touched for 10 tool calls.
**D. Second agent.** `~/.claude/agents/Max.md` (Edit and Write denied at the permission layer) and `Forge.md` in AUDIT mode. `LIFEOS/RULES/Verification.md` § Briefing a verifier: give the steps and the evidence to return, never the expected result. RS.GE's version is a protocol, not an agent: `packages/second-check` transcribes the tax identities independently, adjusts nothing, and opens a discrepancy carrying both numbers.
**E. Evals.** `~/.claude/skills/Evals/Tools/EvalRunner.ts` runs a suite of `{id, prompt, assert:[...]}` cases for k trials and reports pass^k (all pass) and pass@k (any pass); `Judge.ts` is the model grader, `Assertions.ts` the deterministic one. RS.GE ISC-26 (an eval suite gating release at a stated pass^k) is open: not built yet.
**F. Human review.** RS.GE `approve.ts`: a token is minted only when a named approver presses the button, the page's `shownPayloadHash` equals the hash recomputed now, and the plan is executable; `gate.ts` spends the token before the tool runs, so a replay is refused. Today every real mint refuses (`notExecutable`) because no form has verified control ids; the file says that refusal is the truth about where the project stands.
**G. Evidence by modality.** `LIFEOS/RULES/Verification.md`, seven rules: modality fidelity, an unavailable verifier means DEFER, appearance is pixels not DOM, reproduce before fixing, temporal and cache fidelity, restore-parity before a delete. Boris's two-check rule in `OPERATIONAL_RULES.md` is the number modality.

### Better or worse?
- **For a personal system (myos, LifeOS):** A plus C plus G. The gate is the honest part: the model's sentence is a claim and the transcript is the evidence. D for big closes; E later, when one behaviour keeps slipping.
- **For a product for strangers (the RS.GE Agent):** A plus B plus F, with D as code (the second check). A Stop hook cannot exist in a service with no session to stop, so the gate moved into the approval token. E and a non-Boris user filing a real declaration (ISC-27) are the two open doors before strangers.
- **The trap:** closing a claim on the machinery that would check it. ISC-32 was ticked because the reconciliation script existed while no usage export had ever been run through it. The rule now in `OPERATIONAL_RULES.md`: a claim closes on the fact, and whoever ticks a box moves the progress counter in the same edit.

### Try it (5 min)
Two claims with probes, run before the work exists.
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d19`
2. `printf -- '- [ ] C1: try/d19/report.md exists (probe: test -f try/d19/report.md)\n- [ ] C2: it names the total 1,250 (probe: grep -c "1,250" try/d19/report.md)\n' > try/d19/ISA.md`
3. `test -f try/d19/report.md && echo PASS || echo FAIL` prints FAIL. Good: a probe that fails before the work is a probe that can fail.
4. `printf 'Sales total: 1,250 GEL\n' > try/d19/report.md`, rerun step 3 (PASS), then `grep -c "1,250" try/d19/report.md` (prints 1).
5. Add a third claim whose probe is `echo ok`. It passes with nothing built; you cannot tell if it is done. Delete it.

| Command | What it does |
|---|---|
| `printf -- '...' > file` | writes the claim lines; `--` stops printf reading the leading `-` as an option |
| `test -f path && echo PASS \|\| echo FAIL` | PASS if the file exists, FAIL otherwise |
| `grep -c TEXT file` | counts lines containing TEXT; 0 means the claim is false |

### Sources
- LifeOS: `~/.claude/LIFEOS/DOCUMENTATION/ISA/ISAFormat.md`, `~/.claude/hooks/StopGates.hook.ts`, `~/.claude/hooks/VerificationGate.hook.ts`, `~/.claude/hooks/ISACloseGate.hook.ts`, `~/.claude/hooks/lib/transcript-evidence.ts`, `~/.claude/LIFEOS/RULES/Verification.md`, `~/.claude/agents/Max.md`, `~/.claude/agents/Forge.md`, `~/.claude/skills/Evals/SKILL.md`, `~/.claude/LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` (§ A claim closes on the fact)
- RS.GE: `ISA.md`, `package.json`, `packages/second-check/src/check.ts`, `packages/review/src/approve.ts`, `packages/review/src/gate.ts`, `test/second-check-mutation.test.ts`, `test/second-check-property.test.ts`, `test/portal-approval.test.ts`
- Stop hook blocking (`decision: "block"`, exit code 2, `stop_hook_active`): https://code.claude.com/docs/en/hooks
- pass@k and pass^k, code graders against model graders: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

---

<a id="d20"></a>
## D20 · What gets logged, and where

**The question:** Which events does the system write down, in what shape, where, and what must never appear in them?
**Where the course meets it:** steps 18, 36 · **LifeOS today:** one PostToolUse hook appends a JSON line per tool call to files under `MEMORY/OBSERVABILITY/`, read by Pulse (`~/.claude/hooks/EventLogger.hook.ts`) · **RS.GE today:** an `audit_events` table per tenant with a closed list of event kinds and a key fingerprint, never the key (`packages/core/src/audit.ts`, `config/reference/audit-kinds.json`)

**In kid words:** A ship's logbook. Every hour someone writes what happened. The question is whether the book is a notebook in the captain's drawer, a ledger the port authority can read, or a radio that reports to shore, and what is never written in it (the safe's combination).

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. JSONL files, one line per event | A hook appends `{ts, session_id, tool, ...}`; readers tail the file | No database; `jq` and `tail` are the UI | No index; grows until rotated; per machine | One user, local dashboard |
| B. A database audit table | `insert into audit_events (...)` in the same transaction as the action | Queryable; isolated per tenant; legal record | The DB must be up to log; a payload schema | Money, law, many users |
| C. OpenTelemetry traces and metrics | Spans with `trace_id`, `parent_id`, attributes, exported to a collector | Standard tools; timing across services | A collector to run; content redacted by default | More than one process |
| D. A controlled vocabulary of kinds | Event names are rows in a file; a typo is an error | Every kind is listable; dashboards cannot silently miss one | One more file to edit | Any log a program reads back |
| E. Redaction at the source | Patterns as data; the match is replaced before the line is written | A log can be shared; a leak is caught at write time | False positives; patterns age | Every log that leaves the machine |
| F. Handles, not values | A fingerprint, a path hash, a length | Nothing to redact later | Discipline in every writer | Products |

### How each one is built
**A. JSONL.** `hooks.json` registers `EventLogger.hook.ts` on `PostToolUse` (catch-all, async, 5 s timeout), `PostToolUseFailure`, `ConfigChange` and `StopFailure`. It dispatches on `hook_event_name`: tool activity to `MEMORY/OBSERVABILITY/tool-activity.jsonl`, failures to `tool-failures.jsonl`, config diffs to `config-changes.jsonl`, skill runs to `MEMORY/SKILLS/execution.jsonl`. A line carries `session_id`, `tool_name`, truncated input, a git snapshot (`head`, `dirty`) for write tools, and `agent_id` when a subagent made the call. `MEMORY/OBSERVABILITY/` holds some 30 JSONL streams today (`verification-gate.jsonl`, `memory-writes.jsonl`, `spend-audit.jsonl`, ...). Pulse reads the last 100 or 50 lines per source at `localhost:31337/api/events/recent`. The doc says the files are not auto-rotated; `MemoryHealthCheck.ts` warns at 256 MiB or 30 days.
**B. Audit table.** RS.GE migration `0003`:
```sql
create table audit_events (
  id uuid primary key, tenant_id uuid not null references tenants(id),
  kind text not null references audit_event_kinds(code),
  payload jsonb not null default '{}', model_id text, key_fingerprint text,
  prompt_version text, rules_version text, created_at timestamptz not null default now());
```
`audit(tenantId, kind, payload, extra)` in `packages/core/src/audit.ts` is the one function everything calls; `postgresAuditSink` writes inside `withTenant`, so row-level security applies to the log too; `recordingAuditSink` is the in-memory sink tests use. Every event says which model, which key (as a fingerprint), which prompt version and which rules version produced it.
**C. OpenTelemetry.** Claude Code itself can export: `CLAUDE_CODE_ENABLE_TELEMETRY=1`, `OTEL_METRICS_EXPORTER=otlp`, `OTEL_LOGS_EXPORTER=otlp`; events `claude_code.user_prompt` and `claude_code.tool_result`; metrics `claude_code.token.usage` and `claude_code.cost.usage`. Prompt text is redacted unless `OTEL_LOG_USER_PROMPTS=1`; tool arguments unless `OTEL_LOG_TOOL_DETAILS`. Neither LifeOS nor RS.GE uses it today.
**D. Vocabulary.** `config/reference/audit-kinds.json` lists `tool.allowed`, `tool.refused`, `approval.minted`, `model.call`, `memory.command`, `memory.rejected`, `memory.corrected`, ... with Georgian and English labels; `assertAuditKind()` throws on an unknown kind so a typo cannot invent a new event type.
**E. Redaction as data.** `config/secret-scan.json`: 12 rules (Anthropic, OpenAI, Google, AWS keys, PEM blocks, JWTs, connection-string passwords, rs.ge credential assignments) plus an allowlist where every exception carries `why_en`. `scanText()` in `packages/core/src/secret-patterns.ts` replaces the match with `[rule:N chars]` before anything is printed. The same list guards memory notes (`secretGuard()` in `notes.ts`) and pasted keys (`key-probe.ts`): one answer, not three. `scripts/secret-scan.ts` exits 1 on any finding. LifeOS's equivalents are `LIFEOS/TOOLS/SecretScan.ts` (wraps TruffleHog, 700-plus credential types) and the `<private>...</private>` span stripping in Cortex.
**F. Handles.** `fingerprintKey()` in `model-client.ts` stores a hash prefix of a tenant key; `memory-handler.ts` (line 252) logs a rejected path as a fingerprint because the raw text may be hostile; Atlas never stores a credential value (`AtlasSystem.md`, anti-claim A1).

### Better or worse?
- **For a personal system (myos, LifeOS):** A plus D, and E before any line leaves the machine. Never log a whole transcript; the harness already keeps it. C only when there is a second process to correlate.
- **For a product for strangers (the RS.GE Agent):** B plus D plus F, with E as the release gate. The log is a legal obligation (an access log for every read of taxpayer data, per the ISA constraints) and evidence in a dispute, so it must carry versions. ISC-25 (scanner exits 0 and a log grep shows only redacted markers) is still open in `ISA.md`.
- **The trap:** a log that stores the shape wrong. With postgres.js, `${JSON.stringify(x)}::jsonb` stores a jsonb string containing JSON, so `payload->>'tool'` returns NULL; RS.GE hit it in `audit_events` on 2026-09-17 and now guards it in `test/jsonb-shape.test.ts` (`tx.json(x)` is the fix). Read one row back through a different path than the writer before trusting a log.

### Try it (5 min)
Write two events, read them back, redact one before it lands.
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d20`
2. `printf '{"ts":"%s","kind":"tool.allowed","tool":"Read","path":"USER/TELOS.md"}\n' "$(date -Is)" >> try/d20/events.jsonl`
3. `printf '{"ts":"%s","kind":"tool.refused","tool":"Bash","cmd":"psql password=hunter2 -h db"}\n' "$(date -Is)" | sed -E 's/password=[^ "]+/password=[REDACTED]/' >> try/d20/events.jsonl`
4. `tail -n 2 try/d20/events.jsonl | jq .` shows both lines, the second with `[REDACTED]`.
5. `jq -r .kind try/d20/events.jsonl | sort | uniq -c` counts events per kind: the start of a dashboard. Append a line with kind `tool.alowed` (a typo) and watch the count split silently. That is why option D exists.

| Command | What it does |
|---|---|
| `date -Is` | prints the current time in ISO form |
| `printf ... >> file` | appends one JSON line; `>>` never overwrites |
| `sed -E 's/password=[^ "]+/password=[REDACTED]/'` | replaces the password value before the line reaches the file |
| `tail -n 2 file \| jq .` | pretty-prints the last two lines |
| `jq -r .kind file \| sort \| uniq -c` | counts how many lines carry each kind |

### Sources
- LifeOS: `~/.claude/hooks/EventLogger.hook.ts`, `~/.claude/hooks/hooks.json`, `~/.claude/LIFEOS/DOCUMENTATION/Observability/ObservabilitySystem.md`, `~/.claude/LIFEOS/MEMORY/OBSERVABILITY/` (stream names only), `~/.claude/LIFEOS/TOOLS/SecretScan.ts`, `~/.claude/LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` (privacy boundary), `~/.claude/LIFEOS/DOCUMENTATION/Atlas/AtlasSystem.md`
- RS.GE: `packages/core/src/audit.ts`, `packages/db/migrations/0003_rules_audit_billing_secrets.sql`, `packages/db/src/repositories.ts` (`asJsonb`, `insertAuditEvent`), `config/reference/audit-kinds.json`, `packages/core/src/secret-patterns.ts`, `config/secret-scan.json`, `scripts/secret-scan.ts`, `packages/core/src/model-client.ts`, `packages/core/src/memory-handler.ts`, `test/jsonb-shape.test.ts`, `ISA.md` (ISC-25 open)
- Claude Code telemetry (OTel env vars, redaction by default): https://code.claude.com/docs/en/monitoring-usage
- Traces and spans: https://opentelemetry.io/docs/concepts/signals/traces/
- gitleaks (TOML rules, allowlists, pre-commit): https://github.com/gitleaks/gitleaks

---

<a id="d21"></a>
## D21 · How installs and updates stay safe

**The question:** When a new version of the system arrives, how do you apply it without losing anything the user wrote?
**Where the course meets it:** steps 43 to 46 (also 5 and 42) · **LifeOS today:** dry-run tools that overlay only system-owned paths, never delete, back up the two hand-edited files and write VERSION last; settings are regenerated each session from a system file and a user overlay (`~/.claude/skills/LifeOS/Tools/OverlaySystem.ts`, `~/.claude/LIFEOS/TOOLS/MergeSettings.ts`) · **RS.GE today:** numbered SQL migrations applied once with a checksum; an edited applied migration is a hard stop; reference rows are re-seeded at every boot, added or updated, never deleted (`packages/db/src/migrate.ts`, `packages/db/DB.md`)

**In kid words:** Renovating a house someone lives in. You may replace the pipes you installed; you may not throw away their furniture; and you take a photo of any wall they painted themselves before you repaint it.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. Dry-run by default, `--apply` to change | The tool prints what it would do; a flag mutates | A wrong run costs nothing; the plan can be read first | Two runs per update; people forget the flag | Every installer and updater |
| B. Overlay that never deletes | Copy payload files to the same relative path; only paths the system owns; never delete | User files and forks survive | Dead files linger; a renamed system file leaves its old twin | Updating a tree a person edits |
| C. Full replace | Delete the tree, copy the new one | Always clean; no drift | Destroys everything not in the payload | Containers rebuilt from an image |
| D. Migrations that only add | Numbered files applied once in order, checksum recorded | History is the code; a shared DB cannot diverge | Never edit an applied file | Any schema |
| E. Settings merge: system plus user overlay | Deep-merge two files into the one the harness reads | Update the defaults, keep the overrides | Hand edits to the output vanish next session; arrays replace unless annotated | One config file with two owners |
| F. Backups that include symlink targets | `cp -a` the tree and every folder a symlink points to | A restore is possible | People copy the link, not the target | Before any update |

### How each one is built
**A. Dry-run.** `OverlaySystem.ts`, `InstallSettings.ts` and `DeployCore.ts` mutate only with `--apply`, refuse the author's own source tree (exit 2 unless `--allow-dev`), and print counts: `updated`, `current`, `created`, `failures`. RS.GE `scripts/test-residue.ts` does the same for data: report only, `--remove` to act, never in production, `--only` to scope.
**B. Overlay.** `OverlaySystem.ts` lists what it may touch:
```
SYSTEM_TREES: hooks · skills · agents · LIFEOS/{TOOLS,DOCUMENTATION,ALGORITHM,RULES,PULSE}
SYSTEM_FILES: LIFEOS/LIFEOS_SYSTEM_PROMPT.md (backup first) · CLAUDE.md (backup first)
SKIP_DIRS:    node_modules · .git · MEMORY · USER · out · .next
```
Anything not listed is left alone; absence from the list is the safety property. A file is written only where the payload ships one at the same path; nothing is deleted; `VERSION` is written last and only on a fully successful apply. The backup is real: `~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md.pre-overlay-2026-08-29T12-14-28-349Z.bak` sits beside the live prompt from the 7.40.4 migration.
**C. Full replace.** Used by neither. The closest LifeOS comes is the release build, which clones the tree and deletes USER, MEMORY and private skills before publishing (`ConfigSystem.md`, Shadow Release).
**D. Migrations.** RS.GE `migrate.ts` reads `packages/db/migrations/0001_*.sql` to `0010_*.sql` in order, computes a SHA-256 per file, skips versions already in `schema_migrations`, and throws when a recorded checksum differs from disk: applied migrations are immutable; restore the file and add a new numbered one. Every migration file opens with that sentence. Then `seedReferenceData` copies `config/reference/*.json` into the lookup tables: rows added and updated, never deleted. Flyway does the same with a CRC32 checksum and a `validate` command; Boris's own rule from the 9T outage is `OPERATIONAL_RULES.md` § Flyway migration safety.
**E. Settings merge.** The SessionStart list in `settings.json` runs `SettingsBackport.ts`, then `MergeSettings.ts --system ~/.claude/settings.system.json --user ~/.claude/LIFEOS/USER/CONFIG/settings.user.json --output ~/.claude/settings.json`. Objects merge recursively with system key order kept; scalars and arrays replace, user wins; an array appends only as `{"__merge": "append", "values": [...]}`. The last output is snapshotted at `MEMORY/STATE/settings-merge-snapshot.json` so the backport can tell a hand edit from an unmerged source edit (a three-way diff). `ConfigSystem.md`: manual edits to `settings.json` are overwritten next session. **On this machine that design is not active:** neither `settings.system.json` nor `settings.user.json` exists (checked 2026-09-26), and both tools then exit cleanly without doing anything (`MergeSettings.ts` line 605, `SettingsBackport.ts` line 313). So `settings.json` is edited directly and is the only copy: back it up before every edit. Install-time placement is additive only (`InstallSettings.ts`: absent keys added, existing values never touched, `$HOME` expanded because the harness does not expand env values).
**F. Backups.** On this machine `~/.claude/LIFEOS/USER -> /home/dmin/.config/LIFEOS/USER` and `~/.claude/LIFEOS/MEMORY -> /home/dmin/.config/LIFEOS/USER/MEMORY` (`readlink -f`, 2026-09-25). A `cp -a ~/.claude` copies two links and zero memory files. `OPERATIONAL_RULES.md` § Backup rule: include `~/.config/LIFEOS` explicitly.

### Better or worse?
- **For a personal system (myos, LifeOS):** A plus B plus E plus F. The zones from step 5 are what make B possible: an overlay is only safe when "what the system owns" is a list. Never C on a tree with a USER folder in it.
- **For a product for strangers (the RS.GE Agent):** D for the schema, product config as JSON seeded into tables (`DB.md`), tenant data only in `tenant_*` rows. The user never runs an installer (ISC-34, zero terminal steps, still open). The update path is a deploy plus `migrate()` at boot in `apps/agent/src/index.ts`.
- **The trap:** editing the file that gets regenerated, or the migration that already ran. Both look like they worked until the next session or the next boot, and both are silent for hours.

### Try it (5 min)
Prove that a backup of a symlink is not a backup, then dry-run an overlay by hand.
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d21/real try/d21/tree && printf 'my memory\n' > try/d21/real/MEMORY.md && ln -sfn ../real try/d21/tree/MEMORY`
2. `cp -a try/d21/tree try/d21/backup && ls -la try/d21/backup/` shows `MEMORY -> ../real`: a link, no file. If `real/` were lost, the backup would hold nothing.
3. `mkdir -p try/d21/payload/hooks try/d21/install/hooks && printf 'v2\n' > try/d21/payload/hooks/a.ts && printf 'v1\n' > try/d21/install/hooks/a.ts && printf 'mine\n' > try/d21/install/hooks/mine.ts`
4. `rsync -a --dry-run --itemize-changes try/d21/payload/ try/d21/install/` lists `hooks/a.ts` as changed and says nothing about `mine.ts`: an overlay that never deletes, previewed.
5. Add `--delete` to step 4 and see `*deleting hooks/mine.ts` appear in the preview. That flag is option C. Do not run it without `--dry-run`.

| Command | What it does |
|---|---|
| `ln -sfn TARGET LINK` | makes a symbolic link (a pointer, not a copy) |
| `cp -a SRC DST` | copies, keeping links as links |
| `ls -la DIR` | shows `name -> target` for links |
| `rsync -a --dry-run --itemize-changes SRC/ DST/` | prints what would change; changes nothing |
| `--delete` | would also remove files in DST that SRC lacks (a full replace) |

### Sources
- LifeOS: `~/.claude/skills/LifeOS/Tools/OverlaySystem.ts`, `~/.claude/skills/LifeOS/Tools/InstallEngine.ts`, `~/.claude/skills/LifeOS/Tools/InstallSettings.ts`, `~/.claude/skills/LifeOS/Workflows/Update.md`, `~/.claude/LIFEOS/TOOLS/MergeSettings.ts`, `~/.claude/hooks/hooks.json` (SessionStart), `~/.claude/LIFEOS/DOCUMENTATION/Config/ConfigSystem.md`, `~/.claude/LIFEOS/DOCUMENTATION/SystemUserBoundary.md`, `~/.claude/LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` (§ Backup rule, § Flyway migration safety), `~/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md.pre-overlay-2026-08-29T12-14-28-349Z.bak`
- RS.GE: `packages/db/src/migrate.ts`, `packages/db/migrations/` (`0001` to `0010`), `packages/db/DB.md`, `scripts/test-residue.ts`, `apps/agent/src/index.ts`, `ISA.md` (ISC-34 open)
- Flyway validate (checksum stored at execution; a changed applied migration fails validation): https://documentation.red-gate.com/flyway/reference/commands/validate

---

<a id="d22"></a>
## D22 · Knowing what you own and what changed

**The question:** How does the system know what exists (assets, versions, dependencies) and notice when something drifted without anyone telling it?
**Where the course meets it:** steps 51 to 54 · **LifeOS today:** Atlas, a SQLite asset graph filled by collectors and queried with `owns` and `blast`; Ledger, a Major.Feature.Patch version surface with a registry and a 16-check integrity tool; a drift nag hook that cannot fire here (`~/.claude/LIFEOS/ATLAS/Atlas.ts`, `~/.claude/LIFEOS/DOCUMENTATION/Ledger/LedgerSystem.md`, `~/.claude/hooks/VersionDrift.hook.ts`) · **RS.GE today:** foreign keys between `tenant_*` tables, a generator whose `--check` fails when a committed declaration version drifted from its amendment chain, and `schema_migrations` with checksums (`scripts/build-declaration-versions.ts`, `packages/db/src/migrate.ts`)

**In kid words:** An inventory of your toys and a diary of what changed. One way is a map with strings between the toys ("this one needs that one"); another is numbered stickers on every box; a third is a robot that compares the shelf with the list every night.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. Asset graph from collectors | Each collector pulls truth from its authority and stamps what it saw; assets expire when nobody sees them | "What breaks if I delete X" is a query; drift is visible | Collectors to write and keep; a missing edge type makes "orphan" lie | Many kinds of things across providers |
| B. Relational foreign keys | `filing_lines.filing_id references filings(id)`; the DB refuses an orphan | Free with the schema; always consistent | Only inside one database | One product's own data |
| C. A version and integrity ledger | Every component carries a version; a registry records each change; a tool checks references and wiring | "What changed this week" answerable; broken links found before users | Bookkeeping; rots without a nag | A system with many moving files |
| D. Git alone | Tags and log | Already there; diffs are exact | Knows files, not meaning; needs the tree to be a repo | Small trees; the base under C |
| E. Generate, then `--check` | Derived files are committed; a script regenerates in memory and fails on any difference | The authored delta and the derived file cannot disagree | Must run somewhere (test, CI) | Anything generated from data |
| F. Checksums as the ledger | Hash each file at apply time; compare later | Edits and tampering are caught | Says only "changed", not what | Migrations, manifests |

### How each one is built
**A. Atlas.** `LIFEOS/ATLAS/` holds `Atlas.ts`, `Store.ts` and collectors `Cloudflare, Github, Projects, InfraInventory, Launchd, Systemd, Gear, Secrets`. The database is `~/.local/state/lifeos/atlas/atlas.db`, outside both git repos. Each asset carries per-collector `source_observation` rows; a sweep marks observations stale only after a successful full run, so a rate-limited partial run expires nothing. `hooks/AtlasEventCapture.hook.ts` (PostToolUse on Bash, Write, Edit) drops hints that trigger a targeted re-collect; hints never write facts. Commands: `sync`, `tick`, `status`, `owns <key>`, `blast <key>`, `exposed <key>`, `stale`, `unregistered`, `sql`, `export`. Modeled on Cartography (Python, Neo4j, 30-plus sources) with SQLite in place of Neo4j.
**B. Foreign keys.** RS.GE `filing_lines` carries both `filing_id` and `tenant_id` under a composite foreign key so the two can never disagree; `corrections` references `declaration_types`, `memory_target_kinds` and `fact_sources`; `profile_facts.correction_id` references `corrections`. "What depends on this row" is the reverse walk of those keys, and `on delete cascade` on `tenant_id` says what a tenant deletion takes with it.
**C. Ledger.** `LedgerSystem.md` v2.1.2: every live version is `Major.Feature.Patch` (the middle number is Feature, not "minor"); the umbrella is `LIFEOS/VERSION` (`7.40.4`); component lines are `@version` in each hook and `version:` in each skill and doc; the registry is `MEMORY/SYSTEMUPDATES/YYYY/MM/*.md` plus generated `CHANGELOG.md` and `index.json`; `deploys.jsonl` records every estate deploy (`LIFEOS/TOOLS/LedgerDeployEvent.ts`). `LIFEOS/TOOLS/IntegrityCheck.ts` runs 16 checks (references resolve, hook registration matches the hooks folder, `@`-imports resolve, permission-rule shape, ...) and stamps `MEMORY/STATE/integrity/last-run.json`; `hooks/IntegrityCheck.hook.ts` and `DocIntegrity.hook.ts` run at SessionEnd. The bump and classify tools live in a private `_` skill and are not in the public payload.
**D. Git.** `VersionDrift.hook.ts` (UserPromptSubmit) compares the last `v*` tag with `LIFEOS/VERSION` and nags at 10 changed core files, or any drift once the tag is older than 48 h. Its first step is `git -C ~/.claude tag`; on this machine `~/.claude` is not a git repository (checked 2026-09-25), so the hook returns before it can ever nag. A drift tooth built on git needs the tree to be a repo.
**E. Generate and check.** RS.GE authors `config/declarations/amendments/{vat,withholding-income}.amendments.json` (each change: `op`, `path`, `why_en`, `order`) and generates `vat.v1` to `vat.v5` and `withholding-income.v1` to `v11`, committed. `bun run check:declarations` regenerates in memory and exits non-zero on drift; `test/declaration-amendments.test.ts` does the same in the suite. Order №996 has 121 amendments, 16 relevant, 11 commencement dates: that is why the deltas are the authored thing.
**F. Checksums.** `schema_migrations(version, filename, checksum)`; `audit_events.prompt_version` and `rules_version` record which version produced each event, so a past filing can be re-derived.

### Better or worse?
- **For a personal system (myos, LifeOS):** C on top of D, with a nag that can actually fire; A when you own things in more than one place (domains, workers, repos). Step 52's SQLite graph is a weekend; keep the collectors few.
- **For a product for strangers (the RS.GE Agent):** B plus E plus F. The product owns nothing on a user's behalf, so there is no asset graph; the graph it needs is the schema. Versions matter most on the data that decides money: rule rows and declaration definitions carry `valid_from`, and every audit row says which version it used.
- **The trap:** an absence metric on incomplete edges. Atlas once called most workers "orphaned" because the collector saw custom domains but not routes, service bindings or crons; the doc's rule: never say unused until every way a thing can be connected has been enumerated.

### Try it (5 min)
A checksum manifest that catches drift, and a blast-radius query by text.
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d22 && printf '0.1.0\n' > try/d22/VERSION`
2. `sha256sum CLAUDE.md SYSTEM_PROMPT.md USER/*.md > try/d22/MANIFEST.sha256`
3. `sha256sum -c try/d22/MANIFEST.sha256` prints `OK` per file.
4. Append one blank line to `USER/TELOS.md` in an editor, rerun step 3 and see `FAILED`; remove the blank line and rerun until every line reads `OK`.
5. `grep -rn "TELOS.md" --include=*.md --include=*.json --include=*.ts . | grep -v try/` lists every file that names `TELOS.md`: the text version of `atlas blast`.

| Command | What it does |
|---|---|
| `sha256sum FILE... > MANIFEST` | writes one hash per file |
| `sha256sum -c MANIFEST` | recomputes and reports OK or FAILED per file |
| `grep -rn PATTERN --include=*.md .` | shows file and line of every match in the named file types |
| `grep -v try/` | hides the scratch folder from the list |

### Sources
- LifeOS: `~/.claude/LIFEOS/DOCUMENTATION/Atlas/AtlasSystem.md`, `~/.claude/LIFEOS/ATLAS/` (Atlas.ts, Store.ts, collectors/), `~/.claude/hooks/AtlasEventCapture.hook.ts`, `~/.claude/LIFEOS/DOCUMENTATION/Ledger/LedgerSystem.md`, `~/.claude/LIFEOS/VERSION`, `~/.claude/hooks/VersionDrift.hook.ts`, `~/.claude/hooks/IntegrityCheck.hook.ts`, `~/.claude/hooks/DocIntegrity.hook.ts`, `~/.claude/LIFEOS/TOOLS/IntegrityCheck.ts`, `~/.claude/LIFEOS/TOOLS/LedgerDeployEvent.ts`
- RS.GE: `scripts/build-declaration-versions.ts`, `config/declarations/`, `config/declarations/amendments/`, `test/declaration-amendments.test.ts`, `packages/db/src/migrate.ts`, `packages/db/migrations/0002_profile_and_filings.sql`, `packages/db/migrations/0003_rules_audit_billing_secrets.sql`, `packages/db/migrations/0006_memory.sql`, `packages/db/DB.md`
- Cartography (Neo4j asset graph, 30-plus platforms): https://github.com/cartography-cncf/cartography (first-seen and last-updated semantics not verified on the README)
- Semantic versioning (MAJOR incompatible, MINOR additive, PATCH fixes): https://semver.org/

---

<a id="d23"></a>
## D23 · Capture first, route later

**The question:** When something new arrives (a link, a thought, a correction, a checklist mark), do you decide where it belongs the moment it arrives, or save it first and decide later?
**Where the course meets it:** steps 55 to 59 · **LifeOS today:** Synapse, the input router: capture, then the amber ledger (append-only), then a grade against TELOS, then a route to one of ten destinations; documented in `~/.claude/LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md`, but no `LIFEOS/SYNAPSE/` exists on this install (checked 2026-09-25); the Learning Router in Algorithm claim 12 and the memory proposal queue are the parts that run here · **RS.GE today:** a document is quarantined at intake and only mapped columns become candidates (`packages/interview/src/documents.ts`); a correction is stored as a row, then routed by target kind to a tenant fact, a period proposal, or operator feedback (`packages/memory/src/corrections.ts`, `packages/memory/src/feedback.ts`)

**In kid words:** A letterbox. Everything that comes through the door lands in the box first, unread. Later you sort: bills to the desk, postcards to the fridge, junk to the bin. Nothing is lost because it was sorted wrong at the door.

### The options
| Option | How it is built | Gains | Costs | Best when |
|---|---|---|---|---|
| A. Capture, grade, route | A write-ahead journal, then a grader scores against your goals, then a router files it | Nothing lost; grading can change later; one contract for all inputs | Three stages to build; a backlog can grow | Many input kinds, one person |
| B. Direct filing | The thing that receives the input writes it to its final home | Simplest; no queue | A wrong home is a lost item; every input needs its own code | One input kind with an obvious home |
| C. A human-triaged inbox | Append to one file or queue; a person sorts on a cadence | Zero automation risk; the person learns the pattern | The inbox rots if the cadence slips | Early, before the categories are known |
| D. The learning router | A correction is classified by what it is (knowledge, rule, gotcha, state, identity) and goes where that class lives | Fixes land where they will be read next time | Needs a closed class list; misroutes are silent | Every correction, both systems |
| E. Quarantine at intake | Read only the fields you were told to; keep the rest as text, never parsed | Hostile input cannot act; provenance free | Some useful data stays unread | Anything a stranger can send |

### How each one is built
**A. Synapse.** `SynapseSystem.md`: every input becomes one record `{source, external_id, url or content, captured_at, content_kind, privacy_class}`; it hits the amber ledger first, unconditionally (an append-only D1 table, dedup on URL plus content hash); grade and route run afterwards, off the capture path; a `personal` record never crosses to cloud storage without a rule. Routes: `knowledge | learning | help_understand | project_integration | tech_upgrade | telos_modification | work_item | reminder | blog_seed | none`. The maintainer's workers and the ledger are not in the public payload, so on this machine the doc is the whole of it.
**B. Direct filing.** LifeOS hooks do this for machine events: `EventLogger` writes straight to `tool-activity.jsonl`; `SatisfactionCapture.hook.ts` writes straight to `LEARNING/SIGNALS/ratings.jsonl` and the Upgrades queue. Right when the event has one reader.
**C. Human inbox.** Boris's new checklist mechanism is this pattern with a curator in the middle: a `<!-- ck -->` mark on a course line is the capture (cheap, in place, nothing else to open); a script sweeps the marks into candidates; the assistant curates; the accepted ones are filed into `CHECKLIST.md`. As of 2026-09-25 no `CHECKLIST.md` and no `<!-- ck -->` mark exists under `Docs/Learning/AI/PAI/` (checked), so it is described here from the brief, not from disk. The memory proposal queue is the same shape inside LifeOS: `pending-proposals.jsonl`, then Pulse or the 🧠 line, then `ProposalDecide.ts` accept, reject or edit.
**D. Learning router.** `LIFEOS/ALGORITHM/v8.20.2.md` claim 12: `knowledge` to KNOWLEDGE, `incident` to `MEMORY/LEARNING/INCIDENTS/INC-<date>-<slug>.md`, `rule` to CLAUDE.md or OPERATIONAL_RULES, `gotcha` to the skill, `state` to PROJECTS.md, `business` to BUSINESS/, and `identity`, `doctrine`, `hook`, `permission` surface to the principal, never auto-applied. RS.GE's router is `recordCorrection()`: target kind `context` opens a new tenant fact; target kind `line` stays a period row that `prefill.ts` proposes for that period only; a correction about the product ("the rate is 3%, not 1%") goes to `product_feedback` for the operator and changes no rule row, because a rate is right or wrong for every tenant at once.
**E. Quarantine.** `documents.ts`: only a column the mapping file names is read; every other cell is a `QuarantinedCell` shown as text; a mapped cell still passes `validateAnswer`; nothing from a document reaches `model.ts`, and the prompt log makes that a testable absence (`test/interview-document-intake.test.ts`).

### Better or worse?
- **For a personal system (myos, LifeOS):** C first, then A. Start with one inbox file and a weekly sort; write the router when the same category has appeared three times. Build D early: corrections are the highest-value input and the one you most want to land where it will be read.
- **For a product for strangers (the RS.GE Agent):** E at every door, then D with a closed list. No free-form inbox: a stranger's input is data, and only typed rows with provenance route anywhere. Product feedback is the operator's inbox and is inert by construction.
- **The trap:** grading at the door. A capture dropped because the grader said "not relevant" is gone; the amber ledger exists so that only routing is conditional on the score, never preservation. The second trap is an inbox nobody empties; Synapse names resurfacing as part of the contract for that reason.

### Try it (5 min)
The checklist capture by hand: mark, sweep, file.
1. `cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/build/myos && mkdir -p try/d23`
2. `printf '# Notes\n- read the migration before running it <!-- ck -->\n- lunch\n- never trust a green test alone <!-- ck -->\n' > try/d23/notes.md`
3. `grep -n "<!-- ck -->" try/d23/notes.md | sed -E 's/ *<!-- ck -->//' >> try/d23/inbox.txt` captures the marked lines with their line numbers, without touching the source.
4. `cat try/d23/inbox.txt` shows two candidates. Decide by hand: `sed -n '1p' try/d23/inbox.txt | sed -E 's/^[0-9]+:- /- [ ] /' >> try/d23/CHECKLIST.md` files the first one.
5. Rerun step 3 and look at the inbox: duplicates. That is why Synapse dedups on identity. Put `| sort -u` before the file in step 3 to fix it.

| Command | What it does |
|---|---|
| `grep -n PATTERN file` | prints matching lines with their line numbers |
| `sed -E 's/ *<!-- ck -->//'` | strips the mark from the captured copy |
| `>> inbox.txt` | appends; the source file is never edited |
| `sed -n '1p' file` | prints only line 1 |
| `sort -u` | drops exact duplicate lines |

### Sources
- LifeOS: `~/.claude/LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md`, `~/.claude/LIFEOS/ALGORITHM/v8.20.2.md` (claim 12, Learning Router), `~/.claude/LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` (proposal queue), `~/.claude/LIFEOS/TOOLS/ProposalDecide.ts`, `~/.claude/hooks/SatisfactionCapture.hook.ts`, `~/.claude/hooks/EventLogger.hook.ts`; absence of `~/.claude/LIFEOS/SYNAPSE/` checked 2026-09-25
- RS.GE: `packages/interview/src/documents.ts`, `packages/memory/src/corrections.ts`, `packages/memory/src/feedback.ts`, `packages/memory/src/prefill.ts`, `packages/db/migrations/0006_memory.sql` (`product_feedback`), `test/interview-document-intake.test.ts`
- Boris's checklist mechanism: from the brief of 2026-09-25; not yet on disk under `/mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI/`
- GTD's five steps (capture, clarify, organize, reflect, engage): https://gettingthingsdone.com/what-is-gtd/
- Anthropic on untrusted content (keep it in `tool_result` blocks, treat as data): https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks (fetched 2026-09-24, research note 04)
