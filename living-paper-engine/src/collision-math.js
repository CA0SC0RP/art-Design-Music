/** Geometry helpers for contact between independently shaped 2D paper meshes. */

export function resolveContactConstraint(source, target, {
  normalX = 0, normalY = 1, minGap = 2, stiffness = 0.65,
  maxCorrection = 10, tangentRestGap = 0, friction = 0,
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
    gap, penetration, correction, tangentGap, slip, frictionCorrection,
    x: nx * correction + tangentX * frictionCorrection,
    y: ny * correction + tangentY * frictionCorrection,
    touching: penetration > 0
  };
}

export function composeWorldTransform(container) {
  const chain = [];
  for (let node = container; node; node = node.parent) chain.push(node);
  let world = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  for (let i = chain.length - 1; i >= 0; i--) {
    const node = chain[i], position = node.position || { x: 0, y: 0 };
    const scale = node.scale || { x: 1, y: 1 };
    const pivot = node.pivot || { x: 0, y: 0 };
    const rotation = Number(node.rotation || 0), cos = Math.cos(rotation), sin = Math.sin(rotation);
    const a = cos * (scale.x ?? 1), b = sin * (scale.x ?? 1);
    const c = -sin * (scale.y ?? 1), d = cos * (scale.y ?? 1);
    const local = {
      a, b, c, d,
      tx: (position.x || 0) - pivot.x * a - pivot.y * c,
      ty: (position.y || 0) - pivot.x * b - pivot.y * d
    };
    world = multiplyAffine(world, local);
  }
  return world;
}

export function transformPoint(matrix, point) {
  return { x: matrix.a * point.x + matrix.c * point.y + matrix.tx, y: matrix.b * point.x + matrix.d * point.y + matrix.ty };
}

export function transformVector(matrix, vector) {
  return { x: matrix.a * vector.x + matrix.c * vector.y, y: matrix.b * vector.x + matrix.d * vector.y };
}

export function inverseTransformVector(matrix, vector) {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (Math.abs(determinant) < 1e-10) return { x: 0, y: 0 };
  return {
    x: (matrix.d * vector.x - matrix.c * vector.y) / determinant,
    y: (-matrix.b * vector.x + matrix.a * vector.y) / determinant
  };
}

export function pointInPolygon(x, y, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return true;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Build transformed triangles; cells outside the source silhouette are discarded. */
export function buildMeshTriangles(mesh, matrix = composeWorldTransform(mesh.container)) {
  const { vertices, columns, rows } = mesh, triangles = [];
  const shape = mesh.shape;
  const point = index => transformPoint(matrix, { x: vertices[index * 2], y: vertices[index * 2 + 1] });
  const inside = p => !shape || pointInPolygon(p.x / mesh.width, p.y / mesh.height, shape);
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
    const a = y * (columns + 1) + x, b = a + 1, d = (y + 1) * (columns + 1) + x, e = d + 1;
    for (const ids of [[a, b, d], [b, e, d]]) {
      const p0 = point(ids[0]), p1 = point(ids[1]), p2 = point(ids[2]);
      const localCentroid = {
        x: (vertices[ids[0] * 2] + vertices[ids[1] * 2] + vertices[ids[2] * 2]) / 3,
        y: (vertices[ids[0] * 2 + 1] + vertices[ids[1] * 2 + 1] + vertices[ids[2] * 2 + 1]) / 3
      };
      if (!inside(localCentroid)) continue;
      triangles.push({ a: p0, b: p1, c: p2, minX: Math.min(p0.x,p1.x,p2.x), maxX: Math.max(p0.x,p1.x,p2.x), minY: Math.min(p0.y,p1.y,p2.y), maxY: Math.max(p0.y,p1.y,p2.y) });
    }
  }
  return triangles;
}

/**
 * Build a uniform-grid broadphase for transformed triangles.
 * The returned index is rebuilt per contact pass because the source mesh moves.
 */
export function buildTriangleSpatialIndex(triangles, cellSize = 64) {
  const size = Math.max(1, Number.isFinite(cellSize) ? cellSize : 64);
  const cells = new Map();
  for (const triangle of triangles) {
    const minCellX = Math.floor(triangle.minX / size), maxCellX = Math.floor(triangle.maxX / size);
    const minCellY = Math.floor(triangle.minY / size), maxCellY = Math.floor(triangle.maxY / size);
    for (let y = minCellY; y <= maxCellY; y++) {
      for (let x = minCellX; x <= maxCellX; x++) {
        const key = `${x},${y}`;
        let bucket = cells.get(key);
        if (!bucket) cells.set(key, bucket = []);
        bucket.push(triangle);
      }
    }
  }
  return { cellSize: size, cells, triangleCount: triangles.length };
}

