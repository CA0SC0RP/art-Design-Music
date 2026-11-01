import test from "node:test";
import assert from "node:assert/strict";
import { resolveContactConstraint } from "./collision-math.js";

test("la fricción tangencial se opone al deslizamiento relativo", () => {
  const result = resolveContactConstraint(
    { x: 0, y: 0 }, { x: 8, y: 0 },
    { normalX: 0, normalY: 1, minGap: 0, friction: 0.5, maxTangentialCorrection: 6 }
  );
  assert.ok(result.frictionCorrection > 0);
  assert.ok(result.x < 0);
  assert.ok(Math.abs(result.x) <= 6);
});

test("la corrección tangencial respeta su límite máximo", () => {
  const result = resolveContactConstraint(
    { x: 0, y: 0 }, { x: 100, y: 0 },
    { normalX: 0, normalY: 1, minGap: 0, friction: 1, maxTangentialCorrection: 2 }
  );
  assert.equal(result.frictionCorrection, 2);
  assert.equal(result.x, -2);
});

test("con fricción desactivada no se altera el desplazamiento tangencial", () => {
  const result = resolveContactConstraint(
    { x: 0, y: 0 }, { x: 8, y: 0 },
    { normalX: 0, normalY: 1, minGap: 0, friction: 0 }
  );
  assert.equal(result.frictionCorrection, 0);
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
});

import {
  composeWorldTransform, transformPoint, buildMeshTriangles, closestPointOnMesh,
  pointInPolygon, inverseTransformVector, segmentTriangleContacts
} from "./collision-math.js";

function quadMesh({ columns = 1, rows = 1, x = 0, y = 0, shape } = {}) {
  const vertices = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) vertices.push(col * 10, row * 10);
  }
  const container = { position: { x, y }, scale: { x: 1, y: 1 }, rotation: 0, pivot: { x: 0, y: 0 }, parent: null };
  return { vertices: new Float32Array(vertices), columns, rows, width: columns * 10, height: rows * 10, shape, container };
}

test("la búsqueda encuentra el punto más cercano en una malla de resolución distinta", () => {
  const source = quadMesh({ columns: 1, rows: 1 });
  const target = quadMesh({ columns: 3, rows: 2 });
  const triangles = buildMeshTriangles(source);
  const closest = closestPointOnMesh({ x: 4, y: 6 }, triangles);
  assert.ok(closest);
  assert.ok(Math.abs(closest.x - 4) < 1e-6);
  assert.ok(Math.abs(closest.y - 6) < 1e-6);
  assert.equal(buildMeshTriangles(target).length, 12);
});

test("la transformación mundial compone rotación y posición de capas anidadas", () => {
  const parent = { position: { x: 100, y: 50 }, scale: { x: 1, y: 1 }, rotation: Math.PI / 2, pivot: { x: 0, y: 0 }, parent: null };
  const child = { position: { x: 10, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0, pivot: { x: 0, y: 0 }, parent };
  const world = composeWorldTransform(child);
  const point = transformPoint(world, { x: 2, y: 0 });
  assert.ok(Math.abs(point.x - 100) < 1e-6);
  assert.ok(Math.abs(point.y - 62) < 1e-6);
  const local = inverseTransformVector(world, { x: 0, y: 5 });
  assert.ok(Math.abs(local.x - 5) < 1e-6);
  assert.ok(Math.abs(local.y) < 1e-6);
});

test("la máscara de silueta excluye celdas completamente fuera del papel", () => {
  const mesh = quadMesh({ columns: 2, rows: 2, shape: [[0,0],[0.5,0],[0,0.5]] });
  const triangles = buildMeshTriangles(mesh);
  assert.ok(triangles.length > 0);
  assert.ok(triangles.length < 8);
  assert.equal(pointInPolygon(0.1, 0.1, mesh.shape), true);
  assert.equal(pointInPolygon(0.9, 0.9, mesh.shape), false);
});

test("la consulta de superficie respeta el radio máximo y devuelve null lejos", () => {
  const triangles = buildMeshTriangles(quadMesh());
  assert.equal(closestPointOnMesh({ x: 100, y: 100 }, triangles, 5), null);
});

test("detecta una arista que atraviesa un triángulo aunque ambos extremos queden fuera", () => {
  const triangle = {
    a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 },
    minX: 0, maxX: 10, minY: 0, maxY: 10
  };
  const hits = segmentTriangleContacts({ x: -2, y: 5 }, { x: 12, y: 5 }, [triangle]);
  assert.equal(hits.length, 2);
  assert.ok(Math.abs(hits[0].point.x - 2.5) < 1e-6);
  assert.ok(Math.abs(hits[1].point.x - 7.5) < 1e-6);
  assert.ok(hits[0].t < hits[1].t);
});

test("ignora aristas paralelas y segmentos fuera del triángulo", () => {
  const triangle = {
    a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 },
    minX: 0, maxX: 10, minY: 0, maxY: 10
  };
  assert.deepEqual(segmentTriangleContacts({ x: -2, y: -2 }, { x: 12, y: -2 }, [triangle]), []);
  assert.deepEqual(segmentTriangleContacts({ x: -2, y: 12 }, { x: 12, y: 12 }, [triangle]), []);
});

test("deduplica el mismo cruce compartido por dos triángulos", () => {
  const left = { a: {x:0,y:0}, b: {x:5,y:0}, c: {x:5,y:10}, minX:0,maxX:5,minY:0,maxY:10 };
  const right = { a: {x:0,y:0}, b: {x:5,y:10}, c: {x:0,y:10}, minX:0,maxX:5,minY:0,maxY:10 };
  const hits = segmentTriangleContacts({x:-2,y:5},{x:7,y:5},[left,right]);
  assert.ok(hits.length <= 3);
  assert.ok(hits.every(hit => hit.t >= 0 && hit.t <= 1));
});
