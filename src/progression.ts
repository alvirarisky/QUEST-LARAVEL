import type { Place } from "./story";
export type Progress = {
  run: { answers: boolean[] };
  flags: Record<string, boolean>;
  clues: string[];
  closed: boolean;
};
export type Step = {
  id: string;
  place: Place;
  hotspot: string;
  title: string;
  detail: string;
  cta: string;
  kind: "talk" | "inspect" | "confront" | "deduce" | "complete";
  complete: (s: Progress) => boolean;
};
const answered = (n: number) => (s: Progress) => s.run.answers.length >= n;
const flagged = (key: string) => (s: Progress) => !!s.flags[key];
export const steps: Step[] = [
  {
    id: "meet-allie",
    place: "lobby",
    hotspot: "allie",
    kind: "talk",
    title: "Temui Allie di resepsionis.",
    detail:
      "Dia orang terakhir yang melihat Yono masuk. Tanyakan ke mana Yono diarahkan.",
    cta: "Bicara dengan Allie",
    complete: (s) => !!s.flags.allieBriefed || s.run.answers.length > 0,
  },
  {
    id: "ledger",
    place: "lobby",
    hotspot: "ledger",
    kind: "inspect",
    title: "Periksa buku tamu.",
    detail:
      "Allie menunjuk buku di meja resepsionis. Cari tujuan pengiriman Yono.",
    cta: "Periksa buku tamu",
    complete: answered(1),
  },
  {
    id: "plan",
    place: "lobby",
    hotspot: "plan",
    kind: "inspect",
    title: "Cocokkan jumlah lantainya.",
    detail:
      "Buku tamu mengarah ke kantor Wiwo. Lihat direktori untuk memastikan letak kantornya.",
    cta: "Periksa direktori gedung",
    complete: answered(2),
  },
  {
    id: "cctv",
    place: "lobby",
    hotspot: "cctv",
    kind: "inspect",
    title: "Lihat Yono masuk lift.",
    detail:
      "Denah cuma mencatat tujuh lantai. Rekaman kamera bisa menunjukkan perjalanan terakhirnya.",
    cta: "Periksa rekaman CCTV",
    complete: answered(3),
  },
  {
    id: "allie-proof",
    place: "lobby",
    hotspot: "allie",
    kind: "confront",
    title: "Uji keterangan Allie.",
    detail:
      "Allie bilang berjaga saat Yono datang. Bandingkan kalimat itu dengan waktu pada rekaman.",
    cta: "Tanya Allie soal rekaman",
    complete: flagged("allieTruth"),
  },
  {
    id: "meet-noah",
    place: "lift",
    hotspot: "noah",
    kind: "talk",
    title: "Temui teknisi lift.",
    detail:
      "Allie menyebut akses servis. Noah menunggu di lantai tujuh dan mengetahui jalurnya.",
    cta: "Bicara dengan Noah",
    complete: (s) => !!s.flags.noahBriefed || s.run.answers.length >= 4,
  },
  {
    id: "report",
    place: "lift",
    hotspot: "panel",
    kind: "inspect",
    title: "Baca laporan perawatan.",
    detail:
      "Noah meminta lo melihat laporan pada panel pemeriksaan. Cari pemberhentian yang tidak tercatat.",
    cta: "Periksa laporan Noah",
    complete: answered(4),
  },
  {
    id: "photo",
    place: "lift",
    hotspot: "photo",
    kind: "inspect",
    title: "Cari foto pengiriman Yono.",
    detail:
      "Ada pemberhentian servis di atas lantai tujuh. Cocokkan dengan foto yang dikirim Yono.",
    cta: "Buka foto pengiriman",
    complete: answered(5),
  },
  {
    id: "noah-proof",
    place: "lift",
    hotspot: "noah",
    kind: "confront",
    title: "Minta Noah menjelaskan denah.",
    detail:
      "Tunjukkan area yang ditutupi pada denah. Apa hubungan area itu dengan pemberhentian servis?",
    cta: "Tunjukkan denah ke Noah",
    complete: flagged("noahTruth"),
  },
  {
    id: "meet-wiwo",
    place: "office",
    hotspot: "wiwo",
    kind: "talk",
    title: "Temui penerima paket.",
    detail:
      "Noah mengonfirmasi ruang arsip. Sekarang tanyakan ke Wiwo kenapa paket Yono ada di kantornya.",
    cta: "Bicara dengan Wiwo",
    complete: (s) => !!s.flags.wiwoBriefed || s.run.answers.length >= 6,
  },
  {
    id: "parcel",
    place: "office",
    hotspot: "parcel",
    kind: "inspect",
    title: "Periksa isi paket YN07.",
    detail:
      "Wiwo sedang memeriksa kiriman yang tidak sampai. Paket Yono membawa salinan daftarnya.",
    cta: "Periksa paket Yono",
    complete: answered(6),
  },
  {
    id: "meet-tedar",
    place: "office",
    hotspot: "tedar",
    kind: "talk",
    title: "Catat alibi Tedar.",
    detail:
      "Tedar mengurus penerimaan paket. Tanyakan kapan dia meninggalkan kantor malam itu.",
    cta: "Tanya Tedar soal waktunya",
    complete: (s) => !!s.flags.tedarBriefed || s.run.answers.length >= 7,
  },
  {
    id: "access",
    place: "office",
    hotspot: "access",
    kind: "inspect",
    title: "Periksa waktu kartu dipakai.",
    detail:
      "Tedar mengaku pulang pukul 20.00. Terminal akses menyimpan waktu penggunaan kartunya.",
    cta: "Baca catatan kartu akses",
    complete: answered(7),
  },
  {
    id: "tedar-proof",
    place: "office",
    hotspot: "tedar",
    kind: "confront",
    title: "Bandingkan alibi dengan log.",
    detail:
      "Kartu Tedar masih dipakai setelah pukul 20.00. Minta dia menjelaskan selisih waktu itu.",
    cta: "Uji alibi Tedar",
    complete: flagged("tedarTruth"),
  },
  {
    id: "archive-door",
    place: "service",
    hotspot: "lock",
    kind: "inspect",
    title: "Buka jalur menuju arsip.",
    detail:
      "Tiga keterangan sudah diuji. Temui Noah di area servis untuk membuka pintu arsip.",
    cta: "Periksa pintu arsip",
    complete: answered(8),
  },
  {
    id: "find-yono",
    place: "archive",
    hotspot: "yono",
    kind: "talk",
    title: "Temukan dan dengarkan Yono.",
    detail: "Akses arsip sudah terbuka. Masuk dan pastikan Yono selamat.",
    cta: "Bicara dengan Yono",
    complete: flagged("yonoFound"),
  },
  {
    id: "manifest",
    place: "archive",
    hotspot: "manifest",
    kind: "inspect",
    title: "Ambil daftar kiriman asli.",
    detail:
      "Kesaksian Yono perlu bukti pendukung. Periksa daftar di meja arsip.",
    cta: "Periksa daftar kiriman",
    complete: (s) => s.clues.includes("manifest"),
  },
  {
    id: "conclusion",
    place: "archive",
    hotspot: "conclusion",
    kind: "deduce",
    title: "Susun kejadian malam itu.",
    detail:
      "Gabungkan pelaku, jalur pemindahan paket, dan motifnya dengan bukti yang ditemukan.",
    cta: "Susun kesimpulan kasus",
    complete: (s) => s.closed,
  },
];
export function nextStep(s: Progress): Step {
  return (
    steps.find((step) => !step.complete(s)) || {
      id: "complete",
      place: "archive",
      hotspot: "conclusion",
      kind: "complete",
      title: "Kasus selesai. Yono ditemukan.",
      detail: "Hasil Laravel dan bukti pengumpulan sudah tersedia.",
      cta: "Lihat hasil dan unduh bukti",
      complete: () => true,
    }
  );
}
export function stepNumber(s: Progress) {
  const i = steps.findIndex((step) => !step.complete(s));
  return i < 0 ? steps.length : i + 1;
}
export function availablePlaces(s: Progress): Place[] {
  const result: Place[] = ["lobby"];
  if (s.run.answers.length >= 3 && s.flags.allieTruth) result.push("lift");
  if (s.run.answers.length >= 5 && s.flags.noahTruth && result.includes("lift"))
    result.push("office");
  if (
    s.run.answers.length >= 7 &&
    s.flags.tedarTruth &&
    result.includes("office")
  )
    result.push("service");
  if (s.run.answers.length >= 8 && result.includes("service"))
    result.push("archive");
  return result;
}
export const challengeNotes = [
  {
    look: "Yono tercatat sebagai pengunjung pada 20.12. Kolom penerima belum terisi.",
    meaning:
      "Buku ini bisa mengungkap siapa yang mengarahkan Yono setelah masuk gedung.",
    concept: "MVC",
    why: "Pisahkan data pengunjung, tampilan buku tamu, dan penanganan permintaan pada contoh aplikasi Laravel.",
  },
  {
    look: "Direktori hanya mencantumkan lantai 1 sampai 7. Ada stiker renovasi di atas denah.",
    meaning: "Pesan “lantai 8” tidak cocok dengan informasi untuk pengunjung.",
    concept: "Struktur folder",
    why: "Gunakan contoh berkas denah untuk mencocokkan lokasi route, controller, view, dan aset publik.",
  },
  {
    look: "Daftar rekaman memuat kiriman YN07 pada 20.14.",
    meaning:
      "Rekaman dapat memeriksa apakah Yono keluar dan apakah Allie benar-benar berada di meja.",
    concept: "Routing",
    why: "Pilih route yang cocok untuk permintaan GET rekaman kiriman YN07.",
  },
  {
    look: "Noah menyimpan laporan pemeriksaan sebelum Yono datang.",
    meaning:
      "Laporan dibuat sebelum kejadian, sehingga dapat menguji kondisi lift tanpa menebak.",
    concept: "Artisan controller",
    why: "Kenali perintah yang membuat controller pembaca status lift pada contoh Laravel.",
  },
  {
    look: "Arsip pengiriman menyimpan foto terakhir dari ponsel Yono.",
    meaning: "Foto dapat menunjukkan ruangan yang sebenarnya dia capai.",
    concept: "Alur request",
    why: "Susun bagaimana permintaan foto dipetakan ke controller, dirender, lalu diterima browser.",
  },
  {
    look: "Paket YN07 di meja Wiwo sudah terbuka. Nomor segelnya sama dengan kiriman Yono.",
    meaning:
      "Paket sampai ke kantor, tetapi kurirnya tidak. Isi paket dapat menjelaskan motifnya.",
    concept: "Blade, asset, CSRF",
    why: "Lengkapi contoh halaman lampiran paket: gambar publik, view, dan form POST.",
  },
  {
    look: "Terminal mencatat waktu kartu TD-02 dipakai. Pemiliknya Tedar.",
    meaning:
      "Waktu penggunaan kartu dapat dibandingkan dengan alibi pulang pukul 20.00.",
    concept: "Resource route",
    why: "Baca pemetaan request ke aksi controller pada contoh pencatatan kiriman.",
  },
  {
    look: "Pintu servis menuju ruang yang tidak tercatat pada denah umum.",
    meaning:
      "Keterangan saksi dan catatan kartu menunjukkan Yono berada di balik akses ini.",
    concept: "Route → controller → view",
    why: "Selesaikan contoh rangkaian Laravel terakhir sebelum menutup tahap pemeriksaan akses.",
  },
];
