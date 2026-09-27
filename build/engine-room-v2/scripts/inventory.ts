#!/usr/bin/env bun
/**
 * inventory.ts — generate content/inventory.json from the REAL install, redacted.
 *
 * Keeps: file paths, sizes, zone, symlink targets, hook wiring (settings.json), @-import edges
 * (CLAUDE.md), the launcher alias line.
 * Never keeps: file contents. USER/, MEMORY/, .env, projects/ transcripts and .mcp.json are
 * listed by name only (and MEMORY/, projects/ are listed as directories, not files).
 *
 * Read-only against ~/.claude and ~/.config/LIFEOS. Writes only into this repo.
 */
import { readdirSync, statSync, lstatSync, readlinkSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, relative, resolve } from 'path';
import { homedir } from 'os';
import type { Inventory, InventoryFile, InventoryHook } from '../content/schema';

const HOME = homedir();
const CLAUDE = join(HOME, '.claude');
const OUT = resolve(import.meta.dir, '../content/inventory.json');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '.vinext', '.wrangler', 'LIFEOS_RELEASES']);
/** Directories listed as a single node, never descended (private content lives here). */
const OPAQUE = ['projects', 'LIFEOS/MEMORY', 'LIFEOS/USER/MEMORY', 'MEMORY'];

function zoneOf(rel: string): InventoryFile['zone'] {
  if (rel.startsWith('LIFEOS/USER') || rel.startsWith('USER')) return 'USER';
  if (rel.startsWith('LIFEOS/MEMORY') || rel.startsWith('MEMORY') || rel.startsWith('projects')) return 'RUNTIME';
  if (rel === 'settings.json' || rel === 'CLAUDE.md' || rel === '.mcp.json' || rel === '.env') return 'INTERFACE';
  if (rel.startsWith('LIFEOS') || rel.startsWith('hooks') || rel.startsWith('skills') || rel.startsWith('agents') || rel.startsWith('commands')) return 'SYSTEM';
  return 'OTHER';
}

function walk(root: string, base: string, out: InventoryFile[], depth = 0) {
  let entries: string[];
  try { entries = readdirSync(root); } catch { return; }
  for (const name of entries.sort()) {
    const full = join(root, name);
    const rel = relative(base, full).split('\\').join('/');
    if (SKIP_DIRS.has(name)) continue;
    let st; try { st = lstatSync(full); } catch { continue; }
    if (st.isSymbolicLink()) {
      let target = ''; try { target = readlinkSync(full); } catch {}
      out.push({ path: rel, bytes: 0, zone: zoneOf(rel), symlink: target });
      // Follow USER/MEMORY symlinks one level so the tree shows the real files (names only)
      if (/USER$|MEMORY$/.test(rel) && existsSync(full)) walk(full, base, out, depth + 1);
      continue;
    }
    if (st.isDirectory()) {
      if (OPAQUE.some(o => rel === o) || rel.includes('/MEMORY/') || rel.startsWith('projects/')) {
        out.push({ path: rel + '/', bytes: 0, zone: zoneOf(rel) });
        continue;
      }
      walk(full, base, out, depth + 1);
    } else {
      out.push({ path: rel, bytes: st.size, zone: zoneOf(rel) });
    }
  }
}

function hooks(): Record<string, InventoryHook[]> {
  const s = JSON.parse(readFileSync(join(CLAUDE, 'settings.json'), 'utf8'));
  const res: Record<string, InventoryHook[]> = {};
  for (const [event, groups] of Object.entries<any>(s.hooks || {})) {
    const list: InventoryHook[] = [];
    for (const g of groups) for (const c of g.hooks || []) {
      const cmd: string = c.command || '';
      const first = cmd.split(/\s*;\s*/)[0].trim();
      const tok = first.startsWith('bun ') ? first.slice(4).trim() : first;
      const name = tok.replace(/\$\{PAI_DIR\}|\$HOME\/\.claude|\$\{HOME\}\/\.claude/g, '~/.claude').split(' ')[0];
      list.push({ command: cmd, name: name.replace(/^.*\//, ''), matcher: g.matcher || '', async: !!c.async, timeout: c.timeout, duplicate: false });
    }
    // mark duplicates: same resolved script name + matcher registered more than once
    const seen = new Map<string, number>();
    for (const h of list) { const k = h.name + '|' + h.matcher; seen.set(k, (seen.get(k) || 0) + 1); }
    for (const h of list) h.duplicate = (seen.get(h.name + '|' + h.matcher) || 0) > 1;
    res[event] = list;
  }
  return res;
}

function imports(): { from: string; to: string }[] {
  const txt = readFileSync(join(CLAUDE, 'CLAUDE.md'), 'utf8');
  return txt.split('\n').filter(l => /^@\S+/.test(l)).map(l => ({ from: 'CLAUDE.md', to: l.trim().slice(1) }));
}

function launcher() {
  try {
    const rc = readFileSync(join(HOME, '.bashrc'), 'utf8');
    const line = rc.split('\n').find(l => /^alias lifeos=/.test(l));
    if (!line) return null;
    return { alias: 'lifeos', command: line.replace(/^alias lifeos=/, '').replace(/^'|'$/g, '').replace(HOME, '~') };
  } catch { return null; }
}

const files: InventoryFile[] = [];
walk(CLAUDE, CLAUDE, files);
const cfg = join(HOME, '.config', 'LIFEOS');
const cfgFiles: InventoryFile[] = [];
if (existsSync(cfg)) walk(cfg, cfg, cfgFiles);

const inv: Inventory = {
  generatedAt: new Date().toISOString(),
  roots: [{ root: '~/.claude', alias: 'CLAUDE' }, { root: '~/.config/LIFEOS', alias: 'CONFIG' }],
  files: [...files, ...cfgFiles.map(f => ({ ...f, path: '~/.config/LIFEOS/' + f.path }))],
  hooks: hooks(),
  imports: imports(),
  launcher: launcher(),
  counts: {
    files: files.length,
    hooksOnDisk: files.filter(f => /^hooks\/[^/]+\.hook\.(ts|sh)$/.test(f.path)).length,
    skills: files.filter(f => /^skills\/[^/]+\/SKILL\.md$/.test(f.path)).length,
    agents: files.filter(f => /^agents\/[^/]+\.md$/.test(f.path)).length,
    registeredHookEntries: Object.values(hooks()).reduce((n, l) => n + l.length, 0),
    duplicateHookEntries: Object.values(hooks()).reduce((n, l) => n + l.filter(h => h.duplicate).length, 0),
  },
  redaction: 'names, sizes and wiring only; no file contents; USER/, MEMORY/, projects/ and .env never read',
};

writeFileSync(OUT, JSON.stringify(inv, null, 1));
console.log(`inventory: ${inv.files.length} entries, ${inv.counts.registeredHookEntries} hook registrations (${inv.counts.duplicateHookEntries} duplicates), ${inv.imports.length} imports → ${OUT}`);
