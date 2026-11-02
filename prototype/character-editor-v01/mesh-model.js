(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.ADM_MeshModel=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const MAX_VERTICES=50000,MAX_FACES=100000,MAX_INFLUENCES=4,MAX_BONES=100;
function createGrid(options){
 const p=options||{},width=Number(p.width),height=Number(p.height),columns=Number(p.columns),rows=Number(p.rows),boneId=String(p.boneId||"");
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!Number.isInteger(columns)||!Number.isInteger(rows)||columns<2||rows<2||columns>100||rows>100||!boneId)return {ok:false,message:"Dimensiones, resolución o hueso raíz no válidos."};
 const count=columns*rows;if(count>MAX_VERTICES)return {ok:false,message:"La malla supera el máximo de vértices."};
 const vertices=[],faces=[];
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
  vertices.push({id:"v"+(y*columns+x),x:-width/2+width*x/(columns-1),y:-height/2+height*y/(rows-1),weights:[{boneId,weight:1}]});
 }
 for(let y=0;y<rows-1;y++)for(let x=0;x<columns-1;x++){
  const a=y*columns+x,b=a+1,c=a+columns,d=c+1;
  faces.push([a,b,d],[a,d,c]);
 }
 return {ok:true,mesh:{version:1,columns,rows,vertices,faces}};
}
function normalizeMesh(raw,boneIds){
 if(!raw||typeof raw!=="object"||!Array.isArray(raw.vertices)||!Array.isArray(raw.faces)||raw.vertices.length<3||raw.vertices.length>MAX_VERTICES||raw.faces.length>MAX_FACES)return {ok:false,message:"La estructura o tamaño de la malla no es válido."};
 const allowed=new Set(boneIds||[]);if(!allowed.size||allowed.size>MAX_BONES)return {ok:false,message:"La malla necesita una lista válida de huesos."};
 const ids=new Set(),vertices=[];
 for(const v of raw.vertices){
  if(!v||typeof v.id!=="string"||!/^v[0-9A-Za-z_-]{1,80}$/.test(v.id)||ids.has(v.id)||!Number.isFinite(v.x)||!Number.isFinite(v.y)||!Array.isArray(v.weights)||v.weights.length<1||v.weights.length>MAX_INFLUENCES)return {ok:false,message:"Un vértice tiene datos no válidos."};
  ids.add(v.id);let total=0;const seen=new Set(),weights=[];
  for(const w of v.weights){
   if(!w||typeof w.boneId!=="string"||!allowed.has(w.boneId)||seen.has(w.boneId)||!Number.isFinite(w.weight)||w.weight<0)return {ok:false,message:"Una influencia contiene un hueso o peso no válido."};
   seen.add(w.boneId);total+=w.weight;weights.push({boneId:w.boneId,weight:w.weight});
  }
  if(total<=1e-10||!Number.isFinite(total))return {ok:false,message:"Cada vértice debe tener pesos cuya suma sea mayor que cero."};
  vertices.push({id:v.id,x:v.x,y:v.y,weights:weights.map(w=>({...w,weight:w.weight/total}))});
 }
 const faces=[];
 for(const f of raw.faces){
  if(!Array.isArray(f)||f.length!==3||!f.every(i=>Number.isInteger(i)&&i>=0&&i<vertices.length)||new Set(f).size!==3)return {ok:false,message:"Una cara debe contener tres índices de vértice distintos y válidos."};
  const [a,b,c]=f.map(i=>vertices[i]),area2=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
  if(!Number.isFinite(area2)||Math.abs(area2)<1e-9)return {ok:false,message:"Una cara no puede tener área nula o ser geométricamente degenerada."};
  faces.push([...f]);
 }
 return {ok:true,mesh:{version:1,columns:Number.isInteger(raw.columns)?raw.columns:null,rows:Number.isInteger(raw.rows)?raw.rows:null,vertices,faces}};
}
function moveVertex(mesh,index,x,y){
 if(!mesh||!Array.isArray(mesh.vertices)||!Number.isInteger(index)||!mesh.vertices[index]||!Number.isFinite(x)||!Number.isFinite(y))return {ok:false,message:"No se pudo mover el vértice: datos no válidos."};
 mesh.vertices[index].x=x;mesh.vertices[index].y=y;return {ok:true};
}
function setInfluence(mesh,index,boneId,weight){
 if(!mesh||!Array.isArray(mesh.vertices)||!mesh.vertices[index]||typeof boneId!=="string"||!boneId||!Number.isFinite(weight)||weight<0)return {ok:false,message:"La influencia no es válida."};
 const vertex=mesh.vertices[index];
 if(!Array.isArray(vertex.weights)||vertex.weights.length<1||vertex.weights.length>MAX_INFLUENCES)return {ok:false,message:"El vértice contiene una lista de influencias no válida."};
 const weights=vertex.weights.map(w=>({...w})),seen=new Set();
 for(const w of weights){if(!w||typeof w.boneId!=="string"||!w.boneId||seen.has(w.boneId)||!Number.isFinite(w.weight)||w.weight<0)return {ok:false,message:"El vértice contiene una influencia inválida o duplicada."};seen.add(w.boneId);}
 const existing=weights.find(w=>w.boneId===boneId);
 if(existing)existing.weight=weight;
 else if(weight>0&&weights.length<MAX_INFLUENCES)weights.push({boneId,weight});
 else if(weight>0)return {ok:false,message:"Un vértice admite como máximo cuatro huesos."};
 const total=weights.reduce((sum,w)=>sum+w.weight,0);
 if(!Number.isFinite(total)||total<=1e-10)return {ok:false,message:"Un vértice debe conservar al menos un peso positivo."};
 vertex.weights=weights.filter(w=>w.weight>0).map(w=>({...w,weight:w.weight/total}));return {ok:true};
}
function paintInfluence(mesh,x,y,boneId,strength,radius){
 if(!mesh||!Array.isArray(mesh.vertices)||mesh.vertices.length>MAX_VERTICES||!Number.isFinite(x)||!Number.isFinite(y)||typeof boneId!=="string"||!boneId||!Number.isFinite(strength)||strength<0||strength>1||!Number.isFinite(radius)||radius<=0)return {ok:false,message:"Parámetros del pincel no válidos."};
 if(mesh.vertices.some(v=>!v||!Number.isFinite(v.x)||!Number.isFinite(v.y)))return {ok:false,message:"El pincel encontró un vértice con coordenadas no válidas."};
 const targets=mesh.vertices.map(v=>({v,d:Math.hypot(v.x-x,v.y-y)})).filter(o=>o.d<=radius);
 if(!targets.length||strength===0)return {ok:true,changed:0};
 const updates=[];
 for(const {v,d} of targets){
  if(!Array.isArray(v.weights)||v.weights.length<1||v.weights.length>MAX_INFLUENCES)return {ok:false,message:"El pincel encontró un vértice con influencias no válidas."};
  const weights=v.weights.map(w=>({...w})),seen=new Set();
  for(const w of weights){if(!w||typeof w.boneId!=="string"||!w.boneId||seen.has(w.boneId)||!Number.isFinite(w.weight)||w.weight<0)return {ok:false,message:"El pincel encontró pesos o huesos no válidos."};seen.add(w.boneId);}
  const totalBefore=weights.reduce((sum,w)=>sum+w.weight,0);
  if(!Number.isFinite(totalBefore)||totalBefore<=1e-10)return {ok:false,message:"El pincel encontró un vértice sin pesos positivos."};
  let entry=weights.find(w=>w.boneId===boneId);
  if(!entry){if(weights.length>=MAX_INFLUENCES)return {ok:false,message:"El pincel encontró un vértice con cuatro huesos. Reduce o elimina una influencia antes de pintar."};entry={boneId,weight:0};weights.push(entry);}
  const amount=strength*Math.pow(1-d/radius,2);if(amount<=0)continue;
  entry.weight=entry.weight+(1-entry.weight)*amount;
  const total=weights.reduce((sum,w)=>sum+w.weight,0);
  if(!Number.isFinite(total)||total<=1e-10)return {ok:false,message:"El pincel no pudo normalizar los pesos del vértice."};
  updates.push({vertex:v,weights:weights.filter(w=>w.weight>0).map(w=>({...w,weight:w.weight/total}))});
 }
 for(const update of updates)update.vertex.weights=update.weights;
 return {ok:true,changed:updates.length};
}
return {createGrid,normalizeMesh,moveVertex,setInfluence,paintInfluence,limits:{maxVertices:MAX_VERTICES,maxFaces:MAX_FACES,maxInfluences:MAX_INFLUENCES,maxBones:MAX_BONES}};
});