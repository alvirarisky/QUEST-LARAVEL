# Pemeriksaan DI ATAS TUJUH

Tanggal: 14 November 2026. Status ini membedakan pengujian yang telah dijalankan dari target penggunaan.

## Versi awal — pemeriksaan otomatis

- TypeScript dan build Vite diperiksa.
- Tujuh tes Node: kunci tidak muncul sebelum submission; sesi lengkap menghasilkan 87,5 setelah satu jawaban salah; input tidak lengkap/urutan salah tidak maju; kirim ulang identik tidak mengonsumsi pertanyaan tambahan; perubahan signature/identitas ditolak; sesi kedaluwarsa/identitas kosong ditolak; semua tantangan punya reward bukti dan gate cerita.

## Versi awal — pengujian langsung lewat Safari desktop

- Identitas uji: Penyelidik Uji / TEST-008 / IT-TEST.
- Membuka kasus, pembuka, tutorial, percakapan Allie, serta pemeriksaan lokasi.
- Mengerjakan seluruh delapan tantangan melalui kontrol UI biasa: pencocokan, pilihan kode, dan susun urutan. Tantangan routing sengaja dijawab salah; tujuh lainnya benar.
- Membantah Allie dengan CCTV, Noah dengan denah, dan Tedar dengan catatan kartu. Seluruh gate akses terbuka.
- Menemukan Yono, mengambil daftar kiriman, mencoba kesimpulan keliru tanpa penalti, lalu menyelesaikan kesimpulan benar dan delapan dialog penutup.
- Hasil 87,5 tampil. Ulasan menandai soal ketiga salah. PNG hasil berhasil diunduh. Kode hasil yang sama diuji pada halaman `/verify`; identitas, skor, dan tanda tangan dinyatakan valid.
- Reload dan lanjutkan sesi diuji di tengah progres. Pengaturan audio dan pengurangan gerakan diuji. Volume utama mencapai nol melalui keyboard lalu dikembalikan ke 65.
- Fokus dialog diperbaiki: background menjadi inert selama panel terbuka; Tab/Shift+Tab diputar dalam kontrol panel.
- Loop gambar Safari sempat tidak berjalan melalui RAF pada lingkungan pengujian. Renderer Canvas dan timer loop 30 FPS digunakan; adegan dan karakter kemudian tampil. Ini bukan klaim benchmark 30 FPS di semua laptop.

## Batas pemeriksaan

Belum ada playtest mahasiswa untuk memvalidasi durasi 15–20 menit, pengujian beban satu kelas, atau audit anticurang. Belum diuji pada seluruh versi Chrome/Firefox. Pemulihan jaringan memiliki penanganan di kode dan tes kirim ulang server, tetapi pemutusan jaringan nyata saat submission belum disimulasikan di browser. Musik/efek diaktifkan melalui browser; mutu suara pada speaker/headphone berbeda masih perlu review manusia. Voice acting penuh belum tersedia.

Tampilan untuk laptop; HP bukan target utama. Deployment Vercel belum dilakukan. Bukan sistem penyimpanan nilai terpusat.


## Versi 1.1 — setelah audit UX

