import { LivingPaperEngine, PaperPiece, paperCut } from "./engine.js";
import { MotionPath, smoothStep } from "./motion.js";

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
const hill=engine.addPiece(new PaperPiece({id:"hill",name:"Colina intermedia",depth:4,x:640,y:470,draw:(g,s)=>{
  const p=[[-700,120],[-520,15],[-260,-5],[-100,55],[120,-15],[360,45],[700,120]];
  cut(g,s,p,0x6f967b,style);
}}));
const tree=engine.addPiece(new PaperPiece({id:"tree",name:"Árbol de papel",depth:2,x:330,y:450,draw:(g,s)=>{
  cut(g,s,[[-18,70],[-12,-120],[12,-120],[20,70]],0x8d674b,style);
  for(const [x,y,r,c] of [[-35,-125,65,0x47745e],[30,-170,72,0x56866a],[5,-85,62,0x628e6c],[-65,-65,43,0x739d78]]){
    const pts=Array.from({length:12},(_,i)=>[x+Math.cos(i*Math.PI/6)*r,y+Math.sin(i*Math.PI/6)*r*.82]);
    cut(g,s,pts,c,style);
  }
}}));
const bird=engine.addPiece(new PaperPiece({id:"bird",name:"Ave de prueba",depth:3,x:170,y:230,draw:(g,s)=>{
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
let selected=mountain;
function choose(id){selected=engine.getPiece(id);select.value=id;selectedName.textContent=selected.name;scale.value=Math.round(selected.baseScale*100);rotation.value=Math.round(selected.container.rotation*180/Math.PI);depth.value=selected.depth;material.value=selected.material;thickness.value=selected.thickness;shadow.value=Math.round(selected.shadowStrength*100);syncLabels();}
function syncLabels(){document.querySelector("#scaleValue").textContent=scale.value+"%";document.querySelector("#rotationValue").textContent=rotation.value+"°";document.querySelector("#depthValue").textContent=depth.value;document.querySelector("#thicknessValue").textContent=thickness.value;document.querySelector("#shadowValue").textContent=shadow.value+"%";document.querySelector("#speedValue").textContent=(speed.value/100).toFixed(1)+"×";}
select.addEventListener("change",()=>choose(select.value));
scale.addEventListener("input",()=>{selected.setScale(Number(scale.value)/100);syncLabels();});
rotation.addEventListener("input",()=>{selected.setRotation(Number(rotation.value));syncLabels();});
depth.addEventListener("input",()=>{selected.setDepth(Number(depth.value));engine.sortDepth();syncLabels();});
material.addEventListener("change",()=>selected.setMaterial(material.value));
thickness.addEventListener("input",()=>{selected.setThickness(Number(thickness.value));syncLabels();});
shadow.addEventListener("input",()=>{selected.setShadowStrength(Number(shadow.value)/100);syncLabels();});
speed.addEventListener("input",()=>{engine.setSpeed(Number(speed.value)/100);syncLabels();});
document.querySelector("#pauseButton").addEventListener("click",event=>{engine.setPaused(!engine.paused);event.currentTarget.textContent=engine.paused?"Reanudar":"Pausar";});
document.querySelector("#resetButton").addEventListener("click",()=>{mountain.setScale(1);mountain.setRotation(0);mountain.setDepth(5);mountain.setPosition(640,360);hill.setScale(1);hill.setRotation(0);hill.setDepth(4);hill.setPosition(640,470);tree.setScale(1);tree.setRotation(0);tree.setDepth(2);tree.setPosition(330,450);bird.setScale(1);bird.setRotation(0);bird.setDepth(3);bird.motion.time=0;for(const p of [mountain,hill,tree,bird]){p.setMaterial("matte");p.setThickness(4);p.setShadowStrength(.22);}speed.value=100;engine.setSpeed(1);choose("mountain");});
choose("mountain");
status.textContent="PixiJS 8 · renderer activo · 4 piezas independientes";
window.addEventListener("beforeunload",()=>engine.destroy());
