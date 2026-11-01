import { enableLayerInteraction } from "./layers.js";

/** Build a front-to-back cascade of adjacent paper layers. */
export function buildLayerGroupLinks(groups = []) {
  const links = [];
  for (const group of groups) {
    const layers = group.layers || [];
    if (layers.length < 2) throw new RangeError("Cada grupo necesita al menos dos capas.");
    for (let index = 0; index < layers.length - 1; index++) {
      const source = layers[index], target = layers[index + 1];
      if (!source || !target || source === target) throw new TypeError("El grupo contiene capas inválidas.");
      const overrides = group.links?.[index] || {};
      links.push({ source, target,
        coupling: overrides.coupling ?? group.coupling ?? 0.22,
        clearance: overrides.clearance ?? group.clearance ?? 5,
        contact: overrides.contact ?? group.contact ?? 0.35,
        maxDisplacement: overrides.maxDisplacement ?? group.maxDisplacement ?? 18,
        edgeRadius: overrides.edgeRadius ?? group.edgeRadius ?? 0.18,
        shadowReach: overrides.shadowReach ?? group.shadowReach ?? 10
      });
    }
  }
  return links;
}

/** Enables cascade propagation while preserving the existing per-link inspector API. */
export function enableLayerGroups(engine, groups = []) {
  const links = buildLayerGroupLinks(groups);
  enableLayerInteraction(engine, links);
  engine.getLayerGroups = () => groups.map((group, index) => ({
    id: group.id ?? `layer-group-${index + 1}`,
    layerIds: group.layers.map(layer => layer.id),
    linkCount: group.layers.length - 1
  }));
  const destroy = engine.destroyLayerInteractions.bind(engine);
  engine.destroyLayerInteractions = () => { destroy(); delete engine.getLayerGroups; };
  return engine;
}