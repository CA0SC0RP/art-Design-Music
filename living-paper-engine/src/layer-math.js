/** Pure helpers for soft interaction between overlapping paper layers. */
export function layerFalloff(u, v, radius = 0.5) {
  const edge = Math.min(u, v, 1 - u, 1 - v);
  const t = clamp(edge / Math.max(0.001, radius), 0, 1);
  return t * t * (3 - 2 * t);
}

export function resolveLayerResponse(dx, dy, {
  coupling = 0.22,
  maxDisplacement = 18,
  contact = 0.35,
  weight = 1
} = {}) {
  const influence = clamp(coupling, 0, 1) * clamp(weight, 0, 1);
  const limit = Math.max(0, maxDisplacement);
  const x = clamp(dx * influence, -limit, limit);
  const y = clamp(dy * influence, -limit, limit);
  const pressure = clamp(Math.hypot(dx, dy) / Math.max(1, limit), 0, 1) * clamp(contact, 0, 1) * influence;
  return { x, y, pressure };
}

export function sampleDisplacement(vertices, baseVertices, columns, rows, u, v) {
  const gx = clamp(u, 0, 1) * columns;
  const gy = clamp(v, 0, 1) * rows;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const x1 = Math.min(columns, x0 + 1), y1 = Math.min(rows, y0 + 1);
  const tx = gx - x0, ty = gy - y0;
  const read = (x, y) => {
    const i = (y * (columns + 1) + x) * 2;
    return { x: vertices[i] - baseVertices[i], y: vertices[i + 1] - baseVertices[i + 1] };
  };
  const a = mix(read(x0, y0), read(x1, y0), tx);
  const b = mix(read(x0, y1), read(x1, y1), tx);
  return mix(a, b, ty);
}

function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min)); }
