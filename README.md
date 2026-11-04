# Undangan Pernikahan Listy & Aldo

Website undangan digital Sulistyawati (Listy) dan Rivaldo (Aldo), dengan tema taman bunga, animasi pembuka, galeri foto, informasi acara, countdown, RSVP, dan buku ucapan.

## Fitur

- Halaman undangan responsif dengan animasi dan dukungan preferensi reduced motion.
- Nama tamu pada sampul melalui parameter URL.
- Informasi mempelai, cerita, jadwal acara, lokasi, dan countdown.
- Galeri foto prewedding dan foto mempelai dengan mode lihat.
- RSVP dengan validasi, pembatasan request, dan penyimpanan lokal persisten.
- Buku ucapan publik hanya untuk kiriman yang mendapat izin.
- Notifikasi RSVP melalui Resend (opsional).
- Unduh jadwal akad ke kalender.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, CSS |
| Backend | Go, chi, penyimpanan JSON |
| Email opsional | Resend API |

## Persyaratan

- Node.js 20 atau 22
- npm
- Go 1.22 atau lebih baru

Periksa instalasi dari terminal:

```powershell
node --version
npm --version
go version
```

## Menjalankan proyek secara lokal

Buka folder utama proyek di VS Code. Dari terminal PowerShell pada folder tersebut, jalankan:

```powershell
npm run setup
npm run dev
```

Buka <http://localhost:3000>. Perintah tersebut menjalankan frontend dan backend. Tekan `Ctrl+C` di terminal untuk menghentikannya. Saat pertama kali dijalankan, Go mungkin perlu mengunduh dependensi backend.

Untuk menjalankan frontend saja:

```powershell
node scripts/dev.mjs --frontend-only
```

Fitur RSVP dan buku ucapan memerlukan backend yang berjalan.

## Membuat dan menampilkan file environment

File contoh environment sudah tersedia di `backend/.env.example` dan `frontend/.env.example`. File `.env` dan `.env.local` belum tentu ada setelah proyek diunduh, karena file tersebut dibuat khusus untuk konfigurasi lokal.

Di terminal PowerShell pada folder utama proyek, salin file contohnya:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

File akan muncul pada lokasi berikut:

```text
backend/.env
frontend/.env.local
```

Untuk memastikan file tersembunyi terdaftar di PowerShell:

```powershell
Get-ChildItem -Force backend, frontend
```

Di VS Code, pastikan folder utama proyek yang dibuka adalah folder yang benar, lalu segarkan Explorer. Anda juga dapat menekan `Ctrl+P`, mengetik `backend/.env` atau `frontend/.env.local`, lalu memilih file yang muncul. Jika tetap tidak terlihat di Explorer, buka Settings dan periksa `Files: Exclude`; hapus aturan yang mengecualikan `.env` atau `.env.local`.

### Konfigurasi backend

Edit `backend/.env` bila perlu:

| Variabel | Kegunaan | Nilai bawaan |
| --- | --- | --- |
| `PORT` | Port backend | `8080` |
| `RSVP_STORAGE_PATH` | Lokasi file data RSVP | `data/rsvps.json` |
| `ALLOWED_ORIGIN` | Origin frontend yang diizinkan | `http://localhost:3000` |
| `RATE_LIMIT_RPM` | Batas request per menit per IP | `10` |
| `RESEND_API_KEY` | Kunci API Resend untuk notifikasi email | Kosong |
| `EMAIL_FROM` | Alamat pengirim yang terverifikasi di Resend | Kosong |
| `EMAIL_TO` | Alamat penerima notifikasi RSVP | Kosong |

RSVP tetap tersimpan meskipun pengaturan email opsional tidak diisi. Isi ketiga variabel Resend jika ingin mengaktifkan notifikasi email. Jangan masukkan kunci API atau rahasia lain ke frontend.

### Konfigurasi frontend

Edit `frontend/.env.local` bila alamat backend berbeda dari pengaturan lokal:

| Variabel | Kegunaan | Nilai bawaan |
| --- | --- | --- |
| `API_INTERNAL_URL` | Alamat backend yang digunakan proxy Next.js | `http://127.0.0.1:8080` |
| `NEXT_PUBLIC_API_URL` | URL backend yang dipanggil langsung oleh browser | Kosong; gunakan proxy `/api` |

