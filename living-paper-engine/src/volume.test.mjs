import test from "node:test";
import assert from "node:assert/strict";
import { foldVolumeProfile } from "./volume-math.js";

test("fold volume is neutral when the crease angle is zero", () => {
  const profile = foldVolumeProfile({angle:0,strength:1},0.8,30);
  assert.equal(profile.strength,0);
  assert.equal(profile.shadowAlpha,0);
  assert.equal(profile.highlightAlpha,0);
});

test("stronger fold angles increase the apparent light and shadow", () => {
  const soft = foldVolumeProfile({angle:10,strength:1,side:"positive"},0.8,30);
  const strong = foldVolumeProfile({angle:60,strength:1,side:"positive"},0.8,30);
  assert.ok(strong.shadowAlpha > soft.shadowAlpha);
  assert.ok(strong.highlightAlpha > soft.highlightAlpha);
  assert.equal(strong.direction,1);
});

test("fold side reverses the lighting direction and width stays bounded", () => {
  const profile = foldVolumeProfile({angle:45,strength:2,side:"negative"},1,200);
  assert.equal(profile.direction,-1);
  assert.ok(profile.halfWidth <= 90 * 1.45);
  assert.ok(profile.shadowAlpha <= 0.48);
  assert.ok(profile.highlightAlpha <= 0.52);
});
