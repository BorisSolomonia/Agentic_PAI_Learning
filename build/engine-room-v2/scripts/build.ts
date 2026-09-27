#!/usr/bin/env bun
/**
 * build.ts — content/*.ts + inventory.json → dist/index.html (one file, no external resources).
 * Runs validate.ts first; a failing validation aborts the build.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { loadContent } from './validate';
import { canvas, stations, wires, frames, componentStation } from '../content/viz';
import type { Step, Component, Inventory } from '../content/schema';

const ROOT = resolve(import.meta.dir, '..');

async function main() {
  // 1. validate (throws / exits on failure)
  const v = Bun.spawnSync(['bun', join(ROOT, 'scripts', 'validate.ts')], { stdout: 'inherit', stderr: 'inherit' });
  if (v.exitCode !== 0) process.exit(v.exitCode);

  const { sections, glossary, inventory } = await loadContent();

  // 2. trim the inventory to what the page needs
  const byPath = new Map(inventory.files.map(f => [f.path.replace(/\/$/, ''), f]));
  const touched: Record<string, { zone: string; bytes: number; symlink?: string; exists: boolean }> = {};
  const noteTouch = (p: string) => {
    const key = p.replace(/^~\/\.claude\//, '').replace(/\/$/, '');
    if (touched[key]) return;
    const f = byPath.get(key);
    touched[key] = f ? { zone: f.zone, bytes: f.bytes, symlink: f.symlink, exists: true } : { zone: key.startsWith('~/') ? 'USER' : 'OTHER', bytes: 0, exists: true };
  };
  const walkSteps = (steps: Step[] = []) => { for (const s of steps) { for (const f of s.files) if (!f.virtual) noteTouch(f.path); walkSteps(s.substeps); } };
  for (const sec of sections) { walkSteps(sec.steps); for (const c of sec.components || []) for (const f of c.files) if (!f.virtual) noteTouch(f.path); }

  const dirs: Record<string, { files: number; bytes: number; zone: string }> = {};
  for (const f of inventory.files) {
    if (f.path.startsWith('~/')) continue;
    const parts = f.path.split('/');
    const key = parts[0] === 'LIFEOS' && parts.length > 2 ? parts.slice(0, 2).join('/') : parts[0];
    const d = dirs[key] ||= { files: 0, bytes: 0, zone: f.zone };
    if (!f.path.endsWith('/')) { d.files++; d.bytes += f.bytes; }
  }

  const inv = {
    generatedAt: inventory.generatedAt,
    launcher: inventory.launcher,
    imports: inventory.imports,
    hooks: inventory.hooks,
    counts: inventory.counts,
    redaction: inventory.redaction,
    touched,
    dirs,
  };

  const data = { sections, glossary, inv, viz: { canvas, stations, wires, frames, componentStation }, builtAt: new Date().toISOString() };
  const json = JSON.stringify(data).replace(/<\//g, '<\\/');

  const css = readFileSync(join(ROOT, 'scripts', 'app.css'), 'utf8');
  const js = readFileSync(join(ROOT, 'scripts', 'app.js'), 'utf8');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LifeOS Engine Room</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#0f172a"/><circle cx="8" cy="8" r="4" fill="#38bdf8"/></svg>')}">
<style>${css}</style>
</head>
<body>
<div id="app" aria-live="polite"></div>
<script id="data" type="application/json">${json}</script>
<script>${js}</script>
</body>
</html>`;

  mkdirSync(join(ROOT, 'dist'), { recursive: true });
  writeFileSync(join(ROOT, 'dist', 'index.html'), html);
  const kb = Math.round(Buffer.byteLength(html) / 1024);
  console.log(`✓ build: dist/index.html (${kb} KB) · ${sections.length} sections · ${Object.keys(touched).length} touched files · ${glossary.length} terms`);
}

main();
