import test from "node:test";
import assert from "node:assert/strict";
import { createPhysicsMeshProxy, sampleGrid } from "./physics-mesh.js";

function visual(columns = 64, rows = 48) {
  const vertices = new Float32Array((columns + 1) * (rows + 1) * 2);
  for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
    const i = (y * (columns + 1) + x) * 2;
    vertices[i] = x / columns * 640;
    vertices[i + 1] = y / rows * 480;
  }
  return {
    id: "visual", width: 640, height: 480, columns, rows,
    shape: [[0,0],[1,0],[1,1],[0,1]],
    vertices, baseVertices: new Float32Array(vertices),
    shadowVertices: new Float32Array(vertices.length),
    mesh: { vertices }, shadowMesh: { vertices: new Float32Array(vertices.length), alpha: 0.2 },
    container: {}
  };
}

test("reduce la resolución física sin reducir la visual", () => {
  const m = visual(128, 96), p = createPhysicsMeshProxy(m, { columns: 24, rows: 18 });
  assert.equal(p.vertices.length / 2, 25 * 19);
  assert.equal(m.vertices.length / 2, 129 * 97);
  assert.equal(p.shape, m.shape);
});

test("interpola la corrección física sobre todos los vértices visuales", () => {
  const m = visual(), p = createPhysicsMeshProxy(m, { columns: 16, rows: 12 });
  for (let y = 0; y <= p.rows; y++) for (let x = 0; x <= p.columns; x++) {
    const i = (y * (p.columns + 1) + x) * 2;
    p.vertices[i] += x / p.columns * 8;
    p.vertices[i + 1] += y / p.rows * 4;
  }
  p.applyToVisual();
  const i = (24 * (m.columns + 1) + 32) * 2;
  assert.ok(Math.abs(m.vertices[i] - 324) < 1e-4);
  assert.ok(Math.abs(m.vertices[i + 1] - 242) < 1e-4);
  assert.equal(m.mesh.vertices, m.vertices);
  assert.equal(m.shadowMesh.vertices, m.shadowVertices);
});

test("refrescar toma la nueva base visual y evita acumular correcciones", () => {
  const m = visual(32, 24), p = createPhysicsMeshProxy(m, { columns: 8, rows: 6 });
  const i = (3 * (p.columns + 1) + 4) * 2;
  p.vertices[i + 1] += 12;
  p.applyToVisual();
  const moved = m.vertices[(12 * (m.columns + 1) + 16) * 2 + 1];
  p.refreshFromVisual();
  p.applyToVisual();
  const refreshed = m.vertices[(12 * (m.columns + 1) + 16) * 2 + 1];
  assert.ok(moved > 242);
  assert.ok(Math.abs(refreshed - moved) < 1e-4);
});

test("sampleGrid realiza interpolación bilineal", () => {
  assert.deepEqual(sampleGrid(new Float32Array([0,0,10,0,0,10,10,10]), 1, 1, 0.5, 0.5), {x:5,y:5});
});

test("rechaza resoluciones inválidas", () => {
  assert.throws(() => createPhysicsMeshProxy(visual(), { columns: 1, rows: 8 }), RangeError);
});