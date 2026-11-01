"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const model=require("../prototype/character-editor-v01/mesh-model.js");
test("crea una cuadrícula regular triangulada",()=>{
 const r=model.createGrid({width:100,height:200,columns:3,rows:4,boneId:"root"});
 assert.equal(r.ok,true);assert.equal(r.mesh.vertices.length,12);assert.equal(r.mesh.faces.length,12);
 assert.deepEqual(r.mesh.vertices[0].weights,[{boneId:"root",weight:1}]);
});
test("rechaza dimensiones y resoluciones no válidas",()=>{
 assert.equal(model.createGrid({width:0,height:10,columns:2,rows:2,boneId:"root"}).ok,false);
 assert.equal(model.createGrid({width:10,height:10,columns:1,rows:2,boneId:"root"}).ok,false);
 assert.equal(model.createGrid({width:10,height:10,columns:2,rows:2}).ok,false);
});
test("normaliza los pesos de cada vértice",()=>{
 const mesh={vertices:[{id:"v0",x:0,y:0,weights:[{boneId:"a",weight:2},{boneId:"b",weight:2}]},{id:"v1",x:1,y:0,weights:[{boneId:"a",weight:1}]},{id:"v2",x:0,y:1,weights:[{boneId:"a",weight:1}]}],faces:[[0,1,2]]};
 const r=model.normalizeMesh(mesh,["a","b"]);assert.equal(r.ok,true);assert.equal(r.mesh.vertices[0].weights[0].weight,.5);
});
test("rechaza huesos desconocidos y pesos negativos",()=>{
 const base={vertices:[{id:"v0",x:0,y:0,weights:[{boneId:"x",weight:1}]},{id:"v1",x:1,y:0,weights:[{boneId:"x",weight:1}]},{id:"v2",x:0,y:1,weights:[{boneId:"x",weight:1}]}],faces:[[0,1,2]]};
 assert.equal(model.normalizeMesh(base,["a"]).ok,false);
 base.vertices[0].weights=[{boneId:"a",weight:-1}];assert.equal(model.normalizeMesh(base,["a"]).ok,false);
});
test("rechaza caras degeneradas o con índices inválidos",()=>{
 const base={vertices:[{id:"v0",x:0,y:0,weights:[{boneId:"a",weight:1}]},{id:"v1",x:1,y:0,weights:[{boneId:"a",weight:1}]},{id:"v2",x:0,y:1,weights:[{boneId:"a",weight:1}]}],faces:[[0,1,1]]};
 assert.equal(model.normalizeMesh(base,["a"]).ok,false);base.faces=[[0,1,3]];assert.equal(model.normalizeMesh(base,["a"]).ok,false);
});
test("mueve vértices sin alterar sus influencias",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"root"}),weights=JSON.stringify(r.mesh.vertices[0].weights);
 assert.equal(model.moveVertex(r.mesh,0,8,-9).ok,true);assert.equal(r.mesh.vertices[0].x,8);assert.equal(JSON.stringify(r.mesh.vertices[0].weights),weights);
});
test("actualiza y normaliza una influencia",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"root"});
 assert.equal(model.setInfluence(r.mesh,0,"arm",1).ok,true);const w=r.mesh.vertices[0].weights;
 assert.equal(w.length,2);assert.equal(w.reduce((s,x)=>s+x.weight,0),1);
});
test("rechaza borrar el último peso positivo sin modificar el vértice",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"root"}),before=JSON.stringify(r.mesh.vertices[0].weights);
 assert.equal(model.setInfluence(r.mesh,0,"root",0).ok,false);
 assert.equal(JSON.stringify(r.mesh.vertices[0].weights),before);
});
test("una influencia inválida no altera los pesos existentes",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"a"}),v=r.mesh.vertices[0];
 v.weights=[{boneId:"a",weight:.4},{boneId:"b",weight:.3},{boneId:"c",weight:.2},{boneId:"d",weight:.1}];
 const before=JSON.stringify(v.weights);
 assert.equal(model.setInfluence(r.mesh,0,"e",.5).ok,false);
 assert.equal(JSON.stringify(v.weights),before);
});
test("limita las influencias a cuatro huesos",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"a"});
 for(const id of ["b","c","d"])assert.equal(model.setInfluence(r.mesh,0,id,1).ok,true);
 assert.equal(model.setInfluence(r.mesh,0,"e",1).ok,false);
});
test("no acepta vértices duplicados ni coordenadas no finitas",()=>{
 const base={vertices:[{id:"v0",x:0,y:0,weights:[{boneId:"a",weight:1}]},{id:"v0",x:1,y:0,weights:[{boneId:"a",weight:1}]},{id:"v2",x:0,y:1,weights:[{boneId:"a",weight:1}]}],faces:[[0,1,2]]};
 assert.equal(model.normalizeMesh(base,["a"]).ok,false);base.vertices[1].id="v1";base.vertices[1].x=Infinity;assert.equal(model.normalizeMesh(base,["a"]).ok,false);
});

test("el pincel pinta con caída suave y normaliza pesos",()=>{
 const r=model.createGrid({width:20,height:20,columns:3,rows:3,boneId:"root"});
 const painted=model.paintInfluence(r.mesh,0,0,"arm",.8,20);assert.equal(painted.ok,true);assert.ok(painted.changed>0);
 const center=r.mesh.vertices[4],corner=r.mesh.vertices[0];
 assert.ok(center.weights.some(w=>w.boneId==="arm"));assert.ok(corner.weights.find(w=>w.boneId==="arm").weight<center.weights.find(w=>w.boneId==="arm").weight);
 for(const v of r.mesh.vertices)assert.ok(Math.abs(v.weights.reduce((sum,w)=>sum+w.weight,0)-1)<1e-8);
});
test("el pincel no modifica la malla si supera el límite de influencias",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"a"}),v=r.mesh.vertices[0];
 v.weights=[{boneId:"a",weight:.25},{boneId:"b",weight:.25},{boneId:"c",weight:.25},{boneId:"d",weight:.25}];
 const before=JSON.stringify(v.weights),result=model.paintInfluence(r.mesh,v.x,v.y,"e",.8,10);
 assert.equal(result.ok,false);assert.equal(JSON.stringify(v.weights),before);
});
