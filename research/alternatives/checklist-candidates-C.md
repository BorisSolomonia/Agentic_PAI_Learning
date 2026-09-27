# Checklist candidates, part C (D17 to D23)

> Eight "must not forget" items drawn from the memory, verification, logging, install, ledger and
> capture decisions. Each was checked against the real files on 2026-09-25; the two marked *live
> finding* describe the state of this machine today, not a hypothetical.

### Turn off the harness's own memory when you run your own
- Why: two writers that never see each other. *Live finding:* `MemorySystem.md` says Claude Code auto memory is disabled by design, but `grep autoMemoryEnabled ~/.claude/settings.json` returns nothing and `~/.claude/projects/-home-dmin--claude/memory/MEMORY.md` exists, so the harness and Cortex are both writing memory today. Course step 6.6 found the same class of leak in myos.
- Check: `grep -c '"autoMemoryEnabled": false' ~/.claude/settings.json` prints 1, or you can say why it should not; `ls ~/.claude/projects/*/memory/MEMORY.md` lists nothing unexpected.
- LifeOS: `LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` (§ One storage layer), `settings.json`
- RS.GE: the Agent SDK recipe `settingSources: []` plus `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` (course step 6 mirror; the service has no session folder at all)
- Decision: D17

### Decide the forgetting rule before the first automatic write, and snapshot every overwrite
- Why: LifeOS lost memory twice before the guards existed: the cap-jam (`EAT_CAP`, unread in a log for two weeks) and slow erosion (each write a tenth smaller until 12 durable rules died in 48 hours). `ESUSPECT_SHRINK`, `ESUSPECT_EROSION` and the per-write snapshots were written after the loss.
- Check: a write that drops more than half the entries with no additions is refused; `ls ~/.claude/LIFEOS/MEMORY/OBSERVABILITY/memory-snapshots/ | tail -3` shows a snapshot per recent write; `bun ~/.claude/LIFEOS/TOOLS/MemoryRestore.ts list` prints them.
- LifeOS: `LIFEOS/TOOLS/MemoryWriter.ts`, `LIFEOS/TOOLS/MemoryRestore.ts`, `LIFEOS/DOCUMENTATION/Memory/MemorySystem.md` (§ Data-loss guard)
- RS.GE: supersede, never overwrite: `profile_facts.valid_to` and the partial unique index `profile_facts_current_uidx` (`packages/db/migrations/0002_profile_and_filings.sql`)
- Decision: D18

### A claim closes on the fact, not on the machinery, and the counter moves in the same edit
- Why: on the RS.GE Agent ISC-32 was ticked because the reconciliation script existed while no usage export had ever been run through it; the same delegate left 20 boxes ticked against `progress: 18/37`. A state of record that contradicts itself is worse than one that is behind.
- Check: every `[x]` has a line in `## Verification` naming the output that closed it; `grep -c '^- \[x\]' ISA.md` equals the numerator of `progress:` in the frontmatter.
- LifeOS: `hooks/ISAGate.hook.ts` (structural close checks), `MEMORY/OBSERVABILITY/isa-progress-mismatch.jsonl`, `LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` (§ A claim closes on the fact)
- RS.GE: `ISA.md` (`progress: 19/37` as of 2026-09-22; `## Remaining Work` names the three claims held open on purpose)
- Decision: D19

