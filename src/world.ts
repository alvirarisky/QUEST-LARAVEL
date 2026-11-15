import Phaser from "phaser";
import { places, type Place, type Hotspot } from "./story";
import { sfx } from "./audio";
import { coverView, conversationFrame, dialogueBackdrop } from "./scene-layout";
import { sceneObjects, isDecoration, sceneLooks } from "./scene-details";
import { anchors } from "./ui";
export class Investigation extends Phaser.Scene {
  onReady: () => void = () => {};
  onInspect: (h: Hotspot) => void = () => {};
  place: Place = "lobby";
  private background!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Sprite;
  private actors: Phaser.GameObjects.GameObject[] = [];
  private hotspots: Phaser.GameObjects.Container[] = [];
  private walk?: Phaser.Tweens.Tween;
  private walking = false;
  private stepAt = 0;
  private animAt = 0;
  private highlighted = false;
  htmlParent?: HTMLElement;
  private layer?: HTMLDivElement;
  private actorByPerson = new Map<string, Phaser.GameObjects.Sprite>();
  private coachSeen = false;
  private speaker?: string;
  get labelsVisible() {
    return this.highlighted;
  }
  private focusId?: string;
  private inspectionMove = false;
  private locked = false;
  private motionReduced = false;
  private dialogueActive = false;
  private dialogueScale = 0.65;
  private lastView?: ReturnType<typeof coverView>;
  get reduced() {
    return this.motionReduced;
  }
  set reduced(value: boolean) {
    this.motionReduced = value;
    if (value) {
      this.walk?.stop();
      this.walking = false;
      this.inspectionMove = false;
      this.player?.setFrame(0);
    }
    this.htmlParent
      ?.closest(".cinema-game")
      ?.classList.toggle("world-reduced", value);
    if (this.player) {
      this.resizeView();
      this.pose(this.time?.now || 0);
    }
  }

