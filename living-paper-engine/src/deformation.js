/**
 * Localized deformation layer for PaperMesh.
 * Coordinates are normalized (0..1) across the mesh surface.
 * The base mesh deformation is recalculated first on every update, then
 * influence zones are applied without accumulating vertex drift.
 */
export function enableLocalizedDeformation(mesh, initialZones = []) {
  if (!mesh || !mesh.mesh || !mesh.shadowMesh || !mesh.baseVertices) {
    throw new TypeError("enableLocalizedDeformation requiere una instancia PaperMesh.");
  }

  const originalUpdate = mesh.update.bind(mesh);
  mesh.influenceZones = initialZones.map(normalizeZone);

  mesh.setInfluenceZones = (zones = []) => {
    mesh.influenceZones = zones.map(normalizeZone);
    mesh.update(mesh.elapsed, true);
    return mesh;
  };

  mesh.addInfluenceZone = (zone) => {
    mesh.influenceZones.push(normalizeZone(zone));
    mesh.update(mesh.elapsed, true);
    return mesh;
  };

  mesh.clearInfluenceZones = () => {
    mesh.influenceZones = [];
    mesh.update(mesh.elapsed, true);
    return mesh;
  };

  mesh.update = (elapsed, force = false) => {
    // Force the base PaperMesh to refresh its PixiJS vertex buffers.
    originalUpdate(elapsed, true);

    if (!mesh.influenceZones.length) return;

    const vertices = mesh.vertices;
    const shadowVertices = mesh.shadowVertices;
    const stride = mesh.columns + 1;

    for (let row = 0; row <= mesh.rows; row++) {
      for (let col = 0; col <= mesh.columns; col++) {
        const index = (row * stride + col) * 2;
        const u = col / mesh.columns;
        const v = row / mesh.rows;
        let dx = 0;
        let dy = 0;

        for (const zone of mesh.influenceZones) {
          const du = u - zone.u;
          const dv = v - zone.v;
          const distance = Math.sqrt(du * du + dv * dv);
          const normalizedDistance = distance / zone.radius;
          if (normalizedDistance >= 1) continue;

          // Smooth radial falloff: no hard boundary at the influence edge.
          const t = 1 - normalizedDistance;
          const weight = t * t * (3 - 2 * t) * zone.strength;
          dx += du * zone.bend * weight + zone.offsetX * weight;
          dy += dv * zone.bend * weight + zone.offsetY * weight;
        }

        vertices[index] += dx;
        vertices[index + 1] += dy;
        shadowVertices[index] = vertices[index] + 4;
        shadowVertices[index + 1] = vertices[index + 1] + 5;
      }
    }

    // MeshSimple autoUpdate uploads these arrays during the next render.
    mesh.mesh.vertices = vertices;
    mesh.shadowMesh.vertices = shadowVertices;
  };

  mesh.update(mesh.elapsed, true);
  return mesh;
}

function normalizeZone(zone = {}) {
  return {
    u: clamp(Number(zone.u ?? 0.75), 0, 1),
    v: clamp(Number(zone.v ?? 0.35), 0, 1),
    radius: clamp(Number(zone.radius ?? 0.3), 0.05, 1),
    strength: clamp(Number(zone.strength ?? 1), 0, 1),
    bend: clamp(Number(zone.bend ?? 12), -36, 36),
    offsetX: clamp(Number(zone.offsetX ?? 0), -40, 40),
    offsetY: clamp(Number(zone.offsetY ?? 0), -40, 40)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
