import { Application, Container, Graphics, MeshSimple, Texture } from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.1/+esm";

const DEPTH_SCALE={1:1.12,2:1.06,3:1,4:.96,5:.92};
export const PAPER_MATERIALS={
  matte:{label:"Papel mate",edge:0x625f54,highlight:0xffffff,texture:0x6e695c,textureAlpha:.055},
  cardstock:{label:"Cartulina",edge:0x514d43,highlight:0xffffff,texture:0x766d5d,textureAlpha:.025},
  handmade:{label:"Papel artesanal",edge:0x6a6252,highlight:0xfff3d9,texture:0x82765f,textureAlpha:.09},
  translucent:{label:"Papel translúcido",edge:0x82928a,highlight:0xffffff,texture:0xffffff,textureAlpha:.018}
};

export class PaperPiece{
  constructor({id,name,depth=3,x=0,y=0,scale=1,rotation=0,material="matte",thickness=4,shadowStrength=0.22,draw}){
    this.id=id;this.name=name;this.depth=depth;this.baseScale=scale;this.material=material;this.thickness=thickness;this.shadowStrength=shadowStrength;this.drawCallback=draw;
    this.container=new Container();this.container.position.set(x,y);this.container.rotation=rotation;this.container.scale.set(scale*DEPTH_SCALE[depth]);
    this.shadow=new Graphics();this.art=new Graphics();this.container.addChild(this.shadow,this.art);this.motion=null;this.redraw();
  }
  redraw(){this.shadow.clear();this.art.clear();this.drawCallback(this.art,this.shadow,{material:this.material,thickness:this.thickness,shadowStrength:this.shadowStrength});}
  setScale(v){this.baseScale=v;this.container.scale.set(v*DEPTH_SCALE[this.depth]);}
  setRotation(degrees){this.container.rotation=degrees*Math.PI/180;}
  setDepth(depth){this.depth=Math.max(1,Math.min(5,Math.round(depth)));this.container.scale.set(this.baseScale*DEPTH_SCALE[this.depth]);}
  setPosition(x,y){this.container.position.set(x,y);}
  setAlpha(v){this.container.alpha=Math.max(0,Math.min(1,v));}
  setMaterial(v){if(PAPER_MATERIALS[v]){this.material=v;this.redraw();}}
  setThickness(v){this.thickness=Math.max(0,Math.min(12,v));this.redraw();}
  setShadowStrength(v){this.shadowStrength=Math.max(0,Math.min(.6,v));this.redraw();}
}

export class LivingPaperEngine{
  constructor(host){this.host=host;this.app=null;this.world=null;this.pieces=new Map();this.articulations=new Set();this.flexes=new Set();this.speed=1;this.paused=false;this.elapsed=0;}
  async init(){
    this.app=new Application();
    await this.app.init({background:0xdce5df,antialias:true,autoDensity:true,resolution:Math.min(window.devicePixelRatio||1,2),resizeTo:this.host});
    this.host.replaceChildren(this.app.canvas);this.world=new Container();this.app.stage.addChild(this.world);
    this.app.ticker.add(ticker=>this.update(ticker.deltaMS/1000));
    this.resizeObserver=new ResizeObserver(()=>this.layout());this.resizeObserver.observe(this.host);this.layout();return this;
  }
  addPiece(piece){this.pieces.set(piece.id,piece);this.world.addChild(piece.container);this.sortDepth();return piece;}
  getPiece(id){return this.pieces.get(id);}
  sortDepth(){const items=[...this.pieces.values()].sort((a,b)=>b.depth-a.depth);items.forEach((p,i)=>this.world.setChildIndex(p.container,i));}
  addArticulation(joint,parent){(parent||this.world).addChild(joint.container);this.articulations.add(joint);return joint;}
  addFlex(flex,parent){(parent||this.world).addChild(flex.container);this.flexes.add(flex);return flex;}
  setSpeed(v){this.speed=Math.max(.1,Math.min(3,v));}
  setPaused(v){this.paused=Boolean(v);}
  update(dt){if(this.paused)return;const step=dt*this.speed;this.elapsed+=step;for(const p of this.pieces.values())p.motion?.update(step,this.elapsed,p);for(const joint of this.articulations)joint.update(this.elapsed);for(const flex of this.flexes)flex.update(this.elapsed);}
  layout(){if(!this.app||!this.world)return;const w=this.host.clientWidth||960,h=this.host.clientHeight||540;this.app.renderer.resize(w,h);const s=Math.min(w/1280,h/720);this.world.scale.set(s);this.world.position.set((w-1280*s)/2,(h-720*s)/2);}
  destroy(){this.resizeObserver?.disconnect();this.app?.destroy(true,{children:true});this.pieces.clear();this.articulations.clear();this.flexes.clear();}
}



