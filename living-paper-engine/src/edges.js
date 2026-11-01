import { Graphics } from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.1/+esm";
import { foldEdgeProfile } from "./edge-math.js";

/**
 * Draws a small exposed paper edge along each crease.
 * This is a 2.5D visual treatment, not a physical thickness simulation.
 */
export function enablePaperEdges(mesh, { thickness = 5, intensity = 0.72 } = {}) {
  if (!mesh?.container || !mesh?.vertices || !mesh?.folds) {
    throw new TypeError("enablePaperEdges requiere una PaperMesh con PaperRig.");
  }
  const graphic = new Graphics();
  mesh.container.addChild(graphic);
  const settings = {
    thickness: clamp(Number(thickness), 0, 14),
    intensity: clamp(Number(intensity), 0, 1)
  };

  const render = () => {
    graphic.clear();
    for (const fold of mesh.folds) {
      const profile = foldEdgeProfile(fold, settings);
      if (profile.active < 0.01 || profile.depth < 0.15) continue;
      const a = sampleMesh(mesh, fold.x1, fold.y1);
      const b = sampleMesh(mesh, fold.x2, fold.y2);
      const dx = b.x - a.x, dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      if (length < 0.5) continue;
      const nx = (-dy / length) * profile.side;
      const ny = (dx / length) * profile.side;
      const offset = profile.depth;
      const p1 = [a.x, a.y], p2 = [b.x, b.y];
      const q1 = [b.x + nx * offset, b.y + ny * offset];
      const q2 = [a.x + nx * offset, a.y + ny * offset];

      graphic.poly(flat([
        [p1[0] + 2, p1[1] + 3],
        [p2[0] + 2, p2[1] + 3],
        [q1[0] + 2, q1[1] + 3],
        [q2[0] + 2, q2[1] + 3]
      ])).fill({ color: 0x17201c, alpha: profile.shadowAlpha });

      graphic.poly(flat([p1, p2, q1, q2]))
        .fill({ color: 0xc9bda2, alpha: profile.edgeAlpha });

      graphic.moveTo(q2[0], q2[1]).lineTo(q1[0], q1[1])
        .stroke({ color: 0xfff5dc, width: Math.max(0.7, offset * 0.18), alpha: profile.highlightAlpha });
    }
  };

  const previousUpdate = mesh.update.bind(mesh);
  mesh.update = (elapsed, force = false) => {
    previousUpdate(elapsed, true);
    render();
  };
  mesh.setPaperEdge = (options = {}) => {
    if (options.thickness !== undefined) settings.thickness = clamp(Number(options.thickness), 0, 14);
    if (options.intensity !== undefined) settings.intensity = clamp(Number(options.intensity), 0, 1);
    render();
    return mesh;
  };
  mesh.destroyPaperEdges = () => {
    mesh.container.removeChild(graphic);
    graphic.destroy();
  };
  render();
  return mesh;
}

function sampleMesh(mesh, u, v) {
  const gx = clamp(u, 0, 1) * mesh.columns;
  const gy = clamp(v, 0, 1) * mesh.rows;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const x1 = Math.min(mesh.columns, x0 + 1), y1 = Math.min(mesh.rows, y0 + 1);
  const tx = gx - x0, ty = gy - y0;
  const p00 = vertex(mesh, x0, y0), p10 = vertex(mesh, x1, y0);
  const p01 = vertex(mesh, x0, y1), p11 = vertex(mesh, x1, y1);
  const top = mixPoint(p00, p10, tx), bottom = mixPoint(p01, p11, tx);
  return mixPoint(top, bottom, ty);
}
function vertex(mesh, x, y) {
  const index = (y * (mesh.columns + 1) + x) * 2;
  return { x: mesh.vertices[index], y: mesh.vertices[index + 1] };
}
function mixPoint(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
function flat(points) { return points.flatMap(([x, y]) => [x, y]); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
