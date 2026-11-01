# Hasil pemeriksaan

## Data undangan

Nama lengkap dan panggilan kedua mempelai, orang tua, cerita, tanggal lamaran, tanggal pernikahan, jadwal, lokasi, foto kosong, serta enam slot galeri dibandingkan secara otomatis dengan konfigurasi ZIP proyek yang diberikan sebelumnya. Hasilnya sama.

Kalender diperiksa memakai kode pembuat kalender yang benar-benar dipakai proyek:

- Akad 5 Desember 2026 10.00 WITA menghasilkan `DTSTART:20261205T020000Z`.
- Akhir akad 11.00 WITA menghasilkan `DTEND:20261205T030000Z`.
- Judul kalender menggunakan nama Listy & Aldo.
- Pemotongan baris kalender tidak melebihi 75 byte UTF-8.

## Kode dan build

- Pemeriksaan TypeScript: lulus.
- Build produksi Next.js 14.2.35: lulus.
- Pengujian Go untuk handler, penyimpanan, pembatasan permintaan, dan layanan email: lulus.
- Kompilasi backend Go untuk Linux tanpa CGO: lulus.
- Transparansi tengah gambar gerbang tetap tersimpan pada aset WebP.

## Pengujian browser

Diperiksa pada desktop dan bingkai ponsel berlebar 320, 390, dan 430 piksel:

- Sampul memuat nama tamu dari parameter `to`.
- Efek membuka gerbang berakhir pada halaman undangan; tombol lewati animasi juga berfungsi.
- Navigasi mempelai, jadwal acara, galeri, dan RSVP berpindah ke bagian yang dituju.
- Tidak ditemukan halaman melebar ke samping pada ketiga ukuran ponsel.
- Formulir menolak nama yang kosong dan menunjukkan pesan kesalahan.
- Konfirmasi hadir dengan dua tamu benar-benar tersimpan melalui frontend dan backend yang berjalan bersama, tanpa kunci layanan email.
- Saat tidak hadir, jumlah tamu otomatis 0 dan tersimpan sebagai 0.
- Ucapan publik tampil setelah izin dicentang.
- Nama dan ucapan dari pengiriman tanpa izin tetap tidak tampil di buku tamu.

Data uji browser dibuat dalam direktori khusus pengujian dan dibersihkan. Tidak ada data tamu uji di dalam ZIP.

## Batas verifikasi

Pengujian dilakukan pada lingkungan Linux dan browser Chromium. Instalasi langsung pada komputer Windows Anda belum dijalankan. Skrip menjalankan proyek dan panduan disiapkan untuk Windows / PowerShell.

Galeri memiliki enam bingkai kosong karena foto asli belum diberikan. Pengujian browser untuk lightbox dengan foto prewedding asli belum dilakukan. Fallback bingkai, path konfigurasi, serta tipe komponen diperiksa.

Kalender lulus pemeriksaan isi dan waktu; unduhan pada perangkat pengguna tetap mengikuti pengaturan browser masing-masing.

Pengujian email memakai transport tiruan dan tidak mengirim email sungguhan. Gift dan live streaming mengikuti konfigurasi kosong sampai nomor rekening dan tautan acara asli diisikan.
