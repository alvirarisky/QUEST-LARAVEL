# Audit UX — DI ATAS TUJUH

14 November 2026 · perbaikan versi 1.1

Keluhan pemain: keseluruhan permainan membingungkan dan langsung dimulai tanpa konteks. Audit ini memprioritaskan pemahaman pemain, konsistensi tindakan, logika bukti, dan kelanjutan progres. Perbaikan dilakukan langsung pada project di folder LARAVEL; ini bukan sekadar daftar saran.

## Temuan utama dan perubahan

### P1 — Pemain belum dikenalkan dengan peran dan kasus

Sebelumnya, setelah identitas dikirim, seluruh HUD muncul bersama dialog dan tutorial teks. Pemain belum punya model mental tentang dirinya, korban, atau tindakan pertama.

Sekarang ada prolog tiga halaman sebelum adegan dimuat: pemain adalah detektif lepas, Yono adalah kurir yang hilang, paketnya sudah tiba, dan Allie adalah orang pertama yang harus ditemui. Kontrol dikenalkan melalui tindakan nyata yang diberi nama. Tombol masuk lobi tidak otomatis melontarkan soal.

### P1 — Tujuan, kunci lokasi, dan syarat bukti memakai aturan berbeda

Sebelumnya, area lift bisa dibuka setelah tiga soal walaupun petunjuk masih menyuruh menguji Allie. Syarat-syarat yang terlewat baru menghentikan pemain di pintu arsip. Pesan kesalahan bisa hanya menyebut “lokasi sebelumnya”.

Sekarang satu model progres menentukan jejak aktif, lokasi yang dibuka, tombol tindakan, dan bantuan. Ada 18 jejak penyelidikan dengan delapan analisis akademik di antaranya. Percakapan wajib dikenalkan sebelum bukti/soal yang bergantung padanya. Setiap jejak harus menunjuk ke tempat dan objek yang dapat dijangkau. Lokasi masa depan disembunyikan agar tidak membocorkan arsip sebelum ditemukan.

### P1 — Pemain tidak mendapat tindakan konkret setelah informasi baru

Sebelumnya, umpan balik nilai, dialog hadiah, menu saksi, dan penutupan panel terpisah-pisah. Pemain harus mengingat petunjuk lalu menebak tombol berikutnya.

Sekarang penemuan menjelaskan isi bukti dan artinya, disusul tombol tindakan berikutnya. Jika tujuannya di ruangan lain, tombol membawa ke ruangan tersebut lebih dulu; pemain melihat tempat baru sebelum memulai percakapan. Panel kiri selalu menyediakan tindakan aktif yang sama. Pemain masih bisa memeriksa kembali tempat dan bukti yang sudah dibuka.

### P1 — Kontrol di adegan berbeda dengan tombol daftar

Sebelumnya, klik hotspot menunggu karakter selesai berjalan, sedangkan tombol daftar membuka interaksi langsung. Langkah yang terhenti dapat membuat klik terlihat tidak bekerja. Karakter juga bukan area klik utuh.

Sekarang kedua jalur memanggil interaksi yang sama tanpa menunggu animasi. Gerak pendek menjadi pelengkap visual. Tubuh karakter dapat diklik, area hotspot diperbesar, nama objek terlihat dari awal, dan sasaran aktif dibedakan. Pergantian frame langkah juga diperbaiki agar menerima nama frame numerik maupun string.

### P1 — “Bukti membantah Allie” belum didukung oleh keterangannya

Kalimat awal Allie sebelumnya tidak secara jelas menyatakan dia ada di meja saat Yono masuk lift. Menunjukkan CCTV kemudian dianggap berhasil membantah sesuatu yang belum dia ucapkan.

Sekarang Allie menyatakan berada di meja ketika Yono masuk. Rekaman memperlihatkan dia meninggalkan meja 20.13–20.24, sedangkan Yono naik 20.14. Panel pembandingan menampilkan kutipan, pertanyaan, dan isi beberapa bukti relevan. Setelah berhasil, keterangannya berubah dan alasan hubungan itu dijelaskan. Menunjukkan bukti tidak kembali memaksa pemain menelusuri menu saksi dari awal.

### P1 — Kronologi akses belum memungkinkan pesan terakhir Yono

Yono mengirim pesan dari arsip 20.16, tetapi akses pertama sebelumnya tercatat 20.18. Padahal lokasi membutuhkan akses eksekutif.

