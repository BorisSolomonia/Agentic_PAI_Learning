# LifeOS Engine Room

A local, interactive visual guide to LifeOS 7.40.4 and the four-file `build/myos` starter.

From the workspace root, double-click `OPEN-ENGINE-ROOM.cmd`. It starts a local static server and opens http://127.0.0.1:4178/. Node.js is required; dependencies are only needed to rebuild. Keep the launcher window open while learning. If a browser opens before the server is ready, refresh once.

## Explore

- **Engine:** select the assembled modules or switch to all 25 grouped, exploded parts. Each part explains inputs, work, outputs, failure modes, related parts, and real source paths.
- **Follow a request:** five narrated simulations with play, pause, restart, direct step selection, and alternate failure/block outcomes for checkout.
- **Parts catalog:** purpose filters and search, plus the 56 shipped top-level skills.
- **Files & wiring:** 1,949 install-payload file links and all 11 registered hook-event groups, generated from source.
- **Your starter:** explains what the four local files do and what their existence does not prove.
- **Terminology:** 30 everyday explanations and analogies.

The code-based diagram is a functional physical metaphor, not a literal mechanical engine or an observed live execution trace. No LifeOS command, integration, model, or production service is invoked by the simulations. No personal identity or TELOS contents are copied into the website.

## Source and evidence

Reference clone: `../lifeos-reference`. Pinned upstream commit: `5e2f2e8c0abde612da0e99c16c0d07d4ec21b88c`.

The architecture map starts from `CoreComponents.md` and `ARCHITECTURE_SUMMARY.md`. Flow details were refined against `hooks/hooks.json`, `MemoryTurnStart.hook.ts`, `MemoryReviewFire.hook.ts`, `PreToolGuard.hook.ts`, the install tooling, Pulse, and subsystem documentation. Every component has pinned source links.

Arbol, Feed, and Bunker are explicitly marked as private implementations with public blueprints. Synapse and Ledger are partial. Code availability is not evidence of a live or healthy installation. The system/user boundary document includes proposed and transitional pieces, and the guide labels that distinction.

## Development

Run commands in this directory:

```text
npm install
npm run dev
node scripts/catalog.mjs
node --experimental-strip-types scripts/validate.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/serve.mjs
```

`catalog.mjs` reads only public file paths, skill descriptions, hook registrations, and the presence of the four local starter files. Review and update the authored model when changing the pinned revision; refreshing an inventory alone is not an architecture review.

Source: `app/model.ts` (explanations and journeys), `app/page.tsx` (views and interactions), `app/workshop.css` (layout), `app/catalog.json` (generated inventory). Production output is `dist/client/`. The local server serves only that directory and binds only to loopback.

Validation checks source-file existence, all component relationships, scenario references, expected blueprint labels, the complete file catalog, and event registration counts. TypeScript and production prerender check compilation/rendering. Broad starter-library lint may report issues in unused generated components; authored app code is checked separately. After a reported layout failure, the rendered layout and main interactions were checked in Chrome; see [BROWSER-CHECKS.md](BROWSER-CHECKS.md) for the reproduced cause, fix, desktop and phone-width measurements, and interaction results.

The generated starter dependencies have npm advisories. The deliverable is static HTML/CSS/JS served by the Node standard library, with no deployed React server or Cloudflare runtime. The development server should remain local. Dependency upgrades require a separate compatibility review before using this starter as a production server application.
