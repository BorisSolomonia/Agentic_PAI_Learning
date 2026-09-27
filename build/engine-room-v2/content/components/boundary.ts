import type { Component } from '../schema';

export const component: Component = {
  id: 'boundary',
  name: 'System / User boundary',
  box: 'control',
  status: 'Code shipped. Four zones, three enforcement layers, plus a settings merge and a system overlay that keep the shared half updatable without touching the private half.',
  summary: 'Every file in the install belongs to exactly one of four zones, so the parts anyone can share and the parts that are yours alone never end up in the same file.',
  purpose: 'The same tree holds code meant for everyone and a life meant for one person. Without a declared line between them, the shareable half slowly absorbs real names, hostnames and credentials, and every release becomes a scrubbing exercise.',
  who: 'lifeos',
  trigger: 'Three moments. At [[session]] start an [[async hook]] runs `LIFEOS/TOOLS/MergeSettings.ts` to regenerate [[settings.json]] from a system file plus a user overlay. On any Write, Edit or MultiEdit, `hooks/PreToolGuard.hook.ts` routes to the system-file guard. At release time the build gates run as a last backstop.',
  input: 'For the merge, a system settings file and an optional user overlay. For the guard, the target path plus the content about to be written. For the zone decision, the four-zone table in the boundary document.',
  output: 'A regenerated [[settings.json]], and either an allowed write or [[exit code 2]] with a message naming which pattern the write tried to put into a [[SYSTEM zone]] file.',
  files: [
    { path: 'LIFEOS/TOOLS/MergeSettings.ts', mode: 'exec', note: 'deep-merges a system settings file with a user overlay; user values win, and it no-ops cleanly when the overlay is absent' },
    { path: 'settings.json', mode: 'write', note: 'a generated artifact, which is why hand edits to it are overwritten on the next merge' },
    { path: 'hooks/SystemFileGuard.hook.ts', mode: 'exec', note: 'the write-time check: blocks deny-list content landing in a SYSTEM file, and fails open on its own errors' },
    { path: 'hooks/lib/containment-zones.ts', mode: 'read', note: 'the path patterns that decide what is private, including the underscore-prefixed private skills' },
    { path: 'skills/LifeOS/Tools/OverlaySystem.ts', mode: 'exec', note: 'the update path: refreshes system-owned trees, never touches the user tree, deletes nothing' },
    { path: 'LIFEOS/TOOLS/LifeosConfig.ts', mode: 'read', note: 'the typed loader that is the sanctioned way for system code to read user values' },
  ],
  how: '`LIFEOS/DOCUMENTATION/SystemUserBoundary.md` puts every file into one of four zones. [[SYSTEM zone]] is public by construction: code, docs and templates containing zero references to any specific person, project, hostname or credential, using placeholders only. [[USER zone]] is private and may contain anything. [[INTERFACE zone]] is the contract between them, the schema shipping in SYSTEM while the values ship in USER. [[RUNTIME zone]] is ephemeral state that is never shipped and never edited by hand.\n\nSystem code is allowed to reach user data through exactly four channels: the typed loader, a path computed from a value the loader returned, an [[@-import]] declared at startup in [[CLAUDE.md]], or an HTTP call to the local [[Pulse]] server. Anything else, a hardcoded `LIFEOS/USER/` string in a module, a real voice ID in source, is a violation. On this machine the physical arrangement makes the line concrete: `LIFEOS/USER` and `LIFEOS/MEMORY` are both [[symlink]]s into a separate directory outside the install, so the private bytes live in their own repository and the [[symlink]] exists only so the harness\'s import resolver can find identity files at session start.\n\nEnforcement is three independent layers, each catching a different drift mode. Write time is the guard in the pre-tool dispatcher, which blocks the moment a private-looking value would land in a shared file, while the fix is still one line. Pull-request time runs a deny-list check in continuous integration. Release time runs the build gates as a backstop. Two shipped tools keep the split maintainable rather than merely declared: the settings merge, which regenerates the registration file from a system half plus a user overlay, and the system overlay tool, whose header lists the trees it will overwrite, states that the user tree and per-install state are never touched, and notes that it writes the version marker last so a half-finished update cannot present as complete.',
  sources: [
    'LIFEOS/DOCUMENTATION/SystemUserBoundary.md',
    'LIFEOS/TOOLS/MergeSettings.ts:L1-L33',
    'skills/LifeOS/Tools/OverlaySystem.ts:L1-L60',
    'LIFEOS/DOCUMENTATION/Hooks/HookSystem.md',
    'LIFEOS/DOCUMENTATION/Skills/SkillSystem.md',
  ],
  alternatives: [
    { name: 'Scrub the tree before every release', tradeoff: 'Wins zero runtime cost and no guard to maintain. Costs continuous drift: this is what LifeOS did through two major versions, and the doc records the result, that the maintainer and the community ran different artifacts and every release needed a fresh sanitisation sweep.' },
    { name: 'Two separate repositories, synchronised by hand', tradeoff: 'Wins a hard physical wall that no bug can cross. Costs a permanent copying tax, and the two copies diverge in exactly the places nobody remembers to copy.' },
    { name: 'Keep everything private and never publish', tradeoff: 'Wins total safety with no mechanism at all. Costs the point of the exercise: nobody else can run the system, and no fix from outside can come back in.' },
  ],
  why: 'The chosen answer is a structural one rather than a procedural one. Because the boundary is a property of where a file lives and is checked when a write happens, the question "is the shared tree safe to publish?" is answered continuously instead of re-answered by a sweep before each release. The success criterion is stated as a number rather than a feeling: the leak check reports zero real leaks on the live tree with no scrubbing step having run. The costs are worth naming. Contributors hit refusals for content that looks fine to them and have to learn where the value belongs. Configuration becomes a generated artifact, so editing it directly is silently undone. And the guard deliberately fails open on its own errors, meaning it is a first line rather than a wall, which is precisely why two more layers sit behind it.',
  examples: [
    { field: 'distribution', text: 'A wholesaler builds a discount engine they want to reuse across three depots. The rule shapes, tier thresholds, a rounding policy, an effective-date field, go in the shared half as a schema with placeholder values. The actual numbers, this customer gets twelve percent from the first of March, live in the private half and are read through the typed loader. Someone pasting a real customer name into the shared schema as a helpful example gets refused at the moment of writing, with a message saying to use a placeholder and put the real name where customer data belongs.' },
    { field: 'orchestra', text: 'An orchestra works from one published score that every ensemble in the world can buy, while each player\'s own part carries their bowings, breath marks and fingerings in pencil. The two never merge. If a conductor\'s personal marking found its way into the printed score, every other orchestra would inherit a decision that was never theirs, which is exactly what a real hostname in a shared configuration file does.' },
  ],
  related: ['security', 'hooks', 'skills', 'ledger', 'cortex'],
  without: 'Without this: your identity, credentials and client data sit in the same tree as the code you want to share, and the only thing between them and a public push is remembering to scrub.',
  failure: 'You find out at release time instead of write time: a leak check turns up a real hostname, path or credential inside a file that ships, which means the write-time guard was not in the path when it landed.',
};
