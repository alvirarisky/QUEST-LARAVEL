import test from "node:test";
import assert from "node:assert/strict";
import { coverView } from "../src/scene-layout";
import { places } from "../src/story";
test("Cover projection fills every viewport without stretching the original scene", () => {
  for (const [w, h] of [
    [1210, 760],
    [1440, 900],
    [1920, 1080],
    [390, 844],
  ]) {
    const v = coverView(w, h, 650);
    const a = v.project(0, 0),
      b = v.project(1600, 900);
    assert.ok(
      a.x <= 0.001 && a.y <= 0.001 && b.x >= w - 0.001 && b.y >= h - 0.001,
    );
    assert.ok(
      Math.abs(v.project(400, 400).x - v.project(300, 400).x - v.zoom * 100) <
        1e-8,
    );
  }
});
test("A narrow scene can frame every active story target within a full 44px touch area", () => {
  for (const place of Object.values(places))
    for (const target of place.hotspots) {
      const v = coverView(390, 844, target.x),
        p = v.project(target.x, target.y);
      assert.ok(
        p.x >= 22 && p.x <= 390 - 22,
        `${target.id}: horizontal touch area`,
      );
      assert.ok(
        p.y >= 75 && p.y <= 844 - 45,
        `${target.id}: vertical touch area`,
      );
    }
});
