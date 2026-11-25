# Undangan Pernikahan Aldo & Listy

Website undangan digital Rivaldo (Aldo) dan Sulistyawati (Listy), dengan tema taman bunga, animasi pembuka, galeri foto, informasi acara, countdown, RSVP, dan buku ucapan.

## Fitur

- Halaman undangan responsif dengan animasi dan dukungan preferensi reduced motion.
- Nama tamu pada sampul melalui parameter URL.
- Informasi mempelai, cerita, jadwal acara, lokasi, dan countdown.
- Galeri foto prewedding dan foto mempelai dengan mode lihat.
- RSVP dengan validasi, pembatasan request, dan penyimpanan PostgreSQL di Supabase.
- Buku ucapan publik hanya untuk kiriman yang mendapat izin.
- Notifikasi RSVP melalui Resend (opsional).
- Unduh jadwal pernikahan ke kalender.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Aplikasi | Next.js 16, React 19, TypeScript, CSS |
| API dan database | Next.js Route Handlers, Supabase PostgreSQL |
| Email opsional | Resend API |

## Persyaratan

- Node.js 20.19 atau lebih baru (disarankan Node.js 22.13 atau 24)
- npm
- Proyek Supabase untuk RSVP dan buku tamu

Periksa instalasi dari terminal:

```powershell
node --version
npm --version
```

## Menjalankan proyek secara lokal

Buka folder utama proyek di VS Code. Dari terminal PowerShell pada folder tersebut, jalankan:

```powershell
npm run setup
Copy-Item frontend\.env.example frontend\.env.local
npm run dev
```

Isi `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di `frontend/.env.local` setelah membuat proyek Supabase dan menjalankan migration SQL di `frontend/supabase/migrations/`. Buka <http://localhost:3000>. API RSVP dan buku tamu sekarang berjalan melalui Next.js; tidak perlu menjalankan server Go terpisah.

## Membuat dan menampilkan file environment

File contoh environment tersedia di `frontend/.env.example`. Di terminal PowerShell pada folder utama proyek, salin file tersebut:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
```

File akan muncul pada lokasi berikut:

```text
frontend/.env.local
```

Untuk memastikan file tersembunyi terdaftar di PowerShell:

```powershell
Get-ChildItem -Force frontend
```

Edit `frontend/.env.local`:

| Variabel | Kegunaan | Nilai bawaan |
| --- | --- | --- |
| `SUPABASE_URL` | URL proyek Supabase | Wajib untuk RSVP |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci rahasia server untuk akses database | Wajib untuk RSVP |
| `RESEND_API_KEY` | Kunci API Resend untuk notifikasi email | Opsional |
| `EMAIL_FROM` | Alamat pengirim yang sudah diverifikasi di Resend | Opsional |
| `EMAIL_TO` | Alamat penerima notifikasi RSVP | Opsional |

Jalankan SQL migration di Supabase sebelum menguji RSVP. Isi ketiga variabel Resend jika ingin mengaktifkan notifikasi email. Jangan beri awalan `NEXT_PUBLIC_` pada URL/kunci Supabase; terutama `SUPABASE_SERVICE_ROLE_KEY` hanya boleh tersedia di server.

> **Keamanan:** file `.env` dan `.env.local` sengaja dikecualikan dari Git agar rahasia dan konfigurasi lokal tidak terunggah. Jangan menghapus aturan tersebut atau membagikan isi file yang memuat kunci API. File `.env.example` disediakan sebagai template tanpa rahasia.

## Data undangan

Nama, keluarga, tanggal, jadwal, lokasi, cerita, musik, dan path foto dikonfigurasi di `frontend/src/lib/config.ts`.

| Informasi | Nilai saat ini |
| --- | --- |
| Mempelai wanita | Sulistyawati A.Md,AK (Listy), putri pertama |
| Mempelai pria | Rivaldo (Aldo) |
| Maparolla & resepsi | Sabtu, 05 Desember 2026, pukul 16.00 WITA |
| Lokasi | Kediaman Mempelai Pria, Jl. Sungai Ogotion, Belakang Warung Hj Rosna |
| RSVP WhatsApp | 082261609700 |
| Hadiah | Mandiri a.n. Rivaldo; BRI a.n. Sulistyawati |

Tanggal utama menggunakan offset WITA (`+08:00`). Data Instagram, keluarga,
cerita perjalanan, rekening, dan tautan lokasi juga tersedia di konfigurasi
undangan.

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
  optimized/
    bride.jpg
    groom.jpg
    prewedding/
      prewedding-1.jpg
      ...
    full/
      bride.jpg
      prewedding/
        prewedding-1.jpg
        ...
