# Pass desain kedua — Tahap 1

15 November 2026. Status: Tahap 1 selesai untuk ditinjau. Berhenti di sini sesuai instruksi; Tahap 2, 3, dan 4 belum dimulai.

Galeri before/after disertakan dalam paket QA terpisah. Screenshot sebelum dan sesudah tersedia pada 1210×760, 1440×900, dan 390×844. Galeri memprioritaskan akhir wawancara, pemeriksaan benda, home, dan dialog; layar pendukung juga tersedia. Kartu bab adalah layar baru sehingga disediakan sebagai tambahan, tanpa mengarang baseline yang tidak ada.

## Yang berubah

1. **Akhir dialog kembali ke scene.** `progressSummary` tidak lagi membuat panel “Berikutnya”. Selesai wawancara langsung membuka ruangan, menampilkan satu kalimat monolog di bawah header, dan menyorot hotspot jejak aktif melalui model progres lama. Petunjuk, daftar objek, dan nama lokasi tetap menjadi jalur bantuan. Tidak ada auto-submit atau perubahan urutan cerita.
2. **Bukti menjadi benda.** Pemeriksaan awal dan detail bukti memakai kertas, layar ponsel/terminal, parcel, atau kunci dari atlas properti yang sudah ada; tidak ada gambar baru. Kutipan/observasi utama ditonjolkan, benda diberi sedikit rotasi, dan Mulai analisis menempel pada benda. Kotak “Kenapa penting?” dihapus; maknanya disampaikan sebagai subtitle Detektif. Scrim gelap tipis mempertahankan keterbacaan scene, tanpa backdrop blur. Pengurangan gerak menghilangkan rotasi/animasi.
3. **Serif lokal.** Source Serif 4 Regular WOFF2 dibundel ke `public/fonts/`, bersama lisensi SIL OFL 1.1. `--serif` kini memakai font tersebut. Jarak judul home “tujuh.” dengan tagline diperbaiki, dan dialog memakai font baru dengan line-height yang diperiksa pada tiga viewport. Sumber: [repo resmi Adobe](https://github.com/adobe-fonts/source-serif), [lisensi resmi](https://github.com/adobe-fonts/source-serif/blob/release/LICENSE.md).
4. **Kartu bab saat pindah lokasi.** Kartu gelap menggunakan teks `places[id].chapter` asli, tampil 1.200 ms, bisa dilewati dengan klik atau Esc. Memuat ruangan baru tidak mereset jawaban atau flag. Kartu pertama tidak ditambahkan lagi ke lobi awal karena pembuka dua langkah tetap dipertahankan.

Panel utilitas menjadi drawer; analisis/feedback lama sementara memakai frame samping atau bottom sheet tanpa blur agar tidak memenuhi tengah layar. Pengungkapan besar dan hasil tetap boleh di tengah. Ini hanya penataan wadah untuk memecah dominasi modal pada Tahap 1—kartu pasangan, benda referensi di kiri soal, dan feedback tokoh yang diminta Tahap 3 belum dibuat.

## Perbaikan interaksi yang diperlukan

Setelah tombol lanjut otomatis dibuang, pengujian klik nyata menemukan Phaser juga memproses mousedown dari hotspot HTML. Bukti dekat karakter bisa membuka saksi di belakangnya (contohnya buku tamu dekat Allie). Input Phaser kini dibatasi ke canvas lewat `input.windowEvents: false`. Hotspot DOM tetap mengarah ke pemeriksaan yang sama; klik karakter di canvas tetap tersedia. Tidak ada penggunaan `pointer up outside` di game ini.

## Validasi

- `npm test`: **21 tes lulus**, termasuk regresi bahwa akhir wawancara kembali ke scene tanpa panel baru, serta perjalanan sampai hasil, retry, reload, keyboard, urutan progres, kronologi, dan cover.
- `npm run build`: **lulus** (TypeScript dan Vite). Peringatan ukuran chunk Phaser tetap sekitar 1,49 MB / 341 KB gzip; optimasi ukuran bukan bagian tahap ini.
- Playwright / Chrome lokal: satu putaran penuh baseline dan satu putaran penuh sesudah perubahan; keduanya **87,5**, delapan submission, dengan soal routing sengaja salah. Tanpa page error. Putaran sesudah memakai klik cincin scene, bukan memanggil fungsi inspeksi melalui QA hook.
- 42 screenshot baseline dan 42 keadaan sesudah pada tiga viewport (14 layar × 3); ditambah kartu bab serta tampilan rotasi normal. Pemeriksaan DOM pada 42 keadaan sesudah tidak menemukan teks terlihat di bawah 12 px atau overflow horizontal halaman.
- Pengujian tambahan: kartu bab ditahan untuk screenshot dengan clock Playwright, diuji belum pindah pada 1.199 ms dan pindah pada 1.200 ms; klik dan Esc melewati kartu tanpa menambah jawaban. Fokus benda terkunci, Esc kembali ke hotspot, font lokal termuat, backdrop filter none, dan rotasi hanya muncul bila gerak diaktifkan.
- Pemeriksaan byte terhadap backup sebelum tahap ini memastikan `server/*`, `api/*`, `shared/types.ts`, `src/progression.ts`, seluruh `src/story.ts` (termasuk ID bukti, accessEvents, caseTimeline), serta dependency manifests identik. Semua gambar dan audio lama juga identik. Tipe Save, key penyimpanan, dan format Answer tidak diubah.

Ringkasan eksekusi: `before/report.json`, `after/report.json`, `interactions.json`. Ini pengujian otomatis melalui browser nyata; belum merupakan playtest mahasiswa, uji perangkat ponsel fisik, atau sertifikasi aksesibilitas menyeluruh. Kontras benda menggunakan teks gelap pada kertas terang, atau teks terang di layar gelap; subtitle memakai latar gelap dan tampil di atas scrim.

## Daftar berkas

- `src/main.ts`: monolog setelah wawancara, presentasi benda, routing panel, kartu bab, kembali dari feedback ke scene.
- Baru `src/moments.css`: bentuk benda, scrim tanpa blur, serif/spacing home dan dialog, kartu bab, drawer analisis sementara, responsif dan reduced motion.
- `src/style.css`: @font-face dan token --serif.
- `src/world.ts`: satu pengaturan input canvas untuk menghindari klik hotspot diteruskan ke aktor di belakangnya.
- `tests/journey.test.ts`: perjalanan mengikuti akhir dialog tanpa panel; regresi akhir wawancara.
- Baru `public/fonts/source-serif4-regular.woff2` dan `public/fonts/source-serif4-OFL.md`.
- `CREDITS.md`, `README.md`, `QA.md`, dan `PASS2-STAGE1.md`: lisensi, dokumentasi dan hasil tahap ini.

## Sengaja belum dikerjakan

- Tahap 2: crop potret dialog, jarak/arah hadap karakter, idle, atmosfer, jam narasi, pembeda/dekor hotspot. Posisi sprite yang berdekatan masih mengikuti versi 1.2.
- Tahap 3: mengganti select/radio dengan kartu, susunan soal dengan bukti di kiri, dan feedback tokoh baru. Isi dan kontrol jawaban lama dipertahankan, hanya wadahnya digeser ke sisi layar pada tahap ini.
- Tahap 4: pesan Yono tambahan, gelagat/red herring, alasan Allie, dan persiapan hook nomor tak dikenal. Naskah cerita sumber sama sekali belum diubah.
- Tidak menambah dependency, gambar ekspresi, rekaman suara, atau aset selain serif OFL; tidak melakukan deployment.

Tidak melanjutkan tahap berikut sebelum diminta.
