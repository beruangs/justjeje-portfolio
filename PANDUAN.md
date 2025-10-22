# Panduan Lengkap - Portfolio Website Just-Jeje

## 🎯 Cara Menambah Portfolio Baru (SANGAT MUDAH!)

### Langkah 1: Buka File JSON
Buka file: `src/data/portfolio.json`

### Langkah 2: Copy Template Ini

```json
{
  "id": "nama-project-anda",
  "title": "Judul Project",
  "date": "Bulan, Tahun",
  "category": "film",
  "thumbnail": "https://link-gambar-thumbnail.com/gambar.png",
  "youtubeUrl": "https://youtu.be/VIDEO_ID",
  "description": "Deskripsi singkat project Anda"
}
```

### Langkah 3: Isi Data

**Contoh Nyata:**

```json
{
  "id": "wedding-rina-andi",
  "title": "Wedding Rina & Andi",
  "date": "Jan, 2025",
  "category": "commission",
  "thumbnail": "https://raw.githubusercontent.com/beruangs/justjeje-imagehost/refs/heads/master/thumbnail/wedding/rina-andi.png",
  "youtubeUrl": "https://youtu.be/ABC123XYZ",
  "description": "Liputan pernikahan Rina & Andi di Surakarta"
}
```

### Penjelasan Field:

1. **id**: Nama unik (gunakan huruf kecil dan tanda hubung)
   - ✅ Benar: "wedding-rina-andi", "film-bohong", "event-sekolah"
   - ❌ Salah: "Wedding Rina", "Film 123", "Event@Sekolah"

2. **category**: Pilih salah satu:
   - `"film"` → Untuk film pendek/movie
   - `"commission"` → Untuk project berbayar (wedding, event, dll)
   - `"non-commission"` → Untuk project pribadi/kreatif

3. **thumbnail**: Link gambar thumbnail project
   - Bisa dari GitHub, Imgur, atau hosting lain
   - Format: .jpg, .png, .webp

4. **youtubeUrl**: Link video YouTube
   - Format apapun bisa: youtu.be atau youtube.com/watch

5. **pinned**: Pin project ke paling atas (opsional)
   - `"yes"` → Project muncul paling atas dengan badge kuning "PINNED"
   - `""` (kosong) → Urutan normal (default)

### 📌 Cara Nge-PIN Project

Jika ingin project tertentu **selalu muncul di paling atas** (misalnya project terbaru atau terfavorit):

1. Cari project yang mau di-pin
2. Ubah `"pinned": ""` menjadi `"pinned": "yes"`

**Contoh:**
```json
{
  "id": "batwoska-memories",
  "title": "The Batwoska 25's Memories",
  "date": "May 8, 2025",
  "category": "film",
  "pinned": "yes",
  "thumbnail": "...",
  "youtubeUrl": "..."
}
```

Project yang di-pin akan:
- ✅ Muncul paling atas di portfolio
- ✅ Ada badge kuning bertuliskan "PINNED"
- ✅ Tetap paling atas meskipun filter diubah (Film/Commission/Non-Commission)

### Langkah 4: Tambahkan ke File

Paste project baru Anda di array, pisahkan dengan koma:

```json
[
  {
    "id": "project-lama-1",
    ...
  },
  {
    "id": "project-baru-anda",
    "title": "...",
    ...
  }
]
```

### Langkah 5: SELESAI! 🎉

Tidak perlu:
- ❌ Buat file HTML baru
- ❌ Edit kode program
- ❌ Upload ke server
- ❌ Restart aplikasi

Website otomatis mendeteksi perubahan dan menampilkan project baru!

---

## 🔧 Cara Update Informasi Profile

Edit file: `src/data/profile.json`

### Update Informasi Pribadi:

```json
{
  "fullname": "Nama Lengkap Anda",
  "nickname": "Nama Panggilan",
  "age": "20 y.o",
  "city": "Kota, Indonesia"
}
```

### Update Link Social Media:

```json
{
  "contact": {
    "instagram": "https://instagram.com/username",
    "youtube": "https://youtube.com/@channel",
    "tiktok": "https://tiktok.com/@username",
    "whatsapp": "https://wa.me/628123456789",
    "email": "email@example.com"
  }
}
```

### Update Skills:

```json
{
  "skills": [
    { "name": "Davinci Resolve", "level": 100 },
    { "name": "Premiere Pro", "level": 90 }
  ]
}
```

Level: 0-100 (0% sampai 100%)

### Update Gear/Alat:

```json
{
  "gear": [
    {
      "name": "Sony A7III",
      "type": "Camera",
      "image": "https://link-gambar.com/camera.png"
    }
  ]
}
```

---

## 🚀 Cara Menjalankan Website

### Development (Testing di Komputer):

```bash
npm run dev
```

Buka browser: `http://localhost:5173`

### Production (Upload ke Internet):

```bash
npm run build
```

Folder `dist` berisi file untuk di-upload ke hosting.

---

## 📤 Cara Deploy ke Internet

### Option 1: Netlify (GRATIS & MUDAH)

1. Daftar di https://netlify.com
2. Klik "New site from Git"
3. Hubungkan repository GitHub
4. Setting:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy! ✨

### Option 2: Vercel (GRATIS & OTOMATIS)

1. Daftar di https://vercel.com
2. Import project dari GitHub
3. Vercel auto-detect settingan
4. Deploy! ✨

Kedua platform:
- ✅ GRATIS selamanya
- ✅ Auto-deploy saat push ke GitHub
- ✅ Dapat domain gratis (.netlify.app atau .vercel.app)
- ✅ SSL/HTTPS otomatis
- ✅ CDN global (cepat di seluruh dunia)

---

## 💡 Tips & Trik

### 1. Urutan Portfolio
Portfolio ditampilkan sesuai urutan di file JSON. 
Project paling atas = muncul duluan.

### 2. Gambar Thumbnail
Gunakan resolusi: 1280x720px atau 1920x1080px untuk hasil terbaik.

### 3. YouTube Link
Semua format YouTube bisa:
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`

### 4. Kategori Warna
Otomatis dapat warna:
- 🔴 Film = Merah
- 🟢 Commission = Hijau
- 🔵 Non-Commission = Biru

### 5. Backup Data
Selalu backup file `profile.json` dan `portfolio.json` sebelum edit!

---

## 🐛 Troubleshooting

### Website tidak muncul portfolio baru?
1. Cek format JSON (pakai JSON validator online)
2. Pastikan ada koma di antara object
3. Refresh browser (Ctrl + F5)

### Error saat npm run dev?
1. Hapus folder `node_modules`
2. Jalankan: `npm install`
3. Jalankan lagi: `npm run dev`

### Gambar tidak muncul?
1. Cek link gambar bisa dibuka di browser
2. Pastikan link pakai https://
3. Cek tidak ada typo di URL

---

## 📞 Butuh Bantuan?

Hubungi:
- Email: jentayubronto@gmail.com
- Instagram: @justjejee._

---

**Selamat menggunakan website portfolio baru Anda! 🎉**

*Website ini dibuat dengan React, Vite, dan Tailwind CSS - teknologi modern untuk performa maksimal!*
