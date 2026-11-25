/**
 * ============================================================
 *  FILE KONFIGURASI UNDANGAN
 *  Ganti semua data di bawah ini sesuai pernikahan Anda.
 * ============================================================
 */

export const weddingConfig = {
  // --- Nama Pengantin ---
  bride: {
    fullName: "Sulistyawati A.Md,AK",
    shortName: "Listy",
    birthOrder: "Putri Pertama",
    instagram: "@listyy___",
    father: "Alm. Daeng Talara",
    mother: "Fariati",
  },
  groom: {
    fullName: "Rivaldo",
    shortName: "Aldo",
    birthOrder: "Putra Pertama",
    instagram: "@do.labamba",
    father: "Alm. Ridwan",
    mother: "Fandha Febryanti",
  },

  // Path foto publik dimulai dari root URL, bukan dari folder public/.
  images: {
    bride: "/images/bride.jpg",
    groom: "/images/optimized/groom.jpg",
  },

  // --- Tanggal & Waktu ---
  // Resepsi dimulai pukul 16.00 WITA (UTC+8).
  weddingDate: "2026-12-05T16:00:00+08:00",
  weddingDateDisplay: "Sabtu, 05 Desember 2026",

  // Kalender menggunakan durasi satu jam karena waktu selesai tidak dicantumkan.
  calendar: { end: "2026-12-05T17:00:00+08:00" },

  // Musik instrumental lokal; kosongkan src untuk menyembunyikan tombol musik.
  music: { src: "/audio/floral-piano.wav" },

  // --- Acara ---
  events: [
    {
      title: "Maparolla & Resepsi",
      time: "16.00 WITA",
      date: "Sabtu, 05 Desember 2026",
      venue: "Kediaman Mempelai Pria",
      address: "Jl. Sungai Ogotion, Belakang Warung Hj Rosna",
    },
  ],

  // --- Peta Lokasi ---
  mapsUrl:
    "https://maps.apple.com/?address=Jalan%20Ogotion,%20Kota%20Palu,%20Sulawesi%20Tengah,%20Indonesia&auid=9150309435901676655&ll=-0.906547,119.862068&lsp=9902&q=Waroeng%20hj%20rosnah&t=h",

  // --- Cerita Singkat ---
  story: [
    {
      year: "01",
      title: "Awal Pertemuan · 5 Februari 2024",
      text: [
        "Berawal dari Instagram, kami saling mengenal melalui perantara seorang sahabat dekat. Tak disangka, perkenalan sederhana itu menjadi awal kisah cinta kami.",
      ],
    },
    {
      year: "02",
      title: "Menjalin Hubungan · 10 April 2024",
      text: [
        "Dari obrolan sederhana tumbuh rasa nyaman, hingga kami yakin untuk saling memilih dan melangkah bersama.",
      ],
    },
    {
      year: "03",
      title: "Lamaran · 25 November 2026",
      text: [
        "Dengan niat dan keyakinan, kami memutuskan untuk membawa hubungan ini ke jenjang yang lebih serius.",
      ],
    },
    {
      year: "04",
      title: "Pernikahan · 05 Desember 2026",
      text: [
        "Dua hati yang dipertemukan melalui seorang sahabat, kini disatukan dalam ikatan suci pernikahan. Semoga cinta ini menjadi perjalanan indah seumur hidup.",
      ],
    },
  ],

  // --- Galeri ---
  // Enam tempat foto. Biarkan kosong sampai file foto asli tersedia.
  // Foto asli ada di images/prewedding/, versi web ringannya di images/optimized/.
  gallery: [
    "/images/optimized/prewedding/prewedding-1.jpg",
    "/images/optimized/prewedding/prewedding-2.jpg",
    "/images/optimized/prewedding/prewedding-3.jpg",
    "/images/optimized/prewedding/prewedding-4.jpg",
    "/images/optimized/prewedding/prewedding-5.jpg",
    "/images/optimized/prewedding/prewedding-6.jpg",
  ] as string[],
  galleryFull: [
    "/images/optimized/full/prewedding/prewedding-1.jpg",
    "/images/optimized/full/prewedding/prewedding-2.jpg",
    "/images/optimized/full/prewedding/prewedding-3.jpg",
    "/images/optimized/full/prewedding/prewedding-4.jpg",
    "/images/optimized/full/prewedding/prewedding-5.jpg",
    "/images/optimized/full/prewedding/prewedding-6.jpg",
  ] as string[],

  // Nomor WhatsApp RSVP dan rekening yang diberikan oleh kedua mempelai.
  rsvpWhatsApp: { display: "082261609700", number: "6282261609700" },
  streamingUrl: "",
  gifts: [
    { bank: "Mandiri", account: "1510013930463", name: "Rivaldo" },
    { bank: "BRI", account: "0060 01 032531 534", name: "Sulistyawati" },
  ],

  // --- Ucapan Penutup ---
  closingMessage:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.",

  // --- Meta ---
  siteTitle: "Wedding Invitation - Sulistyawati & Rivaldo",
  siteDescription:
    "Dengan penuh sukacita, kami mengundang Anda untuk merayakan hari bahagia kami.",
};

export type WeddingConfig = typeof weddingConfig;
