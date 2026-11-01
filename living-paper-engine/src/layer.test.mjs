import test from "node:test";
import assert from "node:assert/strict";
import { layerFalloff, resolveLayerResponse, sampleDisplacement, contactShadowOffset } from "./layer-math.js";
import { enableLayerInteraction } from "./layers.js";
import { buildLayerGroupLinks } from "./layer-groups.js";
import { resolveContactConstraint, sampleMeshPoint } from "./collision-math.js";

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

function makeMesh(id, { source = false, sourceLift = 0 } = {}) {
  const columns = 2, rows = 2, base = [];
  for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) base.push(x * 10, y * 10);
  const baseVertices = new Float32Array(base);
  const vertices = new Float32Array(base);
  const shadowVertices = new Float32Array(base.map((value, i) => value + (i % 2 ? 5 : 4)));
  return {
    id, columns, rows, baseVertices, vertices, shadowVertices,
    container: { position: { y: 20 } },
    mesh: { vertices }, shadowMesh: { vertices: shadowVertices, alpha: 0.2 },
    elapsed: 0,
    updateCount: 0,
    update(elapsed) {
      this.updateCount++;
      this.elapsed = elapsed;
      this.vertices.set(this.baseVertices);
      if (source) this.vertices[(1 * (columns + 1) + 1) * 2] += 10;
      if (sourceLift) this.vertices[(1 * (columns + 1) + 1) * 2 + 1] += sourceLift;
      this.shadowVertices.set(this.vertices);
      this.mesh.vertices = this.vertices;
      this.shadowMesh.vertices = this.shadowVertices;
    }
  };
}

test("la capa receptora sigue la deformación sin acumular deriva", () => {
  const source = makeMesh("front", { source: true });
  const target = makeMesh("back");
  const engine = {
    paused: false,
    update(dt) { source.update(dt); target.update(dt); }
  };
  enableLayerInteraction(engine, [{ source, target, coupling: 0.4, clearance: 6, maxDisplacement: 20 }]);
  const center = (1 * 3 + 1) * 2;
  engine.update(1 / 60);
  assert.equal(target.updateCount, 1, "la capa receptora solo debe actualizarse una vez por frame");
  assert.ok(Math.abs(target.vertices[center] - 14) < 1e-6);
  const first = target.vertices[center];
  engine.update(1 / 60);
  assert.ok(Math.abs(target.vertices[center] - first) < 1e-6);
  assert.equal(target.container.position.y, 26);
});

test("pausar el motor evita recalcular la interacción y destruirla restaura la capa", () => {
  const source = makeMesh("front", { source: true });
  const target = makeMesh("back");
  const engine = {
    paused: false,
    update(dt) { if (this.paused) return; source.update(dt); target.update(dt); }
  };
  enableLayerInteraction(engine, [{ source, target, coupling: 0.4, clearance: 6 }]);
  const center = (1 * 3 + 1) * 2;
  engine.paused = true;
  const before = target.vertices[center];
  engine.update(1 / 60);
  assert.equal(target.vertices[center], before);
  engine.destroyLayerInteractions();
  assert.equal(target.container.position.y, 20);
  assert.equal(target.shadowMesh.alpha, 0.2);
});

test("la sombra de contacto responde a la dirección del desplazamiento y al espacio", () => {
  const pressed = contactShadowOffset(12, 0, { contact: 1, clearance: 0, maxOffset: 10 });
  const lifted = contactShadowOffset(12, 0, { contact: 1, clearance: 18, maxOffset: 10 });
  assert.ok(pressed.x < 0);
  assert.ok(Math.abs(pressed.y) < 1e-12);
  assert.ok(Math.abs(pressed.x) > Math.abs(lifted.x));
  assert.deepEqual(contactShadowOffset(12, 0, { contact: 0 }), { x: 0, y: 0 });
});