```

Kemudian isi path foto di `frontend/src/lib/config.ts`:

```ts
images: {
  bride: "/images/optimized/full/bride.jpg",
  groom: "/images/optimized/groom.jpg",
},
gallery: [
  "/images/optimized/prewedding/prewedding-1.jpg",
  "/images/optimized/prewedding/prewedding-2.jpg",
  "/images/optimized/prewedding/prewedding-3.jpg",
  "/images/optimized/prewedding/prewedding-4.jpg",
  "/images/optimized/prewedding/prewedding-5.jpg",
  "/images/optimized/prewedding/prewedding-6.jpg",
],
galleryFull: [
  "/images/optimized/full/prewedding/prewedding-1.jpg",
  // ... sampai prewedding-6.jpg
],
```

Path foto memulai dari URL `/images/`, bukan `/public/images/`. Foto asli tetap disimpan tanpa perubahan. Foto galeri memakai salinan ringan berukuran maksimal 1800 × 2700 piksel; versi resolusi tinggi hingga 3000 × 4500 piksel dimuat saat foto dibuka. Potret Listy memakai sumber 3200 × 4800 dan crop lebih dekat. Jika mengganti foto asli, perbarui juga salinan terkait di folder `optimized`. Galeri mendukung tombol panah untuk berpindah foto dan `Esc` untuk menutup.

### Musik, gift, dan siaran langsung

Musik lokal berada di `frontend/public/audio/floral-piano.wav` dan mulai diputar setelah pengunjung membuka undangan. Tautan siaran dan informasi gift dapat diatur di `frontend/src/lib/config.ts` melalui `streamingUrl` dan `gifts`. Biarkan nilainya kosong sampai informasi yang benar tersedia.

## RSVP dan privasi

- Pengunjung dapat memilih hadir, tidak hadir, atau belum pasti.
- Ucapan dan informasi kontak bersifat opsional.
- Ucapan hanya dipublikasikan jika pengunjung memberi izin.
- Buku tamu tidak menampilkan email, WhatsApp, status kehadiran, atau jumlah tamu.
- Data RSVP tersimpan pada tabel privat Supabase `public.rsvps`; hanya ucapan yang diizinkan yang dibaca publik oleh endpoint buku tamu.
- Kunci service-role hanya digunakan oleh Route Handlers server-side. Rate limit RSVP menggunakan tabel privat terpisah dengan hash IP.
- RSVP lama di Render atau `backend/data/rsvps.json` tidak otomatis dipindahkan. Ekspor dan impor data lama sebelum menonaktifkan layanan lama.

Untuk mengimpor file JSON lama yang diekspor dari backend Go, jalankan migration SQL lebih dahulu, lalu dari PowerShell isi kredensial Supabase hanya di sesi lokal dan jalankan:

```powershell
$env:SUPABASE_URL = "URL-proyek-Supabase"
$env:SUPABASE_SERVICE_ROLE_KEY = "service-role-key"
node frontend/scripts/import-rsvp-json.mjs "C:\path\aman\rsvps.json"
Remove-Item Env:\SUPABASE_URL
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
```

Importer mempertahankan waktu, izin publikasi, dan ID pengiriman lama; ID duplikat dilewati. File ekspor berisi data pribadi—jangan commit, kirim lewat chat, atau simpan di folder publik. Hapus salinan kerja setelah memastikan data berhasil diimpor.

## Deploy ke Vercel dan Supabase

Next.js meng-host halaman dan API RSVP/buku tamu di Vercel. Supabase menjadi PostgreSQL terkelola. Paket Free saat ini mencakup database 500 MB dan dapat dijeda setelah seminggu tidak aktif; periksa [harga dan batas Supabase terbaru](https://supabase.com/pricing) sebelum deploy.

### 1. Siapkan Supabase

1. Buat proyek Supabase pada paket yang diinginkan.
2. Buka **SQL Editor**, lalu jalankan seluruh isi `frontend/supabase/migrations/20261125000000_create_rsvp_storage.sql`.
3. Dari **Project Settings → API**, salin Project URL dan `service_role` key. Jangan pernah mengirimkan key ini ke browser atau Git.

### 2. Deploy Next.js ke Vercel

1. Push kode ke repository GitHub.
2. Di Vercel, pilih **Add New → Project**, lalu import repository ini.
3. Pada **Root Directory**, pilih `frontend`. Biarkan framework terdeteksi sebagai Next.js dan gunakan perintah build bawaan.
4. Di **Project → Settings → Environment Variables**, tambahkan:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Project URL dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key Supabase |

Pilih environment **Production** (dan **Preview** bila perlu), simpan, lalu deploy/redeploy. API memakai origin yang sama dengan Next.js; tidak perlu mengatur CORS atau `API_INTERNAL_URL`.

### 3. Aktifkan notifikasi Resend (opsional)

Verifikasi domain pengirim di Resend, lalu tambahkan variabel berikut ke environment Vercel:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | API key Resend; simpan sebagai secret |
| `EMAIL_FROM` | Nama dan alamat domain terverifikasi, misalnya `Aldo & Listy <rsvp@domain-anda.com>` |
| `EMAIL_TO` | Alamat email yang akan menerima notifikasi RSVP |

Setelah menyimpan, lakukan redeploy. Jangan menaruh `RESEND_API_KEY` pada variabel `NEXT_PUBLIC_*`, Git, atau chat.

### 4. Uji deployment

- Buka URL frontend dan kirim satu RSVP uji.
- Pastikan RSVP tersimpan; bila Resend dikonfigurasi, periksa email pada `EMAIL_TO`.
- Muat ulang halaman buku tamu untuk memeriksa ucapan yang diberi izin.
- Buka `/api/health` pada domain Vercel dan periksa log Function bila ada error.
- Pastikan RSVP tetap ada setelah redeploy Vercel.

## Pemeriksaan dan build

Jalankan dari folder utama:

```powershell
npm run typecheck
npm run test:backend
npm run build
npm start
```

`npm start` menjalankan Next.js production build. `npm run test:backend` hanya menjalankan tes backend Go lama yang masih disimpan sebagai referensi, bukan bagian deployment Vercel.

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
backend/                 Backend Go lama, dipertahankan sementara untuk referensi/data
frontend/                Aplikasi Next.js, API, dan aset undangan
frontend/supabase/        Skema PostgreSQL untuk RSVP dan rate limit
scripts/dev.mjs          Menjalankan Next.js lokal
render.yaml              Blueprint Render lama; tidak diperlukan untuk Vercel
design-originals/        Ilustrasi resolusi asli
```

Rincian pengujian proyek tersedia di `VALIDASI.md`. Panduan commit tersedia di `PANDUAN-COMMIT.md`, dan informasi aset di `PROMPT-ASET.md`.
