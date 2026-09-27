# Layout regression verification

## 2026-09-10 — prompt lifecycle re-audit

- Rechecked the prompt path against the pinned LifeOS 7.40.4 hook registry and hook documentation.
- Desktop Chrome: Prompt A–Z is the default visible tab; 14-stage event rail, certainty legend, detail panel, route fork, and cross-field examples render correctly.
- Interaction: selecting stage M updates the panel to the Stop lifecycle, including StopGates and source links.
- Mobile Chromium at 390 × 844: tabs and event rail scroll horizontally; detail sections stack; branch cards and field examples remain readable.
- Production build, oxlint, source-link validation, and browser console checks passed.

Verified 2026-09-09 against the static build at http://127.0.0.1:4178/ in Chrome.

## Reproduced failure

The generated Tabs primitive uses `data-horizontal:flex-col`, but its runtime DOM has `data-orientation="horizontal"`. The variant did not match, leaving the root in a horizontal flex row. The tab list consumed 1,012px, the content panel received 429px, and the engine grid column collapsed to **0px** alongside its 405px inspector. The accessibility tree and HTTP checks still contained all the content, so those checks did not detect the visual failure.

## Fix

Application CSS explicitly selects `[data-slot="tabs"][data-orientation="horizontal"]` and applies `flex-direction: column`. Panels receive `width: 100%` and `min-width: 0`. Generated component files are unchanged.

## Browser checks performed

- At a 1,536px viewport, root direction is `column`, the engine column measures approximately 1,020px, and the rendered screenshot shows the engine and inspector together.
- Selecting Cortex changes the inspector heading to Cortex.
- Exploded view renders 25 selectable parts in five purpose groups.
- Request Next advances from step 1 to step 2. Play advances to step 3; Pause stops playback.
- Choosing “A guard blocks” resets the journey to step 1 of 6.
- The scenario picker opens and selecting “Remember a useful lesson” updates the request.
- Component search for Cortex returns its single card.
- File search for MemoryTurnStart returns one matching file.
- The starter view displays the four files; terminology search for BM25 returns that entry.
- At a 390px viewport, the engine column measures 343px, the inspector stacks below it, and document width does not exceed the viewport. The diagram keeps its own scrollable drawing area.
- No browser console errors were recorded in the verification tab.
- The temporary viewport override was reset and the guide was left open.

On future UI changes, verify rendered element widths and actual interactions, not only successful HTTP responses and source-file checks.
