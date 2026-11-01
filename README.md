# Listy & Aldo — A Love in Full Bloom

Undangan digital Sulistyawati (Listy) dan Rivaldo (Aldo), dengan pembuka gerbang bunga berlapis, gerakan zoom, kaligrafi, bingkai klasik, dan pergantian bagian berwarna kem serta teal. Ilustrasi taman dan gerbang dibuat khusus untuk proyek ini berdasarkan arah visual video yang Anda unggah.

Frontend: Next.js 14.2.35, React 18, TypeScript, dan CSS. Backend: Go, chi, penyimpanan JSON persisten, serta notifikasi email Resend opsional.

## Mulai di Windows / VS Code

1. Ekstrak ZIP dan buka folder `Undangan-Listy-Aldo-Floral` di VS Code.
2. Pastikan Node.js 20 atau 22 dan Go 1.22 atau lebih baru sudah terpasang. Periksa melalui `node --version`, `npm --version`, dan `go version` di terminal VS Code.
3. Jalankan dari folder utama proyek:

```powershell
npm run setup
npm run dev
```

Buka **http://localhost:3000**. Satu perintah menjalankan frontend dan backend; tekan `Ctrl+C` untuk menghentikan keduanya. Pada penggunaan pertama, Go mengunduh dependensi yang dibutuhkan.

Undangan dan RSVP dapat digunakan tanpa kunci API email. Konfirmasi disimpan ke `backend/data/rsvps.json`. File data ini baru dibuat setelah ada pengiriman yang berhasil.

Jika ingin menjalankan frontend saja untuk melihat tampilan:

```powershell
node scripts/dev.mjs --frontend-only
```

Pengiriman RSVP dan buku tamu membutuhkan backend yang berjalan.

## Data mempelai

| Data | Isi |
| --- | --- |
| Mempelai wanita | Sulistyawati / Listy |
| Orang tua mempelai wanita | Alm. Daeng Talara dan Fariati |
| Mempelai pria | Rivaldo / Aldo |
| Orang tua mempelai pria | Alm. Ridwan dan Fandha |
| Lamaran dalam cerita | 25 November 2026 |
| Pernikahan | Sabtu, 5 Desember 2026 |
| Akad nikah | 10.00–11.00 WITA |
| Resepsi | 11.00 WITA–selesai |
| Tempat | Rumah Mempelai Wanita |
| Alamat | Jl. Akasia 1 No. 27 Perumnas Tinggede |

Nama, orang tua, cerita, tanggal, jadwal, lokasi, musik, serta path foto terdapat di **`frontend/src/lib/config.ts`**. Data mengikuti konfigurasi proyek yang Anda berikan sebelumnya. Ini pemeriksaan konsistensi data proyek; perubahan jadwal keluarga tetap perlu disesuaikan di konfigurasi.

Tanggal utama memakai offset **+08:00 / WITA**. Countdown, ornamen tanggal, dan kalender mengambil tanggal dari konfigurasi tersebut.

## Nama tamu pada sampul

Tambahkan parameter `to` pada tautan:

```text
http://localhost:3000/?to=Bapak%20Andi%20dan%20Keluarga
```

Nama muncul di sampul dan terisi pada formulir RSVP. Tamu tetap dapat memperbaiki nama sebelum mengirim.

## Memasukkan foto mempelai dan enam foto prewedding

Simpan foto asli sebagai **file**, dengan susunan seperti ini:

```text
frontend/public/images/
  bride.jpg
  groom.jpg
  prewedding/
    prewedding-1.jpg
    prewedding-2.jpg
    prewedding-3.jpg
    prewedding-4.jpg
    prewedding-5.jpg
    prewedding-6.jpg
```

`bride.jpg` dan `prewedding-1.jpg` adalah nama file foto, bukan folder. File yang disimpan di `public` dipanggil dari URL tanpa kata `public`.

Ubah bagian berikut di `frontend/src/lib/config.ts`:

```ts
images: {
  bride: "/images/bride.jpg",
  groom: "/images/groom.jpg",
},
gallery: [
  "/images/prewedding/prewedding-1.jpg",
  "/images/prewedding/prewedding-2.jpg",
  "/images/prewedding/prewedding-3.jpg",
  "/images/prewedding/prewedding-4.jpg",
  "/images/prewedding/prewedding-5.jpg",
  "/images/prewedding/prewedding-6.jpg",
],
```

