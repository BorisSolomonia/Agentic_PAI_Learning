import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parts, scenarios, glossary, groups } from '../app/model.ts';
import { lifecycleSteps, fieldExamples } from '../app/lifecycle.ts';
const source=resolve('../lifeos-reference/LifeOS/install');
const ids=new Set(parts.map(p=>p.id));
assert.equal(ids.size,parts.length,'Part IDs must be unique');
const missing=[];
for(const p of parts){
 assert(groups.some(g=>g.id===p.group),`${p.id} needs a valid purpose group`);
 for(const id of p.related)assert(ids.has(id),`${p.id} links to missing ${id}`);
 for(const field of ['summary','input','action','output','example','failure'])assert(p[field]?.length>15,`${p.id} missing ${field}`);
 for(const f of p.files)if(!existsSync(resolve(source,f)))missing.push(`${p.id}: ${f}`);
}
assert.deepEqual(missing,[],'All cited source files must exist at the pinned revision');
for(const s of scenarios){assert(s.steps.length>1);for(const step of s.steps)assert(ids.has(step.part),`Scenario ${s.id}: missing part ${step.part}`)}
assert.equal(lifecycleSteps[0].letter,'A');
assert.equal(lifecycleSteps.at(-1).letter,'N');
assert(fieldExamples.length>=5);
for(const step of lifecycleSteps){
 assert(['always','conditional','choice','background'].includes(step.certainty),`${step.letter}: invalid certainty`);
 for(const f of step.sources)assert(existsSync(resolve(source,f)),`${step.letter}: lifecycle source missing: ${f}`);
}
const catalog=JSON.parse(readFileSync('app/catalog.json','utf8'));
const registry=JSON.parse(readFileSync(resolve(source,'hooks/hooks.json'),'utf8')).hooks;
assert.equal(catalog.events.length,Object.keys(registry).length);
for(const event of catalog.events)assert.equal(event.entries.length,registry[event.event].flatMap(b=>b.hooks).length);
for(const file of catalog.files)assert(existsSync(resolve(source,file)),`Catalog path missing: ${file}`);
for(const id of ['arbol','bunker','feed'])assert.match(parts.find(p=>p.id===id).status,/Blueprint.*private/);
assert(glossary.length>=25);
console.log(`PASS: ${parts.length} complete parts; ${scenarios.length} linked scenarios; ${lifecycleSteps.length} source-linked lifecycle stages; ${fieldExamples.length} cross-field examples; ${catalog.files.length} real file links; ${catalog.events.length} exact event groups; private implementation labels; ${glossary.length} terms.`);
