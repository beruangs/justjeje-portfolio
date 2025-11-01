import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username dan password harus diisi' 
      });
    }

    // Check credentials from environment variables
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'justjeje2025';

    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Username atau password salah!' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: validUsername, role: 'admin' },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      message: 'Login berhasil',
      token,
      user: { username: validUsername, role: 'admin' }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server' 
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token tidak ditemukan' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    
    res.json({ 
      success: true, 
      user: decoded 
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token tidak valid' 
    });
  }
});

export default router;
