(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.ADM_ProjectIO=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const SHAPES=new Set(["torso","neck","head","hair","eye","limb","hand","foot","trunk","branch","twig","leaves","joint","brow","mouthNeutral","mouthSmile","mouthSad","mouthOpen","mouthAngry"]);
function finite(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback;}
function normalizeProject(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {ok:false,message:"El archivo no contiene un proyecto válido."};
 if(![1,2].includes(Number(raw.version))||!Array.isArray(raw.nodes)||raw.nodes.length<1||raw.nodes.length>500)return {ok:false,message:"Versión o cantidad de piezas no compatible."};
 if(typeof raw.root!=="string"||!raw.root)return {ok:false,message:"El proyecto no identifica una pieza raíz."};
 const ids=new Set(),nodes=[];
 for(const source of raw.nodes){
  if(!source||typeof source!=="object"||Array.isArray(source))return {ok:false,message:"Hay una pieza con estructura incorrecta."};
  const id=String(source.id||"");
  if(!/^[A-Za-z0-9_-]{1,80}$/.test(id)||ids.has(id))return {ok:false,message:"Hay identificadores vacíos, demasiado largos o repetidos."};
  ids.add(id);
  const name=String(source.name||"Pieza").slice(0,80),type=String(source.type||"pieza").slice(0,40);
  const shape=source.shape==null?null:String(source.shape);
  if(shape!==null&&!SHAPES.has(shape))return {ok:false,message:"El proyecto contiene una forma no admitida."};
  const fill=source.fill==null?null:String(source.fill);
  if(fill!==null&&!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(fill))return {ok:false,message:"El color de una pieza no es válido."};
  const x=finite(source.x,NaN),y=finite(source.y,NaN),rotation=finite(source.rotation,0);
  const rotationMin=finite(source.rotationMin,-180),rotationMax=finite(source.rotationMax,180);
  const pivotX=finite(source.pivotX,0),pivotY=finite(source.pivotY,0),scale=finite(source.scale,1);
  if(![x,y,rotation,rotationMin,rotationMax,pivotX,pivotY,scale].every(Number.isFinite)||rotationMin>rotationMax||rotationMin< -360||rotationMax>360||scale<0.05||scale>10)return {ok:false,message:"Una pieza contiene transformaciones o límites no válidos."};
  nodes.push({id,name,type,x,y,rotation:Math.max(rotationMin,Math.min(rotationMax,rotation)),rotationMin,rotationMax,pivotX,pivotY,scale,shape,fill,parent:source.parent==null?null:String(source.parent),children:[]});
 }
 if(!ids.has(raw.root))return {ok:false,message:"La pieza raíz no existe en el proyecto."};
 const rootNode=nodes.find(n=>n.id===raw.root);
 if(rootNode.parent!==null)return {ok:false,message:"La pieza raíz no puede tener padre."};
 for(const n of nodes){if(n.id!==raw.root&&!ids.has(n.parent))return {ok:false,message:"Una pieza hace referencia a un padre inexistente."};}
 const byId=new Map(nodes.map(n=>[n.id,n]));
 for(const n of nodes){const seen=new Set([n.id]);let p=n.parent;while(p){if(seen.has(p))return {ok:false,message:"La jerarquía contiene un ciclo."};seen.add(p);p=byId.get(p)?.parent||null;}}
 const poses=[],poseIds=new Set();
 if(raw.poses!=null&&!Array.isArray(raw.poses))return {ok:false,message:"La biblioteca de poses tiene un formato incorrecto."};
 for(const pose of (raw.poses||[])){
  if(poses.length>=500)return {ok:false,message:"El proyecto supera el máximo de 500 poses."};
  if(!pose||typeof pose!=="object"||!Array.isArray(pose.nodes))return {ok:false,message:"Una pose guardada tiene un formato incorrecto."};
  const poseNodeIds=new Set(),poseNodes=[];
  for(const p of pose.nodes){
   if(!p||!ids.has(String(p.id))||poseNodeIds.has(String(p.id)))return {ok:false,message:"Una pose referencia piezas inexistentes o repetidas."};
   const n=byId.get(String(p.id)),x=finite(p.x,NaN),y=finite(p.y,NaN),rotation=finite(p.rotation,NaN),scale=finite(p.scale,NaN);
   const poseShape=p.shape===undefined?n.shape:(p.shape==null?null:String(p.shape));
   if(poseShape!==null&&!SHAPES.has(poseShape))return {ok:false,message:"Una pose contiene una forma no admitida."};
   if(![x,y,rotation,scale].every(Number.isFinite)||scale<0.05||scale>10)return {ok:false,message:"Una pose contiene transformaciones no válidas."};
   poseNodeIds.add(String(p.id));poseNodes.push({id:String(p.id),x,y,rotation:Math.max(n.rotationMin,Math.min(n.rotationMax,rotation)),scale,shape:poseShape});
  }
  const poseId=String(pose.id||"pose_importada").slice(0,100);if(poseIds.has(poseId))return {ok:false,message:"Hay identificadores de pose repetidos."};poseIds.add(poseId);poses.push({id:poseId,name:String(pose.name||"Pose importada").slice(0,80),nodes:poseNodes});
 }
 return {ok:true,project:{version:2,name:String(raw.name||"Proyecto importado").slice(0,100),root:raw.root,nodes,poses}};
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
return {normalizeProject,escapeHtml};
});