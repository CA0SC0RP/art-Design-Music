(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.ADM_MeshSkinning=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const MAX_VERTICES=50000,MAX_BONES=100,MAX_INFLUENCES=4;
function validMatrix(m){return Array.isArray(m)&&m.length===6&&m.every(Number.isFinite);}
function multiply(a,b){
 if(!validMatrix(a)||!validMatrix(b))throw new Error("Matriz afín no válida.");
 return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
}
function invert(m){
 if(!validMatrix(m))throw new Error("Matriz afín no válida.");
 const det=m[0]*m[3]-m[1]*m[2];
 if(!Number.isFinite(det)||Math.abs(det)<1e-10)throw new Error("La matriz de referencia no se puede invertir.");
 return [m[3]/det,-m[1]/det,-m[2]/det,m[0]/det,(m[2]*m[5]-m[3]*m[4])/det,(m[1]*m[4]-m[0]*m[5])/det];
}
function transformPoint(m,p){
 if(!validMatrix(m)||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new Error("Punto o matriz no válidos.");
 return {x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]};
}
function expandTriangle(triangle,amount){
 if(!Array.isArray(triangle)||triangle.length!==3||!triangle.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y))||!Number.isFinite(amount)||amount<0)return {ok:false,message:"Triángulo o expansión no válidos."};
 const area=(triangle[1].x-triangle[0].x)*(triangle[2].y-triangle[0].y)-(triangle[2].x-triangle[0].x)*(triangle[1].y-triangle[0].y);
 if(Math.abs(area)<1e-9)return {ok:false,message:"No se puede expandir un triángulo degenerado."};
 const center={x:(triangle[0].x+triangle[1].x+triangle[2].x)/3,y:(triangle[0].y+triangle[1].y+triangle[2].y)/3};
 const expanded=triangle.map(p=>{const dx=p.x-center.x,dy=p.y-center.y,length=Math.hypot(dx,dy);return length<1e-9?{x:p.x,y:p.y}:{x:p.x+dx/length*amount,y:p.y+dy/length*amount};});
 return expanded.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))?{ok:true,triangle:expanded}:{ok:false,message:"La expansión produjo coordenadas no válidas."};
}
function triangleTransform(source,target){
 if(!Array.isArray(source)||!Array.isArray(target)||source.length!==3||target.length!==3||![...source,...target].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)))return {ok:false,message:"Los triángulos no son válidos."};
 const [p0,p1,p2]=source,[q0,q1,q2]=target,dx1=p1.x-p0.x,dy1=p1.y-p0.y,dx2=p2.x-p0.x,dy2=p2.y-p0.y,det=dx1*dy2-dx2*dy1;
 if(!Number.isFinite(det)||Math.abs(det)<1e-9)return {ok:false,message:"El triángulo de referencia está degenerado."};
 const X1=q1.x-q0.x,X2=q2.x-q0.x,Y1=q1.y-q0.y,Y2=q2.y-q0.y,a=(X1*dy2-X2*dy1)/det,c=(dx1*X2-dx2*X1)/det,b=(Y1*dy2-Y2*dy1)/det,d=(dx1*Y2-dx2*Y1)/det,e=q0.x-a*p0.x-c*p0.y,f=q0.y-b*p0.x-d*p0.y,matrix=[a,b,c,d,e,f];
 return matrix.every(Number.isFinite)?{ok:true,matrix}:{ok:false,message:"La transformación del triángulo no es finita."};
}
function buildSkinMatrices(bindWorld,currentWorld){
 if(!bindWorld||!currentWorld||typeof bindWorld!=="object"||typeof currentWorld!=="object")return {ok:false,message:"Faltan matrices de referencia o actuales."};
 const ids=Object.keys(bindWorld);
 if(!ids.length||ids.length>MAX_BONES||Object.keys(currentWorld).length!==ids.length)return {ok:false,message:"Cantidad de huesos no válida."};
 const matrices={};
 try{
  for(const id of ids){if(!Object.prototype.hasOwnProperty.call(currentWorld,id)||!validMatrix(bindWorld[id])||!validMatrix(currentWorld[id]))return {ok:false,message:"Una matriz de hueso no es válida."};matrices[id]=multiply(currentWorld[id],invert(bindWorld[id]));}
  return {ok:true,matrices};
 }catch(error){return {ok:false,message:error.message};}
}
function deformVertices(vertices,skinMatrices){
 if(!Array.isArray(vertices)||vertices.length>MAX_VERTICES||!skinMatrices||typeof skinMatrices!=="object")return {ok:false,message:"Malla o matrices no válidas."};
 const ids=Object.keys(skinMatrices);
 if(!ids.length||ids.length>MAX_BONES||ids.some(id=>!validMatrix(skinMatrices[id])))return {ok:false,message:"Las matrices de deformación no son válidas."};
 const output=[];
 for(const vertex of vertices){
  if(!vertex||!Number.isFinite(vertex.x)||!Number.isFinite(vertex.y)||!Array.isArray(vertex.weights)||vertex.weights.length<1||vertex.weights.length>MAX_INFLUENCES)return {ok:false,message:"Un vértice tiene coordenadas o influencias no válidas."};
  let total=0,x=0,y=0;
  for(const influence of vertex.weights){
   if(!influence||typeof influence.boneId!=="string"||!Object.prototype.hasOwnProperty.call(skinMatrices,influence.boneId)||!Number.isFinite(influence.weight)||influence.weight<0)return {ok:false,message:"Una influencia referencia un hueso inválido o tiene peso negativo."};
   total+=influence.weight;
  }
  if(!Number.isFinite(total)||total<=1e-10)return {ok:false,message:"La suma de pesos de un vértice debe ser mayor que cero."};
  for(const influence of vertex.weights){const p=transformPoint(skinMatrices[influence.boneId],vertex),w=influence.weight/total;x+=p.x*w;y+=p.y*w;}
  if(!Number.isFinite(x)||!Number.isFinite(y))return {ok:false,message:"La deformación produjo coordenadas no válidas."};
  output.push({x,y});
 }
 return {ok:true,vertices:output};
}
return {multiply,invert,transformPoint,expandTriangle,triangleTransform,buildSkinMatrices,deformVertices,limits:{maxVertices:MAX_VERTICES,maxBones:MAX_BONES,maxInfluences:MAX_INFLUENCES}};
});