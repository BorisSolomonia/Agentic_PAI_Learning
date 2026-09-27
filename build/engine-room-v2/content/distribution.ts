import type { Section } from './schema';

/** Part 5 — the distribution agent. 9T is the assumed organisation (flagged in ENGINE-ROOM-GAPS.md). */
export const part5: Section = {
  id: 'p5',
  number: 5,
  title: 'The distribution agent',
  subtitle: 'What an agent for 9T would be, where it overlaps a personal LifeOS, where it does not, and four ways to build it, scored.',
  kind: 'distribution',
  body: `
> **Assumption, stated once:** "my distribution organisation" is **9T**, the Georgian trading company behind 9T ERP: sellers, customers, debtors, products, a warehouse, delivery and vehicles. If you meant another business, the method on this page does not change; the rows do.

## Who would use it, and for what

A personal LifeOS has one user, one identity, one terminal. A company agent has none of those. Start from the people:

| User | What they need from an agent | Data it touches |
|---|---|---|
| **Owner** | A morning brief: cash position, receivables due, exceptions overnight, which seller is behind; "why is Friday revenue down" answered with evidence | ERP Postgres (GL, sales, debtors, cash flow) |
| **Sellers** (sales reps) | Customer notes before a visit; debtor follow-up scripts; order capture by voice or text; "what did this shop buy last month" | customers, sales lines, AR ledger |
| **Warehouse** | Stock check; pick lists; "which orders can ship today"; discrepancy flags | products, stock, orders |
| **Accountant** | Bank statement reconciliation; RS.ge waybill matching; month-end close checks; "which invoices have no source document" | bank feeds (TBC, BOG), RS.ge, GL |
| **Drivers** | Route for today; proof-of-delivery capture; "this customer's gate is closed" | delivery, vehicles |

Five kinds of user, on phones and desktops, at the same time, with different rights. That single sentence rules out copying LifeOS as it stands.

## The overlap map, box by box

Every LifeOS idea, judged for 9T. **Same** means the mechanism transfers with a rename. **Different** means the shape must change. **Drop** means it is personal or infrastructure that a company agent does not want.

| LifeOS idea | In a personal LifeOS | In the 9T agent | Verdict |
|---|---|---|---|
| Context file | who Boris is | what 9T is: products, regions, price rules, seasons, who may approve what | **Same mechanism, different file** (\`COMPANY.md\`, not \`IDENTITY.md\`) |
| [[TELOS]] | life goals with dates | company KPIs with numbers: DSO under 12 days, gross margin, fill rate, seller targets | **Same idea, must be numeric and per-period** |
| Split constitution | rules in the [[system prompt]], pointers in CLAUDE.md | the same split: money rules in the system prompt, data map in the routing table | **Same** |
| [[skill]]s | 75 personal skills | about eight business skills: debtor call, stock check, route, daily brief, reconcile statement, waybill match, order capture, exception report | **Same format, far fewer** |
| [[hook]]s as guards | 68, mostly about the assistant's own behaviour | about six, all about money and writes: no GL write without a matching source row; no price change without a valid-from date; no customer delete, ever | **Same mechanism, different targets** |
| Advisory hooks | format contract, nudges, drift | one or two: "this customer is on credit hold", "this statement was already imported" | **Same mechanism, mostly dropped** |
| [[memory]] | one person's facts in two markdown files | per-customer notes shared across five sellers, with who-wrote-what and when | **Different: multi-user, must be a database table, not a file** |
| Verification / [[ISA]] | evidence before "done" | reconciliation controls: sum of parts equals declared total, two independent checks on every displayed number | **Identical, and you already build this in 9T ERP** |
| Zone boundary | SYSTEM vs USER | product code vs tenant configuration (9T's rules are config, the engine is code) | **Same principle** |
| Event log | tool-activity.jsonl | an audit trail: who asked what, what the agent read, what it wrote | **Same, and legally required for money** |
| Pulse, voice, Kitty tabs, statusline, spinner | central to the daily feel | irrelevant; users are on phones | **Drop** |
| Atlas, Ledger, Doctor | what Boris owns; versioning; health | a small health check is worth keeping; the rest is LifeOS maintaining itself | **Drop, keep a health probe** |
| Arbol, Feed, Synapse, Conduit | cloud pipelines and capture | scheduled jobs (nightly reconciliation, morning brief) | **Different: a scheduler, not a personal capture pipeline** |
| Single principal, terminal sessions | the whole design | many users, roles, auth, a chat or API surface, scheduled runs with no human present | **Different shape entirely** |

Count the verdicts: seven **Same**, five **Different**, three **Drop**. The mechanisms transfer; the shell does not.

## Where LifeOS is too large

Be blunt about it, because a client will be:

- **68 hooks** exist to govern one assistant's behaviour toward one person. A company agent needs six, and they are about money.
- **The memory system** assumes one person whose facts fit in two files. Five sellers writing notes about the same customer need a table with an author column, not a markdown file with a cap.
- **Pulse, voice, tabs, the status line, the banner, Atlas, the installer** are LifeOS looking after itself. They are most of the code.
- **The single-principal assumption** is structural: identity files, TELOS, memory, permissions all assume one human whose word is authority. In a company, authority is a role, not a person.
- **Terminal sessions** are the wrong surface. A seller in a shop needs a phone; the owner needs a message at 7 am without asking.

So: **do not fork LifeOS for 9T.** Take its ideas, not its tree.

## Four ways to build it, scored

Criteria, each 1–5: **Fit** (do the five users get what they need), **Cost** (5 = cheapest to first value), **Ideas kept** (how many of the five transferable ideas survive intact), **Risk** (5 = lowest operational and money risk), **Growth** (does it become the real thing without a rewrite).

| # | Approach | What it is | Fit | Cost | Ideas kept | Risk | Growth | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | **Thin harness inside \`9T_erp\`** | \`CLAUDE.md\` + eight skills + six guard hooks in the repo; the agent helps Boris *build and operate* the ERP from a terminal | 2 | 5 | 5 | 5 | 2 | **19** |
| 2 | **Agent SDK service** | The same skills and guards, run as a service with a chat and API surface, roles, scheduled jobs, memory in Postgres | 5 | 3 | 5 | 4 | 5 | **22** |
| 3 | **Workflow engine + model steps** | Deterministic pipelines (n8n, Temporal or a cron of scripts) with a model only where judgement is needed: nightly reconciliation, the morning brief, exception routing | 3 | 4 | 3 | 5 | 3 | **18** |
| 4 | **Fork LifeOS** | Install LifeOS for 9T and strip what does not fit | 2 | 2 | 5 | 2 | 1 | **12** |

**How to read it.** Option 1 is the cheapest and it is what you should do *this month*: it costs a day, it keeps every transferable idea, and it makes you faster at building 9T. But it is a tool for you, not a product for sellers. Option 2 is the shape that fits the users, and it scores highest because it grows; it costs weeks, not days. Option 3 wins for the scheduled half of the work (reconciliation, briefs) and loses for anything conversational. Option 4 scores lowest on the two criteria that matter most for a company, cost and risk, because the first month would be spent deleting.

## The recommendation

Do them in order, and let each one pay for the next:

1. **Now: option 1.** A \`CLAUDE.md\` in \`9T_erp\`, the six money guards as PreToolUse hooks in that repo's \`.claude/\`, and the first three skills (reconcile statement, debtor list, daily brief). You will use it tomorrow. Every guard you write here is a guard the service in step 2 will reuse unchanged.
2. **When a second user needs it: option 2.** Wrap the same skills and guards in a service with a chat surface for sellers and an API for the ERP. Memory moves from files to a \`customer_notes\` table with an author column. Roles come from the ERP's users.
3. **For the nightly work: option 3, inside option 2.** Reconciliation and the morning brief are pipelines with one judgement step each; run them on a schedule and have the service surface the exceptions.

**Carry exactly five things from LifeOS**, and carry them as shapes: evidence before "done" (your reconciliation controls already are this), hooks as guards (the six money rules), the zone boundary (engine code vs 9T configuration), the skill file format, and the append-only audit log. Leave everything else in \`~/.claude\` where it belongs.

## What the twelve-file tree becomes

\`\`\`
9T_erp/.claude/
├─ CLAUDE.md                 data map: where GL, sales, AR, bank feeds live; the aliases sellers use
├─ SYSTEM_PROMPT.md          money rules: never post without a source row; show discrepancies, never fix them
├─ COMPANY.md                what 9T is (replaces IDENTITY.md)
├─ KPIS.md                   numeric TELOS: DSO, margin, fill rate, per month (replaces TELOS.md)
├─ RULES.md                  approval matrix, credit policy
├─ skills/
│  ├─ reconcile-statement/   bank statement vs GL, discrepancy list
│  ├─ debtor-followup/       overdue list + call script per customer
│  ├─ daily-brief/           cash, receivables, exceptions, one screen
│  └─ waybill-match/         RS.ge waybills vs invoices
├─ hooks/
│  ├─ guard-gl-write.ts      PreToolUse: block a GL write with no source reference
│  ├─ guard-price-change.ts  PreToolUse: block a price without valid-from
│  └─ audit-log.ts           PostToolUse: every read and write, one JSONL line, with the user
├─ ISA.md                    what "the month is closed" means, as claims with probes
└─ settings.json
\`\`\`

Same shape as Part 4. Different nouns. That is the test that you understood Part 4: you can rename every file and say why.
`,
  breakIt: [
    'Argue the other side: write three sentences for why option 4 (fork LifeOS) is right for 9T. If you cannot make them convincing, you understand the "too large" section. If you can, tell me; the scores may be wrong.',
    'Pick one row marked **Same** in the overlap map and try to break it: find a way the 9T version is actually different. Memory is the trap most people fall into first; the Same rows are harder.',
    'Take the six money guards implied above and write the falsifier for each: what tool call would each one block, and what stderr text would the model see?',
  ],
  recall: [
    'The five kinds of user and one need each, from memory.',
    'Seven Same, five Different, three Drop: name two of each without looking.',
    'The four options and their totals, and the one criterion where option 4 scores lowest.',
    'Which five ideas transfer, and in what form (file, shape, table)?',
  ],
  transfer: [
    'Do the same page for BachmannLogi: users (owner, dispatchers, payroll), the overlap map, the four options. Your scores will differ on Fit and Risk because payroll data is more sensitive than sales data.',
    'Open `9T_erp` and create the `.claude/CLAUDE.md` from the tree above, twenty lines, today. That is option 1\'s first file and it is also Chapter 1\'s transfer exercise. Everything on this page becomes real the moment that file exists.',
  ],
};
