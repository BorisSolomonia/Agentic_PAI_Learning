# The builder's checklist: what must never be forgotten

**What this is.** The short list of details that decide whether an agent system like LifeOS, your `myos`
or the RS.GE Agent is safe, honest and easy to keep alive. Each item is one rule, the failure it prevents,
a command that checks it, and where it lives in LifeOS and in the RS.GE Agent. The long explanations, with
the alternatives and when each is better, are in `ALTERNATIVES.md`; every item links to its decision there.

Started 2026-09-25 from your two examples: *a part that no update ever touches* (CK-001) and *a guard that
covers `Bash|Write|Edit|MultiEdit`, not only `Write|Edit`* (CK-004).

## How an item gets here

1. **You mark a line.** Anywhere in the course folder, put `<!-- ck -->` at the end of a line that matters,
   or `<!-- ck: your note -->` to say why. In a TypeScript file use `// ck`, in a shell script `# ck`.
   A mark shown inside backticks or inside a code block is an example and is never collected.
2. **The mark is captured.** At the start of every Claude session a small hook
   (`~/.claude/hooks/CourseChecklist.hook.ts`) looks for unfiled marks and tells me about them. You can run
   the capture yourself too:

   ```bash
   cd /mnt/c/Users/Boris/Dell/stuff/Docs/Learning/AI/PAI
   bun tools/checklist.ts
   bun tools/checklist.ts --apply
   ```

   | Command | What it does |
   |---|---|
   | `bun tools/checklist.ts` | a dry run: lists every unfiled mark with its file, line and section, and changes nothing |
   | `bun tools/checklist.ts --apply` | adds each mark to the Inbox below with the next free CK number, then changes the mark into `<!-- ck CK-0NN -->` so it is never collected twice. Only the mark itself changes in your file |

3. **I file it properly, the same session.** Each Inbox entry becomes a full item under the right heading,
   with all its fields, and leaves the Inbox. If it repeats an item that already exists, your wording and
   source are added to that item instead of making a duplicate. I tell you which items were added. A mark that does not earn an item of its own stays in the Inbox, ticked and marked *declined* with the reason, so nothing you marked ever disappears (CK-033).

This is *capture first, route later*: capturing is automatic and simple, filing is careful and done by
judgement. LifeOS's Synapse works the same way (ALTERNATIVES.md, D23).

**Item fields.** Rule (what to do) · Why (the failure it prevents, with the real incident when there was
one) · Check (a command or an observable test) · LifeOS (where the rule lives there) · RS.GE (the same, or
why not) · Decision (the ALTERNATIVES.md entry) · Source.

## Inbox (captured, not yet filed)

<!-- inbox: new items are appended below this line by tools/checklist.ts -->

## The checklist

### 1 · What updates may never touch

#### CK-001 · Keep a part that no update ever touches
- **Rule:** your own data and settings (identity, goals, memory, personal rules) live where the updater cannot write: a folder outside the update tree, or rows the product code never overwrites.
- **Why:** every customisation a user loses in an upgrade was in the wrong zone. Step 5's fake update destroys a personal rule written into a SYSTEM file, while the USER folder survives.
- **Check:** before and after an update, `diff -r USER /tmp/myos-user-before && echo "USER ZONE SURVIVED"` (step 5).
- **LifeOS:** `~/.claude/LIFEOS/USER` is a symlink to `~/.config/LIFEOS/USER`, outside the tree the updater writes; `skills/LifeOS/Tools/OverlaySystem.ts` writes only whitelisted paths and never follows a symlink.
- **RS.GE:** product code and `config/` are the system; each tenant's data is rows with a tenant key, fenced by row-level security (`packages/db/migrations/0004_row_level_security.sql`).
- **Decision:** D5 · **Source:** your first example, 2026-09-25; COURSE.md step 5.

#### CK-002 · An update adds; it never deletes what a user made
- **Rule:** an update overwrites only files the product owns and deletes nothing; removing a product file is an explicit, listed step. A database change is a new migration, never an edit of an applied one.
- **Why:** a deleting update erases user files that sit in a product folder; an edited migration breaks the database checksum (the 9T ERP outage of 2026-08-05).
- **Check:** run the update as a dry run first and read its list of changes.
- **LifeOS:** OverlaySystem never deletes. The settings merge is designed to add and never remove, which has a cost too: stale entries must be removed on purpose (nine duplicate hook registrations left over from the PAI era were removed by hand on 2026-09-17).
- **RS.GE:** migrations only add (`packages/db/migrations/0001…`).
- **Decision:** D21 · **Source:** COURSE.md steps 5 and 44; the Flyway rule in your OPERATIONAL_RULES.

