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

// GET invoices (Public for single ID via query, Protected for all)
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      // Single ID fetch (Public)
      const invoice = await Invoice.findById(id);
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
      return res.json({ success: true, data: invoice });
    }

    // Protected: Get all (Requires valid token)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');

    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data' });
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

// PUT update invoice (query param)
router.put('/', authMiddleware, async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'ID required' });

  try {
    const invoiceData = req.body;
    // Recalculate totals
    if (invoiceData.items) {
      const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      invoiceData.subtotal = subtotal;
      invoiceData.total = subtotal;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, invoiceData, { new: true, runValidators: true });
    if (!updatedInvoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });

    res.json({ success: true, message: 'Invoice berhasil diupdate', data: updatedInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengupdate invoice', error: error.message });
  }
});

// PUT update invoice (path param)
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

// DELETE invoice (query param)
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID required' });

    // Try delete by ObjectId (standard) or string ID (legacy)
    // Note: Mongoose findByIdAndDelete expects ObjectId usually, but flexibility depends on schema.
    // Assuming Invoice schema uses standard ObjectId _id.
    // If we have custom string IDs in invoices too, use deleteOne.

    // For safety with Mongoose:
    let deletedInvoice;
    if (Invoice.schema.paths._id.instance === 'ObjectID') {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deletedInvoice = await Invoice.findByIdAndDelete(id);
      } else {
        // If schema is ObjectId but ID is string, it won't match anyway unless we customized _id.
        // Fallback just in case client sent bad ID
        return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan (Invalid ID)' });
      }
    } else {
      deletedInvoice = await Invoice.findByIdAndDelete(id);
    }

    if (!deletedInvoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });

    res.json({ success: true, message: 'Invoice berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus invoice' });
  }
});

// DELETE invoice (path param)
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
