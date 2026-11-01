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
  pointInPolygon, inverseTransformVector, transformVector, segmentTriangleContacts
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


test("el índice espacial devuelve los mismos triángulos candidatos que la consulta lineal", async () => {
  const { buildTriangleSpatialIndex, queryTriangleSpatialIndex } = await import("./collision-math.js");
  const triangles = buildMeshTriangles(quadMesh({ columns: 8, rows: 6 }));
  const index = buildTriangleSpatialIndex(triangles, 20);
  const bounds = { minX: 12, maxX: 31, minY: 8, maxY: 27 };
  const indexed = queryTriangleSpatialIndex(index, bounds);
  const linear = triangles.filter(t => !(t.maxX < bounds.minX || t.minX > bounds.maxX || t.maxY < bounds.minY || t.minY > bounds.maxY));
  assert.equal(indexed.length, linear.length);
  assert.ok(linear.every(t => indexed.includes(t)));
  assert.ok(index.cells.size > 1);
});

test("el índice espacial maneja coordenadas negativas y evita duplicar triángulos", async () => {
  const { buildTriangleSpatialIndex, queryTriangleSpatialIndex } = await import("./collision-math.js");
  const triangle = { a:{x:-15,y:-15}, b:{x:15,y:-15}, c:{x:0,y:15}, minX:-15,maxX:15,minY:-15,maxY:15 };
  const index = buildTriangleSpatialIndex([triangle], 10);
  const found = queryTriangleSpatialIndex(index, { minX:-4,maxX:4,minY:-4,maxY:4 });
  assert.equal(found.length, 1);
  assert.equal(found[0], triangle);
});


test("la transformación de vectores conserva dirección y escala sin trasladar el vector", () => {
  const matrix = composeWorldTransform({
    position: { x: 50, y: -20 }, scale: { x: 2, y: 0.5 }, rotation: Math.PI / 2,
    pivot: { x: 0, y: 0 }, parent: null
  });
  const world = transformVector(matrix, { x: 3, y: 4 });
  assert.ok(Math.abs(world.x + 2) < 1e-6);
  assert.ok(Math.abs(world.y - 6) < 1e-6);
  const local = inverseTransformVector(matrix, world);
  assert.ok(Math.abs(local.x - 3) < 1e-6);
  assert.ok(Math.abs(local.y - 4) < 1e-6);
});


test("el contacto encuentra el punto más cercano en triángulos degenerados", () => {
  const triangle = {
    a: { x: 0, y: 0 }, b: { x: 5, y: 0 }, c: { x: 10, y: 0 },
    minX: 0, maxX: 10, minY: 0, maxY: 0
  };
  const closest = closestPointOnMesh({ x: 6, y: 3 }, [triangle]);
  assert.ok(closest);
  assert.ok(Math.abs(closest.x - 6) < 1e-6);
  assert.ok(Math.abs(closest.y) < 1e-6);
  assert.ok(Math.abs(closest.distance - 3) < 1e-6);
});


test("detecta ambos extremos de un solapamiento colineal con el borde del triángulo", () => {
  const triangle = {
    a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 },
    minX: 0, maxX: 10, minY: 0, maxY: 10
  };
  const hits = segmentTriangleContacts({ x: 2, y: 0 }, { x: 8, y: 0 }, [triangle]);
  assert.equal(hits.length, 2);
  assert.ok(Math.abs(hits[0].t) < 1e-6);
  assert.ok(Math.abs(hits[1].t - 1) < 1e-6);
  assert.ok(hits.every(hit => Math.abs(hit.point.y) < 1e-6));
});

test("detecta un único contacto cuando dos segmentos colineales solo se tocan en un extremo", () => {
  const triangle = {
    a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 },
    minX: 0, maxX: 10, minY: 0, maxY: 10
  };
  const hits = segmentTriangleContacts({ x: -4, y: 0 }, { x: 0, y: 0 }, [triangle]);
  assert.equal(hits.length, 1);
  assert.ok(Math.abs(hits[0].point.x) < 1e-6);
});

