import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceAPI, calculateInvoiceTotals, generateInvoiceNumber } from '../utils/api';
import SignaturePad from '../components/SignaturePad';
import { format } from 'date-fns';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    clientName: '',
    clientAddress: '',
    projectTitle: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    paymentStatus: 'BELUM LUNAS',
    dpAmount: 0,
    notes: '',
    signature: null,
  });

  const [totals, setTotals] = useState({ subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadInvoice();
    } else {
      // Generate invoice number untuk invoice baru
      const newInvoiceNumber = generateInvoiceNumber();
      setFormData(prev => ({ ...prev, invoiceNumber: newInvoiceNumber }));
    }
  }, [id, isEditMode]);

  const loadInvoice = async () => {
    try {
      const response = await invoiceAPI.getById(id);
      if (response.success) {
        const invoice = response.data;
        setFormData({
          ...invoice,
          invoiceDate: format(new Date(invoice.invoiceDate), 'yyyy-MM-dd'),
        });
      }
    } catch (error) {
      alert('Invoice tidak ditemukan!');
      navigate('/admin/dashboard');
    }
  };

  useEffect(() => {
    const calculated = calculateInvoiceTotals(formData.items);
    setTotals(calculated);
  }, [formData.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleSignatureSave = (signatureData) => {
    setFormData(prev => ({ ...prev, signature: signatureData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!formData.clientName || !formData.projectTitle) {
      alert('Mohon isi nama client dan judul project!');
      return;
    }

    setLoading(true);

    const invoiceData = {
      ...formData,
      invoiceDate: new Date(formData.invoiceDate).toISOString(),
      dpAmount: formData.paymentStatus === 'DP' ? parseFloat(formData.dpAmount) : 0,
    };

    try {
      if (isEditMode) {
        await invoiceAPI.update(id, invoiceData);
        alert('Invoice berhasil diupdate!');
      } else {
        await invoiceAPI.create(invoiceData);
        alert('Invoice berhasil dibuat!');
      }
      navigate('/admin/dashboard');
    } catch (error) {
      alert('Gagal menyimpan invoice: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Invoice' : 'Buat Invoice Baru'}
            </h1>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Kembali
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Invoice *
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Invoice *
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Informasi Client</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Client *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Client
                  </label>
                  <textarea
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Project *
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: Video Wedding Ceremony"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Item / Layanan</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  + Tambah Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Deskripsi</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contoh: Video Editing + Color Grading"
                        required
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-xs text-gray-600 mb-1">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="w-40">
                      <label className="block text-xs text-gray-600 mb-1">Harga (Rp)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="w-32 pt-6">
                      <div className="text-sm font-semibold">
                        Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                      </div>
                    </div>

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-6 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>Rp {totals.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Status Pembayaran</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BELUM LUNAS">BELUM LUNAS</option>
                    <option value="DP">DP (Down Payment)</option>
                    <option value="LUNAS">LUNAS</option>
                  </select>
                </div>

                {formData.paymentStatus === 'DP' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah DP (Rp)
                    </label>
                    <input
                      type="number"
                      name="dpAmount"
                      value={formData.dpAmount}
                      onChange={handleChange}
                      min="0"
                      max={totals.total}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Sisa: Rp {(totals.total - (formData.dpAmount || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan tambahan untuk invoice..."
              />
            </div>

            {/* Signature */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Tanda Tangan</h2>
              <SignaturePad onSave={handleSignatureSave} existingSignature={formData.signature} />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end border-t pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : (isEditMode ? 'Update Invoice' : 'Simpan Invoice')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
