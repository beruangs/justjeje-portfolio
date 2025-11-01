import express from 'express';
import Invoice from '../models/Invoice.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware untuk autentikasi
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Token tidak ditemukan' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Token tidak valid' 
    });
  }
};

// GET all invoices (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: invoices 
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data invoice' 
    });
  }
});

// GET single invoice by ID (public - untuk shared link)
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice tidak ditemukan' 
      });
    }

    res.json({ 
      success: true, 
      data: invoice 
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data invoice' 
    });
  }
});

// POST create new invoice (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const invoiceData = req.body;

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    const newInvoice = new Invoice({
      ...invoiceData,
      subtotal,
      total: subtotal,
    });

    await newInvoice.save();

    res.status(201).json({ 
      success: true, 
      message: 'Invoice berhasil dibuat',
      data: newInvoice 
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal membuat invoice',
      error: error.message 
    });
  }
});

// PUT update invoice (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const invoiceData = req.body;

    // Recalculate totals
    if (invoiceData.items) {
      const subtotal = invoiceData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
      
      invoiceData.subtotal = subtotal;
      invoiceData.total = subtotal;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      invoiceData,
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice tidak ditemukan' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Invoice berhasil diupdate',
      data: updatedInvoice 
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengupdate invoice',
      error: error.message 
    });
  }
});

// DELETE invoice (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!deletedInvoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice tidak ditemukan' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Invoice berhasil dihapus' 
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus invoice' 
    });
  }
});

export default router;
