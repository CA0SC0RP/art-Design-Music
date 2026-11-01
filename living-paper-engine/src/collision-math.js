/** Bounded 2.5D contact constraint along a configurable separation axis. */
export function resolveContactConstraint(source, target, {
  normalX = 0,
  normalY = 1,
  minGap = 2,
  stiffness = 0.65,
  maxCorrection = 10
} = {}) {
  const length = Math.hypot(normalX, normalY);
  if (length < 1e-8) throw new RangeError("El eje normal de contacto no puede ser cero.");
  const nx = normalX / length, ny = normalY / length;
  const gap = (target.x - source.x) * nx + (target.y - source.y) * ny;
  const penetration = Math.max(0, minGap - gap);
  const correction = Math.min(Math.max(0, maxCorrection), penetration * clamp(stiffness, 0, 1));
  return {
    gap,
    penetration,
    correction,
    x: nx * correction,
    y: ny * correction,
    touching: penetration > 0
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
}
