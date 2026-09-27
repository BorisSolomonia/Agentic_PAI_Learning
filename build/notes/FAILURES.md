# Failure log

**What this file is for.** Every time a BREAK exercise surprises you, or a PROVE fails, write one
entry here. It is not a diary: at every checkpoint (steps 6, 13, 21, 28, 35…) the entries are counted
by category, and a category that shows up twice decides what gets re-drilled next. A gap that appears
twice is a hole in your model of the system, not bad luck.

**When to write.** The moment the surprise happens, before you fix it. Two minutes, not twenty.

## Entry format (copy this block for each new entry)

```
## <step number> · <one-line title>
- I predicted:
- What actually happened:
- The gap in my model:
- Category: context | capability | control | memory | verification | tooling
```

**Categories, in plain words**

| Category | Use it when the surprise was about… |
|---|---|
| context | what the model knew or did not know (files loading, imports, system prompt) |
| capability | skills, scripts, tools, subagents: what the system can do on request |
| control | hooks, guards, permissions: what is allowed or blocked |
| memory | what survives from one session to the next |
| verification | how "done" was decided, proofs, checks that lied or passed wrongly |
| tooling | the shell, paths, Windows vs WSL, Node/bun versions, anything around the system |

---

<!-- your entries start below this line -->
