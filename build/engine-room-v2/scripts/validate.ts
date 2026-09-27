#!/usr/bin/env bun
/**
 * validate.ts — refuses the build when content breaks the contract.
 *
 * Checks (each maps to a claim in the ISA):
 *  - every Step/Component has the nine fields, non-empty          (C3, C4, C6)
 *  - alternatives ≥ 2, examples ≥ 2 with one field 'distribution'  (C6)
 *  - every 🟩 step has a `without` line                            (C5)
 *  - every hook step has ≥1 payload sample                         (C4)
 *  - every [[term]] resolves in the glossary; glossary ≥ 60        (C9)
 *  - every section has breakIt / recall / transfer                 (C10)
 *  - every file touched exists in inventory or on disk (or virtual) (C3)
 *  - every source path exists on disk                              (A2)
 *  - Part 1 has 8 steps, Part 2 ≥ 20 (with substeps), 25 components (C3, C4, C6)
 *  - private-string probe on all content                           (A1)
 */
import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import type { Section, Step, Component, Term, Inventory, NineFields } from '../content/schema';

const ROOT = resolve(import.meta.dir, '..');
const HOME = homedir();
const errors: string[] = [];
const warn: string[] = [];
const err = (s: string) => errors.push(s);

export async function loadContent() {
  const { part0 } = await import('../content/layers');
  const { part1 } = await import('../content/startup');
  const { part2 } = await import('../content/prompt');
  const { part4 } = await import('../content/build');
  const { part5 } = await import('../content/distribution');
  const { glossary } = await import('../content/glossary');
  const inventory: Inventory = (await import('../content/inventory.json')).default as Inventory;
  const compDir = join(ROOT, 'content', 'components');
  const components: Component[] = [];
  if (existsSync(compDir)) {
    for (const f of readdirSync(compDir).filter(f => f.endsWith('.ts')).sort()) {
      const mod = await import(join(compDir, f));
      const c: Component = mod.component ?? mod.default;
      if (!c) err(`components/${f}: no exported \`component\``);
      else components.push(c);
    }
  }
  const part3: Section = {
    id: 'p3', number: 3, title: 'The 25 parts', kind: 'components',
    subtitle: 'Every LifeOS component, placed on the five-box map, with its alternatives and its price.',
    body: (await import('../content/parts-intro')).intro,
    components,
    breakIt: (await import('../content/parts-intro')).breakIt,
    recall: (await import('../content/parts-intro')).recall,
    transfer: (await import('../content/parts-intro')).transfer,
  };
  const sections: Section[] = [part0, part1, part2, part3, part4, part5];
  return { sections, glossary: glossary as Term[], inventory };
}

function resolvePath(p: string): string {
  if (p.startsWith('~/')) return join(HOME, p.slice(2));
  if (p.startsWith('/')) return p;
  return join(HOME, '.claude', p);
}

function checkNine(kind: string, id: string, x: NineFields, who: string) {
  const req: (keyof NineFields)[] = ['purpose', 'trigger', 'input', 'output', 'how', 'why'];
  for (const k of req) if (!x[k] || !String(x[k]).trim()) err(`${kind} ${id}: field "${k}" empty`);
  if (!x.who) err(`${kind} ${id}: who missing`);
  if (!Array.isArray(x.files)) err(`${kind} ${id}: files missing`);
  if (!x.sources || x.sources.length === 0) err(`${kind} ${id}: sources empty`);
  if (!x.alternatives || x.alternatives.length < 2) err(`${kind} ${id}: fewer than 2 alternatives`);
  if (!x.examples || x.examples.length < 2) err(`${kind} ${id}: fewer than 2 field examples`);
  else if (!x.examples.some(e => e.field === 'distribution')) err(`${kind} ${id}: no example from field "distribution"`);
  for (const s of x.sources || []) {
    const bare = s.replace(/:L?\d+(-L?\d+)?$/, '');
    if (!existsSync(resolvePath(bare))) err(`${kind} ${id}: source path does not exist: ${s}`);
  }
}

const flatIds = (steps: Step[]): string[] => steps.flatMap(s => [s.id, ...flatIds(s.substeps || [])]);

