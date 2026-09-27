# Next steps — plain-language walkthrough

*Written 2026-08-30. Items numbered to match the list in chat. Anything marked **DONE** I already did; everything else is written as clicks and commands you can follow without knowing the internals.*

---

## 2. Cloudflare token (and a note on ElevenLabs)

**What this unlocks.** LifeOS can run scheduled jobs in Cloudflare's cloud (its "Arbol flows") and deploy small web workers. You already use Cloudflare for `geo-lander.com` DNS, so the account exists.

**What a "token" is.** A long password that grants a program *some* of your account's powers, never all of them. You create it once, paste it into a file on your machine, and LifeOS uses it instead of your login.

### Step by step

1. Go to **https://dash.cloudflare.com/profile/api-tokens** (log in as usual).
2. Click **Create Token**.
3. Scroll to **Create Custom Token** and click **Get started**.
4. Name it: `lifeos-wsl`.
5. Under **Permissions**, add these three rows (click *+ Add more* between each):

   | Section | Item | Level |
   |---|---|---|
   | Account | Workers Scripts | Edit |
   | Account | Workers KV Storage | Edit |
   | Zone | DNS | Edit |

6. Under **Account Resources**, choose **Include → your account**.
7. Under **Zone Resources**, choose **Include → All zones** (or just `geo-lander.com` if you prefer to be strict).
8. Click **Continue to summary**, then **Create Token**.
9. **Copy the token now.** Cloudflare shows it exactly once. If you lose it, you make a new one.

### Where to put it

Create the file `~/.claude/.env` (it does not exist yet). In your WSL terminal:

```bash
printf 'CLOUDFLARE_API_TOKEN=paste_your_token_here\n' >> ~/.claude/.env
chmod 600 ~/.claude/.env
```

`chmod 600` means only you can read the file. Do this every time you add a secret.

### Check it worked

```bash
bun ~/.claude/LIFEOS/TOOLS/Doctor.ts --network
```

The Cloudflare row should turn green. ⚠️ **Gotcha already recorded in your rules:** verify a Cloudflare token with a call that matches its scopes, never with `/user/tokens/verify` — that endpoint reports success for tokens that cannot actually do the job.

### ElevenLabs

You don't have an account, and that's fine. Two options:

- **Skip it permanently:** `bun ~/.claude/LIFEOS/TOOLS/Doctor.ts decline voice` — the row goes quiet forever, no nagging. LifeOS still shows desktop notifications; it just won't speak.
- **Or get one later:** free tier at elevenlabs.io, then `printf 'ELEVENLABS_API_KEY=...\n' >> ~/.claude/.env`. The voice server is already running and already answers on port 31337, so a key is genuinely the only missing piece.

---

## 3. Interceptor — the browser eyes

**What it does.** Lets me *look* at a web page: take screenshots, read what actually rendered, capture console errors. Without it, when you say "the page is blank", I can only guess.

**Why it needs you.** Chrome extensions cannot be installed from a command line. Someone has to click **Add extension** in a browser window. That's the whole reason this step isn't automated.

### Step by step (all on the Windows side, not WSL)

1. Open **File Explorer** → `C:\Users\Admin\Downloads\claude\`
2. Double-click **`Interceptor-Browser-0.23.33-windows-x64.exe`**. (I already verified its checksum against the publisher's own list, so it is the genuine file.)
3. Windows may show a blue "protected your PC" box → **More info** → **Run anyway**.
4. Follow the installer. It registers the Chrome extension for you.
5. Open Chrome. Look for the **Interceptor icon** in the toolbar, top right. If you don't see it, click the puzzle-piece icon and pin it.
6. Click the Interceptor icon. Find the field labelled **Context ID**.
7. Type exactly: `interceptor-test` and click **Save**. *(A plain name, not the random ID it may suggest. Random IDs get regenerated every time the extension reloads; a name survives.)*
8. Open a new tab, go to `chrome://version`, and find the line **Profile Path**. Copy the whole line.
9. Paste that line to me in chat.

I then fill both values into `~/.config/LIFEOS/USER/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env` and wire a shortcut so LifeOS running in WSL can call the Windows program. Then Doctor's browser row goes green.

---

## 4. Housekeeping — the remaining warnings

There were four. **One is DONE:** the missing search-index warning. The cause was a small config file (`CORTEX_INDEX_POLICY.json`) that the upgrade didn't copy across; LifeOS's policy is deliberately "no search index", and once the file was in place the warning cleared. Three remain.

### 4a. 24 memory proposals waiting for you — *worth an hour*

When the system learns something about you it isn't fully sure of, it queues it instead of writing it. 24 are waiting, some months old.

**See them:**
```bash
bun ~/.claude/LIFEOS/TOOLS/ProposalDecide.ts
```
You get a numbered list with a confidence score and a "why". Examples in your queue right now: a note that you want me internally motivated; a "benchmark-first porting" working rule; three competing entries for the Geolander project.

