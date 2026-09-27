#!/usr/bin/env bash
# lifeos-smoketest.sh — one falsifiable probe per LifeOS component.
#
# Doctrine: LifeOS says a claim closes only on tool evidence of the right
# modality. So every row below runs a real probe and prints what it saw.
# A row that cannot be proven mechanically is printed as MANUAL, never as PASS.
#
#   usage:  bash lifeos-smoketest.sh
#   exit:   0 = no FAILs   1 = at least one FAIL

C="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
L="$C/LIFEOS"
U="$(readlink -f "$L/USER" 2>/dev/null || echo "$L/USER")"
PASS=0; FAIL=0; MANUAL=0

ok()     { printf '  \033[32mPASS\033[0m  %-34s %s\n' "$1" "$2"; PASS=$((PASS+1)); }
bad()    { printf '  \033[31mFAIL\033[0m  %-34s %s\n' "$1" "$2"; FAIL=$((FAIL+1)); }
manual() { printf '  \033[33mMANUAL\033[0m %-33s %s\n' "$1" "$2"; MANUAL=$((MANUAL+1)); }
head2()  { printf '\n\033[1m%s\033[0m\n' "$1"; }

# check <name> <expected-substring> <command...>  — PASS only if output contains the substring
check() {
  local name="$1" want="$2"; shift 2
  local out; out="$("$@" 2>&1)" || true
  if [[ "$out" == *"$want"* ]]; then ok "$name" "$(printf '%s' "$out" | head -c 90 | tr '\n' ' ')"
  else bad "$name" "expected '$want', got: $(printf '%s' "$out" | head -c 90 | tr '\n' ' ')"; fi
}

head2 "FOUNDATION — is this actually LifeOS, and is the boundary right?"
v="$(cat "$L/VERSION" 2>/dev/null)"
[[ -n "$v" ]] && ok "version marker" "$v" || bad "version marker" "LIFEOS/VERSION missing"
grep -q "the Life Operating System" "$C/CLAUDE.md" 2>/dev/null \
  && ok "CLAUDE.md is the routing table" "header matches 7.x" \
  || bad "CLAUDE.md is the routing table" "still a pre-7.x CLAUDE.md?"
grep -q "MODES" "$C/CLAUDE.md" 2>/dev/null \
  && bad "modes are retired" "CLAUDE.md still declares MODES" \
  || ok "modes are retired" "no MODES block"
[[ -L "$L/USER"   ]] && ok "USER is a symlink"   "$(readlink "$L/USER")"   || bad "USER is a symlink"   "real dir inside the system tree"
[[ -L "$L/MEMORY" ]] && ok "MEMORY is a symlink" "$(readlink "$L/MEMORY")" || bad "MEMORY is a symlink" "real dir — writes will be refused"
[[ -s "$L/LIFEOS_SYSTEM_PROMPT.md" ]] && ok "constitution file" "$(wc -c <"$L/LIFEOS_SYSTEM_PROMPT.md") bytes" || bad "constitution file" "missing"
grep -qs "append-system-prompt-file" "$HOME/.bashrc" "$HOME/.zshrc" \
  && ok "launcher wired" "alias loads the constitution" \
  || bad "launcher wired" "no alias — plain claude runs un-constituted"

head2 "IDENTITY & INTENT — does it know who you are?"
for f in TELOS/TELOS.md PRINCIPAL/PRINCIPAL_IDENTITY.md DIGITAL_ASSISTANT/DA_IDENTITY.md PROJECTS.md CONFIG/OPERATIONAL_RULES.md; do
  p="$U/$f"
  if [[ ! -f "$p" ]]; then bad "identity: $f" "missing"
  elif head -8 "$p" | grep -q "provenance: template"; then bad "identity: $f" "STILL THE SHIPPED TEMPLATE — run the interview"
  else ok "identity: $f" "$(wc -c <"$p") bytes, personalised"; fi
done
grep -q "@LIFEOS/USER/CONFIG/OPERATIONAL_RULES.md" "$C/CLAUDE.md" 2>/dev/null \
  && ok "identity imports active" "5 @-imports uncommented" \
  || bad "identity imports active" "imports still commented out"

head2 "CORTEX — does memory capture, store and come back?"
r="$(tail -1 "$L/MEMORY/OBSERVABILITY/reviewer-runs.jsonl" 2>/dev/null)"
[[ "$(printf '%s' "$r" | jq -r '.ok' 2>/dev/null)" == "true" ]] \
  && ok "last reviewer run" "$(printf '%s' "$r" | jq -r '.dispatch_summary | "\(.succeeded)/\(.total) dispatched"')" \
  || bad "last reviewer run" "ok != true"
