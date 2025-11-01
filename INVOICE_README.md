# 📋 Invoice System - Just Jeje Portfolio

Sistem invoice digital untuk video editor/videographer/filmmaker yang terintegrasi dengan website portofolio.

## ✨ Fitur Utama

### 🔐 Admin Panel (Protected)
- **Login System**: Password protection untuk akses admin
- **Dashboard**: Overview semua invoice dengan statistik
- **CRUD Invoice**: Create, Read, Update, Delete invoice
- **Status Pembayaran**: 
  - ✅ LUNAS (Fully Paid)
  - 💰 DP (Down Payment) dengan nominal
  - ⏳ BELUM LUNAS (Unpaid)

### 📄 Invoice Features
- **Professional Design**: Desain invoice mirip Tokopedia
- **Auto Generate**: Invoice number otomatis
- **Client Information**: Nama client, alamat, project title
- **Multiple Items**: Support multiple items/layanan
- **Calculation**: Otomatis hitung subtotal dan total
- **Digital Signature**: Tanda tangan digital dengan signature pad
- **Auto Stamp**: Stempel digital otomatis muncul
- **Print/PDF**: Export ke PDF atau print langsung
- **Shareable Link**: Link public untuk share ke client

### 🎨 Invoice Template
- Header dengan branding "Just Jeje"
- Informasi client dan project
- Tabel items dengan quantity dan harga
- Status pembayaran dengan badge berwarna
- Signature dan stempel digital
- Footer dengan informasi kontak

## 🚀 Cara Menggunakan

### 1. Akses Admin Panel

Ada 2 cara untuk akses admin panel:

**Cara 1: Keyboard Shortcut (Easter Egg)**
- Dari halaman utama, tekan `Ctrl + Shift + A`
- Akan langsung redirect ke halaman login admin

**Cara 2: Direct URL**
- Buka browser dan ketik: `http://localhost:5173/admin/login`

### 2. Login
- **Default Password**: `justjeje2025`
- Password bisa diubah di file: `src/context/AuthContext.jsx` (baris 24)

### 3. Membuat Invoice Baru
1. Klik tombol **"+ Buat Invoice Baru"** di dashboard
2. Isi informasi invoice:
   - Nomor invoice (auto-generate)
   - Tanggal invoice
   - Nama client
   - Alamat client
   - Judul project
3. Tambahkan items/layanan:
   - Deskripsi (misal: Video Editing + Color Grading)
   - Quantity
   - Harga satuan
4. Pilih status pembayaran:
   - **BELUM LUNAS**: Belum ada pembayaran
   - **DP**: Sudah bayar sebagian (isi jumlah DP)
   - **LUNAS**: Sudah lunas semua
5. Tambahkan catatan (opsional)
6. Buat tanda tangan digital
7. Klik **"Simpan Invoice"**

### 4. Mengelola Invoice
- **Lihat**: Klik tombol "Lihat" untuk preview invoice
- **Edit**: Klik tombol "Edit" untuk ubah data invoice
- **Hapus**: Klik tombol "Hapus" untuk delete invoice
- **Search**: Gunakan search bar untuk cari invoice

### 5. Share Invoice ke Client
1. Buka invoice yang ingin dishare
2. Klik tombol **"Copy Link"**
3. Share link tersebut ke client
4. Client bisa lihat invoice tanpa perlu login

### 6. Print/Download PDF
1. Buka invoice
2. Klik tombol **"🖨️ Print / Download PDF"**
3. Browser akan membuka print dialog
4. Pilih:
   - **Print**: Langsung print
   - **Save as PDF**: Download sebagai PDF

## 📁 Struktur File

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication context
├── pages/
│   ├── AdminLogin.jsx            # Halaman login admin
│   ├── AdminDashboard.jsx        # Dashboard admin
│   ├── InvoiceForm.jsx           # Form create/edit invoice
│   └── InvoiceView.jsx           # Preview & print invoice
├── components/
│   ├── ProtectedRoute.jsx        # Protected route wrapper
│   └── SignaturePad.jsx          # Signature pad component
└── utils/
    └── invoiceStorage.js         # Invoice CRUD functions
