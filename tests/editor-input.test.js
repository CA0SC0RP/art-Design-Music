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

test("Creative Control carga el validador antes del adaptador",()=>{
 assert.ok(html.includes('<script src="../../creative-control/proposal-validator.js"></script>'));
 assert.ok(adapter.includes("validateProposal"));
 assert.ok(adapter.includes("ADM_ProposalValidator"));
});
test("el validador acepta propuestas válidas y simula sin mutar el proyecto",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../creative-control/proposal-validator.js"),"utf8");
 const sandbox={window:{}};
 vm.createContext(sandbox);
 vm.runInContext(source,sandbox);
 const context={
  ok:true,project:{revision:4},workspace:{id:"character"},
  resources:{rootId:"root",nodes:[
   {id:"root",transform:{x:0,y:0,rotation:0,scale:1,pivotX:0,pivotY:0}},
   {id:"torso",transform:{x:0,y:0,rotation:0,scale:1,rotationMin:-90,rotationMax:90,pivotX:0,pivotY:0}}
  ],poses:[]}
 };
 const before=JSON.stringify(context);
 const result=sandbox.window.ADM_ProposalValidator.validate({
  schemaVersion:"1.0",proposalId:"proposal-test",projectVersion:"4",workspace:"character",
  summary:"Mover torso y cambiar su orientación.",
  actions:[{type:"set_part_transform",targetId:"torso",transform:{x:50,rotation:30}}]
 },context);
 assert.equal(result.ok,true);
 assert.equal(result.status,"valid");
 assert.equal(result.mutatesProject,false);
 assert.equal(result.executionEnabled,false);
 assert.equal(result.effects[0].after.x,50);
 assert.equal(result.effects[0].after.rotation,30);
 assert.equal(JSON.stringify(context),before);
});
test("el validador rechaza propuestas obsoletas, límites articulares y acciones desconocidas",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../creative-control/proposal-validator.js"),"utf8");
 const sandbox={window:{}};
 vm.createContext(sandbox);
 vm.runInContext(source,sandbox);
 const context={ok:true,project:{revision:8},workspace:{id:"character"},resources:{rootId:"root",nodes:[
  {id:"root",transform:{}},{id:"armR",transform:{x:0,y:0,rotation:0,scale:1,rotationMin:-45,rotationMax:45,pivotX:0,pivotY:0}}
 ],poses:[]}};
 const base={schemaVersion:"1.0",proposalId:"stale-test",projectVersion:"7",workspace:"character",summary:"Propuesta antigua",actions:[{type:"set_part_transform",targetId:"armR",transform:{rotation:90}}]};
 const stale=sandbox.window.ADM_ProposalValidator.validate(base,context);
 assert.equal(stale.status,"stale");
 assert.ok(stale.errors.some(error=>error.code==="stale_project"));
 const current={...base,projectVersion:"8"};
 const invalid=sandbox.window.ADM_ProposalValidator.validate(current,context);
 assert.equal(invalid.status,"invalid");
 assert.ok(invalid.errors.some(error=>error.code==="joint_limit"));
 const unknown={...base,projectVersion:"8",actions:[{type:"run_arbitrary_code"}]};
 const rejected=sandbox.window.ADM_ProposalValidator.validate(unknown,context);
 assert.ok(rejected.errors.some(error=>error.code==="unsupported_action"));
});
test("el validador genera una simulación IK y de expresión sin ejecutar cambios",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../creative-control/proposal-validator.js"),"utf8");
 const sandbox={window:{ADM_IK:{solveTwoBone:()=>({ok:true,upperDeg:22,lowerDeg:-41})}}};
 vm.createContext(sandbox);
 vm.runInContext(source,sandbox);
 const transform=(x,y)=>({x,y,rotation:0,scale:1,pivotX:0,pivotY:0,rotationMin:-180,rotationMax:180});
 const context={ok:true,project:{revision:2},workspace:{id:"character"},resources:{rootId:"root",nodes:[
  {id:"root",transform:transform(0,0)},{id:"torso",transform:transform(0,0)},
  {id:"armR",transform:transform(65,-50)},{id:"foreR",transform:transform(0,65)},{id:"handR",transform:transform(0,60)},
  {id:"mouth",transform:transform(0,0)},{id:"browL",transform:transform(0,0)},{id:"browR",transform:transform(0,0)},
  {id:"eyeL",transform:transform(0,0)},{id:"eyeR",transform:transform(0,0)}
 ],poses:[]}};
 const result=sandbox.window.ADM_ProposalValidator.validate({
  schemaVersion:"1.0",proposalId:"creative-preview",projectVersion:"2",workspace:"character",summary:"Saludar y sonreír.",
  actions:[{type:"solve_ik",chainId:"armR",target:{x:100,y:-110},bend:1},{type:"set_expression",expression:"happy"}]
 },context);
 assert.equal(result.ok,true);
 assert.equal(result.effects[0].rotations.armR,22);
 assert.equal(result.effects[0].rotations.foreR,-41);
 assert.equal(result.effects[1].operations.find(item=>item.targetId==="mouth").value,"mouthSmile");
 assert.equal(result.mutatesProject,false);
});


