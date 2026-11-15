import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { JSDOM, VirtualConsole } from "jsdom";
import { setTimeout as tick } from "node:timers/promises";
import { handle } from "../server/api.js";
import { nextStep } from "../src/progression.js";
import { questions } from "../server/questions.js";
process.env.RUN_SIGNING_SECRET =
  "test-only-journey-secret-with-at-least-32-characters";
// Exercise actual UI, events, state persistence and server grading. Only the
// Phaser renderer and audio hardware are replaced; these are not browser tests.
const compiled = await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  define: { "import.meta.env.DEV": "false" },
  plugins: [
    {
      name: "test-hardware",
      setup(b) {
        b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
        b.onResolve({ filter: /^\.\/audio$/ }, () => ({
          path: "audio",
          namespace: "test-hardware",
        }));
        b.onResolve({ filter: /^\.\/world$/ }, () => ({
          path: "world",
          namespace: "test-hardware",
        }));
        b.onLoad({ filter: /.*/, namespace: "test-hardware" }, (args) => ({
          loader: "js",
          contents:
            args.path === "audio"
              ? `export const levels={master:.65,music:.36,ambience:.38,effects:.65,voice:.8,spoken:false,typing:true};export async function unlock(){};export function setLevel(k,v){levels[k]=v};export function sfx(){};export function typingSound(){};export function stopTypingSound(){};export function setTheme(){};export function setRoom(){};export function setTension(){};export function duck(){};export function speak(){};export function stopVoice(){};export function suspend(){};export function audioStatus(){return{}};`
              : `export function createWorld(parent,onInspect,onReady){const scene={reduced:false,inspect(h){onInspect(h)},loadPlace(){},setProgress(){},setFocus(){},lock(){},highlight(){return true}};setTimeout(onReady,0);return{scene,game:{destroy(){}}}}`,
        }));
      },
    },
  ],
});
const script = compiled.outputFiles[0].text;
async function app(
  options: {
    save?: string;
    failSubmit?: boolean;
    delayQuestion?: boolean;
  } = {},
) {
  const errors: unknown[] = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e));
  const dom = new JSDOM('<!doctype html><div id="app"></div>', {
    url: "http://localhost:5191",
    runScripts: "outside-only",
    virtualConsole: vc,
  });
  const w = dom.window;
  let fail = options.failSubmit;
  let delayed: (() => void) | undefined;
  const requests: { action: string; body: any }[] = [];
  if (options.save) w.localStorage.setItem("di-atas-tujuh-v1", options.save);
  (w as any).fetch = async (url: string, init: any) => {
    const action = url.split("/").pop()!,
      body = JSON.parse(init.body);
    requests.push({ action, body });
    if (action === "submit" && fail) {
      fail = false;
      throw new w.TypeError("offline");
    }
    if (action === "question" && options.delayQuestion)
      await new Promise<void>((resolve) => {
        delayed = resolve;
      });
    try {
      const value = handle(action, body);
      return { ok: true, json: async () => value };
    } catch (e) {
      return { ok: false, json: async () => ({ error: (e as Error).message }) };
    }
  };
  w.localStorage.setItem("dat-motion", "reduced");
  w.eval(script);
  const q = (id: string) => w.document.getElementById(id) as HTMLElement | null;
  const click = (id: string) => {
    const el = q(id) as HTMLButtonElement | null;
    assert.ok(
      el,
      `Missing button ${id}; panel=${q("modal-title")?.textContent}`,
    );
    assert.ok(!el.disabled, `Disabled button ${id}`);
    el.click();
  };
  const field = (id: string, value: string) => {
    const el = q(id) as HTMLInputElement | HTMLSelectElement;
    assert.ok(el, id);
    el.value = value;
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
    el.dispatchEvent(new w.Event("change", { bubbles: true }));
  };
  const submit = (id: string) => {
    assert.ok(q(id), id);
    q(id)!.dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    );
  };
  const wait = async (predicate: () => boolean) => {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return;
      await tick(5);
    }
    assert.fail(
      "Timed out; panel=" +
        q("modal-title")?.textContent +
        "; objective=" +
        q("objective")?.textContent,
    );
  };
  const saved = () => JSON.parse(w.localStorage.getItem("di-atas-tujuh-v1")!);
  const start = async () => {
    field("name", "Audit UI");
    field("student", "UX-TEST");
    field("kelas", "IT-TEST");
    submit("identity-form");
    await wait(() => !!q("brief-next"));
    assert.equal(
      q("locations"),
      null,
      "No unexplained dashboard before briefing",
    );
    click("brief-next");
    click("brief-next");
    await wait(() => !!q("objects-btn") && !!q("loading")?.hidden);
  };
  const act = () => {
    const step = nextStep(saved());
    if (saved().location !== step.place) {
      click("places-btn");
      (
        w.document.querySelector(
          `[data-place="${step.place}"]`,
        ) as HTMLButtonElement
      ).click();
    } else {
      click("objects-btn");
      (
        w.document.querySelector(
          `[data-hotspot="${step.hotspot}"]`,
        ) as HTMLButtonElement
      ).click();
    }
  };
  // Witness intros are several lines (speech + narration); advance until the question appears.
  const toQuestion = () => {
    for (let i = 0; i < 8 && !q("witness-question") && q("dialog-next"); i++)
      click("dialog-next");
  };
  const firstAnalysis = () => {
    act();
    toQuestion();
    click("witness-question");
    click("dialog-next");
    act();
    click("begin-analysis");
  };
  return {
    act,
    toQuestion,
    firstAnalysis,
    w,
    dom,
    q,
    click,
    field,
    submit,
    wait,
    saved,
    start,
    requests,
    errors,
    releaseQuestion: () => delayed?.(),
  };
}
test("A newcomer can finish via the visible primary actions without guessing hidden progression", async () => {
  const a = await app();
  try {
    await a.start();
    assert.match(a.q("objective")!.textContent!, /Allie/);
    assert.equal(a.q("quiz-form"), null);
    a.click("objects-btn");
    // Deliberately inspect a future object. The UI must name the actual next action.
    (
      a.w.document.querySelector('[data-hotspot="cctv"]') as HTMLButtonElement
    ).click();
    assert.ok(a.q("modal")!.hidden);
    assert.match(a.q("objective")!.textContent!, /Saya/);
    a.act();
    let ending = false,
      wrongEvidence = false,
      wrongDeduction = false;
    for (let guard = 0; guard < 180; guard++) {
      await tick(0);
      if (a.q("download-proof")) {
        ending = true;
        break;
      }
      if (a.q("modal")!.hidden) {
        a.act();
        continue;
      }
      if (a.q("witness-question")) a.click("witness-question");
      else if (a.q("dialog-next")) a.click("dialog-next");
      else if (a.q("chapter-skip")) a.click("chapter-skip");
      else if (a.q("begin-analysis")) {
        assert.equal(a.q("modal")!.dataset.mode, "exhibit");
        assert.ok(a.w.document.querySelector(".physical-exhibit"));
        assert.doesNotMatch(a.q("dialog-card")!.textContent!, /Kenapa penting/);
        a.click("begin-analysis");
        await a.wait(() => !!a.q("quiz-form"));
      } else if (a.q("quiz-form")) {
        const i = a.saved().run.answers.length,
          q = questions[i],
          answer = i === 2 ? "post" : q.expected;
        if (q.kind === "single") {
          (
            a.w.document.querySelector(
              `input[value="${answer}"]`,
            ) as HTMLInputElement
          ).checked = true;
        } else if (q.kind === "match") {
          (answer as string[]).forEach((value, j) =>
            a.field("match-" + j, value),
          );
        } else {
          for (const value of answer as string[]) {
            (
              a.w.document.querySelector(
                `[data-order="${value}"]`,
              ) as HTMLButtonElement
            ).click();
          }
        }
        a.submit("quiz-form");
        await a.wait(() => !!a.q("feedback-next"));
      } else if (a.q("feedback-next")) a.click("feedback-next");
      else if (a.w.document.querySelector("[data-show]")) {
        const proof = !a.saved().flags.allieTruth
          ? "cctv"
          : !a.saved().flags.noahTruth
            ? "plan"
            : "access";
        if (!wrongEvidence) {
          const before = a.saved().run.answers.length;
          (
            a.w.document.querySelector(
              '[data-show="message"]',
            ) as HTMLButtonElement
          )?.click();
          if (a.q("dialog-card")!.textContent!.includes("Belum nyambung")) {
            assert.equal(a.saved().run.answers.length, before);
            wrongEvidence = true;
          }
        }
        (
          a.w.document.querySelector(
            `[data-show="${proof}"]`,
          ) as HTMLButtonElement
        ).click();
      } else if (a.q("proof-continue")) a.click("proof-continue");
      else if (a.q("clue-close")) a.click("clue-close");
      else if (a.q("conclusion-form")) {
        a.field("deduce-who", wrongDeduction ? "tedar" : "wiwo");
        a.field("deduce-route", "service");
        a.field("deduce-motive", "parcels");
        a.submit("conclusion-form");
        if (!wrongDeduction) {
          assert.match(a.q("deduce-error")!.textContent!, /Tidak ada penalti/);
          wrongDeduction = true;
        }
      } else if (a.q("objects-btn") && a.q("modal")!.hidden) a.act();
      else assert.fail("Unknown screen: " + a.q("modal-title")?.textContent);
    }
    assert.ok(ending, "The journey must reach the result screen");
    assert.ok(wrongEvidence);
    assert.ok(wrongDeduction);
    assert.equal(a.saved().receipt.score, 87.5);
    assert.equal(a.requests.filter((r) => r.action === "submit").length, 8);
    assert.equal(
      handle("verify", { code: a.saved().code }).receipt.score,
      87.5,
    );
    assert.equal(a.errors.length, 0);
  } finally {
    a.dom.window.close();
  }
});
test("A lost submission survives reload and retries the same answer instead of grading a new attempt", async () => {
  const a = await app({ failSubmit: true });
  let save: string;
  try {
    await a.start();
    a.firstAnalysis();
    await a.wait(() => !!a.q("quiz-form"));
    ["model", "view", "controller"].forEach((v, i) => a.field("match-" + i, v));
    a.submit("quiz-form");
    await a.wait(() => !!a.q("retry-answer"));
    assert.equal(a.saved().run.answers.length, 0);
    save = JSON.stringify(a.saved());
  } finally {
    a.dom.window.close();
  }
  const b = await app({ save: save! });
  try {
    b.click("resume");
    await b.wait(() => !!b.q("feedback-next"));
    assert.deepEqual(b.saved().run.answers, [true]);
    assert.equal(b.requests.filter((r) => r.action === "submit").length, 1);
    assert.deepEqual(
      b.requests.find((r) => r.action === "submit")!.body.answer,
      ["model", "view", "controller"],
    );
  } finally {
    b.dom.window.close();
  }
});
test("Closing a loading panel does not allow its later response to reopen an unexpected quiz", async () => {
  const a = await app({ delayQuestion: true });
  try {
    await a.start();
    a.firstAnalysis();
    a.click("modal-close");
    a.releaseQuestion();
    await tick(20);
    assert.ok(a.q("modal")!.hidden);
    assert.equal(a.q("quiz-form"), null);
    assert.equal(a.saved().run.answers.length, 0);
  } finally {
    a.dom.window.close();
  }
});
test("Space advances dialogue even when browser focus temporarily falls back to body", async () => {
  const a = await app();
  try {
    await a.start();
    a.act();
    for (let i = 0; i < 8 && !a.q("witness-question"); i++)
      a.w.document.body.dispatchEvent(
        new a.w.KeyboardEvent("keydown", {
          key: " ",
          bubbles: true,
          cancelable: true,
        }),
      );
    assert.ok(a.q("witness-question"));
    assert.equal(a.saved().run.answers.length, 0);
    assert.equal(a.q("modal")!.dataset.mode, "dialogue");
  } finally {
    a.dom.window.close();
  }
});

