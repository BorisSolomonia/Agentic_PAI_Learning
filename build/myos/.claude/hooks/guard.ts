// ═══ WHY THIS FILE EXISTS ════════════════════════════════════════
// One rule has to hold even when the model — or a careless prompt — wants to
// break it: SYSTEM_PROMPT.md is the constitution, and a session must never
// rewrite it from the inside. Instructions ask; a hook refuses.
// ═══ HOW IT WORKS ═════════════════════════════════════════════════
// Registered in .claude/settings.json under PreToolUse with matcher
// "Write|Edit", so the harness runs it before either tool touches disk.
// In: one JSON object on stdin describing the pending call.
// Out: exit 0 and the call proceeds; exit 2 and the call never happens, with
// whatever went to stderr handed back to the model as the reason.
// Anything unreadable or unrecognised exits 0 — a guard that fails closed
// blocks all work, which is a worse failure than the one it prevents.
// ═══ WHAT BREAKS WITHOUT IT ═══════════════════════════════════════
// The constitution can be edited by any prompt, silently, and the first you
// know of it is behaviour you cannot explain three sessions later.
// ═══ MIRROR ═══════════════════════════════════════════════════════
// LifeOS: hooks/PreToolGuard.hook.ts   RS.GE: packages/core/src/boot-guard.ts
// — a personal guard protects files; a product guard protects money and
// identity, and refuses to boot at all rather than refuse one call.

/** The one path this guard defends. Matched on the tail, so any copy counts. */
const PROTECTED = "SYSTEM_PROMPT.md";

/** What the model is told when it is stopped. Its own words, not a code. */
const REASON =
  `Blocked by .claude/hooks/guard.ts: ${PROTECTED} is the constitution of this ` +
  `system and is not editable from inside a session. If it genuinely must ` +
  `change, say so and let Boris edit it himself, outside the loop.`;

type ToolCall = {
  tool_name?: string;
  tool_input?: { file_path?: string; notebook_path?: string };
};

async function main(): Promise<void> {
  // stdin may be empty or malformed; either way that is not a reason to block.
  let payload: ToolCall;
  try {
    const raw = await Bun.stdin.text();
    payload = raw.trim() ? (JSON.parse(raw) as ToolCall) : {};
  } catch {
    process.exit(0);
  }

  const path = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path ?? "";
  const normalised = path.replace(/\/g, "/");

  if (normalised.endsWith(`/${PROTECTED}`) || normalised === PROTECTED) {
    process.stderr.write(REASON + "\n");
    process.exit(2);
  }

  process.exit(0);
}

await main();
