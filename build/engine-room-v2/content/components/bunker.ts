import type { Component } from '../schema';

export const component: Component = {
  id: 'bunker',
  name: 'Bunker',
  box: 'verification',
  status: 'Blueprint only, private implementation. The concept document ships in the public release; the reference implementation and its `bunker` command are private infrastructure and are not in the release payload.',
  summary: 'Bunker is the standard set of plumbing every app you ship sits inside, and the app\'s own spec doubles as the test suite that keeps checking it long after you stopped looking.',
  purpose: 'Every application needs the same invisible machinery: backups, a deploy path with a way back, health checks, sign-in, security headers. Building it once per app produces several drifting copies, and skipping any of it produces a public failure.',
  who: 'lifeos',
  trigger: 'Three ways. Running the harness command against an [[ISA]] reads its test table and runs every [[probe]] in it. A deploy must register the app in the two always-on planes as part of the same motion. After that, a cloud health worker runs the compiled checks continuously and an hourly outside-in security scan runs from [[Arbol]].',
  input: 'The application\'s own `ISA.md` or `bunker.isa.md`, specifically the table under its `## Test Strategy` heading, which carries one row per [[ISC]] with a type, a check, a threshold and the command that runs it.',
  output: 'A pass or fail per [[probe]], a green, orange or red grade rendered on the [[Pulse]] dashboard\'s Bunker page, and an alert when a slow check fails.',
  files: [
    { path: 'LIFEOS/DOCUMENTATION/Bunker/BunkerSystem.md', mode: 'read', note: 'the concept document, which is the whole of what ships publicly' },
    { path: 'LIFEOS/DOCUMENTATION/ISA/ISAFormat.md', mode: 'read', note: 'defines the test table columns and the three verifier classes Bunker sorts on' },
    { path: 'the application\'s bunker.isa.md', mode: 'read', virtual: true, note: 'lives in the app\'s own repository, not in this tree; it is the spec, the manifest and the test suite in one file' },
  ],
  how: 'An app declares a type, and the type decides which components switch on across six planes: data, control, observability, identity, security and, for commercial apps, commerce. The app keeps everything a user sees, the design, the content, the domain rules. Bunker keeps the layer nobody sees. The doc\'s own phrasing is the clearest statement of the split: standardise the pipes, never the paint.\n\nThe idea that makes it more than a checklist is that the harness speaks [[ISA]]. One file is the spec, the component manifest, the executable test suite and the app\'s stored current state. A criterion\'s [[probe]] is its test case, so adding a feature means adding [[claim]]s to the spec that do not hold yet, and between builds the spec is the record of what the app is. Bunker runs exactly one of the three verifier classes the ISA format defines, the [[deterministic]] rows where a tool says no. Rows judged by a model and rows attested by a person are reported on the dashboard but never executed here.\n\nA second column splits jurisdiction in time. Fast rows, seconds long, are the only thing allowed to block: the development loop, the deploy gate, the close gate. Deep rows, soak tests and full sweeps, run on Bunker\'s own clock, locally on a schedule and hourly in the cloud, and a deep failure raises an alert and flips the app\'s grade without ever blocking a ship. Development stays quick because the blocking surface is small, and the expensive checking still happens on somebody else\'s time. The registration rule is the hard edge: every public deployment joins both always-on planes in the same motion as the deploy, and there is no deploy now and register later.',
  sources: [
    'LIFEOS/DOCUMENTATION/Bunker/BunkerSystem.md',
    'LIFEOS/DOCUMENTATION/CoreComponents.md',
    'LIFEOS/DOCUMENTATION/ISA/ISAFormat.md:L424-L445',
    'LIFEOS/DOCUMENTATION/Security/README.md',
  ],
  alternatives: [
    { name: 'Build the invisible layer fresh in each application', tradeoff: 'Wins a perfect fit for each app and no shared abstraction to fight. Costs several drifting copies of the same machinery, where a fix made in one app never reaches the other four.' },
    { name: 'Keep the specification and the test suite as separate artifacts', tradeoff: 'Wins familiarity, because that is how nearly everyone works, and lets each be written in its natural form. Costs drift between them: the spec describes an app that no longer exists while the tests pass, and nothing forces the two back together.' },
    { name: 'Rent the layer from a hosting platform', tradeoff: 'Wins immediate coverage of deploys, backups and uptime with no code of your own. Costs the security plane specifically, since an outside-in scan of your own auth boundaries and exposed paths is not something a generic platform performs for you, and it costs portability.' },
  ],
  why: 'Making one file be both the spec and the test suite is the whole bet. It removes the failure mode where a written specification and a test folder describe two different applications, because a criterion and its probe are the same row. It also gives verification a home after the build ends: the [[Algorithm]] climbs toward an ideal state while you are working, and Bunker holds the app to that ideal state for as long as it lives. The tier split is what makes that affordable, since only the seconds-long checks are allowed to stand in your way. The costs are large and stated plainly. The reference implementation is private, so the public release ships the design and you build your own against it. And the registration rule means shipping is heavier by a step, which is precisely the step people skip when it is optional.',
  examples: [
    { field: 'distribution', text: 'A wholesaler ships a customer ordering portal. Its spec carries a row asserting that a signed-out visitor requesting another customer\'s order returns a refusal, and a row asserting the nightly stock feed actually landed rows today. Both are fast checks, so both block the deploy. A slow row that replays a full day of orders against the pricing rules runs hourly instead and only raises an alert. The portal answering with a page is not the same as the portal doing its job, which is why the stock-feed row exists at all.' },
    { field: 'power plant', text: 'A generating station does not rely on the crew noticing that a pump sounds wrong. Interlocks that trip in seconds are wired into the start sequence and will refuse to let it run, while the slow work, vibration trending, oil analysis, thermal surveys, happens on a maintenance calendar and produces a work order rather than a shutdown. The commissioning document listing what each system must do is the same document the inspector tests against, which is exactly the trick of a spec that is also the test suite.' },
  ],
  related: ['isa', 'arbol', 'security', 'pulse', 'algorithm'],
  without: 'Without this: every app you ship grows its own hand-rolled backups, deploys, health checks and security headers, and the one you forgot is the one that fails in public.',
  failure: 'An application is live and nobody can say when it was last checked or by what, because it was deployed without being registered in the health and security planes, so it is invisible to both.',
};
