import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('justjeje-portfolio');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    throw new Error('Unauthorized');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const invoices = db.collection('invoices');
    const { id } = req.query;

    // GET all invoices (protected)
    if (req.method === 'GET' && !id) {
      try {
        verifyToken(req);
        const allInvoices = await invoices.find({}).sort({ createdAt: -1 }).toArray();
        
        const formatted = allInvoices.map(inv => ({
          ...inv,
          id: inv._id.toString(),
          _id: undefined
        }));
        
        res.status(200).json({ 
          success: true, 
          data: formatted 
        });
      } catch (error) {
        res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
    }
    
    // GET single invoice (public)
    else if (req.method === 'GET' && id) {
      try {
        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Format ID invoice tidak valid' 
          });
        }

        const invoice = await invoices.findOne({ _id: new ObjectId(id) });
        
        if (!invoice) {
          return res.status(404).json({ 
            success: false, 
            message: 'Invoice tidak ditemukan' 
          });
        }

        res.status(200).json({ 
          success: true, 
          data: {
            ...invoice,
            id: invoice._id.toString(),
            _id: undefined
          }
        });
      } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Gagal memuat invoice: ' + error.message 
        });
      }
    }
    
    // POST create invoice (protected)
    else if (req.method === 'POST') {
      try {
        verifyToken(req);
        
        const invoiceData = req.body;
        const subtotal = invoiceData.items.reduce((sum, item) => {
          return sum + (item.quantity * item.price);
        }, 0);

        const newInvoice = {
          ...invoiceData,
          subtotal,
          total: subtotal,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await invoices.insertOne(newInvoice);
        const created = await invoices.findOne({ _id: result.insertedId });

        res.status(201).json({ 
          success: true, 
          message: 'Invoice berhasil dibuat',
          data: {
            ...created,
            id: created._id.toString(),
            _id: undefined
          }
        });
      } catch (error) {
        if (error.message === 'Unauthorized') {
          res.status(401).json({ success: false, message: 'Unauthorized' });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Gagal membuat invoice',
            error: error.message 
          });
        }
      }
    }
    
    // PUT update invoice (protected)
    else if (req.method === 'PUT' && id) {
      try {
        verifyToken(req);
        
        const invoiceData = req.body;
        
        if (invoiceData.items) {
          const subtotal = invoiceData.items.reduce((sum, item) => {
            return sum + (item.quantity * item.price);
          }, 0);
          
          invoiceData.subtotal = subtotal;
          invoiceData.total = subtotal;
        }

        invoiceData.updatedAt = new Date();

        const result = await invoices.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: invoiceData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({ 
            success: false, 
            message: 'Invoice tidak ditemukan' 
          });
        }

        res.status(200).json({ 
          success: true, 
          message: 'Invoice berhasil diupdate',
          data: {
            ...result.value,
            id: result.value._id.toString(),
            _id: undefined
          }
        });
      } catch (error) {
        if (error.message === 'Unauthorized') {
          res.status(401).json({ success: false, message: 'Unauthorized' });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Gagal mengupdate invoice',
            error: error.message 
          });
        }
      }
    }
    
    // DELETE invoice (protected)
    else if (req.method === 'DELETE' && id) {
      try {
        verifyToken(req);
        
        const result = await invoices.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Invoice tidak ditemukan' 
          });
        }

        res.status(200).json({ 
          success: true, 
          message: 'Invoice berhasil dihapus' 
        });
      } catch (error) {
        if (error.message === 'Unauthorized') {
          res.status(401).json({ success: false, message: 'Unauthorized' });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Gagal menghapus invoice' 
          });
        }
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server',
      error: error.message 
    });
  }
}
