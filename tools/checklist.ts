#!/usr/bin/env bun
// ═══ WHY THIS FILE EXISTS ════════════════════════════════════════
// You mark any line you must never forget with a small comment: <!-- ck --> at the end of a line in a
// markdown file (or // ck in TypeScript, # ck in a shell script). This tool finds those marks across the
// course folder and files them into CHECKLIST.md, so a detail noticed once is never lost in a long course.
// ═══ HOW IT WORKS ═════════════════════════════════════════════════
// 1. Finds the course root: the folder holding CHECKLIST.md, walking up from this file (or --root).
// 2. Scans every *.md under the root, and *.ts / *.sh under build/, for unfiled marks. Marks written as
//    examples (inside `backticks` or a ``` code block) are ignored, and CHECKLIST.md itself is never scanned.
// 3. Dry run (the default) only lists what it would file. --apply appends each mark to the Inbox of
//    CHECKLIST.md with the next free CK number, then stamps the mark in place (<!-- ck --> becomes
//    <!-- ck CK-026 -->), so running it twice never files anything twice. Only the mark itself changes.
// 4. --summary prints one line for the session-start hook, or nothing at all when there is nothing new.
// ═══ WHAT BREAKS WITHOUT IT ═══════════════════════════════════════
// Important details stay buried where they were noticed, and the checklist depends on memory.
// ═══ MIRROR ═══════════════════════════════════════════════════════
// LifeOS: Synapse, capture first and route later (LIFEOS/DOCUMENTATION/Synapse/SynapseSystem.md).
// RS.GE: none. The product's must-hold rules are tests and config rows, changed by review, not by marks.

import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const fail = (message: string): never => {
  process.stderr.write(`checklist: ${message}\n`);
  process.exit(2);
};

// ── settings: every name the tool depends on, in one place ──────────────────────
const CHECKLIST_FILE = "CHECKLIST.md";
const INBOX_MARKER = "<!-- inbox:"; // the line after which new items are filed
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "lifeos-reference", "kata", "tools"]);
const SKIP_DIR_PREFIXES = ["engine-room"];
const CODE_SCAN_UNDER = "build"; // *.ts and *.sh are scanned only below this folder
const MAX_TEXT = 700; // longest captured block, in characters

// ── find the course root ────────────────────────────────────────────────────────
function findRoot(): string {
  const given = option("--root");
  if (given) {
    const r = resolve(given);
    if (!existsSync(join(r, CHECKLIST_FILE))) fail(`${CHECKLIST_FILE} not found in --root ${r}`);
    return r;
  }
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(join(dir, CHECKLIST_FILE))) return dir;
    const up = dirname(dir);
    if (up === dir) return fail(`${CHECKLIST_FILE} not found above ${dirname(fileURLToPath(import.meta.url))}`);
    dir = up;
  }
}

// ── which files are scanned ─────────────────────────────────────────────────────
function listFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (SKIP_DIRS.has(name) || SKIP_DIR_PREFIXES.some((p) => name.startsWith(p))) continue;
        walk(full);
        continue;
      }
      const rel = relative(root, full);
      if (rel === CHECKLIST_FILE) continue;
      if (name.endsWith(".md")) out.push(full);
      else if ((name.endsWith(".ts") || name.endsWith(".sh")) && rel.startsWith(CODE_SCAN_UNDER + "/")) out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

// ── the three mark shapes ───────────────────────────────────────────────────────
// group 1: an existing CK id (already filed), group 2: the optional note
const MARKS: Record<string, RegExp> = {
  md: /<!--\s*ck(?:\s+(CK-\d{3,}))?\s*(?::\s*((?:(?!-->).)*?))?\s*-->/gi,
  ts: /\/\/\s*ck\b(?:\s+(CK-\d{3,}))?\s*(?::\s*(.*?))?\s*$/gi,
  sh: /(?:^|\s)#\s*ck\b(?:\s+(CK-\d{3,}))?\s*(?::\s*(.*?))?\s*$/gi,
};
const kindOf = (file: string) => (file.endsWith(".md") ? "md" : file.endsWith(".ts") ? "ts" : "sh");

