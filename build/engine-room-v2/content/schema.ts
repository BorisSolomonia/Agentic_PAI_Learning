/**
 * schema.ts — the content contract for Engine Room v2.
 *
 * Every step in every flow, and every one of the 25 components, carries the SAME nine fields.
 * `scripts/validate.ts` refuses to build if any is missing. This is the spec from
 * ENGINE-ROOM-GAPS.md §3.1 turned into types.
 *
 * Text fields are a small markdown subset (see scripts/build.ts renderMd): paragraphs, `code`,
 * **bold**, "- " lists, "| a | b |" tables, ``` fences, and [[term]] glossary references.
 */

/** Who performs a step. The colour code used on every page. */
export type Who =
  | 'claude-code' // 🟦 happens with or without LifeOS — the harness does it
  | 'lifeos'      // 🟩 a LifeOS file or hook; strip LifeOS and this vanishes
  | 'model'       // 🟨 the language model's own reasoning
  | 'you';        // ⬜ the human

export const WHO_LABEL: Record<Who, string> = {
  'claude-code': '🟦 Claude Code',
  lifeos: '🟩 LifeOS',
  model: '🟨 Model',
  you: '⬜ You',
};

/** The five boxes of the agent loop (Part 0). */
export type Box = 'context' | 'capability' | 'control' | 'memory' | 'verification' | 'none';

export interface FileTouch {
  /** Path relative to ~/.claude (or absolute for outside it). Must exist in inventory or be marked virtual. */
  path: string;
  mode: 'read' | 'write' | 'exec' | 'read+write';
  /** Why this file is touched here, one clause. */
  note?: string;
  /** True for things that are not files on disk (e.g. "process memory"). Skips the inventory check. */
  virtual?: boolean;
}

export interface Payload {
  /** e.g. "stdin (JSON)", "stdout", "stderr", "exit code" */
  label: string;
  /** Redacted, real-shaped sample. Never real private content. */
  text: string;
}

export interface Alternative {
  name: string;
  /** What it wins and what it costs, one or two sentences. */
  tradeoff: string;
}

export interface FieldExample {
  /** 'distribution' is required at least once per step/component. */
  field: 'distribution' | string;
  /** The same move, in that field. */
  text: string;
}

export interface HookInfo {
  name: string;          // file name, e.g. "LoadContext.hook.ts"
  event: string;         // "SessionStart" …
  matcher?: string;      // "" for all, or "Write|Edit"
  async: boolean;
  timeoutSec?: number;
  /** What exit 0 / exit 2 / stdout mean for THIS hook. */
  exitSemantics: string;
}

/** The nine fields every step and component must carry. */
export interface NineFields {
  purpose: string;                 // 1 · the problem this exists to solve
  who: Who;                        // 2 · colour code
  trigger: string;                 // 3 · exact mechanism
  input: string;                   // 4a
  output: string;                  // 4b
  files: FileTouch[];              // 5 · lit on the tree
  how: string;                     // 6 · mechanism in plain words + source path
  sources: string[];               // 6 · real paths, optional ":L10-L40"
  alternatives: Alternative[];     // 7 · ≥2
  why: string;                     // 8 · why the alternative lost
  examples: FieldExample[];        // 9 · ≥2, one from distribution
}

export interface Step extends NineFields {
  id: string;            // "S1", "P4"…
  title: string;
  /** Redacted real-shaped samples. Required for every hook step. */
  payloads?: Payload[];
  /** Required when who === 'lifeos': the one-line counterfactual shown when LifeOS is stripped. */
  without?: string;
  hook?: HookInfo;
  /** Sub-steps rendered as an expanded rail (e.g. the nine UserPromptSubmit hooks). */
  substeps?: Step[];
  /** A short "watch it" narration for the animation rail. */
  watch?: string;
}

export interface Component extends NineFields {
  id: string;
  name: string;
  box: Box;
  /** Shipped / private / blueprint / optional — honest status. */
  status: string;
  summary: string;
  related: string[];
  without?: string;
  /** Where the failure shows, one sentence. */
  failure: string;
}

export interface Term {
  term: string;
  meaning: string;
  analogy: string;
  aliases?: string[];
}

export interface Section {
  id: string;                       // "p0" … "p5"
  number: number;
  title: string;
  subtitle: string;
  kind: 'orient' | 'flow' | 'components' | 'build' | 'distribution';
  /** Markdown body for orient/build/distribution; intro for flow/components. */
  body: string;
  steps?: Step[];
  components?: Component[];
  /** The three closing blocks — required on every section. */
  breakIt: string[];
  recall: string[];
  transfer: string[];
  /** Whether the Strip-LifeOS toggle applies. */
  toggle?: boolean;
}

export interface InventoryFile { path: string; bytes: number; zone: 'SYSTEM' | 'USER' | 'INTERFACE' | 'RUNTIME' | 'OTHER'; symlink?: string }
export interface InventoryHook { command: string; name: string; matcher: string; async: boolean; timeout?: number; duplicate: boolean }
export interface Inventory {
  generatedAt: string;
  roots: { root: string; alias: string }[];
  files: InventoryFile[];
  hooks: Record<string, InventoryHook[]>;
  imports: { from: string; to: string }[];
  launcher: { alias: string; command: string } | null;
  counts: Record<string, number>;
  redaction: string;
}