### Read one stored row back through a different path than the code that wrote it
- Why: with postgres.js, `${JSON.stringify(x)}::jsonb` stores a jsonb *string* containing JSON; `payload->>'tool'` returns NULL and the value reads back as text. It happened in `profile_facts.value` and `audit_events.payload` on 2026-09-17 while 70 tests were green, because every test asked whether rows existed and none asked what they held.
- Check: `select jsonb_typeof(payload) from audit_events limit 1` returns `object`, not `string`; for a file log, `tail -n 1 file | jq .` parses and the fields have the expected types.
- LifeOS: `LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` (§ Accepting a delegate's build: read a write back and check its shape)
- RS.GE: `test/jsonb-shape.test.ts`, `asJsonb()` in `packages/db/src/repositories.ts` (`tx.json(x)` is the fix)
- Decision: D20

### A log never prints the secret it found, and one pattern list serves the scan, the notes and the keys
- Why: a scanner that echoes its match puts the secret into the CI log it exists to protect; two regex lists kept side by side start disagreeing. RS.GE moved the patterns into `@rsge/core` the day a second caller appeared.
- Check: `bun run secret-scan` exits 0 and any finding prints `[rule:N chars]`, never a value; the memory note guard and the key probe import `scanText` or `secretScanConfig` from `packages/core/src/secret-patterns.ts` rather than carrying their own regex.
- LifeOS: `LIFEOS/TOOLS/SecretScan.ts` (TruffleHog wrapper), Cortex `<private>` span stripping (`LIFEOS/DOCUMENTATION/Memory/MemorySystem.md`)
- RS.GE: `packages/core/src/secret-patterns.ts`, `config/secret-scan.json` (12 rules, allowlist entries each with `why_en`), `secretGuard()` in `packages/memory/src/notes.ts`, `packages/core/src/key-probe.ts`; ISC-25 still open
- Decision: D20

### Installers and updaters are dry-run by default, never delete, write VERSION last, and a backup follows the symlinks
- Why: `copyMissing` cannot update an existing file, so an update without an overlay leaves the machinery stale while VERSION bumps; a partial apply that writes VERSION first claims a version it does not have. And on this machine `LIFEOS/USER` and `LIFEOS/MEMORY` are symlinks into `~/.config/LIFEOS`, so `cp -a ~/.claude` copies two links and zero memory files.
- Check: run the tool without `--apply` and read the plan; after an apply, `cat ~/.claude/LIFEOS/VERSION` changed only if the report shows zero failures; `readlink -f ~/.claude/LIFEOS/USER ~/.claude/LIFEOS/MEMORY` both resolve under `~/.config/LIFEOS`, and the backup folder contains `USER/MEMORY/KNOWLEDGE`.
- LifeOS: `skills/LifeOS/Tools/OverlaySystem.ts`, `skills/LifeOS/Tools/InstallSettings.ts`, `LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md` (§ Backup rule for LifeOS memory, 2026-08-29)
- RS.GE: `scripts/test-residue.ts` (report only unless `--remove`, never in production), `packages/db/src/migrate.ts` (an edited applied migration is a hard stop)
- Decision: D21

### A drift tooth built on git is silent in a tree that is not a repo
- Why: *live finding:* `VersionDrift.hook.ts` starts with `git -C ~/.claude tag` and returns when no tag exists; `~/.claude` is not a git repository on this machine (`git rev-parse` fails), so the nag can never fire, and the versions can drift for months with a green-looking system.
- Check: `git -C ~/.claude rev-parse --is-inside-work-tree` prints `true` and `git -C ~/.claude tag -l 'v*' | tail -1` names a tag; otherwise choose a drift check that does not need git (a checksum manifest, or a generate-and-`--check` script).
- LifeOS: `hooks/VersionDrift.hook.ts`, `LIFEOS/DOCUMENTATION/Ledger/LedgerSystem.md`
- RS.GE: `bun run check:declarations` exits 0 (`scripts/build-declaration-versions.ts --check`), `test/declaration-amendments.test.ts`
- Decision: D22

### Only routing is conditional on the grade; preservation never is
- Why: a capture dropped at the door because a grader said "not relevant" is gone, and the grader's opinion changes as TELOS changes. Synapse writes the amber ledger before any grading; RS.GE inserts the correction row before opening the fact, in one transaction, so a rejection stored without its replacement is unreachable.
- Check: in any capture path, the append happens before the first model call or scoring step; a rejected or low-scored item is still findable in the journal afterwards; for the checklist mechanism, a `<!-- ck -->` mark that the curator declined still appears in the candidates file.
- LifeOS: `LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md` (§ The One Loop; doc only on this install), `MEMORY/OBSERVABILITY/pending-proposals.jsonl` (rejected proposals keep their row with a status)
- RS.GE: `recordCorrection()` in `packages/memory/src/corrections.ts`; `packages/interview/src/documents.ts` (quarantined cells are kept as text, never dropped)
- Decision: D23
