import { layerFalloff, resolveLayerResponse, sampleDisplacement } from "./layer-math.js";

/**
 * Couples overlapping PaperMesh surfaces with a lightweight 2.5D response.
 * Each target is recalculated from its own mesh update, then receives a
 * bounded share of the source deformation. No physical collision solver.
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
    for (const key of ["coupling", "clearance", "contact", "maxDisplacement", "edgeRadius"]) {
      if (options[key] !== undefined) link[key] = clamp(Number(options[key]), key === "clearance" ? 0 : 0, key === "maxDisplacement" ? 40 : key === "edgeRadius" ? 0.8 : key === "clearance" ? 24 : 1);
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
  };
  engine.layerInteractions = normalized;
  normalized.forEach(applyLink);
  return engine;
}

function applyLink(link) {
  const { source, target } = link;
  // Rebuild the target from its own rig before applying this frame's coupling.
  // This prevents cumulative drift when controls are moved or the engine is paused.
  target.update(target.elapsed, true);
  const columns = target.columns, rows = target.rows;
  let totalPressure = 0;
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      const i = (row * (columns + 1) + col) * 2;
      const u = col / columns, v = row / rows;
      const delta = sampleDisplacement(source.vertices, source.baseVertices, source.columns, source.rows, u, v);
      const weight = layerFalloff(u, v, link.edgeRadius);
      const response = resolveLayerResponse(delta.x, delta.y, { ...link, weight });
      target.vertices[i] += response.x;
      target.vertices[i + 1] += response.y;
      target.shadowVertices[i] = target.vertices[i] + 4;
      target.shadowVertices[i + 1] = target.vertices[i + 1] + 5;
      totalPressure += response.pressure;
    }
  }
  const count = (columns + 1) * (rows + 1);
  target.mesh.vertices = target.vertices;
  target.shadowMesh.vertices = target.shadowVertices;
  target.shadowMesh.alpha = clamp(link.baseShadowAlpha + (totalPressure / count) * 0.28, 0, 0.65);
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
    restY: 0,
    baseShadowAlpha: 0
  };
}
function validateMesh(mesh, label) {
  if (!mesh?.mesh || !mesh?.shadowMesh || !mesh?.vertices || !mesh?.baseVertices || !mesh?.container) {
    throw new TypeError(`La capa ${label} debe ser una PaperMesh.`);
  }
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
