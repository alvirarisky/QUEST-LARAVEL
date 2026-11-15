import "./style.css";
import "./cinematic.css";
import { icon } from "./ui";
import {
  places,
  people,
  evidence,
  ending,
  quizRewards,
  rewardLines,
  caseTimeline,
  type Place,
  type Person,
  type Hotspot,
  type Line,
} from "./story";
import * as audio from "./audio";
import type { Question, Answer, Run, Receipt, Identity } from "../shared/types";
import type { Investigation } from "./world";
import {
  type Step,
  nextStep,
  availablePlaces,
  challengeNotes,
} from "./progression";

const app = document.querySelector<HTMLDivElement>("#app")!;
const KEY = "di-atas-tujuh-v1";
type Feedback = {
  question: Question;
  correct: boolean;
  expected: Answer;
  explanation: string;
};
type Save = {
  v: 1;
  token: string;
  run: Run;
  location: Place;
  clues: string[];
  flags: Record<string, boolean>;
  log: Line[];
  closed: boolean;
  reviews: Feedback[];
  pending?: { questionId: string; answer: Answer };
  receipt?: Receipt;
  code?: string;
};
let state: Save | undefined,
  world: Investigation | undefined,
  game: any,
  worldReady = false,
  modalOpen = false,
  modalCanClose = true,
  lastFocus: HTMLElement | null = null,
  dialogDone: (() => void) | undefined;
let panelRevision = 0;
let stopTyping = () => {};
let activeSpeaker: string | undefined;
let toastTimer: ReturnType<typeof setTimeout>,
  busy = false,
  reduced = false;
try {
  reduced =
    localStorage.getItem("dat-motion") === "reduced" ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
} catch {}
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const esc = (x: unknown) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const bind = (id: string, fn: () => void) =>
  $(id)?.addEventListener("click", fn);