  private progress = 0;
  private indicator?: Phaser.GameObjects.Text;
  constructor() {
    super("Investigation");
  }
  preload() {
    const keys = [
      "lobby-night",
      "elevator-hall",
      "wiwo-office",
      "service-corridor",
      "hidden-archive",
    ];
    keys.forEach((k) => this.load.image(k, `/art/${k}.webp`));
    for (const k of ["detective", "allie", "noah", "wiwo", "tedar", "yono"])
      this.load.spritesheet(k, `/art/${k}-side.webp`, {
        frameWidth: 512,
        frameHeight: 512,
      });
  }
  create() {
    this.scale.on("resize", () => this.resizeView());
    this.background = this.add
      .image(800, 450, "lobby-night")
      .setDisplaySize(1600, 900);
    try {
      this.coachSeen = localStorage.getItem("dat-coach-seen") === "yes";
    } catch {}
    this.layer = document.createElement("div");
    this.layer.className = "scene-hotspots";
    this.htmlParent?.append(this.layer);
    this.player = this.add
      .sprite(180, 840, "detective", 0)
      .setOrigin(0.5, 1)
      .setScale(0.76)
      .setDepth(30);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (!this.locked && p.worldY > 670) this.move(p.worldX);
    });
    this.loadPlace("lobby");
    this.resizeView();
    this.onReady();
  }
  loadPlace(id: Place) {
    if (!this.player) return;
    this.walk?.stop();
    this.walking = false;
    this.place = id;
    this.speaker = undefined;
    this.dialogueActive = false;
    const root = this.htmlParent?.closest(".cinema-game") as HTMLElement | null;
    if (root) {
      root.dataset.scene = id;
      root.dataset.weather = sceneLooks[id].weather;
      root.classList.toggle("world-reduced", this.reduced);
    }

    this.background.setTexture(places[id].image).setDisplaySize(1600, 900);
    this.actors.forEach((a) => a.destroy());
    this.hotspots.forEach((h) => h.destroy());
    this.actors = [];
    this.actorByPerson.clear();
    if (this.layer) this.layer.innerHTML = "";
    this.hotspots = [];
    this.player.setPosition(170, 840).setFrame(0);
    this.focusId = undefined;
    for (const h of sceneObjects(id)) {
      if (h.person) {
        const actor = this.add
          .sprite(h.x, 790, h.person, 0)
          .setOrigin(0.5, 1)
          .setScale(h.person === "wiwo" ? 0.68 : 0.7)
          .setFlipX(true)
          .setDepth(12);
        actor.setInteractive(
          new Phaser.Geom.Rectangle(140, 10, 230, 490),
          Phaser.Geom.Rectangle.Contains,
        );
        actor.on("pointerdown", (_p: any, _x: any, _y: any, event: any) => {
          event?.stopPropagation();
          if (!this.locked) this.inspect(h);
        });
        this.actors.push(actor);
        this.actorByPerson.set(h.person, actor);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scene-hotspot";
      button.dataset.kind = isDecoration(h)
        ? "decor"
        : h.person
          ? "person"
          : "evidence";
      button.dataset.sceneObject = h.id;
      button.setAttribute(
        "aria-label",
        `${h.person ? "Tanya" : isDecoration(h) ? "Lihat" : "Periksa"} ${h.label}`,
      );
      button.dataset.anchor = anchors[h.id] || "above";
      const label = document.createElement("span");
      label.className = "hotspot-label";
      label.textContent = h.label;
      button.append(label);
      button.addEventListener("click", () => {
        if (!this.locked) this.inspect(h);
      });
      this.layer?.append(button);
    }
    this.resizeView();
    if (!this.reduced) {
      this.cameras.main.fadeIn(400, 8, 17, 19);
    }
  }
  setProgress(n: number) {
    this.progress = n;
    if (!this.background) return;
    if (this.indicator) {
      this.indicator.destroy();
      this.indicator = undefined;
    }
    if (this.place === "lift") {
      this.indicator = this.add
        .text(566, 143, "7", {
          fontFamily: "Source, sans-serif",
          fontSize: "35px",
          color: "#e5b983",
        })
        .setOrigin(0.5)
        .setDepth(4);
    }
    if (this.place === "service") {
      this.indicator = this.add
        .text(544, 399, n >= 8 ? "Akses aktif" : "Terkunci", {
          fontFamily: "Source, sans-serif",
          fontSize: "16px",
          color: n >= 8 ? "#d1e2c0" : "#dce7d4",
          backgroundColor: "#0d201deb",
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(4);
    }
  }
  setFocus(id?: string) {
    this.focusId = id;
    this.resizeView();
    this.layer
      ?.querySelectorAll<HTMLButtonElement>("[data-scene-object]")
      .forEach((b) => {
        b.classList.toggle("is-target", b.dataset.sceneObject === id);
        b.classList.toggle("labels-on", this.highlighted);
        b.classList.toggle(
          "coach",
          !this.coachSeen && b.dataset.sceneObject === id,
        );
      });
  }
  setSpeaker(person?: string) {
    this.speaker = person;
    this.dialogueActive = !!this.htmlParent?.closest(".in-dialogue");
    if (this.dialogueActive) {
      this.walk?.stop();
      this.walking = false;
      this.inspectionMove = false;
      this.player?.setFrame(0);
    }
    this.resizeView();
    this.pose(this.time?.now || 0);
    this.layer?.classList.toggle("speaking", this.dialogueActive);
  }
  private resizeView() {
    if (!this.background || !this.player) return;
    const w = this.scale.width,
      h = this.scale.height;
    const focal: Record<Place, number> = {
      lobby: 650,
      lift: 1050,
      office: 1050,
      service: 800,
      archive: 850,
    };
    const all = sceneObjects(this.place);
    const target = all.find(
      (o) =>
        (this.speaker && o.person === this.speaker) || o.id === this.focusId,
    );
    const person =
      places[this.place].hotspots.find((o) => o.person === this.speaker) ||
      places[this.place].hotspots.find((o) => o.person);
    let v = coverView(w, h, w < 700 && target ? target.x : focal[this.place]);
    if (this.dialogueActive && person) {
      const card = document.getElementById("dialog-card");
      const top =
        card?.getBoundingClientRect().top || h - (w < 700 ? 238 : 200);
      const frame = conversationFrame(w, h, person.x, top);
      v = frame.view;
      this.dialogueScale = frame.scale;
      const backdrop = dialogueBackdrop(
        frame.feetY,
        sceneLooks[this.place].floorY,
        frame.center,
      );
      this.background
        .setDisplaySize(1600 * backdrop.zoom, 900 * backdrop.zoom)
        .setPosition(backdrop.x, backdrop.y);
      this.player
        .setPosition(frame.playerX, frame.feetY)
        .setFlipX(frame.playerX > person.x);
      this.actorByPerson.forEach((actor, key) => {
        actor.setY(frame.feetY);
        actor.setFlipX(this.player.x < actor.x);
        actor.setAlpha(key === person.person ? 1 : 0.45);
      });
    } else {
      this.background.setDisplaySize(1600, 900).setPosition(800, 450);
      this.player.setY(840);
      this.actorByPerson.forEach((actor) =>
        actor
          .setY(790)
          .setAlpha(1)
          .setFlipX(this.player.x < actor.x),
      );
    }
    this.lastView = v;
    this.cameras.main
      .setZoom(v.zoom)
      .setScroll(v.left + (w / v.zoom - w) / 2, v.top + (h / v.zoom - h) / 2);
    this.layer
      ?.querySelectorAll<HTMLButtonElement>("[data-scene-object]")
      .forEach((b) => {
        const hs = all.find((o) => o.id === b.dataset.sceneObject)!;
        const p = v.project(hs.x, hs.y);
        b.style.left = `${(p.x / w) * 100}%`;
        b.style.top = `${(p.y / h) * 100}%`;
        b.hidden = p.x < 22 || p.x > w - 22 || p.y < 75 || p.y > h - 45;
        const anchor = anchors[hs.id] || (isDecoration(hs) ? "below" : "above");
        b.dataset.anchor =
          p.x < 135 ? "right" : p.x > w - 135 ? "left" : anchor;
      });
    this.pose(this.time?.now || 0);
  }
  private pose(time: number) {
    if (!this.player) return;
    const base = this.dialogueActive ? this.dialogueScale : 0.76;
    const breath = this.reduced ? 0 : Math.sin(time / 1050) * 0.005;
    this.player
      .setScale(base, base * (1 + breath))
      .setRotation(
        this.reduced || this.walking ? 0 : Math.sin(time / 1900) * 0.003,
      );
    let index = 0;
    this.actorByPerson.forEach((actor, key) => {
      const active = this.dialogueActive && key === this.speaker;
      const scale = this.dialogueActive
        ? this.dialogueScale
        : key === "wiwo"
          ? 0.68
          : 0.7;
      const air = this.reduced
        ? 0
        : Math.sin(time / 1050 + ++index * 1.7) * 0.005;
      actor.setScale(scale, scale * (1 + air));
      actor.setRotation(
        this.reduced
          ? 0
          : active
            ? this.player.x < actor.x
              ? -0.016
              : 0.016
            : 0,
      );
      actor.setFlipX(this.player.x < actor.x);
    });
  }
  presentationSnapshot() {
    const view = this.lastView;
    const sample = (s: Phaser.GameObjects.Sprite) => ({
      x: s.x,
      y: s.y,
      scaleX: s.scaleX,
      scaleY: s.scaleY,
      rotation: s.rotation,
      flipX: s.flipX,
      feet: view?.project(s.x, s.y),
    });
    return {
      place: this.place,
      reduced: this.reduced,
      dialogue: this.dialogueActive,
      player: this.player && sample(this.player),
      actors: Object.fromEntries(
        [...this.actorByPerson].map(([key, s]) => [key, sample(s)]),
      ),
      tint: sceneLooks[this.place].tint,
    };
  }
  inspect(h: Hotspot) {
    this.coachSeen = true;
    try {
      localStorage.setItem("dat-coach-seen", "yes");
    } catch {}
    this.layer
      ?.querySelectorAll(".coach")
      .forEach((b) => b.classList.remove("coach"));
    if (isDecoration(h)) {
      this.onInspect(h);
      return;
    }
    this.inspectionMove = true;
    this.move(
      h.person
        ? h.x > 400
          ? h.x - 300
          : h.x + 300
        : h.x < 320
          ? h.x + 80
          : h.x - 140,
    );
    this.onInspect(h);
  }

  move(x: number, after?: () => void) {
    this.walk?.stop();
    this.player.setFrame(0);
    let target = Phaser.Math.Clamp(x, 80, 1510);
    for (const actor of this.actorByPerson.values())
      if (Math.abs(target - actor.x) < 200)
        target = Phaser.Math.Clamp(
          actor.x > 400 ? actor.x - 260 : actor.x + 260,
          80,
          1510,
        );
    const distance = Math.abs(target - this.player.x);
    if (this.reduced) {
      const left = target < this.player.x;
      this.player.setX(target).setFlipX(left);
      this.walking = false;
      this.inspectionMove = false;
      this.pose(this.time?.now || 0);
      after?.();
      return;
    }
    this.player.setFlipX(target < this.player.x);
    if (distance < 12) {
      this.inspectionMove = false;
      this.walking = false;
      after?.();
      return;
    }
    this.walking = true;
    this.walk = this.tweens.add({
      targets: this.player,
      x: target,
      duration: this.reduced
        ? Math.min(250, distance)
        : Math.min(650, (distance / 850) * 1000),
      ease: "Linear",
      onComplete: () => {
        this.walking = false;
        this.inspectionMove = false;
        this.player.setFrame(0);
        after?.();
      },
    });
  }
  lock(value: boolean) {
    this.locked = value;
    if (this.layer) this.layer.inert = value;
    if (value && !this.inspectionMove) {
      this.walk?.stop();
      this.walking = false;
      this.player?.setFrame(0);
    }
  }
  highlight() {
    this.highlighted = !this.highlighted;
    this.setFocus(this.focusId);
    return this.highlighted;
  }
  update(time: number) {
    this.pose(time);
    if (this.walking) {
      if (time > this.animAt) {
        this.player.setFrame(Number(this.player.frame.name) === 1 ? 2 : 1);
        this.animAt = time + 185;
      }
      if (time > this.stepAt) {
        sfx("step");
        this.stepAt = time + 340;
      }
    }
  }
}
export function createWorld(
  parent: HTMLElement,
  onInspect: (h: Hotspot) => void,
  onReady: () => void,
) {
  const scene = new Investigation();
  scene.reduced = document.documentElement.classList.contains("reduced");
  scene.htmlParent = parent;
  scene.onInspect = onInspect;
  scene.onReady = onReady;
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: 1600,
    height: 900,
    backgroundColor: "#102124",
    fps: { target: 30, forceSetTimeOut: true, smoothStep: false },
    scene: [scene],
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false },
    audio: { noAudio: true },
    // DOM hotspots own their clicks; do not replay them through canvas actors.
    input: { windowEvents: false },
    banner: false,
  });
  return { game, scene };
}
