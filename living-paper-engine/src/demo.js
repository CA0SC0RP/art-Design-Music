import { LivingPaperEngine, PaperPiece, PaperJoint, PaperFlex, PaperMesh, paperCut } from "./engine.js";
import { MotionPath, smoothStep } from "./motion.js";
import { enableLocalizedDeformation } from "./deformation.js";
import { enablePaperRig, bindJointToFold } from "./rigging.js";
import { enableFoldVolume } from "./volume.js";
import { enablePaperEdges } from "./edges.js";
import { enableElasticCurvature } from "./elastic.js";
import { enableLayerGroups } from "./layer-groups.js";

const host=document.querySelector("#stage");
const status=document.querySelector("#engineStatus");
const loading=document.querySelector("#loading");
const engine=await new LivingPaperEngine(host).init();
const cut=(g,s,points,fill,style)=>paperCut(g,s,points,{fill,...style});
loading?.remove();

const mountain=engine.addPiece(new PaperPiece({id:"mountain",name:"Montaña lejana",depth:5,x:640,y:360,draw:(g,s,style)=>{
  const p=[[-700,140],[-450,-110],[-200,140],[0,-55],[260,140],[480,-85],[700,160]];
  cut(g,s,p,0x9eafa5,style);
  cut(g,s,[[-700,140],[-450,-110],[-380,-15],[-320,40],[-200,140]],0xb8c8bd,style);
  cut(g,s,[[0,-55],[50,0],[100,45],[260,140]],0xb2c2b8,style);
}}));
const hill=engine.addPiece(new PaperPiece({id:"hill",name:"Colina intermedia",depth:4,x:640,y:470,draw:(g,s,style)=>{
  const p=[[-700,120],[-520,15],[-260,-5],[-100,55],[120,-15],[360,45],[700,120]];
  cut(g,s,p,0x6f967b,style);
}}));
const tree=engine.addPiece(new PaperPiece({id:"tree",name:"Árbol de papel",depth:2,x:330,y:450,draw:(g,s,style)=>{
  cut(g,s,[[-18,70],[-12,-120],[12,-120],[20,70]],0x8d674b,style);
  for(const [x,y,r,c] of [[-35,-125,65,0x47745e],[30,-170,72,0x56866a],[5,-85,62,0x628e6c],[-65,-65,43,0x739d78]]){
    const pts=Array.from({length:12},(_,i)=>[x+Math.cos(i*Math.PI/6)*r,y+Math.sin(i*Math.PI/6)*r*.82]);
    cut(g,s,pts,c,style);
  }
}}));
const branchJoint=engine.addArticulation(new PaperJoint({id:"branch",x:0,y:-105,angle:-7,minAngle:-25,maxAngle:18,sway:{amplitude:7,period:5,phase:.4},draw:(g,s,style)=>{
  cut(g,s,[[-5,5],[-3,-68],[3,-68],[6,5]],0x8d674b,style);
}}),tree.container);
const leafJoint=branchJoint.addChild(new PaperJoint({id:"leaf",x:0,y:-65,angle:12,minAngle:-38,maxAngle:38,sway:{amplitude:17,period:2.8,phase:1.1},draw:(g,s,style)=>{
  cut(g,s,[[0,0],[17,-17],[43,-22],[58,-12],[42,5],[15,9]],0x79a779,style);
}}));
branchJoint.addChild(new PaperJoint({id:"small-leaf",x:0,y:-38,angle:-10,minAngle:-35,maxAngle:35,sway:{amplitude:13,period:3.4,phase:2.2},draw:(g,s,style)=>{
  cut(g,s,[[0,0],[-18,-16],[-40,-14],[-48,-3],[-26,8],[-8,7]],0x638e6b,style);
}}));
const flexibleStem=engine.addFlex(new PaperFlex({id:"flexible-stem",x:55,y:-70,length:82,width:7,bend:0,maxBend:28,fill:0x6f9871,sway:{amplitude:13,period:4.4,phase:.8}}),tree.container);
const backingLeaf=engine.addPaperMesh(new PaperMesh({id:"backing-leaf",x:72,y:-222,width:150,height:92,fill:0x668a65,material:"cardstock",columns:14,rows:10,wave:0,fold:0,frequency:1.35,phase:.6,shape:[[.02,.5],[.16,.24],[.42,.06],[.7,.04],[.94,.3],[.99,.5],[.78,.76],[.48,.94],[.2,.78]]}),tree.container);
backingLeaf.container.alpha=.72;
const underlayLeaf=engine.addPaperMesh(new PaperMesh({id:"underlay-leaf",x:72,y:-222,width:150,height:92,fill:0x526e59,material:"cardstock",columns:14,rows:10,wave:0,fold:0,frequency:1.35,phase:.6,shape:[[.02,.5],[.16,.24],[.42,.06],[.7,.04],[.94,.3],[.99,.5],[.78,.76],[.48,.94],[.2,.78]]}),tree.container);
underlayLeaf.container.alpha=.62;
const meshLeaf=engine.addPaperMesh(new PaperMesh({id:"mesh-leaf",x:75,y:-225,width:150,height:92,fill:0x7d9f70,material:"handmade",columns:14,rows:10,wave:5,fold:3,frequency:1.35,phase:.6,shape:[[.02,.5],[.16,.24],[.42,.06],[.7,.04],[.94,.3],[.99,.5],[.78,.76],[.48,.94],[.2,.78]]}),tree.container);
enableLocalizedDeformation(meshLeaf,[{u:.78,v:.28,radius:.34,strength:.9,bend:15,offsetX:3,offsetY:-2}]);
enablePaperRig(meshLeaf,{anchors:[{u:.18,v:.5,radius:25,strength:1}],folds:[{x1:.18,y1:.5,x2:.84,y2:.5,angle:24,strength:.9,side:"positive"},{x1:.42,y1:.12,x2:.72,y2:.9,angle:12,strength:.7,side:"negative"}]});
bindJointToFold(meshLeaf,leafJoint,{foldIndex:1,restAngle:0,multiplier:.85,minAngle:-65,maxAngle:65});
enableElasticCurvature(meshLeaf,{curvature:0,axis:90,stiffness:18,damping:7,bias:.18});
enableFoldVolume(meshLeaf,{intensity:.72,width:34});
enablePaperEdges(meshLeaf,{thickness:5,intensity:.72});
enableLayerGroups(engine,[{id:"leaf-stack",layers:[meshLeaf,backingLeaf,underlayLeaf],coupling:.24,clearance:5,contact:.42,maxDisplacement:16,edgeRadius:.18,links:[{clearance:5},{clearance:7,coupling:.18}]}]);
const bird=engine.addPiece(new PaperPiece({id:"bird",name:"Ave de prueba",depth:3,x:170,y:230,draw:(g,s,style)=>{
  const body=[[-30,0],[-10,-9],[10,-5],[30,5],[12,13],[-12,10]];
  cut(g,s,body,0x3c5960,style);
  cut(g,s,[[-5,0],[-30,-32],[-5,-18],[12,-2]],0x526f74,style);
  cut(g,s,[[20,3],[38,0],[22,9]],0xc18d57,style);
}}));
bird.motion=new MotionPath({points:[{x:150,y:235},{x:360,y:190},{x:610,y:245},{x:880,y:165},{x:1120,y:220},{x:150,y:235}],duration:24,loop:true,phase:.08,easing:smoothStep});

