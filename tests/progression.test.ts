import test from "node:test";
import assert from "node:assert/strict";
import {
  nextStep,
  availablePlaces,
  steps,
  stepNumber,
  type Progress,
} from "../src/progression.js";
import {
  places,
  quizRewards,
  accessEvents,
  caseTimeline,
} from "../src/story.js";
const fresh = (): Progress => ({
  run: { answers: [] },
  flags: {},
  clues: ["message"],
  closed: false,
});
function complete(s: Progress) {
  const step = nextStep(s),
    h = places[step.place].hotspots.find((h) => h.id === step.hotspot)!;
  if (h.quiz !== undefined) {
    assert.equal(h.quiz, s.run.answers.length, "No question may be skipped");
    s.run.answers.push(false);
    s.clues.push(quizRewards[h.quiz]);
  } else if (step.kind === "confront") {
    s.flags[
      { allie: "allieTruth", noah: "noahTruth", tedar: "tedarTruth" }[
        step.hotspot
      ]!
    ] = true;
  } else if (step.kind === "talk") {
    s.flags[step.hotspot === "yono" ? "yonoFound" : step.hotspot + "Briefed"] =
      true;
  } else if (step.id === "manifest") {
    s.clues.push("manifest");
  } else if (step.kind === "deduce") {
    s.closed = true;
  } else throw Error("Unhandled step: " + step.id);
}
test("A first-time player meets Allie before any academic challenge", () => {
  const s = fresh();
  assert.equal(nextStep(s).id, "meet-allie");
  assert.equal(nextStep(s).place, "lobby");
  assert.equal(stepNumber(s), 1);
  complete(s);
  assert.equal(nextStep(s).id, "ledger");
});
test("Every lead has a reachable place, actionable hotspot, and a clear exit to the next lead", () => {
  const s = fresh();
  const visited: string[] = [];
  while (!s.closed) {
    const step = nextStep(s);
    assert.ok(
      availablePlaces(s).includes(step.place),
      `${step.id} points into a locked room`,
    );
    assert.ok(places[step.place].hotspots.some((h) => h.id === step.hotspot));
    assert.ok(step.cta.length > 5);
    assert.ok(!visited.includes(step.id), "Progress must not loop");
    visited.push(step.id);
    complete(s);
    assert.notEqual(nextStep(s).id, step.id);
  }
  assert.deepEqual(
    visited,
    steps.map((s) => s.id),
  );
  assert.equal(nextStep(s).kind, "complete");
  assert.equal(s.run.answers.length, 8);
  assert.ok(
    s.run.answers.every((a) => a === false),
    "Incorrect academic answers must still permit completion",
  );
});
test("Location unlocks cannot disagree with required witness conversations", () => {
  const s = fresh();
  s.run.answers = [true, true, true];
  assert.deepEqual(availablePlaces(s), ["lobby"]);
  assert.equal(nextStep(s).id, "allie-proof");
  s.flags.allieTruth = true;
  assert.ok(availablePlaces(s).includes("lift"));
  s.run.answers.push(true, true);
  assert.equal(nextStep(s).id, "noah-proof");
  assert.ok(!availablePlaces(s).includes("office"));
  s.flags.noahTruth = true;
  assert.ok(availablePlaces(s).includes("office"));
  s.run.answers.push(true, true);
  assert.equal(nextStep(s).id, "tedar-proof");
  assert.ok(!availablePlaces(s).includes("service"));
  s.flags.tedarTruth = true;
  assert.ok(availablePlaces(s).includes("service"));
});
test("Older saved academic progress is not forced to replay introductory interviews", () => {
  const s = fresh();
  s.run.answers = Array(7).fill(true);
  s.flags = { allieTruth: true, noahTruth: true };
  assert.equal(nextStep(s).id, "tedar-proof");
  s.flags.tedarTruth = true;
  assert.equal(nextStep(s).id, "archive-door");
});
test("Early correct evidence connections do not create a dead end later", () => {
  const s = fresh();
  s.flags.noahTruth = true;
  for (let guard = 0; guard < 25 && !s.closed; guard++) {
    assert.ok(availablePlaces(s).includes(nextStep(s).place));
    complete(s);
  }
  assert.ok(s.closed);
});
test("Finding Yono alone is not enough: the original manifest is required before deduction", () => {
  const s = fresh();
  s.run.answers = Array(8).fill(true);
  s.flags = { allieTruth: true, noahTruth: true, tedarTruth: true };
  assert.equal(nextStep(s).id, "find-yono");
  s.flags.yonoFound = true;
  assert.equal(nextStep(s).id, "manifest");
  s.clues.push("manifest");
  assert.equal(nextStep(s).id, "conclusion");
});

test("The service stop is enabled before Yono arrives, and confinement precedes parcel delivery", () => {
  const minutes = (time: string) => {
    const [h, m] = time.split(".").map(Number);
    return h * 60 + m;
  };
  assert.ok(minutes(accessEvents[0].time) < minutes("20.16"));
  assert.ok(minutes(accessEvents[1].time) > minutes("20.16"));
  assert.ok(minutes(accessEvents[2].time) < minutes(accessEvents[3].time));
  assert.deepEqual(
    caseTimeline.map((e) => minutes(e.time)),
    caseTimeline.map((e) => minutes(e.time)).sort((a, b) => a - b),
  );
});
