import assert from 'node:assert/strict';
const base=process.env.ENGINE_ROOM_URL||'http://127.0.0.1:4178/';
const response=await fetch(base);assert.equal(response.status,200);
const html=await response.text();assert.match(html,/LifeOS Engine Room/);assert.match(html,/See what makes it work/);
const assets=[...new Set([...html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css|svg))(?:[?#][^"]*)?"/g)].map(m=>m[1]))].filter(s=>s.startsWith('/'));
assert(assets.some(a=>a.endsWith('.js')));assert(assets.some(a=>a.endsWith('.css')));
for(const asset of assets){const r=await fetch(new URL(asset,base));assert.equal(r.status,200,asset);const text=await r.text();assert(text.length>10,asset)}
assert.equal((await fetch(new URL('app/model.ts',base))).status,404,'Source should not be served');
assert.equal((await fetch(base,{method:'POST'})).status,405,'Static server must refuse writes');
assert.equal((await fetch(new URL('missing-page',base))).status,404);
console.log(`PASS: static page and ${assets.length} referenced assets load; source is not exposed; writes are refused; missing routes return 404.`);
