// Invoice Storage Utility - LocalStorage based
const STORAGE_KEY = 'justjeje_invoices';

// Generate unique invoice ID
export const generateInvoiceId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

// Get all invoices
export const getInvoices = () => {
  const invoices = localStorage.getItem(STORAGE_KEY);
  return invoices ? JSON.parse(invoices) : [];
};

// Get single invoice by ID
export const getInvoiceById = (id) => {
  const invoices = getInvoices();
  return invoices.find(invoice => invoice.id === id);
};

// Save new invoice
export const saveInvoice = (invoice) => {
  const invoices = getInvoices();
  const newInvoice = {
    ...invoice,
    id: invoice.id || generateInvoiceId(),
    createdAt: invoice.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  invoices.push(newInvoice);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  return newInvoice;
};

// Update existing invoice
export const updateInvoice = (id, updatedData) => {
  const invoices = getInvoices();
  const index = invoices.findIndex(invoice => invoice.id === id);
  
  if (index !== -1) {
    invoices[index] = {
      ...invoices[index],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    return invoices[index];
  }
  return null;
};

// Delete invoice
export const deleteInvoice = (id) => {
  const invoices = getInvoices();
  const filtered = invoices.filter(invoice => invoice.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Format currency to IDR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);
  
  return {
    subtotal,
    total: subtotal,
  };
};

// Get payment status color
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'LUNAS':
      return 'bg-green-500';
    case 'DP':
      return 'bg-yellow-500';
    case 'BELUM LUNAS':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Get shareable link
export const getShareableLink = (invoiceId) => {
  return `${window.location.origin}/invoice/${invoiceId}`;
};
