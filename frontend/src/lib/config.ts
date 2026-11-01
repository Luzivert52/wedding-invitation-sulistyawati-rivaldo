/**
 * ============================================================
 *  FILE KONFIGURASI UNDANGAN
 *  Ganti semua data di bawah ini sesuai pernikahan Anda.
 * ============================================================
 */

export const weddingConfig = {
  // --- Nama Pengantin ---
  bride: {
    fullName: "Sulistyawati",
    shortName: "Listy",
    father: "Alm. Daeng Talara",
    mother: "Fariati",
  },
  groom: {
    fullName: "Rivaldo",
    shortName: "Aldo",
    father: "Alm. Ridwan",
    mother: "Fandha",
  },

  // Simpan foto dengan nama/path ini di frontend/public/images/.
  images: {
    bride: "",
    groom: "",
  },

  // --- Tanggal & Waktu ---
  // Akad begins at 10.00 WITA (UTC+8).
  weddingDate: "2026-12-05T10:00:00+08:00",
  weddingDateDisplay: "Sabtu, 05 Desember 2026",

  // Kalender untuk akad 10.00–11.00 WITA, sesuai jadwal acara.
  calendar: { end: "2026-12-05T11:00:00+08:00" },

  // Musik instrumental lokal; kosongkan src untuk menyembunyikan tombol musik.
  music: { src: "/audio/floral-piano.wav" },

  // --- Acara ---
  events: [
    {
      title: "Akad Nikah",
      time: "10.00 – 11.00 WITA",
      date: "Sabtu, 05 Desember 2026",
      venue: "Rumah Mempelai Wanita",
      address: "Jl. Akasia 1 No. 27 Perumnas Tinggede",
    },
    {
      title: "Resepsi",
      time: "11.00 – Selesai",
      date: "Sabtu, 05 Desember 2026",
      venue: "Rumah Mempelai Wanita",
      address: "Jl. Akasia 1 No. 27 Perumnas Tinggede",
    },
  ],

  // --- Google Maps ---
  // Ganti dengan link Google Maps lokasi acara Anda
  mapsUrl:
    "https://maps.google.com/?q=Rumah+Mempelai+Wanita,+Jl.+Akasia+1+No.+27,+Perumnas+Tinggede",

  // --- Cerita Singkat ---
  story: [
    {
      year: "01",
      title: "The Beginning of Forever",
      text: [
        "Tidak ada yang pernah menyangka bahwa sebuah perkenalan sederhana akan membawa dua hati menuju takdir yang begitu indah.",
        "Kisah ini bermula dari seorang sahabat mempelai wanita yang memperkenalkannya kepada seorang laki-laki, teman sekolahnya dahulu. Dari perkenalan sederhana itu, komunikasi mulai terjalin, rasa nyaman perlahan tumbuh, hingga keduanya memutuskan untuk saling mengenal lebih jauh.",
        "Perjalanan waktu mengajarkan mereka tentang arti kesabaran, pengertian, dan komitmen. Berbagai cerita telah dilalui bersama, hingga akhirnya mereka menyadari bahwa satu sama lain adalah seseorang yang ingin dijadikan teman hidup.",
      ],
    },
    {
      year: "02",
      title: "THE ENGAGEMENT · 25 November 2026",
      text: [
        "Dengan penuh keyakinan dan niat baik, dua hati akhirnya melangkah ke tahap yang lebih serius. Sebuah ikatan lamaran menjadi tanda kesungguhan untuk membawa kisah cinta ini menuju jenjang pernikahan.",
      ],
    },
    {
      year: "03",
      title: "THE WEDDING · 05 Desember 2026",
      text: [
        "Hari ketika dua hati mengikat janji suci, menyatukan dua perjalanan, dan memulai babak baru sebagai pasangan suami istri.",
        "Sebuah perkenalan sederhana kini berujung pada janji untuk seumur hidup. Bukan lagi sekadar tentang dua orang yang saling mencintai, melainkan tentang dua insan yang memilih untuk terus bersama dalam suka maupun duka.",
        "What started as a simple introduction, became a lifetime of love.",
        "And so, our forever begins… 🤍",
      ],
    },
  ],

  // --- Galeri ---
  // Enam tempat foto. Biarkan kosong sampai file foto asli tersedia.
  // Simpan foto di public/images/prewedding/, lalu isi path sesuai komentar.
  gallery: [
    "", // /images/prewedding/prewedding-1.jpg
    "", // /images/prewedding/prewedding-2.jpg
    "", // /images/prewedding/prewedding-3.jpg
    "", // /images/prewedding/prewedding-4.jpg
    "", // /images/prewedding/prewedding-5.jpg
    "", // /images/prewedding/prewedding-6.jpg
  ] as string[],

  // Isi hanya jika tautan siaran / nomor rekening asli sudah tersedia.
  streamingUrl: "",
  gifts: [] as { bank: string; account: string; name: string; }[],

  // --- Ucapan Penutup ---
  closingMessage:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.",

  // --- Meta ---
  siteTitle: "Wedding Invitation - Sulistyawati & Rivaldo",
  siteDescription:
    "Dengan penuh sukacita, kami mengundang Anda untuk merayakan hari bahagia kami.",
};

export type WeddingConfig = typeof weddingConfig;
