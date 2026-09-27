/** Part 3 wrapper text. The 25 components themselves live in content/components/<id>.ts. */

export const intro = `
Twenty-five components, each on the five-box map from Part 0, each with the same nine fields as every step in Parts 1 and 2. Pick a box on the left to see what lives in it; pick a component to read it.

Two things to hold onto while you read:

- **The box tells you what kind of thing it is.** A context component puts text in front of the model. A control component fires whether the model likes it or not. A verification component decides whether "done" is allowed. If you cannot say which box a part belongs to, you do not understand it yet.
- **The status line tells you what you can actually run.** "Code shipped" means it is on your disk and wired. "Blueprint only" means the public release ships the idea and a document, and the running version is private. The old Engine Room was honest about this and so is this one.

The **Alternatives** and **Why this way** fields are the ones the old app lacked entirely. Read them as a design review: for each part, someone chose this over two or three other real options, and the choice has a price. Knowing the price is what lets you advise a client.
`;

export const breakIt = [
  'Pick any three components and, before reading their pages, write which box you think each belongs to and what would break without it. Then read. Count how many you placed wrong; that number is your homework list.',
  'Find one component whose `status` says private or blueprint. Then look in `~/.claude/LIFEOS/DOCUMENTATION/` for its document and confirm the document exists while the runnable code does not. That is what "blueprint" means on disk.',
  'Choose the component you think is least necessary. Read its `why` field and try to argue the author out of it. If you cannot, you have learned something; if you can, write it in FAILURES.md under `capability` and tell me.',
];

export const recall = [
  'From memory, name at least three components per box. Then check the map in Part 0.',
  'Which component sits in two boxes, and why is that not a mistake?',
  'For any one component: its purpose, its trigger, one alternative, and what the alternative would have cost.',
];

export const transfer = [
  'Take the 9T ERP as it exists today and place its features on the same five boxes: what is context (the account_role registry), capability (the reconciliation endpoints), control (the Flyway migration rule), memory (Postgres), verification (the Σ-parts-equals-total controls). Notice how much of box 5 you have already built.',
  'For each of the 25 components, write one word: KEEP, ADAPT, or DROP for the 9T agent. Part 5 gives the answer key; do yours first.',
];