const has = (id: string) => state?.clues.includes(id) || false;
const flag = (id: string) => !!state?.flags[id];
const done = () => state?.run.answers.length || 0;
function checkpoint() {
  if (!state) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    toast(
      "Penyimpanan perangkat tidak tersedia. Jangan tutup tab sebelum selesai.",
    );
  }
}
function loadSave(): Save | undefined {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      s?.v !== 1 ||
      !s.token ||
      !places[s.location as Place] ||
      !Array.isArray(s.clues) ||
      !Array.isArray(s.log) ||
      !Array.isArray(s.reviews) ||
      !s.flags
    )
      return;
    if (s.run?.answers?.length > 0) {
      s.flags.briefingDone = true;
      s.flags.intro = true;
    }
    return s;
  } catch {
    return;
  }
}
async function api(action: string, data: unknown): Promise<any> {
  const c = new AbortController(),
    timer = setTimeout(() => c.abort(), 15000);
  try {
    const res = await fetch("/api/run/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: c.signal,
    });
    let out;
    try {
      out = await res.json();
    } catch {
      throw Error(
        "Server penilaian belum tersedia. Coba lagi atau hubungi asisten praktikum.",
      );
    }
    if (!res.ok) throw Error(out.error || "Server belum dapat dihubungi.");
    return out;
  } catch (e) {
    if (e instanceof TypeError || (e as any)?.name === "AbortError")
      throw Error(
        "Koneksi terputus. Progres tetap tersimpan; coba lagi saat terhubung.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
function toast(text: string) {
  const t = $("toast");
  if (!t) return;
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 4500);
}
const common = `<div id="toast" role="status" aria-live="polite" hidden></div><div id="modal" class="modal" hidden><section id="dialog-card" class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"></section></div>`;
function modal(html: string, canClose = true, wide = false, mode = "panel") {
  stopTyping();
  $("modal").dataset.mode = mode;
  document
    .querySelector(".cinema-game")
    ?.classList.toggle("in-dialogue", mode === "dialogue");
  if (mode !== "dialogue") world?.setSpeaker?.();
  panelRevision++;
  if (!modalOpen) lastFocus = document.activeElement as HTMLElement;
  modalOpen = true;
  document.querySelector(".cinema-game")?.classList.add("panel-open");
  modalCanClose = canClose;
  const main = app.querySelector("main");
  if (main) main.inert = true;
  world?.lock(true);
  audio.duck(true);
  $("modal").hidden = false;
  $("dialog-card").className = "dialog-card" + (wide ? " wide" : "");
  $("dialog-card").innerHTML = html;
  $("dialog-card").focus();
  const focusRevision = panelRevision;
  setTimeout(() => {
    const card = $("dialog-card");
    if (
      modalOpen &&
      focusRevision === panelRevision &&
      card &&
      !card.contains(document.activeElement)
    )
      card.focus({ preventScroll: true });
  }, 0);
  bind("modal-close", closeModal);
}
function header(kicker: string, title: string, closable = true) {
  const sentence = (
    kicker.charAt(0).toUpperCase() + kicker.slice(1).toLocaleLowerCase("id-ID")
  )
    .replace(/laravel/gi, "Laravel")
    .replace(/mvc/gi, "MVC");
  return `<div class="modal-head"><div><p class="panel-context">${sentence}</p><h2 id="modal-title">${title}</h2></div>${closable ? `<button id="modal-close" class="icon-btn" aria-label="Tutup">${icon("close")}</button>` : ""}</div>`;
}
function closeModal() {
  if (!modalCanClose) return;
  stopTyping();
  document.querySelector(".cinema-game")?.classList.remove("in-dialogue");
  world?.setSpeaker?.();
  modalOpen = false;
  document.querySelector(".cinema-game")?.classList.remove("panel-open");
  $("modal").hidden = true;
  const main = app.querySelector("main");
  if (main) main.inert = false;
  world?.lock(false);
  audio.duck(false);
  audio.stopVoice();
  lastFocus?.focus();
}
function remember(line: Line) {
  if (!state) return;
  if (!state.log.some((l) => l.who === line.who && l.text === line.text)) {
    state.log.push(line);
    checkpoint();
  }
}
function portrait(who: string) {
  const key =
    Object.entries(people).find(([, p]) => p.name === who)?.[0] ||
    (who === "Detektif" ? "detective" : null);
  return key
    ? `<span class="portrait ${key}" aria-hidden="true"></span>`
    : `<span class="portrait symbolic" aria-hidden="true">${who === "Nomor tak dikenal" ? "?" : "↗"}</span>`;
}
function dialogue(lines: Line[], after?: () => void) {
  let index = 0;
  dialogDone = after;
  const show = () => {
    const l = lines[index];
    remember(l);
    activeSpeaker = Object.entries(people).find(
      ([, p]) => p.name === l.who,
    )?.[0];
    modal(
      `<div class="vn-top"><span id="modal-title" class="speaker-tab">${esc(l.who)}</span><button id="dialog-log" class="text-btn">Log</button></div><p class="vn-text"><span id="dialog-typed" aria-hidden="true"></span><span class="sr-only">${esc(l.text)}</span></p><div class="vn-bottom"><span class="vn-key">Klik / Spasi buat lanjut</span><button id="dialog-next" class="text-btn">Lanjut ${icon("arrow", 18)}</button></div>`,
      false,
      false,
      "dialogue",
    );
    world?.setSpeaker?.(activeSpeaker);
    const el = $("dialog-typed");
    let complete = reduced;
    let n = 0;
    const finish = () => {
      stopTyping();
      complete = true;
      el.textContent = l.text;
    };
    if (reduced) finish();
    else {
      const timer = setInterval(() => {
        if (!el.isConnected) {
          clearInterval(timer);
          return;
        }
        el.textContent = l.text.slice(0, ++n);
        if (n >= l.text.length) {
          clearInterval(timer);
          complete = true;
        }
      }, 23);
      stopTyping = () => clearInterval(timer);
    }
    bind("dialog-next", () => {
      if (!complete) {
        finish();
        return;
      }
      audio.sfx("click");
      audio.stopVoice();
      if (++index < lines.length) show();
      else {
        modalCanClose = true;
        closeModal();
        const cb = dialogDone;
        dialogDone = undefined;
        cb?.();
      }
    });
    $("dialog-typed").parentElement!.onclick = () => {
      if (!complete) finish();
      else $("dialog-next").click();
    };
    bind("dialog-log", () => dialogueLog(show));
    if (l.who === "Yono" && l.text.includes("lantai 8"))
      audio.speak("yono-message");
    if (l.who === "Nomor tak dikenal") audio.sfx("phone");
  };
  show();
}
function dialogueLog(back: () => void) {
  modal(
    `${header("Percakapan", "Yang sudah terucap", false)}<div class="log-list">${state!.log.map((l) => `<article><b>${esc(l.who)}</b><p>${esc(l.text)}</p></article>`).join("")}</div><button id="log-back" class="primary">Kembali ke percakapan</button>`,
    false,
  );
  bind("log-back", back);
}
function addClue(id: string) {
  if (!state || has(id)) return;
  state.clues.push(id);
  audio.sfx("pickup");
  checkpoint();
  renderHUD();
  toast("Bukti baru: " + evidence[id].title);
  $("evidence-btn")?.animate?.(
    [
      { transform: "rotate(0)" },
      { transform: "rotate(-7deg)" },
      { transform: "rotate(5deg)" },
      { transform: "rotate(0)" },
    ],
    { duration: reduced ? 0 : 240 },
  );
}
function completedIntro() {
  state!.flags.intro = true;
  checkpoint();
  tutorial();
}
function briefing() {
  worldReady = false;
  let index = 0;
  let cancelTyping = () => {};
  const enter = () => {
    cancelTyping();
    audio.stopVoice();
    state!.flags.intro = true;
    state!.flags.briefingDone = true;
    state!.flags.startWithAllie = true;
    checkpoint();
    void mountGame();
  };
  const show = () => {
    cancelTyping();
    app.innerHTML = `<main class="cinema-intro"><div class="intro-image"></div><header class="intro-header"><span class="wordmark">D<span>/</span>7</span><button id="brief-skip" class="text-btn">Lewati ${icon("arrow", 18)}</button></header><div class="intro-layout"><section class="intro-copy"><p class="intro-kicker">Di atas tujuh</p><h1>${index === 0 ? "Paketnya tiba.<br>Kurirnya hilang." : "Cari jejaknya.<br>Uji ceritanya."}</h1><p>${index === 0 ? "Lo detektif lepas. Yono belum pulang dari Gedung W. Paketnya sudah di kantor Wiwo, tapi pesan terakhirnya menyebut lantai yang nggak ada di denah." : "Temui Allie di resepsionis. Klik orang atau benda di ruangan, baca buktinya, lalu cocokkan keterangan saksi."}</p>${index === 1 ? '<p class="intro-rule">Ada 8 analisis Laravel di sepanjang kasus. Cuma jawaban pertama yang dihitung skor. Eksplorasinya boleh lo ulang.</p>' : '<p class="intro-question">Gedungnya tujuh lantai.<br>Kenapa Yono bilang delapan?</p>'}<div class="intro-controls"><div class="intro-dots" aria-label="Langkah pembuka">${[0, 1].map((i) => `<button data-intro="${i}" aria-label="Langkah ${i + 1}" aria-current="${i === index ? "step" : "false"}"></button>`).join("")}</div><button id="brief-next" class="primary">${index === 0 ? "Gimana mulainya?" : "Masuk lobi"} ${icon("arrow", 18)}</button></div></section><aside class="intro-phone" aria-label="Pesan terakhir Yono"><div class="phone-top"><span class="phone-avatar">Y</span><div><b>Yono</b><small>Terakhir aktif tadi malam</small></div></div><div class="phone-chat"><span class="chat-date">Kemarin · 20.16</span><p id="typed-message" class="chat-bubble"></p><small class="chat-receipt">Terkirim</small></div><div class="phone-context">${index === 0 ? "Sejak pesan ini, nggak ada kabar lagi." : "Mulai dari satu orang.<br>Allie melihat Yono datang."}</div></aside></div></main>${common}`;
    const text = "Gue udah lantai 8. Orangnya belum ada.";
    const target = $("typed-message");
    let n = 0;
    if (reduced || index === 1) target.textContent = text;
    else {
      const timer = setInterval(() => {
        if (!target.isConnected) {
          clearInterval(timer);
          return;
        }
        target.textContent = text.slice(0, ++n);
        if (n >= text.length) clearInterval(timer);
      }, 32);
      cancelTyping = () => clearInterval(timer);
    }
    bind("brief-skip", enter);
    bind("brief-next", () => {
      audio.sfx("click");
      if (index === 0) {
        index = 1;
        show();
      } else enter();
    });
    document.querySelectorAll<HTMLButtonElement>("[data-intro]").forEach(
      (b) =>
        (b.onclick = () => {
          index = Number(b.dataset.intro);
          show();
        }),
    );
    if (index === 0) audio.speak("yono-message");
  };
  show();
}
function tutorial() {
  modal(
    `${header("Cara main", "Ikuti jejak Yono.")}<div class="guide-grid"><div><b>Periksa ruangan</b><p>Klik cincin di dekat orang atau benda. Tekan O buat daftar objek.</p></div><div><b>Baca bukti</b><p>Map di pojok nyimpen semua temuan lo. Cocokkan isinya dengan keterangan saksi.</p></div><div><b>Uji sambungannya</b><p>Delapan analisis Laravel muncul sesudah observasi. Cuma jawaban pertama yang dihitung skor.</p></div><div><b>Kalau mentok</b><p>Buka Petunjuk. Bantuan dan salah pilih bukti nggak ngurangin skor.</p></div></div><button id="understood" class="primary">${state ? "Balik ke kasus" : "Paham"} ${icon("arrow", 18)}</button>`,
    true,
    false,
    "drawer",
  );
  bind("understood", closeModal);
}
function home() {
  audio.setTheme("menu");
  audio.setRoom("lobby");
  worldReady = false;
  game?.destroy(true);
  game = undefined;
  world = undefined;
  state = undefined;
  const saved = loadSave();
  app.innerHTML = `<main class="landing cinema-landing"><div class="landing-photo"></div><div class="landing-shade"></div><header class="landing-header"><a class="wordmark" href="/" aria-label="Di atas tujuh">D<span>/</span>7</a><button class="outline-btn" id="home-audio">${icon("sound", 18)}<span>Audio</span></button></header><div class="landing-content"><section class="title-block"><p class="landing-subtitle">Sebuah kasus Laravel</p><h1>Di atas<br><em>tujuh.</em></h1><p class="tagline">Gedungnya tujuh lantai.<br>Pesan terakhirnya dari lantai delapan.</p><button class="text-btn" id="home-guide">Baca cara main ${icon("arrow", 18)}</button></section><section class="entry-card"><h2>Lo yang pegang kasusnya.</h2><p class="entry-copy">Isi identitas buat hasil praktikum lo.<br>Setelah ini, kita buka pesan terakhir Yono.</p><form id="identity-form"><label>Nama lengkap<input id="name" name="name" required maxlength="80" autocomplete="name" placeholder="Nama lo"></label><div class="form-row"><label>NIM<input id="student" name="student" required maxlength="40" autocomplete="off" placeholder="Nomor mahasiswa"></label><label>Kelas<input id="kelas" name="kelas" required maxlength="40" autocomplete="off" placeholder="IT-xx-xx"></label></div><button class="primary" id="start" type="submit">Buka kasus ${icon("arrow", 18)}</button><p id="start-error" class="error" role="alert"></p></form>${saved ? `<button id="resume" class="resume-btn">Lanjutkan kasus ${esc(saved.run.identity.name)} ${icon("arrow", 18)}</button>` : ""}<p class="entry-note">Pengantar Laravel · 8 analisis · Progres tersimpan</p></section></div><footer class="landing-footer"><span>Praktikum pemrograman web · Week 10</span><a href="/verify">Verifikasi hasil ${icon("arrow", 16)}</a></footer></main>${common}`;
  $("identity-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    if (saved) {
      modal(
        `${header("SESI BARU", "Mulai penyelidikan baru?")}<p>Progres yang tersimpan di perangkat ini akan diganti. Bukti hasil yang sudah diunduh tetap dapat diverifikasi.</p><div class="actions"><button id="keep-run" class="secondary">Kembali</button><button id="new-run" class="primary">Mulai baru ${icon("arrow", 18)}</button></div>`,
      );
      bind("keep-run", closeModal);
      bind("new-run", () => {
        closeModal();
        void startRun();
      });
    } else void startRun();
  });
  bind("resume", () => void resumeRun(saved!));
  bind("home-guide", tutorial);
  bind("home-audio", settings);
}
async function startRun() {
  if (busy) return;
  busy = true;
  $<HTMLButtonElement>("start").disabled = true;
  $("start-error").textContent = "";
  try {
    await audio.unlock();
    const identity: Identity = {
      name: $<HTMLInputElement>("name").value,
      student: $<HTMLInputElement>("student").value,
      kelas: $<HTMLInputElement>("kelas").value,
    };
    const r = await api("start", { identity });
    state = {
      v: 1,
      token: r.token,
      run: r.run,
      location: "lobby",
      clues: ["message"],
      flags: {},
      log: [],
      closed: false,
      reviews: [],
    };
    checkpoint();
    briefing();
  } catch (e) {
    $("start-error").textContent = (e as Error).message;
  } finally {
    busy = false;
    if ($("start")) $<HTMLButtonElement>("start").disabled = false;
  }
}
async function resumeRun(saved: Save) {
  if (busy) return;
  busy = true;
  try {
    await audio.unlock();
    const r = await api("resume", { token: saved.token });
    state = { ...saved, run: r.run };
    if (!state.flags.briefingDone) briefing();
    else await mountGame();
  } catch (e) {
    modal(
      `${header("LANJUTKAN SESI", "Progres belum bisa dibuka.")}<p class="error">${esc((e as Error).message)}</p><p>Coba lagi jika koneksi terputus. Kalau sesi lama sudah tidak berlaku, kembali ke menu dan isi identitas untuk memulai kasus baru.</p><div class="actions"><button id="retry-resume" class="primary">Coba lanjutkan lagi ${icon("arrow", 18)}</button><button id="resume-menu" class="secondary">Kembali ke menu awal</button></div>`,
    );
    bind("retry-resume", () => {
      closeModal();
      void resumeRun(saved);
    });
    bind("resume-menu", () => {
      closeModal();
      home();
    });
  } finally {
    busy = false;
  }
}
async function mountGame() {
  app.innerHTML = `<main class="cinema-game"><div class="scene-stage"><div id="world"></div><div class="scene-scrim"></div><div id="loading" class="loading"><span class="loading-mark">D / 7</span><p>Ngebuka tempat kejadian…</p></div></div><header class="cinema-header"><button class="wordmark" id="brand-game" aria-label="Jeda permainan">D<span>/</span>7</button><button class="place-heading" id="places-btn" aria-label="Pindah lokasi"><span id="location-heading"></span>${icon("location", 16)}</button><nav class="scene-tools" aria-label="Peralatan penyelidikan"><button id="objects-btn" aria-label="Daftar objek" title="Daftar objek">${icon("objects")}</button><button id="journal-btn" aria-label="Catatan" title="Catatan">${icon("notes")}</button><button id="hint-btn" aria-label="Petunjuk" title="Petunjuk">${icon("hint")}</button><button id="settings-btn" aria-label="Jeda" title="Jeda">${icon("pause")}</button><span class="player-avatar" id="player-name" title="Penyelidik">${portrait("Detektif")}</span></nav></header><p id="objective" class="scene-objective" role="status"></p><button id="evidence-btn" class="case-map-button" aria-label="Papan bukti">${icon("map")}<span id="evidence-count"></span></button><div id="floor-panel"></div></main>${common}`;
  bind("journal-btn", journal);
  bind("hint-btn", hints);
  bind("settings-btn", settings);
  bind("brand-game", settings);
  bind("evidence-btn", evidenceList);
  bind("objects-btn", objectList);
  bind("places-btn", locationList);
  $("player-name").title = state!.run.identity.name;
  $("player-name").textContent = state!.run.identity.name
    .trim()
    .charAt(0)
    .toUpperCase();
  renderHUD();
  try {
    const { createWorld } = await import("./world");
    const out = createWorld($("world"), inspect, () => {
      worldReady = true;
      $("loading").hidden = true;
      world!.reduced = reduced;
      world!.loadPlace(state!.location);
      audio.setRoom(state!.location);
      renderHUD();
      if (state!.closed) void results();
      else if (!flag("briefingDone")) briefing();
      else if (state!.pending) void openQuiz();
      else if (flag("startWithAllie")) {
        delete state!.flags.startWithAllie;
        checkpoint();
      }
    });
    world = out.scene;
    game = out.game;
  } catch (e) {
    $("loading").innerHTML =
      "<p>Ruangannya belum kebuka. Muat ulang buat coba lagi.</p>";
    console.error(e);
  }
}
function objectList() {
  modal(
    `${header("Di ruangan ini", "Periksa sekitar")}<div class="object-list">${places[state!.location].hotspots.map((h) => `<button data-hotspot="${h.id}">${icon(h.person ? "notes" : "eye", 18)}<span>${esc(h.label)}</span>${icon("arrow", 18)}</button>`).join("")}</div><label class="toggle"><input id="highlight-btn" type="checkbox"> Tampilkan nama objek</label>`,
  );
  document.querySelectorAll<HTMLButtonElement>("[data-hotspot]").forEach(
    (b) =>
      (b.onclick = () => {
        const h = places[state!.location].hotspots.find(
          (h) => h.id === b.dataset.hotspot,
        )!;
        closeModal();
        world?.inspect(h);
      }),
  );
  $("modal").dataset.mode = "objects";
  $<HTMLInputElement>("highlight-btn").checked = !!world?.labelsVisible;
  bind("highlight-btn", () => world?.highlight());
  $("dialog-card").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const all = Array.from(
        $("dialog-card").querySelectorAll<HTMLButtonElement>("[data-hotspot]"),
      );
      const i = all.indexOf(document.activeElement as HTMLButtonElement);
      all[
        (i + (e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length
      ]?.focus();
    }
  });
}
function locationList() {
  modal(
    `${header("Gedung W", "Lo mau ke mana?")}<nav class="object-list">${availablePlaces(
      state!,
    )
      .map(
        (id) =>
          `<button data-place="${id}" ${id === state!.location ? "disabled" : ""}>${icon("location", 18)}<span>${places[id].name}</span>${icon("arrow", 18)}</button>`,
      )
      .join("")}</nav>`,
  );
  document.querySelectorAll<HTMLButtonElement>("[data-place]").forEach(
    (b) =>
      (b.onclick = () => {
        closeModal();
        travel(b.dataset.place as Place);
      }),
  );
}
function unlocked(id: Place) {
  return !!state && availablePlaces(state).includes(id);
}
function objective(): [string, string] {
  const step = nextStep(state!);
  return [step.title, step.detail];
}
function leadLabel(step: Step) {
  return state?.location !== step.place
    ? "Pergi ke " + places[step.place].name
    : step.cta;
}
function goNext() {
  if (!state || !worldReady) return;
  if (modalOpen) {
    modalCanClose = true;
    closeModal();
  }
  const step = nextStep(state);
  if (step.kind === "complete") {
    void results();
    return;
  }
  if (state.location !== step.place) {
    travel(step.place);
    toast("Tiba di " + places[step.place].name + ". " + step.title);

    return;
  }
  const h = places[step.place].hotspots.find((h) => h.id === step.hotspot);
  if (h) world?.inspect(h);
}
function progressSummary(title: string, detail: string) {
  renderHUD();
  const step = nextStep(state!);
  modal(
    `${header("Jejaknya nyambung", esc(title), false)}<p class="discovery-meaning">${esc(detail)}</p><div class="next-lead"><p class="eyebrow">Berikutnya · ${esc(places[step.place].name)}</p><h3>${esc(step.title)}</h3><p>${esc(step.detail)}</p></div><div class="actions"><button id="follow-lead" class="primary">${esc(leadLabel(step))} ${icon("arrow", 18)}</button><button id="stay-scene" class="secondary">Balik ke ruangan</button></div>`,
    false,
  );
  bind("follow-lead", goNext);
  bind("stay-scene", () => {
    modalCanClose = true;
    closeModal();
  });
}
function renderHUD() {
  if (!state || !$("objective")) return;
  const step = nextStep(state);
  $("objective").textContent =
    state.location === step.place
      ? step.title
      : `${step.title} ${places[step.place].name}.`;
  $("location-heading").textContent = places[state.location].name;
  $("evidence-count").textContent = String(state.clues.length);
  $("floor-panel").innerHTML =
    `<button id="floor-toggle" aria-label="Panel lift, progres Laravel">${icon("lift")}</button><div class="floor-buttons" aria-label="Progres analisis Laravel">${floorsMarkup()}</div>`;
  bind("floor-toggle", floorList);
  bindFloors();
  audio.setTension(done() >= 7 ? 0.85 : done() >= 5 ? 0.5 : 0.1);
  audio.setTheme(done() >= 7 ? "reveal" : "explore");
  world?.setProgress(done());
  world?.setFocus(state.location === step.place ? step.hotspot : undefined);
}
function travel(id: Place) {
  if (!unlocked(id) || modalOpen || !worldReady || id === state!.location)
    return;
  state!.location = id;
  checkpoint();
  world?.loadPlace(id);
  audio.setRoom(id);
  audio.sfx(id === "lift" ? "lift" : "door");
  if (id === "lift") audio.speak("lift-seven");
  renderHUD();
}
function inspect(h: Hotspot) {
  audio.sfx("click");
  if (h.person) {
    openPerson(h.person);
    return;
  }
  if (h.quiz !== undefined) {
    if (h.quiz < done()) {
      clue(quizRewards[h.quiz]);
      return;
    }
    const step = nextStep(state!);
    if (
      h.quiz !== done() ||
      step.hotspot !== h.id ||
      step.place !== state!.location
    ) {
      modal(
        `${header("URUTAN PENYELIDIKAN", "Ada jejak yang perlu lo cek dulu.")}<p>${esc(step.detail)}</p><button id="required-step" class="primary">${esc(leadLabel(step))} ${icon("arrow", 18)}</button>`,
      );
      bind("required-step", goNext);
      return;
    }
    const n = h.quiz,
      note = challengeNotes[n];
    modal(
      `${header("Periksa bukti", esc(h.label))}<div class="inspection-notes"><section><p class="eyebrow">Yang lo lihat</p><p>${esc(note.look)}</p></section><section><p class="eyebrow">Kenapa penting?</p><p>${esc(note.meaning)}</p></section></div><div class="learning-bridge"><span>Analisis Laravel</span><h3>${esc(note.concept)}</h3><p>${esc(note.why)}</p></div><button id="begin-analysis" class="primary">Mulai analisis ${icon("arrow", 18)}</button>`,
      true,
      true,
    );
    bind("begin-analysis", () => void openQuiz());
    return;
  }
  if (h.id === "stairs") {
    dialogue(
      [
        {
          who: "Noah",
          text: "Tangga ini menghubungkan kantor dengan arsip. Jalur utamanya ada di pintu arsip sebelah panel.",
        },
      ],
      () =>
        progressSummary(
          "Ada jalur lain.",
          "Tangga servis menjelaskan bagaimana paket bisa berpindah tanpa melewati lobi.",
        ),
    );
    return;
  }
  if (h.id === "manifest") {
    if (!flag("yonoFound")) {
      progressSummary(
        "Dengarkan orang yang ada di ruangan ini dulu.",
        "Yono bisa menjelaskan apa yang sebenarnya terjadi pada kirimannya.",
      );
      return;
    }
    addClue("manifest");
    clue("manifest", () =>
      progressSummary(
        "Daftar asli menguatkan kesaksian Yono.",
        evidence.manifest.description,
      ),
    );
    return;
  }
  if (h.id === "conclusion") conclusion();
}
function bindClues(returnTo?: () => void) {
  document
    .querySelectorAll<HTMLButtonElement>("[data-clue]")
    .forEach((b) => (b.onclick = () => clue(b.dataset.clue!, returnTo)));
}
function clue(id: string, after?: () => void) {
  const e = evidence[id];
  audio.sfx("paper");
  modal(
    `${header(esc(e.tag), esc(e.title))}<div class="evidence-detail"><span class="prop prop-large" style="--col:${e.frame % 4};--row:${Math.floor(e.frame / 4)}"></span><div>${e.quote ? `<blockquote>${esc(e.quote)}</blockquote>` : ""}<p class="${["access", "report", "ledger", "manifest"].includes(id) ? "printed-log" : ""}">${esc(e.description)}</p></div></div><button id="clue-close" class="primary">${after === evidenceList ? "Kembali ke papan bukti" : after === journal ? "Kembali ke catatan" : after ? "Lanjutkan pemeriksaan" : "Tutup bukti"} ${icon("arrow", 18)}</button>`,
  );
  bind("clue-close", () => {
    closeModal();
    after?.();
  });
}
const evidenceLinks = [
  ["message", "photo"],
  ["ledger", "access"],
  ["plan", "report"],
  ["photo", "report"],
  ["cctv", "ledger"],
  ["parcel", "manifest"],
  ["access", "key"],
  ["access", "manifest"],
];
function evidenceList() {
  audio.sfx("paper");
  const ids = state!.clues;
  const point = (i: number) => ({
    x: 150 + (i % 4) * 230,
    y: 135 + Math.floor(i / 4) * 225,
  });
  const threads = evidenceLinks
    .filter(([a, b]) => has(a) && has(b))
    .map(([a, b]) => {
      const p = point(ids.indexOf(a)),
        q = point(ids.indexOf(b));
      return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;
    })
    .join("");
  modal(
    `${header("Map kasus", "Jejak yang lo pegang")}<div class="corkboard-wrap"><div class="corkboard"><svg class="evidence-threads" viewBox="0 0 1000 720" preserveAspectRatio="none" aria-label="Hubungan antar bukti" role="img">${threads}</svg>${ids.map((id, i) => `<button class="pinned-evidence ${["access", "report", "ledger", "manifest"].includes(id) ? "paper-note" : "photo-note"}" data-clue="${id}" style="--x:${point(i).x / 10}%;--y:${point(i).y / 7.2}%;--tilt:${[-3, 2, -1, 3][i % 4]}deg"><span class="pin"></span><span class="prop" style="--col:${evidence[id].frame % 4};--row:${Math.floor(evidence[id].frame / 4)}"></span><b>${esc(evidence[id].title)}</b><small>${esc(evidence[id].tag.toLocaleLowerCase("id-ID"))}</small></button>`).join("")}</div></div>`,
    true,
    true,
    "board",
  );
  bindClues(evidenceList);
}
function journal() {
  const step = nextStep(state!);
  modal(
    `${header("Catatan", "Kasus Yono")}<section class="notebook-objective"><h3>${esc(step.title)}</h3><p>${esc(step.detail)}</p><p class="muted">${esc(places[step.place].name)}</p></section><h3>Yang sudah ketahuan</h3><div class="notebook-clues">${state!.clues.map((id) => `<button data-clue="${id}"><b>${esc(evidence[id].title)}</b><span>${esc(evidence[id].description)}</span></button>`).join("")}</div><details class="notebook-log"><summary>Log percakapan</summary><div class="log-list">${state!.log.map((l) => `<article><b>${esc(l.who)}</b><p>${esc(l.text)}</p></article>`).join("") || "<p>Belum ada percakapan.</p>"}</div></details>${state!.reviews.length ? '<button id="review-btn" class="secondary">Ulas analisis Laravel</button>' : ""}`,
    true,
    false,
    "drawer",
  );
  bindClues(journal);
  bind("review-btn", review);
}
function floorsMarkup() {
  return challengeNotes
    .map(
      (n, i) =>
        `<span class="floor-wrap"><button data-floor="${i}" class="floor-button ${i < done() ? "floor-done" : i === done() ? "floor-active" : ""}" aria-label="${i + 1}. ${esc(n.concept)}${i < done() ? ", selesai" : i === done() ? ", analisis berikutnya" : ", belum terbuka"}" ${i > done() ? "disabled" : ""}><span>${i + 1}</span>${i === 7 && done() < 7 ? icon("lock", 12) : ""}</button><span class="floor-tooltip">${esc(n.concept)}${i < done() ? " · selesai" : ""}</span></span>`,
    )
    .join("");
}
function bindFloors() {
  document.querySelectorAll<HTMLButtonElement>("[data-floor]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.floor),
          n = challengeNotes[i];
        if (i < done()) {
          const f = state!.reviews.find((f) => f.question.number === i + 1);
          if (f) {
            modal(
              `${header("Analisis selesai", n.concept)}<p>${esc(f.explanation)}</p><pre>${esc(expectedText(f))}</pre>`,
            );
            return;
          }
        }
        modal(
          `${header("Analisis berikutnya", n.concept)}<p>${esc(n.why)}</p><p>${esc(nextStep(state!).detail)}</p>`,
        );
      }),
  );
}
function floorList() {
  modal(
    `${header("Panel lift", "Delapan sambungan")}<div class="floors-mobile">${floorsMarkup()}</div>`,
    true,
    false,
    "drawer",
  );
  bindFloors();
}
function openPerson(id: Person) {
  if (id === "yono") {
    if (flag("yonoFound")) {
      dialogue(
        [
          {
            who: "Yono",
            text: "Daftar kiriman aslinya ada di meja. Itu yang perlu dicocokkan dengan kartu Tedar.",
          },
        ],
        () =>
          progressSummary(
            "Yono sudah aman.",
            "Daftar di meja arsip bisa menguatkan keterangannya.",
          ),
      );
      return;
    }
    dialogue(
      [
        { who: "Yono", text: people.yono.intro },
        {
          who: "Yono",
          text: "Tedar menyuruh gue ke arsip. Gue lihat paket-paket yang nomornya ada di daftar kiriman. Pas gue tanya, dia bawa paket gue pergi dan mengunci pintu dari luar.",
        },
      ],
      () => {
        state!.flags.yonoFound = true;
        checkpoint();
        progressSummary(
          "Yono ditemukan.",
          "Dia mengaku dikunci di arsip oleh Tedar. Periksa daftar kiriman asli untuk menguatkan keterangannya.",
        );
      },
    );
    return;
  }
  const step = nextStep(state!);
  if (step.kind === "confront" && step.hotspot === id) {
    chooseProof(id);
    return;
  }
  const key = id + "Briefed";
  if (!flag(key)) {
    const follow: Record<string, string> = {
      allie:
        "Yono menulis buku tamu sebelum naik. Coba periksa buku di meja gue; tujuan dan instruksi penerimanya ada di situ.",
      noah: "Laporan gue tersimpan di panel pemeriksaan. Lihat dulu sebelum kita menyimpulkan lift bermasalah.",
      wiwo: "Gue minta audit karena ada kiriman yang tercatat diterima, tapi tidak sampai ke kantor. Paket YN07 di samping meja membawa salinan daftarnya.",
      tedar:
        "Kalau lo mau memeriksa waktu pulang gue, terminal akses ada di meja. Tapi gue yakin tidak ada yang aneh.",
    };
    dialogue([{ who: people[id].name, text: people[id].intro }], () => {
      const question: Record<string, string> = {
        allie: "Yono diarahkan ke mana?",
        noah: "Ada catatan kondisi lift?",
        wiwo: "Kenapa lo minta audit?",
        tedar: "Ada catatan waktu pulang lo?",
      };
      const ask = () =>
        dialogue([{ who: people[id].name, text: follow[id] }], () => {
          state!.flags[key] = true;
          state!.flags["seen-" + id] = true;
          checkpoint();
          progressSummary(
            "Keterangan " + people[id].name + " dicatat.",
            follow[id],
          );
        });
      modal(
        `<div class="vn-top"><span id="modal-title" class="speaker-tab">Tanya ${people[id].name}</span></div><div class="vn-choices"><button id="witness-question">${esc(question[id])} ${icon("arrow", 18)}</button><button id="witness-repeat">Ulangi keterangan lo tadi.</button></div>`,
        false,
        false,
        "dialogue",
      );
      world?.setSpeaker?.(id);
      bind("witness-question", ask);
      bind("witness-repeat", () =>
        dialogue([{ who: people[id].name, text: people[id].intro }], ask),
      );
    });
    return;
  }
  personMenu(id);
}
function personMenu(id: Person) {
  const p = people[id],
    checked =
      (id === "allie" && flag("allieTruth")) ||
      (id === "noah" && flag("noahTruth")) ||
      (id === "tedar" && flag("tedarTruth"));
  modal(
    `${header(p.role, p.name)}<div class="person-summary">${portrait(p.name)}<div><p>${esc(p.intro)}</p><small>${checked ? "Keterangan ini sudah lo cocokkan dengan bukti." : "Ini keterangan awal. Bandingkan dengan bukti yang ditemukan."}</small></div></div><div class="person-options"><button id="ask-person">Apa yang lo lihat semalam? <span>${icon("arrow", 18)}</span></button><button id="show-proof">Ada bukti yang perlu lo jelasin. <span>${icon("map", 18)}</span></button></div><button id="person-next" class="primary">${esc(leadLabel(nextStep(state!)))} ${icon("arrow", 18)}</button>`,
  );
  bind("ask-person", () => askPerson(id));
  bind("show-proof", () => chooseProof(id));
  bind("person-next", goNext);
}
function askPerson(id: Person) {
  const texts: Record<string, string> = {
    allie:
      "Gue mengaku di meja saat Yono naik. Kalau ada rekaman yang menunjukkan hal berbeda, tunjukkan ke gue.",
    noah: "Denah pengunjung tidak lengkap. Lihat bagian yang ditutup, lalu cocokkan dengan laporan gue di panel.",
    wiwo: "Nomor paket yang sama ada di daftar diterima dan daftar hilang. Itu alasan gue meminta pemeriksaan kiriman.",
    tedar:
      "Gue pulang tepat pukul 20.00. Catatan kartu akses, kalau ada, seharusnya bisa menjelaskan waktunya.",
  };
  dialogue([{ who: people[id].name, text: texts[id] }], () => personMenu(id));
}
const testimony: Record<
  string,
  { statement: string; question: string; candidates: string[] }
