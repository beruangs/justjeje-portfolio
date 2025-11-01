// Demo Invoice Data Generator
import { saveInvoice } from './invoiceStorage';

export const seedDemoInvoice = () => {
  const demoInvoiceKey = 'demo_invoice_seeded';
  
  // Check if demo already seeded
  if (localStorage.getItem(demoInvoiceKey)) {
    return;
  }

  // Create demo invoice
  const demoInvoice = {
    invoiceNumber: 'INV/2025/11/001',
    invoiceDate: new Date('2025-11-01').toISOString(),
    clientName: 'PT Digital Marketing Indonesia',
    clientAddress: 'Jl. Sudirman No. 123\nJakarta Selatan 12190',
    projectTitle: 'Video Company Profile 2025',
    items: [
      {
        description: 'Video Shooting (Full Day)',
        quantity: 2,
        price: 3000000
      },
      {
        description: 'Video Editing + Color Grading',
        quantity: 1,
        price: 5000000
      },
      {
        description: 'Motion Graphics & Animation',
        quantity: 1,
        price: 2500000
      }
    ],
    paymentStatus: 'DP',
    dpAmount: 5000000,
    total: 13500000,
    subtotal: 13500000,
    notes: 'Terima kasih atas kepercayaannya. Video akan diselesaikan maksimal 14 hari kerja.',
    signature: null, // Bisa ditambahkan signature nanti via edit
  };

  saveInvoice(demoInvoice);
  localStorage.setItem(demoInvoiceKey, 'true');
  
  console.log('✅ Demo invoice berhasil dibuat!');
};
