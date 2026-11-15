export type Place = "lobby" | "lift" | "office" | "service" | "archive";
export type Person = "allie" | "noah" | "wiwo" | "tedar" | "yono";
export type Line = { who: string; text: string };
export type Evidence = {
  id: string;
  title: string;
  tag: string;
  description: string;
  frame: number;
  quote?: string;
};
export const people: Record<
  Person,
  { name: string; role: string; intro: string }
> = {
  allie: {
    name: "Allie",
    role: "Resepsionis malam",
    intro:
      "Saya di meja waktu Yono masuk lift. Dia menuju kantor Pak Wiwo. Setelah itu saya tidak lihat dia lagi.",
  },
  noah: {
    name: "Noah",
    role: "Teknisi gedung",
    intro:
      "Lift penumpang punya tujuh tujuan. Tapi pertanyaan yang lebih penting: siapa yang masih punya kunci servis?",
  },
  wiwo: {
    name: "Pak Wiwo",
    role: "Pemilik perusahaan",
    intro:
      "Cari orangnya dulu. Nama gedung saya di berita sudah salah, jangan sampai jumlah lantainya ikut salah.",
  },
  tedar: {
    name: "Tedar",
    role: "Asisten eksekutif",
    intro:
      "Saya meninggalkan kantor tepat jam delapan. Paket itu sudah di meja ketika saya kembali pagi ini.",
  },
  yono: {
    name: "Yono",
    role: "Kurir • kiriman YN07",
    intro:
      "Akhirnya. Saya kira orang satu gedung sudah pulang. Ponsel saya mati sejak tadi malam.",
  },
};
/** Two additional character lines, read with the existing first testimony. */
export const witnessFlavor: Record<Exclude<Person, "yono">, string[]> = {
  allie: [
    "[Allie membalik ponselnya; telapaknya menutupi layar.]",
    "Chat pribadi saya tidak perlu dibuka, kan? Itu bukan urusan kiriman.",
  ],
  noah: [
    "[Noah menahan gantungan kunci di saku, ibu jarinya mengetuk logam.]",
    "Jangan langsung curiga sama yang bawa kunci. Teknisi paling gampang dijadiin jawaban.",
  ],
  wiwo: [
    "[Wiwo merapikan map yang sudah lurus, lalu melirik pintu.]",
    "Bisa saja gudang yang salah catat. Jangan nama saya dulu yang dibawa keluar.",
  ],
  tedar: [
    "[Tedar meratakan ujung lengan bajunya sebelum mengulang jam pulang.]",
    "Teknisi masih bisa mondar-mandir, kan? Tanya Noah dulu sebelum kamu curiga ke staf kantor.",
  ],
};
export const accessEvents = [
  { time: "20.15", detail: "mengaktifkan pemberhentian servis untuk lift" },
  { time: "20.18", detail: "membuka pintu arsip" },
  { time: "20.22", detail: "menutup pintu arsip dari luar" },
  { time: "20.31", detail: "membuka kantor Wiwo" },
];
export const caseTimeline = [
  {
    time: "20.12",
    detail: "Yono mengisi buku tamu dan menerima arahan dari Tedar.",
  },
  { time: "20.13", detail: "Allie meninggalkan meja resepsionis." },
  { time: "20.14", detail: "Yono masuk lift membawa paket YN07." },
  {
    time: accessEvents[0].time,
    detail: "Kartu Tedar mengaktifkan tujuan servis.",
  },
  {
    time: "20.16",
    detail:
      "Yono tiba di arsip bertlo 8 dan mengirim pesan; penerimanya belum datang.",
  },
  {
    time: accessEvents[1].time,
    detail: "Kartu Tedar membuka arsip; Yono melihat paket yang dialihkan.",
  },
  {
    time: accessEvents[2].time,
    detail: "Yono dikunci dari luar; paketnya dibawa lewat tangga servis.",
  },
  {
    time: accessEvents[3].time,
    detail: "Paket sampai ke kantor Wiwo tanpa Yono melewati lobi.",
  },
];
export const evidence: Record<string, Evidence> = {
  message: {
    id: "message",
    title: "Pesan terakhir Yono",
    tag: "20.16 / PESAN",
    description:
      "Rekan Yono menerima pesan setelah ia masuk lift. Setelah pesan 20.16, Yono tidak membalas lagi. Sebelum penyelidikan dimulai, foto sebuah ruangan penuh rak juga masuk dari nomor tanpa nama; pengirimnya belum jelas.",
    quote: "“Saya sudah lantai 8. Orangnya belum ada.”",
    frame: 2,
  },
  ledger: {
    id: "ledger",
    title: "Buku tamu",
    tag: "20.12 / LOBI",
    description:
      "Yono, kiriman YN07, tujuan kantor Wiwo. Kolom penerima kosong. Catatan di sisi halaman: “Tedar — tunggu di atas”. Di bawahnya ada tulisan lebih tipis: “Simpan salinannya.” Bagian ini tidak bertanda nama.",
    frame: 8,
  },
  plan: {
    id: "plan",
    title: "Denah publik",
    tag: "DOKUMEN / TUJUH LANTAI",
    description:
      "Denah menunjukkan lantai 1–7. Ada area di atas lantai tujuh yang tertutup stiker renovasi. Denah ini tidak memperlihatkan akses servis.",
    frame: 5,
  },
  cctv: {
    id: "cctv",
    title: "Cuplikan CCTV lobi",
    tag: "20.14 / KAMERA 01",
    description:
      "Yono masuk lift membawa paket. Allie meninggalkan meja pada 20.13 dan kembali 20.24. Tidak ada rekaman Yono keluar melalui pintu utama.",
    frame: 7,
  },
  report: {
    id: "report",
    title: "Laporan perawatan Noah",
    tag: "17.40 / LAPORAN",
    description:
      "Laporan sebelum kejadian: pemberhentian servis di atas lantai 7 masih aktif. Akses memakai kartu eksekutif. Noah menyarankan penonaktifan sampai pemeriksaan; belum disetujui.",
    frame: 10,
  },
  photo: {
    id: "photo",
    title: "Foto pengiriman",
    tag: "20.16 / FOTO YONO",
    description:
      "Pantulan di pintu lift memperlihatkan tanda arsip lama “8” dan rak paket. Itu bukan koridor kantor Wiwo. Foto menguatkan bahwa Yono benar-benar mencapai area servis.",
    frame: 2,
  },
  parcel: {
    id: "parcel",
    title: "Paket YN07 terbuka",
    tag: "MEJA WIWO / BARANG BUKTI",
    description:
      "Nomor segel cocok dengan kiriman Yono. Di dalamnya ada salinan audit: beberapa kiriman berstatus “diterima”, tetapi Wiwo melaporkan barangnya belum masuk kantor. Ada debu karat pada bagian bawah paket.",
    frame: 1,
  },
  access: {
    id: "access",
    title: "Catatan kartu eksekutif",
    tag: "20.15–20.31 / AKSES",
    description: `Kartu TD-02 milik Tedar: ${accessEvents.map((e) => e.time + " " + e.detail).join("; ")}. Ini bertentangan dengan alibinya pulang jam delapan.`,
    frame: 4,
  },
  key: {
    id: "key",
    title: "Kunci servis cadangan",
    tag: "NOAH / AKSES ARSIP",
    description:
      "Setelah log dan kesaksian disandingkan, Noah memberikan kunci servis cadangan. Bukti membuka akses, bukan tebakan kode acak.",
    frame: 3,
  },
  manifest: {
    id: "manifest",
    title: "Daftar kiriman asli",
    tag: "ARSIP / BUKTI PENGUAT",
    description:
      "Nomor kiriman pada daftar asli cocok dengan paket-paket yang masih ditumpuk di ruangan ini. Daftar bertanda inisial TD. Ini menguatkan audit Wiwo, kesaksian Yono, dan catatan kartu Tedar. Di lipatan belakang, tulisan lebih tipis mengulang “Simpan salinannya”, tanpa nama lain.",
    frame: 6,
  },
};
export type Hotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  person?: Person;
  quiz?: number;
  requires?: string[];
};
export const places: Record<
  Place,
  {
    name: string;
    subtitle: string;
    image: string;
    chapter: string;
    hotspots: Hotspot[];
  }
