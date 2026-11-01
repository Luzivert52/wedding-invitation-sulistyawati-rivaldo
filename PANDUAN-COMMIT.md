# Menerapkan perubahan dan membuat commit

Jika melanjutkan repositori `floral-wedding` yang sudah ada, pertahankan folder `.git`, konfigurasi `.env` / `.env.local`, dan data RSVP yang sudah dipakai. Salin sumber dari ZIP setelah memeriksa perubahannya.

Jalankan dari folder utama repositori:

```powershell
npm run typecheck
npm run test:backend
npm run build

git status
git add frontend backend scripts package.json README.md VALIDASI.md PANDUAN-COMMIT.md PROMPT-ASET.md .gitignore design-originals
git --no-pager diff --cached --name-only
git commit -m "feat: redesign undangan Listy Aldo dengan gerbang floral sinematik" -m "Tambahkan pembuka berlapis, tipografi kaligrafi, galeri enam foto, RSVP persisten, dan buku ucapan dengan persetujuan publik."
git push -u origin HEAD
```

Periksa daftar berkas sebelum commit. `.env`, `backend/data/`, `node_modules/`, hasil build, dan berkas pengujian lokal diabaikan melalui `.gitignore`.

Perintah Git di atas digunakan pada folder yang sudah menjadi repositori Git. Untuk mencoba ZIP sebagai proyek baru, cukup gunakan petunjuk menjalankan di README tanpa menjalankan perintah commit.
