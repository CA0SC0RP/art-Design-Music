export class MotionPath {
  constructor({points,duration=10,loop=true,reverse=false,phase=0,easing=t=>t}){
    if(!Array.isArray(points)||points.length<2)throw new Error("MotionPath requiere al menos dos puntos");
    this.points=points;this.duration=Math.max(.01,duration);this.loop=loop;this.reverse=reverse;this.phase=phase;this.easing=easing;this.time=0;
  }
  update(dt,_elapsed,piece){
    this.time+=dt;
    let t=(this.time/this.duration)+this.phase;
    if(this.loop)t=((t%1)+1)%1;else t=Math.min(1,t);
    if(this.reverse)t=1-t;
    t=this.easing(t);
    const scaled=t*(this.points.length-1),index=Math.min(this.points.length-2,Math.floor(scaled)),local=scaled-index;
    const a=this.points[index],b=this.points[index+1];
    piece.setPosition(a.x+(b.x-a.x)*local,a.y+(b.y-a.y)*local);
  }
}
export const smoothStep=t=>t*t*(3-2*t);
export const linear=t=>t;
