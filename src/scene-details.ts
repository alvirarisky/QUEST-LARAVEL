import { places, type Hotspot, type Place, type Person } from "./story";
export type Decoration = Hotspot & { decoration: true; thought: string };
const decor = (
  id: string,
  label: string,
  x: number,
  y: number,
  thought: string,
): Decoration => ({ id, label, x, y, thought, decoration: true });
/** Presentation-only objects. No evidence IDs, quiz indices or progression gates. */
export const decorations: Record<Place, Decoration[]> = {
  lobby: [
    decor(
      "decor-lobby-clock",
      "Jam dinding",
      665,
      290,
      "Detiknya kedengeran lebih keras waktu semua orang diam.",
    ),
    decor(
      "decor-lobby-lamp",
      "Lampu meja",
      445,
      425,
      "Cahaya kecil ini membuat meja resepsionis terasa seperti pulau.",
    ),
    decor(
      "decor-lobby-plant",
      "Tanaman lobi",
      870,
      470,
      "Daunnya rapi; gedung ini masih dirawat seperti biasa.",
    ),
    decor(
      "decor-lobby-window",
      "Jendela hujan",
      190,
      300,
      "Di balik kaca, kota terus jalan meski pagi ini terasa macet.",
    ),
  ],
  lift: [
    decor(
      "decor-lift-bench",
      "Bangku tunggu",
      960,
      575,
      "Bangku ini lebih dingin dari kelihatannya.",
    ),
    decor(
      "decor-lift-plant",
      "Pot tanaman",
      315,
      470,
      "Ada daun yang menguning di antara yang masih hijau.",
    ),
    decor(
      "decor-lift-light",
      "Lampu dinding",
      900,
      250,
      "Lampunya hangat, tapi lorong ini tetap terasa jauh dari lobi.",
    ),
    decor(
      "decor-lift-pipes",
      "Pipa plafon",
      240,
      120,
      "Dengung gedung ternyata lewat jalur di atas kepala.",
    ),
  ],
  office: [
    decor(
      "decor-office-trophies",
      "Lemari piala",
      1110,
      280,
      "Lemari ini penuh penghargaan, tapi tidak satu pun bisa menjawab pertanyaan saya.",
    ),
    decor(
      "decor-office-orchid",
      "Anggrek meja",
      175,
      430,
      "Bunganya lebih terurus daripada jam tidur saya.",
    ),
    decor(
      "decor-office-painting",
      "Lukisan ikan",
      1340,
      345,
      "Ikan di lukisan ini kelihatan terlalu santai buat ruangan seserius ini.",
    ),
    decor(
      "decor-office-lamp",
      "Lampu hijau",
      525,
      425,
      "Lampu meja menyisakan satu lingkaran tenang di ruangan ini.",
    ),
  ],
  service: [
    decor(
      "decor-service-pipes",
      "Pipa servis",
      650,
      125,
      "Dari dekat, suara pipa ini hanya dengung biasa.",
    ),
    decor(
      "decor-service-toolbox",
      "Kotak perkakas",
      1410,
      480,
      "Cat kotak ini aus tepat di tempat tangan biasa menggenggam.",
    ),
    decor(
      "decor-service-tools",
      "Papan alat",
      1450,
      355,
      "Alat-alatnya disusun dengan kebiasaan orang yang hafal tempatnya.",
    ),
    decor(
      "decor-service-wrapper",
      "Bungkus di lantai",
      770,
      685,
      "Bahkan ruangan penuh mesin punya sisa jam istirahat.",
    ),
  ],
  archive: [
    decor(
      "decor-archive-lamp",
      "Lampu gantung",
      850,
      225,
      "Debu melintas pelan di bawah lampu.",
    ),
    decor(
      "decor-archive-stool",
      "Bangku arsip",
      745,
      710,
      "Bangku kayunya berderit pelan waktu disentuh.",
    ),
    decor(
      "decor-archive-rolls",
      "Gulungan kertas",
      1035,
      590,
      "Kertas lama punya bau yang langsung nempel di ingatan.",
    ),
    decor(
      "decor-archive-shelf",
      "Rak map",
      420,
      430,
      "Rak ini lebih sabar menyimpan hal-hal lama daripada kebanyakan orang.",
    ),
  ],
};
export const sceneObjects = (id: Place): Hotspot[] => [
  ...places[id].hotspots,
  ...decorations[id],
];
export function isDecoration(h: Hotspot): h is Decoration {
  return "decoration" in h && h.decoration === true;
}
export const sceneLooks: Record<
  Place,
  {
    time: string;
    tint: number;
    weather: "rain" | "dust";
    flicker: boolean;
    floorY: number;
  }
> = {
  lobby: {
    time: "07.42",
    tint: 0xffefdd,
    weather: "rain",
    flicker: false,
    floorY: 650,
  },
  lift: {
    time: "07.48",
    tint: 0xe4edf0,
    weather: "dust",
    flicker: false,
    floorY: 650,
  },
  office: {
    time: "07.54",
    tint: 0xffefda,
    weather: "rain",
    flicker: false,
    floorY: 650,
  },
  service: {
    time: "08.01",
    tint: 0xb9cdd8,
    weather: "dust",
    flicker: true,
    floorY: 710,
  },
  archive: {
    time: "08.07",
    tint: 0xb1c6d1,
    weather: "dust",
    flicker: true,
    floorY: 755,
  },
};
const chapterOrder: Place[] = ["lobby", "lift", "office", "service", "archive"];
export function narrativeTime(openPlaces: Place[]) {
  return sceneLooks[
    chapterOrder.filter((p) => openPlaces.includes(p)).at(-1) || "lobby"
  ].time;
}
/** Each viewBox is strictly within the first 512 × 512 sprite frame. */
export const portraitCrops: Record<Person | "detective", string> = {
  allie: "175 0 200 240",
  noah: "200 0 205 240",
  wiwo: "145 0 220 240",
  tedar: "175 0 190 240",
  yono: "180 0 190 230",
  detective: "170 0 190 230",
};
export const speakerColors: Record<string, string> = {
  allie: "#e9bcc7",
  noah: "#b8d9eb",
  wiwo: "#e8cfad",
  tedar: "#c6c1f0",
  yono: "#c3dcad",
  detective: "#f0e2ca",
  unknown: "#d0d9d1",
};
export const evidenceWitness: Record<string, Person> = {
  message: "yono",
  ledger: "allie",
  plan: "noah",
  cctv: "allie",
  report: "noah",
  photo: "yono",
  parcel: "wiwo",
  access: "tedar",
  key: "noah",
  manifest: "yono",
};
