import test from "node:test";
import assert from "node:assert/strict";
import { foldEdgeProfile } from "./edge-math.js";

test("a flat sheet has no exposed fold edge", () => {
  const profile = foldEdgeProfile({angle:0,strength:1,side:"positive"},{thickness:8,intensity:1});
  assert.equal(profile.active,0);
  assert.equal(profile.depth,2);
  assert.equal(profile.edgeAlpha,0);
});

test("edge thickness and lighting increase with fold angle", () => {
  const slight = foldEdgeProfile({angle:12,strength:1},{thickness:8,intensity:1});
  const deep = foldEdgeProfile({angle:70,strength:1},{thickness:8,intensity:1});
  assert.ok(deep.depth > slight.depth);
  assert.ok(deep.edgeAlpha > slight.edgeAlpha);
});

test("negative folds expose the opposite edge and respect material limits", () => {
  const profile = foldEdgeProfile({angle:90,strength:2,side:"negative"},{thickness:40,intensity:2});
  assert.equal(profile.side,-1);
  assert.ok(profile.depth <= 14);
  assert.ok(profile.edgeAlpha <= 0.9);
  assert.ok(profile.shadowAlpha <= 0.42);
});