#### CK-003 · A backup must include what the symlinks point to
- **Rule:** back up the target of every symlink, not only the folder that holds it.
- **Why:** a plain copy of `~/.claude` copies the signpost `LIFEOS/USER`, not your files, so the backup holds no identity and no memory.
- **Check:** `ls -la <backup>/LIFEOS/USER` shows real files, not an arrow to another folder.
- **LifeOS:** `LIFEOS/USER` and `LIFEOS/MEMORY` point into `~/.config/LIFEOS`; the backup rule in OPERATIONAL_RULES says to copy both.
- **RS.GE:** tenant data lives in Postgres, so its backup is a database dump; a copy of the repository holds no tenant data.
- **Decision:** D21 · **Source:** backup rule, 2026-08-29; COURSE.md Appendix A, answer 7.

### 2 · What a guard must cover

#### CK-004 · A guard must cover every tool that can write
- **Rule:** register write guards for `Bash|Write|Edit|MultiEdit` (and `NotebookEdit`), and make the hook read a shell command to see which file it touches.
- **Why:** with a `Write|Edit` matcher, `echo "x" >> SYSTEM_PROMPT.md` sent through Bash is neither a Write nor an Edit, so the guard is never asked (step 6.4). LifeOS learned the same on 2026-08-11, when a `cat > hooks/<file> <<EOF` heredoc landed in its system tree unguarded; `hooks/BashSystemWriteGuard.hook.ts` now closes that hole.
- **Check:** `echo '{"tool_name":"Bash","tool_input":{"command":"echo x >> SYSTEM_PROMPT.md"}}' | bun .claude/hooks/guard.ts; echo "exit=$?"` prints `exit=2` once step 16 has widened the guard. Today it prints `exit=0`: the known gap.
- **LifeOS:** `hooks/PreToolGuard.hook.ts`, registered in `settings.json` with the matcher `Bash|Write|Edit|MultiEdit`.
- **RS.GE:** every tool call passes the `canUseTool` gate (`packages/core/src/agent-loop.ts`, line 102); submit-class tools are listed in `config/submit-class-tools.json` and are refused without an approval.
- **Decision:** D14 · **Source:** your second example, 2026-09-25; COURSE.md steps 6.4 and 16.

#### CK-005 · Test every hook with a fake event; a crashing hook lets everything through
- **Rule:** before trusting a hook, pipe fake JSON into it and read the exit code. Test one case it must block and one it must allow.
- **Why:** only exit code 2 blocks. A crash is a non-blocking error, so the action goes ahead. The step-1 guard had a one-character syntax error and blocked nothing for a week.
- **Check:** the two pipe tests of step 6.3 print `exit=2` and then `exit=0`.
- **LifeOS:** hooks are plain programs; `hooks/CourseChecklist.hook.ts` was tested five ways by pipe before it was registered.
- **RS.GE:** tests run against a `FakeAgentLoop` (`packages/core/src/agent-loop.ts`), never a real model call.
- **Decision:** D15 · **Source:** the guard.ts line-46 incident, found 2026-09-24.

#### CK-006 · Put a floor under the hooks: deny rules in settings
- **Rule:** protect key files with permission rules as well: `Edit(./SYSTEM_PROMPT.md)`, `Read(./data/**)`. Write the rule as `Edit(…)`: a `Write(…)` path rule is accepted but never consulted.
- **Why:** a hook is code, and code can crash or miss a tool. A deny rule needs no code, and Claude Code also applies it to `cat`, `head`, `tail`, `sed`, `tee` and redirects. Its honest limit: a script that opens files itself is not covered.
- **Check:** ask a session for the raw lines of a denied file; it is refused, and the file's content never appears in the session log (step 10.3).
- **LifeOS:** not yet. On 2026-09-26 `~/.claude/settings.json` held 27 `ask` rules, 16 `allow` rules and **no `deny` rules**, so LifeOS's "never" rules rest on hooks and prompts, without this floor (ALTERNATIVES.md D16).
- **RS.GE:** the floor sits lower still: Postgres row-level security refuses cross-tenant reads inside the database.
- **Decision:** D16 · **Source:** COURSE.md steps 10 and 20; code.claude.com/docs/en/permissions.

