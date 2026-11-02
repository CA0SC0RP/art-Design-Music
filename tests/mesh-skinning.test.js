"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const skin=require("../prototype/character-editor-v01/mesh-skinning.js");
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+" != "+b);
test("la matriz identidad conserva los vértices",()=>{
 const r=skin.deformVertices([{x:4,y:-7,weights:[{boneId:"root",weight:1}]}],{root:[1,0,0,1,0,0]});
 assert.equal(r.ok,true);close(r.vertices[0].x,4);close(r.vertices[0].y,-7);
});
test("una matriz de rotación gira los puntos alrededor del origen",()=>{
 const r=skin.deformVertices([{x:10,y:0,weights:[{boneId:"arm",weight:1}]}],{arm:[0,1,-1,0,0,0]});
 assert.equal(r.ok,true);close(r.vertices[0].x,0);close(r.vertices[0].y,10);
});
test("mezcla dos huesos con pesos normalizados",()=>{
 const r=skin.deformVertices([{x:0,y:0,weights:[{boneId:"a",weight:2},{boneId:"b",weight:2}]}],{a:[1,0,0,1,10,0],b:[1,0,0,1,0,10]});
 assert.equal(r.ok,true);close(r.vertices[0].x,5);close(r.vertices[0].y,5);
});
test("construye matrices de deformación entre pose de referencia y pose actual",()=>{
 const r=skin.buildSkinMatrices({arm:[1,0,0,1,0,0]},{arm:[1,0,0,1,12,-3]});
 assert.equal(r.ok,true);const p=skin.transformPoint(r.matrices.arm,{x:2,y:5});close(p.x,14);close(p.y,2);
});
test("la matriz de deformación identidad se obtiene con poses iguales",()=>{
 const bind={arm:[0,1,-1,0,20,4]},r=skin.buildSkinMatrices(bind,bind);
 assert.equal(r.ok,true);const p=skin.transformPoint(r.matrices.arm,{x:9,y:2});close(p.x,9);close(p.y,2);
});
test("rechaza matrices singulares",()=>{
 const r=skin.buildSkinMatrices({arm:[0,0,0,0,0,0]},{arm:[1,0,0,1,0,0]});assert.equal(r.ok,false);
});
test("rechaza referencias a huesos inexistentes",()=>{
 const r=skin.deformVertices([{x:1,y:2,weights:[{boneId:"missing",weight:1}]}],{root:[1,0,0,1,0,0]});assert.equal(r.ok,false);
});
test("rechaza pesos negativos o suma cero",()=>{
 assert.equal(skin.deformVertices([{x:0,y:0,weights:[{boneId:"a",weight:-1}]}],{a:[1,0,0,1,0,0]}).ok,false);
 assert.equal(skin.deformVertices([{x:0,y:0,weights:[{boneId:"a",weight:0}]}],{a:[1,0,0,1,0,0]}).ok,false);
});
test("rechaza vértices e influencias con datos no válidos",()=>{
 assert.equal(skin.deformVertices([{x:NaN,y:0,weights:[{boneId:"a",weight:1}]}],{a:[1,0,0,1,0,0]}).ok,false);
 assert.equal(skin.deformVertices([{x:0,y:0,weights:[1,2,3,4,5]}],{a:[1,0,0,1,0,0]}).ok,false);
});
test("no modifica la malla de entrada",()=>{
 const v=[{x:3,y:4,weights:[{boneId:"a",weight:1}]}],copy=JSON.stringify(v);
 skin.deformVertices(v,{a:[1,0,0,1,8,9]});assert.equal(JSON.stringify(v),copy);
});

test("calcula la transformación afín que lleva un triángulo a su versión deformada",()=>{
 const source=[{x:0,y:0},{x:10,y:0},{x:0,y:10}],target=[{x:5,y:-2},{x:25,y:3},{x:0,y:28}],r=skin.triangleTransform(source,target);
 assert.equal(r.ok,true);source.forEach((p,i)=>{const q=skin.transformPoint(r.matrix,p);close(q.x,target[i].x);close(q.y,target[i].y);});
});
test("rechaza triángulos degenerados al construir el mapeo",()=>{
 const r=skin.triangleTransform([{x:0,y:0},{x:1,y:1},{x:2,y:2}],[{x:0,y:0},{x:1,y:0},{x:0,y:1}]);assert.equal(r.ok,false);
});

test("dos triángulos vecinos conservan la misma posición en sus vértices compartidos",()=>{
 const a=[{x:0,y:0},{x:10,y:0},{x:10,y:10}],b=[{x:0,y:0},{x:10,y:10},{x:0,y:10}];
 const moved=[{x:3,y:-2},{x:16,y:1},{x:14,y:15},{x:-2,y:12}];
 const ta=skin.triangleTransform(a,[moved[0],moved[1],moved[2]]),tb=skin.triangleTransform(b,[moved[0],moved[2],moved[3]]);
 assert.equal(ta.ok,true);assert.equal(tb.ok,true);
 for(const p of [a[0],a[2]]){const x=skin.transformPoint(ta.matrix,p),y=skin.transformPoint(tb.matrix,p);close(x.x,y.x);close(x.y,y.y);}
});
test("el mapeo triangular admite traslación pura sin alterar distancias",()=>{
 const src=[{x:-4,y:2},{x:8,y:2},{x:1,y:11}],dst=src.map(p=>({x:p.x+17,y:p.y-9})),r=skin.triangleTransform(src,dst);
 assert.equal(r.ok,true);assert.deepEqual(r.matrix,[1,0,0,1,17,-9]);
});