```

## 🎯 Routes

| Path | Deskripsi | Protection |
|------|-----------|------------|
| `/admin/login` | Halaman login admin | Public |
| `/admin/dashboard` | Dashboard admin | Protected |
| `/admin/invoice/new` | Buat invoice baru | Protected |
| `/admin/invoice/edit/:id` | Edit invoice | Protected |
| `/invoice/:id` | View invoice (public) | Public |

## 🔧 Konfigurasi

### Ubah Password Admin
Edit file `src/context/AuthContext.jsx`:
```javascript
const ADMIN_PASSWORD = 'justjeje2025'; // Ganti dengan password baru
```

### Ubah Branding Invoice
Edit file `src/pages/InvoiceView.jsx`:
- Baris 95-100: Nama brand dan tagline
- Baris 101: Instagram handle
- Baris 105: Info penjual

## 💾 Storage

Invoice disimpan di **localStorage** browser dengan key: `justjeje_invoices`

**Note**: Data akan hilang jika:
- Browser cache dibersihkan
- LocalStorage dihapus manual

Untuk production, disarankan menggunakan backend database.

## 🎨 Customization

### Warna Status Badge
Edit `src/utils/invoiceStorage.js` function `getPaymentStatusColor()`:
```javascript
'LUNAS': 'bg-green-500'      // Hijau
'DP': 'bg-yellow-500'         // Kuning
'BELUM LUNAS': 'bg-red-500'   // Merah
```

### Format Mata Uang
Default: IDR (Indonesian Rupiah)
Edit `src/utils/invoiceStorage.js` function `formatCurrency()` untuk ubah currency.

## 📝 Tips & Tricks

1. **Backup Invoice**: Export all invoices dari localStorage:
   ```javascript
   // Di browser console
   localStorage.getItem('justjeje_invoices')
   ```

2. **Import Invoice**: Restore dari backup:
   ```javascript
   // Di browser console
   localStorage.setItem('justjeje_invoices', 'YOUR_BACKUP_DATA')
   ```

3. **Auto Invoice Number**: Format default: `INV/YYYY/MM/TIMESTAMP`
   Customize di `src/utils/invoiceStorage.js`

4. **Signature Tips**: 
   - Gunakan mouse/trackpad untuk tanda tangan yang halus
   - Klik "Hapus" untuk reset dan coba lagi
   - Signature akan tersimpan sebagai image PNG

## 🐛 Troubleshooting

**Q: Tidak bisa login admin?**
- Pastikan password benar (default: `justjeje2025`)
- Check caps lock
- Clear browser cache dan coba lagi

**Q: Invoice tidak muncul di dashboard?**
- Refresh halaman
- Check localStorage: `localStorage.getItem('justjeje_invoices')`

**Q: Tanda tangan tidak muncul di print?**
- Pastikan sudah klik "Simpan Tanda Tangan" sebelum save invoice
- Reload halaman invoice dan coba print lagi

**Q: Link share tidak bisa dibuka?**
- Pastikan invoice masih ada (belum dihapus)
- Copy link dengan benar
- Coba buka di incognito/private mode

## 📦 Dependencies

```json
{
  "react-to-print": "Print invoice to PDF",
  "react-signature-canvas": "Digital signature pad",
  "html2canvas": "Canvas rendering",
  "date-fns": "Date formatting"
}
```

## 🚀 Production Deployment

Untuk deploy ke production:

1. **Build project**:
   ```bash
   npm run build
   ```

2. **Deploy** ke hosting pilihan (Vercel, Netlify, dll)

3. **Security Enhancement**:
   - Ganti password default
   - Implementasi proper authentication dengan backend
   - Gunakan database untuk storage
   - Add SSL certificate

## 📞 Support

Jika ada pertanyaan atau issue, silakan contact:
- Instagram: @justjeje
- Email: (tambahkan email Anda)

---

**Made with ❤️ for Just Jeje Portfolio**
