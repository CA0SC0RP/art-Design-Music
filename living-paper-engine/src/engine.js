import { Application, Container, Graphics } from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.1/+esm";

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
  constructor(host){this.host=host;this.app=null;this.world=null;this.pieces=new Map();this.speed=1;this.paused=false;this.elapsed=0;}
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
  setSpeed(v){this.speed=Math.max(.1,Math.min(3,v));}
  setPaused(v){this.paused=Boolean(v);}
  update(dt){if(this.paused)return;const step=dt*this.speed;this.elapsed+=step;for(const p of this.pieces.values())p.motion?.update(step,this.elapsed,p);}
  layout(){if(!this.app||!this.world)return;const w=this.host.clientWidth||960,h=this.host.clientHeight||540;this.app.renderer.resize(w,h);const s=Math.min(w/1280,h/720);this.world.scale.set(s);this.world.position.set((w-1280*s)/2,(h-720*s)/2);}
  destroy(){this.resizeObserver?.disconnect();this.app?.destroy(true,{children:true});this.pieces.clear();}
}

function flat(points){return points.flatMap(([x,y])=>[x,y]);}
export function polygon(graphics,points,color,alpha=1){graphics.poly(flat(points)).fill({color,alpha});}
export function paperCut(art,shadow,points,{fill=0xffffff,alpha=1,material="matte",thickness=4,shadowStrength=.22}={}){
  const m=PAPER_MATERIALS[material]||PAPER_MATERIALS.matte;
  const layers=Math.max(0,Math.min(12,Math.round(thickness)));
  for(let i=layers;i>=1;i--){
    const offset=i*.72;
    shadow.poly(flat(points.map(([x,y])=>[x+offset,y+offset*1.35]))).fill({color:0x27312d,alpha:shadowStrength/(1+i*.13)});
  }
  art.poly(flat(points)).fill({color:fill,alpha});
  art.poly(flat(points)).stroke({color:m.edge,width:Math.max(1,thickness*.24),alpha:.58});
  const top=points.slice(0,Math.max(2,Math.ceil(points.length/2)));
  if(top.length>1){const line=new Graphics();line.moveTo(top[0][0],top[0][1]);for(const p of top.slice(1))line.lineTo(p[0],p[1]);line.stroke({color:m.highlight,width:1.5,alpha:.16});art.addChild(line);}
}
export function paperShadow(graphics,points,strength=.18){for(let i=3;i>=1;i--)graphics.poly(flat(points.map(([x,y])=>[x+i*1.2,y+i*1.8]))).fill({color:0x26332f,alpha:strength*.22*i});}
