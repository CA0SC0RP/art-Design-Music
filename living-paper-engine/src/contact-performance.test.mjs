import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { enableLayerInteraction } from "./layers.js";

function createGridMesh(id, resolution) {
  const width = 512, height = 512, columns = resolution, rows = resolution;
  const vertices = new Float32Array((columns + 1) * (rows + 1) * 2);
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      const i = (row * (columns + 1) + col) * 2;
      vertices[i] = col / columns * width;
      vertices[i + 1] = row / rows * height;
    }
  }
  const baseVertices = new Float32Array(vertices);
  const shadowVertices = new Float32Array(vertices.length);
  const mesh = { vertices, autoUpdate: true };
  const shadowMesh = { vertices: shadowVertices, alpha: 0.2, autoUpdate: true };
  return {
    id, width, height, columns, rows,
    shape: [[0,0],[1,0],[1,1],[0,1]],
    baseVertices, vertices, shadowVertices, mesh, shadowMesh,
    container: {
      position: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, pivot: { x: 0, y: 0 },
      rotation: 0, parent: null
    },
    elapsed: 0,
    update(elapsed) {
      this.elapsed = elapsed;
      this.vertices.set(this.baseVertices);
      this.shadowVertices.set(this.baseVertices);
      this.mesh.vertices = this.vertices;
      this.shadowMesh.vertices = this.shadowVertices;
    }
  };
}

for (const resolution of [32, 64, 128]) {
  test(`rendimiento del contacto con malla ${resolution}×${resolution}`, () => {
    const source = createGridMesh("source", resolution);
    const target = createGridMesh("target", resolution);
    const engine = {
      paused: false,
      elapsed: 0,
      update(dt) {
        this.elapsed += dt;
        source.update(this.elapsed);
        target.update(this.elapsed);
      }
    };
    enableLayerInteraction(engine, [{
      source, target, coupling: 0, clearance: 0, contactGap: 2,
      contactRange: 1, contactStiffness: 0.35, maxCorrection: 1.5
    }]);

    const frameCount = 3;
    const start = performance.now();
    for (let frame = 0; frame < frameCount; frame++) engine.update(1 / 60);
    const elapsedMs = (performance.now() - start) / frameCount;
    const stats = engine.layerInteractions[0].lastContact;
    const triangleCount = stats.sourceTriangles;
    const vertexCandidateRatio = stats.candidateTriangles /
      Math.max(1, stats.testedVertices * triangleCount);
    const edgeCandidateRatio = stats.edgeCandidateTriangles /
      Math.max(1, stats.testedEdges * triangleCount);
    const maxDisplacement = target.vertices.reduce((max, value, index) =>
      Math.max(max, Math.abs(value - target.baseVertices[index])), 0);

    assert.equal(triangleCount, resolution * resolution * 2);
    // pointInPolygon intentionally excludes the exact silhouette boundary, so only interior vertices are tested.
    assert.equal(stats.testedVertices, resolution ** 2);
    assert.ok(stats.testedEdges + stats.skippedResolvedEdges > resolution * resolution * 2);
    assert.ok(stats.indexedCells > 0);
    assert.ok(vertexCandidateRatio < 0.1, `búsqueda de vértices demasiado amplia: ${vertexCandidateRatio}`);
    assert.ok(edgeCandidateRatio < 0.1, `búsqueda de aristas demasiado amplia: ${edgeCandidateRatio}`);
    assert.ok(Number.isFinite(elapsedMs) && elapsedMs > 0);
    assert.ok(Number.isFinite(maxDisplacement) && maxDisplacement < 4);

    console.log(JSON.stringify({
      benchmark: "layer-contact",
      resolution: `${resolution}x${resolution}`,
      vertices: stats.testedVertices,
      edges: stats.testedEdges,
      triangles: triangleCount,
      indexedCells: stats.indexedCells,
      avgVertexCandidates: Number((stats.candidateTriangles / stats.testedVertices).toFixed(2)),
      avgEdgeCandidates: Number((stats.edgeCandidateTriangles / stats.testedEdges).toFixed(2)),
      vertexCandidateRatio: Number(vertexCandidateRatio.toFixed(5)),
      edgeCandidateRatio: Number(edgeCandidateRatio.toFixed(5)),
      averageFrameMs: Number(elapsedMs.toFixed(2)),
      maxDisplacement: Number(maxDisplacement.toFixed(3))
    }));
  });
}
