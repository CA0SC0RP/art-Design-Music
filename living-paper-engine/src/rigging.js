/**
 * Paper rig: normalized anchor pins and controllable crease folds for PaperMesh.
 * Anchors soften movement around attachment points. Folds are a 2D projection
 * approximation, not a physical cloth simulation.
 */
export function enablePaperRig(mesh, { anchors = [], folds = [] } = {}) {
  if (!mesh?.mesh || !mesh?.shadowMesh || !mesh?.baseVertices) {
    throw new TypeError("enablePaperRig requiere una instancia PaperMesh.");
  }

  const baseUpdate = mesh.update.bind(mesh);
  mesh.anchors = anchors.map(normalizeAnchor);
  mesh.folds = folds.map(normalizeFold);

  mesh.setAnchors = (items = []) => {
    mesh.anchors = items.map(normalizeAnchor);
    mesh.update(mesh.elapsed, true);
    return mesh;
  };
  mesh.addAnchor = (item) => {
    mesh.anchors.push(normalizeAnchor(item));
    mesh.update(mesh.elapsed, true);
    return mesh;
  };
  mesh.clearAnchors = () => {
    mesh.anchors = [];
    mesh.update(mesh.elapsed, true);
    return mesh;
  };
  mesh.setFolds = (items = []) => {
    mesh.folds = items.map(normalizeFold);
    mesh.update(mesh.elapsed, true);
    return mesh;
  };
  mesh.addFold = (item) => {
    mesh.folds.push(normalizeFold(item));
    mesh.update(mesh.elapsed, true);
    return mesh;
  };
  mesh.clearFolds = () => {
    mesh.folds = [];
    mesh.update(mesh.elapsed, true);
    return mesh;
  };

  mesh.update = (elapsed, force = false) => {
    baseUpdate(elapsed, true);
    applyPaperRig(mesh, mesh.anchors, mesh.folds);
  };

  mesh.update(mesh.elapsed, true);
  return mesh;
}

export function applyPaperRig(mesh, anchors = [], folds = []) {
  const { vertices, shadowVertices, baseVertices, columns, rows, width, height } = mesh;
  const stride = columns + 1;

  // Apply crease folds to the already animated/localized surface.
  for (const fold of folds) {
    const ax = fold.x1 * width, ay = fold.y1 * height;
    const bx = fold.x2 * width, by = fold.y2 * height;
    const lineX = bx - ax, lineY = by - ay;
    const lineLength = Math.hypot(lineX, lineY);
    if (lineLength < 0.001) continue;
    const tx = lineX / lineLength, ty = lineY / lineLength;
    const nx = -ty, ny = tx;
    const angle = fold.angle * Math.PI / 180;
    const contraction = 1 - Math.cos(angle);
    const lift = Math.sin(angle);

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const i = (row * stride + col) * 2;
        const px = vertices[i], py = vertices[i + 1];
        const rx = px - ax, ry = py - ay;
        const along = rx * tx + ry * ty;
        if (along < 0 || along > lineLength) continue;
        const signedDistance = rx * nx + ry * ny;
        if (fold.side === "positive" && signedDistance < 0) continue;
        if (fold.side === "negative" && signedDistance > 0) continue;
        const edge = Math.min(along / fold.endSoftness, (lineLength - along) / fold.endSoftness, 1);
        const envelope = smooth(edge) * fold.strength;
        const d = Math.abs(signedDistance);
        const direction = Math.sign(signedDistance) || 1;
        vertices[i] += nx * (-signedDistance * contraction * envelope + direction * d * lift * envelope * 0.18);
        vertices[i + 1] += ny * (-signedDistance * contraction * envelope + direction * d * lift * envelope * 0.18);
      }
    }
  }

  // Pin selected regions back toward their undeformed rest positions.
  for (const anchor of anchors) {
    const cx = anchor.u * width, cy = anchor.v * height;
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const i = (row * stride + col) * 2;
        const x = baseVertices[i], y = baseVertices[i + 1];
        const distance = Math.hypot(x - cx, y - cy);
        const t = Math.max(0, 1 - distance / anchor.radius);
        const weight = smooth(t) * anchor.strength;
        vertices[i] += (baseVertices[i] - vertices[i]) * weight;
        vertices[i + 1] += (baseVertices[i + 1] - vertices[i + 1]) * weight;
      }
    }
  }

  for (let i = 0; i < vertices.length; i += 2) {
    shadowVertices[i] = vertices[i] + 4;
    shadowVertices[i + 1] = vertices[i + 1] + 5;
  }
  mesh.mesh.vertices = vertices;
  mesh.shadowMesh.vertices = shadowVertices;
  return mesh;
}

function normalizeAnchor(item = {}) {
  return {
    u: clamp(Number(item.u ?? 0.2), 0, 1),
    v: clamp(Number(item.v ?? 0.5), 0, 1),
    radius: clamp(Number(item.radius ?? 18), 1, 120),
    strength: clamp(Number(item.strength ?? 1), 0, 1)
  };
}
function normalizeFold(item = {}) {
  return {
    x1: clamp(Number(item.x1 ?? 0.2), 0, 1),
    y1: clamp(Number(item.y1 ?? 0.5), 0, 1),
    x2: clamp(Number(item.x2 ?? 0.8), 0, 1),
    y2: clamp(Number(item.y2 ?? 0.5), 0, 1),
    angle: clamp(Number(item.angle ?? 25), -85, 85),
    strength: clamp(Number(item.strength ?? 1), 0, 1),
    side: item.side === "negative" ? "negative" : "positive",
    endSoftness: clamp(Number(item.endSoftness ?? 22), 1, 200)
  };
}
function smooth(t) { return t * t * (3 - 2 * t); }
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
