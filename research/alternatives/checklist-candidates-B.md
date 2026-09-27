# Checklist candidates, part B (D9 to D16)

Written 2026-09-25. Each item is one rule for Boris's own checklist, with the failure it prevents, a check he can run,
what LifeOS and the RS.GE Agent do today (paths opened that day), and the decision entry in `part-B.md` that argues it.

### A guard is trusted only after a pipe test with one block case and one pass case
- Why: a hook that crashes exits 1, and Claude Code lets the tool call through with a small notice. The myos guard had a one-character syntax error, exited 1 on every input, and blocked nothing for a week; `SYSTEM_PROMPT.md` was rewritten in step 3 without a refusal. On 2026-09-25 the file on disk still has `/\/g` on line 46.
- Check: `echo '{"tool_name":"Write","tool_input":{"file_path":"/x/SYSTEM_PROMPT.md"}}' | bun .claude/hooks/guard.ts; echo $?` prints `2`; the same with `notes.md` prints `0`. Keep both lines in `tests/hooks.sh` and run it before any session that touches the guard.
- LifeOS: guards are runnable standalone (each keeps an `import.meta.main` shim, `hooks/PreToolGuard.hook.ts` header) but no pipe-test script ships in `~/.claude/hooks/`; `hooks/HookHealer.hook.ts` repairs one failure class (missing exec bit) at SessionStart.
- RS.GE: every gate test runs against `FakeAgentLoop` with no model and no network (`packages/core/src/agent-loop.ts` lines 1 to 8); `test/review-gate.test.ts` is the pipe test of the product.
- Decision: D15

### A file guard watches every tool that can write, and a deny rule sits under it
- Why: a matcher of `Write|Edit` is compared with the tool name, so `echo x >> SYSTEM_PROMPT.md` (tool name `Bash`) is never seen; `NotebookEdit` and the legacy `MultiEdit` are other names too. LifeOS learned this on 2026-08-11 when a heredoc landed in the SYSTEM tree unguarded (`hooks/BashSystemWriteGuard.hook.ts` header).
- Check: `jq -r '.hooks.PreToolUse[].matcher' .claude/settings.json` contains `Bash`, `Write`, `Edit`, `MultiEdit` and `NotebookEdit`; `jq '.permissions.deny' .claude/settings.json` contains `Edit(./SYSTEM_PROMPT.md)` (written as `Edit`, never `Write`, which is accepted but never consulted).
- LifeOS: `hooks/PreToolGuard.hook.ts` is registered for `Bash|Write|Edit|MultiEdit` and parses shell write shapes; `permissions.deny` in `~/.claude/settings.json` is `[]`.
- RS.GE: no file tools; the guarded surface is `config/submit-class-tools.json`, gated in `canUseTool` and again inside each tool (`packages/core/src/review-gate.ts` header, point 2).
- Decision: D14