test("Finishing an interview returns to the room with a thought, without a next-step modal", async () => {
  const a = await app();
  try {
    await a.start();
    a.act();
    a.toQuestion();
    a.click("witness-question");
    a.click("dialog-next");
    assert.ok(a.q("modal")!.hidden);
    assert.equal(a.q("follow-lead"), null);
    assert.equal(a.saved().flags.allieBriefed, true);
    assert.equal(a.saved().run.answers.length, 0);
    assert.match(a.q("objective")!.textContent!, /Buku tamu/);
    a.act();
    assert.equal(a.q("modal")!.dataset.mode, "exhibit");
  } finally {
    a.dom.window.close();
  }
});

test("Looking at decorative scenery changes no saved game state", async () => {
  const a = await app();
  try {
    await a.start();
    const before = JSON.stringify(a.saved());
    a.click("objects-btn");
    (
      a.w.document.querySelector(
        '[data-hotspot="decor-lobby-clock"]',
      ) as HTMLButtonElement
    ).click();
    assert.ok(a.q("modal")!.hidden);
    assert.equal(JSON.stringify(a.saved()), before);
    assert.match(a.q("objective")!.textContent!, /Detiknya/);
    assert.equal(a.q("narrative-clock")!.textContent, "07.42");
  } finally {
    a.dom.window.close();
  }
});

