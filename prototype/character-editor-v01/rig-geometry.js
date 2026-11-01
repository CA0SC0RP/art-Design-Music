(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.ADM_RigGeometry=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function finite(n){return Number.isFinite(Number(n));}
function worldTransform(nodes,id,seen=new Set()){
 const map=nodes instanceof Map?nodes:new Map(nodes.map(n=>[n.id,n])),node=map.get(id);
 if(!node)throw new Error("La pieza solicitada no existe.");
 if(seen.has(id))throw new Error("La jerarquía contiene un ciclo.");
 seen.add(id);
 const own={x:Number(node.x),y:Number(node.y),rotation:Number(node.rotation)||0,scale:Number(node.scale)||1};
 if(![own.x,own.y,own.rotation,own.scale].every(Number.isFinite)||own.scale<=0)throw new Error("Transformación local no válida.");
 if(!node.parent){seen.delete(id);return own;}
 const parent=map.get(node.parent);if(!parent)throw new Error("La pieza padre no existe.");
 const p=worldTransform(map,parent.id,seen),px=Number(parent.pivotX)||0,py=Number(parent.pivotY)||0;
 const lx=(own.x-px)*p.scale,ly=(own.y-py)*p.scale,rad=p.rotation*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad);
 const result={x:p.x+c*lx-s*ly,y:p.y+s*lx+c*ly,rotation:p.rotation+own.rotation,scale:p.scale*own.scale};
 seen.delete(id);return result;
}
function reparentPreserving(nodes,id,newParentId){
 const map=nodes instanceof Map?nodes:new Map(nodes.map(n=>[n.id,n])),node=map.get(id),parent=map.get(newParentId);
 if(!node||!parent||id===newParentId)return {ok:false,message:"La pieza o el nuevo padre no son válidos."};
 let cursor=parent;while(cursor){if(cursor.id===id)return {ok:false,message:"No se puede convertir una pieza hija en padre de su propio ancestro."};cursor=cursor.parent?map.get(cursor.parent):null;}
 try{
  const before=worldTransform(map,id),nextParent=worldTransform(map,newParentId),rad=-nextParent.rotation*Math.PI/180,dx=before.x-nextParent.x,dy=before.y-nextParent.y,c=Math.cos(rad),s=Math.sin(rad),scale=nextParent.scale;
  const x=(c*dx-s*dy)/scale+(Number(parent.pivotX)||0),y=(s*dx+c*dy)/scale+(Number(parent.pivotY)||0),rotation=before.rotation-nextParent.rotation,localScale=before.scale/scale;
  if(![x,y,rotation,localScale].every(Number.isFinite)||localScale<=0)return {ok:false,message:"No se pudo conservar la transformación de la pieza."};
  if(rotation<Number(node.rotationMin??-180)-1e-7||rotation>Number(node.rotationMax??180)+1e-7)return {ok:false,message:"El nuevo padre exigiría una rotación fuera de los límites de esta articulación."};
  Object.assign(node,{parent:newParentId,x,y,rotation,scale:localScale});
  return {ok:true,message:"Jerarquía actualizada conservando la posición visual."};
 }catch(error){return {ok:false,message:error.message||"No se pudo cambiar la jerarquía."};}
}
return {worldTransform,reparentPreserving};
});