#### CK-007 · Allow exact commands, never a whole interpreter
- **Rule:** allow `Bash(bash tests/recon.sh *)`, never `Bash(awk *)`, `Bash(python *)` or `Bash(bun *)`.
- **Why:** awk, Python and bun can run any command (awk through its `system()` function), so allowing the interpreter allows everything.
- **Check:** `jq '.permissions.allow' .claude/settings.json` shows only full script paths.
- **LifeOS:** skills pre-approve their own script with `allowed-tools`, scoped to the script's path.
- **RS.GE:** the agent loop refuses to start if `allowedTools` contains a submit-class tool (`packages/core/src/agent-loop.ts`).
- **Decision:** D16 · **Source:** COURSE.md step 12.

#### CK-008 · After every hand edit of settings.json, check that it still parses
- **Rule:** run `jq empty .claude/settings.json && echo "settings.json is valid"` after each edit.
- **Why:** a settings file with a JSON error is silently ignored in headless runs: every hook, deny rule and allow rule disappears without a word (`claude --help`).
- **Check:** the command itself prints `settings.json is valid`.
- **LifeOS:** LifeOS's design rebuilds `settings.json` at session start from a system half and a user half, but on this machine neither half exists, so the merge does nothing and `settings.json` is the only copy. Back it up before every edit.
- **RS.GE:** `packages/core/src/boot-guard.ts`: the service refuses to start when its setup is unsafe, instead of running without it.
- **Decision:** D13 · **Source:** the review of 2026-09-25.

#### CK-025 · A protecting hook fails closed; an informing hook may fail open; every hook has a timeout
- **Rule:** a hook that protects (a file guard, an egress guard) turns its own crash into a block, with an outer catch that exits 2; a hook that only informs may fail open. Every hook registration carries a `timeout`.
- **Why:** Claude Code goes ahead on any exit code other than 2 and when a hook times out, so a protecting hook that fails open protects only while it is healthy; a hook with no timeout can stall a session.
- **Check:** pipe a malformed event into the protecting hook: it prints a reason and exits 2. Every entry in `.claude/settings.json` has a `timeout`.
- **LifeOS:** `hooks/EgressClassGuard.hook.ts` fails closed; the file guard in `hooks/PreToolGuard.hook.ts` fails open by design. On 2026-09-26, 37 hook registrations had no timeout, `PreToolGuard` and `StopGates` among them.
- **RS.GE:** it fails closed by its shape: `apps/agent/src/index.ts` refuses to boot (exit codes 1 to 4), and each submit tool calls `assertApproved()` itself (`packages/core/src/review-gate.ts`).
- **Decision:** D15 · **Source:** alternatives research, 2026-09-25; checked 2026-09-26.

#### CK-026 · An action with a side effect starts only from a person
- **Rule:** sending, filing, paying, deleting and deploying start from a human: a command only you can start (`disable-model-invocation: true`), an `ask` rule, or a single-use approval token.
- **Why:** a skill the model can start is a smoke alarm; a side effect needs a doorbell. A token that can be reused could file the same declaration twice from a captured log.
- **Check:** `grep -c 'disable-model-invocation: true' .claude/skills/brief/SKILL.md` prints 1; in a product, the same approval token is refused the second time.
- **LifeOS:** five user-only skills (`Interview`, `Loop`, `Optimize`, `Migrate`, `LifeOS`) and 27 `ask` rules.
- **RS.GE:** `packages/core/src/approval.ts` signs each approval (HMAC) and refuses one that was already used; `config/submit-class-tools.json` lists the tools that need it.
- **Decision:** D11 · **Source:** alternatives research, 2026-09-25; COURSE.md step 11.

#### CK-027 · Register a hook by a path that works from any folder
- **Rule:** register hook commands with an absolute path or `"${CLAUDE_PROJECT_DIR}"/…`, never a path relative to wherever the session started.
- **Why:** `bun .claude/hooks/guard.ts` works only when the session starts in the project root. Started anywhere else, the file is not found, the hook exits with an error, and the action goes through. Your myos guard is registered this way today; it works only because `myos` always starts in the project root.
- **Check:** `jq -r '.hooks[][].hooks[].command' .claude/settings.json` shows no command that starts with a relative path.
- **LifeOS:** every registration uses `$HOME/.claude/hooks/…`, an absolute path.
- **RS.GE:** no Claude Code hooks; the gate is code (`canUseTool`), and `settingSources` should be `[]` (BOR-148).
- **Decision:** D13 · **Source:** alternatives research, 2026-09-25.