test("un grupo propaga en cadena de la capa frontal a la posterior", () => {
  const front = makeMesh("front"), middle = makeMesh("middle"), back = makeMesh("back");
  const links = buildLayerGroupLinks([{ id: "stack", layers: [front, middle, back], coupling: 0.3, links: [{ clearance: 4 }, { coupling: 0.15, clearance: 7 }] }]);
  assert.equal(links.length, 2);
  assert.equal(links[0].source, front);
  assert.equal(links[0].target, middle);
  assert.equal(links[1].source, middle);
  assert.equal(links[1].target, back);
  assert.equal(links[0].clearance, 4);
  assert.equal(links[1].coupling, 0.15);
  assert.equal(links[1].clearance, 7);
});

test("un grupo rechaza una pila con menos de dos capas", () => {
  assert.throws(() => buildLayerGroupLinks([{ layers: [makeMesh("solo")] }]), /al menos dos capas/);
});

test("el contacto calcula penetración y corrección acotada sobre el eje normal", () => {
  const result = resolveContactConstraint({ x: 4, y: 10 }, { x: 4, y: 4 }, {
    normalX: 0, normalY: 1, minGap: 2, stiffness: 1, maxCorrection: 4
  });
  assert.equal(result.gap, -6);
  assert.equal(result.penetration, 8);
  assert.equal(result.correction, 4);
  assert.deepEqual({ x: result.x, y: result.y }, { x: 0, y: 4 });
  assert.equal(result.touching, true);
});

test("el contacto no modifica puntos que ya respetan la separación", () => {
  const result = resolveContactConstraint({ x: 0, y: 0 }, { x: 0, y: 5 }, { minGap: 2 });
  assert.equal(result.correction, 0);
  assert.equal(result.touching, false);
});

test("el muestreo de contacto interpola mallas con distinta resolución", () => {
  const points = new Float32Array([0,0, 10,0, 0,10, 10,10]);
  assert.deepEqual(sampleMeshPoint(points, 1, 1, 0.5, 0.5), { x: 5, y: 5 });
});

test("el solver evita la penetración de una hoja sin acumular correcciones", () => {
  const source = makeMesh("front", { sourceLift: 20 });
  const target = makeMesh("back");
  const engine = { paused: false, update(dt) { source.update(dt); target.update(dt); } };
  enableLayerInteraction(engine, [{
    source, target, coupling: 0, clearance: 6, contactGap: 2,
    contactStiffness: 0.5, maxCorrection: 8
  }]);
  const centerY = ((1 * 3 + 1) * 2) + 1;
  engine.update(1 / 60);
  const first = target.vertices[centerY];
  assert.ok(first > 10);
  assert.ok(engine.layerInteractions[0].lastContact.activeVertices >= 1);
  assert.ok(engine.layerInteractions[0].lastContact.activeVertices <= engine.layerInteractions[0].lastContact.testedVertices);
  assert.ok(engine.layerInteractions[0].lastContact.sourceTriangles > 0);
  engine.update(1 / 60);
  assert.ok(Math.abs(target.vertices[centerY] - first) < 1e-6);
});

test("la fricción de contacto amortigua el deslizamiento tangencial con límite", () => {
  const noFriction = resolveContactConstraint({ x: 0, y: 0 }, { x: 8, y: 0 }, {
    normalX: 0, normalY: 1, minGap: 0, friction: 0
  });
  const friction = resolveContactConstraint({ x: 0, y: 0 }, { x: 8, y: 0 }, {
    normalX: 0, normalY: 1, minGap: 0, friction: 0.5, maxTangentialCorrection: 2
  });
  assert.equal(noFriction.frictionCorrection, 0);
  assert.equal(friction.slip, -8);
  assert.equal(friction.frictionCorrection, 2);
  assert.equal(friction.x, -2);
  assert.equal(friction.y, 0);
});

test("la fricción conserva el desplazamiento tangencial de reposo", () => {
  const result = resolveContactConstraint({ x: 0, y: 0 }, { x: 8, y: 0 }, {
    normalX: 0, normalY: 1, minGap: 0, tangentRestGap: -8, friction: 1
  });
  assert.ok(Math.abs(result.frictionCorrection) < 1e-12);
});