const select=document.querySelector("#pieceSelect");
const material=document.querySelector("#materialControl"),thickness=document.querySelector("#thicknessControl"),shadow=document.querySelector("#shadowControl");
const scale=document.querySelector("#scaleControl"),rotation=document.querySelector("#rotationControl"),depth=document.querySelector("#depthControl"),speed=document.querySelector("#speedControl");
const selectedName=document.querySelector("#selectedName");
const jointSelect=document.querySelector("#jointSelect"),jointAngle=document.querySelector("#jointAngleControl");
const flexBend=document.querySelector("#flexBendControl");
const meshWaveControl=document.querySelector("#meshWaveControl"),meshFoldControl=document.querySelector("#meshFoldControl");
const influenceX=document.querySelector("#influenceXControl"),influenceY=document.querySelector("#influenceYControl");
const influenceStrength=document.querySelector("#influenceStrengthControl"),influenceBend=document.querySelector("#influenceBendControl");
const anchorX=document.querySelector("#anchorXControl"),anchorY=document.querySelector("#anchorYControl"),anchorStrength=document.querySelector("#anchorStrengthControl"),foldAngle=document.querySelector("#controlledFoldAngleControl");
const volumeIntensity=document.querySelector("#foldVolumeIntensityControl"),volumeWidth=document.querySelector("#foldVolumeWidthControl");
const edgeThickness=document.querySelector("#paperEdgeThicknessControl"),edgeIntensity=document.querySelector("#paperEdgeIntensityControl");
const layerCoupling=document.querySelector("#layerCouplingControl");
const layerClearance=document.querySelector("#layerClearanceControl");
const layerContact=document.querySelector("#layerContactControl");
const layerPropagation=document.querySelector("#layerPropagationControl");
const contactGap=document.querySelector("#contactGapControl");
const contactStiffness=document.querySelector("#contactStiffnessControl");
const elasticCurvature=document.querySelector("#elasticCurvatureControl"),elasticAxis=document.querySelector("#elasticAxisControl"),elasticStiffness=document.querySelector("#elasticStiffnessControl"),elasticDamping=document.querySelector("#elasticDampingControl");
const joints={branch:branchJoint,leaf:leafJoint};
let selectedJoint=branchJoint;
let selected=mountain;
function choose(id){selected=engine.getPiece(id);select.value=id;selectedName.textContent=selected.name;scale.value=Math.round(selected.baseScale*100);rotation.value=Math.round(selected.container.rotation*180/Math.PI);depth.value=selected.depth;material.value=selected.material;thickness.value=selected.thickness;shadow.value=Math.round(selected.shadowStrength*100);syncLabels();}
function syncLabels(){document.querySelector("#meshWaveValue").textContent=meshWaveControl.value+" px";document.querySelector("#meshFoldValue").textContent=meshFoldControl.value+"°";document.querySelector("#influenceXValue").textContent=influenceX.value+"%";document.querySelector("#influenceYValue").textContent=influenceY.value+"%";document.querySelector("#influenceStrengthValue").textContent=influenceStrength.value+"%";document.querySelector("#influenceBendValue").textContent=influenceBend.value+"°";document.querySelector("#anchorXValue").textContent=anchorX.value+"%";document.querySelector("#anchorYValue").textContent=anchorY.value+"%";document.querySelector("#anchorStrengthValue").textContent=anchorStrength.value+"%";document.querySelector("#controlledFoldAngleValue").textContent=foldAngle.value+"°";document.querySelector("#foldVolumeIntensityValue").textContent=volumeIntensity.value+"%";document.querySelector("#foldVolumeWidthValue").textContent=volumeWidth.value+" px";document.querySelector("#paperEdgeThicknessValue").textContent=edgeThickness.value+" px";document.querySelector("#paperEdgeIntensityValue").textContent=edgeIntensity.value+"%";document.querySelector("#elasticCurvatureValue").textContent=elasticCurvature.value+" px";document.querySelector("#elasticAxisValue").textContent=elasticAxis.value+"°";document.querySelector("#elasticStiffnessValue").textContent=elasticStiffness.value;document.querySelector("#elasticDampingValue").textContent=elasticDamping.value;document.querySelector("#flexBendValue").textContent=Math.round(flexibleStem.bend)+"°";document.querySelector("#jointAngleValue").textContent=Math.round(selectedJoint.angle)+"°";document.querySelector("#scaleValue").textContent=scale.value+"%";document.querySelector("#rotationValue").textContent=rotation.value+"°";document.querySelector("#depthValue").textContent=depth.value;document.querySelector("#thicknessValue").textContent=thickness.value;document.querySelector("#shadowValue").textContent=shadow.value+"%";document.querySelector("#speedValue").textContent=(speed.value/100).toFixed(1)+"×";}
select.addEventListener("change",()=>choose(select.value));
jointSelect.addEventListener("change",()=>{selectedJoint=joints[jointSelect.value];jointAngle.value=Math.round(selectedJoint.angle);syncLabels();});
jointAngle.addEventListener("input",()=>{selectedJoint.setAngle(Number(jointAngle.value));syncLabels();});
flexBend.addEventListener("input",()=>{flexibleStem.setBend(Number(flexBend.value));syncLabels();});
const updateMesh=()=>{meshLeaf.setDeformation({wave:Number(meshWaveControl.value),fold:Number(meshFoldControl.value)});syncLabels();};
meshWaveControl.addEventListener("input",updateMesh);meshFoldControl.addEventListener("input",updateMesh);
const updateInfluence=()=>{meshLeaf.setInfluenceZones([{u:Number(influenceX.value)/100,v:Number(influenceY.value)/100,radius:.36,strength:Number(influenceStrength.value)/100,bend:Number(influenceBend.value),offsetX:0,offsetY:0}]);syncLabels();};
for(const control of [influenceX,influenceY,influenceStrength,influenceBend])control.addEventListener("input",updateInfluence);
const updateRig=()=>{meshLeaf.setAnchors([{u:Number(anchorX.value)/100,v:Number(anchorY.value)/100,radius:25,strength:Number(anchorStrength.value)/100}]);meshLeaf.setFolds([{x1:.18,y1:.5,x2:.84,y2:.5,angle:Number(foldAngle.value),strength:.9,side:"positive"},{x1:.42,y1:.12,x2:.72,y2:.9,angle:leafJoint.angle*.85,strength:.7,side:"negative"}]);syncLabels();};
for(const control of [anchorX,anchorY,anchorStrength,foldAngle])control.addEventListener("input",updateRig);
const updateVolume=()=>{meshLeaf.setFoldVolume({intensity:Number(volumeIntensity.value)/100,width:Number(volumeWidth.value)});syncLabels();};
for(const control of [volumeIntensity,volumeWidth])control.addEventListener("input",updateVolume);
const updateEdges=()=>{meshLeaf.setPaperEdge({thickness:Number(edgeThickness.value),intensity:Number(edgeIntensity.value)/100});syncLabels();};
for(const control of [edgeThickness,edgeIntensity])control.addEventListener("input",updateEdges);
const updateElastic=()=>{meshLeaf.setElasticCurvature({curvature:Number(elasticCurvature.value),axis:Number(elasticAxis.value),stiffness:Number(elasticStiffness.value),damping:Number(elasticDamping.value)});syncLabels();};
for(const control of [elasticCurvature,elasticAxis,elasticStiffness,elasticDamping])control.addEventListener("input",updateElastic);
const updateLayers=()=>{engine.setLayerInteraction(0,{coupling:Number(layerCoupling.value)/100,clearance:Number(layerClearance.value),contact:Number(layerContact.value)/100,contactGap:Number(contactGap.value),contactStiffness:Number(contactStiffness.value)/100});engine.setLayerInteraction(1,{coupling:Number(layerPropagation.value)/100,clearance:Number(layerClearance.value)+2,contact:Number(layerContact.value)/100,contactGap:Number(contactGap.value),contactStiffness:Number(contactStiffness.value)/100});document.querySelector("#layerCouplingValue").textContent=layerCoupling.value+"%";document.querySelector("#layerClearanceValue").textContent=layerClearance.value+" px";document.querySelector("#layerContactValue").textContent=layerContact.value+"%";document.querySelector("#layerPropagationValue").textContent=layerPropagation.value+"%";};
for(const control of [layerCoupling,layerClearance,layerContact,layerPropagation])control.addEventListener("input",updateLayers);
scale.addEventListener("input",()=>{selected.setScale(Number(scale.value)/100);syncLabels();});
rotation.addEventListener("input",()=>{selected.setRotation(Number(rotation.value));syncLabels();});
depth.addEventListener("input",()=>{selected.setDepth(Number(depth.value));engine.sortDepth();syncLabels();});
material.addEventListener("change",()=>selected.setMaterial(material.value));
thickness.addEventListener("input",()=>{selected.setThickness(Number(thickness.value));syncLabels();});
shadow.addEventListener("input",()=>{selected.setShadowStrength(Number(shadow.value)/100);syncLabels();});
speed.addEventListener("input",()=>{engine.setSpeed(Number(speed.value)/100);syncLabels();});
document.querySelector("#pauseButton").addEventListener("click",event=>{engine.setPaused(!engine.paused);event.currentTarget.textContent=engine.paused?"Reanudar":"Pausar";});
document.querySelector("#resetButton").addEventListener("click",()=>{mountain.setScale(1);mountain.setRotation(0);mountain.setDepth(5);mountain.setPosition(640,360);hill.setScale(1);hill.setRotation(0);hill.setDepth(4);hill.setPosition(640,470);tree.setScale(1);tree.setRotation(0);tree.setDepth(2);tree.setPosition(330,450);bird.setScale(1);bird.setRotation(0);bird.setDepth(3);bird.motion.time=0;flexibleStem.setSway({amplitude:13,period:4.4,phase:.8});flexBend.value=0;meshWaveControl.value=5;meshFoldControl.value=3;meshLeaf.setDeformation({wave:5,fold:3,frequency:1.35});influenceX.value=78;influenceY.value=28;influenceStrength.value=90;influenceBend.value=15;updateInfluence();anchorX.value=18;anchorY.value=50;anchorStrength.value=100;foldAngle.value=24;updateRig();volumeIntensity.value=72;volumeWidth.value=34;updateVolume();edgeThickness.value=5;edgeIntensity.value=72;updateEdges();elasticCurvature.value=0;elasticAxis.value=90;elasticStiffness.value=18;elasticDamping.value=7;meshLeaf.resetElasticMemory();updateElastic();layerCoupling.value=24;layerClearance.value=5;layerContact.value=42;layerPropagation.value=18;contactGap.value=2;contactStiffness.value=65;updateLayers();branchJoint.setSway({amplitude:7,period:5,phase:.4});leafJoint.setSway({amplitude:17,period:2.8,phase:1.1});jointSelect.value="branch";selectedJoint=branchJoint;jointAngle.value=-7;for(const p of [mountain,hill,tree,bird]){p.setMaterial("matte");p.setThickness(4);p.setShadowStrength(.22);}speed.value=100;engine.setSpeed(1);choose("mountain");});
choose("mountain");
status.textContent="PixiJS 8 · curvatura elástica · memoria del papel · volumen y articulación";
window.addEventListener("beforeunload",()=>engine.destroy());
