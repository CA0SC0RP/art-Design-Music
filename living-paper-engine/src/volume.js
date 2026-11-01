import { MeshSimple, Texture } from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.1/+esm";

/**
 * Adds a mapped light/shadow overlay that follows the deformed paper mesh.
 * It creates apparent fold volume, not real 3D geometry.
 */
export function enableFoldVolume(mesh, { intensity = 0.72, width = 34, resolution = 512 } = {}) {
  if (!mesh?.container || !mesh?.mesh || !mesh?.vertices || !mesh?.folds) {
    throw new TypeError("enableFoldVolume requiere una malla con PaperRig activo.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const context = canvas.getContext("2d");
  const texture = Texture.from(canvas);
  const uvs = [];
  const indices = [];
  for (let y = 0; y <= mesh.rows; y++) {
    for (let x = 0; x <= mesh.columns; x++) uvs.push(x / mesh.columns, y / mesh.rows);
  }
  for (let y = 0; y < mesh.rows; y++) {
    for (let x = 0; x < mesh.columns; x++) {
      const a = y * (mesh.columns + 1) + x, b = a + 1;
      const d = (y + 1) * (mesh.columns + 1) + x, e = d + 1;
      indices.push(a, b, d, b, e, d);
    }
  }
  const overlay = new MeshSimple({ texture, vertices: mesh.vertices, uvs: new Float32Array(uvs), indices: new Uint32Array(indices) });
  overlay.alpha = 1;
  mesh.container.addChild(overlay);

  const settings = { intensity: clamp(intensity, 0, 1), width: clamp(width, 8, 90) };
  let signature = "";
  const redraw = () => {
    const next = JSON.stringify([settings.intensity, settings.width, mesh.folds.map(f => [f.x1,f.y1,f.x2,f.y2,f.angle,f.strength,f.side])]);
    if (next === signature) return;
    signature = next;
    context.clearRect(0, 0, resolution, resolution);
    for (const fold of mesh.folds) {
      const x1 = fold.x1 * resolution, y1 = fold.y1 * resolution;
      const x2 = fold.x2 * resolution, y2 = fold.y2 * resolution;
      const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
      if (length < 1) continue;
      const nx = -dy / length, ny = dx / length;
      const sign = fold.side === "negative" ? -1 : 1;
      const half = settings.width * (0.55 + Math.abs(fold.angle) / 100);
      const extent = half * 2.8;
      const strength = settings.intensity * fold.strength * Math.min(1, Math.abs(fold.angle) / 28);
      if (strength < 0.005) continue;
      const gradient = context.createLinearGradient(
        x1 - nx * half * sign, y1 - ny * half * sign,
        x1 + nx * half * sign, y1 + ny * half * sign
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.34, `rgba(20,27,24,${0.32 * strength})`);
      gradient.addColorStop(0.47, `rgba(12,18,16,${0.48 * strength})`);
      gradient.addColorStop(0.53, `rgba(255,255,245,${0.52 * strength})`);
      gradient.addColorStop(0.68, `rgba(255,255,245,${0.16 * strength})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(x1 - nx * extent, y1 - ny * extent);
      context.lineTo(x2 - nx * extent, y2 - ny * extent);
      context.lineTo(x2 + nx * extent, y2 + ny * extent);
      context.lineTo(x1 + nx * extent, y1 + ny * extent);
      context.closePath();
      context.fill();
    }
    texture.source.update();
  };
  const originalUpdate = mesh.update.bind(mesh);
  mesh.update = (elapsed, force = false) => {
    originalUpdate(elapsed, true);
    overlay.vertices = mesh.vertices;
    redraw();
  };
  mesh.setFoldVolume = (options = {}) => {
    if (options.intensity !== undefined) settings.intensity = clamp(Number(options.intensity), 0, 1);
    if (options.width !== undefined) settings.width = clamp(Number(options.width), 8, 90);
    signature = "";
    redraw();
    return mesh;
  };
  mesh.destroyFoldVolume = () => {
    mesh.container.removeChild(overlay);
    overlay.destroy();
    texture.destroy(true);
  };
  redraw();
  return mesh;
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
