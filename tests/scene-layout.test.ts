import test from "node:test";
import assert from "node:assert/strict";
import {
  coverView,
  conversationFrame,
  dialogueBackdrop,
} from "../src/scene-layout";
import { places, type Place } from "../src/story";
import {
  sceneObjects,
  decorations,
  narrativeTime,
  portraitCrops,
} from "../src/scene-details";
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
  for (const place of Object.keys(places) as Place[])
    for (const target of sceneObjects(place)) {
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

test("Conversation staging keeps both feet above the dialogue and visible participants separated", () => {
  for (const [w, h, top] of [
    [1210, 760, 560],
    [1440, 900, 700],
    [390, 844, 610],
  ])
    for (const place of Object.values(places))
      for (const person of place.hotspots.filter((h) => h.person)) {
        const f = conversationFrame(w, h, person.x, top);
        assert.ok(f.feetScreen <= top - 7);
        assert.ok(Math.abs(f.playerX - person.x) >= 220);
        for (const x of [f.playerX, person.x]) {
          const p = f.view.project(x, f.feetY);
          assert.ok(p.x >= 45 && p.x <= w - 45, `${person.id} framed at ${w}`);
          assert.ok(p.y <= top - 7);
        }
      }
});
test("Decorations cannot be academic challenges, witness gates or evidence IDs", () => {
  const ids = new Set<string>();
  for (const room of Object.values(decorations)) {
    assert.ok(room.length >= 3 && room.length <= 5);
    for (const d of room) {
      assert.ok(d.id.startsWith("decor-"));
      assert.equal(d.quiz, undefined);
      assert.equal(d.person, undefined);
      assert.equal(d.requires, undefined);
      assert.equal(ids.has(d.id), false);
      ids.add(d.id);
      assert.ok(d.thought.length > 10);
    }
  }
});
test("Narrative time follows unlocked chapters and never reads a running clock", () => {
  const chapters: Place[] = ["lobby", "lift", "office", "service", "archive"];
  const times = chapters.map((_, i) => narrativeTime(chapters.slice(0, i + 1)));
  assert.deepEqual(times, ["07.42", "07.48", "07.54", "08.01", "08.07"]);
  assert.equal(
    narrativeTime(["archive", "lobby", "office", "service", "lift"]),
    "08.07",
  );
});
test("Portrait crops stay entirely inside frame zero of the existing sprite sheet", () => {
  for (const crop of Object.values(portraitCrops)) {
    const [x, y, w, h] = crop.split(" ").map(Number);
    assert.ok(x >= 0 && y >= 0 && x + w <= 512 && y + h <= 512);
  }
});

test("Dialogue backdrop remains large enough to cover the room while aligning its floor", () => {
  for (const feet of [640, 654, 692])
    for (const floor of [650, 710, 755])
      for (const center of [395, 1055, 1170]) {
        const d = dialogueBackdrop(feet, floor, center);
        assert.ok(d.zoom >= 1 && d.zoom <= 2);
        assert.ok(d.x - 800 * d.zoom <= 0);
        assert.ok(d.x + 800 * d.zoom >= 1600);
        assert.ok(d.y - 450 * d.zoom <= 0);
        assert.ok(Math.abs(d.y + 450 * d.zoom - 900) < 1e-8);
      }
});
