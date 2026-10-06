import assert from 'node:assert/strict';import {drawScene} from '../public/render.mjs';
function record(scene,elapsed,reducedMotion){const transforms=[];const gradient={addColorStop(){}};const ctx=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,translate:(...args)=>transforms.push(args)},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});drawScene(ctx,360,270,{scene,elapsed,reducedMotion,looking:false});return transforms;}
for(const elapsed of[0,150,300,450,600,1000]){const expected=.02*(1-Math.min(1,Math.max(0,elapsed/600)))**2;for(const reduced of[false,true]){const translations=record(6,elapsed,reduced);assert.equal(translations.filter(([x,y])=>x===0&&Math.abs(y-(reduced?0:expected))<1e-12).length,1,`chain shadow translation ${elapsed}/${reduced}`);}}
for(const scene of[0,1,2,3,4,5,7])assert.deepEqual(record(scene,0,false),record(scene,600,false),`new chain displacement must not affect scene ${scene}`);
for(const scene of[8,9])assert.equal(record(scene,0,false).filter(([x,y])=>x===0&&y===.02).length,0);
console.log('the chain shadow settles once in scene six and stays still with reduced motion');
