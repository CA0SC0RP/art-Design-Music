export function foldVolumeProfile(fold, intensity = 0.72, width = 34) {
  const angle = Math.abs(Number(fold?.angle) || 0);
  const strength = clamp(Number(fold?.strength ?? 1), 0, 1);
  const level = clamp(Number(intensity), 0, 1) * strength * Math.min(1, angle / 28);
  return {
    direction: fold?.side === "negative" ? -1 : 1,
    halfWidth: clamp(Number(width), 8, 90) * (0.55 + angle / 100),
    shadowAlpha: 0.48 * level,
    highlightAlpha: 0.52 * level,
    strength: level
  };
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