export class PaperFlex{
  constructor({id,x=0,y=0,length=90,width=8,bend=0,maxBend=24,fill=0x78966d,material="matte",thickness=2,sway=null}){
    this.id=id;this.length=length;this.width=width;this.bend=bend;this.restBend=bend;this.maxBend=maxBend;this.fill=fill;this.material=material;this.thickness=thickness;this.sway=sway;
    this.container=new Container();this.container.position.set(x,y);this.shadow=new Graphics();this.art=new Graphics();this.container.addChild(this.shadow,this.art);this.render();
  }
  setBend(degrees){this.sway=null;this.bend=Math.max(-this.maxBend,Math.min(this.maxBend,degrees));this.render();}
  setSway({amplitude=12,period=4,phase=0}={}){this.sway={amplitude,period:Math.max(.1,period),phase};}
  render(){
    const angle=this.bend*Math.PI/180,points=[];
    for(let i=0;i<=12;i++){
      const t=i/12,theta=angle*t;
      const cx=Math.abs(angle)<.0001?0:this.length*(1-Math.cos(theta))/angle;
      const cy=Math.abs(angle)<.0001?-this.length*t:-this.length*Math.sin(theta)/angle;
      const nx=Math.cos(theta),ny=Math.sin(theta);
      points.push([cx-nx*this.width/2,cy-ny*this.width/2]);
    }
    for(let i=12;i>=0;i--){
      const t=i/12,theta=angle*t;
      const cx=Math.abs(angle)<.0001?0:this.length*(1-Math.cos(theta))/angle;
      const cy=Math.abs(angle)<.0001?-this.length*t:-this.length*Math.sin(theta)/angle;
      const nx=Math.cos(theta),ny=Math.sin(theta);
      points.push([cx+nx*this.width/2,cy+ny*this.width/2]);
    }
    const m=PAPER_MATERIALS[this.material]||PAPER_MATERIALS.matte;
    const shadowPoints=points.map(([x,y])=>[x+2,y+3]);
    this.shadow.clear();this.art.clear();
    this.shadow.poly(flat(shadowPoints)).fill({color:0x27312d,alpha:.18});
    this.art.poly(flat(points)).fill({color:this.fill});
    this.art.poly(flat(points)).stroke({color:m.edge,width:Math.max(1,this.thickness*.35),alpha:.58});
  }
  update(elapsed){
    if(!this.sway)return;
    const {amplitude,period,phase}=this.sway;
    const next=this.restBend+Math.sin((elapsed/period)*Math.PI*2+phase)*amplitude;
    const bounded=Math.max(-this.maxBend,Math.min(this.maxBend,next));
    if(Math.abs(bounded-this.bend)>.12){this.bend=bounded;this.render();}
  }
}


