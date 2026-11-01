export function createPhysicsMeshProxy(visualMesh, { columns = 24, rows = 24 } = {}) {
  validate(visualMesh);
  columns = resolution(columns); rows = resolution(rows);
  const proxy = {
    id: `${visualMesh.id || "paper"}-physics`,
    width: visualMesh.width, height: visualMesh.height, shape: visualMesh.shape,
    columns, rows, container: visualMesh.container,
    vertices: new Float32Array((columns + 1) * (rows + 1) * 2),
    baseVertices: new Float32Array((columns + 1) * (rows + 1) * 2),
    shadowVertices: new Float32Array((columns + 1) * (rows + 1) * 2),
    visualBaseVertices: new Float32Array(visualMesh.vertices.length),
    mesh: {}, shadowMesh: { alpha: visualMesh.shadowMesh.alpha },
    refreshFromVisual, applyToVisual
  };
  proxy.mesh.vertices = proxy.vertices;
  proxy.shadowMesh.vertices = proxy.shadowVertices;
  refreshFromVisual();
  return proxy;

  function refreshFromVisual() {
    proxy.visualBaseVertices.set(visualMesh.vertices);
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
      const i = (y * (columns + 1) + x) * 2;
      const p = sampleGrid(visualMesh.vertices, visualMesh.columns, visualMesh.rows, x / columns, y / rows);
      proxy.vertices[i] = proxy.baseVertices[i] = p.x;
      proxy.vertices[i + 1] = proxy.baseVertices[i + 1] = p.y;
      proxy.shadowVertices[i] = p.x + 4;
      proxy.shadowVertices[i + 1] = p.y + 5;
    }
    return proxy;
  }

  function applyToVisual() {
    for (let y = 0; y <= visualMesh.rows; y++) for (let x = 0; x <= visualMesh.columns; x++) {
      const u = x / visualMesh.columns, v = y / visualMesh.rows;
      const i = (y * (visualMesh.columns + 1) + x) * 2;
      const now = sampleGrid(proxy.vertices, columns, rows, u, v);
      const base = sampleGrid(proxy.baseVertices, columns, rows, u, v);
      visualMesh.vertices[i] = proxy.visualBaseVertices[i] + now.x - base.x;
      visualMesh.vertices[i + 1] = proxy.visualBaseVertices[i + 1] + now.y - base.y;
      visualMesh.shadowVertices[i] = visualMesh.vertices[i] + 4;
      visualMesh.shadowVertices[i + 1] = visualMesh.vertices[i + 1] + 5;
    }
    visualMesh.mesh.vertices = visualMesh.vertices;
    visualMesh.shadowMesh.vertices = visualMesh.shadowVertices;
    return visualMesh;
  }
}

export function sampleGrid(vertices, columns, rows, u, v) {
  const gx = clamp(u, 0, 1) * columns, gy = clamp(v, 0, 1) * rows;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const x1 = Math.min(columns, x0 + 1), y1 = Math.min(rows, y0 + 1);
  const tx = gx - x0, ty = gy - y0;
  const at = (x, y) => {
    const i = (y * (columns + 1) + x) * 2;
    return { x: vertices[i], y: vertices[i + 1] };
  };
  const a = mix(at(x0, y0), at(x1, y0), tx);
  const b = mix(at(x0, y1), at(x1, y1), tx);
  return mix(a, b, ty);
}
function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function resolution(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < 2 || n > 256) throw new RangeError("Resolución física fuera de rango (2–256).");
  return n;
}
function validate(m) {
  if (!m?.vertices || !m?.shadowVertices || !m?.mesh || !m?.shadowMesh ||
      !m?.container || !Number.isInteger(m.columns) || !Number.isInteger(m.rows)) {
    throw new TypeError("Se requiere una PaperMesh visual válida.");
  }
}