> = {
  allie: {
    statement: "Gue di meja waktu Yono masuk lift.",
    question: "Bukti mana yang bisa memeriksa posisi Allie pada waktu itu?",
    candidates: ["message", "ledger", "cctv"],
  },
  noah: {
    statement: "Denah pengunjung hanya mencatat tujuh lantai.",
    question:
      "Tunjukkan dokumen yang perlu dijelaskan Noah. Apa yang hilang dari denah umum?",
    candidates: ["plan", "report", "photo"],
  },
  tedar: {
    statement: "Gue meninggalkan kantor tepat jam delapan.",
    question:
      "Bukti mana yang menunjukkan Tedar masih memakai akses setelah pukul 20.00?",
    candidates: ["parcel", "access", "photo"],
  },
  wiwo: {
    statement:
      "Ada kiriman yang tercatat diterima, tapi tidak sampai ke kantor.",
    question:
      "Bukti mana yang berhubungan dengan daftar kiriman yang diperiksa Wiwo?",
    candidates: ["ledger", "message", "parcel"],
  },
};
function chooseProof(id: Person, feedback = "") {
  const t = testimony[id],
    available = t.candidates.filter(has);
  modal(
    `${header("BANDINGKAN KETERANGAN", esc(people[id].name))}<blockquote class="witness-quote">“${esc(t.statement)}”</blockquote><p class="proof-question">${esc(t.question)}</p>${feedback ? `<p class="proof-feedback" role="status">${esc(feedback)}</p>` : ""}<div class="proof-options proof-options-detailed">${available.map((c) => `<button data-show="${c}"><span class="prop" style="--col:${evidence[c].frame % 4};--row:${Math.floor(evidence[c].frame / 4)}"></span><span><b>${esc(evidence[c].title)}</b><small>${esc(evidence[c].description)}</small></span><span>${icon("arrow", 18)}</span></button>`).join("")}</div>${available.length ? "" : "<p>Belum ada bukti terkait yang dicatat. Periksa petunjuk aktif lebih dulu.</p>"}<div class="actions"><button id="back-person" class="secondary">Balik ke saksi</button><button id="proof-next" class="text-btn">Lihat langkah penyelidikan ${icon("arrow", 18)}</button></div>`,
    true,
    true,
  );
  bind("back-person", () => personMenu(id));
  bind("proof-next", () => {
    closeModal();
    hints();
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-show]")
    .forEach((b) => (b.onclick = () => showProof(id, b.dataset.show!)));
}
function showProof(id: Person, c: string) {
  const responses: Record<
    string,
    { flag: string; title: string; reply: string; meaning: string }
  > = {
    allie: {
      flag: "allieTruth",
      title: "Allie mengoreksi keterangannya.",
      reply:
        "Oke. Gue ke belakang dari 20.13 sampai 20.24. Sebelum pergi gue dengar Yono ditelepon Tedar dan disuruh langsung naik. Gue tidak melihat dia masuk lift.",
      meaning:
        "Rekaman membantah klaim Allie berjaga. Dia menyembunyikan meninggalkan pos, tetapi menyebut Tedar sebagai pemberi arahan.",
    },
    noah: {
      flag: "noahTruth",
      title: "Denah ternyata tidak lengkap.",
      reply:
        "Di bagian yang ditutup itu ada arsip atap. Penomoran servis lamanya 8. Aksesnya memakai kartu eksekutif. Jadi bukan lantai gaib—ruangan itu sengaja tidak dicantumkan untuk pengunjung.",
      meaning:
        "Pesan Yono masuk akal: dia mencapai arsip lewat akses servis. Selidiki siapa yang punya akses dan kenapa paket sudah di kantor.",
    },
    tedar: {
      flag: "tedarTruth",
      title: "Waktu pada log membantah alibi.",
      reply:
        "Kartu TD-02 memang punya gue. Gue… kembali mengambil berkas. Tapi penggunaan kartu saja belum menjelaskan semua yang terjadi di arsip.",
      meaning:
        "Tedar mengaku pulang pukul 20.00, tetapi kartunya membuka arsip 20.18 dan kantor 20.31. Noah kini bisa membantu membuka akses untuk mencari Yono.",
    },
    wiwo: {
      flag: "wiwoProof",
      title: "Tujuan paket menjadi jelas.",
      reply:
        "Daftar itu salinan audit. Yang asli seharusnya bersama Yono. Gue minta keamanan ikut memeriksa jika ada pengalihan kiriman.",
      meaning:
        "Paket itu berisi catatan kiriman bermasalah; isinya memberi alasan seseorang ingin menghentikan Yono.",
    },
  };
  const correct =
    (id === "allie" && c === "cctv") ||
    (id === "noah" && (c === "plan" || c === "report")) ||
    (id === "tedar" && c === "access") ||
    (id === "wiwo" && c === "parcel");
  if (!correct) {
    audio.sfx("paper");
    chooseProof(
      id,
      "Belum nyambung. Cocokkan waktunya dengan ucapan saksi. Coba bukti lain; skor lo aman.",
    );
    return;
  }
  const response = responses[id];
  state!.flags[response.flag] = true;
  checkpoint();
  renderHUD();
  audio.sfx("connect");
  remember({ who: "Detektif", text: "Menunjukkan " + evidence[c].title });
  remember({ who: people[id].name, text: response.reply });
  const next = nextStep(state!);
  modal(
    `${header("Buktinya nyambung", response.title, false)}<div class="contradiction"><section><p class="eyebrow">Ucapan saksi</p><blockquote>“${esc(testimony[id].statement)}”</blockquote></section><section><p class="eyebrow">Bukti · ${esc(evidence[c].title)}</p><p>${esc(evidence[c].description)}</p></section></div><p class="witness-reply"><b>${esc(people[id].name)}:</b> “${esc(response.reply)}”</p><p class="discovery-meaning">${esc(response.meaning)}</p><div class="actions"><button id="proof-continue" class="primary">${esc(leadLabel(next))} ${icon("arrow", 18)}</button><button id="proof-stay" class="secondary">Balik ke ruangan</button></div>`,
    false,
    true,
  );
  bind("proof-continue", goNext);
  bind("proof-stay", () => {
    modalCanClose = true;
    closeModal();
  });
}
const analysisFrames = [
  "Kayak gedung ini: ada yang nyimpen catatan, nampilin isi, dan ngarahin permintaan.",
  "Berkas punya alamatnya sendiri. Cari ruangan yang tepat di struktur Laravel.",
  "Route itu pintu masuk: alamat dan jenis permintaannya harus cocok.",
  "Noah butuh pengendali lift. Artisan yang nyiapin berkasnya.",
  "Ikuti permintaan seperti ngikutin kurir: masuk, diarahkan, lalu pulang bawa respons.",
  "Blade nyusun halaman lampiran; asset dan CSRF melengkapi isinya.",
  "Satu kiriman, beberapa tindakan. Resource route nentuin pintu masuknya.",
  "Sambungkan pintu, pengendali, dan tampilan untuk membuka rangkaian terakhir.",
];
function analysisReferences(q: Question) {
  const ids = (
    q.number === 1
      ? ["message"]
      : q.number === 2
        ? ["ledger"]
        : q.number === 3
          ? ["plan", "ledger"]
          : q.number === 4
            ? ["plan", "cctv"]
            : q.number === 5
              ? ["report"]
              : q.number === 6
                ? ["photo", "report"]
                : q.number === 7
                  ? ["parcel", "ledger"]
                  : ["access", "report"]
  ).filter(has);
  return `<details class="analysis-references"><summary>Buka bukti rujukan</summary>${ids.map((id) => `<article><b>${esc(evidence[id].title)}</b><p>${esc(evidence[id].description)}</p></article>`).join("")}</details>`;
}
async function openQuiz() {
  if (!state) return;
  modal(
    `${header("TANTANGAN LARAVEL", "Nyambungin analisis…")}<p class="muted">Sebentar, kita buka catatannya.</p>`,
  );
  const revision = panelRevision;
  try {
    const { question } = await api("question", { token: state.token });
    if (!modalOpen || revision !== panelRevision) return;
    renderQuiz(question);
    if (state.pending?.questionId === question.id)
      void submitQuiz(question, state.pending!.answer);
  } catch (e) {
    if (!modalOpen || revision !== panelRevision) return;
    modal(
      `${header("KONEKSI", "Analisisnya belum kebuka.")}<p class="error">${esc((e as Error).message)}</p><button id="retry-question" class="primary">Coba lagi ${icon("arrow", 18)}</button>`,
    );
    bind("retry-question", () => void openQuiz());
  }
}
function renderQuiz(q: Question) {
  let answer: Answer =
    q.kind === "single"
      ? ""
      : q.kind === "match"
        ? Array(q.rows!.length).fill("")
        : [];
  let rendered = false;
  const render = () => {
    const scroll = rendered ? $("dialog-card").scrollTop : 0;
    rendered = true;
    modal(
      `${header(challengeNotes[q.number - 1].concept, esc(q.title))}<p class="analysis-metaphor">${esc(analysisFrames[q.number - 1])}</p>${analysisReferences(q)}<p class="quiz-context">${esc(q.context)}</p><p class="quiz-instruction">${esc(q.instruction)}</p><form id="quiz-form">${q.kind === "single" ? `<div class="quiz-options">${q.options.map((o, i) => `<label class="code-option"><input type="radio" name="answer" value="${o.id}" required><span class="option-letter">${String.fromCharCode(65 + i)}</span><code>${esc(o.text)}</code></label>`).join("")}</div>` : q.kind === "match" ? `<div class="match-rows">${q.rows!.map((r, i) => `<label><span>${esc(r)}</span><select id="match-${i}" required><option value="">Pilih pasangan…</option>${q.options.map((o) => `<option value="${o.id}">${esc(o.text)}</option>`).join("")}</select></label>`).join("")}</div>` : `<div class="order-chosen" aria-live="polite">${(answer as string[]).length ? (answer as string[]).map((id, i) => `<span><b>${i + 1}</b>${esc(q.options.find((o) => o.id === id)!.text)}</span>`).join("") : '<span class="muted">Urutan pilihanmu akan muncul di sini.</span>'}</div><div class="order-options">${q.options.map((o) => `<button type="button" data-order="${o.id}" ${(answer as string[]).includes(o.id) ? "disabled" : ""}>${esc(o.text)} <span>+</span></button>`).join("")}</div><button id="reset-order" type="button" class="text-btn">Reset urutan</button>`}<div class="quiz-submit">${q.number === 1 ? "<p>Cuma jawaban pertama yang dihitung skor. Periksa dulu sebelum kirim.</p>" : "<p>Baca ulang sebelum kirim.</p>"}<button class="primary" id="send-answer" type="submit">Kirim jawaban ${icon("arrow", 18)}</button></div><p class="error" id="quiz-error" role="alert"></p></form>`,
      true,
      true,
      "analysis",
    );
    $("dialog-card").scrollTop = scroll;
    $("quiz-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (busy) return;
      if (q.kind === "single")
        answer =
          (new FormData($<HTMLFormElement>("quiz-form")).get(
            "answer",
          ) as string) || "";
      if (q.kind === "match")
        answer = q.rows!.map(
          (_, i) => $<HTMLSelectElement>("match-" + i).value,
        );
      if (
        (q.kind === "single" && !answer) ||
        (Array.isArray(answer) &&
          (answer.length !==
            (q.kind === "order" ? q.options.length : q.rows!.length) ||
            answer.some((a) => !a)))
      ) {
        $("quiz-error").textContent = "Lengkapi dulu semua bagiannya.";
        return;
      }
      void submitQuiz(q, answer);
    });
    if (q.kind === "order") {
      document.querySelectorAll<HTMLButtonElement>("[data-order]").forEach(
        (b) =>
          (b.onclick = () => {
            (answer as string[]).push(b.dataset.order!);
            audio.sfx("click");
            render();
          }),
      );
      bind("reset-order", () => {
        answer = [];
        render();
      });
    }
  };
  render();
}
async function submitQuiz(q: Question, answer: Answer) {
  if (busy) return;
  busy = true;
  state!.pending = { questionId: q.id, answer };
  checkpoint();
  modalCanClose = false;
  if ($("send-answer")) {
    $<HTMLButtonElement>("send-answer").disabled = true;
    $("send-answer").textContent = "Menyimpan jawaban…";
  }
  try {
    const r = await api("submit", {
      token: state!.token,
      questionId: q.id,
      answer,
    });
    state!.token = r.token;
    state!.run = r.run;
    delete state!.pending;
    const feedback: Feedback = {
      question: q,
      correct: r.correct,
      expected: r.expected,
      explanation: r.explanation,
    };
    state!.reviews.push(feedback);
    addClue(quizRewards[q.number - 1]);
    checkpoint();
    renderHUD();
    audio.sfx(r.correct ? "correct" : "wrong");
    showFeedback(feedback);
  } catch (e) {
    modal(
      `${header("JAWABAN BELUM TERSIMPAN", "Sambungkan lagi koneksinya.", false)}<p class="error">${esc((e as Error).message)}</p><p>Jawaban lo aman. Kirim ulang jawaban yang sama setelah koneksi balik.</p><button id="retry-answer" class="primary">Kirim ulang jawaban ${icon("arrow", 18)}</button>`,
      false,
    );
    bind("retry-answer", () => void submitQuiz(q, answer));
  } finally {
    busy = false;
  }
}
function expectedText(f: Feedback) {
  const q = f.question;
  return Array.isArray(f.expected)
    ? f.expected
        .map(
          (id, i) =>
            `${q.kind === "match" ? q.rows![i] : i + 1 + "."} → ${q.options.find((o) => o.id === id)?.text}`,
        )
        .join("\n")
    : q.options.find((o) => o.id === f.expected)?.text || "";
}
function showFeedback(f: Feedback) {
  const clueId = quizRewards[f.question.number - 1],
    ev = evidence[clueId];
  const meaning = rewardLines[f.question.number - 1]
    .map((l) => l.text)
    .join(" ");
  const step = nextStep(state!);
  modal(
    `${header(`ANALISIS LARAVEL ${f.question.number} / 8 · SELESAI`, f.correct ? "Analisis lo nyambung." : "Cek lagi sambungannya.", false)}<p class="analysis-reaction">Detektif: “${f.correct ? "Sambungannya pas. Sekarang kita baca buktinya." : "Gue perlu benerin sambungan ini. Petunjuknya tetap bisa kita periksa."}”</p><span class="score-pill ${f.correct ? "good" : ""}">${f.correct ? "+12,5 poin" : "Skor +0 · kasus tetap lanjut"}</span><details class="feedback-learning" ${f.correct ? "" : "open"}><summary>${f.correct ? "Ulas konsep Laravel" : "Kenapa jawabanmu belum tepat?"}</summary><p>${esc(f.explanation)}</p><pre>${esc(expectedText(f))}</pre></details><section class="discovered-proof"><p class="eyebrow">Bukti baru · ${esc(ev.title)}</p><p>${esc(ev.description)}</p><strong>${esc(meaning)}</strong></section><div class="next-lead"><p class="eyebrow">Berikutnya · ${esc(places[step.place].name)}</p><p>${esc(step.detail)}</p></div><div class="actions"><button id="feedback-next" class="primary">${esc(leadLabel(step))} ${icon("arrow", 18)}</button><button id="stay-scene" class="secondary">Balik ke ruangan</button></div>`,
    false,
    true,
    "analysis",
  );
  bind("feedback-next", goNext);
  bind("stay-scene", () => {
    modalCanClose = true;
    closeModal();
  });
}
function review() {
  modal(
    `${header("ULASAN MATERI", "Delapan sambungan Laravel")}<div class="review-list">${state!.reviews.map((f) => `<details><summary><span class="${f.correct ? "success" : "error"}">${f.correct ? icon("check", 18) : icon("close", 18)}</span> ${f.question.number}. ${esc(f.question.title)}</summary><p>${esc(f.explanation)}</p><pre>${esc(expectedText(f))}</pre></details>`).join("")}</div>`,
    true,
    true,
  );
}
function hints() {
  const [title, description] = objective();
  let level = 0;
  const solutions = hintSteps();
  const render = () => {
    modal(
      `${header("PETUNJUK TANPA PENALTI", esc(title))}<p>${esc(description)}</p><div class="hint-stack">${solutions
        .slice(0, level)
        .map(
          (t, i) => `<article><span>0${i + 1}</span><p>${esc(t)}</p></article>`,
        )
        .join(
          "",
        )}</div><button id="next-hint" class="primary" ${level >= solutions.length ? "disabled" : ""}>${level >= solutions.length ? "Semua arahan sudah terbuka" : "Buka petunjuk " + (level + 1)} ${icon("arrow", 18)}</button><p class="muted">Bantuan ini nggak ngurangin skor.</p><details class="shortcuts"><summary>Shortcut</summary><p>J · Catatan<br>H · Petunjuk<br>P · Jeda<br>O · Daftar objek<br>B · Papan bukti<br>L · Pindah lokasi<br>Spasi · Lengkapi / lanjut dialog<br>Esc · Tutup panel</p></details>`,
      true,
      false,
      "drawer",
    );
    bind("next-hint", () => {
      level++;
      render();
    });
  };
  render();
}
function hintSteps(): string[] {
  const step = nextStep(state!);
  return [
    step.detail,
    `Petunjuk berikutnya ada di ${places[step.place].name}. Cari ${places[step.place].hotspots.find((h) => h.id === step.hotspot)?.label || "hasil penyelidikan"}.`,
    `Klik objeknya di ruangan. Kalau susah dijangkau, buka Daftar objek di header atau tekan O.`,
  ];
}
function conclusion() {
  if (!flag("yonoFound") || !has("manifest")) {
    dialogue([
      {
        who: "Detektif",
        text: "Sebelum menyimpulkan, gue perlu mendengar langsung cerita Yono dan memeriksa daftar kiriman di ruangan ini.",
      },
    ]);
    return;
  }
  modal(
    `${header("REKONSTRUKSI KASUS", "Hubungkan tiga hal terakhir.")}<p>Rangkai kejadian dari bukti lo. Bagian ini nggak ngubah skor Laravel.</p><form id="conclusion-form"><label>Siapa yang mengalihkan kiriman?<select id="deduce-who" required><option value="">Pilih orang…</option><option value="wiwo">Wiwo</option><option value="tedar">Tedar</option><option value="noah">Noah</option><option value="allie">Allie</option></select></label><label>Bagaimana paket sampai ke kantor tanpa Yono lewat lobi?<select id="deduce-route" required><option value="">Pilih jalur…</option><option value="exit">Pintu utama gedung</option><option value="service">Akses dan tangga servis</option><option value="ghost">Lantai supernatural</option></select></label><label>Apa yang ingin ditutupi pelakunya?<select id="deduce-motive" required><option value="">Pilih motif…</option><option value="renovation">Jadwal renovasi biasa</option><option value="parcels">Pengalihan kiriman yang tercatat diterima</option><option value="prank">Lelucon untuk Wiwo</option></select></label><p id="deduce-error" class="error" role="alert"></p><button class="primary" type="submit">Sampaikan kesimpulan ${icon("arrow", 18)}</button></form>`,
  );
  $("conclusion-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const who = $<HTMLSelectElement>("deduce-who").value,
      route = $<HTMLSelectElement>("deduce-route").value,
      motive = $<HTMLSelectElement>("deduce-motive").value;
    if (who !== "tedar" || route !== "service" || motive !== "parcels") {
      $("deduce-error").textContent =
        "Cocokkan lagi kartu TD-02, jalur pada laporan Noah, dan daftar kiriman asli. Tidak ada penalti; coba rangkai ulang.";
      audio.sfx("paper");
      return;
    }
    audio.sfx("connect");
    dialogue(ending, () => {
      state!.closed = true;
      checkpoint();
      void results();
    });
  });
}
function settings() {
  modal(
    `${header("JEDA / PENGATURAN", "Jeda dulu.")}<div class="audio-settings">${(["master", "music", "ambience", "effects", "voice"] as const).map((k, i) => `<label><span>${["Volume utama", "Musik noir", "Suasana ruangan", "Efek suara", "Pesan suara"][i]}</span><input type="range" id="volume-${k}" min="0" max="100" value="${Math.round(audio.levels[k] * 100)}" aria-label="${["Volume utama", "Musik", "Ambience", "Efek", "Suara dialog"][i]}"><output id="value-${k}">${Math.round(audio.levels[k] * 100)}%</output></label>`).join("")}</div><label class="toggle"><input id="spoken" type="checkbox" ${audio.levels.spoken ? "checked" : ""}> Aktifkan pesan suara Yono dan pengumuman lift</label><p class="muted">Dialog lain berupa teks. Tanpa suara pun, semua petunjuk kebaca.</p><label class="toggle"><input id="motion" type="checkbox" ${reduced ? "checked" : ""}> Kurangi animasi</label><div class="actions"><button id="test-audio" class="secondary">Tes suara</button>${state ? '<button id="replay-scene" class="secondary">Lihat ulang ruangan</button><button id="return-menu" class="secondary">Simpan dan keluar</button>' : ""}<button id="continue-game" class="primary">Lanjut main</button></div>`,
    true,
    false,
    "drawer",
  );
  bind("replay-scene", () => {
    closeModal();
    world?.loadPlace(state!.location);
    renderHUD();
  });
  for (const k of ["master", "music", "ambience", "effects", "voice"] as const)
    $<HTMLInputElement>("volume-" + k).oninput = (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      audio.setLevel(k, v / 100);
      $("value-" + k).textContent = v + "%";
    };
  $<HTMLInputElement>("spoken").onchange = (e) =>
    audio.setLevel("spoken", (e.target as HTMLInputElement).checked);
  $<HTMLInputElement>("motion").onchange = (e) => {
    reduced = (e.target as HTMLInputElement).checked;
    try {
      localStorage.setItem("dat-motion", reduced ? "reduced" : "full");
    } catch {}
    if (world) world.reduced = reduced;
    document.documentElement.classList.toggle("reduced", reduced);
  };
  bind("test-audio", () => {
    void audio.unlock().then(() => audio.sfx("lift"));
  });
  bind("continue-game", closeModal);
  bind("return-menu", () => {
    checkpoint();
    closeModal();
    home();
  });
}
async function results() {
  modal(
    `${header("Kasus selesai", "Yono ditemukan.", false)}<p>Menyiapkan hasil tantangan Laravel…</p>`,
    false,
  );
  try {
    if (!state!.receipt) {
      const r = await api("result", { token: state!.token });
      state!.receipt = r.receipt;
      state!.code = r.code;
      checkpoint();
    }
    const r = state!.receipt!;
    modal(
      `${header("Kasus ditutup", "Di atas tujuh.", false)}<div class="results-grid"><div><p class="result-score">${String(r.score).replace(".", ",")}<span>/100</span></p><p>${r.correct} dari 8 jawaban pertama tepat.</p><p class="muted">${esc(r.identity.name)} · ${esc(r.identity.student)} · ${esc(r.identity.kelas)}</p></div><div class="case-outcome"><span class="eyebrow accent">HASIL PENYELIDIKAN</span><h3>Kurirnya pulang.<br>Satu pertanyaan tinggal.</h3><p>Yono selamat. Akses servis dan pengalihan kiriman terbukti. Pengirim foto pertama belum diketahui.</p></div></div><details class="case-timeline"><summary>Urutan kejadian yang berhasil dibuktikan</summary>${caseTimeline.map((e) => `<p><b>${e.time}</b> ${esc(e.detail)}</p>`).join("")}</details><div class="actions"><button id="download-proof" class="primary">Unduh hasil PNG</button><button id="copy-proof" class="secondary">Salin kode verifikasi</button><button id="review-results" class="text-btn">Ulas materi</button></div><p id="copy-status" class="muted" role="status"></p><details><summary>Lihat kode verifikasi</summary><textarea id="proof-code" readonly aria-label="Kode verifikasi hasil">${esc(state!.code)}</textarea><p>Buka <a href="/verify" target="_blank" rel="noopener">halaman verifikasi</a> dan tempel kode ini.</p></details><button id="finish-menu" class="text-btn">Balik ke menu</button>`,
      false,
      true,
    );
    bind("download-proof", () => void downloadProof(r));
    bind("copy-proof", () => {
      void navigator.clipboard
        .writeText(state!.code!)
        .then(
          () =>
            ($("copy-status").textContent =
              "Kode disalin. Kumpulkan bersama PNG hasil."),
        )
        .catch(() => {
          $<HTMLTextAreaElement>("proof-code").parentElement?.setAttribute(
            "open",
            "",
          );
          $<HTMLTextAreaElement>("proof-code").select();
          $("copy-status").textContent =
            "Pilih dan salin kode pada kotak di bawah.";
        });
    });
    bind("review-results", () => {
      review();
      modalCanClose = false;
      const b = document.createElement("button");
      b.className = "primary";
      b.textContent = "Balik ke hasil";
      b.onclick = () => void results();
      $("dialog-card").append(b);
      $("modal-close")?.remove();
    });
    bind("finish-menu", () => {
      modalCanClose = true;
      closeModal();
      home();
    });
  } catch (e) {
    modal(
      `${header("HASIL BELUM DIMUAT", "Kasus tetap tersimpan.", false)}<p class="error">${esc((e as Error).message)}</p><button id="retry-result" class="primary">Muat hasil lagi ${icon("arrow", 18)}</button>`,
      false,
    );
    bind("retry-result", () => void results());
  }
}
async function downloadProof(r: Receipt) {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = 1400;
  c.height = 1000;
  const g = c.getContext("2d")!;
  g.fillStyle = "#101f21";
  g.fillRect(0, 0, 1400, 1000);
  g.strokeStyle = "#cba779";
  g.lineWidth = 2;
  g.strokeRect(35, 35, 1330, 930);
  g.fillStyle = "#d6b484";
  g.font = "500 21px monospace";
  g.fillText("PEMROGRAMAN WEB / WEEK 10 / LARAVEL INTRODUCTION", 80, 100);
  g.fillStyle = "#f2e7d4";
  g.font = "bold 78px Georgia";
  g.fillText("DI ATAS TUJUH", 80, 205);
  g.fillStyle = "#dd7559";
  g.font = "bold 100px Georgia";
  g.fillText(String(r.score).replace(".", ",") + " / 100", 80, 345);
  g.font = "25px Source, sans-serif";
  g.fillStyle = "#bdc9c4";
  const rows = [
    ["Nama", r.identity.name],
    ["NIM", r.identity.student],
    ["Kelas", r.identity.kelas],
    ["Jawaban pertama", r.correct + " dari 8 tepat"],
    ["Kasus", "Yono ditemukan • penyelidikan selesai"],
    [
      "Selesai",
      new Date(r.finishedAt).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      }),
    ],
  ];
  for (let i = 0; i < rows.length; i++) {
    const y = 435 + i * 60;
    g.fillStyle = "#9facaa";
    g.fillText(rows[i][0], 80, y);
    g.fillStyle = "#f2e7d4";
    g.fillText(rows[i][1], 390, y, 910);
  }
  g.font = "17px monospace";
  g.fillStyle = "#a9b9b4";
  g.fillText("ID: " + r.id, 80, 865);
  g.fillText(
    "Kumpulkan PNG ini bersama kode verifikasi dari layar hasil.",
    80,
    910,
  );
  const a = document.createElement("a");
  a.download =
    "di-atas-tujuh-" + r.identity.student.replace(/[^\w-]/g, "_") + ".png";
  a.href = c.toDataURL("image/png");
  a.click();
}
function verifyPage() {
  app.innerHTML = `<main class="verify-page"><a class="wordmark" href="/">D<span>/</span>7 <small>DI ATAS TUJUH</small></a><section class="verify-card"><p class="eyebrow accent">Periksa bukti</p><h1>Verifikasi hasil.</h1><p>Tempel kode dari layar hasil mahasiswa. PNG saja tidak membuktikan keaslian nilai.</p><form id="verify-form"><label>Kode verifikasi<textarea id="verify-code" required maxlength="12000" placeholder="Tempel kode lengkap di sini…"></textarea></label><button class="primary" id="verify-button">Periksa kode ${icon("arrow", 18)}</button></form><div id="verify-result" role="status"></div><a href="/" class="text-btn">Balik ke game</a></section></main>${common}`;
  $("verify-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = $<HTMLButtonElement>("verify-button");
    b.disabled = true;
    try {
      const { receipt: r } = await api("verify", {
        code: $<HTMLTextAreaElement>("verify-code").value.trim(),
      });
      $("verify-result").innerHTML =
        `<article class="verified"><p class="eyebrow success">✓ TANDA TANGAN VALID</p><h2>${esc(r.identity.name)}</h2><p>NIM ${esc(r.identity.student)} · ${esc(r.identity.kelas)}</p><strong>${r.score} / 100</strong><p>${r.correct} dari 8 jawaban pertama tepat.</p><small>${esc(r.id)}</small><p>${esc(new Date(r.finishedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }))}</p></article>`;
    } catch (e) {
      $("verify-result").innerHTML =
        `<p class="error">${esc((e as Error).message)}</p>`;
    } finally {
      b.disabled = false;
    }
  });
}
document.addEventListener("keydown", (e) => {
  if (
    !modalOpen &&
    worldReady &&
    state &&
    !e.altKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName || "")
  ) {
    const shortcuts: Record<string, () => void> = {
      j: journal,
      h: hints,
      p: settings,
      o: objectList,
      b: evidenceList,
      l: locationList,
    };
    const fn = shortcuts[e.key.toLowerCase()];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }

  if (
    (e.key === " " || e.key === "Enter") &&
    $("modal")?.dataset.mode === "dialogue" &&
    modalOpen &&
    !(e.target as HTMLElement)?.closest(
      "button,input,textarea,select,a,summary",
    )
  ) {
    e.preventDefault();
    $("dialog-next")?.click();
  }

  if (e.key === "Escape" && modalOpen) {
    e.preventDefault();
    closeModal();
  }
  if (e.key === "Tab" && modalOpen) {
    const els = Array.from(
      $("dialog-card").querySelectorAll<HTMLElement>(
        "button:not([disabled]),input:not([disabled]),select,textarea,a[href],summary",
      ),
    );
    const visible = els.filter((el) => el.getClientRects().length > 0);
    if (!visible.length) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const index = visible.indexOf(document.activeElement as HTMLElement);
    const next = e.shiftKey
      ? index <= 0
        ? visible.length - 1
        : index - 1
      : (index + 1) % visible.length;
    visible[next].focus();
  }
});
document.addEventListener("visibilitychange", () =>
  audio.suspend(document.hidden),
);
document.addEventListener(
  "pointerdown",
  () => {
    void audio.unlock();
  },
  { once: true },
);
window.addEventListener("pagehide", () => {
  checkpoint();
  audio.suspend(true);
});
if (reduced) document.documentElement.classList.add("reduced");
if (location.pathname === "/verify") verifyPage();
else home();
if (import.meta.env.DEV && new URLSearchParams(location.search).has("qa"))
  (window as any).__qa = {
    get state() {
      return state;
    },
    get audio() {
      return audio.audioStatus();
    },
    inspect: (id: string) => {
      const h = places[state!.location].hotspots.find((h) => h.id === id);
      if (h) inspect(h);
    },
  };
