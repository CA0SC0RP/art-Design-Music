"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {normalizeProject,escapeHtml}=require("../prototype/character-editor-v01/project-io.js");
function project(overrides={}){return {version:2,name:"Prueba",root:"root",nodes:[
 {id:"root",name:"Raíz",type:"grupo",x:500,y:300,rotation:0,parent:null,shape:null,fill:null},
 {id:"arm",name:"Brazo",type:"brazo",x:0,y:40,rotation:0,parent:"root",shape:"limb",fill:"#d9ad7c"}
 ],poses:[],...overrides};}
test("normaliza un proyecto válido y aplica valores predeterminados de compatibilidad",()=>{
 const raw=project();delete raw.nodes[1].pivotX;delete raw.nodes[1].pivotY;delete raw.nodes[1].rotationMin;delete raw.nodes[1].rotationMax;delete raw.nodes[1].scale;
 const r=normalizeProject(raw);assert.equal(r.ok,true);assert.equal(r.project.version,2);assert.equal(r.project.nodes[1].scale,1);assert.equal(r.project.nodes[1].pivotX,0);
});
test("rechaza identificadores repetidos y referencias a padres inexistentes",()=>{
 const dup=project();dup.nodes.push({...dup.nodes[1]});assert.equal(normalizeProject(dup).ok,false);
 const missing=project();missing.nodes[1].parent="fantasma";assert.equal(normalizeProject(missing).ok,false);
});
test("rechaza ciclos en la jerarquía",()=>{
 const p=project();p.nodes[0].parent="arm";assert.equal(normalizeProject(p).ok,false);
});
test("rechaza formas y colores no permitidos",()=>{
 const shape=project();shape.nodes[1].shape="script";assert.equal(normalizeProject(shape).ok,false);
 const fill=project();fill.nodes[1].fill='red" onload="alert(1)';assert.equal(normalizeProject(fill).ok,false);
});
test("normaliza poses y limita rotaciones al rango de cada articulación",()=>{
 const p=project();p.nodes[1].rotationMin=-45;p.nodes[1].rotationMax=45;p.poses=[{id:"p1",name:"Pose",nodes:[{id:"arm",x:2,y:3,rotation:90,scale:1}]}];
 const r=normalizeProject(p);assert.equal(r.ok,true);assert.equal(r.project.poses[0].nodes[0].rotation,45);
});
test("escapa texto importado antes de insertarlo en HTML",()=>{
 assert.equal(escapeHtml('<img src=x onerror="x"> & \'ok\''),'&lt;img src=x onerror=&quot;x&quot;&gt; &amp; &#39;ok&#39;');
});

test("rechaza IDs inseguros y colores hexadecimales de longitud incorrecta",()=>{
 const badId=project();badId.nodes[1].id='arm" onload="x';assert.equal(normalizeProject(badId).ok,false);
 const badColor=project();badColor.nodes[1].fill="#12345";assert.equal(normalizeProject(badColor).ok,false);
});
test("rechaza identificadores de pose repetidos",()=>{
 const p=project();p.poses=[{id:"same",name:"A",nodes:[]},{id:"same",name:"B",nodes:[]}];
 assert.equal(normalizeProject(p).ok,false);
});

test("conserva las formas faciales de una expresión dentro de una pose",()=>{
 const p=project();p.nodes[1].shape="mouthNeutral";p.poses=[{id:"smile",name:"Alegre",nodes:[{id:"arm",x:0,y:40,rotation:0,scale:1,shape:"mouthSmile"}]}];
 const r=normalizeProject(p);assert.equal(r.ok,true);assert.equal(r.project.poses[0].nodes[0].shape,"mouthSmile");
 const bad=project();bad.nodes[1].shape="mouthNeutral";bad.poses=[{id:"bad",nodes:[{id:"arm",x:0,y:40,rotation:0,scale:1,shape:"not-a-face"}]}];
 assert.equal(normalizeProject(bad).ok,false);
});

