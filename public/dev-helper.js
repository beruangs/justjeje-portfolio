// Quick Access Functions untuk Development
// Copy-paste ke browser console untuk quick actions

// 1. Quick Login - Langsung ke admin panel
function quickAdmin() {
  window.location.href = '/admin/login';
  console.log('🔐 Redirecting to admin login...');
  console.log('Password: justjeje2025');
}

// 2. View all invoices data
function viewInvoices() {
  const invoices = JSON.parse(localStorage.getItem('justjeje_invoices') || '[]');
  console.table(invoices);
  return invoices;
}

// 3. Clear all invoices
function clearInvoices() {
  if (confirm('Yakin ingin hapus semua invoice?')) {
    localStorage.removeItem('justjeje_invoices');
    localStorage.removeItem('demo_invoice_seeded');
    console.log('✅ Semua invoice dihapus!');
    window.location.reload();
  }
}

// 4. Reset demo invoice
function resetDemo() {
  localStorage.removeItem('demo_invoice_seeded');
  console.log('✅ Demo akan dibuat ulang saat refresh');
  window.location.reload();
}

// 5. Export invoices to JSON
function exportInvoices() {
  const invoices = localStorage.getItem('justjeje_invoices');
  const blob = new Blob([invoices], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoices-backup-${Date.now()}.json`;
  a.click();
  console.log('✅ Invoices exported!');
}

// 6. Import invoices from JSON string
function importInvoices(jsonString) {
  try {
    JSON.parse(jsonString); // Validate JSON
    localStorage.setItem('justjeje_invoices', jsonString);
    console.log('✅ Invoices imported!');
    window.location.reload();
  } catch (e) {
    console.error('❌ Invalid JSON format');
  }
}

// Display available commands
console.log(`
🎬 Just Jeje Invoice System - Quick Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Available Commands:
  quickAdmin()           - Go to admin login page
  viewInvoices()         - View all invoices in console
  clearInvoices()        - Delete all invoices
  resetDemo()            - Reset demo invoice
  exportInvoices()       - Download invoices as JSON
  importInvoices(json)   - Import invoices from JSON

🔑 Admin Access:
  - Press Ctrl+Shift+A from homepage
  - Or visit: /admin/login
  - Password: justjeje2025

💾 Storage Key: justjeje_invoices

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Make functions available globally
window.quickAdmin = quickAdmin;
window.viewInvoices = viewInvoices;
window.clearInvoices = clearInvoices;
window.resetDemo = resetDemo;
window.exportInvoices = exportInvoices;
window.importInvoices = importInvoices;