#### CK-028 · Every "never" rule has teeth below the prompt
- **Rule:** next to each "never" in your constitution, name what enforces it: a deny rule, a hook that blocks, a sandbox, or a database policy. A rule with only text behind it is advice.
- **Why:** step 3 showed that text changes probability, not certainty, and the constitution was rewritten without a refusal while the guard was broken. In a database, row-level security that is enabled but not forced "would be decoration" (RS.GE migration 0005).
- **Check:** each rule in `SYSTEM_PROMPT.md` has its enforcer written beside it, and every file rule has a line in `permissions.deny`.
- **LifeOS:** the Security Protocol in `LIFEOS/LIFEOS_SYSTEM_PROMPT.md` has hooks and `ask` rules behind it, and no `deny` rules (see CK-006).
- **RS.GE:** `packages/db/migrations/0004_row_level_security.sql` enables and forces the policies; `0005_application_role.sql` makes the app connect as a role that cannot bypass them.
- **Decision:** D16 · **Source:** alternatives research, 2026-09-25.

### 3 · Context and isolation

#### CK-009 · Keep the system you build apart from the system you use
- **Rule:** when you build or test an agent on the machine where you use your own, load only the project's settings: `--setting-sources project,local` and `"autoMemoryEnabled": false` for Claude Code; `settingSources: []` plus `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` for the Agent SDK.
- **Why:** every myos session also loaded LifeOS's `CLAUDE.md`, skills and hooks, so the tests measured the wrong system; the RS.GE agent loop would load a server's `~/.claude` into a taxpayer's session.
- **Check:** `myos -p "ok" --output-format stream-json --verbose | jq -r 'select(.subtype=="init") | .skills[]'` lists only your skills and Claude Code's built-ins.
- **LifeOS:** not needed: it is the system you use.
- **RS.GE:** `packages/core/src/agent-loop.ts` does not set `settingSources` yet (Linear BOR-148).
- **Decision:** D1 · **Source:** COURSE.md step 6.6.

#### CK-010 · Check what actually loaded; a context file fails silently
- **Rule:** after any change to context files, look instead of assuming: `/context`, `/skills`, or the `skills` list of a headless run's first event.
- **Why:** a context file that does not load gives no error; the assistant just knows less (step 2). A right answer can even come from the wrong file (step 6.6: "Flyway" answered from LifeOS, not from myos).
- **Check:** `/context` lists exactly the files you expect, and none you do not.
- **LifeOS:** the session-start hooks print what they loaded.
- **RS.GE:** context is built in code on every turn and tested: `test/interview-isolation.test.ts` searches every prompt for another taxpayer's figures.
- **Decision:** D1 · **Source:** COURSE.md steps 2 and 6.

