# Pass desain kedua — Tahap 2

15 November 2026. Tahap 1 diterima; pekerjaan ini hanya mengerjakan Tahap 2, poin 1–5. **Berhenti sesudah Tahap 2. Tahap 3 belum dimulai.** Implementasi ada di folder LARAVEL yang sama.

Galeri before/after disertakan dalam paket QA terpisah. Default galeri menampilkan dialog 390×844. Pilihan lain mencakup 1210×760 dan 1440×900, bukti, perbandingan saksi, serta lima lokasi.

Screenshot yang diminta:

- Dialog mobile sebelum (lihat paket screenshot) dan sesudah (lihat paket screenshot).
- Dialog mobile dalam gerak normal (lihat paket screenshot).
- Bukti dengan potret Allie (lihat paket screenshot).
- Panel perbandingan bukti dengan potret saksi (lihat paket screenshot).

## 1. Dialog dan posisi karakter

Dialog memiliki potret di kiri, memakai crop SVG dari frame 0 sprite asli. Crop diuji tetap berada di dalam frame 512×512; bukan aset ekspresi baru. Nama tiap tokoh memakai warna pastel berbeda di atas panel gelap. Potret juga hadir sebagai konteks saksi pada benda bukti dan saat memilih bukti untuk membandingkan ucapan.

Kotak dialog dibuat 180 px pada desktop dan 222 px di ponsel, lebih pendek dari baseline. Teks dialog 20 px / 18 px. Kotak memakai fade tanpa translasi agar pengukuran kaki tidak berubah selama animasi masuk. Log dan Lanjut memiliki target minimal 44×44 px. Teks panjang bisa digulir, termasuk melalui fokus keyboard; kalimat tetap utuh, tidak dipotong dari cerita.

Saat berbicara, framing menempatkan pasangan di atas batas dialog, dengan jarak 300 unit artwork desktop / 220 pada mobile. Kamera ponsel membingkai titik tengah pasangan. Latar yang sama ikut didekatkan dengan titik lantai sebagai acuan, supaya kaki tidak tampak mengambang pada framing servis/arsip; saat percakapan ditutup, cover serta koordinat hotspot kembali seperti biasa. Detektif dan saksi saling menghadap sesuai posisi; inspeksi juga menjaga titik berhenti detektif agar tidak menumpuk pada saksi. Saksi lain di lokasi yang sama diredupkan. Posisi panggung ini hanya presentasi; tidak menambah atau mengubah urutan pertemuan.

## 2. Idle hidup

Setiap sprite memakai perubahan scaleY sinus ±0,5%, dengan fase berbeda. Detektif mendapat pergeseran berat badan lewat rotasi sangat kecil; saksi yang sedang bicara condong sekitar 0,9° ke lawan bicara. Tidak membuat pose/ekspresi raster baru.

Reduced motion meniadakan napas, condong dan gerak dekoratif, menghentikan tween berjalan yang aktif, serta membuat perpindahan karakter langsung. Pengaturan perangkat dipantau saat berjalan; pilihan manual untuk mengurangi gerak tetap berlaku ketika perangkat kembali ke no-preference. Efek atmosfer bergerak disembunyikan, sementara tint dan vignette statis tetap ada.

## 3. Atmosfer

Vignette tipis, butiran debu, dan garis hujan ringan dibuat dengan CSS. Hujan difokuskan ke sisi jendela lobi/kantor. Servis dan arsip memakai variasi cahaya sangat kecil dengan siklus 7,6 detik. Tidak ada lampu strobo, aset hujan baru, atau suara baru.

Kelima lokasi mempunyai tint berbeda: lobi/kantor hangat, area lift lebih netral, servis/arsip dingin dan lebih gelap. Tint memakai lapisan CSS multiply yang diisolasi pada scene agar tidak memengaruhi teks UI/potret. Percobaan awal blend Phaser pada renderer Canvas tidak bekerja konsisten dalam pemeriksaan visual; lapisan yang menutup scene itu dibuang sebelum hasil akhir. Scene tetap terlihat pada semua screenshot final.

## 4. Jam narasi

Header menampilkan 07.42 → 07.48 → 07.54 → 08.01 → 08.07 menurut bab yang sudah terbuka. Ini bukan jam sistem, elapsed timer, atau batas waktu. Kembali ke lokasi lama tidak memundurkan jam; nilainya dihitung dari gate yang sudah ada, sehingga format save tidak berubah. Tooltip/label aksesibel menjelaskan bahwa jamnya fiksi.

## 5. Hotspot dan dekor

Orang memakai cincin dengan glow hangat; benda/bukti memakai berlian; dekor memakai titik redup. Hit area tetap 48×48 px, dan label tersedia pada hover/fokus atau toggle nama objek. Daftar objek menjadi fallback untuk benda yang terpotong oleh cover di ponsel.

Ditambahkan **empat dekor per lokasi**, total 20, semuanya mengacu pada objek yang terlihat pada ilustrasi asli: jam/lampu/tanaman/jendela lobi; bangku/tanaman/lampu/pipa lift; piala/anggrek/lukisan/lampu kantor; pipa/perkakas/papan alat/bungkus servis; lampu/bangku/gulungan/rak arsip. Tidak menambah ilustrasi motor atau benda lain yang tidak ada pada aset.