test("el contacto permanece estable con rotación y escala no uniforme anidadas", () => {
  const source = makeMesh("front", { sourceLift: 20 });
  const target = makeMesh("back");
  const parent = { position: { x: 30, y: -12 }, scale: { x: 1.3, y: 0.8 }, rotation: 0.31, pivot: { x: 0, y: 0 }, parent: null };
  target.container.parent = parent;
  target.container.position.x = 4;
  target.container.position.y = 20;
  target.container.scale = { x: 0.9, y: 1.2 };
  target.container.rotation = -0.17;
  const engine = { paused: false, update(dt) { source.update(dt); target.update(dt); } };
  enableLayerInteraction(engine, [{ source, target, coupling: 0, clearance: 6, contactGap: 2, contactStiffness: 0.5, maxCorrection: 8 }]);
  engine.update(1 / 60);
  const first = new Float32Array(target.vertices);
  engine.update(1 / 60);
  for (let i = 0; i < first.length; i++) assert.ok(Math.abs(target.vertices[i] - first[i]) < 1e-5);
  assert.ok(engine.layerInteractions[0].lastContact.indexedCells > 0);
});


test("la deformación propagada respeta rotación y escala de la capa fuente", () => {
  const source = makeMesh("front", { source: true });
  const target = makeMesh("back");
  source.container.scale = { x: 2, y: 1 };
  source.container.rotation = Math.PI / 2;
  target.container.position.y = 200;
  const engine = { paused: false, update(dt) { source.update(dt); target.update(dt); } };
  enableLayerInteraction(engine, [{ source, target, coupling: 0.4, clearance: 0, contactRange: 1 }]);
  engine.update(1 / 60);
  const center = (1 * 3 + 1) * 2;
  assert.ok(Math.abs(target.vertices[center] - 10) < 1e-5);
  assert.ok(Math.abs(target.vertices[center + 1] - 18) < 1e-5);
});


test("cambiar parámetros repetidamente no acumula correcciones antes del siguiente frame", () => {
  const source = makeMesh("front", { source: true });
  const target = makeMesh("back");
  const engine = { paused: false, update(dt) { source.update(dt); target.update(dt); } };
  enableLayerInteraction(engine, [{ source, target, coupling: 0.4, clearance: 6, maxDisplacement: 20 }]);
  engine.update(1 / 60);
  const first = new Float32Array(target.vertices);
  for (let i = 0; i < 12; i++) engine.setLayerInteraction(0, { coupling: 0.4, contactStiffness: 0.65 });
  for (let i = 0; i < first.length; i++) assert.ok(Math.abs(target.vertices[i] - first[i]) < 1e-6);
  engine.update(1 / 60);
  for (let i = 0; i < first.length; i++) assert.ok(Math.abs(target.vertices[i] - first[i]) < 1e-6);
});


test("el acoplamiento se mantiene sin deriva durante ciclos repetidos de deformación", () => {
  const source = makeMesh("front");
  const target = makeMesh("back");
  const baseUpdate = source.update.bind(source);
  let elapsed = 0;
  source.update = time => {
    baseUpdate(time);
    const displacement = Math.sin(time * Math.PI * 2) * 2;
    for (let i = 1; i < source.vertices.length; i += 2) source.vertices[i] += displacement;
    source.mesh.vertices = source.vertices;
  };
  const engine = {
    paused: false,
    update(dt) {
      elapsed += dt;
      source.update(elapsed);
      target.update(elapsed);
    }
  };
  enableLayerInteraction(engine, [{
    source, target, coupling: 0.6, clearance: 12, contactGap: 0, contactRange: 1
  }]);
  let afterFirstCycle;
  for (let frame = 0; frame < 2400; frame++) {
    engine.update(1 / 120);
    if (frame === 119) afterFirstCycle = new Float32Array(target.vertices);
    for (const value of target.vertices) assert.ok(Number.isFinite(value), `vértice no finito en frame ${frame}`);
  }
  for (let i = 0; i < afterFirstCycle.length; i++) {
    assert.ok(Math.abs(target.vertices[i] - afterFirstCycle[i]) < 1e-5, `deriva tras 20 ciclos en componente ${i}`);
  }
});


