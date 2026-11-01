import test from "node:test";
import assert from "node:assert/strict";
import { resolveContactConstraint } from "./collision-math.js";

test("la fricción tangencial se opone al deslizamiento relativo", () => {
  const result = resolveContactConstraint(
    { x: 0, y: 0 }, { x: 8, y: 0 },
    { normalX: 0, normalY: 1, minGap: 0, friction: 0.5, maxTangentialCorrection: 6 }
  );
  assert.ok(result.frictionCorrection > 0);
  assert.ok(result.x < 0);
  assert.ok(Math.abs(result.x) <= 6);
});

test("la corrección tangencial respeta su límite máximo", () => {
  const result = resolveContactConstraint(
    { x: 0, y: 0 }, { x: 100, y: 0 },
    { normalX: 0, normalY: 1, minGap: 0, friction: 1, maxTangentialCorrection: 2 }
  );
  assert.equal(result.frictionCorrection, 2);
  assert.equal(result.x, -2);
});

test("con fricción desactivada no se altera el desplazamiento tangencial", () => {
  const result = resolveContactConstraint(
    { x: 0, y: 0 }, { x: 8, y: 0 },
    { normalX: 0, normalY: 1, minGap: 0, friction: 0 }
  );
  assert.equal(result.frictionCorrection, 0);
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
});
