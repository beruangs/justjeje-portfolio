# 🔧 Troubleshooting Deployment Vercel

## Masalah: Website Blank Putih Setelah Deploy

### ✅ Langkah Pengecekan

#### 1. **Cek Browser Console**
- Buka website yang di-deploy
- Tekan `F12` atau `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Lihat tab **Console** untuk error messages
- Lihat tab **Network** untuk melihat file mana yang gagal dimuat

#### 2. **Cek Vercel Build Logs**
- Login ke [Vercel Dashboard](https://vercel.com)
- Pilih project Anda
- Klik tab **Deployments**
- Klik deployment terakhir
- Lihat **Build Logs** untuk error

#### 3. **Verifikasi Environment Variables**
Pastikan semua environment variables sudah di-set di Vercel:

**Settings → Environment Variables**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
ADMIN_USERNAME=admin
ADMIN_PASSWORD=justjeje2025
JWT_SECRET=a9255c9c4bd4da07666c42368313f51f8f826997d2f72e9a94bd765d30ddaaa22bc325acf924419dc8cc5e6e416f2a23a84cc99e0e5387d1a9ddaafc90e1a626
NODE_ENV=production
```

**PENTING:** Environment variables harus diset untuk **Production**, **Preview**, dan **Development**

#### 4. **Test Static Files**
Coba akses: `https://your-domain.vercel.app/vercel-debug.html`

Jika halaman ini muncul → Static files OK ✅  
Jika tidak muncul → Ada masalah di build configuration ❌

#### 5. **Verifikasi Build Settings**
Di Vercel Dashboard → Settings → General:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` atau `vite build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 18.x atau 20.x

---

## 🐛 Error Umum & Solusinya

### Error 1: "Failed to load module script"
**Penyebab:** Path assets salah atau CORS issue

**Solusi:**
```bash
# Rebuild dan redeploy
npm run build
git add .
git commit -m "Fix: Update vercel config"
git push
```

### Error 2: "Cannot read properties of undefined"
**Penyebab:** Environment variables tidak terbaca

**Solusi:**
1. Cek `.env` di local vs Environment Variables di Vercel
2. Pastikan nama variabelnya sama persis
3. Redeploy setelah update environment variables

### Error 3: Blank putih tanpa error di console
**Penyebab:** React Router issue atau base path salah

**Solusi:**
Cek `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // ← Pastikan ini '/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
```

### Error 4: 404 Not Found saat refresh page
**Penyebab:** SPA routing tidak dikonfigurasi

**Solusi:** Sudah dihandle oleh `vercel.json` dengan rewrites

---

## 🔍 Debugging Advanced

### Cek Vercel Function Logs (untuk API)
1. Buka Vercel Dashboard
2. Pilih project → **Functions** tab
3. Klik function yang ingin dicek (e.g., `/api/auth`)
4. Lihat **Invocations** dan **Logs**

### Test API Endpoints Manual
```bash
# Test health check
curl https://your-domain.vercel.app/api/health

# Expected response:
# {"status":"ok","message":"Invoice API is running","mongodb":"Connected"}

# Test login
curl -X POST https://your-domain.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"justjeje2025"}'
```

### Cek MongoDB Connection
1. Login ke [MongoDB Atlas](https://cloud.mongodb.com)
2. Pilih cluster Anda
3. **Network Access** → Pastikan IP `0.0.0.0/0` ada (allow all)
4. **Database Access** → Pastikan user sudah dibuat dengan password benar
5. Copy connection string dan pastikan sama dengan `MONGODB_URI` di Vercel

---

## 🚀 Force Redeploy

Jika semua sudah benar tapi masih blank:

```bash
# 1. Clear local build
rm -rf dist node_modules

# 2. Fresh install
npm install

# 3. Test build lokal
npm run build
npm run preview  # Buka http://localhost:4173

# 4. Jika lokal OK, commit & push
git add .
git commit -m "Force rebuild"
git push

# 5. Atau trigger redeploy manual di Vercel Dashboard
# Deployments → Latest → ⋮ Menu → Redeploy
```

---

## 📞 Masih Bermasalah?

### Cek Vercel Status
- https://www.vercel-status.com/

### Share Error Details
Kumpulkan informasi ini:
1. Screenshot browser console (F12 → Console tab)
2. Screenshot Vercel build logs
3. Screenshot Network tab (saat page load)
4. URL website yang di-deploy
5. Error message lengkap

---

## ✅ Checklist Deployment

- [ ] `npm run build` berhasil lokal
- [ ] `npm run preview` berfungsi di http://localhost:4173
- [ ] `vercel.json` sudah ada dan benar
- [ ] Environment variables sudah di-set di Vercel
- [ ] MongoDB Atlas whitelist IP 0.0.0.0/0
- [ ] Build settings di Vercel sudah benar
- [ ] Deploy tanpa error di build logs
- [ ] Test `/vercel-debug.html` berhasil dimuat
- [ ] Browser console tidak ada error merah
- [ ] Network tab semua file loaded (status 200)

---

**Last Updated:** November 2025