test("el contacto transformado mantiene estabilidad con ambas capas bajo el mismo rig", () => {
  const source = makeMesh("front", { sourceLift: 40 });
  const target = makeMesh("back");
  const parent = {
    position: { x: 30, y: -12 }, scale: { x: 1.2, y: 0.8 },
    rotation: 0.4, pivot: { x: 0, y: 0 }, parent: null
  };
  source.container.parent = parent;
  target.container.parent = parent;
  const engine = { paused: false, update(dt) { source.update(dt); target.update(dt); } };
  enableLayerInteraction(engine, [{
    source, target, coupling: 0, clearance: 6, contactGap: 2,
    contactStiffness: 0.5, maxCorrection: 8, contactRange: 32,
    contactNormalX: -Math.sin(0.4), contactNormalY: Math.cos(0.4)
  }]);
  engine.update(1 / 60);
  const first = new Float32Array(target.vertices);
  const telemetry = engine.layerInteractions[0].lastContact;
  assert.ok(telemetry.activeVertices > 0);
  assert.ok(telemetry.testedEdges + telemetry.skippedResolvedEdges > 0);
  for (let frame = 0; frame < 60; frame++) engine.update(1 / 60);
  for (let i = 0; i < first.length; i++) {
    assert.ok(Number.isFinite(target.vertices[i]));
    assert.ok(Math.abs(target.vertices[i] - first[i]) < 1e-5);
  }
});


test("destruir la interacción restaura geometría, sombra y métodos originales", () => {
  const source = makeMesh("front", { source: true });
  const target = makeMesh("back");
  const engine = {
    paused: false,
    destroyed: false,
    update(dt) { source.update(dt); target.update(dt); },
    destroy() { this.destroyed = true; }
  };
  const originalUpdate = engine.update;
  const originalDestroy = engine.destroy;
  enableLayerInteraction(engine, [{ source, target, coupling: 0.4, clearance: 6, maxDisplacement: 20 }]);
  engine.update(1 / 60);
  assert.notDeepEqual(target.vertices, target.baseVertices);
  engine.destroyLayerInteractions();
  assert.equal(engine.update, originalUpdate);
  assert.equal(engine.destroy, originalDestroy);
  assert.equal(engine.setLayerInteraction, undefined);
  assert.equal(engine.getLayerInteractions, undefined);
  assert.equal(engine.layerInteractions, undefined);
  assert.equal(target.container.position.y, 20);
  assert.deepEqual([...target.vertices], [...target.baseVertices]);
  assert.equal(target.shadowMesh.alpha, 0.2);
  assert.equal(target.shadowVertices[0], target.baseVertices[0] + 4);
  assert.equal(target.shadowVertices[1], target.baseVertices[1] + 5);
  engine.destroy();
  assert.equal(engine.destroyed, true);
});

test("destruir el motor ejecuta la limpieza de contactos antes de destruir recursos", () => {
  const source = makeMesh("front", { source: true });
  const target = makeMesh("back");
  const engine = {
    paused: false,
    destroyed: false,
    update(dt) { source.update(dt); target.update(dt); },
    destroy() { this.destroyed = true; }
  };
  const originalDestroy = engine.destroy;
  enableLayerInteraction(engine, [{ source, target, coupling: 0.4, clearance: 6 }]);
  engine.update(1 / 60);
  engine.destroy();
  assert.equal(engine.destroyed, true);
  assert.equal(engine.destroy, originalDestroy);
  assert.equal(engine.update.name, "update");
  assert.equal(engine.layerInteractions, undefined);
  assert.deepEqual([...target.vertices], [...target.baseVertices]);
});


test("omite intersecciones de arista cuando ambos extremos ya resolvieron el contacto", () => {
  const source = makeMesh("front");
  const target = makeMesh("back");
  const engine = { paused: false, update(dt) { source.update(dt); target.update(dt); } };
  enableLayerInteraction(engine, [{
    source, target, coupling: 0, clearance: 0, contactGap: 2,
    contactRange: 4, contactStiffness: 0.5
  }]);
  engine.update(1 / 60);
  const stats = engine.layerInteractions[0].lastContact;
  assert.equal(stats.testedEdges, 0);
  assert.ok(stats.skippedResolvedEdges > 0);
  assert.equal(stats.activeVertices, stats.testedVertices);
});