export class PaperMesh{
  constructor({id,x=0,y=0,width=140,height=90,shape=[[.02,.5],[.2,.15],[.55,.02],[.9,.2],[.98,.5],[.8,.85],[.45,.98],[.12,.78]],fill=0x78a16f,material="handmade",columns=12,rows=8,wave=5,fold=2,frequency=1.4,phase=0}={}){
    this.id=id;this.width=width;this.height=height;this.columns=Math.max(2,columns);this.rows=Math.max(2,rows);this.wave=wave;this.fold=fold;this.frequency=frequency;this.phase=phase;this.elapsed=0;
    this.container=new Container();this.container.position.set(x,y);
    const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;
    const ctx=canvas.getContext("2d");ctx.clearRect(0,0,512,512);
    ctx.beginPath();shape.forEach(([u,v],i)=>i?ctx.lineTo(u*512,v*512):ctx.moveTo(u*512,v*512));ctx.closePath();
    ctx.fillStyle="#"+fill.toString(16).padStart(6,"0");ctx.fill();
    const m=PAPER_MATERIALS[material]||PAPER_MATERIALS.handmade;
    ctx.strokeStyle="#"+m.edge.toString(16).padStart(6,"0");ctx.lineWidth=5;ctx.stroke();
    for(let i=0;i<1100;i++){const px=Math.random()*512,py=Math.random()*512;if(ctx.isPointInPath(px,py)){ctx.fillStyle="rgba(255,255,255,.08)";ctx.fillRect(px,py,1.2,1.2);}}
    this.texture=Texture.from(canvas);
    const shadowCanvas=document.createElement("canvas");shadowCanvas.width=512;shadowCanvas.height=512;
    const sc=shadowCanvas.getContext("2d");sc.drawImage(canvas,0,0);sc.globalCompositeOperation="source-in";sc.fillStyle="#26332f";sc.fillRect(0,0,512,512);
    this.shadowTexture=Texture.from(shadowCanvas);
    const vertices=[],uvs=[],indices=[];
    for(let y=0;y<=this.rows;y++)for(let x=0;x<=this.columns;x++){
      const u=x/this.columns,v=y/this.rows;vertices.push(u*width,v*height);uvs.push(u,v);
    }
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.columns;x++){
      const a=y*(this.columns+1)+x,b=a+1,d=(y+1)*(this.columns+1)+x,e=d+1;
      indices.push(a,b,d,b,e,d);
    }
    this.baseVertices=new Float32Array(vertices);this.vertices=new Float32Array(vertices);
    this.shadowVertices=new Float32Array(vertices.map((v,i)=>v+(i%2?5:4)));
    const indexData=new Uint32Array(indices),uvData=new Float32Array(uvs);
    this.shadowMesh=new MeshSimple({texture:this.shadowTexture,vertices:this.shadowVertices,uvs:uvData,indices:indexData});
    this.shadowMesh.alpha=.2;
    this.mesh=new MeshSimple({texture:this.texture,vertices:this.vertices,uvs:uvData,indices:indexData});
    this.container.addChild(this.shadowMesh,this.mesh);
  }
  setDeformation({wave=this.wave,fold=this.fold,frequency=this.frequency}={}){
    this.wave=Math.max(0,Math.min(24,wave));this.fold=Math.max(-18,Math.min(18,fold));this.frequency=Math.max(.1,Math.min(5,frequency));this.update(this.elapsed,true);
  }
  update(elapsed,force=false){
    this.elapsed=elapsed;
    for(let y=0;y<=this.rows;y++)for(let x=0;x<=this.columns;x++){
      const i=(y*(this.columns+1)+x)*2,u=x/this.columns,v=y/this.rows;
      const envelope=Math.sin(Math.PI*v);
      const oscillation=Math.sin(u*Math.PI*2+elapsed*this.frequency+this.phase);
      this.vertices[i]=this.baseVertices[i]+this.fold*Math.sin(v*Math.PI)*u;
      this.vertices[i+1]=this.baseVertices[i+1]+this.wave*oscillation*envelope;
      this.shadowVertices[i]=this.vertices[i]+4;
      this.shadowVertices[i+1]=this.vertices[i+1]+5;
    }
    if(force){this.mesh.vertices=this.vertices;this.shadowMesh.vertices=this.shadowVertices;}
  }
  destroy(){this.texture.destroy(true);this.shadowTexture.destroy(true);this.container.destroy({children:true});}
}

