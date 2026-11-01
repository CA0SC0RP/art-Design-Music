import { Application, Container, Graphics } from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.1/+esm";

const DEPTH_SCALE = {1:1.12,2:1.06,3:1,4:.96,5:.92};

export class PaperPiece {
  constructor({id,name,depth=3,x=0,y=0,scale=1,rotation=0,color=0xffffff,draw}) {
    this.id=id; this.name=name; this.depth=depth; this.baseScale=scale;
    this.container=new Container();
    this.container.position.set(x,y);
    this.container.rotation=rotation;
    this.container.scale.set(scale*DEPTH_SCALE[depth]);
    this.shadow=new Graphics();
    this.art=new Graphics();
    this.container.addChild(this.shadow,this.art);
    draw(this.art,this.shadow);
    this.motion=null;
  }
  setScale(value){this.baseScale=value;this.container.scale.set(value*DEPTH_SCALE[this.depth]);}
  setRotation(degrees){this.container.rotation=degrees*Math.PI/180;}
  setDepth(depth){this.depth=Math.max(1,Math.min(5,Math.round(depth)));this.container.scale.set(this.baseScale*DEPTH_SCALE[this.depth]);}
  setPosition(x,y){this.container.position.set(x,y);}
  setAlpha(value){this.container.alpha=value;}
}

export class LivingPaperEngine {
  constructor(host){this.host=host;this.app=null;this.world=null;this.pieces=new Map();this.speed=1;this.paused=false;this.elapsed=0;}
  async init(){
    this.app=new Application();
    await this.app.init({background:0xdce5df,antialias:true,autoDensity:true,resolution:Math.min(window.devicePixelRatio||1,2),resizeTo:this.host});
    this.host.replaceChildren(this.app.canvas);
    this.world=new Container();
    this.app.stage.addChild(this.world);
    this.app.ticker.add(ticker=>this.update(ticker.deltaMS/1000));
    this.resizeObserver=new ResizeObserver(()=>this.layout());
    this.resizeObserver.observe(this.host);
    this.layout();
    return this;
  }
  addPiece(piece){this.pieces.set(piece.id,piece);this.world.addChild(piece.container);this.sortDepth();return piece;}
  getPiece(id){return this.pieces.get(id);}
  sortDepth(){const items=[...this.pieces.values()].sort((a,b)=>b.depth-a.depth);items.forEach((piece,index)=>this.world.setChildIndex(piece.container,index));}
  setSpeed(value){this.speed=Math.max(.1,Math.min(3,value));}
  setPaused(value){this.paused=Boolean(value);}
  update(dt){if(this.paused)return;const step=dt*this.speed;this.elapsed+=step;for(const piece of this.pieces.values())piece.motion?.update(step,this.elapsed,piece);}
  layout(){if(!this.app||!this.world)return;const w=this.host.clientWidth||960,h=this.host.clientHeight||540;this.app.renderer.resize(w,h);this.world.position.set(w/2-640*(w/Math.max(w,h*16/9)),h/2-360*(h/Math.max(h,w*9/16)));const s=Math.min(w/1280,h/720);this.world.scale.set(s);this.world.position.set((w-1280*s)/2,(h-720*s)/2);}
  destroy(){this.resizeObserver?.disconnect();this.app?.destroy(true,{children:true});this.pieces.clear();}
}

function flattenPoints(points){return points.flatMap(([x,y])=>[x,y]);}
export function polygon(graphics,points,color,alpha=1){graphics.poly(flattenPoints(points)).fill({color,alpha});}
export function paperShadow(graphics,points){for(let i=3;i>=1;i--)graphics.poly(flattenPoints(points.map(([x,y])=>[x+i*1.2,y+i*1.8]))).fill({color:0x26332f,alpha:.035*i});}
