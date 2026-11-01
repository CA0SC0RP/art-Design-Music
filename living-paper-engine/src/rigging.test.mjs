import test from "node:test";
import assert from "node:assert/strict";
import { applyPaperRig } from "./rigging.js";

function mockMesh() {
  const base = new Float32Array([
    0,0, 1,0, 2,0,
    0,1, 1,1, 2,1,
    0,2, 1,2, 2,2
  ]);
  return {
    width:2,height:2,columns:2,rows:2,
    baseVertices:base,
    vertices:new Float32Array(base),
    shadowVertices:new Float32Array(base.length),mesh:{},shadowMesh:{}
  };
}

test("crease fold deforms only the selected side of its crease", () => {
  const mesh=mockMesh();
  applyPaperRig(mesh,[],[{x1:0,y1:.5,x2:1,y2:.5,angle:60,strength:1,side:"positive",endSoftness:10}]);
  const negativeSide=(1*3+1)*2;
  const positiveSide=(2*3+1)*2;
  assert.equal(mesh.vertices[negativeSide+1],1);
  assert.ok(mesh.vertices[positiveSide+1] < 2);
});

test("a full-strength anchor restores its local vertex to its rest position", () => {
  const mesh=mockMesh();
  const target=(2*3+1)*2;
  const originalY=mesh.baseVertices[target+1];
  applyPaperRig(mesh,[],[{x1:0,y1:.5,x2:1,y2:.5,angle:60,strength:1,side:"positive",endSoftness:10}]);
  assert.notEqual(mesh.vertices[target+1],originalY);
  applyPaperRig(mesh,[{u:.5,v:1,radius:1,strength:1}],[]);
  assert.equal(mesh.vertices[target+1],originalY);
});

test("shadow vertices track the final folded surface", () => {
  const mesh=mockMesh();
  applyPaperRig(mesh,[],[{x1:0,y1:.5,x2:1,y2:.5,angle:45,strength:1,side:"positive",endSoftness:10}]);
  for(let i=0;i<mesh.vertices.length;i+=2) {
    assert.equal(mesh.shadowVertices[i],mesh.vertices[i]+4);
    assert.equal(mesh.shadowVertices[i+1],mesh.vertices[i+1]+5);
  }
});