test("migrates version-one projects with legacy transform fields",()=>{
 const p=project({version:1});delete p.nodes[1].pivotX;delete p.nodes[1].pivotY;delete p.nodes[1].rotationMin;delete p.nodes[1].rotationMax;
 const r=normalizeProject(p);assert.equal(r.ok,true);assert.equal(r.project.version,2);assert.equal(r.project.nodes[1].pivotX,0);assert.equal(r.project.nodes[1].rotationMin,-180);
});

test("conserva una malla válida y normaliza sus pesos al importar",()=>{
 const p=project();p.nodes[1].mesh={version:1,columns:2,rows:2,vertices:[
 {id:"v0",x:-10,y:-10,weights:[{boneId:"arm",weight:2}]},
 {id:"v1",x:10,y:-10,weights:[{boneId:"arm",weight:1}]},
 {id:"v2",x:-10,y:10,weights:[{boneId:"arm",weight:1}]},
 {id:"v3",x:10,y:10,weights:[{boneId:"arm",weight:1}]}
 ],faces:[[0,1,3],[0,3,2]],bindMatrices:{root:[1,0,0,1,0,0],arm:[1,0,0,1,0,0]}};
 const r=normalizeProject(p);assert.equal(r.ok,true);assert.equal(r.project.nodes[1].mesh.vertices.length,4);assert.equal(r.project.nodes[1].mesh.vertices[0].weights[0].weight,1);
});
test("rechaza mallas con huesos inexistentes, pesos cero o caras inválidas",()=>{
 const p=project();p.nodes[1].mesh={vertices:[
 {id:"v0",x:0,y:0,weights:[{boneId:"ghost",weight:1}]},
 {id:"v1",x:1,y:0,weights:[{boneId:"arm",weight:1}]},
 {id:"v2",x:0,y:1,weights:[{boneId:"arm",weight:1}]}
 ],faces:[[0,1,2]]};
 assert.equal(normalizeProject(p).ok,false);
 p.nodes[1].mesh.vertices[0].weights=[{boneId:"arm",weight:0}];assert.equal(normalizeProject(p).ok,false);
 p.nodes[1].mesh.vertices[0].weights=[{boneId:"arm",weight:1}];p.nodes[1].mesh.faces=[[0,1,9]];assert.equal(normalizeProject(p).ok,false);
});

test("valida y conserva matrices de referencia de la malla",()=>{
 const p=project();p.nodes[1].mesh={vertices:[
 {id:"v0",x:0,y:0,weights:[{boneId:"arm",weight:1}]},
 {id:"v1",x:1,y:0,weights:[{boneId:"arm",weight:1}]},
 {id:"v2",x:0,y:1,weights:[{boneId:"arm",weight:1}]}
 ],faces:[[0,1,2]],bindMatrices:{arm:[1,0,0,1,0,0]}};
 let r=normalizeProject(p);assert.equal(r.ok,true);assert.deepEqual(r.project.nodes[1].mesh.bindMatrices.arm,[1,0,0,1,0,0]);
 p.nodes[1].mesh.bindMatrices.arm=[1,2];assert.equal(normalizeProject(p).ok,false);
 p.nodes[1].mesh.bindMatrices={ghost:[1,0,0,1,0,0]};assert.equal(normalizeProject(p).ok,false);
});

test("conserva matrices de referencia de todos los huesos añadidos al pintar influencias",()=>{
 const p=project();p.nodes.push({id:"forearm",name:"Antebrazo",type:"brazo",x:0,y:20,rotation:0,parent:"arm",shape:"limb",fill:"#d9ad7c"});
 p.nodes[1].mesh={vertices:[
  {id:"v0",x:0,y:0,weights:[{boneId:"arm",weight:.6},{boneId:"forearm",weight:.4}]},
  {id:"v1",x:1,y:0,weights:[{boneId:"arm",weight:1}]},
  {id:"v2",x:0,y:1,weights:[{boneId:"forearm",weight:1}]}
 ],faces:[[0,1,2]],bindMatrices:{arm:[1,0,0,1,0,0],forearm:[1,0,0,1,0,20]}};
 const r=normalizeProject(p);assert.equal(r.ok,true);assert.deepEqual(r.project.nodes[1].mesh.bindMatrices,p.nodes[1].mesh.bindMatrices);
});
