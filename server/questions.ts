import type { Question, Answer } from "../shared/types.js";
export const questions: (Question & {
  expected: Answer;
  explanation: string;
})[] = [
  {
    id: "mvc",
    number: 1,
    title: "Siapa mengerjakan apa?",
    context:
      "Catatan pengunjung tersimpan, tetapi pembagian tugas sistemnya kacau. Pulihkan tiga peran MVC.",
    instruction: "Pilih komponen yang tepat untuk setiap tanggung jawab.",
    kind: "match",
    rows: [
      "Mengelola data pengunjung",
      "Menampilkan daftar pengunjung",
      "Menangani request dan menentukan respons",
    ],
    options: [
      { id: "controller", text: "Controller" },
      { id: "model", text: "Model" },
      { id: "view", text: "View" },
    ],
    expected: ["model", "view", "controller"],
    explanation:
      "Model mengelola data dan logika terkait data; View menyajikan tampilan; Controller menangani request dan mengoordinasikan respons. Tidak semua request harus mengakses Model.",
  },
  {
    id: "folders",
    number: 2,
    title: "Berkas yang salah alamat",
    context:
      "Salinan denah belum bisa ditampilkan. Temukan lokasi berkas yang benar dalam proyek Laravel.",
    instruction: "Cocokkan setiap berkas dengan lokasinya.",
    kind: "match",
    rows: [
      "Definisi route web",
      "Controller bernama LiftController",
      "View bernama denah",
      "Gambar denah yang diakses langsung",
    ],
    options: [
      { id: "public", text: "public/images/denah.png" },
      { id: "views", text: "resources/views/denah.blade.php" },
      { id: "routes", text: "routes/web.php" },
      { id: "controller", text: "app/Http/Controllers/LiftController.php" },
    ],
    expected: ["routes", "controller", "views", "public"],
    explanation:
      "Route web didefinisikan di routes/web.php. Controller berada di app/Http/Controllers, view di resources/views, dan aset yang diakses langsung ada di public. resources bukan folder definisi route.",
  },
  {
    id: "route",
    number: 3,
    title: "Request menuju rekaman",
    context:
      "Arsip CCTV dibuka melalui GET /kiriman/YN07. Route harus meneruskan kode kiriman ke method show.",
    instruction:
      "Asumsikan KirimanController sudah di-import. Pilih route yang cocok.",
    kind: "single",
    options: [
      {
        id: "post",
        text: "Route::post('/kiriman/{kode}', [KirimanController::class, 'show']);",
      },
      {
        id: "get",
        text: "Route::get('/kiriman/{kode}', [KirimanController::class, 'show']);",
      },
      {
        id: "static",
        text: "Route::get('/kiriman', [KirimanController::class, 'show']);",
      },
      {
        id: "missing",
        text: "Route::get('/kiriman/{kode}', [KirimanController::class, 'store']);",
      },
    ],
    expected: "get",
    explanation:
      "Method HTTP dan pola URL sama-sama harus cocok. GET /kiriman/YN07 cocok dengan GET /kiriman/{kode}, lalu Laravel memanggil show. POST adalah method berbeda, dan route tanpa parameter tidak cocok dengan URL ini.",
  },
  {
    id: "artisan",
    number: 4,
    title: "Bangun pengendali lift",
    context:
      "Noah memerlukan controller biasa bernama LiftController untuk membaca status lift.",
    instruction: "Pilih perintah Artisan yang membuat controller tersebut.",
    kind: "single",
    options: [
      { id: "model", text: "php artisan make:model LiftController" },
      { id: "serve", text: "php artisan serve LiftController" },
      { id: "controller", text: "php artisan make:controller LiftController" },
      { id: "migration", text: "php artisan make:migration LiftController" },
    ],
    expected: "controller",
    explanation:
      "php artisan make:controller LiftController membuat class controller di app/Http/Controllers. make:model dan make:migration memiliki tujuan lain; serve menjalankan server pengembangan.",
  },
  {
    id: "flow",
    number: 5,
    title: "Ikuti perjalanan request",
    context:
      "Controller lift mengembalikan tampilan status. Susun alur sederhana ini, tanpa akses database.",
    instruction:
      "Klik kartu sesuai urutan, dari awal sampai akhir. Gunakan Reset jika ingin mengubah urutan sebelum mengirim.",
    kind: "order",
    options: [
      { id: "view", text: "View dirender" },
      { id: "response", text: "Respons diterima browser" },
      { id: "controller", text: "Method controller dijalankan" },
      { id: "request", text: "Browser mengirim request" },
      { id: "route", text: "Route yang cocok ditemukan" },
    ],
    expected: ["request", "route", "controller", "view", "response"],
    explanation:
      "Untuk contoh yang memakai controller: browser mengirim request, router mencocokkan route, method controller berjalan, view dirender, lalu respons dikirim ke browser. Route juga boleh langsung mengembalikan view tanpa controller.",
  },
  {
    id: "blade",
    number: 6,
    title: "Tampilkan lampiran paket",
    context:
      "Halaman lampiran menggunakan Blade. Gambar tersimpan di public/images/paket.png; form mengirim POST ke route yang sudah tersedia.",
    instruction: "Pilih potongan yang tepat untuk tiap kebutuhan.",
    kind: "match",
    rows: [
      "URL gambar di public/images/paket.png",
      "Token perlindungan untuk form POST",
      "Mengembalikan resources/views/lampiran.blade.php",
    ],
    options: [
      { id: "view", text: "return view('lampiran');" },
      { id: "csrf", text: "@csrf" },
      { id: "asset", text: "{{ asset('images/paket.png') }}" },
      { id: "public", text: "{{ asset('public/images/paket.png') }}" },
    ],
    expected: ["asset", "csrf", "view"],
    explanation:
      "asset() membentuk URL relatif terhadap folder public, jadi jangan mengulang public/ pada path. @csrf menambahkan token pada form POST. view('lampiran') merender template lampiran; view bisa dikembalikan dari controller maupun closure route.",
  },
  {
    id: "resource",
    number: 7,
    title: "Baca jejak akses",
    context:
      "Sistem memakai Route::resource('kiriman', KirimanController::class). Cocokkan empat request pada catatan akses dengan aksi controller-nya.",
    instruction:
      "Pilih method resource yang sesuai. Ini pemetaan route, bukan implementasi database.",
    kind: "match",
    rows: [
      "GET /kiriman/create",
      "POST /kiriman",
      "GET /kiriman/17",
      "DELETE /kiriman/17",
    ],
    options: [
      { id: "show", text: "show" },
      { id: "destroy", text: "destroy" },
      { id: "index", text: "index" },
      { id: "create", text: "create" },
      { id: "store", text: "store" },
      { id: "update", text: "update" },
      { id: "edit", text: "edit" },
    ],
    expected: ["create", "store", "show", "destroy"],
    explanation:
      "create menampilkan form; store menerima pembuatan; show menampilkan satu resource; destroy menangani penghapusan. Pemetaan lain: GET /kiriman → index, GET /kiriman/{id}/edit → edit, PUT/PATCH /kiriman/{id} → update.",
  },
  {
    id: "reconstruct",
    number: 8,
    title: "Sambungkan akses arsip",
    context:
      "Template arsip.blade.php sudah tersedia. Route GET /arsip harus memanggil method buka pada ArsipController lalu mengembalikan view arsip.",
    instruction:
      "Asumsikan class sudah memakai namespace dan import yang benar. Pilih rangkaian yang konsisten.",
    kind: "single",
    options: [
      {
        id: "wrong-view",
        text: "Route::get('/arsip', [ArsipController::class, 'buka']);\npublic function buka() { return view('arsip.blade.php'); }",
      },
      {
        id: "right",
        text: "Route::get('/arsip', [ArsipController::class, 'buka']);\npublic function buka() { return view('arsip'); }",
      },
      {
        id: "wrong-method",
        text: "Route::get('/arsip', [ArsipController::class, 'index']);\npublic function buka() { return view('arsip'); }",
      },
      {
        id: "wrong-http",
        text: "Route::post('/arsip', [ArsipController::class, 'buka']);\npublic function buka() { return view('arsip'); }",
      },
    ],
    expected: "right",
    explanation:
      "Ketiga sambungan harus konsisten: GET /arsip, method buka pada controller, dan nama view arsip tanpa ekstensi .blade.php. Namespace App\\Http\\Controllers dan import controller tetap diperlukan dalam proyek sebenarnya.",
  },
];
export function publicQuestion(index: number): Question {
  const { expected, explanation, ...q } = questions[index];
  return q;
}
export function grade(index: number, answer: Answer) {
  const q = questions[index];
  return JSON.stringify(answer) === JSON.stringify(q.expected);
}
