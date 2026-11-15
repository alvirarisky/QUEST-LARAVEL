import test from "node:test";
import assert from "node:assert/strict";
import { handle, sign } from "../server/api.js";
import { questions, publicQuestion } from "../server/questions.js";
import { places, evidence, quizRewards } from "../src/story.js";
process.env.RUN_SIGNING_SECRET = "test-only-secret-with-at-least-32-characters";
const identity = {
  name: "Penyelidik Uji",
  student: "TEST-008",
  kelas: "IT-TEST",
};
test("Eight different challenges expose no answer key before submission", () => {
  assert.equal(questions.length, 8);
  assert.equal(new Set(questions.map((q) => q.id)).size, 8);
  for (let i = 0; i < 8; i++) {
    const q = publicQuestion(i);
    assert.ok(!("expected" in q));
    assert.ok(!("explanation" in q));
  }
});
test("A full run grades first submissions and produces a verifiable signed result", () => {
  let run = handle("start", { identity });
  assert.throws(() => handle("result", { token: run.token }));
  for (let i = 0; i < 8; i++) {
    const q = handle("question", { token: run.token }).question;
    const answer = i === 2 ? "post" : questions[i].expected;
    const out = handle("submit", {
      token: run.token,
      questionId: q.id,
      answer,
    });
    assert.equal(out.correct, i !== 2);
    assert.equal(out.run.answers.length, i + 1);
    run = out;
  }
  const out = handle("result", { token: run.token });
  assert.equal(out.receipt.score, 87.5);
  assert.equal(out.receipt.correct, 7);
  const check = handle("verify", { code: out.code });
  assert.equal(check.valid, true);
  assert.deepEqual(check.receipt.identity, identity);
  assert.throws(() =>
    handle("submit", {
      token: run.token,
      questionId: "reconstruct",
      answer: "right",
    }),
  );
});
test("Malformed, skipped, and incomplete submissions do not advance the session", () => {
  const { token } = handle("start", { identity });
  assert.throws(() =>
    handle("submit", { token, questionId: "folders", answer: [] }),
  );
  assert.throws(() =>
    handle("submit", { token, questionId: "mvc", answer: ["model"] }),
  );
  assert.throws(() =>
    handle("submit", {
      token,
      questionId: "mvc",
      answer: ["made-up", "view", "controller"],
    }),
  );
  assert.equal(handle("resume", { token }).run.answers.length, 0);
});
test("Retries of the same request do not consume another question", () => {
  const { token } = handle("start", { identity });
  const payload = { token, questionId: "mvc", answer: questions[0].expected };
  const first = handle("submit", payload),
    retry = handle("submit", payload);
  assert.equal(first.token, retry.token);
  assert.equal(retry.run.answers.length, 1);
});
test("Editing identity or score invalidates the signature", () => {
  const { token } = handle("start", { identity });
  const [data, sig] = token.split(".");
  const value = JSON.parse(Buffer.from(data, "base64url").toString());
  value.identity.name = "Someone else";
  const edited =
    Buffer.from(JSON.stringify(value)).toString("base64url") + "." + sig;
  assert.throws(() => handle("resume", { token: edited }));
  assert.throws(() => handle("verify", { code: token }));
  assert.throws(() => handle("verify", { code: "junk" }));
});
test("Expired runs and invalid identity are rejected", () => {
  assert.throws(() =>
    handle("start", { identity: { ...identity, name: "  " } }),
  );
  const { run } = handle("start", { identity });
  run.expiresAt = Date.now() - 1000;
  assert.throws(() => handle("resume", { token: sign(run) }));
});
test("Every academic challenge unlocks an actual evidence item in story order", () => {
  const quizzes = Object.values(places)
    .flatMap((p) => p.hotspots)
    .filter((h) => h.quiz !== undefined);
  assert.deepEqual(
    quizzes.map((h) => h.quiz),
    [0, 1, 2, 3, 4, 5, 6, 7],
  );
  assert.equal(quizRewards.length, 8);
  for (const key of quizRewards) assert.ok(evidence[key]);
  assert.deepEqual(
    places.service.hotspots.find((h) => h.quiz === 7)?.requires,
    ["allieTruth", "noahTruth", "tedarTruth"],
  );
  assert.ok(places.archive.hotspots.some((h) => h.person === "yono"));
});
