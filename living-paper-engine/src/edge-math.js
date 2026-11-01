export function foldEdgeProfile(fold, { thickness = 5, intensity = 0.72 } = {}) {
  const angle = Math.abs(Number(fold?.angle) || 0);
  const strength = clamp(Number(fold?.strength ?? 1), 0, 1);
  const active = clamp(Number(intensity), 0, 1) * strength * Math.min(1, angle / 24);
  const depth = clamp(Number(thickness), 0, 14) * (0.25 + Math.sin(angle * Math.PI / 180) * 0.75);
  return {
    side: fold?.side === "negative" ? -1 : 1,
    depth,
    shadowAlpha: 0.42 * active,
    edgeAlpha: 0.9 * active,
    highlightAlpha: 0.55 * active,
    active
  };
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
