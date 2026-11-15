# DI ATAS TUJUH — redesign UI 1.2

15 November 2026. Implementasi ada di `/Users/alvirariskyyulianti/Desktop/ASPRAK/LARAVEL`. Stack tetap Vite, TypeScript, Phaser Canvas, dan API Node/Vercel; bukan Blade atau Livewire. Pengerjaan mengikuti urutan A+B → C+D → E+F+G+H → P1/P2.

Galeri dan screenshot disertakan pada paket QA terpisah.. Galeri menyediakan sembilan layar pada 1210×760, 1440×900, 1920×1080, dan 390×844. Klik gambar untuk melihat PNG utuh. Ada tambahan pembuka langkah kedua dan papan bukti yang sudah terisi.

## A+B — pembuka dan ruangan

Intro sekarang dua langkah, dengan Lewati, indikator yang bisa diklik, pesan Yono berefek ketik, dan ponsel dengan ukuran/posisi yang konsisten. Gedung tetap terbaca di sisi kanan. Aturan nilai ditulis pada cara main.

Sidebar, bar Periksa, strip inventory, dan footer status dihapus dari eksplorasi. Scene memenuhi viewport; header hanya memuat identitas game, lokasi, peralatan, dan avatar inisial. Objektif satu baris menemani ruangan. Klik nama lokasi untuk berpindah ke tempat yang sudah terbuka.

## C+D — interaksi dan dialog

Hotspot menjadi tombol DOM 48×48 px yang diproyeksikan dari koordinat artwork melalui kamera cover. Label default tersembunyi, muncul saat hover/fokus atau toggle nama objek. Anchor tiap objek ditentukan manual. Satu coach-mark menempel di sasaran pertama dan hilang setelah interaksi. Semua objek saat ini memiliki satu aksi relevan, sehingga klik langsung mengerjakannya; tidak ditambah menu kosong dengan pilihan identik.

Daftar objek adalah fallback popover, dengan Tab/panah dan tombol O. Tubuh saksi juga dapat diklik. Percakapan muncul sebagai kotak visual novel di bawah; klik/Spasi melengkapi baris sebelum melanjutkan. Saksi mendapat sorotan skala/alpha ringan dari sprite yang sama. Pertanyaan awal memberikan dua pilihan, dan Log membuka kembali ucapan sebelumnya. Pemeriksaan keyboard menemukan dan memperbaiki fokus yang sempat jatuh ke body sesudah klik hotspot.

## E+F+G+H — bukti, Laravel, panel

Map kasus membuka papan bukti penuh, berupa catatan/foto, pin, dan benang SVG merah antar temuan yang berhubungan. Hanya bukti yang sudah diperoleh yang dirender. Detail bukti dapat kembali ke papan. Bukti teknis tampil sebagai catatan cetak. Temuan baru memunculkan toast di atas, gerak map singkat, dan efek pickup yang sudah ada.

Panel lift menampilkan delapan konsep asli: MVC; struktur folder; routing; Artisan controller; alur request; Blade/asset/CSRF; resource route; route–controller–view. Nama tersedia pada hover/fokus; lantai kedelapan terkunci sampai tujuh sebelumnya selesai. Di ponsel, satu tombol membuka panel lantai. Tombol ini menampilkan konsep/ulasan, bukan melewati gate cerita.

Analisis mempunyai bingkai cerita singkat, scene redup, dan bukti rujukan yang bisa dibuka tanpa meninggalkan form atau mereset jawaban yang sedang dipilih. Koreksi teknis dan hasil penilaian tetap dari server yang sama. Feedback menambahkan reaksi detektif dan makna temuan.

Catatan, Petunjuk, dan Jeda menjadi drawer kanan; pada ponsel menjadi bottom sheet. Catatan berisi objektif lengkap, bukti, dan log. Petunjuk dibuka bertahap serta menyediakan shortcut. Jeda berisi mixer, pengurangan gerak, lanjut, lihat ulang ruangan, dan simpan/keluar. Lihat ulang ruangan hanya memuat ulang scene, tanpa mereset progres/nilai.

## P1/P2 — sistem visual dan suara bahasa

UI memakai Source Sans; serif untuk judul/narasi; Oswald hanya pada identitas D/7. Dialog berukuran 22 px desktop / 20 px ponsel. Label kecil diangkat ke minimal 12 px; isi UI utama umumnya 14–18 px. Ikon berasal dari satu keluarga SVG inline. Latar panel gelap, radius 8 px, border seperlunya, dan aksen amber untuk tindakan/fokus/objektif. Gerak UI 150–250 ms; transisi scene 400 ms. Preferensi gerak sistem dan pilihan tersimpan dihormati.

Label dashboard dan angka dekoratif dihapus. Copy chrome dipadatkan menjadi instruksi langsung lo/gue; kata ganti dalam dialog diseragamkan tanpa mengubah kejadian, hubungan bukti, atau kronologi. Isi/instruksi/penjelasan soal Laravel tetap asli. Klaim pemotongan tepat 40% untuk seluruh naskah tidak dibuat: konten akademik dan fakta cerita sengaja dipertahankan.

## Yang dijaga tetap sama

