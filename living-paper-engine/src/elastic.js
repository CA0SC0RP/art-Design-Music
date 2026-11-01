import { elasticTarget, springStep, anchorMobility } from "./elastic-math.js";

/**
 * Adds a damped elastic surface response on top of the existing mesh rig.
 * The spring state persists between frames, creating material memory and recovery.
 */
export function enableElasticCurvature(mesh, {
  curvature = 0, axis = 90, stiffness = 18, damping = 7, bias = 0.18
} = {}) {
  if (!mesh?.mesh || !mesh?.shadowMesh || !mesh?.vertices || !mesh?.baseVertices) {
    throw new TypeError("enableElasticCurvature requiere una PaperMesh.");
  }
  const count = mesh.vertices.length;
  const offsetX = new Float32Array(count / 2);
  const offsetY = new Float32Array(count / 2);
  const velocityX = new Float32Array(count / 2);
  const velocityY = new Float32Array(count / 2);
  const settings = { curvature: clamp(curvature, -36, 36), axis: clamp(axis, 0, 360), stiffness: clamp(stiffness, 1, 60), damping: clamp(damping, 0, 24), bias: clamp(bias, -0.8, 0.8) };
  const originalUpdate = mesh.update.bind(mesh);
  let lastElapsed = null;

  const update = (elapsed, force = false) => {
    originalUpdate(elapsed, true);
    const dt = lastElapsed === null ? 1 / 60 : clamp(elapsed - lastElapsed, 0, 0.05);
    lastElapsed = elapsed;
    for (let row = 0; row <= mesh.rows; row++) {
      for (let col = 0; col <= mesh.columns; col++) {
        const vertexIndex = row * (mesh.columns + 1) + col;
        const i = vertexIndex * 2;
        const u = col / mesh.columns, v = row / mesh.rows;
        const target = elasticTarget(u, v, settings);
        const mobility = anchorMobility(u, v, mesh.anchors || []);
        const sx = springStep(offsetX[vertexIndex], velocityX[vertexIndex], target.x * mobility, { stiffness: settings.stiffness, damping: settings.damping, dt });
        const sy = springStep(offsetY[vertexIndex], velocityY[vertexIndex], target.y * mobility, { stiffness: settings.stiffness, damping: settings.damping, dt });
        offsetX[vertexIndex] = sx.position;
        velocityX[vertexIndex] = sx.velocity;
        offsetY[vertexIndex] = sy.position;
        velocityY[vertexIndex] = sy.velocity;
        mesh.vertices[i] += sx.position;
        mesh.vertices[i + 1] += sy.position;
        mesh.shadowVertices[i] = mesh.vertices[i] + 4;
        mesh.shadowVertices[i + 1] = mesh.vertices[i + 1] + 5;
      }
    }
    mesh.mesh.vertices = mesh.vertices;
    mesh.shadowMesh.vertices = mesh.shadowVertices;
  };
  mesh.update = update;
  mesh.setElasticCurvature = (options = {}) => {
    for (const key of ["curvature", "axis", "stiffness", "damping", "bias"]) {
      if (options[key] !== undefined) {
        const limits = { curvature: [-36,36], axis: [0,360], stiffness: [1,60], damping: [0,24], bias: [-0.8,0.8] }[key];
        settings[key] = clamp(Number(options[key]), limits[0], limits[1]);
      }
    }
    return mesh;
  };
  mesh.getElasticSettings = () => ({ ...settings });
  mesh.resetElasticMemory = () => {
    offsetX.fill(0); offsetY.fill(0); velocityX.fill(0); velocityY.fill(0);
    lastElapsed = null;
    mesh.update(mesh.elapsed, true);
    return mesh;
  };
  mesh.update(mesh.elapsed || 0, true);
  return mesh;
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
