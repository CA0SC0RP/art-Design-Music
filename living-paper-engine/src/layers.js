import { layerFalloff, resolveLayerResponse, sampleDisplacement, contactShadowOffset } from "./layer-math.js";
import { resolveContactConstraint, composeWorldTransform, transformPoint, inverseTransformVector, buildMeshTriangles, closestPointOnMesh, pointInPolygon, segmentTriangleContacts } from "./collision-math.js";

/**
 * Couples overlapping PaperMesh surfaces with a bounded 2.5D contact response.
 * Contact is resolved along a configurable in-plane separation axis; this is
 * an approximation for layered paper, not a volumetric collision solver.
 */
export function enableLayerInteraction(engine, links = []) {
  if (!engine || typeof engine.update !== "function") {
    throw new TypeError("enableLayerInteraction requiere un LivingPaperEngine.");
  }
  const normalized = links.map(normalizeLink);
  for (const link of normalized) {
    validateMesh(link.source, "source");
    validateMesh(link.target, "target");
    if (link.source === link.target) throw new TypeError("Una capa no puede interactuar consigo misma.");
    link.restY = link.target.container.position.y;
    link.baseShadowAlpha = link.target.shadowMesh.alpha;
    link.target.container.position.y = link.restY + link.clearance;
  }

  const originalUpdate = engine.update.bind(engine);
  engine.update = (dt) => {
    originalUpdate(dt);
    if (engine.paused) return;
    for (const link of normalized) applyLink(link);
  };

  engine.setLayerInteraction = (index, options = {}) => {
    const link = normalized[index];
    if (!link) throw new RangeError("Índice de interacción de capas inexistente.");
    for (const key of Object.keys(LIMITS)) {
      if (options[key] !== undefined) link[key] = clamp(Number(options[key]), ...LIMITS[key]);
    }
    link.target.container.position.y = link.restY + link.clearance;
    applyLink(link);
    return engine;
  };
  engine.getLayerInteractions = () => normalized.map(({ source, target, ...settings }) => ({ source: source.id, target: target.id, ...settings }));
  engine.destroyLayerInteractions = () => {
    for (const link of normalized) {
      link.target.container.position.y = link.restY;
      link.target.shadowMesh.alpha = link.baseShadowAlpha;
    }
    engine.update = originalUpdate;
    delete engine.setLayerInteraction;
    delete engine.getLayerInteractions;
    delete engine.destroyLayerInteractions;
    delete engine.layerInteractions;
  };
  engine.layerInteractions = normalized;
  normalized.forEach(applyLink);
  return engine;
}