Log sekarang mencatat kartu Tedar mengaktifkan tujuan servis 20.15, sebelum Yono tiba 20.16. Akses arsip 20.18, penutupan dari luar 20.22, dan masuk kantor 20.31 menjelaskan pertemuan serta pemindahan paket. Hasil akhir menyediakan urutan kejadian. Isi paket juga tidak lagi mengklaim mengetahui keadaan ruang arsip sebelum pemain memeriksanya.

### P2 — Soal Laravel muncul tanpa pemeriksaan atau konteks

Sekarang klik benda membuka observasi dan alasan benda itu berkaitan dengan kasus. Bagian analisis terpisah menyebut konsep Laravel, kaitannya dengan contoh, dan aturan nilai. Soal baru diambil setelah pemain memilih Mulai analisis. Tidak berpura-pura bahwa menjawab soal benar-benar mengeksekusi PHP atau membobol lift.

### P2 — Keterangan dan bukti disajikan seperti daftar judul

Panel pembandingan sekarang memperlihatkan kalimat saksi yang sedang diuji dan isi bukti relevan. Pilihan keliru tetap di panel yang sama dengan arahan, tanpa mengurangi nilai atau mengubah progres akademik. Catatan kasus berisi pertanyaan utama dan pemeriksaan saksi yang selesai, bukan hanya arsip dialog panjang.

### P2 — Panel yang sudah ditutup bisa muncul lagi setelah jaringan merespons

Permintaan soal sekarang terikat pada versi panel. Respons yang tiba sesudah pemain menutup atau berpindah panel tidak membuka soal mendadak. Jawaban yang gagal terkirim tetap dipertahankan dan dapat dilanjutkan sesudah reload. Respons server non-JSON juga mendapat pesan yang dapat ditindaklanjuti.

### P2 — Membaca bukti dan menyusun urutan kehilangan konteks

Detail yang dibuka dari daftar bukti menyediakan tombol kembali ke daftar. Penyusunan kartu tidak lagi mengembalikan scroll ke bagian atas setiap pilihan. Panel sesi yang gagal dipulihkan menyediakan coba lagi atau kembali ke menu, bukan toast sesaat tanpa tindakan.

## Referensi yang ditelaah

Yang ditelaah adalah sumber resmi dan penjelasan mekanika, bukan klaim telah menamatkan game komersial tersebut.

- [Tangle Tower — SFB Games](https://www.sfbgames.com/press/sheet.php?p=tangle_tower): hubungan eksplorasi tempat, petunjuk, percakapan saksi, dan puzzle. Diterapkan sebagai urutan pemeriksaan yang memperkenalkan informasi sebelum memakainya.
- [Ace Attorney Investigations — Capcom](https://news.capcomusa.com/lets/browse/tgs-2009-ace-attorney-investigations-miles-edgeworth): memperoleh informasi dengan menemukan kontradiksi dan menunjukkan bukti yang menentukan. Diterapkan pada panel kutipan saksi dan isi bukti.
- [The Rise of the Golden Idol — Playstack](https://www.playstack.com/games/rise): mengumpulkan observasi lalu menganalisis apa, mengapa, dan siapa. Diterapkan sebagai pemisahan observasi, analisis, dan kesimpulan.

Tidak menyalin aset, dialog, atau desain layar ketiga game tersebut.

## Validasi dan batas

Pengujian logika mencakup seluruh jalur progres, keterjangkauan lokasi, kompatibilitas progres lama, dan konsistensi kronologi. Pengujian integrasi UI DOM menjalankan kode UI aktual bersama koreksi server aktual, dengan perangkat audio dan renderer Phaser diganti untuk pengujian. Jalur tersebut menyelesaikan kasus melalui tombol yang terlihat, menguji bukti dan kesimpulan keliru, memperoleh 87,5 setelah satu jawaban salah, lalu memverifikasi kode hasil.

Prolog baru dan keadaan pertama lobi diperiksa langsung lewat Safari dengan sesi kosong. Pengujian Chrome sempat menampilkan area kosong dan akses jendela kemudian tidak tersedia; penyebabnya belum dipastikan, sehingga Chrome tidak dinyatakan lulus. Seluruh alur visual versi baru belum diulang sampai tamat pada browser nyata. Uji kelas, persepsi keseruan, dan target durasi 15–20 menit masih memerlukan pemain manusia; tes otomatis tidak membuktikan hal-hal itu.

Backend tetap stateless sesuai keputusan sebelumnya: kode hasil ditandatangani, tetapi tidak ada pembatasan run baru berdasarkan NIM atau perlindungan replay token tingkat ujian. Audit ini tidak mengubah kebijakan nilai atau menghapus progres mahasiswa.
