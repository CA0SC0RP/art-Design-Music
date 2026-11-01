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
test("rechaza borrar el último peso positivo",()=>{
 const r=model.createGrid({width:20,height:20,columns:2,rows:2,boneId:"root"});
 assert.equal(model.setInfluence(r.mesh,0,"root",0).ok,false);
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
