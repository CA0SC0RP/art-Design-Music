import test from "node:test";
import assert from "node:assert/strict";
import { elasticTarget, springStep, anchorMobility } from "./elastic-math.js";

test("continuous curvature is zero at the supported surface boundary", () => {
  assert.equal(elasticTarget(0,0.5,{curvature:20}).profile,0);
  assert.ok(Math.abs(elasticTarget(1,0.5,{curvature:20}).profile) < 1e-12);
  assert.equal(elasticTarget(0.5,0,{curvature:20}).profile,0);
  assert.ok(elasticTarget(0.5,0.5,{curvature:20}).profile > 0.99);
});

test("curvature axis rotates the surface displacement", () => {
  const horizontal = elasticTarget(0.5,0.5,{curvature:10,axis:0});
  const vertical = elasticTarget(0.5,0.5,{curvature:10,axis:90});
  assert.ok(horizontal.x > 9.9);
  assert.ok(Math.abs(horizontal.y) < 0.001);
  assert.ok(vertical.y > 9.9);
  assert.ok(Math.abs(vertical.x) < 0.001);
});

test("spring memory approaches its target and recovers smoothly", () => {
  let position = 0, velocity = 0;
  for(let i=0;i<180;i++){
    const next = springStep(position,velocity,12,{stiffness:18,damping:8,dt:1/60});
    position=next.position;velocity=next.velocity;
  }
  assert.ok(position > 10.5 && position < 12.8);
  for(let i=0;i<240;i++){
    const next = springStep(position,velocity,0,{stiffness:18,damping:8,dt:1/60});
    position=next.position;velocity=next.velocity;
  }
  assert.ok(Math.abs(position) < 0.15);
});

test("anchor mobility protects pinned areas", () => {
  assert.equal(anchorMobility(0.5,0.5,[{u:0.5,v:0.5,radius:30,strength:1}]),0);
  assert.equal(anchorMobility(0,0,[]),1);
});