> = {
  lobby: {
    name: "Lobi utama",
    subtitle: "GEDUNG W / LANTAI 01",
    image: "lobby-night",
    chapter: "01 • Orang yang tidak pulang",
    hotspots: [
      { id: "allie", label: "Allie", x: 545, y: 610, person: "allie" },
      { id: "ledger", label: "Buku tamu", x: 605, y: 500, quiz: 0 },
      { id: "plan", label: "Direktori gedung", x: 970, y: 410, quiz: 1 },
      { id: "cctv", label: "Rekaman CCTV", x: 1020, y: 140, quiz: 2 },
    ],
  },
  lift: {
    name: "Area lift",
    subtitle: "GEDUNG W / LANTAI 07",
    image: "elevator-hall",
    chapter: "02 • Satu tujuan yang dihapus",
    hotspots: [
      { id: "noah", label: "Noah", x: 1165, y: 650, person: "noah" },
      { id: "panel", label: "Panel pemeriksaan", x: 800, y: 455, quiz: 3 },
      { id: "photo", label: "Arsip pengiriman", x: 1080, y: 450, quiz: 4 },
    ],
  },
  office: {
    name: "Kantor Wiwo",
    subtitle: "GEDUNG W / LANTAI 07",
    image: "wiwo-office",
    chapter: "03 • Alibi jam delapan",
    hotspots: [
      { id: "wiwo", label: "Pak Wiwo", x: 750, y: 610, person: "wiwo" },
      { id: "tedar", label: "Tedar", x: 1240, y: 650, person: "tedar" },
      { id: "parcel", label: "Paket YN07", x: 1280, y: 545, quiz: 5 },
      { id: "access", label: "Terminal akses", x: 640, y: 475, quiz: 6 },
    ],
  },
  service: {
    name: "Area servis",
    subtitle: "GEDUNG W / AKSES TERBATAS",
    image: "service-corridor",
    chapter: "04 • Di atas tujuh",
    hotspots: [
      { id: "noah-service", label: "Noah", x: 1320, y: 690, person: "noah" },
      {
        id: "lock",
        label: "Pintu arsip",
        x: 1000,
        y: 500,
        quiz: 7,
        requires: ["allieTruth", "noahTruth", "tedarTruth"],
      },
      { id: "stairs", label: "Tangga servis", x: 180, y: 460 },
    ],
  },
  archive: {
    name: "Ruang arsip",
    subtitle: "GEDUNG W / TIDAK TERCATAT",
    image: "hidden-archive",
    chapter: "05 • Orangnya ditemukan. Kasusnya?",
    hotspots: [
      { id: "yono", label: "Yono", x: 1140, y: 660, person: "yono" },
      { id: "manifest", label: "Daftar kiriman", x: 810, y: 555 },
      { id: "conclusion", label: "Susun kesimpulan", x: 480, y: 490 },
    ],
  },
};
export const quizRewards = [
  "ledger",
  "plan",
  "cctv",
  "report",
  "photo",
  "parcel",
  "access",
  "key",
];
export const rewardLines: Line[][] = [
  [
    {
      who: "Detektif",
      text: "Kenapa nama Tedar justru ditulis di pinggir?",
    },
    {
      who: "Yono",
      text: "[Arsip chat malam kejadian · 20.10; diteruskan rekannya pagi ini] “Bilang ke rumah saya pulang habis kiriman ini, ya. Nasinya jangan dibuang dulu.”",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Apa yang sengaja ditutup stiker itu?",
    },
    {
      who: "Yono",
      text: "[Arsip chat malam kejadian · 20.12; diteruskan rekannya pagi ini] “Penerimanya belum turun. Saya disuruh tunggu di atas. Jangan tinggalkan chat dulu, ya.”",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Allie, kamu yakin soal waktunya?",
    },
  ],
  [
    {
      who: "Noah",
      text: "Ini laporan saya, sebelum Yono datang. Pemberhentian servis itu masih aktif. Yang bisa buka bukan semua orang.",
    },
    {
      who: "Yono",
      text: "[Arsip chat malam kejadian · 20.14; diteruskan rekannya pagi ini] “Saya sudah masuk lift. Sepi sekali. Kalau chat saya putus, tunggu sebentar.”",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Yon, sebenarnya kamu disuruh bertemu siapa?",
    },
    {
      who: "Yono",
      text: "[Arsip chat malam kejadian · 20.15; diteruskan rekannya pagi ini] “Saya mulai tidak enak. Ini masih jalur pengiriman biasa, kan?”",
    },
  ],
  [
    {
      who: "Pak Wiwo",
      text: "Itu daftar kiriman yang saya minta diperiksa. Ada barang yang statusnya sudah diterima, tapi tidak pernah sampai ke kantor.",
    },
    {
      who: "Detektif",
      text: "Siapa yang takut daftar itu sampai ke tangan Wiwo?",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Tedar, mau kita cocokkan jamnya?",
    },
    {
      who: "Yono",
      text: "[Arsip chat malam kejadian · 20.15; diteruskan rekannya pagi ini] “Baterai saya merah. Kalau lama tidak membalas, kabari rumah dulu, ya.”",
    },
  ],
  [
    {
      who: "Noah",
      text: "Ini kunci cadangannya. Saya ikut hubungi keamanan. Cari Yono dulu, pertanyaan lainnya bisa menyusul.",
    },
  ],
];
export const opening: Line[] = [
  {
    who: "Rekan Yono",
    text: "Dia hanya antar satu paket. Biasanya kalau telat, voice note-nya panjang. Terakhir hanya bilang lantai delapan, lalu sepi.",
  },
  { who: "Yono", text: "“Saya sudah lantai 8. Orangnya belum ada.”" },
  {
    who: "Detektif",
    text: "Gedungnya tujuh lantai. Pagi ini paketnya ada di meja pemilik kantor. Kurirnya tidak pulang.",
  },
  {
    who: "Detektif",
    text: "Mulai dari orang terakhir yang melihatnya. Lobi, buku tamu, lalu rekaman kamera.",
  },
];
export const ending: Line[] = [
  {
    who: "Yono",
    text: "Tedar bilang penerimanya menunggu di arsip. Saya lihat paket-paket dengan nomor yang sama di daftar itu. Pas saya tanya, dia ambil paket saya dan menutup pintu dari luar.",
  },
  {
    who: "Detektif",
    text: "Kamu sempat berpikir tidak bakal ada yang datang, Yon?",
  },
  {
    who: "Pak Wiwo",
    text: "Keamanan sudah pegang buktinya. Yono ke klinik dulu. Dan tolong… judul beritanya jangan “Bos Punya Lantai Gaib”.",
  },
  {
    who: "Tedar",
    text: "Saya ingin mengoreksi beberapa bagian keterangan saya.",
  },
  {
    who: "Allie",
    text: "Bagian mana? Yang jam delapan, atau yang “tidak tahu apa-apa”?",
  },
  {
    who: "Detektif",
    text: "Yono ditemukan. Pengalihan kiriman terungkap. Yon, ada yang bisa jemput kamu?",
  },
  {
    who: "Nomor tak dikenal",
    text: "[Foto ruang arsip • dikirim sebelum penyelidikan]\n“Sekarang kamu tahu kenapa saya minta dia simpan salinannya.”",
  },
  {
    who: "Detektif",
    text: "Siapa yang minta Yono menyimpan salinan itu?",
  },
];
