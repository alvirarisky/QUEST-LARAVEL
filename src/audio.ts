type Channel = "music" | "ambience" | "effects" | "voice";
export type AudioSettings = {
  master: number;
  music: number;
  ambience: number;
  effects: number;
  voice: number;
  spoken: boolean;
  typing: boolean;
};
const defaults: AudioSettings = {
  master: 0.65,
  music: 0.36,
  ambience: 0.38,
  effects: 0.65,
  voice: 0.8,
  spoken: false,
  typing: true,
};
let saved: any = {};
try {
  saved = JSON.parse(localStorage.getItem("dat-audio") || "{}");
} catch {}
export const levels: AudioSettings = { ...defaults };
for (const key of ["master", "music", "ambience", "effects", "voice"] as const)
  if (typeof saved[key] === "number")
    levels[key] = Math.max(0, Math.min(1, saved[key]));
levels.spoken = saved.spoken === true;
levels.typing = saved.typing !== false;
const typingSources = new Set<AudioScheduledSourceNode>();
let typingBus: GainNode | undefined;
let ctx: AudioContext | undefined,
  master: GainNode,
  buses: Record<Channel, GainNode>,
  ducked = false;
let timer: ReturnType<typeof setInterval> | undefined,
  next = 0,
  beat = 0,
  tension = 0,
  hidden = false;
let theme: "menu" | "explore" | "reveal" = "menu";
export function setTheme(value: typeof theme) {
  theme = value;
}
let room = "lobby",
  ambient: AudioNode[] = [],
  ambientGain: GainNode | undefined,
  voiceEl: HTMLAudioElement | undefined;
let noise: AudioBuffer | undefined,
  liveNotes = 0;
