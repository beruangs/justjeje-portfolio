# 🚀 Quick Start - Just Jeje Invoice System

## 📦 Installation

```bash
npm install
```

## ▶️ Running the Application

### Development Mode (2 Terminals Required)

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: Tekan `Ctrl + Shift + A` dari homepage

## 🔐 Default Login

```
Username: admin
Password: justjeje2025
```

> **Ubah di file `.env`**

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (Vite) |
| `npm run server` | Start backend (Express) |
| `npm run server:dev` | Start backend with auto-reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## ⚙️ Configuration

### 1. MongoDB Setup

**Option A: Local**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Option B: Atlas (Cloud)**
- Daftar di https://mongodb.com/cloud/atlas
- Create free cluster
- Update `.env` dengan connection string

### 2. Environment Variables

Edit file `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/justjeje-portfolio
ADMIN_USERNAME=admin
ADMIN_PASSWORD=justjeje2025
JWT_SECRET=change-this-secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

## 📚 Documentation

- **Setup Guide**: `MONGODB_SETUP.md`
- **User Guide**: `PANDUAN_INVOICE.md`
- **Full Documentation**: `INVOICE_README.md`
- **Migration Guide**: `MONGODB_MIGRATION_COMPLETE.md`

## 🔧 Troubleshooting

### MongoDB Won't Connect
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Can't Login
1. Check `.env` credentials
2. Restart backend server
3. Clear browser cache

## 🎯 Quick Test

```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","message":"Just Jeje Invoice API is running","mongodb":"Connected"}
```

## 📱 Features

- ✅ Invoice CRUD dengan MongoDB
- ✅ Admin panel dengan JWT auth
- ✅ Digital signature
- ✅ Auto stempel
- ✅ Print/PDF export
- ✅ Share invoice link
- ✅ Payment status tracking

---

**Support**: Lihat file dokumentasi untuk detail lengkap