test("los segmentos colineales separados no generan contactos", () => {
  const triangle = {
    a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 },
    minX: 0, maxX: 10, minY: 0, maxY: 10
  };
  assert.deepEqual(segmentTriangleContacts({ x: 12, y: 0 }, { x: 18, y: 0 }, [triangle]), []);
});


test("la triangulación conserva celdas que cruzan parcialmente el límite de silueta", () => {
  const mesh = quadMesh({
    columns: 1, rows: 1,
    shape: [[0.85,0.05],[0.95,0.05],[0.9,0.15]]
  });
  const triangles = buildMeshTriangles(mesh);
  assert.equal(triangles.length, 2);
});


test("el índice espacial coincide con la búsqueda lineal en múltiples regiones y coordenadas negativas", async () => {
  const { buildTriangleSpatialIndex, queryTriangleSpatialIndex } = await import("./collision-math.js");
  const triangles = buildMeshTriangles(quadMesh({ columns: 12, rows: 9, x: -35, y: -22 }));
  const index = buildTriangleSpatialIndex(triangles, 13);
  const regions = [
    { minX: -36, maxX: -18, minY: -23, maxY: -7 },
    { minX: -10, maxX: 4, minY: -5, maxY: 12 },
    { minX: 18, maxX: 42, minY: 21, maxY: 48 },
    { minX: 75, maxX: 110, minY: 60, maxY: 100 },
    { minX: -80, maxX: -50, minY: 20, maxY: 45 }
  ];
  for (const bounds of regions) {
    const indexed = queryTriangleSpatialIndex(index, bounds);
    const linear = triangles.filter(triangle =>
      !(triangle.maxX < bounds.minX || triangle.minX > bounds.maxX ||
        triangle.maxY < bounds.minY || triangle.minY > bounds.maxY)
    );
    assert.equal(indexed.length, linear.length);
    assert.ok(linear.every(triangle => indexed.includes(triangle)));
  }
});


test("el broadphase reduce candidatos en una malla grande sin perder contactos", async () => {
  const { buildTriangleSpatialIndex, queryTriangleSpatialIndex } = await import("./collision-math.js");
  const triangles = buildMeshTriangles(quadMesh({ columns: 40, rows: 30 }));
  const index = buildTriangleSpatialIndex(triangles, 20);
  const bounds = { minX: 190, maxX: 210, minY: 140, maxY: 160 };
  const candidates = queryTriangleSpatialIndex(index, bounds);
  const exact = triangles.filter(triangle =>
    !(triangle.maxX < bounds.minX || triangle.minX > bounds.maxX ||
      triangle.maxY < bounds.minY || triangle.minY > bounds.maxY)
  );
  assert.equal(candidates.length, exact.length);
  assert.ok(candidates.length < triangles.length / 10);
});


test("las consultas sucesivas reutilizan marcas sin filtrar candidatos de búsquedas anteriores", async () => {
  const { buildTriangleSpatialIndex, queryTriangleSpatialIndex } = await import("./collision-math.js");
  const triangles = buildMeshTriangles(quadMesh({ columns: 10, rows: 8 }));
  const index = buildTriangleSpatialIndex(triangles, 16);
  const left = queryTriangleSpatialIndex(index, { minX: 0, maxX: 20, minY: 0, maxY: 20 });
  const right = queryTriangleSpatialIndex(index, { minX: 70, maxX: 100, minY: 40, maxY: 70 });
  const leftAgain = queryTriangleSpatialIndex(index, { minX: 0, maxX: 20, minY: 0, maxY: 20 });
  assert.ok(left.length > 0 && right.length > 0);
  assert.equal(leftAgain.length, left.length);
  assert.ok(left.every(triangle => leftAgain.includes(triangle)));
  assert.equal(index.queryId, 3);
});