Untuk penggunaan lokal biasa, nilai bawaan dapat dibiarkan. Jika mengubah file environment, hentikan lalu jalankan kembali `npm run dev`.

> **Keamanan:** file `.env` dan `.env.local` sengaja dikecualikan dari Git agar rahasia dan konfigurasi lokal tidak terunggah. Jangan menghapus aturan tersebut atau membagikan isi file yang memuat kunci API. File `.env.example` disediakan sebagai template tanpa rahasia.

## Data undangan

Nama, keluarga, tanggal, jadwal, lokasi, cerita, musik, dan path foto dikonfigurasi di `frontend/src/lib/config.ts`.

| Informasi | Nilai saat ini |
| --- | --- |
| Mempelai wanita | Sulistyawati (Listy) |
| Mempelai pria | Rivaldo (Aldo) |
| Lamaran dalam cerita | 25 November 2026 |
| Pernikahan | Sabtu, 5 Desember 2026 |
| Akad | 10.00–11.00 WITA |
| Resepsi | 11.00 WITA–selesai |
| Lokasi | Rumah Mempelai Wanita, Jl. Akasia 1 No. 27 Perumnas Tinggede |

Tanggal utama menggunakan offset WITA (`+08:00`).

## Personalisasi

### Nama tamu pada sampul

Tambahkan parameter `to` pada tautan undangan:

```text
http://localhost:3000/?to=Bapak%20Andi%20dan%20Keluarga
```

Nama akan ditampilkan di sampul dan diisikan sebagai nama awal pada formulir RSVP. Tamu dapat mengubahnya sebelum mengirim.

### Foto mempelai dan prewedding

Simpan foto di folder `frontend/public/images/`, contohnya:

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

Kemudian isi path foto di `frontend/src/lib/config.ts`:

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

Path foto memulai dari URL `/images/`, bukan `/public/images/`. Foto yang tersedia dapat dibuka dalam mode lihat. Galeri prewedding juga mendukung tombol panah untuk berpindah foto dan `Esc` untuk menutup. Slot foto yang belum diisi akan menampilkan placeholder.

### Musik, gift, dan siaran langsung

Musik lokal berada di `frontend/public/audio/floral-piano.wav` dan mulai diputar setelah pengunjung membuka undangan. Tautan siaran dan informasi gift dapat diatur di `frontend/src/lib/config.ts` melalui `streamingUrl` dan `gifts`. Biarkan nilainya kosong sampai informasi yang benar tersedia.

## RSVP dan privasi

- Pengunjung dapat memilih hadir, tidak hadir, atau belum pasti.
- Ucapan dan informasi kontak bersifat opsional.
- Ucapan hanya dipublikasikan jika pengunjung memberi izin.
- Buku tamu tidak menampilkan email, WhatsApp, status kehadiran, atau jumlah tamu.
- Data RSVP disimpan di `backend/data/rsvps.json`, di luar folder publik frontend.
- Gunakan penyimpanan disk persisten dan backup rutin saat backend di-host.

## Deploy ke Vercel dan Render

Frontend Next.js di-deploy ke Vercel, sedangkan backend Go dan file RSVP dijalankan di Render. File `render.yaml` menyiapkan backend Go, pemeriksaan kesehatan, dan disk persisten 1 GB. **Render persistent disk dan compute service memerlukan paket berbayar.** Periksa harga terbaru di Render sebelum membuat service. Jangan deploy backend ini ke filesystem serverless yang tidak persisten tanpa terlebih dahulu mengganti penyimpanan JSON dengan database.

### 1. Deploy frontend ke Vercel

1. Push kode ke repository GitHub.
2. Di Vercel, pilih **Add New → Project**, lalu import repository ini.
3. Pada **Root Directory**, pilih `frontend`. Biarkan framework terdeteksi sebagai Next.js dan gunakan perintah build bawaan.
4. Deploy frontend. Catat alamat produksi, misalnya `https://nama-undangan.vercel.app`.

