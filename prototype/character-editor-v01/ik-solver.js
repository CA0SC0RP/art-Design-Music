(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.ADM_IK=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function solveTwoBone(input){
 const p=input||{},L1=Number(p.length1),L2=Number(p.length2),x=Number(p.targetX),y=Number(p.targetY),bend=Number(p.bend);
 if(![L1,L2,x,y,bend].every(Number.isFinite)||L1<=0||L2<=0||(bend!==1&&bend!==-1))return {ok:false,message:"Parámetros IK no válidos."};
 const d=Math.hypot(x,y),minReach=Math.abs(L1-L2),maxReach=L1+L2,eps=1e-7;
 if(d<eps)return {ok:false,message:"El objetivo coincide con la raíz de la cadena; la orientación no está definida."};
 if(d<minReach-eps||d>maxReach+eps)return {ok:false,message:"Objetivo fuera del alcance ("+Math.round(minReach)+"–"+Math.round(maxReach)+" unidades)."};
 const safeD=Math.max(minReach,Math.min(maxReach,d));
 const cosA=Math.max(-1,Math.min(1,(L1*L1+safeD*safeD-L2*L2)/(2*L1*safeD)));
 const cosB=Math.max(-1,Math.min(1,(L1*L1+L2*L2-safeD*safeD)/(2*L1*L2)));
 // En SVG, una rotación positiva desplaza un segmento vertical hacia X negativo.
 const targetAngle=Math.atan2(-x,y),a=Math.acos(cosA),inner=Math.acos(cosB),radToDeg=180/Math.PI;
 const upperDeg=(targetAngle-bend*a)*radToDeg,lowerDeg=bend*(Math.PI-inner)*radToDeg;
 const upperMin=p.upperMin===undefined?-165:Number(p.upperMin),upperMax=p.upperMax===undefined?165:Number(p.upperMax);
 const lowerMin=p.lowerMin===undefined?-150:Number(p.lowerMin),lowerMax=p.lowerMax===undefined?150:Number(p.lowerMax);
 if(![upperMin,upperMax,lowerMin,lowerMax].every(Number.isFinite)||upperMin>upperMax||lowerMin>lowerMax)return {ok:false,message:"Los límites articulares configurados no son válidos."};
 if(upperDeg<upperMin-eps||upperDeg>upperMax+eps)return {ok:false,message:"La solución excede el rango anatómico del hombro o la cadera."};
 if((bend>0&&lowerDeg< -eps)||(bend<0&&lowerDeg>eps)||lowerDeg<lowerMin-eps||lowerDeg>lowerMax+eps)return {ok:false,message:"La flexión excede el rango permitido del codo o la rodilla."};
 return {ok:true,upperDeg,lowerDeg,reach:d,minReach,maxReach};
}
return {solveTwoBone};
});