Biarkan path kosong sebelum foto asli tersedia. Tampilan akan menggunakan monogram dan enam bingkai bertuliskan “Foto segera hadir”. Foto yang gagal dimuat mendapat bingkai pengganti, sehingga undangan tetap rapi. Foto galeri yang tersedia dapat diperbesar; gunakan tombol panah atau tombol kiri/kanan keyboard, dan `Esc` untuk menutup.

## Musik dan animasi

Musik lokal ada di `frontend/public/audio/floral-piano.wav`. Musik dimulai setelah tamu menekan **Buka undangan**, sesuai aturan browser. Tombol bunga di kanan bawah membuka kontrol musik, jeda animasi, dan salin tautan.

Pembuka memiliki efek melewati gerbang sekitar 5,4 detik dan tombol **Lewati animasi**. Preferensi **reduced motion** pada perangkat dihormati. Gambar latar dan gerbang merupakan dua berkas terpisah; transparansi gerbang disimpan agar kedalaman visual tetap terlihat.

## RSVP, izin ucapan publik, dan data

- Tamu memilih hadir, tidak hadir, atau belum pasti. Jumlah tamu otomatis 0 saat memilih tidak hadir.
- Ucapan dan kontak bersifat opsional.
- Kotak izin ucapan publik **tidak dicentang secara bawaan**. Hanya nama, ucapan, dan tanggal dari pengiriman berizin yang ditampilkan di buku tamu.
- Email, WhatsApp, status kehadiran, dan jumlah tamu tidak dikembalikan oleh endpoint buku tamu.
- Pengiriman ulang dengan ID permintaan yang sama tidak membuat salinan baru. Tombol “Ubah dan kirim konfirmasi baru” membuat pengiriman baru secara sengaja.
- Data tersimpan di `backend/data/rsvps.json`, di luar folder publik frontend. Lokasinya dapat diubah melalui `RSVP_STORAGE_PATH`.
- Buku tamu menampilkan maksimal 50 ucapan publik terbaru. Tombol baca lainnya membuka ucapan yang sudah dimuat.

Saat dihosting, backend memerlukan disk persisten agar data tetap ada setelah aplikasi dimulai ulang. Backup file data sebelum memindahkan atau mengganti folder backend.

## Mengatur notifikasi email — opsional

Buat konfigurasi dari contoh yang disediakan jika diperlukan:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Isi `RESEND_API_KEY`, `EMAIL_FROM`, dan `EMAIL_TO` pada `backend/.env`. Jika ketiganya terisi, backend mengirim notifikasi setelah menyimpan konfirmasi. Jika layanan email gagal, konfirmasi yang sudah tersimpan tetap diterima. Status kegagalan email dicatat di terminal backend.

Frontend memakai proxy `/api` ke `http://127.0.0.1:8080` secara bawaan. Jika alamat backend berubah, sesuaikan `API_INTERNAL_URL` pada `frontend/.env.local`. `NEXT_PUBLIC_API_URL` hanya diperlukan jika browser harus menghubungi backend di origin berbeda; sesuaikan pula `ALLOWED_ORIGIN` di backend.

## Wedding gift dan live streaming — opsional

Keduanya tersedia melalui konfigurasi dan muncul setelah data asli diisi:

```ts
streamingUrl: "", // Isi dengan URL siaran acara Anda.
gifts: [] as { bank: string; account: string; name: string }[],
```

Tambahkan objek berisi nama bank, nomor rekening, dan nama pemilik ke array `gifts`. Tombol salin tersedia pada setiap rekening. Belum ada nomor rekening maupun tautan siaran yang diisikan pada versi ini.

## Build dan pemeriksaan

```powershell
npm run typecheck
npm run test:backend
npm run build
npm start
```

`npm start` menjalankan hasil build frontend dan backend. Jika menjalankan backend secara terpisah:

```powershell
cd backend
go run -buildvcs=false .
```

Di terminal lain, jalankan `npm run dev` dari folder frontend.

Hasil pengujian versi ini tercatat di `VALIDASI.md`. Panduan commit ada di `PANDUAN-COMMIT.md`; rincian ilustrasi dan prompt ada di `PROMPT-ASET.md`.

## Isi folder

- `frontend/`: aplikasi, konfigurasi, font, gambar, dan audio.
- `backend/`: API RSVP, buku tamu, penyimpanan, notifikasi email, dan pengujiannya.
- `scripts/dev.mjs`: menjalankan kedua aplikasi dari satu terminal.
- `design-originals/`: ilustrasi resolusi asli dan logo L&A.

ZIP tidak menyertakan dependensi, hasil build, data tamu, konfigurasi rahasia, atau berkas pengujian browser.
