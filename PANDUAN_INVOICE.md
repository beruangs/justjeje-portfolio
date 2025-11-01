# 🎬 Panduan Cepat Invoice System

## 🔑 Cara Akses Admin

### Metode 1: Shortcut Keyboard (Rahasia!)
Dari halaman utama portfolio, tekan:
```
Ctrl + Shift + A
```
Akan langsung masuk ke halaman login admin.

### Metode 2: URL Langsung
Ketik di browser:
```
http://localhost:5173/admin/login
```

## 🔐 Login
**Password Default**: `justjeje2025`

> **Penting!** Ganti password di file `src/context/AuthContext.jsx` baris 24

## 📋 Cara Buat Invoice

1. **Login** ke admin panel
2. Klik tombol **"+ Buat Invoice Baru"**
3. **Isi data client**:
   - Nama client (wajib)
   - Alamat client
   - Judul project (wajib)
4. **Tambah item/layanan**:
   - Klik "+ Tambah Item" untuk item baru
   - Isi deskripsi, quantity, dan harga
   - Hapus item dengan klik tombol ✕
5. **Set status pembayaran**:
   - `BELUM LUNAS` = Belum bayar
   - `DP` = Sudah DP (isi nominal DP)
   - `LUNAS` = Sudah lunas semua
6. **Tanda tangan**:
   - Gambar tanda tangan di kotak
   - Klik "Simpan Tanda Tangan"
7. Klik **"Simpan Invoice"**

## 📤 Share Invoice ke Client

1. Buka invoice dari dashboard
2. Klik **"Copy Link"**
3. Share link ke client via WA/email
4. Client bisa lihat tanpa login!

## 🖨️ Print / Download PDF

1. Buka invoice
2. Klik **"🖨️ Print / Download PDF"**
3. Di print dialog:
   - **Destination**: Pilih "Save as PDF" untuk download
   - **Print**: Langsung print jika ada printer

## 🎨 Status Pembayaran

- 🔴 **BELUM LUNAS** - Badge merah
- 🟡 **DP - Rp XXX** - Badge kuning (tampil nominal DP)
- 🟢 **LUNAS** - Badge hijau

## 💡 Tips

- Invoice otomatis simpan di localStorage browser
- Backup invoice secara manual dari browser console jika perlu
- Demo invoice sudah otomatis dibuat saat pertama kali buka
- Tanda tangan akan muncul dengan stempel digital otomatis
- Design invoice mirip Tokopedia untuk profesionalitas

## 🔧 Quick Commands

### Lihat Demo Invoice
Setelah login, akan ada 1 demo invoice di dashboard. 
Bisa langsung edit atau hapus.

### Edit Invoice
Dari dashboard, klik tombol **"Edit"** di invoice yang mau diubah.

### Hapus Invoice
Dari dashboard, klik tombol **"Hapus"** (akan ada konfirmasi).

---

**Selamat Menggunakan! 🚀**

Untuk dokumentasi lengkap, lihat file `INVOICE_README.md`