test("Objective is an accessible destination control and never opens a same-room interview", async () => {
  const a = await app();
  try {
    await a.start();
    const objective = a.q("objective")!;
    assert.equal(objective.tagName, "BUTTON");
    assert.match(objective.textContent!, /Allie.*·.*→/);
    assert.match(objective.getAttribute("aria-label")!, /Sorot tujuan/);
    const before = JSON.stringify(a.saved());
    a.click("objective");
    assert.ok(a.q("modal")!.hidden);
    assert.equal(JSON.stringify(a.saved()), before);
  } finally {
    a.dom.window.close();
  }
});


test("The two intro pages explain the missing courier, building anomaly and scoring", async () => {
  const a = await app();
  try {
    a.field("name", "Audit Intro");
    a.field("student", "INTRO-001");
    a.field("kelas", "IT-TEST");
    a.submit("identity-form");
    await a.wait(() => !!a.q("brief-next"));
    const intro = () => a.w.document.querySelector(".cinema-intro")!.textContent!;
    for (const text of ["Gedung W", "7 lantai", "lantai 8"]) assert.ok(intro().includes(text), text);
    a.click("brief-next");
    for (const text of ["Tugas kamu", "12,5 poin"]) assert.ok(intro().includes(text), text);
    assert.equal(a.q("typed-message")!.textContent, "Saya sudah lantai 8. Orangnya belum ada.");
    a.click("brief-next");
    await a.wait(() => !!a.q("objects-btn") && !!a.q("loading")?.hidden);
    assert.equal(a.saved().run.answers.length, 0);
  } finally { a.dom.window.close(); }
});