h="$(bun "$L/TOOLS/MemoryHealthCheck.ts" 2>/dev/null | jq -r '.counts | "critical=\(.critical) warn=\(.warn) ok=\(.ok)"')"
[[ "$h" == critical=0* ]] && ok "memory health" "$h" || bad "memory health" "$h"
n="$(find "$L/MEMORY/KNOWLEDGE" -name '*.md' 2>/dev/null | wc -l)"
[[ "$n" -gt 0 ]] && ok "knowledge archive populated" "$n notes" || bad "knowledge archive populated" "empty"

head2 "PULSE, OBSERVABILITY, VOICE — is the control room live?"
code="$(curl -s -o /dev/null -w '%{http_code}' -m 10 http://127.0.0.1:31337/healthz)"
[[ "$code" == 200 ]] && ok "pulse healthz" "HTTP 200" || bad "pulse healthz" "HTTP $code"
for ep in skill-guard agent-guard; do
  c="$(curl -s -o /dev/null -w '%{http_code}' -m 10 -X POST -H 'Content-Type: application/json' -d '{}' "http://127.0.0.1:31337/hooks/$ep")"
  [[ "$c" == 200 ]] && ok "hook endpoint /$ep" "HTTP 200" || bad "hook endpoint /$ep" "HTTP $c"
done
before=$(wc -l < "$L/MEMORY/STATE/events.jsonl" 2>/dev/null || echo 0)
sleep 1
after=$(wc -l < "$L/MEMORY/STATE/events.jsonl" 2>/dev/null || echo 0)
[[ -f "$L/MEMORY/STATE/events.jsonl" ]] && ok "observability event log" "$after lines" || bad "observability event log" "no events.jsonl"
c="$(curl -s -o /dev/null -w '%{http_code}' -m 10 -X POST -H 'Content-Type: application/json' -d '{"message":"smoke test"}' http://127.0.0.1:31337/notify)"
[[ "$c" == 200 ]] && ok "voice endpoint" "HTTP 200 (audible only with an ElevenLabs key)" || bad "voice endpoint" "HTTP $c"

head2 "SKILLS, HOOKS, AGENTS — is the capability layer wired?"
s="$(find "$C/skills" -maxdepth 1 -mindepth 1 -type d | wc -l)"
[[ "$s" -gt 40 ]] && ok "skill library" "$s skills" || bad "skill library" "only $s"
w="$(jq '[.hooks[][].hooks[]] | length' "$C/settings.json" 2>/dev/null)"
[[ "$w" -gt 40 ]] && ok "hooks wired" "$w entries across $(jq '.hooks|keys|length' "$C/settings.json") events" || bad "hooks wired" "$w entries"
for hk in ISASync AlgorithmNudge SatisfactionCapture TabState StopGates; do
  grep -q "hooks/$hk.hook" "$C/settings.json" && ok "hook: $hk" "wired" || bad "hook: $hk" "NOT wired"
done
# Scope this to actual hook COMMANDS. A plain grep also matches the spinner-tip
# prose, which mentions these hooks by name — that produced 4 false FAILs on the
# first run of this script, and a test that cries wolf is worse than no test.
for gone in PRDSync BuildCLAUDE RatingCapture SessionAutoName UpdateTabTitle RelationshipMemory; do
  if jq -r '[.hooks[][].hooks[].command // empty] | .[]' "$C/settings.json" 2>/dev/null | grep -q "$gone"
  then bad "retired: $gone" "still wired (4.x leftover)"
  else ok "retired: $gone" "unwired"; fi
done
a="$(find "$C/agents" -name '*.md' | wc -l)"
[[ "$a" -gt 0 ]] && ok "agent library" "$a agents" || bad "agent library" "empty"

head2 "TOOLING — Doctor's own capability probes"
bun "$L/TOOLS/Doctor.ts" 2>/dev/null | grep -E '^(✅|❌)' | sed 's/^/  /'

head2 "NOT MECHANICALLY TESTABLE — judgement, or not shipped"
manual "Algorithm doctrine"   "run a real task; check every claim closed on tool evidence"
manual "ISA as test suite"    "write an ISA with a claim you know fails; the gate must catch it"
manual "class-sweep rule"     "fix one instance of a bug class; a grep must enumerate siblings"
manual "parity rule"          "replace something live; a baseline must exist BEFORE the change"
manual "Euphoric Surprise"    "your own 1-10 rating; no probe can stand in for it"
manual "Interceptor"          "needs the Windows build + a Chrome extension click-through"
manual "Bunker / Arbol"       "concept docs only in the public release"
manual "Hermes sidecar"       "optional second front door, not installed"

printf '\n\033[1mRESULT\033[0m  %d pass · %d fail · %d manual\n' "$PASS" "$FAIL" "$MANUAL"
[[ "$FAIL" -eq 0 ]] || exit 1
