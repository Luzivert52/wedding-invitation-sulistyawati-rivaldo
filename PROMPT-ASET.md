# Ilustrasi dan font

Ilustrasi dibuat memakai imagegen bawaan. Keduanya dipakai sebagai lapisan terpisah agar animasi dapat memperbesar latar dan gerbang dengan kecepatan yang berbeda.

| Aset siap web | Berkas resolusi asli |
| --- | --- |
| `frontend/public/images/floral-valley.webp` | `design-originals/floral-valley.png` |
| `frontend/public/images/floral-arch.webp` | `design-originals/floral-arch.png` |

Gerbang menggunakan transparansi alpha, termasuk bagian tengahnya. WebP merupakan versi kompresi untuk web; gambar asli tetap disertakan.

## Prompt latar taman

Use case: stylized-concept. Asset type: portrait background illustration layer for a premium animated Indonesian digital wedding invitation. Create a 1024x1536 portrait original hand-painted dream garden in a refined European botanical toile / romantic watercolor style, detailed but softly textured. A distant slender cascading waterfall centered in misty sage-blue mountains, a winding pale ivory garden path, ancient cypress and fine botanical trees at the far left and right, a small classical cream fountain low in the center, soft pale blue green foliage, blush pink roses and ivory hydrangeas at the very bottom edges. Pale cream morning sky at the upper center. Color palette warm parchment ivory, dusty blush, muted powder sage and misty teal, subtle antique gold accents. Layers with lovely spatial depth like an elegant storybook theatrical set. Entire scene vertical and symmetrical enough to pass through a gate placed over it. Do not draw any gate or architectural arch in THIS background layer. No people, no couples, no lettering, no logos, no watermark. Avoid saturated colors and avoid photorealism. Produce only the art, not a website screenshot or mockup.

## Prompt gerbang transparan

Use case: stylized-concept. Asset type: transparent foreground scenic layer for an animated luxury floral wedding invitation, portrait 1024x1536. Render one complete ornate antique IVORY STONE GARDEN ARCH, viewed straight-on, tall and elegant, with two slender carved Corinthian pillars on the far left and right, graceful arched lintel near the top, subtle antique gold details. Lush but airy BLUSH PINK garden roses, ivory peonies, pale blue hydrangeas, soft mauve wisteria and sage eucalyptus climbing the outer pillars and framing the bottom corners, and delicate rose vines draping from the upper corners. Fine romantic watercolor / painted paper-theatre illustration with softly shaded carved stone, crisp cutout silhouette. Composition: central 55 percent wide doorway entirely EMPTY AND TRANSPARENT from top curved doorway down to the bottom. Space outside the architecture also entirely transparent. Pillar bases near lower corners, no floor or landscape backdrop, no opaque rectangle. The gate fills most of the canvas while keeping ALL flowers and architecture intact inside a small transparent margin. No people, no birds, no text, no letters, no logo, no watermark, no border outside the arch. True transparent alpha background including the central opening, not a checkerboard painting.

## Font dan audio

- Pinyon Script, Playfair Display, dan Lora disimpan lokal dalam `frontend/public/fonts/` sehingga tampilan tidak memerlukan pemuatan font dari layanan luar.
- Lisensi OFL masing-masing keluarga font ada dalam folder font.
- Ornamen garis dan bunga SVG tetap dapat diedit dari komponen.
- Logo L&A dan musik piano lokal diteruskan dari proyek Anda sebelumnya.
- Musik, watermark, foto pasangan, dan video promosi dari referensi tidak dimasukkan sebagai aset proyek.
