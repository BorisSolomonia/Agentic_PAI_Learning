import type { Who } from './schema';

/**
 * viz.ts — the animated engine diagram.
 *
 * Stations are the parts of the machine, laid out on a 1100×440 canvas. Wires are the paths a
 * prompt, a file or a result can travel. A frame maps one step (S1…, P1…, P2.4…) to the stations
 * it lights, the wire hops the token travels, and the car-ignition analogy for that moment.
 * Substeps without their own frame inherit their parent's stations and get their own short line.
 */

export interface Station { id: string; label: string; sub?: string; who: Who; x: number; y: number; w: number; h: number; box?: string }
export interface Wire { from: string; to: string }
export interface Frame { lit: string[]; hops?: [string, string][]; car: string; note?: string }

export const canvas = { w: 1100, h: 440 };

export const stations: Station[] = [
  // Row A — what exists before a prompt
  { id: 'you',          label: 'You',                 sub: 'terminal',                          who: 'you',         x: 20,  y: 28,  w: 120, h: 62 },
  { id: 'launcher',     label: 'Launcher',            sub: 'LIFEOS/TOOLS/lifeos.ts',            who: 'lifeos',      x: 160, y: 28,  w: 140, h: 62 },
  { id: 'harness',      label: 'Claude Code',         sub: 'settings.json · CLAUDE.md loader',  who: 'claude-code', x: 320, y: 28,  w: 170, h: 62 },
  { id: 'constitution', label: 'Constitution',        sub: 'LIFEOS_SYSTEM_PROMPT.md',           who: 'lifeos',      x: 510, y: 28,  w: 160, h: 62, box: 'context' },
  { id: 'identity',     label: 'Identity files',      sub: 'TELOS · IDENTITY · PROJECTS · RULES', who: 'lifeos',    x: 690, y: 28,  w: 130, h: 62, box: 'context' },
  { id: 'memory',       label: 'Memory',              sub: 'hot files · MEMORY/',               who: 'lifeos',      x: 840, y: 28,  w: 110, h: 62, box: 'memory' },
  { id: 'dash',         label: 'Dashboard',           sub: 'statusline · Pulse · voice',        who: 'lifeos',      x: 970, y: 28,  w: 110, h: 62 },
  // Row B — the turn
  { id: 'hooksStart',   label: 'SessionStart hooks',  sub: 'HookHealer · LoadContext · caches', who: 'lifeos',      x: 20,  y: 170, w: 140, h: 88, box: 'control' },
  { id: 'hooksPrompt',  label: 'Prompt hooks',        sub: 'MemoryTurnStart · DriftReminder · AlgorithmNudge · 7 async', who: 'lifeos', x: 180, y: 170, w: 140, h: 88, box: 'control' },
  { id: 'context',      label: 'Context',             sub: 'system prompt + files + hook output, in order', who: 'claude-code', x: 340, y: 170, w: 150, h: 88, box: 'context' },
  { id: 'model',        label: 'MODEL',               sub: 'text in → text out · decides, never acts', who: 'model',   x: 510, y: 160, w: 160, h: 108 },
  { id: 'guards',       label: 'PreTool guards',      sub: 'SecurityValidator · ContextReduction · PreToolGuard (exit 2)', who: 'lifeos', x: 690, y: 170, w: 130, h: 88, box: 'control' },
  { id: 'permission',   label: 'Permission gate',     sub: 'allow · deny · ask',                who: 'claude-code', x: 840, y: 170, w: 110, h: 88, box: 'control' },
  { id: 'world',        label: 'Tools · the world',   sub: 'files · shell · web · skills',      who: 'claude-code', x: 970, y: 170, w: 110, h: 88, box: 'capability' },
  // Row C — after the tool
  { id: 'transcript',   label: 'Transcript',          sub: 'projects/…jsonl',                   who: 'claude-code', x: 20,  y: 330, w: 140, h: 70 },
  { id: 'skills',       label: 'Skills',              sub: 'SKILL.md loaded on demand',         who: 'lifeos',      x: 180, y: 330, w: 140, h: 70, box: 'capability' },
  { id: 'answer',       label: 'Answer',              sub: 'printed to you',                    who: 'claude-code', x: 340, y: 330, w: 150, h: 70 },
  { id: 'stopgates',    label: 'Stop gates',          sub: 'cache · voice · StopGates (block) · review cadence', who: 'lifeos', x: 510, y: 330, w: 160, h: 70, box: 'verification' },
  { id: 'observers',    label: 'PostTool observers',  sub: 'EventLogger · ISASync · loop detector', who: 'lifeos',  x: 690, y: 330, w: 130, h: 70, box: 'control' },
  { id: 'review',       label: 'Memory review',       sub: 'later, detached',                   who: 'lifeos',      x: 840, y: 330, w: 110, h: 70, box: 'memory' },
  { id: 'sessionEnd',   label: 'SessionEnd hooks',    sub: 'learning · cleanup · integrity',    who: 'lifeos',      x: 970, y: 330, w: 110, h: 70, box: 'memory' },
];

