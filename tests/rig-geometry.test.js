"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {worldTransform,worldMatrix,worldMatrices,reparentPreserving}=require("../prototype/character-editor-v01/rig-geometry.js");
function rig(){return [
 {id:"root",x:100,y:120,rotation:15,scale:1.2,pivotX:8,pivotY:-4,parent:null,rotationMin:-180,rotationMax:180},
 {id:"a",x:40,y:30,rotation:25,scale:0.8,pivotX:5,pivotY:7,parent:"root",rotationMin:-180,rotationMax:180},
 {id:"b",x:-20,y:55,rotation:-10,scale:1.1,pivotX:0,pivotY:0,parent:"a",rotationMin:-180,rotationMax:180},
 {id:"other",x:260,y:80,rotation:-30,scale:0.9,pivotX:-6,pivotY:3,parent:"root",rotationMin:-180,rotationMax:180}
];}
function close(a,b){assert.ok(Math.abs(a-b)<1e-8,a+" != "+b);}
test("reparenta una pieza conservando posición, rotación y escala mundiales",()=>{
 const nodes=rig(),before=worldTransform(nodes,"b"),r=reparentPreserving(nodes,"b","other");assert.equal(r.ok,true);
 const after=worldTransform(nodes,"b");close(before.x,after.x);close(before.y,after.y);close(before.rotation,after.rotation);close(before.scale,after.scale);
});
test("conserva también la transformación de los descendientes",()=>{
 const nodes=rig(),before=worldTransform(nodes,"b"),r=reparentPreserving(nodes,"a","other");assert.equal(r.ok,true);
 const after=worldTransform(nodes,"b");close(before.x,after.x);close(before.y,after.y);close(before.rotation,after.rotation);close(before.scale,after.scale);
});
test("rechaza ciclos y padres inexistentes sin mutar la pieza",()=>{
 const nodes=rig(),snapshot={...nodes[1]};assert.equal(reparentPreserving(nodes,"a","b").ok,false);assert.deepEqual(nodes[1],snapshot);
 assert.equal(reparentPreserving(nodes,"b","missing").ok,false);assert.deepEqual(nodes[2].parent,"a");
});
test("rechaza un cambio que excedería los límites angulares de la pieza",()=>{
 const nodes=rig();nodes[2].rotationMin=-5;nodes[2].rotationMax=5;
 const snapshot={...nodes[2]},r=reparentPreserving(nodes,"b","other");assert.equal(r.ok,false);assert.deepEqual(nodes[2],snapshot);
});

test("la matriz mundial transforma el pivote al origen mundial de cada hueso",()=>{
 const nodes=rig();for(const id of ["root","a","b","other"]){const n=nodes.find(x=>x.id===id),m=worldMatrix(nodes,id),p={x:n.pivotX||0,y:n.pivotY||0},world={x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]},t=worldTransform(nodes,id);close(world.x,t.x);close(world.y,t.y);}
});
test("produce matrices mundiales para todo el rig y rechaza jerarquías rotas",()=>{
 const nodes=rig(),r=worldMatrices(nodes);assert.equal(r.ok,true);assert.equal(Object.keys(r.matrices).length,nodes.length);
 nodes[1].parent="missing";assert.equal(worldMatrices(nodes).ok,false);
});
