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

test("el registro de capacidades se carga antes del adaptador",()=>{
 assert.ok(html.includes('<script src="../../creative-control/capability-registry.js"></script><script src="../../creative-control/adapter.js"></script>'));
});
test("el registro enumera capacidades reales y distingue propuestas de acciones manuales",()=>{
 const registry=fs.readFileSync(path.join(__dirname,"../creative-control/capability-registry.js"),"utf8");
 for(const id of ["set_part_transform","apply_pose","solve_ik","set_expression","create_mesh","edit_mesh_weights","add_part","delete_part"]) {
  assert.ok(registry.includes('"'+id+'"'),"Falta capacidad "+id);
 }
 assert.ok(registry.includes("agentExecutionEnabled: false"));
 assert.ok(registry.includes("proposalSupported"));
 assert.ok(registry.includes("preconditions"));
 assert.ok(registry.includes("reversible"));
 assert.ok(registry.includes("getCapability"));
});
test("el adaptador consume el registro y emite cambios de capacidades",()=>{
 assert.ok(adapter.includes("ADM_CapabilityRegistry"));
 assert.ok(adapter.includes("getCapability"));
 assert.ok(adapter.includes('"capabilities.changed"'));
 assert.ok(adapter.includes("capabilities.changed"));
});