export const wires: Wire[] = [
  { from: 'you', to: 'launcher' }, { from: 'launcher', to: 'harness' },
  { from: 'harness', to: 'constitution' }, { from: 'harness', to: 'identity' }, { from: 'harness', to: 'hooksStart' }, { from: 'harness', to: 'dash' },
  { from: 'hooksStart', to: 'memory' }, { from: 'hooksStart', to: 'context' },
  { from: 'constitution', to: 'context' }, { from: 'identity', to: 'context' },
  { from: 'you', to: 'hooksPrompt' }, { from: 'hooksPrompt', to: 'memory' }, { from: 'hooksPrompt', to: 'context' },
  { from: 'context', to: 'model' }, { from: 'model', to: 'guards' }, { from: 'guards', to: 'permission' }, { from: 'permission', to: 'world' },
  { from: 'world', to: 'observers' }, { from: 'observers', to: 'model' },
  { from: 'model', to: 'skills' }, { from: 'skills', to: 'context' },
  { from: 'model', to: 'stopgates' }, { from: 'stopgates', to: 'answer' }, { from: 'answer', to: 'you' },
  { from: 'stopgates', to: 'review' }, { from: 'review', to: 'memory' },
  { from: 'model', to: 'transcript' }, { from: 'you', to: 'sessionEnd' }, { from: 'sessionEnd', to: 'memory' },
];

