# DI ATAS TUJUH

**Gedungnya tujuh lantai. Pesan terakhirnya dari lantai delapan.**

Game detektif urban untuk praktikum Laravel Introduction week 10. Klik orang/objek di scene, periksa bukti, uji alibi Allie/Noah/Tedar, temukan Yono, dan kerjakan delapan tantangan Laravel. Target durasi 15–20 menit; belum divalidasi lewat uji kelas.

## Jalankan di laptop

Node.js 20.19+ diperlukan. Di folder project:

```sh
npm install
npm run dev
```

Buka **http://127.0.0.1:5187**. Jangan membuka `index.html` langsung; penilaian memerlukan server API yang dijalankan oleh `npm run dev`.

Port lain dapat digunakan dengan `PORT=5190 npm run dev`. Musik mulai setelah interaksi pertama. Gunakan headphone jika ingin mendengar ambience dengan lebih jelas; seluruh game tetap bisa dimainkan tanpa suara.

File `.env` lokal sudah disiapkan pada workspace pengembangan. File itu tidak disertakan dalam ZIP. Jika memakai salinan ZIP dan ingin sesi/bukti tetap valid sesudah restart server, buat kunci lokal terlebih dahulu:

```sh
node --input-type=module -e 'import fs from "node:fs"; import crypto from "node:crypto"; if (!fs.existsSync(".env")) fs.writeFileSync(".env", "RUN_SIGNING_SECRET=" + crypto.randomBytes(32).toString("hex") + "\n", {mode: 0o600});'
```

Tanpa `.env` atau environment variable, server pengembangan membuat kunci sementara. Restart server tersebut membuat sesi lama tidak dapat dipulihkan. Gunakan kunci yang konsisten untuk penggunaan kelas dan deployment. Jangan membagikan kunci atau memasukkannya ke Git.

## Antarmuka versi 1.2

Pembuka dua langkah mengantar lo ke pesan Yono dan cara main, dengan Lewati yang selalu tersedia. Ruangan memenuhi layar; cincin adalah interaksi utama. Nama objek muncul saat hover/fokus, lewat pengaturan Tampilkan nama objek, atau sebagai petunjuk interaksi pertama.

Klik nama lokasi di tengah header untuk pindah ke tempat yang sudah terbuka. Di layar sempit, kamera mengikuti objek aktif; objek di luar potongan gambar tetap bisa diakses lewat Daftar objek (O). Catatan (J), Petunjuk (H), dan Jeda (P) menjadi drawer; map bukti (B) membuka papan kasus. Panel lift menampilkan delapan konsep sesuai soal asli. Di HP, tombol lift membuka daftarnya.

Dialog muncul di bawah scene. Klik teks atau tekan Spasi untuk melengkapi baris, lalu lanjutkan. Log menyimpan ucapan sebelumnya. Setiap analisis Laravel tetap dimulai sesudah observasi, dan hanya jawaban pertama yang dihitung.

Refresh lalu mulai kasus baru untuk melihat pembuka baru. Resume mempertahankan progres dan nilai lama. Jeda menyediakan pengaturan audio/gerakan serta Lihat ulang ruangan, yang tidak mengulang penilaian.

## Yang tersedia

- Lima lokasi penyelidikan, enam background, enam karakter, inventory, catatan percakapan, pembantahan alibi, petunjuk gratis tiga tingkat, dan ending terbuka.
- Delapan tantangan: MVC, struktur folder, routing, Artisan controller, alur request, Blade/asset/CSRF, resource route, serta rangkaian route–controller–view. Tidak menjalankan PHP yang ditulis pemain dan tidak memerlukan database Laravel.
- Jawaban pertama bernilai 12,5 poin per soal. Jawaban salah tetap membuka penjelasan dan bukti berikutnya. Kesimpulan cerita, waktu, dan petunjuk tidak memengaruhi nilai akademik.
- Checkpoint lokal setelah bukti, dialog, dan tantangan. Jawaban yang gagal terkirim disimpan agar tombol coba lagi mengirim jawaban yang sama.
- Hasil PNG dan kode hasil bertanda tangan. Buka `/verify` untuk memeriksa kode. PNG saja bukan bukti keaslian nilai.
- Musik noir original dengan variasi menu, eksplorasi, dan pengungkapan; ambience tiap ruangan, langkah, kertas, pintu, lift, kartu, notifikasi, serta efek feedback.
- Mixer terpisah, ducking saat dialog/kuis, penghentian audio saat tab tersembunyi, dan pengurangan gerakan.
- Dua klip suara opsional: pesan Yono dan pengumuman lift. Default nonaktif. Ini TTS Indonesia dasar, bukan voice acting penuh atau suara karakter yang dikloning.

## Pemeriksaan dan build

```sh
npm test
npm run build
```

`npm run build` menjalankan pemeriksaan TypeScript lalu membuat `dist/`. `npm run preview` hanya menyajikan frontend build, bukan backend penilaian; gunakan dev server untuk uji permainan lokal lengkap.

Sumber utama: `src/main.ts` menghubungkan UI dan progres, `src/story.ts` memuat kasus/bukti, `src/world.ts` menangani adegan Phaser, dan `src/audio.ts` mengelola audio. Pertanyaan serta kunci jawaban berada di `server/questions.ts`; kunci tidak diimpor oleh frontend.

## Persiapan Vercel

Project sudah memiliki fungsi `api/run/*` dan konfigurasi `vercel.json`. Pilih direktori ini sebagai root project, build command `npm run build`, output `dist`, lalu isi environment variable server `RUN_SIGNING_SECRET` dengan nilai acak minimal 32 karakter. Gunakan nilai yang sama untuk semua instance. Belum ada deployment atau repository baru yang dipublikasikan dari sesi ini.

## Batas penilaian

Server memeriksa jawaban dan menandatangani hasil. Backend memakai token stateless tanpa database, sehingga tidak membatasi percobaan baru berdasarkan NIM dan tidak mencegah pemain teknis melakukan replay/rollback token. Ini aktivitas praktikum dengan bukti hasil, bukan sistem proctoring atau penilaian anticurang berisiko tinggi. Nama/NIM/kelas dikirim ke API milik game, lalu tersimpan dalam checkpoint dan kode hasil; jangan menaruh kode hasil di URL publik. Tidak ada analytics atau layanan suara berbayar saat runtime.

Lihat `UI-REDESIGN.md` untuk perubahan visual versi 1.2 dan `AUDIT-UX.md` untuk rincian perubahan pengalaman pemain, `QA.md` untuk pemeriksaan yang sudah dilakukan dan `CREDITS.md` untuk sumber aset.
