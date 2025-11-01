# 🗄️ MongoDB Setup Guide

## 📋 Overview

Invoice system sekarang menggunakan **MongoDB** sebagai database dan kredensial admin disimpan di file **.env** untuk keamanan yang lebih baik.

## 🚀 Quick Start

### 1. Install MongoDB

**Pilih salah satu:**

#### Option A: MongoDB Local (macOS)
```bash
# Install via Homebrew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh
```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Kunjungi https://www.mongodb.com/cloud/atlas/register
2. Buat akun gratis
3. Create New Cluster (pilih FREE tier)
4. Tunggu cluster dibuat (2-5 menit)
5. Klik "Connect" → "Connect your application"
6. Copy connection string
7. Paste ke `.env` file

### 2. Konfigurasi .env

Edit file `.env` di root project:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/justjeje-portfolio
# Atau jika pakai Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/justjeje-portfolio

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=justjeje2025

# JWT Secret (ubah ini!)
JWT_SECRET=your-super-secret-key-change-this

# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Start Servers

Buka 2 terminal:

**Terminal 1 - Backend Server:**
```bash
npm run server
# Atau untuk auto-reload saat development:
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📁 Struktur Backend

```
justjeje-portfolio/
├── server.js              # Express server utama
├── .env                   # Environment variables (jangan di-commit!)
├── models/
│   └── Invoice.js         # MongoDB schema
├── routes/
│   ├── auth.js           # Login & authentication
│   └── invoices.js       # CRUD operations
```

## 🔐 Security Features

### 1. Environment Variables
Semua kredensial sekarang di `.env`:
- ✅ Admin username
- ✅ Admin password
- ✅ JWT secret key
- ✅ MongoDB connection string

### 2. JWT Authentication
- Token berlaku 7 hari
- Otomatis verify setiap request
- Secure token di localStorage

### 3. Protected Routes
- Dashboard: Perlu login
- Create/Edit Invoice: Perlu login
- View Invoice (public): Tidak perlu login ✅

## 🛠️ API Endpoints

### Authentication

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "justjeje2025"
}
```

**GET** `/api/auth/verify`
Headers: `Authorization: Bearer {token}`

### Invoices

**GET** `/api/invoices` - Get all (protected)
**GET** `/api/invoices/:id` - Get one (public)
**POST** `/api/invoices` - Create (protected)
**PUT** `/api/invoices/:id` - Update (protected)
**DELETE** `/api/invoices/:id` - Delete (protected)

## 🧪 Testing

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Just Jeje Invoice API is running",
  "mongodb": "Connected"
}
```

### 2. Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"justjeje2025"}'
```

## 🔧 Troubleshooting

### MongoDB Connection Error

**Problem**: `MongoServerError: Authentication failed`
**Solution**: Check `.env` credentials

**Problem**: `ECONNREFUSED` 
**Solution**: 
```bash
# Make sure MongoDB is running
brew services list
brew services start mongodb-community
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`
**Solution**:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Frontend Can't Connect

**Problem**: CORS or network error
**Solution**:
1. Check backend is running on port 5000
2. Check `.env.local` has correct API_URL
3. Restart both servers

## 📊 MongoDB Data Structure

### Invoice Collection
```javascript
{
  _id: ObjectId,
  invoiceNumber: "INV/2025/11/001",
  invoiceDate: ISODate,
  clientName: "Client Name",
  clientAddress: "Address",
  projectTitle: "Project Title",
  items: [{
    description: "Service",
    quantity: 1,
    price: 1000000
  }],
  subtotal: 1000000,
  total: 1000000,
  paymentStatus: "LUNAS|DP|BELUM LUNAS",
  dpAmount: 500000,
  notes: "Notes",
  signature: "base64 image",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🔄 Migration from localStorage

Jika sebelumnya pakai localStorage, data otomatis hilang. 
Untuk backup data lama:

```javascript
// Di browser console (sebelum update)
const backup = localStorage.getItem('justjeje_invoices');
console.log(backup); // Copy ini
```

Lalu import manual via admin panel.

## 🚀 Production Deployment

### Backend (Heroku/Railway)
1. Push code to Git
2. Add environment variables di dashboard
3. Deploy

### MongoDB (Atlas)
1. Whitelist deployment IP
2. Update `MONGODB_URI` dengan production string

### Frontend (Vercel/Netlify)
1. Update `VITE_API_URL` ke production backend URL
2. Deploy

## 📝 Notes

- **Default Credentials**: username=`admin`, password=`justjeje2025`
- **Change credentials** di `.env` file
- **JWT Secret**: Ganti dengan string random untuk production
- **MongoDB**: Bisa pakai local atau Atlas (cloud)
- **Backup**: Export dari MongoDB Compass atau mongodump

---

**Support**: Lihat `INVOICE_README.md` untuk dokumentasi lengkap
