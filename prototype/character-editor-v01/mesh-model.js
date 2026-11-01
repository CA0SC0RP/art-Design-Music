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
  faces.push([...f]);
 }
 return {ok:true,mesh:{version:1,columns:Number.isInteger(raw.columns)?raw.columns:null,rows:Number.isInteger(raw.rows)?raw.rows:null,vertices,faces}};
}
function moveVertex(mesh,index,x,y){
 if(!mesh||!Array.isArray(mesh.vertices)||!Number.isInteger(index)||!mesh.vertices[index]||!Number.isFinite(x)||!Number.isFinite(y))return {ok:false,message:"No se pudo mover el vértice: datos no válidos."};
 mesh.vertices[index].x=x;mesh.vertices[index].y=y;return {ok:true};
}
function setInfluence(mesh,index,boneId,weight){
 if(!mesh||!Array.isArray(mesh.vertices)||!mesh.vertices[index]||typeof boneId!=="string"||!Number.isFinite(weight)||weight<0)return {ok:false,message:"La influencia no es válida."};
 const v=mesh.vertices[index],existing=v.weights.find(w=>w.boneId===boneId);
 if(existing)existing.weight=weight;else if(weight>0&&v.weights.length<MAX_INFLUENCES)v.weights.push({boneId,weight});else if(weight>0)return {ok:false,message:"Un vértice admite como máximo cuatro huesos."};
 const total=v.weights.reduce((sum,w)=>sum+w.weight,0);
 if(total<=1e-10)return {ok:false,message:"Un vértice debe conservar al menos un peso positivo."};
 v.weights=v.weights.filter(w=>w.weight>0).map(w=>({...w,weight:w.weight/total}));return {ok:true};
}
return {createGrid,normalizeMesh,moveVertex,setInfluence,limits:{maxVertices:MAX_VERTICES,maxFaces:MAX_FACES,maxInfluences:MAX_INFLUENCES,maxBones:MAX_BONES}};
});