### Protecting hooks fail closed, informing hooks fail open, and every hook has a timeout
- Why: Claude Code treats any exit other than 2, and any timeout, as "proceed". A guard that fails open is a guard only while it is healthy. A hook without a timeout can stall a session (default 600 seconds for command hooks).
- Check: the settings `command` for a protecting hook ends in `|| exit 2` (or the hook's outer catch exits 2); `jq '[.hooks[][].hooks[] | select(.timeout == null)] | length' .claude/settings.json` is `0`.
- LifeOS: fail-open by doctrine except `hooks/EgressClassGuard.hook.ts`, which fails closed on a confirmed outbound inference call; timeouts 5 to 30 on most entries, none on several (for example `PreToolGuard`, `StopGates`).
- RS.GE: fail closed by shape: `apps/agent/src/index.ts` refuses to boot (exit 1 to 4) and the gate spends the approval token before the tool runs (`packages/review/src/gate.ts`).
- Decision: D15

### Every number a person acts on comes from code, in integers or a decimal type parsed from text, never a float
- Why: `0.1 + 0.2` is `0.30000000000000004`; a thousand additions of `0.1` gave `99.9999999999986` on 2026-09-25. A JSON number is a float, so a rate read from JSON as a number is already wrong. A model-added total is fluent and unverifiable.
- Check: `grep -n "parseFloat\|Number(" scripts/*.ts` on any money path returns nothing; the script sums in tetri or a `{units, scale}` type; an awk road on the raw file equals the script's total to the tetri.
- LifeOS: skills carry scripts (`skills/Agents/Tools/ComposeAgent.ts`); the 🧠 line is computed by `hooks/MemoryDeltaSurface.hook.ts`; money is not a LifeOS concern.
- RS.GE: `packages/declarations/src/decimal.ts` (bigint units plus scale, parsed from text, three rounding modes); `test/declaration-decimal.test.ts`.
- Decision: D9

### Untrusted content is read through a map, and its absence from the model's input is proven by grep, not promised
- Why: whatever a script prints becomes a tool result, and a tool result is part of the next request. A label asks the model to be careful; a map makes the text never arrive. Anthropic writes that no agent is immune and 1% attack success is still meaningful risk.
- Check: after a run over a file with a planted `IGNORE PREVIOUS INSTRUCTIONS` cell, `grep -c "IGNORE PREVIOUS" <session log>` is `0`; `grep -c show-notes brief.ts SKILL.md` is `0`; `Read(./data/**)` is in `permissions.deny`.
- LifeOS: `hooks/Safety.hook.ts` labels web and MCP results and flags seven injection shapes (`hooks/lib/safety-classifier.ts` lines 92 to 100); its own header calls it decoration; no deny rule under it.
- RS.GE: `packages/interview/src/documents.ts` (only mapped columns read, the rest quarantined as text, "no code path from here to model.ts"); `test/interview-document-intake.test.ts` reads the prompt log and asserts the hostile text absent.
- Decision: D10

### An action with a side effect starts only from a human: user-only skill, ask rule, or a single-use token
- Why: a skill the model can start is a smoke alarm; sending, filing, paying and deleting are doorbells. A token that is valid but reusable can file the same declaration twice from a captured log.
- Check: `grep -c 'disable-model-invocation: true' .claude/skills/brief/SKILL.md` is `1`; `jq '.permissions.ask' .claude/settings.json` names every push, delete and deploy shape; in a product, a token accepted once is refused the second time (RS.GE `alreadyUsed`).
- LifeOS: five user-only skills (`skills/Interview`, `Loop`, `Optimize`, `Migrate`, `LifeOS`); 27 `ask` rules including `git push --force` and `Edit(~/.claude/settings.json)`.
- RS.GE: commands as rows in `config/front-door.json`; `packages/core/src/approval.ts` (HMAC over canonical JSON, expiry, nonce, `alreadyUsed`); `config/submit-class-tools.json` says the human presses send.
- Decision: D11

### The second check shares no code with the first, and a mutation test proves it can fail
- Why: a second road that imports the first road's arithmetic shares its rounding bug; a checker that cannot compute and still says AGREE is "a second model agreeing", which is not a source. A check that never fails is indistinguishable from no check.
- Check: `diff <(road1) <(road2)` is empty on the true file; after `sed` corrupts one line in a copy, the diff is not empty and the check names both numbers; the checker file imports nothing from the first path.
- LifeOS: `hooks/VerificationGate.hook.ts` (claims from the message, evidence from the transcript) inside `hooks/StopGates.hook.ts`; `agents/Max.md` as a read-only last look.
- RS.GE: `packages/second-check/src/exact.ts` (a second arithmetic on purpose, no division); `test/second-check-mutation.test.ts` (every figure corrupted in turn); `test/second-check-no-hardcode.test.ts` (no identity in code).
- Decision: D12

### Hooks are registered by absolute or `${CLAUDE_PROJECT_DIR}` paths, project rules live in the project, and a product loads no filesystem settings
- Why: `bun .claude/hooks/guard.ts` works only when the session starts in the project root; a user-level hook fires in every folder (step 6.6's leak); a server running the Agent SDK with default options reads the server's own `~/.claude` hooks and skills into a stranger's session.
- Check: every `command` in `.claude/settings.json` starts with `bun "${CLAUDE_PROJECT_DIR}/…"` or an absolute path; `myos` is launched with `--setting-sources project,local`; in the product, `grep -n settingSources packages/core/src/agent-loop.ts` finds `settingSources: []`.
- LifeOS: all registrations in `~/.claude/settings.json` use `$HOME/.claude/hooks/…` or `${PAI_DIR}/hooks/…` (with `PAI_DIR` set in `settings.json` → `env`); the documented system/user split of `settings.json` is not present on this machine (`~/.claude/settings.system.json` and `LIFEOS/USER/CONFIG/settings.user.json` both absent; `LIFEOS/TOOLS/MergeSettings.ts` exits cleanly, lines 604 to 605).
- RS.GE: no Claude Code hooks; the gate is `canUseTool` in `packages/core/src/agent-loop.ts`; `settingSources` is not set yet (BOR-148).
- Decision: D13

### Every "never" rule sits on a rung the model cannot talk past: a deny rule, a sandbox path, or a database policy, never only the constitution
- Why: the constitution is text, resent every turn but still weighed against the request; step 3's `SYSTEM_PROMPT.md` was rewritten without a refusal. In a database, RLS that is enabled but not forced, or an app connected as a superuser, "would be decoration and the isolation test would pass against a lie".
- Check: for each rule in `SYSTEM_PROMPT.md`, a written rung number; every rung-4 rule has a line in `permissions.deny`; in a product, `grep -c "force  row level security" packages/db/migrations/*.sql` is above 0 and the app connects as a role that is neither superuser nor owner.
- LifeOS: rules in `LIFEOS/LIFEOS_SYSTEM_PROMPT.md` (Security Protocol, line 145) with teeth from `hooks/PreToolGuard.hook.ts` and `ask` rules; `permissions.deny` is `[]`.
- RS.GE: `packages/db/migrations/0004_row_level_security.sql` (`enable` and `force` on eight tables, policies on `app.tenant_id`), `0005_application_role.sql` (`rsge_app`, because superusers bypass RLS), `packages/db/src/client.ts` `withTenant()` line 94, boot refuses without the role (`apps/agent/src/index.ts`).
- Decision: D16
