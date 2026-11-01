import { layerFalloff, resolveLayerResponse, sampleDisplacement, contactShadowOffset } from "./layer-math.js";
import { resolveContactConstraint, composeWorldTransform, transformPoint, inverseTransformVector, buildMeshTriangles, closestPointOnMesh, pointInPolygon } from "./collision-math.js";

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
      const closest = closestPointOnMesh(worldPoint, sourceTriangles);
      testedVertices++;
      let contact = { x: 0, y: 0, penetration: 0, touching: false };
      if (closest) {
        const dx = worldPoint.x - closest.x, dy = worldPoint.y - closest.y;
        const distance = Math.hypot(dx, dy);
        const normalX = distance > 1e-7 ? dx / distance : link.contactNormalX;
        const normalY = distance > 1e-7 ? dy / distance : link.contactNormalY;
        contact = resolveContactConstraint(
          { x: closest.x, y: closest.y },
          worldPoint,
          {
            normalX, normalY, minGap: link.contactGap,
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

  const count = Math.max(1, testedVertices);
  target.mesh.vertices = target.vertices;
  target.shadowMesh.vertices = target.shadowVertices;
  target.shadowMesh.alpha = clamp(link.baseShadowAlpha + (totalPressure / count) * 0.28, 0, 0.65);
  link.lastContact = {
    activeVertices: contactCount,
    averagePenetration: totalPenetration / count,
    testedVertices,
    sourceTriangles: sourceTriangles.length
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
    contactStiffness: clamp(Number(link.contactStiffness ?? 0.65), 0, 1),
    contactNormalX: clamp(Number(link.contactNormalX ?? 0), -1, 1),
    contactNormalY: clamp(Number(link.contactNormalY ?? 1), -1, 1),
    maxCorrection: clamp(Number(link.maxCorrection ?? 10), 0, 20),
    tangentRestGap: clamp(Number(link.tangentRestGap ?? 0), -100, 100),
    friction: clamp(Number(link.friction ?? 0), 0, 1),
    maxTangentialCorrection: clamp(Number(link.maxTangentialCorrection ?? 3), 0, 12),
    restY: 0,
    baseShadowAlpha: 0,
    lastContact: { activeVertices: 0, averagePenetration: 0 }
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
  contactGap: [0, 20], contactStiffness: [0, 1],
  contactNormalX: [-1, 1], contactNormalY: [-1, 1], maxCorrection: [0, 20],
  tangentRestGap: [-100, 100], friction: [0, 1], maxTangentialCorrection: [0, 12]
};