export class PaperJoint{
  constructor({id,x=0,y=0,angle=0,minAngle=-45,maxAngle=45,material="matte",thickness=3,shadowStrength=.18,draw,sway=null}){
    this.id=id;this.children=[];this.minAngle=minAngle;this.maxAngle=maxAngle;this.restAngle=Math.max(minAngle,Math.min(maxAngle,angle));this.angle=this.restAngle;this.sway=sway;
    this.container=new Container();this.container.position.set(x,y);this.container.rotation=this.angle*Math.PI/180;
    this.shadow=new Graphics();this.art=new Graphics();this.container.addChild(this.shadow,this.art);
    this.drawCallback=draw;this.style={material,thickness,shadowStrength};this.drawCallback?.(this.art,this.shadow,this.style);
  }
  addChild(joint){this.container.addChild(joint.container);this.children.push(joint);return joint;}
  setAngle(degrees){this.sway=null;this.angle=Math.max(this.minAngle,Math.min(this.maxAngle,degrees));this.container.rotation=this.angle*Math.PI/180;}
  setSway({amplitude=8,period=4,phase=0}={}){this.sway={amplitude,period:Math.max(.1,period),phase};}
  update(elapsed){
    if(this.sway){
      const {amplitude,period,phase}=this.sway;
      const swing=Math.sin((elapsed/period)*Math.PI*2+phase)*amplitude;
      this.angle=Math.max(this.minAngle,Math.min(this.maxAngle,this.restAngle+swing));
      this.container.rotation=this.angle*Math.PI/180;
    }
    for(const child of this.children)child.update(elapsed);
  }
}
function flat(points){return points.flatMap(([x,y])=>[x,y]);}
export function polygon(graphics,points,color,alpha=1){graphics.poly(flat(points)).fill({color,alpha});}
function insidePolygon(x,y,points){
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const xi=points[i][0], yi=points[i][1], xj=points[j][0], yj=points[j][1];
    const crosses=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi+1e-9)+xi);
    if(crosses) inside=!inside;
  }
  return inside;
}
function addPaperGrain(graphics,points,material){
  const m=PAPER_MATERIALS[material]||PAPER_MATERIALS.matte;
  if(m.textureAlpha<=0)return;
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  for(let y=minY+5;y<maxY;y+=17)for(let x=minX+5;x<maxX;x+=17){
    const px=x+Math.sin(x*12.9898+y*78.233)*2.1;
    const py=y+Math.cos(x*4.1414+y*31.719)*2.1;
    if(insidePolygon(px,py,points))graphics.circle(px,py,.75).fill({color:m.texture,alpha:m.textureAlpha});
  }
}
export function paperCut(art,shadow,points,{fill=0xffffff,alpha=1,material="matte",thickness=4,shadowStrength=.22}={}){
  const m=PAPER_MATERIALS[material]||PAPER_MATERIALS.matte;
  const layers=Math.max(0,Math.min(12,Math.round(thickness)));
  for(let i=layers;i>=1;i--){
    const offset=i*.72;
    shadow.poly(flat(points.map(([x,y])=>[x+offset,y+offset*1.35]))).fill({color:0x27312d,alpha:shadowStrength/(1+i*.13)});
  }
  art.poly(flat(points)).fill({color:fill,alpha});
  addPaperGrain(art,points,material);
  art.poly(flat(points)).stroke({color:m.edge,width:Math.max(1,thickness*.24),alpha:.58});
  const top=points.slice(0,Math.max(2,Math.ceil(points.length/2)));
  if(top.length>1){
    const line=new Graphics();
    line.moveTo(top[0][0],top[0][1]);
    for(const p of top.slice(1))line.lineTo(p[0],p[1]);
    line.stroke({color:m.highlight,width:1.5,alpha:.16});
    art.addChild(line);
  }
}
export function paperShadow(graphics,points,strength=.18){for(let i=3;i>=1;i--)graphics.poly(flat(points.map(([x,y])=>[x+i*1.2,y+i*1.8]))).fill({color:0x26332f,alpha:strength*.22*i});}