/** The car: key → starter → ECU → fuel → spark → power → wheels → sensors → emissions test → logbook. */
export const frames: Record<string, Frame> = {
  // ---- Part 1 · session start
  S1: { lit: ['you', 'launcher'], hops: [['you', 'launcher']], car: 'Key into the ignition. Nothing has turned yet.' },
  S2: { lit: ['launcher', 'harness'], hops: [['launcher', 'harness']], car: 'You turn the key. The starter motor engages and the engine begins to crank.' },
  S3: { lit: ['harness', 'constitution'], hops: [['harness', 'constitution']], car: 'The engine control unit wakes and reads its map: which fuel, which sensors, which limits.' },
  S4: { lit: ['harness', 'identity'], hops: [['harness', 'identity']], car: 'The driver profile loads: seat, mirrors, your saved destinations.' },
  S5: { lit: ['hooksStart', 'memory', 'dash'], hops: [['harness', 'hooksStart'], ['hooksStart', 'memory']], car: 'Pre-start checks: the fuel pump primes, the self-test runs, yesterday\'s fault codes are read.' },
  S6: { lit: ['context', 'constitution', 'identity', 'hooksStart'], hops: [['constitution', 'context'], ['identity', 'context'], ['hooksStart', 'context']], car: 'Fuel and air are mixed in the manifold, in the right order. Nothing has fired.' },
  S7: { lit: ['dash'], hops: [['harness', 'dash']], car: 'The dashboard lights come on: fuel level, temperature, warnings.' },
  S8: { lit: ['you'], car: 'Engine idling. Foot off the pedal. No fuel is burning for you yet.' },
  // ---- Part 2 · one prompt
  P1: { lit: ['you', 'hooksPrompt'], hops: [['you', 'hooksPrompt']], car: 'You press the accelerator.' },
  P2: { lit: ['hooksPrompt', 'memory'], hops: [['hooksPrompt', 'memory'], ['hooksPrompt', 'context']], car: 'Ten sensors read the pedal press and the ECU adjusts the mixture before injection.' },
  'P2.1': { lit: ['hooksPrompt', 'dash'], car: 'A sensor writes the trip name on the dashboard. The engine does not wait for it.' },
  'P2.2': { lit: ['hooksPrompt', 'memory'], car: 'A sensor reads how the last trip went and logs it.' },
  'P2.3': { lit: ['hooksPrompt'], car: 'A sensor hears "remind me" and drops a note in the glovebox.' },
  'P2.4': { lit: ['hooksPrompt', 'memory', 'context'], hops: [['hooksPrompt', 'memory'], ['hooksPrompt', 'context']], car: 'The ECU pulls yesterday\'s notes and adds them to the mixture. This one the engine waits for.' },
  'P2.5': { lit: ['hooksPrompt'], car: 'A sensor recognises a design trip and pins the checklist for it.' },
  'P2.6': { lit: ['hooksPrompt', 'dash'], car: 'A sensor notices the service sticker is out of date and says so.' },
  'P2.7': { lit: ['hooksPrompt', 'context'], hops: [['hooksPrompt', 'context']], car: 'The ECU states the emissions target before the burn, not after.' },
  'P2.8': { lit: ['hooksPrompt', 'context', 'skills'], hops: [['hooksPrompt', 'context']], car: 'The ECU tells the engine a better gear exists for this hill.' },
  'P2.9': { lit: ['hooksPrompt'], car: 'The clock on the dash is set to now.' },
  'P2.10': { lit: ['hooksPrompt', 'dash'], car: 'A sensor checks that the engine fitted is the one on the spec sheet.' },
  P3: { lit: ['context', 'model'], hops: [['context', 'model']], car: 'Fuel is injected into the cylinder. This is where the money burns.' },
  P4: { lit: ['model'], car: 'Spark. Combustion. The one moment the engine actually thinks.' },
  P5: { lit: ['model', 'guards'], hops: [['model', 'guards']], car: 'The piston pushes the crankshaft: power wants to leave the engine.' },
  P6: { lit: ['guards'], car: 'Traction control checks the road before any power reaches the wheels.' },
  'P6.1': { lit: ['guards'], car: 'Is this manoeuvre on the never-do list? Then no power at all.' },
  'P6.2': { lit: ['guards'], car: 'The gearbox quietly picks a lower-noise gear for the same move.' },
  'P6.3': { lit: ['guards'], car: 'The one hard interlock: a red light here and the car does not move.' },
  P7: { lit: ['permission'], hops: [['guards', 'permission']], car: 'The clutch. Nothing moves unless the driver\'s own rules allow it.' },
  'P7.1': { lit: ['permission'], car: 'Known-safe moves get a pre-approved clutch; the rest ask the driver.' },
  P8: { lit: ['world'], hops: [['permission', 'world']], car: 'The wheels turn. The car actually moves.' },
  P9: { lit: ['observers', 'transcript'], hops: [['world', 'observers']], car: 'Wheel-speed sensors report back to the ECU.' },
  'P9.1': { lit: ['observers'], car: 'The ECU notices if the wheels are spinning in place.' },
  'P9.2': { lit: ['observers', 'memory', 'dash'], car: 'The trip computer and the dashboard update the moment the odometer ticks.' },
  'P9.3': { lit: ['observers', 'transcript'], car: 'The black box records the tick. Nobody reads it on a good day.' },
  P10: { lit: ['model', 'observers'], hops: [['observers', 'model']], car: 'The ECU decides: another cycle, or coast to the destination.' },
  P11: { lit: ['stopgates'], hops: [['model', 'stopgates']], car: 'The emissions test at the garage door. The car does not leave until it passes.' },
  'P11.1': { lit: ['stopgates', 'memory'], car: 'The last reading is filed so the next trip can compare.' },
  'P11.2': { lit: ['stopgates', 'dash'], car: 'The horn: one toot to say the trip is done.' },
  'P11.3': { lit: ['stopgates', 'review'], car: 'A mechanic later checks whether a long trip got the fuel it deserved.' },
  'P11.4': { lit: ['stopgates'], car: 'The inspector checks the paperwork against the trip, not the driver\'s word. Fail and you go back in.' },
  'P11.5': { lit: ['stopgates', 'review'], car: 'The service interval counter ticks; at the threshold the service is booked.' },
  P12: { lit: ['answer', 'you'], hops: [['stopgates', 'answer'], ['answer', 'you']], car: 'You feel the car arrive.' },
  P13: { lit: ['review', 'memory'], hops: [['stopgates', 'review'], ['review', 'memory']], car: 'After the trip, the service log is rewritten: what changed, what to remember.' },
  P14: { lit: ['sessionEnd', 'memory', 'transcript'], hops: [['you', 'sessionEnd'], ['sessionEnd', 'memory']], car: 'Engine off. Logbook filled in. Keys on the hook.' },
};

/** Where each of the 25 components lives on the engine. */
export const componentStation: Record<string, string[]> = {
  telos: ['identity'], context: ['harness', 'constitution'], algorithm: ['constitution', 'model'], isa: ['memory', 'stopgates'],
  cortex: ['memory', 'hooksPrompt', 'review'], synapse: ['memory'], conduit: ['memory'], feed: ['memory'], hermes: ['you'],
  skills: ['skills'], tools: ['world'], agents: ['model', 'world'], arbol: ['world'],
  hooks: ['hooksStart', 'hooksPrompt', 'guards', 'observers', 'stopgates', 'sessionEnd'], security: ['guards', 'permission', 'observers'],
  boundary: ['harness', 'identity'], bunker: ['stopgates'],
  pulse: ['dash'], observability: ['observers', 'transcript'], learning: ['review', 'sessionEnd'], atlas: ['memory'], ledger: ['dash'],
  voice: ['dash', 'stopgates'], doctor: ['dash'], spinner: ['dash'],
};