**Decide one:**
```bash
bun ~/.claude/LIFEOS/TOOLS/ProposalDecide.ts --help
```
Run that first, then work through the list. Four outcomes exist: accept, reject, "this already landed elsewhere", and "use this wording instead". Rejecting is a real answer, not a failure. **Watch for duplicates:** items 4, 5 and 6 are three versions of the same Geolander project row. Accept the best one and reject the rest.

### 4b. No search logged in 24 hours

Not a fault. It means nothing has queried the knowledge archive recently, so the system can't prove that path works. It clears itself the first time you ask me something that searches your notes. Try: *"what do we know about the Optimo Wolt stock race condition?"*

### 4c. Observability logs older than 30 days

30 MB of activity logs, oldest from April. Harmless, just untidy. When you want it clean:

```bash
mkdir -p ~/.claude-archive-20260829/observability
cd ~/.claude/LIFEOS/MEMORY/OBSERVABILITY
find . -name '*.jsonl' -mtime +30 -exec mv {} ~/.claude-archive-20260829/observability/ \;
```

Move, never delete. Ask me first if you'd rather I did it and re-checked health afterwards.

---

## 5. Atlas — a map of everything you own

**What it is.** A single graph of your domains, servers, apps, accounts, keys and devices, and how they depend on each other. It answers: *what do I actually own, and if this one key leaked, what could it reach?*

**Why you specifically.** Live credentials ended up in a public GitHub repo twice (Camora, GirchiFin). Atlas is the component built for exactly that blind spot.

**DONE:** the Atlas program files were missing from your install (the upgrade refreshed five folders and Atlas wasn't one of them). I copied them in. They're at `~/.claude/LIFEOS/ATLAS/`.

### What's left, and the decision you need to make

Atlas has *collectors*: small readers for Cloudflare, GitHub, systemd services, and local secret files. It can run once on demand, or every 15 minutes as a background job.

**Try it once first, before committing to anything:**
```bash
bun ~/.claude/LIFEOS/ATLAS/Atlas.ts --help
bun ~/.claude/LIFEOS/ATLAS/InstallAtlas.ts --status
```

Then decide:
- **Manual** — run it when you want a snapshot. No background process. Start here.
- **Automatic** — `bun ~/.claude/LIFEOS/ATLAS/InstallAtlas.ts` installs a timer that refreshes every 15 minutes.

I deliberately did **not** install the timer. A background job that scans your infrastructure and reads secret files is your call, not mine. The GitHub and Cloudflare collectors also stay mostly blind until step 2's token and a `gh auth login` are done, so doing this after step 2 gets you far more.

---

## 6. Small leftovers

| Item | Status |
|---|---|
| Two dead permission rules (`Write(...)` never matches; only `Edit(...)` does) | **DONE** — removed. The `Edit(...)` twins were already there, so no protection was lost. |
| Stale `VerificationExpanded.md` from 7.1.1 sitting beside the current rules | **DONE** — moved to `~/.claude-archive-20260829/`. |
| Missing `CORTEX_INDEX_POLICY.json` | **DONE** — see 4. |
| Old `~/.claude/MEMORY/` folder, 4.3 MB | **Your call** (below) |
| Statusline still the PAI-era script | **Your call** (below) |

### 6a. The old MEMORY folder

Your work history from the PAI era lives in `~/.claude/MEMORY/`. Nothing reads it now; the live one is `~/.claude/LIFEOS/MEMORY/`. Three options:

1. **Leave it.** Costs 4.3 MB and nothing else. Fine.
2. **Archive it:** `mv ~/.claude/MEMORY ~/.claude-archive-20260829/MEMORY-pai-era` — tidiest.
3. **Merge the useful part.** The `WORK/` subfolder holds old task records. Say the word and I'll fold them into the live tree and verify nothing collides.

I'd pick 2 unless you want the old task history searchable, in which case 3.

### 6b. Statusline

The bar at the bottom of your terminal is still drawn by the PAI-era `statusline-command.sh`. It works, which is why I didn't touch it. LifeOS ships its own showing TELOS progress rings and memory freshness. Switch with:

```bash
bun ~/.claude/skills/LifeOS/Tools/DeployComponents.ts --apply --components statusline
```

**Do this after the interview**, not before, or the rings will show a blank TELOS.

---

## Suggested order

1. **The interview** (item 1) — everything else is worth more once it's done.
2. **Cloudflare token** (item 2) — ten minutes.
3. **`gh auth login`** — one command, and it wakes up Atlas's GitHub collector.
4. **Atlas manual run** (item 5).
5. **Proposals** (item 4a) — an hour, and it's the one that makes the system noticeably smarter.
6. **Interceptor** (item 3) whenever you next need me to look at a web page.
7. Statusline and the old MEMORY folder last. Neither matters.