Perbandingan byte terhadap backup sebelum redesign memastikan `server/api.ts`, `server/questions.ts`, `src/progression.ts`, `shared/types.ts`, semua endpoint `api/run/*`, dan `vercel.json` tidak berubah. Seluruh berkas di `public/` juga identik. Tidak ada dependensi runtime atau dependency pengujian baru di project game; Playwright untuk QA dipasang terpisah di direktori kerja.

Identitas, key penyimpanan, format save v1, checkpoint, token, routing, skor 12,5 per jawaban pertama, retry submission, syarat cerita, dan verifikasi tanda tangan dipertahankan. Perubahan package hanya nomor versi 1.2.0. Resume sesi lama tetap menggunakan jalur yang sama.

## Validasi

- Sebelum perubahan: satu putaran penuh lewat UI Chrome/Playwright, delapan jawaban, satu soal sengaja salah, hasil 87,5; tanpa page error.
- Setelah C+D dan setelah E+F+G+H: masing-masing satu putaran penuh menghasilkan 87,5.
- Versi akhir: putaran penuh desktop dan viewport ponsel menghasilkan 87,5 dengan delapan submission. Jalur akhir memakai cincin scene bila tampak, dengan daftar objek sebagai fallback. Seluruh kontrol mengirim ke server asli lokal.
- 20 tes otomatis lulus: server, progres/kronologi, integrasi UI, retry/reload, respons terlambat, keyboard dialog, cover, dan keterjangkauan sasaran di viewport sempit.
- TypeScript dan build produksi Vite lulus. Chunk Phaser tetap sekitar 1,49 MB / 341 KB gzip, dimuat terpisah; peringatan ukuran chunk belum dioptimasi dalam pekerjaan UI ini.
- 44 screenshot keadaan akhir: pemeriksaan DOM pada sembilan layar utama dan dua tambahan × empat viewport tidak menemukan teks tampak di bawah 12 px atau overflow horizontal halaman. Ini pemeriksaan DOM dan screenshot, bukan sertifikasi aksesibilitas.
- Rasio kontras pasangan token utama (panel, teks sekunder, aksi, kertas bukti, objektif, dan dialog) dihitung ≥4,5:1; hasil di `contrast.json`. Teks di scene memakai scrim/latar gelap. Ini tidak menggantikan audit WCAG menyeluruh.
- Pengujian keyboard di Chrome: trap fokus drawer, Esc dan kembali ke pemicu, panah daftar objek, Spasi efek ketik, Log kembali ke baris yang sama, bukti kembali ke papan, pilihan audio/gerak tersimpan, ulang scene tanpa reset, tooltip konsep, kunci lantai 8, serta panel lift ponsel; tanpa page error.

Lihat `before/report.json`, `after/report.json`, `mobile/report.json`, dan `interactions.json` untuk ringkasan eksekusi. Pemeriksaan ini otomatis di browser nyata, bukan playtest mahasiswa. Keseruan dan durasi masih perlu pemain manusia. Tidak mengklaim cakupan semua browser, perangkat ponsel fisik, atau beban kelas.

## Adaptasi dan yang tidak dikerjakan

Gambar 16:9 yang di-cover ke ponsel portrait tidak bisa menampilkan semua objek sekaligus tanpa mengecilkan atau meregangkan gambar. Kamera karena itu mengikuti sasaran aktif (dan saksi saat bicara). Objek di luar frame tetap dijangkau lewat Daftar objek. Papan bukti mempertahankan area catatan yang dapat digeser horizontal pada ponsel agar tulisannya terbaca; halaman utamanya tidak melebar.

Tidak membuat pose/ekspresi baru, rekaman dialog penuh, suara kloning, atau tekstur raster baru. Aset ekspresi tidak tersedia; reaksi memakai skala/alpha dari sprite lama. Tidak ada aset wajib yang kurang untuk versi ini. Musik noir, ambience, SFX WebAudio, dan dua klip suara opsional yang sudah ada dipakai kembali dengan pengaturan tersimpan. Tidak mengubah soal agar cocok dengan daftar konsep default di brief; materi tetap introduction yang sebenarnya.

Tidak menambah animasi khusus tiap karakter atau preset pertanyaan tiga pilihan untuk semua dialog; wawancara awal memiliki dua pilihan yang memakai informasi asli. Tidak ada deployment, perubahan backend penilaian, database baru, atau mekanik anticurang tambahan.

## Berkas yang diubah

- `src/main.ts`: struktur layar, intro, presentasi dialog/bukti/analisis, drawer, fokus, keyboard, copy.
- `src/world.ts`: renderer resize/cover, proyeksi hotspot, focal point, sorotan saksi, label dan coach-mark.
- `src/style.css`: batas ukuran teks kecil pada gaya dasar.
- `src/story.ts`: penyeragaman kata ganti/copy; fakta, ID, reward dan kronologi tetap.
- Baru `src/cinematic.css`: gaya scene, intro, visual novel, papan bukti, lift, drawer, responsif.
- Baru `src/ui.ts`: SVG konsisten dan anchor label.
- Baru `src/scene-layout.ts`: perhitungan cover/proyeksi yang dapat diuji.
- `tests/journey.test.ts`: mengikuti kontrol baru dan regresi keyboard.
- Baru `tests/scene-layout.test.ts`: cover serta jangkauan hotspot aktif.
- `package.json`, `package-lock.json`: versi 1.2.0, tanpa penambahan dependency.
- `README.md`, `QA.md`, `UI-REDESIGN.md`: panduan serta laporan yang sesuai versi baru.

