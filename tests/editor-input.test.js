"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const html=fs.readFileSync(path.join(__dirname,"../prototype/character-editor-v01/index.html"),"utf8");
const adapter=fs.readFileSync(path.join(__dirname,"../creative-control/adapter.js"),"utf8");

test("el lienzo usa Pointer Events para entrada unificada",()=>{
 assert.match(html,/\.onpointerdown\s*=/);
 assert.match(html,/\.onpointermove\s*=/);
 assert.match(html,/\.onpointerup\s*=/);
});
test("el lienzo limpia el arrastre al cancelar o perder captura",()=>{
 assert.match(html,/\.onpointercancel\s*=\(\)\s*=>\s*\{drag=null;\}/);
 assert.match(html,/\.onlostpointercapture\s*=\(\)\s*=>\s*\{drag=null;\}/);
});
test("la interfaz aumenta controles para dispositivos de puntero táctil",()=>{
 assert.match(html,/@media\s*\(pointer:\s*coarse\)/);
 assert.match(html,/button\{min-height:44px/);
});
test("la malla muestra un mapa de calor del peso del hueso seleccionado",()=>{
 assert.match(html,/data-weight=/);
 assert.match(html,/Math\.round\(weight\*100\)/);
 assert.match(html,/meshBone"\)\.onchange=\(\)=>\{meshStatusMessage="";render\(\);\}/);
});
test("los controles deshabilitados se distinguen visualmente y no parecen activos",()=>{
 assert.match(html,/button:disabled\s*\{[^}]*opacity:/);
 assert.match(html,/input:disabled,select:disabled\s*\{[^}]*opacity:/);
});
test("ADM Creative Control carga el adaptador de sincronización de solo lectura",()=>{
 assert.ok(html.includes('<script src="../../creative-control/adapter.js"></script>'));
 assert.ok(adapter.includes("getContext"));
 assert.ok(adapter.includes("getCapabilities"));
 assert.ok(adapter.includes("subscribe"));
 assert.ok(adapter.includes('mode: "read-only"'));
 assert.ok(adapter.includes("MutationObserver"));
 assert.ok(adapter.includes("Object.freeze"));
});
test("el contrato identifica revisiones y eventos de sincronización",()=>{
 assert.match(adapter,/projectRevision/);
 assert.match(adapter,/contextRevision/);
 assert.match(adapter,/"project\.changed"/);
 assert.match(adapter,/"selection\.changed"/);
 assert.match(adapter,/"workspace\.changed"/);
});
test("el adaptador no publica operaciones de escritura ni ejecución",()=>{
 for(const forbidden of ["commit:", "execute:", "applyPose:", "setTransform:", "deleteNode:"]) {
  assert.equal(adapter.includes(forbidden),false);
 }
 assert.match(adapter,/execution:\s*\{ enabled: false/);
});
test("la API entrega contexto inmutable y notifica cambios de proyecto y selección",()=>{
 const observers=[];
 class FakeMutationObserver { constructor(callback){this.callback=callback;observers.push(this);} observe(){} }
 const sandbox={
  window:{},
  data:{version:2,name:"Proyecto de prueba",root:"root",nodes:[
   {id:"root",name:"Raíz",type:"grupo",children:["part"],x:0,y:0,rotation:0,scale:1},
   {id:"part",name:"Pieza",type:"brazo",parent:"root",children:[],x:10,y:20,rotation:0,scale:1}
  ],poses:[]},
  selected:"part",
  MutationObserver:FakeMutationObserver,
  document:{getElementById:()=>({})}
 };
 vm.createContext(sandbox);
 vm.runInContext(adapter,sandbox);
 const api=sandbox.window.ADM_CreativeControl;
 assert.equal(api.protocolVersion,"1.0.0");
 const initial=api.getContext();
 assert.equal(initial.workspace.id,"character");
 assert.equal(Object.isFrozen(initial),true);
 assert.equal(api.getCapabilities().execution.enabled,false);
 const events=[];
 const unsubscribe=api.subscribe(event=>events.push(event.type));
 assert.ok(events.includes("project.changed"));
 assert.ok(events.includes("selection.changed"));
 const firstProjectRevision=api.getContext().project.revision;
 sandbox.data.nodes[1].x=35;
 observers[0].callback();
 assert.ok(events.filter(type=>type==="project.changed").length>=2);
 assert.ok(api.getContext().project.revision>firstProjectRevision);
 const afterTransformRevision=api.getContext().project.revision;
 sandbox.data.nodes[1].mesh={vertices:[{x:1,y:2,weights:[]}],faces:[]};
 observers[0].callback();
 assert.ok(api.getContext().project.revision>afterTransformRevision);
 const projectRevision=api.getContext().project.revision;
 sandbox.selected="root";
 observers[0].callback();
 assert.ok(events.includes("selection.changed"));
 assert.equal(api.getContext().project.revision,projectRevision);
 unsubscribe();
});

test("el registro detecta capacidades según controles y selección sin ejecutar acciones",()=>{
 const registry=fs.readFileSync(path.join(__dirname,"../creative-control/capability-registry.js"),"utf8");
 const observers=[];
 class FakeMutationObserver { constructor(callback){this.callback=callback;observers.push(this);} observe(){} }
 const controls=new Set(["x","y","rot","scale","poseSelect","applyPose","ikChain","ikX","ikY","ikBend","solveIK","expressionSelect","applyExpression","meshCreate","meshDelete","meshPaint","meshAssign","meshBone","meshWeight","meshBrush","meshBrushMode","actionWave","actionWalkA","actionWalkB","actionRest","duplicate","parent","delete","poseName","savePose","import","export","save","tree","art","outline","selectedLabel","count","type"]);
 const sandbox={
  window:{applyPose:()=>{},solveIKAt:()=>{},applyExpression:()=>{},runCoordinatedAction:()=>{}},
  document:{getElementById:id=>controls.has(id)?{}:null,querySelectorAll:()=>[{},{}]},
  data:{version:2,name:"Prueba",root:"root",nodes:[{id:"root",name:"Raíz",type:"grupo"},{id:"torso",name:"Torso",type:"cuerpo",parent:"root",x:0,y:0,rotation:0,scale:1} ],poses:[{id:"pose1",name:"Reposo",nodes:[]}]},
  selected:"torso",
  MutationObserver:FakeMutationObserver
 };
 vm.createContext(sandbox);
 vm.runInContext(registry,sandbox);
 vm.runInContext(adapter,sandbox);
 const api=sandbox.window.ADM_CreativeControl;
 const initial=api.getCapabilities();
 const transform=initial.capabilities.find(item=>item.id==="set_part_transform");
 const pose=initial.capabilities.find(item=>item.id==="apply_pose");
 assert.equal(transform.available,true);
 assert.equal(transform.proposalSupported,true);
 assert.equal(transform.agentExecutionEnabled,false);
 assert.equal(pose.available,true);
 assert.equal(initial.execution.enabled,false);
 assert.equal(api.getCapability("solve_ik").agentExecutionEnabled,false);
 assert.equal(api.getCapability("solve_ik").proposalActionType,"solve_ik");
 assert.equal(api.getCapability("select_part").proposalSupported,false);
 assert.equal(api.getCapability("unknown_capability"),null);
 assert.equal(api.getCapability("solve_ik").available,false);
 assert.equal(api.getCapability("set_expression").available,false);
 const events=[];
 api.subscribe(event=>events.push(event.type));
 sandbox.selected="root";
 observers[0].callback();
 const next=api.getCapabilities().capabilities.find(item=>item.id==="set_part_transform");
 assert.equal(next.available,false);
 assert.ok(events.includes("capabilities.changed"));
});