test("expande ligeramente el recorte triangular para reducir juntas de antialiasing",()=>{
 const tri=[{x:0,y:0},{x:10,y:0},{x:0,y:10}],r=skin.expandTriangle(tri,.35);
 assert.equal(r.ok,true);assert.equal(r.triangle.length,3);
 const area=p=>Math.abs((p[1].x-p[0].x)*(p[2].y-p[0].y)-(p[2].x-p[0].x)*(p[1].y-p[0].y));
 assert.ok(area(r.triangle)>area(tri));assert.deepEqual(tri,[{x:0,y:0},{x:10,y:0},{x:0,y:10}]);
});
test("rechaza expansión negativa y triángulos degenerados",()=>{
 assert.equal(skin.expandTriangle([{x:0,y:0},{x:1,y:0},{x:2,y:0}],.3).ok,false);
 assert.equal(skin.expandTriangle([{x:0,y:0},{x:1,y:0},{x:0,y:1}],-.1).ok,false);
});

test("expande cada lado a una distancia uniforme y conserva ambos sentidos",()=>{
 const distance=(p,a,b)=>Math.abs((b.x-a.x)*(a.y-p.y)-(a.x-p.x)*(b.y-a.y))/Math.hypot(b.x-a.x,b.y-a.y);
 for(const tri of [[{x:0,y:0},{x:10,y:0},{x:0,y:10}],[{x:0,y:10},{x:10,y:0},{x:0,y:0}]]){
  const r=skin.expandTriangle(tri,.35);assert.equal(r.ok,true);
  for(let i=0;i<3;i++)close(distance(r.triangle[i],tri[i],tri[(i+1)%3]),.35);
 }
});
test("la expansión cero devuelve una copia exacta sin mutar el original",()=>{
 const tri=[{x:1,y:2},{x:8,y:2},{x:3,y:9}],r=skin.expandTriangle(tri,0);
 assert.deepEqual(r.triangle,tri);assert.notEqual(r.triangle,tri);assert.notEqual(r.triangle[0],tri[0]);
});


test("la pose de referencia conserva una malla con varios huesos",()=>{
 const bind={owner:[1,0,0,1,0,0],upper:[1,0,0,1,0,-10],lower:[1,0,0,1,0,25]};
 const built=skin.buildSkinMatrices(bind,bind);assert.equal(built.ok,true);
 const vertices=[
  {x:0,y:0,weights:[{boneId:"upper",weight:.75},{boneId:"lower",weight:.25}]},
  {x:12,y:18,weights:[{boneId:"upper",weight:.2},{boneId:"lower",weight:.8}]}
 ];
 const result=skin.deformVertices(vertices,built.matrices);assert.equal(result.ok,true);
 vertices.forEach((v,i)=>{close(result.vertices[i].x,v.x);close(result.vertices[i].y,v.y);});
});

test("dos huesos conservan una deformación coherente al trasladarse juntos",()=>{
 const bind={upper:[1,0,0,1,0,-10],lower:[1,0,0,1,0,25]};
 const current={upper:[1,0,0,1,7,-6],lower:[1,0,0,1,7,29]};
 const built=skin.buildSkinMatrices(bind,current);assert.equal(built.ok,true);
 const vertices=[
  {x:0,y:0,weights:[{boneId:"upper",weight:.75},{boneId:"lower",weight:.25}]},
  {x:12,y:18,weights:[{boneId:"upper",weight:.2},{boneId:"lower",weight:.8}]}
 ];
 const result=skin.deformVertices(vertices,built.matrices);assert.equal(result.ok,true);
 vertices.forEach((v,i)=>{close(result.vertices[i].x,v.x+7);close(result.vertices[i].y,v.y-6);});
});

test("la mezcla de huesos mantiene continuidad en vértices compartidos",()=>{
 const bind={a:[1,0,0,1,0,0],b:[1,0,0,1,0,0]},current={a:[1,0,0,1,10,0],b:[1,0,0,1,0,10]};
 const matrices=skin.buildSkinMatrices(bind,current);assert.equal(matrices.ok,true);
 const shared={x:5,y:5,weights:[{boneId:"a",weight:.5},{boneId:"b",weight:.5}]};
 const left=skin.deformVertices([shared],matrices.matrices),right=skin.deformVertices([shared],matrices.matrices);
 assert.equal(left.ok,true);assert.equal(right.ok,true);close(left.vertices[0].x,right.vertices[0].x);close(left.vertices[0].y,right.vertices[0].y);
 close(left.vertices[0].x,10);close(left.vertices[0].y,10);
});