Klik dekor hanya memunculkan satu kalimat monolog, lalu kembali ke arahan kasus setelah sekitar lima detik. Tidak membuka dialog, menambah bukti, menulis log, mengubah flag atau jawaban. Seluruh 20 interaksi dibandingkan dengan save sebelum klik: tidak berubah.

## Validasi

- `npm test`: **27 lulus**. Tambahan pemeriksaan meliputi dekor tanpa efek save, jangkauan hotspot termasuk dekor, framing pasangan/kaki, metadata dekor tanpa quiz/gate, jam narasi, batas crop frame 0, dan cakupan backdrop dialog tanpa tepi kosong.
- `npm run build`: **lulus**, termasuk TypeScript. Peringatan chunk Phaser tetap sekitar 1,49 MB / 342 KB gzip; optimasi ukuran tidak dikerjakan dalam tahap ini.
- Playwright / Chrome lokal: satu putaran penuh sebelum perubahan, satu putaran penuh desktop sesudah, dan satu putaran penuh viewport mobile sesudah; masing-masing **87,5** dengan delapan jawaban dan satu soal routing sengaja salah. Tanpa page error. Interaksi memakai cincin/daftar objek biasa dan API asli lokal.
- Screenshot baseline: 20 keadaan × tiga viewport = 60. Screenshot sesudah: 60 keadaan yang sama, ditambah dialog gerak normal, bukti-potret, dan lima atmosfer. Pemeriksaan DOM pada matriks sesudah tidak menemukan teks tampak di bawah 12 px atau overflow horizontal halaman.
- Uji browser tambahan memastikan kedua kaki berada di atas dialog pada tiga viewport, jarak dan flipX sesuai, tinggi kotak sesuai, napas berubah tetapi tetap dalam ±0,5%, potret bukti ada, Esc mengembalikan fokus, dan seluruh 20 dekor tidak mengubah save.
- Reduced motion diuji lewat UI dan perubahan prefers-reduced-motion saat game berjalan. Breathing/lean berhenti, efek dust/rain/light disembunyikan, dan preferensi manual tetap tersimpan tanpa mengubah save game.
- Pasangan warna nama/teks utama dihitung terhadap panel gelap dengan rasio ≥4,5:1 (minimum warna nama 9,76:1; lihat `contrast.json`); tulisan indikator servis mendapat latar gelap agar terbaca di atas ilustrasi. Ini pemeriksaan token dan screenshot, bukan sertifikasi WCAG menyeluruh.

Ringkasan eksekusi: `before/report.json`, `after/report.json`, `mobile/report.json`, `interactions.json`, `motion-preference.json`. Ini pengujian otomatis di browser nyata; belum merupakan playtest mahasiswa, pengujian ponsel fisik, atau pembuktian keseruan/durasi.

## Aturan keras tetap dijaga

Perbandingan byte terhadap backup Tahap 1 memastikan seluruh `server/*`, `api/*`, `shared/types.ts`, `src/progression.ts`, seluruh `src/story.ts` (termasuk ID bukti, accessEvents, caseTimeline), dependency manifests, dan berkas `public/*` identik. Tidak ada dependency maupun aset publik baru.

Blok tipe Save, fungsi renderQuiz, submitQuiz dan showFeedback juga identik dengan baseline. Jadi format Answer/save, isi/kunci/penjelasan soal, skor 12,5, 18 langkah dan gate tidak berubah. Semua dekor serta jam/atmosfer disimpan sebagai metadata presentasi terpisah, bukan progres tambahan.

## Berkas yang diubah

- `src/main.ts`: potret/nama dialog, potret konteks bukti, jam fiksi, daftar/dekor, preferensi gerak perangkat, fokus teks panjang, diagnostik visual read-only pada guard QA dev yang sudah ada.
- `src/world.ts`: staging pasangan, jarak dan arah hadap, idle/lean, penghentian gerak, proyeksi dekor, penanda jenis hotspot, dan keterbacaan indikator servis.
- `src/scene-layout.ts`: tambahan fungsi framing percakapan; fungsi cover lama dipertahankan.
- Baru `src/scene-details.ts`: 20 dekor, crop frame 0, warna nama, jam dan metadata tint/cuaca, hubungan bukti–saksi.
- Baru `src/living-world.css`: dialog pendek, portrait, atmosfer, tint, jenis hotspot, responsif dan reduced motion.
- `tests/scene-layout.test.ts`, `tests/journey.test.ts`: pemeriksaan tahap ini.
- `README.md`, `QA.md`, `PASS2-STAGE2.md`: dokumentasi dan hasil.

## Belum dikerjakan

- **Tahap 3 belum dimulai**: select/radio soal, tata letak referensi bukti di sebelah soal, serta feedback tokoh khusus tetap seperti Tahap 1. Fungsi-fungsinya diperiksa identik.
- Tahap 4 belum dimulai: tidak menambah pesan Yono, red herring, alasan Allie, atau detail hook ending.
- Tidak membuat ekspresi, rekaman suara, font, atau ilustrasi baru. Potret statis dari frame 0 bereaksi melalui gerak sprite; tidak mengklaim animasi wajah/lip-sync.
- Tidak melakukan deployment. Server, penilaian, anti-replay dan penyimpanan terpusat tidak diubah.

Berhenti setelah Tahap 2 untuk ditinjau.
