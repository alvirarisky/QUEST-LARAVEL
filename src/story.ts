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
      "Gue di meja waktu Yono masuk lift. Dia menuju kantor Pak Wiwo. Setelah itu gue nggak lihat dia lagi.",
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
      "Cari orangnya dulu. Nama gedung gue di berita sudah salah, jangan sampai jumlah lantainya ikut salah.",
  },
  tedar: {
    name: "Tedar",
    role: "Asisten eksekutif",
    intro:
      "Gue meninggalkan kantor tepat jam delapan. Paket itu sudah di meja ketika gue kembali pagi ini.",
  },
  yono: {
    name: "Yono",
    role: "Kurir • kiriman YN07",
    intro:
      "Akhirnya. Gue kira orang satu gedung udah pulang. Ponsel gue mati sejak tadi malam.",
  },
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
      "Rekan Yono menerima pesan setelah ia masuk lift. Tidak ada kabar lagi setelah itu.",
    quote: "“Gue udah lantai 8. Orangnya belum ada.”",
    frame: 2,
  },
  ledger: {
    id: "ledger",
    title: "Buku tamu",
    tag: "20.12 / LOBI",
    description:
      "Yono, kiriman YN07, tujuan kantor Wiwo. Kolom penerima kosong. Catatan di sisi halaman: “Tedar — tunggu di atas”.",
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
      "Pantulan di pintu lift memperlihatkan tlo arsip lama “8” dan rak paket. Itu bukan koridor kantor Wiwo. Foto menguatkan bahwa Yono benar-benar mencapai area servis.",
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
      "Nomor kiriman pada daftar asli cocok dengan paket-paket yang masih ditumpuk di ruangan ini. Daftar bertlo inisial TD. Ini menguatkan audit Wiwo, kesaksian Yono, dan catatan kartu Tedar.",
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
      text: "Nama Yono ada. Nama penerimanya kosong. Tapi kenapa ada nama Tedar di sisi halaman?",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Tujuh lantai. Ada stiker menutup bagian denah di atas lantai tujuh. Lebih baik tanya teknisinya.",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Yono tidak keluar melalui lobi. Allie juga tidak berada di meja saat dia masuk lift. Keterangannya perlu diperiksa lagi.",
    },
  ],
  [
    {
      who: "Noah",
      text: "Ini laporan gue, sebelum Yono datang. Pemberhentian servis itu masih aktif. Yang bisa buka bukan semua orang.",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Foto Yono menunjukkan tlo arsip lama. Lantai delapan bukan angka asal ketik. Dia sampai ke suatu tempat.",
    },
  ],
  [
    {
      who: "Pak Wiwo",
      text: "Itu daftar kiriman yang gue minta diperiksa. Ada barang yang statusnya sudah diterima, tapi nggak pernah sampai ke kantor.",
    },
    {
      who: "Detektif",
      text: "Jadi Yono membawa sesuatu yang bisa membongkar pengalihan kiriman.",
    },
  ],
  [
    {
      who: "Detektif",
      text: "Kartu Tedar masih dipakai pukul 20.31. Dia bilang pulang jam delapan. Sekarang gue punya alasan untuk membantahnya.",
    },
  ],
  [
    {
      who: "Noah",
      text: "Ini kunci cadangannya. Gue ikut hubungi keamanan. Cari Yono dulu, pertanyaan lainnya bisa menyusul.",
    },
  ],
];
export const opening: Line[] = [
  {
    who: "Rekan Yono",
    text: "Dia cuma antar satu paket. Biasanya kalau telat, dia kirim voice note panjang. Kali ini cuma satu pesan.",
  },
  { who: "Yono", text: "“Gue udah lantai 8. Orangnya belum ada.”" },
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
    text: "Tedar bilang penerimanya nunggu di arsip. Gue lihat paket-paket dengan nomor yang sama di daftar itu. Pas gue tanya, dia ambil paket gue dan nutup pintu dari luar.",
  },
  {
    who: "Detektif",
    text: "Satu ruang yang dihapus dari denah. Satu kartu yang membantah alibi. Satu kurir yang melihat terlalu banyak.",
  },
  {
    who: "Pak Wiwo",
    text: "Keamanan sudah pegang buktinya. Yono ke klinik dulu. Dan tolong… judul beritanya jangan “Bos Punya Lantai Gaib”.",
  },
  {
    who: "Tedar",
    text: "Gue ingin mengoreksi beberapa bagian keterangan gue.",
  },
  {
    who: "Allie",
    text: "Bagian mana? Yang jam delapan, atau yang “nggak tahu apa-apa”?",
  },
  {
    who: "Detektif",
    text: "Yono ditemukan. Pengalihan kiriman terungkap. Untuk sementara, kasusnya selesai.",
  },
  {
    who: "Nomor tak dikenal",
    text: "[Foto ruang arsip • dikirim sebelum penyelidikan]\n“Sekarang lo tahu kenapa gue minta dia simpan salinannya.”",
  },
  {
    who: "Detektif",
    text: "Siapa yang mengirim Yono ke gedung itu dengan daftar kiriman asli? Pertanyaan itu belum punya nama.",
  },
];
