# Sumber aset dan audio

## Ilustrasi

Noah dan Allie berasal dari repo pengguna https://github.com/alvirarisky/quest-javascript2, commit `97b13f80258526809a18a0bc6cd566082b5a6cb6`, file asal `public/art/noah-side.png` dan `public/art/allie-side.png`. Identitas visual dipertahankan. Versi browser dikompresi ke WebP; sheet asli ada dalam paket aset terpisah di workspace Codex.

Wiwo, Tedar, Yono, detektif pemain, enam background, dan atlas properti dibuat dengan built-in image_gen untuk project ini. Karakter Wiwo–Tedar adalah tokoh perusahaan fiktif; naskah tidak mengklaim kejadian atau tindakan tokoh publik nyata.

Sheet karakter: 1536 × 1024, tiga kolom dan dua baris, frame 512 × 512. Empat karakter baru menggunakan diam, dua langkah, interaksi, berpikir, dan terkejut. Noah–Allie menggunakan pose sumber. Gerak berjalan memakai dua pose langkah dan perpindahan posisi, bukan animasi skeletal atau frame panjang.

Atlas properti: 1536 × 1024, empat kolom dan tiga baris. Background statis memakai resolusi aktual beragam sekitar 1659 × 948 atau 1672 × 941. Hotspot, karakter, indikator, dan transisi dirender terpisah. Hujan pada ilustrasi bukan video atau parallax berlapis.

## Musik dan efek

Komposisi serta efek dibuat secara prosedural dengan Web Audio di `src/audio.ts`. Piano adalah timbre sintesis berlapis, bukan rekaman piano akustik. Tidak mengambil musik dari film, game, atau katalog pihak ketiga. Motif minor tempo 76 BPM berubah antara menu, eksplorasi, dan pengungkapan. Ambience memakai noise terfilter serta dengung sintetis; tidak mengklaim rekaman lapangan.

Klip opsional di `public/audio/` dibuat dengan suara sistem macOS Damayanti, lalu dikompresi MP3 melalui ffmpeg dengan filter frekuensi dan normalisasi. Tidak meniru suara tokoh nyata; kualitasnya TTS dasar. Tidak digunakan untuk dialog seluruh karakter.

Transkrip `yono-message.mp3`: “Gue sudah di lantai delapan. Orangnya belum ada.”

Transkrip `lift-seven.mp3`: “Lantai tujuh. Perhatikan langkah Anda.”

## Font dan runtime

Font Oswald dan Source Sans 3 diambil dari repo referensi pengguna; berkas lisensi OFL berada di `public/fonts/`. Framework: Phaser, Vite, TypeScript. Sharp dipakai hanya untuk kompresi gambar saat persiapan aset, bukan runtime browser. Seluruh gambar/font/audio disajikan lokal, tanpa hotlink.


Source Serif 4 Regular dibundel lokal untuk pass desain kedua, Tahap 1. Sumber resmi Adobe: https://github.com/adobe-fonts/source-serif (branch release, WOFF2/TTF/SourceSerif4-Regular.ttf.woff2). SIL Open Font License 1.1 disertakan di `public/fonts/source-serif4-OFL.md`. Tidak mengubah font atau mengambil gambar baru.
