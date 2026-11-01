"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {solveTwoBone}=require("../prototype/character-editor-v01/ik-solver.js");
const base={length1:65,length2:60,targetX:40,targetY:70,bend:1};
function endpoint(input,result){
 const toRad=Math.PI/180,a=result.upperDeg*toRad,b=(result.upperDeg+result.lowerDeg)*toRad;
 return {x:-input.length1*Math.sin(a)-input.length2*Math.sin(b),y:input.length1*Math.cos(a)+input.length2*Math.cos(b)};
}
test("resuelve objetivo alcanzable con flexión positiva",()=>{const r=solveTwoBone(base);assert.equal(r.ok,true);assert.ok(r.upperDeg>=-165&&r.upperDeg<=165);assert.ok(r.lowerDeg>0&&r.lowerDeg<=150);});
test("resuelve la flexión al lado contrario sin cambiar la magnitud",()=>{const a=solveTwoBone(base),b=solveTwoBone({...base,bend:-1});assert.equal(b.ok,true);assert.ok(b.lowerDeg<0);assert.ok(Math.abs(Math.abs(a.lowerDeg)-Math.abs(b.lowerDeg))<1e-6);});
test("reconstruye el objetivo solicitado en coordenadas SVG para ambos lados de flexión",()=>{for(const bend of [1,-1]){const input={...base,bend},r=solveTwoBone(input);assert.equal(r.ok,true);const p=endpoint(input,r);assert.ok(Math.abs(p.x-input.targetX)<1e-6,"error X: "+p.x+" vs "+input.targetX);assert.ok(Math.abs(p.y-input.targetY)<1e-6,"error Y: "+p.y+" vs "+input.targetY);}});
test("acepta el límite de alcance exterior",()=>{const r=solveTwoBone({...base,targetX:0,targetY:125});assert.equal(r.ok,true);assert.ok(Math.abs(r.lowerDeg)<1e-5);});
test("rechaza objetivos fuera del alcance sin producir ángulos",()=>{const r=solveTwoBone({...base,targetX:0,targetY:130});assert.equal(r.ok,false);assert.equal("upperDeg" in r,false);});
test("rechaza flexión que supera 150 grados",()=>{const r=solveTwoBone({...base,targetX:0,targetY:10});assert.equal(r.ok,false);});
test("respeta límites articulares configurados",()=>{const r=solveTwoBone({...base,upperMin:0,upperMax:1});assert.equal(r.ok,false);});
test("rechaza datos no finitos y cadenas inválidas",()=>{assert.equal(solveTwoBone({...base,targetX:NaN}).ok,false);assert.equal(solveTwoBone({...base,bend:0}).ok,false);});

test("reconstruye objetivos en distintos cuadrantes y sentidos de flexión",()=>{
 const targets=[{x:35,y:75},{x:-35,y:75},{x:35,y:-75},{x:-35,y:-75},{x:80,y:25},{x:-80,y:25},{x:80,y:-25},{x:-80,y:-25}];
 for(const target of targets)for(const bend of [1,-1]){
  const input={...base,...target,bend},r=solveTwoBone(input);
  assert.equal(r.ok,true,"objetivo "+JSON.stringify(target)+", flexión "+bend+" debe ser alcanzable");
  const p=endpoint(input,r);
  assert.ok(Math.abs(p.x-input.targetX)<1e-6,"error X: "+p.x+" vs "+input.targetX);
  assert.ok(Math.abs(p.y-input.targetY)<1e-6,"error Y: "+p.y+" vs "+input.targetY);
 }
});
test("acepta un objetivo cercano al origen cuando la diferencia de longitudes lo permite",()=>{
 const input={length1:80,length2:60,targetX:0,targetY:20,bend:1,upperMin:-180,upperMax:180,lowerMin:-180,lowerMax:180};
 const r=solveTwoBone(input);assert.equal(r.ok,true);
 const p=endpoint(input,r);
 assert.ok(Math.abs(p.x-input.targetX)<1e-6);
 assert.ok(Math.abs(p.y-input.targetY)<1e-6);
});
test("rechaza la raíz singular de una cadena de longitudes iguales",()=>{
 const r=solveTwoBone({length1:60,length2:60,targetX:0,targetY:0,bend:1});
 assert.equal(r.ok,false);
});
test("rechaza límites articulares invertidos o no finitos",()=>{
 assert.equal(solveTwoBone({...base,upperMin:20,upperMax:-20}).ok,false);
 assert.equal(solveTwoBone({...base,lowerMin:NaN}).ok,false);
});
