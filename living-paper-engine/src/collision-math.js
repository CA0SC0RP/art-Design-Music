/** Bounded 2.5D contact constraint along a configurable separation axis. */
export function resolveContactConstraint(source, target, {
  normalX = 0,
  normalY = 1,
  minGap = 2,
  stiffness = 0.65,
  maxCorrection = 10,
  tangentRestGap = 0,
  friction = 0,
  maxTangentialCorrection = 4
} = {}) {
  const length = Math.hypot(normalX, normalY);
  if (length < 1e-8) throw new RangeError("El eje normal de contacto no puede ser cero.");
  const nx = normalX / length, ny = normalY / length;
  const gap = (target.x - source.x) * nx + (target.y - source.y) * ny;
  const penetration = Math.max(0, minGap - gap);
  const correction = Math.min(Math.max(0, maxCorrection), penetration * clamp(stiffness, 0, 1));
  const tangentX = -ny, tangentY = nx;
  const tangentGap = (target.x - source.x) * tangentX + (target.y - source.y) * tangentY;
  const slip = tangentGap - tangentRestGap;
  const frictionCorrection = clamp(-slip * clamp(friction, 0, 1), -Math.max(0, maxTangentialCorrection), Math.max(0, maxTangentialCorrection));
  return {
    gap,
    penetration,
    correction,
    tangentGap,
    slip,
    frictionCorrection,
    x: nx * correction + tangentX * frictionCorrection,
    y: ny * correction + tangentY * frictionCorrection,
    touching: penetration > 0
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
}

/** Bilinear sampling of a mesh vertex field at normalized UV coordinates. */
export function sampleMeshPoint(vertices, columns, rows, u, v) {
  const gx = clamp(u, 0, 1) * columns, gy = clamp(v, 0, 1) * rows;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const x1 = Math.min(columns, x0 + 1), y1 = Math.min(rows, y0 + 1);
  const tx = gx - x0, ty = gy - y0;
  const read = (x, y) => {
    const index = (y * (columns + 1) + x) * 2;
    return { x: vertices[index], y: vertices[index + 1] };
  };
  const a = mix(read(x0, y0), read(x1, y0), tx);
  const b = mix(read(x0, y1), read(x1, y1), tx);
  return mix(a, b, ty);
}
function mix(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
