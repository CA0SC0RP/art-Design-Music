import test from "node:test";
import assert from "node:assert/strict";
import { layerFalloff, resolveLayerResponse, sampleDisplacement } from "./layer-math.js";

test("la influencia cae suavemente hacia el borde", () => {
  assert.equal(layerFalloff(0.5, 0.5, 0.2), 1);
  assert.equal(layerFalloff(0, 0.5, 0.2), 0);
  assert.ok(layerFalloff(0.1, 0.5, 0.2) > 0);
});

test("la respuesta entre capas es proporcional y acotada", () => {
  const result = resolveLayerResponse(100, -50, { coupling: 0.5, maxDisplacement: 10, weight: 1 });
  assert.deepEqual({ x: result.x, y: result.y }, { x: 10, y: -10 });
  assert.ok(result.pressure > 0);
});

test("la respuesta es nula cuando el acoplamiento está desactivado", () => {
  assert.deepEqual(resolveLayerResponse(8, 4, { coupling: 0 }), { x: 0, y: 0, pressure: 0 });
});

test("el muestreo bilineal conserva el desplazamiento de una malla coincidente", () => {
  const base = new Float32Array([0,0, 10,0, 0,10, 10,10]);
  const moved = new Float32Array([0,0, 14,0, 0,6, 14,6]);
  const sample = sampleDisplacement(moved, base, 1, 1, 0.5, 0.5);
  assert.deepEqual(sample, { x: 2, y: -2 });
});
