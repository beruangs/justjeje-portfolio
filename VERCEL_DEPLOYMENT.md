# 🚀 Vercel Deployment Guide - Just Jeje Invoice System

## 📋 Persiapan

### 1. MongoDB Atlas (Cloud Database)

Karena Vercel tidak support database persistent, Anda perlu MongoDB Atlas (GRATIS):

1. **Daftar MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Create FREE Cluster**:
   - Pilih provider: AWS / Google Cloud / Azure
   - Region: Singapore atau yang terdekat
   - Cluster Tier: M0 Sandbox (FREE)
3. **Create Database User**:
   - Database Access → Add New Database User
   - Username: `justjeje`
   - Password: (generate strong password)
   - Database User Privileges: Read and write to any database
4. **Whitelist IP**:
   - Network Access → Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0` (untuk Vercel)
5. **Get Connection String**:
   - Cluster → Connect → Connect your application
   - Copy connection string:
     ```
     mongodb+srv://justjeje:<password>@cluster.mongodb.net/justjeje-portfolio
     ```
   - Ganti `<password>` dengan password user Anda

## 🚀 Deploy ke Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel serverless functions"
   git push origin main
   ```

2. **Import ke Vercel**:
   - Login ke https://vercel.com
   - Click "Add New" → "Project"
   - Import repository GitHub Anda
   - Framework Preset: **Vite**
   - Root Directory: `./`

3. **Configure Environment Variables**:
   
   Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/justjeje-portfolio` | Production |
   | `ADMIN_USERNAME` | `admin` (atau ubah) | Production |
   | `ADMIN_PASSWORD` | `your-secure-password` | Production |
   | `JWT_SECRET` | `your-jwt-secret-from-env` | Production |
   | `NODE_ENV` | `production` | Production |

4. **Deploy**:
   - Click "Deploy"
   - Tunggu build selesai (~2 menit)
   - Vercel akan memberikan URL: `https://your-app.vercel.app`

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add JWT_SECRET

# Deploy to production
vercel --prod
```

## ⚙️ Konfigurasi

### Build Settings di Vercel

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables yang Wajib

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/justjeje-portfolio
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ganti-password-ini
JWT_SECRET=your-super-secret-jwt-key-64-characters-long
NODE_ENV=production
```

## 🔧 Cara Kerja di Vercel

### Serverless Functions

Vercel menggunakan **Serverless Functions** di folder `/api`:

```
api/
├── health.js      → GET  /api/health
├── auth.js        → POST /api/auth (login)
│                  → GET  /api/auth (verify)
└── invoices.js    → GET  /api/invoices (get all)
                   → GET  /api/invoices?id=xxx (get one)
                   → POST /api/invoices (create)
                   → PUT  /api/invoices?id=xxx (update)
                   → DEL  /api/invoices?id=xxx (delete)
```

### Auto-scaling & Cold Starts

- Vercel auto-scale sesuai traffic
- Cold start pertama ~1-2 detik (normal)
- Setelah itu cepat (~50-200ms)

## 🧪 Testing Production

### 1. Test Health Check
```bash
curl https://your-app.vercel.app/api/health
```

Expected:
```json
{
  "status": "OK",
  "message": "Just Jeje Invoice API is running",
  "mongodb": "Connected"
}
```

### 2. Test Login
```bash
curl -X POST https://your-app.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### 3. Access Admin Panel
- URL: `https://your-app.vercel.app`
- Tekan `Ctrl + Shift + A`
- Login dengan credentials Anda

## 🔐 Security Best Practices

### 1. Ganti Password Default

Di Vercel Dashboard → Environment Variables:
```
ADMIN_PASSWORD=password-yang-kuat-123!@#
```

Lalu redeploy:
```bash
vercel --prod
```

### 2. Regenerate JWT Secret

```bash
# Generate new secret
node -p "require('crypto').randomBytes(64).toString('hex')"
```

Update di Vercel Environment Variables.

### 3. MongoDB Security

- ✅ Enable IP Whitelist (0.0.0.0/0 untuk Vercel)
- ✅ Strong password untuk database user
- ✅ Read/Write privileges only (bukan admin)

## 📊 Monitoring

### Vercel Analytics
- Dashboard → Analytics
- Monitor page views, performance, errors

### MongoDB Atlas
- Atlas Dashboard → Metrics
- Monitor database queries, connections

## 🐛 Troubleshooting

### Error: "Database connection failed"

**Solution**:
1. Check MongoDB URI di Environment Variables
2. Check IP whitelist (0.0.0.0/0)
3. Check database user credentials
4. Test connection dari MongoDB Compass

### Error: "Login failed" / "Token invalid"

**Solution**:
1. Check ADMIN_USERNAME & ADMIN_PASSWORD
2. Check JWT_SECRET ada di Environment Variables
3. Clear browser cache & cookies
4. Redeploy: `vercel --prod`

### Serverless Function Timeout

**Solution**:
- Vercel free tier: 10 second timeout
- Upgrade ke Pro jika perlu timeout lebih lama

### Cold Start Lambat

**Solution**:
- Normal untuk first request (~1-2 detik)
- Subsequent requests lebih cepat
- Vercel Pro: Faster cold starts

## 🔄 Update & Redeploy

### Auto Deploy (Recommended)

Setiap push ke GitHub branch `main` akan otomatis deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy

```bash
vercel --prod
```

## 💰 Costs

### Free Tier Limits
- ✅ 100 GB Bandwidth/month
- ✅ Unlimited deployments
- ✅ 100 GB-hours serverless execution
- ✅ Custom domain

### MongoDB Atlas Free (M0)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Cukup untuk ~1000 invoices

**Total: 100% FREE!** 🎉

## 📝 Custom Domain (Optional)

### Add Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add domain: `invoice.yourdomain.com`
3. Update DNS records sesuai instruksi
4. Tunggu verification (~5-10 menit)
5. Auto SSL certificate dari Vercel

## ✅ Checklist Deployment

- [ ] MongoDB Atlas cluster created
- [ ] Database user created dengan password kuat
- [ ] IP whitelist: 0.0.0.0/0
- [ ] Connection string tested
- [ ] Code pushed ke GitHub
- [ ] Vercel project imported
- [ ] Environment variables configured:
  - [ ] MONGODB_URI
  - [ ] ADMIN_USERNAME  
  - [ ] ADMIN_PASSWORD
  - [ ] JWT_SECRET
  - [ ] NODE_ENV
- [ ] First deployment success
- [ ] Test health endpoint
- [ ] Test login
- [ ] Create test invoice
- [ ] Share invoice link works

## 🎯 Production URLs

After deployment:
- **Website**: `https://your-app.vercel.app`
- **API Health**: `https://your-app.vercel.app/api/health`
- **Admin Login**: `https://your-app.vercel.app/admin/login`
  - Atau tekan `Ctrl + Shift + A` dari homepage

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