test("el constructor de vista previa aplica efectos sobre una copia aislada",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../creative-control/preview-state.js"),"utf8");
 const sandbox={window:{}};
 vm.createContext(sandbox);
 vm.runInContext(source,sandbox);
 const project={version:2,root:"root",nodes:[
  {id:"root",parent:null,x:0,y:0,rotation:0,scale:1},
  {id:"arm",parent:"root",x:10,y:20,rotation:0,scale:1,shape:"limb"},
  {id:"hand",parent:"arm",x:0,y:40,rotation:0,scale:1,shape:"hand"}
 ]};
 const before=JSON.stringify(project);
 const result=sandbox.window.ADM_PreviewState.build(project,[
  {type:"set_part_transform",targetId:"arm",after:{x:30,y:45,rotation:25,scale:1}},
  {type:"solve_ik",rotations:{hand:12}},
  {type:"set_expression",operations:[]}
 ]);
 assert.equal(result.ok,true);
 assert.equal(result.project.nodes[1].x,30);
 assert.equal(result.project.nodes[1].rotation,25);
 assert.equal(result.project.nodes[2].rotation,12);
 assert.equal(result.mutatesSource,false);
 assert.equal(JSON.stringify(project),before);
});

test("la vista previa aplica poses y expresiones y rechaza mallas o destinos inexistentes",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../creative-control/preview-state.js"),"utf8");
 const sandbox={window:{}};
 vm.createContext(sandbox);
 vm.runInContext(source,sandbox);
 const project={root:"root",nodes:[
  {id:"root",parent:null,x:0,y:0,rotation:0,scale:1},
  {id:"mouth",parent:"root",x:0,y:5,rotation:0,scale:1,shape:"mouthNeutral"}
 ]};
 const pose=sandbox.window.ADM_PreviewState.build(project,[{type:"apply_pose",nodes:[{id:"mouth",x:2,y:6,rotation:0,scale:1,shape:"mouthSmile"}]}]);
 assert.equal(pose.ok,true);
 assert.equal(pose.project.nodes[1].shape,"mouthSmile");
 const expression=sandbox.window.ADM_PreviewState.build(project,[{type:"set_expression",operations:[{targetId:"mouth",property:"shape",value:"mouthSad"}]}]);
 assert.equal(expression.project.nodes[1].shape,"mouthSad");
 assert.equal(sandbox.window.ADM_PreviewState.build(project,[{type:"set_part_transform",targetId:"missing",after:{x:1}}]).ok,false);
 const withMesh={root:"root",nodes:[{id:"root",parent:null},{id:"meshPart",parent:"root",mesh:{vertices:[]}}]};
 const rejected=sandbox.window.ADM_PreviewState.build(withMesh,[{type:"set_part_transform",targetId:"meshPart",after:{x:1}}]);
 assert.equal(rejected.code,"mesh_preview_unavailable");
});

test("el editor carga el estado de vista previa y ofrece una capa visual separada",()=>{
 assert.ok(html.includes('<script src="../../creative-control/preview-state.js"></script>'));
 assert.ok(html.includes('<g id="creativePreview" pointer-events="none"></g>'));
 assert.match(html,/window\.ADM_EditorPreview=Object\.freeze/);
 assert.match(html,/clearCreativePreview\(\)/);
 assert.match(html,/creativePreviewStatus/);
});

test("el adaptador expone previsualización y cancelación sin habilitar ejecución",()=>{
 assert.match(adapter,/const previewProposal = proposal =>/);
 assert.match(adapter,/const clearPreview = \(\) =>/);
 assert.match(adapter,/previewProposal,/);
 assert.match(adapter,/clearPreview,/);
 assert.match(adapter,/execution:\s*\{ enabled: false/);
});

test("las propuestas de pose validan transformaciones completas y ya no prometen transición configurable",()=>{
 const source=fs.readFileSync(path.join(__dirname,"../creative-control/proposal-validator.js"),"utf8");
 const schema=fs.readFileSync(path.join(__dirname,"../creative-control/contracts/action-proposal.schema.json"),"utf8");
 const sandbox={window:{}};
 vm.createContext(sandbox);
 vm.runInContext(source,sandbox);
 const context={ok:true,project:{revision:3},workspace:{id:"character"},resources:{rootId:"root",nodes:[
  {id:"root",transform:{}},{id:"arm",transform:{x:0,y:0,rotation:0,scale:1,rotationMin:-45,rotationMax:45}}
 ],poses:[{id:"pose1",name:"Sentado",nodeCount:1,nodes:[{id:"arm",x:5,y:8,rotation:20,scale:1,shape:"limb"}]}]}};
 const proposal={schemaVersion:"1.0",proposalId:"pose-preview",projectVersion:"3",workspace:"character",summary:"Aplicar pose guardada.",actions:[{type:"apply_pose",poseId:"pose1"}]};
 const valid=sandbox.window.ADM_ProposalValidator.validate(proposal,context);
 assert.equal(valid.ok,true);
 assert.equal(valid.effects[0].nodes[0].rotation,20);
 const invalid=sandbox.window.ADM_ProposalValidator.validate({...proposal,actions:[{type:"apply_pose",poseId:"pose1",transitionMs:900}]},context);
 assert.ok(invalid.errors.some(error=>error.code==="unknown_property"));
 assert.equal(schema.includes("transitionMs"),false);
 assert.doesNotThrow(()=>JSON.parse(schema));
});
