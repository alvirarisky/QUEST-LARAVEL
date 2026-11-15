import Phaser from "phaser";
import { places, type Place, type Hotspot } from "./story";
import { sfx } from "./audio";
import { coverView } from "./scene-layout";
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
  reduced = false;
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
      if (!this.locked && p.y > 670) this.move(p.x);
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
    this.background.setTexture(places[id].image).setDisplaySize(1600, 900);
    this.actors.forEach((a) => a.destroy());
    this.hotspots.forEach((h) => h.destroy());
    this.actors = [];
    this.actorByPerson.clear();
    if (this.layer) this.layer.innerHTML = "";
    this.hotspots = [];
    this.player.setPosition(170, 840).setFrame(0);
    this.focusId = undefined;
    for (const h of places[id].hotspots) {
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
      button.dataset.sceneObject = h.id;
      button.setAttribute(
        "aria-label",
        `${h.person ? "Parler avec" : "Periksa"} ${h.label}`.replace(
          "Parler avec",
          "Tanya",
        ),
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
          color: n >= 8 ? "#a4d2b0" : "#d2ad78",
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
    this.resizeView();
    this.actorByPerson.forEach((actor, key) => {
      const active = key === person;
      actor.setAlpha(person && !active ? 0.65 : 1);
      actor.setScale((key === "wiwo" ? 0.68 : 0.7) * (active ? 1.025 : 1));
    });
    this.layer?.classList.toggle("speaking", !!person);
  }
  private resizeView() {
    if (!this.background) return;
    const w = this.scale.width,
      h = this.scale.height;
    const focal: Record<Place, number> = {
      lobby: 650,
      lift: 1050,
      office: 1050,
      service: 800,
      archive: 850,
    };
    const target = places[this.place].hotspots.find(
      (h) => h.id === (this.speaker || this.focusId),
    );
    const v = coverView(w, h, w < 700 && target ? target.x : focal[this.place]);
    this.cameras.main
      .setZoom(v.zoom)
      .setScroll(v.left + (w / v.zoom - w) / 2, v.top + (h / v.zoom - h) / 2);
    this.layer
      ?.querySelectorAll<HTMLButtonElement>("[data-scene-object]")
      .forEach((b) => {
        const hs = places[this.place].hotspots.find(
          (x) => x.id === b.dataset.sceneObject,
        )!;
        const p = v.project(hs.x, hs.y);
        b.style.left = `${(p.x / w) * 100}%`;
        b.style.top = `${(p.y / h) * 100}%`;
        b.hidden = p.x < 22 || p.x > w - 22 || p.y < 75 || p.y > h - 45;
        const anchor = anchors[hs.id] || "above";
        b.dataset.anchor =
          p.x < 135 ? "right" : p.x > w - 135 ? "left" : anchor;
      });
  }
  inspect(h: Hotspot) {
    this.coachSeen = true;
    try {
      localStorage.setItem("dat-coach-seen", "yes");
    } catch {}
    this.layer
      ?.querySelectorAll(".coach")
      .forEach((b) => b.classList.remove("coach"));
    this.inspectionMove = true;
    this.move(h.x < 320 ? h.x + 80 : h.x - 95);
    this.onInspect(h);
  }

  move(x: number, after?: () => void) {
    this.walk?.stop();
    this.player.setFrame(0);
    const target = Phaser.Math.Clamp(x, 80, 1510),
      distance = Math.abs(target - this.player.x);
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
    banner: false,
  });
  return { game, scene };
}