#### CK-011 · Always-loaded context is paid for on every turn
- **Rule:** keep always-loaded files short; point to detail instead of copying it in.
- **Why:** every loaded line is paid for on every request, and long files are followed less well (Claude Code's docs advise under 200 lines per `CLAUDE.md`).
- **Check:** `wc -l CLAUDE.md USER/*.md`.
- **LifeOS:** `CLAUDE.md` is a routing table of pointers.
- **RS.GE:** `packages/memory/src/prefill.ts` injects only the rows this turn needs.
- **Decision:** D1, D4 · **Source:** COURSE.md steps 2 and 4; code.claude.com/docs/en/memory.

#### CK-012 · The constitution is changed by a person, outside the loop
- **Rule:** you edit the system prompt file in an editor; a session that tries is refused by the guard.
- **Why:** a rule the model can rewrite is only a suggestion. Once the guard worked, step 3's old instruction "ask me to edit it" became impossible, correctly.
- **Check:** ask a `myos` session to add a line to `SYSTEM_PROMPT.md`; it is refused with the guard's reason.
- **LifeOS:** `LIFEOS/LIFEOS_SYSTEM_PROMPT.md` is loaded by the launcher and belongs to the system zone.
- **RS.GE:** the system prompt is a string passed by code (`packages/core/src/agent-loop.ts`, line 117); changing it means a code change and a review.
- **Decision:** D2 · **Source:** COURSE.md step 6.5.

### 4 · Capabilities

#### CK-013 · A description is a trigger: measure it
- **Rule:** test a skill's description with FIRE and SKIP sentences in fresh headless sessions; put the key words first; say what it is not for.
- **Why:** a weak description fails silently in both directions, and only a suite shows the rate. Descriptions are cut at 1,536 characters.
- **Check:** `bash tests/run-triggers.sh` prints a score, and the teeth test (skill moved away) shows every FIRE line failing.
- **LifeOS:** skill descriptions carry *USE WHEN* lists; `hooks/AlgorithmNudge.hook.ts` routes by patterns.
- **RS.GE:** no trigger to misfire: the route is derived by code (`packages/interview/src/plan.ts`).
- **Decision:** D7 · **Source:** COURSE.md step 8.

#### CK-014 · Numbers come from code, checked by a second road
- **Rule:** the model never computes a number a person will act on. A script computes it, in integers or decimals, and a second, independent computation checks it, with both numbers shown.
- **Why:** a model writes number-shaped text, fluent and often wrong, and one road cannot catch its own mistakes.
- **Check:** the brief's total equals the awk total to the tetri (step 9); the reconciler says DISAGREE on a wrong number (step 12).
- **LifeOS:** skill tools compute; the 🧠 line is computed by a hook and only echoed.
- **RS.GE:** `packages/second-check` has its own reading of the rules and "adjusts nothing"; `test/second-check-mutation.test.ts` proves it catches every corrupted figure.
- **Decision:** D9, D12 · **Source:** COURSE.md steps 9 and 12; your two-check rule.

#### CK-015 · Show the discrepancy; never correct it silently
- **Rule:** unreadable rows are listed, duplicate lines are counted and flagged, and a person decides.
- **Why:** a total quietly made to agree can never be audited again.
- **Check:** the brief's Discrepancies section lists rejected rows and duplicates, and awk total minus brief total equals the rejected rows' readable total (step 10).
- **LifeOS:** your standing rule in OPERATIONAL_RULES.
- **RS.GE:** `packages/second-check/src/check.ts` opens a discrepancy with both numbers and leaves the filing unchanged.
- **Decision:** D10 · **Source:** OPERATIONAL_RULES; COURSE.md step 10.

#### CK-016 · Nothing from an untrusted document reaches the model
- **Rule:** read foreign files only through a map, never print unmapped columns, keep the model out of the raw files with a deny rule, and prove the absence by searching the session log.
- **Why:** whatever a script prints, the model reads, and a note cell can say "IGNORE PREVIOUS INSTRUCTIONS".
- **Check:** `grep -c "IGNORE PREVIOUS" /tmp/p10.jsonl` prints `0` (step 10).
- **LifeOS:** `hooks/Safety.hook.ts` labels fetched web content as data and flags injection shapes. It must read the open web, so it labels instead of refusing.
- **RS.GE:** `packages/interview/src/documents.ts` has no code path from a document to a prompt; `test/interview-document-intake.test.ts` proves it from the prompt log.
- **Decision:** D10 · **Source:** COURSE.md step 10.

#### CK-017 · Nothing hardcoded
- **Rule:** thresholds, rates, sources, paths and names live in configuration or data, editable without a deploy.
- **Why:** if changing it requires a deploy, it is hardcoded, and a rule change should never need a developer.
- **Check:** change a threshold in `config/brief.json` and watch the behaviour change with no code edit (step 9.5).
- **LifeOS:** configuration files in the USER zone; even this checklist's hook reads its path from `LIFEOS/USER/CONFIG/course-checklist.json`.
- **RS.GE:** `config/*.json`, guarded by tests such as `test/second-check-no-hardcode.test.ts`.
- **Decision:** D8 · **Source:** your standing rule NOTHING IS HARDCODED.

#### CK-018 · A checker must compute, and must be able to fail
- **Rule:** a second check counts only if it takes a different road and shows its evidence. Prove it says DISAGREE on a wrong input before you trust its AGREE.
- **Why:** "a second model agreeing is not a source", and a checker that never fails is no checker.
- **Check:** the reconciler's four teeth tests (step 12.3).
- **LifeOS:** `agents/Max.md`, a read-only second look that cannot edit what it reviews.
- **RS.GE:** `test/second-check-mutation.test.ts`: "Does the check have teeth?"
- **Decision:** D12 · **Source:** your TELOS wisdom; COURSE.md step 12.

#### CK-019 · A subagent knows only its brief
- **Rule:** write everything a subagent needs into the task message.
- **Why:** it never sees your conversation, the skills you used or the files you read; "check the brief above" means nothing to it (step 12, BREAK 2).
- **Check:** could a stranger do the task from the brief alone?
- **LifeOS:** the Algorithm's delegation rules: briefs are built from files read in the same turn.
- **RS.GE:** no subagents.
- **Decision:** D12 · **Source:** code.claude.com/docs/en/sub-agents; COURSE.md step 12.

### 5 · Headless runs and tooling

#### CK-020 · Inside a loop, give `claude -p` an empty input
- **Rule:** write `claude -p "…" </dev/null` inside any `while read … done < file` loop.
- **Why:** `claude -p` reads whatever is fed into it. In a loop that reads a file, the first call swallows the rest of the file, and only the first test ever runs.
- **Check:** a runner over eight sentences prints eight result lines.
- **LifeOS:** hooks and tools never start a `claude` session inline; they use `LIFEOS/TOOLS/Inference.ts`.
- **RS.GE:** no shell loops; its tests are `bun test`.
- **Decision:** D8 · **Source:** the review of 2026-09-25.

#### CK-021 · Anything that writes many files runs dry first
- **Rule:** installers, updaters and harvesters default to a dry run that lists the changes; `--apply` acts.
- **Why:** you read the list before anything is touched, so a surprise shows up as a line, not as damage.
- **Check:** `bun tools/checklist.ts` changes nothing: the files' fingerprints before and after are equal.
- **LifeOS:** the installer contract: dry run by default, `--apply` to act (course steps 43–44).
- **RS.GE:** migrations are reviewed files applied by `bun run migrate`.
- **Decision:** D21 · **Source:** COURSE.md steps 43 and 44.

### 6 · Honesty and verification

#### CK-022 · A file that reads right is not a file that works
- **Rule:** every build step ends with a command that proves it, and a claim closes on the fact, not on the code that would check it. Whoever ticks a box moves the progress counter in the same edit.
- **Why:** the step-1 guard read right and never ran. A reconciliation script that exists is not evidence that nothing is wrong (the ISC-32 incident on the RS.GE Agent).
- **Check:** every step's PROVE output is pasted into `PROGRESS.md` §8.
- **LifeOS:** `hooks/VerificationGate.hook.ts` and ISA claims that name their probes.
- **RS.GE:** `ISA.md` claims close on tests or live evidence.
- **Decision:** D19 · **Source:** COURSE.md step 6.2; OPERATIONAL_RULES, 2026-09-22.

#### CK-023 · Test data must never change by accident
- **Rule:** generate test data from a seed; the same seed gives the same bytes.
- **Why:** a check you cannot repeat proves nothing.
- **Check:** run the generator twice and compare `md5sum` fingerprints (steps 7 and 13).
- **LifeOS:** not applicable.
- **RS.GE:** fixed fixtures under `test/fixtures`.
- **Decision:** D19 · **Source:** COURSE.md steps 7 and 13.

#### CK-024 · Never put a secret in a URL or a log
- **Rule:** credentials travel in headers or a vault, logs are redacted, and a key pasted into a chat is refused, never stored.
- **Why:** URLs and logs get copied into histories, proxies and screenshots; a secret there is leaked.
- **Check:** search the logs for `key=` and `token=`; nothing is found.
- **LifeOS:** the system prompt's rule: tokens only in an `Authorization` header.
- **RS.GE:** `packages/core/src/secret-patterns.ts` and `packages/front-door/src/credential-guard.ts`.
- **Decision:** D20 · **Source:** LifeOS system prompt; RS.GE code.

#### CK-031 · Read one stored record back through a different path
- **Rule:** before accepting code that stores data, read one stored record back by another route (raw SQL, `jq`, the file's first bytes) and check its shape, not only that it exists.
- **Why:** on 2026-09-17, 70 green tests missed that `profile_facts.value` and `audit_events.payload` were stored as JSON text inside a JSON string (`${JSON.stringify(x)}::jsonb` with postgres.js). Every test asked whether rows existed; none asked what they held.
- **Check:** `select jsonb_typeof(payload) from audit_events limit 1` returns `object`; for a file log, `tail -n 1 file | jq .` parses.
- **LifeOS:** OPERATIONAL_RULES, "Accepting a delegate's build: read a write back and check its shape".
- **RS.GE:** `test/jsonb-shape.test.ts`; the fix is `tx.json(x)`.
- **Decision:** D20 · **Source:** alternatives research, 2026-09-25; the incident of 2026-09-17.

#### CK-032 · An alarm that can never fire is not a check
- **Rule:** after installing any alarm (a drift check, a guard, a monitor), make it fire once on purpose.
- **Why:** **live finding, 2026-09-26:** `hooks/VersionDrift.hook.ts` looks for git tags, and `~/.claude` is not a git repository on this machine, so the drift warning can never fire while everything looks green. The same shape as the step-1 guard.
- **Check:** `git -C ~/.claude rev-parse --is-inside-work-tree` prints `true`, or the check is rebuilt without git (a checksum list).
- **LifeOS:** `hooks/VersionDrift.hook.ts`, `LIFEOS/DOCUMENTATION/Ledger/LedgerSystem.md`.
- **RS.GE:** `bun run check:declarations` runs `scripts/build-declaration-versions.ts --check`, a check that fails loudly when versions drift.
- **Decision:** D22 · **Source:** alternatives research, 2026-09-25; checked 2026-09-26.

### 7 · Memory and capture

#### CK-029 · Turn off the harness's own memory when you run your own
- **Rule:** when a system keeps its own memory, switch off Claude Code's auto memory (`"autoMemoryEnabled": false`), or decide on purpose which of the two is the record.
- **Why:** two memories that never see each other disagree without a sound. **Live finding, 2026-09-26:** LifeOS's `MemorySystem.md` says auto memory is disabled by design, but this machine's `~/.claude/settings.json` does not contain that key, and `~/.claude/projects/-home-dmin--claude/memory/MEMORY.md` is in daily use. Both memories are being written today. Nothing was changed: switching auto memory off would also stop the project notes I keep there, so it is your decision.
- **Check:** `grep -c '"autoMemoryEnabled": false' ~/.claude/settings.json` prints 1, or you have written down why not.
- **LifeOS:** `LIFEOS/DOCUMENTATION/Memory/MemorySystem.md`; myos turned it off in step 6.6.
- **RS.GE:** `settingSources: []` plus `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` (BOR-148).
- **Decision:** D17 · **Source:** alternatives research, 2026-09-25; checked 2026-09-26.

#### CK-030 · Decide how memory forgets before the first automatic write, and keep a snapshot of every overwrite
- **Rule:** every automatic memory write has a guard against losing entries (for example, refuse a write that drops more than half of them and adds nothing) and leaves a snapshot you can restore.
- **Why:** LifeOS lost memory twice before its guards existed, once through a cap that jammed unnoticed and once through slow erosion; the guards were written after the loss (`LIFEOS/DOCUMENTATION/Memory/MemorySystem.md`).
- **Check:** `bun ~/.claude/LIFEOS/TOOLS/MemoryRestore.ts list` prints the recent snapshots.
- **LifeOS:** `LIFEOS/TOOLS/MemoryWriter.ts` (the `ESUSPECT_SHRINK` and `ESUSPECT_EROSION` refusals) and `LIFEOS/TOOLS/MemoryRestore.ts`.
- **RS.GE:** supersede, never overwrite: a fact gets a `valid_to` instead of being changed (`packages/db/migrations/0002_profile_and_filings.sql`).
- **Decision:** D18 · **Source:** alternatives research, 2026-09-25.

#### CK-033 · Keep everything captured, even what you decline
- **Rule:** capture first and never drop anything at the door; only where an item goes depends on a judgement. A declined item stays findable, with its reason.
- **Why:** a capture dropped because a grader said "not relevant" is gone for good, and the grader's opinion changes as your goals change.
- **Check:** in this checklist, every `<!-- ck -->` mark stays stamped in its file, and every Inbox entry is either filed or marked declined, never deleted.
- **LifeOS:** Synapse captures before it grades (`LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md`); rejected memory proposals keep their row with a status (`MEMORY/OBSERVABILITY/pending-proposals.jsonl`).
- **RS.GE:** `recordCorrection()` in `packages/memory/src/corrections.ts` stores the rejection together with its replacement; quarantined document cells are kept as text, never dropped (`packages/interview/src/documents.ts`).
- **Decision:** D23 · **Source:** alternatives research, 2026-09-25.
