/* Engine Room v2 — client app. Vanilla JS, no dependencies. Data is inlined by build.ts. */
(function () {
  'use strict';
  const DATA = JSON.parse(document.getElementById('data').textContent);
  const SECTIONS = DATA.sections, GLOSS = DATA.glossary, INV = DATA.inv;
  const WHO = {
    'claude-code': { label: '🟦 Claude Code', text: 'Happens with or without LifeOS. Remove every LifeOS file and this still runs.' },
    lifeos: { label: '🟩 LifeOS', text: 'A LifeOS file or script does this. Remove LifeOS and it vanishes.' },
    model: { label: '🟨 Model', text: 'The model\'s own reasoning. Nobody wrote code for this.' },
    you: { label: '⬜ You', text: 'A human did this.' },
  };
  const BOX = { context: '1 · Context', capability: '2 · Capability', control: '3 · Control', memory: '4 · Memory', verification: '5 · Verification', none: 'Output only (no box)' };
  const termIndex = new Map();
  for (const t of GLOSS) { termIndex.set(t.term.toLowerCase(), t); for (const a of t.aliases || []) termIndex.set(a.toLowerCase(), t); }

  // ---------- state ----------
  const LS = 'engine-room-v2';
  let state = { part: 'p0', step: {}, strip: false, seen: {}, checks: {}, glossary: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem(LS) || '{}')); } catch {}
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(state)); } catch {} };
  const hashPart = location.hash.replace('#', '');
  if (hashPart && SECTIONS.some(s => s.id === hashPart.split('/')[0])) { state.part = hashPart.split('/')[0]; if (hashPart.split('/')[1]) state.step[state.part] = hashPart.split('/')[1]; }

  // ---------- helpers ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const h = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (i < vals.length ? vals[i] : ''), '');

  function inline(s) {
    let out = esc(s);
    out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
    out = out.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, label) => {
      const term = termIndex.get(t.toLowerCase());
      const shown = label || t;
      return term ? `<span class="term" data-term="${esc(term.term)}">${shown}</span>` : shown;
    });
    return out;
  }

  /** Small markdown subset → HTML. */
  function md(text) {
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`); continue; }
      if (/^###\s/.test(l)) { out.push(`<h3>${inline(l.replace(/^###\s/, ''))}</h3>`); i++; continue; }
      if (/^##\s/.test(l)) { out.push(`<h2>${inline(l.replace(/^##\s/, ''))}</h2>`); i++; continue; }
      if (/^\|/.test(l)) {
        const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const head = cells(rows[0]); const body = rows.slice(1).filter(r => !/^\|\s*-/.test(r));
        out.push(`<div class="table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      if (/^>\s?/.test(l)) { const buf = []; while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${md(buf.join('\n'))}</blockquote>`); continue; }
      if (/^\s*[-*]\s/.test(l)) { const buf = []; while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) buf.push(lines[i++].replace(/^\s*[-*]\s/, '')); out.push(`<ul>${buf.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`); continue; }
      if (/^\s*\d+\.\s/.test(l)) { const buf = []; while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) buf.push(lines[i++].replace(/^\s*\d+\.\s/, '')); out.push(`<ol>${buf.map(x => `<li>${inline(x)}</li>`).join('')}</ol>`); continue; }
      if (!l.trim()) { i++; continue; }
      const buf = []; while (i < lines.length && lines[i].trim() && !/^(```|##|\||>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) buf.push(lines[i++]);
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
    return out.join('\n');
  }

  const section = () => SECTIONS.find(s => s.id === state.part) || SECTIONS[0];
  const flat = steps => { const r = []; (steps || []).forEach(s => { r.push(s); (s.substeps || []).forEach(x => r.push(x)); }); return r; };
  const currentStep = sec => { const all = flat(sec.steps); const id = state.step[sec.id]; return all.find(s => s.id === id) || all[0]; };
  const BOX_ORDER = ['context', 'capability', 'control', 'memory', 'verification', 'none'];
  const COMP_ORDER = ['telos','context','cortex','conduit','synapse','feed','skills','tools','agents','arbol','hermes','hooks','security','boundary','learning','atlas','ledger','algorithm','isa','bunker','doctor','pulse','observability','voice','spinner'];
  const rank = c => { const i = COMP_ORDER.indexOf(c.id); return i < 0 ? 99 : i; };
  const orderedComps = sec => BOX_ORDER.flatMap(b => (sec.components || []).filter(c => c.box === b).sort((a, b2) => rank(a) - rank(b2)));
  const currentComp = sec => { const id = state.step[sec.id]; const list = orderedComps(sec); return list.find(c => c.id === id) || list[0]; };

  // ---------- viz: the engine, live ----------
  const VIZ = DATA.viz || null;
  const anim = { timer: null, playing: false, raf: null, speed: 1 };
  const stationById = Object.fromEntries((VIZ ? VIZ.stations : []).map(s => [s.id, s]));
  const center = s => [s.x + s.w / 2, s.y + s.h / 2];
  function edgePoint(a, b) {
    const [ax, ay] = center(a), [bx, by] = center(b); const dx = bx - ax, dy = by - ay;
    if (!dx && !dy) return [ax, ay];
    const sx = Math.abs(dx) > 1e-6 ? (a.w / 2) / Math.abs(dx) : Infinity, sy = Math.abs(dy) > 1e-6 ? (a.h / 2) / Math.abs(dy) : Infinity;
    const t = Math.min(sx, sy); return [ax + dx * t, ay + dy * t];
  }
  function frameFor(sec, cur) {
    if (!VIZ) return null;
    if (sec.kind === 'components') return { lit: VIZ.componentStation[cur.id] || [], hops: [], car: '', title: cur.name, note: 'Lit = where this part lives on the engine.' };
    if (sec.kind !== 'flow') return { lit: [], hops: [], car: 'This is the whole machine. Parts 1 and 2 run it one move at a time: press ▶ there.', title: 'The engine' };
    let f = VIZ.frames[cur.id];
    if (!f) { const parent = (sec.steps || []).find(s => (s.substeps || []).some(x => x.id === cur.id)); f = parent && VIZ.frames[parent.id] ? { lit: VIZ.frames[parent.id].lit, hops: [], car: VIZ.frames[parent.id].car } : { lit: [], hops: [], car: '' }; }
    return { ...f, title: cur.title };
  }
  function renderViz(sec, cur) {
    if (!VIZ) return '';
    const f = frameFor(sec, cur); const lit = new Set(f.lit); const hopSet = new Set((f.hops || []).map(h => h.join('>')));
    const wiresSvg = VIZ.wires.map(w => { const a = stationById[w.from], b = stationById[w.to]; if (!a || !b) return ''; const p1 = edgePoint(a, b), p2 = edgePoint(b, a); const on = hopSet.has(w.from + '>' + w.to); return `<line class="wire ${on ? 'on' : ''}" x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" marker-end="url(#${on ? 'arron' : 'arr'})"/>`; }).join('');
    const stSvg = VIZ.stations.map(st => { const stripped = state.strip && st.who === 'lifeos'; return `<g class="station who-${st.who} ${lit.has(st.id) ? 'lit' : ''} ${stripped ? 'stripped' : ''}" data-station="${st.id}" transform="translate(${st.x},${st.y})"><rect rx="10" width="${st.w}" height="${st.h}"/><text class="sl" x="${st.w / 2}" y="${st.sub ? 22 : st.h / 2 + 5}">${esc(st.label)}</text>${st.sub ? `<foreignObject x="5" y="28" width="${st.w - 10}" height="${st.h - 31}"><div xmlns="http://www.w3.org/1999/xhtml" class="ss">${esc(st.sub)}</div></foreignObject>` : ''}</g>`; }).join('');
    const isFlow = sec.kind === 'flow';
    const list = isFlow ? flat(sec.steps) : null; const idx = list ? list.findIndex(x => x.id === cur.id) : -1;
    const who = isFlow ? WHO[cur.who] : null;
    const ctl = isFlow ? `<div class="viz-ctl"><button class="btn" data-viz="first" title="First move">⏮</button><button class="btn" data-viz="prev" title="Previous move (←)">◀</button><button class="btn play" data-viz="play" title="Play or pause (space)">${anim.playing ? '⏸ Pause' : '▶ Play'}</button><button class="btn" data-viz="next" title="Next move (→)">▶</button><button class="btn" data-viz="last" title="Last move">⏭</button><select id="vizspeed" title="Speed">${[['0.5', '½×'], ['1', '1×'], ['2', '2×']].map(([v, l]) => `<option value="${v}" ${Number(v) === anim.speed ? 'selected' : ''}>${l}</option>`).join('')}</select><span class="viz-pos">${idx + 1} / ${list.length}</span></div>` : '';
    return `<section class="viz panel" aria-label="The engine, live">
      <div class="viz-head"><div class="viz-title">🔧 The engine, live${isFlow ? ` · <span class="mono">${esc(cur.id)}</span>` : ''}</div>${ctl}</div>
      <div class="viz-svg"><svg viewBox="0 0 ${VIZ.canvas.w} ${VIZ.canvas.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LifeOS engine diagram: stations light up as each move happens">
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#3b4a66"/></marker><marker id="arron" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#38bdf8"/></marker><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <text class="rowlab" x="20" y="16">BEFORE YOUR FIRST WORD</text><text class="rowlab" x="20" y="152">ONE TURN</text><text class="rowlab" x="20" y="316">AFTER THE TOOL · AFTER THE REPLY</text>
        ${wiresSvg}${stSvg}<circle id="token" class="token" r="7" cx="-20" cy="-20"/></svg></div>
      <div class="viz-cap">${who ? `<span class="badge who-${cur.who}">${who.label}</span>` : ''}<b>${inline(f.title || '')}</b>${f.car ? `<div class="car">🚗 ${esc(f.car)}</div>` : ''}${f.note ? `<div class="who-explain">${esc(f.note)}</div>` : ''}${isFlow ? `<div class="who-explain">Lit = involved in this move · bright wire = where the prompt or data travels · <span class="kbd">space</span> plays, <span class="kbd">←</span> <span class="kbd">→</span> step</div>` : ''}</div>
    </section>`;
  }
  function animateHops(hops) {
    if (anim.raf) cancelAnimationFrame(anim.raf); anim.raf = null;
    const tok = document.getElementById('token'); if (!tok) return;
    if (!hops || !hops.length) { tok.setAttribute('cx', -20); tok.setAttribute('cy', -20); return; }
    let i = 0; const dur = 700 / anim.speed;
    const run = () => {
      const a = stationById[hops[i][0]], b = stationById[hops[i][1]]; if (!a || !b) return;
      const p1 = edgePoint(a, b), p2 = edgePoint(b, a); const t0 = performance.now();
      const step = now => { const t = Math.min(1, (now - t0) / dur); const e = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; tok.setAttribute('cx', (p1[0] + (p2[0] - p1[0]) * e).toFixed(1)); tok.setAttribute('cy', (p1[1] + (p2[1] - p1[1]) * e).toFixed(1)); if (t < 1) anim.raf = requestAnimationFrame(step); else if (++i < hops.length) anim.raf = requestAnimationFrame(run); };
      anim.raf = requestAnimationFrame(step);
    };
    run();
  }
  const playable = sec => flat(sec.steps).filter(x => !(state.strip && x.who === 'lifeos'));
  function vizGo(sec, where) {
    const list = playable(sec); if (!list.length) return; const cur = currentStep(sec); let i = list.findIndex(x => x.id === cur.id); if (i < 0) i = 0;
    const n = where === 'first' ? 0 : where === 'last' ? list.length - 1 : Math.min(list.length - 1, Math.max(0, i + (where === 'next' ? 1 : -1)));
    state.step[sec.id] = list[n].id; save(); render();
  }
  function vizPlay(sec) { anim.playing = !anim.playing; clearTimeout(anim.timer); if (anim.playing) tick(); render(); }
  function stopPlay() { anim.playing = false; clearTimeout(anim.timer); anim.timer = null; }
  function tick() {
    clearTimeout(anim.timer);
    anim.timer = setTimeout(() => { const sec = section(); if (sec.kind !== 'flow' || !anim.playing) return; const list = playable(sec); const cur = currentStep(sec); const i = list.findIndex(x => x.id === cur.id); if (i >= list.length - 1) { stopPlay(); render(); return; } vizGo(sec, 'next'); if (anim.playing) tick(); }, 2800 / anim.speed);
  }

  const isDone = sec => { const key = sec.id; const c = state.checks[key] || {}; const n = (sec.breakIt.length + sec.recall.length + sec.transfer.length); return Object.values(c).filter(Boolean).length >= n; };

  // ---------- render ----------
  function render() {
    const sec = section();
    const app = document.getElementById('app');
    const curX = sec.kind === 'flow' ? currentStep(sec) : sec.kind === 'components' ? currentComp(sec) : null;
    const vizHtml = (sec.kind === 'flow' || sec.kind === 'components' || sec.id === 'p0') && (curX || sec.id === 'p0') ? renderViz(sec, curX) : '';
    const tabs = SECTIONS.map(s => `<button class="tab ${s.id === sec.id ? 'on' : ''} ${isDone(s) ? 'done' : ''}" data-part="${s.id}"><span class="n">${s.number}</span>${esc(s.title)}</button>`).join('');
    const toggle = sec.toggle ? `<div class="toggle ${state.strip ? 'on' : ''}" id="strip" title="Grey out every LifeOS step and see the bare Claude Code path"><span class="sw"></span><span>Strip LifeOS</span></div>` : '';
    let body = '';
    if (sec.kind === 'flow') body = renderFlow(sec);
    else if (sec.kind === 'components') body = renderComponents(sec);
    else body = `<div class="orient">${md(sec.body)}</div>`;
    app.innerHTML = `
      <div class="top">
        <div class="brand">⚙️ Engine Room <small>· how a LifeOS-class agent works</small></div>
        <div class="tabs">${tabs}</div>
        <div class="spacer"></div>
        ${toggle}
        <button class="btn" id="gloss">📖 Glossary (${GLOSS.length})</button>
      </div>
      <div class="wrap">
        <div class="hero">
          <h1>Part ${sec.number} · ${esc(sec.title)}</h1>
          <p class="sub">${inline(sec.subtitle)}</p>
          <div class="legend">${Object.entries(WHO).map(([k, v]) => `<span class="badge who-${k}">${v.label}</span>`).join('')}<span class="badge mode-read">read</span><span class="badge mode-write">write</span><span class="badge mode-exec">runs</span></div>
        </div>
        ${sec.kind === 'flow' || sec.kind === 'components' ? `<div class="orient">${md(sec.body)}</div>` : ''}
        ${vizHtml}
        ${body}
        ${renderClosing(sec)}
        <div class="foot">Generated from your install on ${esc(INV.generatedAt.slice(0, 16).replace('T', ' '))} · ${INV.redaction} · ${INV.counts.files} files, ${INV.counts.hooksOnDisk} hooks on disk, ${INV.counts.registeredHookEntries} registrations (${INV.counts.duplicateHookEntries} duplicates) · built ${esc(DATA.builtAt.slice(0, 16).replace('T', ' '))}</div>
      </div>
      <div class="drawer ${state.glossary ? 'open' : ''}" id="drawer">${renderGlossary()}</div>`;
    bind(sec);
    if (vizHtml) { const f = frameFor(sec, curX || { id: 'p0', title: '' }); animateHops(f ? f.hops : []); }
    location.hash = sec.id + (state.step[sec.id] ? '/' + state.step[sec.id] : '');
  }

  function renderFlow(sec) {
    const all = flat(sec.steps);
    const cur = currentStep(sec);
    state.seen[cur.id] = true; save();
    const rail = (sec.steps || []).map(s => railItem(s, cur, false) + (s.substeps || []).map(x => railItem(x, cur, true)).join('')).join('');
    return `<div class="grid">
      <aside class="panel rail" aria-label="Steps"><h4>${all.length} steps${state.strip ? ' · LifeOS stripped' : ''}</h4>${rail}</aside>
      <main class="panel detail">${renderStep(cur, all)}</main>
      <aside class="panel files" aria-label="Files touched">${renderFiles(cur)}</aside>
    </div>`;
  }
  function railItem(s, cur, sub) {
    const stripped = state.strip && s.who === 'lifeos';
    return `<div class="rs ${sub ? 'sub' : ''} ${s.id === cur.id ? 'on' : ''} ${stripped ? 'stripped' : ''} ${state.seen[s.id] ? 'seen' : ''}" data-step="${s.id}"><span class="dot who-${s.who}"></span><span class="id">${s.id}</span><span class="t">${inline(s.title)}${s.hook ? `<small>${esc(s.hook.event)}${s.hook.matcher ? ' · ' + esc(s.hook.matcher) : ''}${s.hook.async ? ' · async' : ''}</small>` : ''}</span></div>`;
  }

  function fld(n, label, html) { return `<div class="field"><div class="lbl"><span class="k">${n}</span>${label}</div>${html}</div>`; }

  function renderNine(x, opts) {
    const stripped = state.strip && x.who === 'lifeos';
    const who = WHO[x.who];
    return [
      fld(1, 'Purpose', `<p>${inline(x.purpose)}</p>`),
      fld(2, 'Who does it', `<p><span class="badge who-${x.who}">${who.label}</span> <span class="who-explain">${who.text}</span></p>${x.without ? `<div class="without ${stripped ? '' : 'dim'}">${stripped ? '⛔ Stripped. ' : ''}${inline(x.without)}</div>` : ''}`),
      fld(3, 'How it is triggered', `<p>${inline(x.trigger)}</p>${x.hook ? `<div class="hookchip">event ${esc(x.hook.event)}${x.hook.matcher !== undefined ? ` · matcher "${esc(x.hook.matcher)}"` : ''} · ${x.hook.async ? 'async' : 'sync'}${x.hook.timeoutSec ? ` · timeout ${x.hook.timeoutSec}s` : ''}</div><p class="who-explain">${inline(x.hook.exitSemantics)}</p>` : ''}`),
      fld(4, 'Input → output', `<div class="io"><div><b>in</b><p>${inline(x.input)}</p></div><div><b>out</b><p>${inline(x.output)}</p></div></div>${(x.payloads || []).map(p => `<p class="who-explain" style="margin:8px 0 2px">${inline(p.label)}</p><pre><code>${esc(p.text)}</code></pre>`).join('')}`),
      fld(5, 'Files touched', x.files.length ? `<ul class="filelist">${x.files.map(f => `<li><span class="badge mode-${f.mode}">${f.mode === 'exec' ? 'runs' : f.mode}</span><span><code>${esc(f.path)}</code>${f.note ? `<small>${inline(f.note)}</small>` : ''}</span></li>`).join('')}</ul>` : '<p class="who-explain">none</p>'),
      fld(6, 'How it is implemented', `${md(x.how)}<p class="src who-explain">Sources: ${x.sources.map(s => `<code>${esc(s)}</code>`).join(' · ')}</p>`),
      fld(7, 'Alternatives', `<div class="cards">${x.alternatives.map(a => `<div class="card"><b>${inline(a.name)}</b>${inline(a.tradeoff)}</div>`).join('')}</div>`),
      fld(8, 'Why this way and not another', `<p>${inline(x.why)}</p>`),
      fld(9, 'The same move in another field', `<div class="cards">${x.examples.map(e => `<div class="card ex-${esc(e.field)}"><b>${esc(e.field)}</b>${inline(e.text)}</div>`).join('')}</div>`),
    ].join('');
  }

  function renderStep(s, all) {
    const idx = all.findIndex(x => x.id === s.id);
    const prev = all[idx - 1], next = all[idx + 1];
    const stripped = state.strip && s.who === 'lifeos';
    return `<div class="head"><span class="id">${s.id}</span><span class="badge who-${s.who}">${WHO[s.who].label}</span>${stripped ? '<span class="badge warn">vanishes without LifeOS</span>' : ''}</div>
      <h2 class="title">${inline(s.title)}</h2>
      ${s.watch ? `<div class="watch"><b>Watch it:</b> ${inline(s.watch)}</div>` : ''}
      ${renderNine(s)}
      <div class="navbtns"><button class="btn" data-step="${prev ? prev.id : ''}" ${prev ? '' : 'disabled'}>← ${prev ? esc(prev.id) : ''}</button><span class="who-explain"><span class="kbd">←</span> <span class="kbd">→</span> to move</span><button class="btn" data-step="${next ? next.id : ''}" ${next ? '' : 'disabled'}>${next ? esc(next.id) : ''} →</button></div>`;
  }

  function renderFiles(x) {
    const lit = new Map(); for (const f of x.files) if (!f.virtual) lit.set(f.path.replace(/^~\/\.claude\//, ''), f.mode);
    const rows = [...lit.entries()].map(([p, mode]) => { const t = INV.touched[p] || {}; return `<div class="f lit mode-${mode}"><span class="m">${mode === 'read' ? '→' : mode === 'write' ? '←' : mode === 'exec' ? '▶' : '↔'}</span><span>${esc(p)}</span><span class="z">${t.symlink ? '⤳ ' : ''}${esc(t.zone || '')}</span></div>`; }).join('');
    let hooks = '';
    if (x.hook) {
      const list = INV.hooks[x.hook.event] || [];
      hooks = `<h4>${esc(x.hook.event)} registrations on this machine (${list.length})</h4><div class="hooklist">${list.map(hk => `<div class="${hk.duplicate ? 'dup' : ''} ${hk.async ? 'async' : ''}">${hk.duplicate ? '⚠ ' : ''}${esc(hk.name)}${hk.matcher ? ` <span class="async">[${esc(hk.matcher)}]</span>` : ''}${hk.async ? ' · async' : ''}${hk.timeout ? ' · ' + hk.timeout + 's' : ''}</div>`).join('')}${list.some(hk => hk.duplicate) ? '<p class="who-explain">⚠ = the same script registered twice for this event; it runs twice.</p>' : ''}</div>`;
    }
    const dirs = Object.entries(INV.dirs).sort((a, b) => b[1].files - a[1].files).slice(0, 24).map(([d, v]) => `<div><span>${esc(d)}/</span><span>${v.files}</span></div>`).join('');
    return `<h4>Files this step touches</h4><div class="tree">${rows || '<div class="f lit"><span class="m">·</span><span>nothing on disk</span></div>'}</div>
      ${hooks}
      <details class="more"><summary>Where things live (${INV.counts.files} files in ~/.claude)</summary><div class="dirs">${dirs}</div>
      <p class="who-explain">Zones: <span class="badge zone">SYSTEM</span> overwritten by updates · <span class="badge zone">USER</span> yours, symlinked out of the tree · <span class="badge zone">INTERFACE</span> shared (settings.json, CLAUDE.md) · <span class="badge zone">RUNTIME</span> ephemeral (MEMORY, transcripts)</p>
      <p class="who-explain">Launcher: <code>${esc((INV.launcher || {}).command || 'not found')}</code></p>
      <p class="who-explain">Imports in CLAUDE.md: ${INV.imports.map(i => `<code>${esc(i.to)}</code>`).join(', ')}</p></details>`;
  }

  function renderComponents(sec) {
    const comps = sec.components || [];
    const cur = currentComp(sec);
    if (!cur) return '<div class="panel empty">No components written yet.</div>';
    state.seen[cur.id] = true; save();
    const order = ['context', 'capability', 'control', 'memory', 'verification', 'none'];
    const rail = order.map(b => { const list = comps.filter(c => c.box === b); if (!list.length) return ''; return `<div class="comp-box">${BOX[b]}</div>` + list.sort((a, b2) => rank(a) - rank(b2)).map(c => `<div class="rs ${c.id === cur.id ? 'on' : ''} ${state.strip && c.who === 'lifeos' ? 'stripped' : ''} ${state.seen[c.id] ? 'seen' : ''}" data-step="${c.id}"><span class="dot who-${c.who}"></span><span class="t">${esc(c.name)}<small>${esc(c.status.split('.')[0])}</small></span></div>`).join(''); }).join('');
    const ordered = orderedComps(sec); const idx = ordered.findIndex(c => c.id === cur.id); const prev = ordered[idx - 1], next = ordered[idx + 1];
    const partial = /private|Blueprint|Partial|Optional/.test(cur.status);
    const detail = `<div class="head"><span class="badge who-${cur.who}">${WHO[cur.who].label}</span><span class="badge zone">${BOX[cur.box]}</span></div>
      <h2 class="title">${esc(cur.name)}</h2>
      <p class="status ${partial ? 'partial' : ''}">${inline(cur.status)}</p>
      <div class="watch"><b>In one sentence:</b> ${inline(cur.summary)}</div>
      ${renderNine(cur)}
      ${fld('!', 'How you notice it is broken', `<p>${inline(cur.failure)}</p>`)}
      ${fld('↔', 'Related parts', `<div class="chips">${cur.related.map(r => { const c = comps.find(x => x.id === r); return c ? `<button data-step="${c.id}">${esc(c.name)}</button>` : ''; }).join('')}</div>`)}
      <div class="navbtns"><button class="btn" data-step="${prev ? prev.id : ''}" ${prev ? '' : 'disabled'}>← ${prev ? esc(prev.name) : ''}</button><button class="btn" data-step="${next ? next.id : ''}" ${next ? '' : 'disabled'}>${next ? esc(next.name) : ''} →</button></div>`;
    return `<div class="grid"><aside class="panel rail"><h4>${comps.length} parts by box</h4>${rail}</aside><main class="panel detail">${detail}</main><aside class="panel files">${renderFiles(cur)}</aside></div>`;
  }

  function renderClosing(sec) {
    const c = state.checks[sec.id] || {};
    const block = (title, icon, items, key) => `<div class="panel"><h3>${icon} ${title}</h3>${items.map((t, i) => { const k = key + i; return `<label class="${c[k] ? 'done' : ''}"><input type="checkbox" data-check="${k}" ${c[k] ? 'checked' : ''}><span>${inline(t)}</span></label>`; }).join('')}</div>`;
    return `<div class="closing">${block('Break it on purpose', '🔨', sec.breakIt, 'b')}${block('Recall — closed book', '🧠', sec.recall, 'r')}${block('Transfer — your own projects', '↗', sec.transfer, 't')}</div>`;
  }

  function renderGlossary(q) {
    q = (q || '').toLowerCase();
    const list = GLOSS.filter(t => !q || t.term.toLowerCase().includes(q) || t.meaning.toLowerCase().includes(q) || (t.aliases || []).some(a => a.toLowerCase().includes(q)));
    return `<div style="display:flex;justify-content:space-between;align-items:center"><b>Glossary · ${list.length}</b><button class="btn" id="closeg">✕</button></div><input id="gq" placeholder="search a term…" value="${esc(q)}">${list.map(t => `<div class="g"><b>${esc(t.term)}</b>${t.aliases && t.aliases.length ? ` <span class="an">(${t.aliases.map(esc).join(', ')})</span>` : ''}<div>${inline(t.meaning)}</div><div class="an">${inline(t.analogy)}</div></div>`).join('')}`;
  }

  // ---------- events ----------
  let tip;
  function showTip(el) {
    const t = termIndex.get((el.dataset.term || '').toLowerCase()); if (!t) return;
    hideTip();
    tip = document.createElement('div'); tip.className = 'tip';
    tip.innerHTML = `<b>${esc(t.term)}</b><div>${inline(t.meaning)}</div><div class="an">${inline(t.analogy)}</div>`;
    document.body.appendChild(tip);
    const r = el.getBoundingClientRect(); const w = tip.offsetWidth, hgt = tip.offsetHeight;
    let x = Math.min(r.left, innerWidth - w - 10), y = r.bottom + 6; if (y + hgt > innerHeight - 10) y = r.top - hgt - 6;
    tip.style.left = Math.max(10, x) + 'px'; tip.style.top = Math.max(10, y) + 'px';
  }
  function hideTip() { if (tip) { tip.remove(); tip = null; } }

  function bind(sec) {
    document.querySelectorAll('.tab').forEach(b => b.onclick = () => { stopPlay(); state.part = b.dataset.part; save(); render(); scrollTo(0, 0); });
    document.querySelectorAll('[data-viz]').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.dataset.viz; if (w === 'play') vizPlay(sec); else { stopPlay(); vizGo(sec, w); } });
    const sp = document.getElementById('vizspeed'); if (sp) sp.onchange = () => { anim.speed = Number(sp.value) || 1; if (anim.playing) tick(); };
    const st = document.getElementById('strip'); if (st) st.onclick = () => { state.strip = !state.strip; save(); render(); };
    document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { if (!b.dataset.step) return; stopPlay(); state.step[sec.id] = b.dataset.step; save(); render(); const d = document.querySelector('.detail'); if (d && innerWidth < 820) d.scrollIntoView({ behavior: 'smooth' }); });
    document.querySelectorAll('[data-check]').forEach(cb => cb.onchange = () => { (state.checks[sec.id] ||= {})[cb.dataset.check] = cb.checked; save(); render(); });
    document.getElementById('gloss').onclick = () => { state.glossary = !state.glossary; save(); render(); };
    const cg = document.getElementById('closeg'); if (cg) cg.onclick = () => { state.glossary = false; save(); render(); };
    const gq = document.getElementById('gq'); if (gq) { gq.oninput = () => { document.getElementById('drawer').innerHTML = renderGlossary(gq.value); const n = document.getElementById('gq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); bindGlossary(); }; }
    bindGlossary();
    document.querySelectorAll('.term').forEach(el => { el.onmouseenter = () => showTip(el); el.onmouseleave = hideTip; el.onclick = e => { e.stopPropagation(); showTip(el); }; });
    document.body.onclick = hideTip;
    document.onkeydown = e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === ' ' && sec.kind === 'flow') { e.preventDefault(); vizPlay(sec); return; }
      if (sec.kind !== 'flow' && sec.kind !== 'components') return;
      const list = sec.kind === 'flow' ? flat(sec.steps) : orderedComps(sec);
      const cur = sec.kind === 'flow' ? currentStep(sec) : currentComp(sec);
      const i = list.findIndex(x => x.id === cur.id);
      if (e.key === 'ArrowRight' && list[i + 1]) { state.step[sec.id] = list[i + 1].id; save(); render(); }
      if (e.key === 'ArrowLeft' && list[i - 1]) { state.step[sec.id] = list[i - 1].id; save(); render(); }
    };
  }
  function bindGlossary() {
    const cg = document.getElementById('closeg'); if (cg) cg.onclick = () => { state.glossary = false; save(); render(); };
    const gq = document.getElementById('gq'); if (gq) gq.oninput = () => { const v = gq.value; document.getElementById('drawer').innerHTML = renderGlossary(v); const n = document.getElementById('gq'); n.focus(); n.setSelectionRange(v.length, v.length); bindGlossary(); };
    document.querySelectorAll('.drawer .term').forEach(el => { el.onmouseenter = () => showTip(el); el.onmouseleave = hideTip; });
  }

  render();
})();