- `npm test`: 17 tes lulus (7 server, 7 progres/kronologi, 3 integrasi UI).
- `npm run build`: TypeScript dan build produksi Vite lulus. Ada peringatan ukuran chunk renderer Phaser (~1,49 MB sebelum gzip; ~340 KB gzip). Renderer dimuat terpisah dari layar awal.
- Integrasi DOM memakai kode UI dan API/koreksi server aktual; perangkat audio serta renderer Phaser diganti untuk tes. Satu perjalanan lengkap menyelesaikan 18 jejak lewat tombol yang terlihat, memperoleh 87,5 setelah satu jawaban akademik salah, dan memverifikasi kode hasil.
- Jalur integrasi juga mencoba objek terlalu awal, bukti keliru, dan kesimpulan keliru; pemain tetap dapat melanjutkan. Jawaban yang gagal terkirim bertahan sesudah reload dan dikirim ulang tanpa percobaan baru. Respons soal terlambat tidak membuka kembali panel yang sudah ditutup.
- Logika memastikan akses tempat sesuai bukti saksi, progres lama tidak dipaksa mengulang wawancara awal, daftar kiriman diperlukan sebelum kesimpulan, dan akses servis terjadi sebelum Yono tiba.
- Prolog baru dan lobi awal diperiksa langsung di Safari. Seluruh alur visual versi 1.1 belum dimainkan ulang sampai tamat di browser nyata. Pengujian Safari lengkap di bagian sebelumnya berlaku untuk versi awal.
- Chrome sempat menampilkan area kosong; akses jendela pengujian kemudian tidak tersedia. Penyebab belum dipastikan dan Chrome belum dinyatakan lulus.

Lihat `AUDIT-UX.md` untuk perubahan, sumber referensi resmi, dan batas audit. Durasi serta keseruan tetap perlu playtest manusia.


## Versi 1.2 — redesign scene-first (15 November 2026)

- Urutan pengerjaan A+B, C+D, E+F+G+H, lalu P1/P2 dicatat pada `UI-REDESIGN.md`.
- 20 tes otomatis dan build produksi lulus. Tes mencakup regresi penilaian/progres dan perhitungan kamera cover.
- Playwright menggunakan Google Chrome lokal headless. Baseline dimainkan sampai tamat sebelum perubahan, hasil 87,5 setelah satu soal salah. Setelah C+D, setelah E+F+G+H, serta versi akhir juga mencapai hasil sama. Versi akhir diuji melalui UI desktop dan viewport ponsel; tanpa page error.
- Screenshot baseline: sembilan layar pada empat viewport. Screenshot akhir: sembilan layar utama dan dua tambahan pada viewport yang sama (1210×760, 1440×900, 1920×1080, 390×844). Seluruh 44 pemeriksaan keadaan akhir tidak menemukan teks tampak di bawah 12 px atau overflow horizontal halaman.
- Interaksi keyboard yang diperiksa: drawer mengunci fokus dan mengembalikannya, Escape, panah daftar objek, Spasi efek ketik, Log dialog, kembali dari detail ke papan bukti, audio/gerak tersimpan, lihat ulang ruangan tanpa reset, tooltip serta kunci lantai, dan panel lift ponsel.
- Sprite, background, suara, font dan aset publik tidak berubah. API, pertanyaan/kunci, model progres, shared types dan konfigurasi routing diperiksa identik terhadap backup baseline.
- Catatan browser: Chrome sekarang lulus pengujian UI di atas; catatan Chrome belum terverifikasi pada versi 1.1 adalah riwayat pengujian saat itu. Belum ada playtest manusia, pengujian ponsel fisik, atau klaim kompatibilitas seluruh browser. Voice acting penuh tetap tidak tersedia.


## Pass kedua — Tahap 1 (15 November 2026)

21 tes dan build produksi lulus. Sebelum/sesudah masing-masing ditamatkan di Chrome lewat Playwright, satu jawaban sengaja salah, skor tetap 87,5. Screenshot 1210×760, 1440×900, 390×844 beserta pemeriksaan bab, fokus, font dan scrim dicatat di `PASS2-STAGE1.md`. Tahap 2–4 menunggu instruksi.


## Pass kedua — Tahap 2 (15 November 2026)

27 tes dan build produksi lulus. Baseline, versi baru desktop, dan viewport mobile selesai dengan 87,5 setelah satu soal sengaja salah. Screenshot tiga viewport, framing kaki/flipX, idle ±0,5%, reduced motion, 20 dekor tanpa efek save, jam serta tint diverifikasi lewat Playwright. Lihat `PASS2-STAGE2.md` dan paket screenshot untuk rincian. Tahap 3 belum dikerjakan.
