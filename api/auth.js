import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username dan password harus diisi' 
        });
      }

      const validUsername = process.env.ADMIN_USERNAME || 'admin';
      const validPassword = process.env.ADMIN_PASSWORD || 'justjeje2025';

      if (username !== validUsername || password !== validPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Username atau password salah!' 
        });
      }

      const token = jwt.sign(
        { username: validUsername, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({ 
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
  } else if (req.method === 'GET') {
    // Verify token
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token tidak ditemukan' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      res.status(200).json({ 
        success: true, 
        user: decoded 
      });
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: 'Token tidak valid' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