// Hide `inline code` so a mark shown as an example is never taken for a real one.
const maskInlineCode = (line: string) => line.replace(/`[^`]*`/g, (s) => " ".repeat(s.length));

type Mark = {
  file: string;
  rel: string;
  lineNo: number; // 1-based
  kind: string;
  start: number; // position of the mark in the line
  length: number;
  note: string;
  text: string;
  path: string; // heading path, markdown only
};

const isHeading = (l: string) => /^#{1,6}\s/.test(l);
const isFence = (l: string) => /^\s*(```|~~~)/.test(l);
const isTableRow = (l: string) => /^\s*\|/.test(l);
const isListStart = (l: string) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
const stripMarks = (l: string) => l.replace(MARKS.md, "").replace(/\s+$/, "");

// The marked line plus the paragraph, list item or table row it belongs to.
function blockAround(lines: string[], i: number): string {
  const here = lines[i];
  if (isTableRow(here)) return stripMarks(here).trim();
  let start = i;
  if (!isListStart(here)) {
    while (start > 0) {
      const prev = lines[start - 1];
      if (!prev.trim() || isHeading(prev) || isFence(prev) || isTableRow(prev)) break;
      start--;
      if (isListStart(prev)) break;
    }
  }
  let end = i;
  while (end + 1 < lines.length) {
    const next = lines[end + 1];
    if (!next.trim() || isHeading(next) || isFence(next) || isTableRow(next) || isListStart(next)) break;
    end++;
  }
  const text = lines
    .slice(start, end + 1)
    .map((l) => stripMarks(l).trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > MAX_TEXT ? text.slice(0, MAX_TEXT - 1) + "…" : text;
}

function headingPath(lines: string[], i: number): string {
  let h2 = "";
  let h3 = "";
  for (let k = i; k >= 0; k--) {
    const l = lines[k];
    if (!h3 && /^###\s/.test(l)) h3 = l.replace(/^###\s+/, "");
    if (/^##\s/.test(l)) {
      h2 = l.replace(/^##\s+/, "");
      break;
    }
  }
  const tidy = (s: string) => s.replace(/\s*\((?:~?\d+\s*min|fade)[^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  return [h2, h3].filter(Boolean).map(tidy).join(" › ");
}

function findMarks(root: string, file: string): Mark[] {
  const kind = kindOf(file);
  const raw = readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const found: Mark[] = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (kind === "md" && isFence(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const scan = kind === "md" ? maskInlineCode(line) : line;
    const re = new RegExp(MARKS[kind].source, "gi");
    for (let m = re.exec(scan); m; m = re.exec(scan)) {
      if (m[1]) continue; // already filed: carries a CK id
      const start = kind === "sh" && /^\s/.test(m[0]) ? m.index + 1 : m.index;
      const length = kind === "sh" && /^\s/.test(m[0]) ? m[0].length - 1 : m[0].length;
      found.push({
        file,
        rel: relative(root, file),
        lineNo: i + 1,
        kind,
        start,
        length,
        note: (m[2] ?? "").trim(),
        text: kind === "md" ? blockAround(lines, i) : line.slice(0, m.index).trim() || line.trim(),
        path: kind === "md" ? headingPath(lines, i) : "",
      });
    }
  });
  return found;
}

// ── filing ──────────────────────────────────────────────────────────────────────
function nextId(checklist: string): number {
  let max = 0;
  for (const m of checklist.matchAll(/CK-(\d{3,})/g)) max = Math.max(max, Number(m[1]));
  return max + 1;
}
const idOf = (n: number) => `CK-${String(n).padStart(3, "0")}`;
const today = () => {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

function stamp(mark: Mark, id: string): string {
  const note = mark.note ? `: ${mark.note}` : "";
  if (mark.kind === "md") return `<!-- ck ${id}${note} -->`;
  if (mark.kind === "ts") return `// ck ${id}${note}`;
  return `# ck ${id}${note}`;
}

function writeAtomic(file: string, content: string) {
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, content);
  renameSync(tmp, file);
}

// ── main ────────────────────────────────────────────────────────────────────────
const root = findRoot();
const checklistPath = join(root, CHECKLIST_FILE);
const marks = listFiles(root).flatMap((f) => findMarks(root, f));

if (flag("--summary")) {
  if (marks.length) {
    const per = new Map<string, number>();
    for (const m of marks) per.set(m.rel, (per.get(m.rel) ?? 0) + 1);
    const where = [...per].map(([f, n]) => `${f} ×${n}`).join(", ");
    console.log(
      `📌 COURSE CHECKLIST: ${marks.length} unfiled ck mark${marks.length > 1 ? "s" : ""} (${where}). ` +
        `File them with: bun ${join(root, "tools/checklist.ts")} --apply, then curate the Inbox of ` +
        `${checklistPath} into full items and tell Boris what was added.`,
    );
  }
  process.exit(0);
}

if (!marks.length) {
  console.log("no unfiled marks");
  process.exit(0);
}

if (!flag("--apply")) {
  console.log(`${marks.length} unfiled mark${marks.length > 1 ? "s" : ""} (dry run: nothing changed; add --apply to file them)`);
  for (const m of marks) console.log(`  ${m.rel}:${m.lineNo}  ${m.path ? m.path + "  " : ""}"${m.text.slice(0, 90)}${m.text.length > 90 ? "…" : ""}"`);
  process.exit(0);
}

// --apply: file into the Inbox first, then stamp the marks
const checklist = readFileSync(checklistPath, "utf8");
const lines = checklist.split("\n");
const inboxAt = lines.findIndex((l) => l.startsWith(INBOX_MARKER));
if (inboxAt < 0) fail(`no "${INBOX_MARKER} …" line in ${CHECKLIST_FILE}; it marks where new items go`);
let insertAt = lines.findIndex((l, k) => k > inboxAt && /^##\s/.test(l));
if (insertAt < 0) insertAt = lines.length;
while (insertAt > inboxAt + 1 && !lines[insertAt - 1].trim()) insertAt--;

let n = nextId(checklist);
const date = today();
const entries: string[] = [];
const stamps = new Map<string, { mark: Mark; id: string }[]>();
for (const m of marks) {
  const id = idOf(n++);
  entries.push(
    `- [ ] **${id}** · \`${m.rel}:${m.lineNo}\`${m.path ? ` · ${m.path}` : ""} · marked ${date}`,
    `  > ${m.text}`,
    ...(m.note ? [`  > Note: ${m.note}`] : []),
  );
  const list = stamps.get(m.file) ?? [];
  list.push({ mark: m, id });
  stamps.set(m.file, list);
}
lines.splice(insertAt, 0, ...entries);
writeAtomic(checklistPath, lines.join("\n"));

for (const [file, list] of stamps) {
  const raw = readFileSync(file, "utf8");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const fileLines = raw.split(/\r?\n/);
  // right-to-left within a line, so earlier positions stay valid
  for (const { mark, id } of [...list].sort((a, b) => b.mark.lineNo - a.mark.lineNo || b.mark.start - a.mark.start)) {
    const l = fileLines[mark.lineNo - 1];
    fileLines[mark.lineNo - 1] = l.slice(0, mark.start) + stamp(mark, id) + l.slice(mark.start + mark.length);
  }
  writeAtomic(file, fileLines.join(eol));
}

const first = idOf(n - marks.length);
const last = idOf(n - 1);
console.log(
  `filed ${marks.length} mark${marks.length > 1 ? "s" : ""} as ${first}${marks.length > 1 ? `..${last}` : ""} into the Inbox of ${CHECKLIST_FILE}; stamped ${marks.length} mark${marks.length > 1 ? "s" : ""} in ${stamps.size} file${stamps.size > 1 ? "s" : ""}`,
);
