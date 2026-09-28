# Agentic Finance build workspace

This directory holds the applied implementation and learning artifacts for `AGENTIC-FINANCE-30D.md`.

Suggested structure — create folders only when they are needed:

```
build/agentic-finance/
  README.md
  decisions/
  process/
  src/
  tests/
  evals/
  traces/
  notes/
```

Do not create the entire architecture upfront.

## Week 1 first artifact

Start with:

```
decisions/ADR-001-first-order-slice.md
process/first-order-slice.md
```

Then create the minimum code needed for:

**synthetic customer message → structured OrderCandidate → output**

The language/framework is an architectural decision, not a permanent repository rule. Python is the default learning implementation unless today's evidence supports another choice.

Keep real customer/company data out of this learning repository. Use synthetic or strongly anonymized examples.