async function main() {
  const { sections, glossary, inventory } = await loadContent();
  const invPaths = new Set(inventory.files.map(f => f.path.replace(/\/$/, '')));
  const termSet = new Set<string>();
  for (const t of glossary) { termSet.add(t.term.toLowerCase()); for (const a of t.aliases || []) termSet.add(a.toLowerCase()); }
  if (glossary.length < 60) err(`glossary has ${glossary.length} terms, need ≥ 60`);

  const allText: string[] = [];
  const checkTerms = (where: string, text: string) => {
    allText.push(text);
    for (const m of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
      if (!termSet.has(m[1].toLowerCase())) err(`${where}: unresolved term [[${m[1]}]]`);
    }
  };
  const checkFiles = (where: string, files: Step['files']) => {
    for (const f of files) {
      if (f.virtual) continue;
      const p = f.path.replace(/^~\/\.claude\//, '');
      const ok = invPaths.has(p) || invPaths.has(p.replace(/\/$/, '')) || existsSync(resolvePath(f.path));
      if (!ok) err(`${where}: file not in inventory or on disk: ${f.path}`);
    }
  };
  const walkStep = (secId: string, s: Step, counter: { n: number }) => {
    counter.n++;
    const where = `${secId}/${s.id}`;
    checkNine('step', where, s, s.who);
    if (s.who === 'lifeos' && !s.without) err(`${where}: 🟩 step has no \`without\` counterfactual`);
    if (s.hook && (!s.payloads || s.payloads.length === 0)) err(`${where}: hook step has no payload sample`);
    checkFiles(where, s.files);
    for (const k of ['purpose', 'trigger', 'input', 'output', 'how', 'why', 'without', 'watch'] as const) if (s[k]) checkTerms(where + '.' + k, String(s[k]));
    for (const a of s.alternatives) checkTerms(where + '.alt', a.tradeoff);
    for (const e of s.examples) checkTerms(where + '.ex', e.text);
    for (const sub of s.substeps || []) walkStep(secId, sub, counter);
  };

  for (const sec of sections) {
    if (!sec.breakIt?.length || !sec.recall?.length || !sec.transfer?.length) err(`${sec.id}: missing breakIt/recall/transfer`);
    checkTerms(sec.id + '.body', sec.body || '');
    for (const t of [...sec.breakIt, ...sec.recall, ...sec.transfer]) checkTerms(sec.id + '.closing', t);
    const counter = { n: 0 };
    for (const s of sec.steps || []) walkStep(sec.id, s, counter);
    if (sec.id === 'p1' && counter.n !== 8) err(`p1 has ${counter.n} steps, expected 8`);
    if (sec.id === 'p2' && counter.n < 20) err(`p2 has ${counter.n} steps incl. substeps, expected ≥ 20`);
    if (sec.kind === 'components') {
      const comps = sec.components || [];
      if (comps.length !== 25) err(`p3 has ${comps.length} components, expected 25`);
      for (const c of comps) {
        checkNine('component', c.id, c, c.who);
        if (!c.status || !c.summary || !c.failure || !c.box) err(`component ${c.id}: status/summary/failure/box missing`);
        if (c.who === 'lifeos' && !c.without) err(`component ${c.id}: 🟩 component has no \`without\` counterfactual`);
        checkFiles('component ' + c.id, c.files);
        for (const k of ['purpose', 'trigger', 'input', 'output', 'how', 'why', 'summary', 'failure', 'without'] as const) if (c[k]) checkTerms(c.id + '.' + k, String(c[k]));
        for (const a of c.alternatives) checkTerms(c.id + '.alt', a.tradeoff);
        for (const e of c.examples) checkTerms(c.id + '.ex', e.text);
        for (const r of c.related) if (!comps.some(x => x.id === r)) warn.push(`component ${c.id}: related "${r}" is not a component id`);
      }
    }
  }

  // Viz — every top-level flow step has a frame; every frame/hop/component station exists (C15)
  const viz = await import('../content/viz');
  const stIds = new Set(viz.stations.map(s => s.id));
  for (const w of viz.wires) if (!stIds.has(w.from) || !stIds.has(w.to)) err(`viz wire ${w.from}→${w.to}: unknown station`);
  const stepIds = new Set<string>();
  for (const sec of sections) for (const s of flatIds(sec.steps || [])) stepIds.add(s);
  for (const [id, f] of Object.entries(viz.frames)) {
    if (!stepIds.has(id)) err(`viz frame "${id}" is not a step id`);
    for (const st of f.lit) if (!stIds.has(st)) err(`viz frame ${id}: unknown station "${st}"`);
    for (const [a, b] of f.hops || []) if (!stIds.has(a) || !stIds.has(b)) err(`viz frame ${id}: unknown hop ${a}→${b}`);
    if (!f.car) err(`viz frame ${id}: no car line`);
  }
  for (const sec of sections) for (const s of sec.steps || []) if (!viz.frames[s.id]) err(`viz: top-level step ${s.id} has no frame`);
  const compIds = new Set((sections.find(s => s.kind === 'components')?.components || []).map(c => c.id));
  for (const [cid, list] of Object.entries(viz.componentStation)) { if (!compIds.has(cid)) warn.push(`viz componentStation "${cid}" is not a component`); for (const st of list) if (!stIds.has(st)) err(`viz componentStation ${cid}: unknown station "${st}"`); }
  for (const cid of compIds) if (!viz.componentStation[cid]) err(`viz: component ${cid} has no station`);

  // A1 — private-string probe. Strings chosen from files this app must never quote.
  const probes = ['1989-10-14', 'net worth by age 40', 'never edit an applied Flyway', 'beer-craft-wolt', '62d91793f675ca9b52852222'];
  const blob = allText.join('\n') + JSON.stringify(inventory);
  for (const p of probes) if (blob.includes(p)) err(`PRIVATE STRING LEAK: "${p}" appears in content`);

  for (const w of warn) console.warn('warn:', w);
  if (errors.length) {
    console.error(`\n✗ validate: ${errors.length} error(s)`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  const steps = sections.reduce((n, s) => n + (s.steps?.length || 0), 0);
  console.log(`✓ validate: ${sections.length} sections, ${steps} top-level steps, ${sections.find(s => s.kind === 'components')?.components?.length ?? 0} components, ${glossary.length} terms, ${inventory.files.length} inventory entries`);
}

if (import.meta.main) main();
