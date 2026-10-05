import assert from 'node:assert/strict';
import fs from 'node:fs';
const story=JSON.parse(fs.readFileSync(new URL('../fixtures/story.json',import.meta.url)));
assert.equal(story.scenes.length,10);assert.deepEqual(story.scenes.map(s=>s.id),['home','empty','bedroom','wall','coat','breathing','chain','eye','outside','welcome']);
if(process.argv[2]==='facts'){console.log('ten authored scenes include two endings');}else{
const {create,reduce}=await import('../public/model.mjs');const initial={started:false,scene:0,paused:false,ended:false,knocks:[]};assert.deepEqual(create(),initial);
const step=(s,e)=>{const copy=structuredClone(s);Object.freeze(s.knocks);Object.freeze(s);const n=reduce(s,e);assert.deepEqual(s,copy);assert.notEqual(n,s);assert.notEqual(n.knocks,s.knocks);return n;};
let s=create();for(const e of[{type:'advance'},{type:'knock',at:0},{type:'open'},{type:'pause'},{type:'unknown'}])assert.deepEqual(step(s,e),initial);s=step(s,{type:'begin'});assert.equal(s.started,true);assert.deepEqual(step(s,{type:'begin'}),s);
for(let i=0;i<6;i++){assert.equal(s.scene,i);const p=step(s,{type:'pause'});assert.equal(p.paused,true);assert.deepEqual(step(p,{type:'advance'}),p);assert.deepEqual(step(p,{type:'open'}),p);s=step(step(p,{type:'resume'}),{type:'advance'});}
assert.equal(s.scene,6);for(const at of[0,200,650,800,1200,1400,1900])s=step(s,{type:'knock',at});assert.deepEqual(s.knocks,[200,650,800,1200,1400,1900]);for(const at of[1900,1,-1,Infinity,NaN,'2000'])assert.deepEqual(step(s,{type:'knock',at}),s);let opened=step(s,{type:'open'});assert.equal(opened.scene,9);assert.equal(opened.ended,true);assert.deepEqual(step(opened,{type:'advance'}),opened);s=step(s,{type:'advance'});assert.equal(s.scene,7);assert.deepEqual(step(s,{type:'knock',at:2100}),s);s=step(s,{type:'advance'});assert.equal(s.scene,8);assert.equal(s.ended,true);for(const e of[{type:'advance'},{type:'open'},{type:'pause'},{type:'knock',at:2200}])assert.deepEqual(step(s,e),s);assert.deepEqual(step(s,{type:'restart'}),initial);console.log('landing model preserves authored scenes, rhythms and two endings');
}