Halaman dapat tampil setelah langkah ini, tetapi RSVP dan buku tamu belum tersambung sampai backend dikonfigurasi.

### 2. Deploy backend Go ke Render

1. Di Render, pilih **New → Blueprint** dan hubungkan repository GitHub yang sama. Pastikan `render.yaml` berada di root repository.
2. Tinjau resource dan harga sebelum menyetujui pembuatan service. Blueprint membuat web service Go dan persistent disk; disk dipasang di `/var/data`, tempat RSVP disimpan.
3. Saat diminta `ALLOWED_ORIGIN`, masukkan origin Vercel dari langkah sebelumnya persis, tanpa slash di akhir, misalnya `https://nama-undangan.vercel.app`.
4. Setelah deploy selesai, catat URL service backend, misalnya `https://listy-aldo-backend.onrender.com`.
5. Pastikan health check berhasil dengan membuka `https://URL-BACKEND/api/health`; respons normal berisi status `ok`.

### 3. Hubungkan Vercel ke backend

Di Vercel, buka **Project → Settings → Environment Variables**, lalu tambahkan:

| Name | Value |
| --- | --- |
| `API_INTERNAL_URL` | URL backend Render, misalnya `https://listy-aldo-backend.onrender.com` |

Pilih environment **Production**, simpan, lalu lakukan **Redeploy**. Jangan tambahkan slash atau `/api` di akhir URL. Biarkan `NEXT_PUBLIC_API_URL` tidak disetel agar browser menggunakan proxy `/api` dari Next.js. Jika domain Vercel berubah atau ditambahkan domain kustom, perbarui `ALLOWED_ORIGIN` di Render dan deploy ulang backend.

### 4. Aktifkan notifikasi Resend

Domain pengirim harus dimiliki dan diverifikasi di Resend sebelum digunakan. Tambahkan record DNS yang diberikan Resend pada penyedia domain Anda, lalu tunggu hingga dashboard Resend menandai domain terverifikasi. Setelah itu, di **Render → service backend → Environment**, tambahkan:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | API key Resend; simpan sebagai secret |
| `EMAIL_FROM` | Nama dan alamat dari domain terverifikasi, misalnya `Listy & Aldo <rsvp@domain-anda.com>` |
| `EMAIL_TO` | Alamat email yang akan menerima notifikasi RSVP |

Simpan perubahan dan deploy ulang service Render. Jangan menaruh `RESEND_API_KEY` di Vercel, variabel `NEXT_PUBLIC_*`, Git, atau chat. File `.env` lokal tidak otomatis diunggah ke Vercel maupun Render; nilai production harus dimasukkan di dashboard masing-masing platform.

### 5. Uji deployment

- Buka URL frontend dan kirim satu RSVP uji.
- Pastikan RSVP mendapat respons berhasil dan email masuk ke `EMAIL_TO`.
- Muat ulang halaman buku tamu untuk memeriksa ucapan yang diberi izin.
- Buka `/api/health` pada backend dan periksa log service bila pengiriman email gagal.
- Untuk memeriksa keberlanjutan penyimpanan, lakukan redeploy backend lalu pastikan RSVP uji masih tersimpan.

## Pemeriksaan dan build

Jalankan dari folder utama:

```powershell
npm run typecheck
npm run test:backend
npm run build
npm start
```

`npm start` menjalankan hasil build frontend dan backend.

Untuk menjalankan backend secara terpisah, gunakan terminal PowerShell:

```powershell
Set-Location backend
go run -buildvcs=false .
```

Pada terminal lain, jalankan frontend dari folder `frontend`:

```powershell
Set-Location frontend
npm run dev
```

## Struktur proyek

```text
backend/                 API RSVP, buku tamu, penyimpanan, dan email
frontend/                Aplikasi Next.js dan aset undangan
scripts/dev.mjs          Menjalankan frontend dan backend
render.yaml              Blueprint deploy backend Go dan persistent disk
design-originals/        Ilustrasi resolusi asli
```

Rincian pengujian proyek tersedia di `VALIDASI.md`. Panduan commit tersedia di `PANDUAN-COMMIT.md`, dan informasi aset di `PROMPT-ASET.md`.
