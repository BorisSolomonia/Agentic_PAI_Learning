# TELOS — Boris

> What I'm ultimately trying to achieve. Everything the OS does should serve something on this page.
> Last reviewed: 2026-09-02.

## Mission

**Build good systems, whatever the domain.** Finance and ERP are where the hard problems currently
are, not the point in themselves. The point is that a system, once built correctly, keeps being
correct without anyone remembering to make it so.

**Make something genuinely meaningful, not merely correct.** Correct is the floor. Brooks is the
project where the test is whether people actually care about it, not whether the numbers reconcile.

## Goals

| # | Goal | By |
|---|---|---|
| **G1** | Reach **$10,000,000 net worth** — the age-40 line. | 2029-10-14 |
| **G2** | Every business I own is systematised to the standard I'd hold a client to: nothing hardcoded, reconciliation built in, no step that depends on me remembering it. | Ongoing, reviewed quarterly |
| **G3** | Every client engagement ends with the client operating the system without me in the loop. | Per engagement |
| **G4** | Be genuinely good at the profession I'll be practising in ten years — not the one that pays this month. | 2036, measured yearly |
| **G5** | _(needs confirming)_ A real migration held by **2027-08-30**. I have the date and the shape but not the specifics — tell me what this one actually is. | 2027-08-30 |

## Problems I'm solving

1. **Owners can't answer basic questions about their own numbers.** Small and mid-size businesses
   run on exports, spreadsheets and someone's memory. Margin per customer, per employee, per month
   is a question that takes a week to answer badly.
2. **Financial software hardcodes its own rules.** Changing a VAT rate, a surcharge formula or a
   cost centre requires a developer and a deploy. Rules are data with a version and a valid-from
   date; almost nothing treats them that way.
3. **Imported documents are handled at one of two wrong extremes** — treated as immutable truth the
   user has to work around, or silently overwritten so nothing stays auditable.
4. **Reconciliation is shipped as a report, not as a control.** A difference gets printed rather
   than raised, assigned and closed by a human.

## Strategies I've committed to

- **Nothing is hardcoded.** Rates, rules, dates, structure, labels and design tokens live in
  editable, interval-versioned records. If changing it needs a deploy, it is a bug.
- **Verify against the source document, not the brief.** Obtain one real artifact before writing
  anything substantial. Prose is how someone thinks about their business; the document is what it is.
- **A document value is a default, not a fact.** Seed from the file, keep the original, allow an
  override with author and reason, and reconcile against the original afterwards.
- **Show the discrepancy; never auto-correct it.** Row-level, traceable to the source line, with a
  status a human sets: open, accepted, disputed, corrected.
- **Build the control, not just the fix.** When a discrepancy is found, the deliverable is the
  permanent check that catches the next one.
- **Never assert without verification.** Tests, diffs, screenshots. A second model agreeing is not
  a source.

## Challenges

- **Attention is the binding constraint, not hours.** Eight projects are active. Every one of them
  can absorb everything I have, and switching between them is where the cost hides.
- **Choosing direction is harder than choosing work.** Today's queue is obvious; what I should be
  positioned for in ten years is not, and that is the decision that actually compounds.
- **A named capability gap.** There is a class of system I want to be able to build and cannot yet.
  Naming it precisely is itself unfinished work.
