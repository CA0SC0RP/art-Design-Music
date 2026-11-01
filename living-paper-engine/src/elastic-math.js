export function elasticTarget(u, v, { curvature = 16, axis = 90, bias = 0.18 } = {}) {
  const profile = Math.sin(Math.PI * clamp(u, 0, 1)) * Math.sin(Math.PI * clamp(v, 0, 1));
  const asymmetry = 1 + (clamp(u, 0, 1) - 0.5) * clamp(bias, -0.8, 0.8) * 2;
  const radians = Number(axis) * Math.PI / 180;
  const displacement = clamp(Number(curvature), -36, 36) * profile * asymmetry;
  return { x: Math.cos(radians) * displacement, y: Math.sin(radians) * displacement, profile };
}

export function springStep(position, velocity, target, { stiffness = 18, damping = 7, dt = 1 / 60 } = {}) {
  const safeDt = clamp(dt, 0, 0.05);
  const k = clamp(Number(stiffness), 1, 60);
  const c = clamp(Number(damping), 0, 24);
  const acceleration = (Number(target) - Number(position)) * k - Number(velocity) * c;
  const nextVelocity = Number(velocity) + acceleration * safeDt;
  return { position: Number(position) + nextVelocity * safeDt, velocity: nextVelocity };
}

export function anchorMobility(u, v, anchors = []) {
  let mobility = 1;
  for (const anchor of anchors) {
    const du = u - anchor.u, dv = v - anchor.v;
    const distance = Math.hypot(du, dv) * 100;
    const radius = Math.max(1, Number(anchor.radius) || 1);
    const t = Math.max(0, Math.min(1, 1 - distance / radius));
    const weight = t * t * (3 - 2 * t) * Math.max(0, Math.min(1, Number(anchor.strength) || 0));
    mobility *= 1 - weight;
  }
  return mobility;
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