function applyLink(link) {
  const { source, target } = link;
  target.update(target.elapsed, true);
  const sourceTransform = composeWorldTransform(source.container);
  const targetTransform = composeWorldTransform(target.container);
  const sourceTriangles = buildMeshTriangles(source, sourceTransform);
  const inverseTarget = targetTransform;
  let totalPressure = 0, totalPenetration = 0, contactCount = 0, testedVertices = 0;

  for (let row = 0; row <= target.rows; row++) {
    for (let col = 0; col <= target.columns; col++) {
      const i = (row * (target.columns + 1) + col) * 2;
      const u = col / target.columns, v = row / target.rows;
      if (target.shape && !pointInPolygon(u, v, target.shape)) continue;

      const delta = sampleDisplacement(source.vertices, source.baseVertices, source.columns, source.rows, u, v);
      const weight = layerFalloff(u, v, link.edgeRadius);
      const response = resolveLayerResponse(delta.x, delta.y, { ...link, weight });
      target.vertices[i] += response.x;
      target.vertices[i + 1] += response.y;

      const localPoint = { x: target.vertices[i], y: target.vertices[i + 1] };
      const worldPoint = transformPoint(targetTransform, localPoint);
      const closest = closestPointOnMesh(worldPoint, sourceTriangles, link.contactRange);
      testedVertices++;
      let contact = { x: 0, y: 0, penetration: 0, touching: false };
      if (closest) {
        contact = resolveContactConstraint(
          { x: closest.x, y: closest.y },
          worldPoint,
          {
            normalX: link.contactNormalX, normalY: link.contactNormalY, minGap: link.contactGap,
            stiffness: link.contactStiffness, maxCorrection: link.maxCorrection,
            tangentRestGap: link.tangentRestGap, friction: link.friction,
            maxTangentialCorrection: link.maxTangentialCorrection
          }
        );
        const localCorrection = inverseTransformVector(inverseTarget, { x: contact.x, y: contact.y });
        target.vertices[i] += localCorrection.x;
        target.vertices[i + 1] += localCorrection.y;
        totalPenetration += contact.penetration;
        if (contact.touching) contactCount++;
      }

      const shadowOffset = contactShadowOffset(delta.x, delta.y, {
        contact: link.contact, clearance: link.clearance, maxOffset: link.shadowReach
      });
      target.shadowVertices[i] = target.vertices[i] + 4 + shadowOffset.x;
      target.shadowVertices[i + 1] = target.vertices[i + 1] + 5 + shadowOffset.y;
      totalPressure += response.pressure + contact.penetration / Math.max(1, link.contactGap) * link.contactStiffness * 0.15;
    }
  }

  // A vertex-only test can miss a thin crossing when both edge endpoints remain outside.
  // Test every unique grid edge against the source triangulation and distribute a bounded
  // separation correction to the two target vertices surrounding each intersection.
  const edgeCorrections = new Float64Array(target.vertices.length);
  const edgeWeights = new Uint16Array(target.vertices.length / 2);
  let edgeTests = 0, edgeIntersections = 0;
  const normalLength = Math.hypot(link.contactNormalX, link.contactNormalY) || 1;
  const nx = link.contactNormalX / normalLength, ny = link.contactNormalY / normalLength;
  const gridIndex = (x, y) => y * (target.columns + 1) + x;
  const testEdge = (ia, ib) => {
    const ax = target.vertices[ia * 2], ay = target.vertices[ia * 2 + 1];
    const bx = target.vertices[ib * 2], by = target.vertices[ib * 2 + 1];
    const midpoint = { x: (ax + bx) / 2, y: (ay + by) / 2 };
    if (target.shape && !pointInPolygon(midpoint.x / target.width, midpoint.y / target.height, target.shape)) return;
    const worldA = transformPoint(targetTransform, { x: ax, y: ay });
    const worldB = transformPoint(targetTransform, { x: bx, y: by });
    edgeTests++;
    const hits = segmentTriangleContacts(worldA, worldB, sourceTriangles);
    for (const hit of hits) {
      const triangleCenter = {
        x: (hit.triangle.a.x + hit.triangle.b.x + hit.triangle.c.x) / 3,
        y: (hit.triangle.a.y + hit.triangle.b.y + hit.triangle.c.y) / 3
      };
      const side = (midpoint.x * targetTransform.a + midpoint.y * targetTransform.c + targetTransform.tx - triangleCenter.x) * nx +
        (midpoint.x * targetTransform.b + midpoint.y * targetTransform.d + targetTransform.ty - triangleCenter.y) * ny;
      const direction = side < -1e-6 ? -1 : 1;
      const amount = Math.min(link.maxCorrection, Math.max(0.5, link.contactGap) * link.contactStiffness);
      if (amount <= 0) continue;
      const t = hit.t, denominator = Math.max(1e-6, (1 - t) ** 2 + t ** 2);
      const wa = (1 - t) / denominator, wb = t / denominator;
      const worldCorrection = { x: nx * amount * direction, y: ny * amount * direction };
      const localCorrection = inverseTransformVector(targetTransform, worldCorrection);
      edgeCorrections[ia * 2] += localCorrection.x * wa;
      edgeCorrections[ia * 2 + 1] += localCorrection.y * wa;
      edgeCorrections[ib * 2] += localCorrection.x * wb;
      edgeCorrections[ib * 2 + 1] += localCorrection.y * wb;
      edgeWeights[ia]++; edgeWeights[ib]++;
      edgeIntersections++;
    }
  };
  for (let y = 0; y <= target.rows; y++) for (let x = 0; x <= target.columns; x++) {
    const a = gridIndex(x, y);
    if (x < target.columns) testEdge(a, gridIndex(x + 1, y));
    if (y < target.rows) testEdge(a, gridIndex(x, y + 1));
    if (x < target.columns && y < target.rows) testEdge(gridIndex(x + 1, y), gridIndex(x, y + 1));
  }
  for (let vertex = 0; vertex < edgeWeights.length; vertex++) {
    if (!edgeWeights[vertex]) continue;
    const divisor = edgeWeights[vertex];
    const dx = clamp(edgeCorrections[vertex * 2] / divisor, -link.maxCorrection, link.maxCorrection);
    const dy = clamp(edgeCorrections[vertex * 2 + 1] / divisor, -link.maxCorrection, link.maxCorrection);
    target.vertices[vertex * 2] += dx;
    target.vertices[vertex * 2 + 1] += dy;
    target.shadowVertices[vertex * 2] += dx;
    target.shadowVertices[vertex * 2 + 1] += dy;
  }
  edgeIntersections = Math.min(edgeIntersections, edgeTests * 3);

  const count = Math.max(1, testedVertices);
  target.mesh.vertices = target.vertices;
  target.shadowMesh.vertices = target.shadowVertices;
  target.shadowMesh.alpha = clamp(link.baseShadowAlpha + (totalPressure / count) * 0.28, 0, 0.65);
  link.lastContact = {
    activeVertices: contactCount,
    averagePenetration: totalPenetration / count,
    testedVertices,
    sourceTriangles: sourceTriangles.length,
    testedEdges: edgeTests,
    edgeIntersections
  };
}
function normalizeLink(link = {}) {
  return {
    source: link.source,
    target: link.target,
    coupling: clamp(Number(link.coupling ?? 0.22), 0, 1),
    clearance: clamp(Number(link.clearance ?? 5), 0, 24),
    contact: clamp(Number(link.contact ?? 0.35), 0, 1),
    maxDisplacement: clamp(Number(link.maxDisplacement ?? 18), 0, 40),
    edgeRadius: clamp(Number(link.edgeRadius ?? 0.18), 0.05, 0.8),
    shadowReach: clamp(Number(link.shadowReach ?? 10), 0, 24),
    contactGap: clamp(Number(link.contactGap ?? 2), 0, 20),
    contactRange: clamp(Number(link.contactRange ?? 32), 1, 160),
    contactStiffness: clamp(Number(link.contactStiffness ?? 0.65), 0, 1),
    contactNormalX: clamp(Number(link.contactNormalX ?? 0), -1, 1),
    contactNormalY: clamp(Number(link.contactNormalY ?? 1), -1, 1),
    maxCorrection: clamp(Number(link.maxCorrection ?? 10), 0, 20),
    tangentRestGap: clamp(Number(link.tangentRestGap ?? 0), -100, 100),
    friction: clamp(Number(link.friction ?? 0), 0, 1),
    maxTangentialCorrection: clamp(Number(link.maxTangentialCorrection ?? 3), 0, 12),
    restY: 0,
    baseShadowAlpha: 0,
    lastContact: { activeVertices: 0, averagePenetration: 0, testedEdges: 0, edgeIntersections: 0 }
  };
}
function validateMesh(mesh, label) {
  if (!mesh?.mesh || !mesh?.shadowMesh || !mesh?.vertices || !mesh?.baseVertices || !mesh?.container) {
    throw new TypeError(`La capa ${label} debe ser una PaperMesh.`);
  }
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
const LIMITS = {
  coupling: [0, 1], clearance: [0, 24], contact: [0, 1],
  maxDisplacement: [0, 40], edgeRadius: [0.05, 0.8], shadowReach: [0, 24],
  contactGap: [0, 20], contactRange: [1, 160], contactStiffness: [0, 1],
  contactNormalX: [-1, 1], contactNormalY: [-1, 1], maxCorrection: [0, 20],
  tangentRestGap: [-100, 100], friction: [0, 1], maxTangentialCorrection: [0, 12]
};