/** Return unique triangles whose bounds overlap a world-space query rectangle. */
export function queryTriangleSpatialIndex(index, bounds, epsilon = 1e-7) {
  const size = index.cellSize;
  const minCellX = Math.floor(bounds.minX / size), maxCellX = Math.floor(bounds.maxX / size);
  const minCellY = Math.floor(bounds.minY / size), maxCellY = Math.floor(bounds.maxY / size);
  const found = new Set();
  for (let y = minCellY; y <= maxCellY; y++) {
    for (let x = minCellX; x <= maxCellX; x++) {
      const bucket = index.cells.get(`${x},${y}`);
      if (!bucket) continue;
      for (const triangle of bucket) {
        if (triangle.maxX < bounds.minX - epsilon || triangle.minX > bounds.maxX + epsilon ||
            triangle.maxY < bounds.minY - epsilon || triangle.minY > bounds.maxY + epsilon) continue;
        found.add(triangle);
      }
    }
  }
  return [...found];
}

export function closestPointOnMesh(point, triangles, maxDistance = Infinity) {
  let best = null, bestDistanceSq = maxDistance * maxDistance;
  for (const triangle of triangles) {
    const dx = point.x < triangle.minX ? triangle.minX - point.x : point.x > triangle.maxX ? point.x - triangle.maxX : 0;
    const dy = point.y < triangle.minY ? triangle.minY - point.y : point.y > triangle.maxY ? point.y - triangle.maxY : 0;
    if (dx * dx + dy * dy > bestDistanceSq) continue;
    const candidate = closestPointOnTriangle(point, triangle.a, triangle.b, triangle.c);
    const distanceSq = (point.x - candidate.x) ** 2 + (point.y - candidate.y) ** 2;
    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      best = { ...candidate, distance: Math.sqrt(distanceSq) };
    }
  }
  return best;
}

function closestPointOnTriangle(p, a, b, c) {
  const ab = sub(b,a), ac = sub(c,a), ap = sub(p,a);
  // Folded or collapsed meshes can produce zero-area triangles; fall back to their edges.
  if (Math.abs(cross(ab, ac)) < 1e-10) {
    const candidates = [
      closestPointOnSegment(p, a, b),
      closestPointOnSegment(p, b, c),
      closestPointOnSegment(p, c, a)
    ];
    return candidates.reduce((best, point) =>
      squaredDistance(p, point) < squaredDistance(p, best) ? point : best
    );
  }
  const d1 = dot(ab,ap), d2 = dot(ac,ap);
  if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p,b), d3 = dot(ab,bp), d4 = dot(ac,bp);
  if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1*d4-d3*d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) return add(a,scale(ab,d1/(d1-d3)));
  const cp = sub(p,c), d5 = dot(ab,cp), d6 = dot(ac,cp);
  if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5*d2-d1*d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) return add(a,scale(ac,d2/(d2-d6)));
  const va = d3*d6-d5*d4;
  if (va <= 0 && d4-d3 >= 0 && d5-d6 >= 0) return add(b,scale(sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))));
  const denominator = 1/(va+vb+vc), v = vb*denominator, w = vc*denominator;
  return add(a,add(scale(ab,v),scale(ac,w)));
}

export function sampleMeshPoint(vertices, columns, rows, u, v) {
  const gx = clamp(u, 0, 1) * columns, gy = clamp(v, 0, 1) * rows;
  const x0 = Math.floor(gx), y0 = Math.floor(gy), x1 = Math.min(columns, x0 + 1), y1 = Math.min(rows, y0 + 1);
  const tx = gx - x0, ty = gy - y0;
  const read = (x, y) => { const i = (y * (columns + 1) + x) * 2; return { x: vertices[i], y: vertices[i + 1] }; };
  return mix(mix(read(x0,y0),read(x1,y0),tx),mix(read(x0,y1),read(x1,y1),tx),ty);
}

function multiplyAffine(p, q) {
  return { a:p.a*q.a+p.c*q.b, b:p.b*q.a+p.d*q.b, c:p.a*q.c+p.c*q.d, d:p.b*q.c+p.d*q.d, tx:p.a*q.tx+p.c*q.ty+p.tx, ty:p.b*q.tx+p.d*q.ty+p.ty };
}
function closestPointOnSegment(p, a, b) {
  const ab = sub(b, a), lengthSq = dot(ab, ab);
  if (lengthSq < 1e-12) return a;
  const t = clamp(dot(sub(p, a), ab) / lengthSq, 0, 1);
  return add(a, scale(ab, t));
}
function squaredDistance(a, b) { return (a.x - b.x) ** 2 + (a.y - b.y) ** 2; }
function sub(a,b){return{x:a.x-b.x,y:a.y-b.y};}
function add(a,b){return{x:a.x+b.x,y:a.y+b.y};}
function scale(a,s){return{x:a.x*s,y:a.y*s};}
function dot(a,b){return a.x*b.x+a.y*b.y;}
function mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
function clamp(value,min,max){return Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):min));}