const notes = [146.83, 174.61, 220, 261.63, 293.66, 349.23, 440, 523.25];
function volume() {
  if (!ctx) return;
  master.gain.setTargetAtTime(levels.master, ctx.currentTime, 0.06);
  for (const k of ["music", "ambience", "effects", "voice"] as const)
    buses[k].gain.setTargetAtTime(
      levels[k] * (k === "music" && ducked ? 0.3 : 1),
      ctx.currentTime,
      0.15,
    );
  typingBus?.gain.setTargetAtTime(ducked ? 0.45 : 1, ctx.currentTime, 0.03);
  if (voiceEl) voiceEl.volume = levels.master * levels.voice;
}
export function setLevel(key: keyof AudioSettings, value: number | boolean) {
  (levels as any)[key] = value;
  try {
    localStorage.setItem("dat-audio", JSON.stringify(levels));
  } catch {}
  volume();
  if (key === "spoken" && !value) stopVoice();
  if (key === "typing" && !value) stopTypingSound();
}
export async function unlock() {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -14;
      limiter.knee.value = 12;
      limiter.ratio.value = 5;
      master.connect(limiter).connect(ctx.destination);
      buses = {} as any;
      for (const k of ["music", "ambience", "effects", "voice"] as const) {
        buses[k] = ctx.createGain();
        buses[k].connect(master);
      }
      typingBus = ctx.createGain();
      typingBus.connect(buses.effects);
      noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const a = noise.getChannelData(0);
      let seed = 707;
      for (let i = 0; i < a.length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        a[i] = (seed / 4294967296) * 2 - 1;
      }
      volume();
      next = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 80);
      setRoom(room);
    }
    if (ctx.state !== "running" && !hidden) await ctx.resume();
  } catch {
    /* Silent play remains available. */
  }
}
function note(
  hz: number,
  at: number,
  length: number,
  strength: number,
  channel: Channel = "music",
  type: OscillatorType = "sine",
) {
  if (!ctx || ctx.state !== "running" || liveNotes > 32) return;
  liveNotes++;
  const o = ctx.createOscillator(),
    g = ctx.createGain();
  o.type = type;
  o.frequency.value = hz;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, strength), at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  o.connect(g).connect(buses[channel]);
  o.start(at);
  o.stop(at + length + 0.02);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
    liveNotes--;
  };
}
function hiss(
  at: number,
  length: number,
  strength: number,
  hz: number,
  channel: Channel = "effects",
) {
  if (!ctx || !noise || ctx.state !== "running") return;
  const s = ctx.createBufferSource(),
    f = ctx.createBiquadFilter(),
    g = ctx.createGain();
  s.buffer = noise;
  f.type = "bandpass";
  f.frequency.value = hz;
  f.Q.value = 0.6;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, strength), at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  s.connect(f).connect(g).connect(buses[channel]);
  s.start(at);
  s.stop(at + length + 0.02);
  s.onended = () => {
    s.disconnect();
    f.disconnect();
    g.disconnect();
  };
}
/** Short character voices and paper texture, routed through the existing SFX mixer. */
export function typingSound(who: string, narration = false) {
  if (
    !levels.typing ||
    hidden ||
    !ctx ||
    ctx.state !== "running" ||
    !typingBus ||
    typingSources.size >= 4
  )
    return;
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  let source: AudioScheduledSourceNode;
  let filter: BiquadFilterNode | undefined;
  const duration = narration ? 0.13 : 0.028;
  if (narration) {
    if (!noise) return;
    const paper = ctx.createBufferSource();
    paper.buffer = noise;
    filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600;
    filter.Q.value = 0.45;
    paper.connect(filter).connect(gain);
    source = paper;
  } else {
    const profiles: Record<string, [number, OscillatorType, number]> = {
      Allie: [780, "sine", 0.045],
      Noah: [230, "triangle", 0.045],
      Wiwo: [180, "triangle", 0.045],
      Tedar: [610, "sawtooth", 0.018],
      Yono: [980, "sine", 0.022],
      Detektif: [420, "triangle", 0.035],
    };
    const [hz, wave] = profiles[who] || profiles.Detektif;
    const voice = ctx.createOscillator();
    voice.type = wave;
    voice.frequency.value = hz * (0.98 + Math.random() * 0.04);
    voice.connect(gain);
    source = voice;
  }
  const strength = narration
    ? 0.022
    : (
        {
          Allie: 0.045,
          Noah: 0.045,
          Wiwo: 0.045,
          Tedar: 0.018,
          Yono: 0.022,
        } as Record<string, number>
      )[who] || 0.035;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(strength, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  gain.connect(typingBus);
  typingSources.add(source);
  source.onended = () => {
    typingSources.delete(source);
    source.disconnect();
    filter?.disconnect();
    gain.disconnect();
  };
  source.start(t);
  source.stop(t + duration + 0.008);
}
export function stopTypingSound() {
  for (const source of typingSources) {
    try {
      source.stop();
    } catch {}
  }
  typingSources.clear();
}
function piano(hz: number, t: number, velocity = 0.14) {
  note(hz, t, 1.5, velocity);
  note(hz * 2, t, 0.7, velocity * 0.18);
  note(hz * 3, t, 0.35, velocity * 0.07);
}
function schedule() {
  if (!ctx || ctx.state !== "running" || hidden) return;
  const now = ctx.currentTime;
  if (next < now - 0.2) next = now + 0.08;
  while (next < now + 0.22) {
    const b = beat % 32;
    const bar = Math.floor(beat / 32) % 4;
    const root = [73.416, 65.406, 58.27, 65.406][bar];
    if (b === 0 || b === 16) {
      note(root, next, 2.6, 0.13);
      note(root * 2, next, 1.3, 0.035);
    }
    const pattern =
      theme === "menu"
        ? [0, 8, 14, 24]
        : theme === "explore"
          ? [0, 12, 24]
          : [0, 6, 10, 18, 24, 28];
    if (pattern.includes(b)) {
      const ix =
        ([4, 3, 1, 2, 0, 1][pattern.indexOf(b)] + (bar === 2 ? -1 : 0) + 8) % 8;
      piano(notes[ix], next, theme === "reveal" ? 0.1 : 0.075);
      if (theme === "menu" || (theme === "reveal" && b === 18))
        piano(notes[(ix + 2) % 8], next + 0.035, 0.025);
    }
    if (tension > 0.4 && b % 4 === 2) hiss(next, 0.09, 0.025, 4200, "music");
    if (tension > 0.7 && b % 8 === 0) note(36.7, next, 0.4, 0.07);
    next += 60 / 76 / 4;
    beat++;
  }
}
export function setTension(t: number) {
  tension = t;
}
export function duck(value: boolean) {
  ducked = value;
  volume();
}
export function setRoom(name: string) {
  room = name;
  if (!ctx || !noise) return;
  const old = ambient,
    oldGain = ambientGain;
  ambient = [];
  const bus = ctx.createGain();
  ambientGain = bus;
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.1);
  bus.connect(buses.ambience);
  if (oldGain) {
    oldGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
    setTimeout(() => {
      for (const n of old) {
        try {
          (n as AudioBufferSourceNode).stop();
        } catch {}
        n.disconnect();
      }
      oldGain.disconnect();
    }, 1700);
  }
  const s = ctx.createBufferSource(),
    f = ctx.createBiquadFilter(),
    g = ctx.createGain();
  s.buffer = noise;
  s.loop = true;
  f.type = "lowpass";
  f.frequency.value =
    name === "service"
      ? 850
      : name === "archive"
        ? 350
        : name === "office"
          ? 650
          : 1400;
  g.gain.value = name === "service" ? 0.13 : name === "archive" ? 0.07 : 0.11;
  s.connect(f).connect(g).connect(bus);
  s.start();
  ambient.push(s, f, g);
  const motor = ctx.createOscillator(),
    mg = ctx.createGain();
  motor.frequency.value = name === "lift" ? 58 : name === "service" ? 47 : 83;
  motor.type = "sine";
  mg.gain.value = name === "lift" ? 0.05 : 0.018;
  motor.connect(mg).connect(bus);
  motor.start();
  ambient.push(motor, mg);
}
export function sfx(
  kind:
    | "click"
    | "step"
    | "paper"
    | "pickup"
    | "door"
    | "lift"
    | "card"
    | "correct"
    | "wrong"
    | "connect"
    | "phone",
) {
  if (!ctx || ctx.state !== "running") return;
  const t = ctx.currentTime;
  if (kind === "step") {
    hiss(t, 0.1, 0.12, room === "service" ? 550 : 850);
    note(85 + Math.random() * 18, t, 0.075, 0.09, "effects");
  }
  if (kind === "click") note(740, t, 0.055, 0.08, "effects", "triangle");
  if (kind === "paper") hiss(t, 0.22, 0.08, 1900);
  if (kind === "pickup") {
    piano(587.3, t, 0.035);
    note(880, t + 0.09, 0.35, 0.08, "effects");
  }
  if (kind === "door") {
    hiss(t, 0.65, 0.16, 350);
    note(65, t, 0.55, 0.13, "effects");
  }
  if (kind === "lift") {
    note(659.25, t, 0.7, 0.15, "effects");
    note(523.25, t + 0.25, 0.8, 0.13, "effects");
  }
  if (kind === "card") {
    note(1108, t, 0.09, 0.11, "effects");
    note(1396, t + 0.12, 0.1, 0.07, "effects");
  }
  if (kind === "correct") {
    [392, 493.88, 587.33].forEach((hz, i) =>
      note(hz, t + i * 0.08, 0.4, 0.1, "effects", "triangle"),
    );
  }
  if (kind === "wrong") {
    note(196, t, 0.35, 0.08, "effects", "triangle");
    note(185, t + 0.07, 0.3, 0.035, "effects");
  }
  if (kind === "connect") {
    note(293.66, t, 0.6, 0.11, "effects");
    note(440, t + 0.12, 0.7, 0.09, "effects");
    hiss(t, 0.12, 0.04, 2500);
  }
  if (kind === "phone") {
    [0, 0.19].forEach((d) => note(880, t + d, 0.15, 0.1, "effects"));
  }
}
export function stopVoice() {
  if (voiceEl) {
    voiceEl.pause();
    voiceEl.currentTime = 0;
    voiceEl = undefined;
  }
}
export function speak(file: "yono-message" | "lift-seven") {
  stopVoice();
  if (!levels.spoken || hidden) return;
  voiceEl = new Audio("/audio/" + file + ".mp3");
  voiceEl.volume = levels.master * levels.voice;
  void voiceEl.play().catch(() => {});
}
export function suspend(value: boolean) {
  hidden = value;
  if (value) stopTypingSound();
  if (voiceEl && value) voiceEl.pause();
  if (ctx) void (value ? ctx.suspend() : ctx.resume()).catch(() => {});
}
export function audioStatus() {
  return {
    state: ctx?.state || "locked",
    room,
    theme,
    liveNotes,
    settings: { ...levels },
  };
}
export function destroyAudio() {
  if (timer) clearInterval(timer);
  stopVoice();
  stopTypingSound();
  void ctx?.close();
}