/** Return robust segment/triangle boundary crossings in world coordinates. */
export function segmentTriangleContacts(start, end, triangles, epsilon = 1e-7) {
  const contacts = [];
  const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
  for (const triangle of triangles) {
    if (maxX < triangle.minX - epsilon || minX > triangle.maxX + epsilon ||
        maxY < triangle.minY - epsilon || minY > triangle.maxY + epsilon) continue;
    const edges = [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]];
    for (const [a, b] of edges) {
      for (const hit of segmentSegmentIntersections(start, end, a, b, epsilon)) {
        if (!contacts.some(item => Math.abs(item.t - hit.t) < 1e-5 &&
            Math.hypot(item.point.x - hit.point.x, item.point.y - hit.point.y) < 1e-4)) {
          contacts.push({ ...hit, triangle });
        }
      }
    }
  }
  return contacts.sort((a, b) => a.t - b.t);
}

/** Return the first intersection for callers that need a single point. */
export function segmentSegmentIntersection(a, b, c, d, epsilon = 1e-7) {
  return segmentSegmentIntersections(a, b, c, d, epsilon)[0] || null;
}

/** Handles ordinary crossings, endpoint touches, and collinear overlapping segments. */
function segmentSegmentIntersections(a, b, c, d, epsilon = 1e-7) {
  const r = sub(b, a), s = sub(d, c), q = sub(c, a);
  const denominator = cross(r, s), qCrossR = cross(q, r);
  const rr = dot(r, r), ss = dot(s, s);

  if (rr <= epsilon * epsilon && ss <= epsilon * epsilon) {
    return Math.hypot(a.x - c.x, a.y - c.y) <= epsilon
      ? [{ t: 0, edgeT: 0, point: { x: a.x, y: a.y } }]
      : [];
  }
  if (rr <= epsilon * epsilon) {
    const u = ss ? dot(sub(a, c), s) / ss : 0;
    const projected = { x: c.x + s.x * u, y: c.y + s.y * u };
    return u >= -epsilon && u <= 1 + epsilon &&
      Math.hypot(projected.x - a.x, projected.y - a.y) <= epsilon
      ? [{ t: 0, edgeT: clamp(u, 0, 1), point: { x: a.x, y: a.y } }]
      : [];
  }
  if (ss <= epsilon * epsilon) {
    const t = dot(q, r) / rr;
    const projected = { x: a.x + r.x * t, y: a.y + r.y * t };
    return t >= -epsilon && t <= 1 + epsilon &&
      Math.hypot(projected.x - c.x, projected.y - c.y) <= epsilon
      ? [{ t: clamp(t, 0, 1), edgeT: 0, point: { x: c.x, y: c.y } }]
      : [];
  }

  if (Math.abs(denominator) <= epsilon) {
    if (Math.abs(qCrossR) > epsilon) return [];
    const t0 = dot(q, r) / rr, t1 = t0 + dot(s, r) / rr;
    const overlapStart = Math.max(0, Math.min(t0, t1));
    const overlapEnd = Math.min(1, Math.max(t0, t1));
    if (overlapEnd < overlapStart - epsilon) return [];
    const parameters = Math.abs(overlapEnd - overlapStart) <= epsilon
      ? [(overlapStart + overlapEnd) / 2]
      : [overlapStart, overlapEnd];
    return parameters.map(t => {
      const point = { x: a.x + r.x * t, y: a.y + r.y * t };
      return { t: clamp(t, 0, 1), edgeT: clamp(dot(sub(point, c), s) / ss, 0, 1), point };
    });
  }

  const t = cross(q, s) / denominator, u = cross(q, r) / denominator;
  if (t < -epsilon || t > 1 + epsilon || u < -epsilon || u > 1 + epsilon) return [];
  const boundedT = clamp(t, 0, 1);
  return [{
    t: boundedT, edgeT: clamp(u, 0, 1),
    point: { x: a.x + r.x * boundedT, y: a.y + r.y * boundedT }
  }];
}

function cross(a, b) { return a.x * b.y - a.y * b.x; }
