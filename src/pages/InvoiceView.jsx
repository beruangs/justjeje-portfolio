import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { invoiceAPI, formatCurrency, getShareableLink } from '../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

const InvoiceView = () => {
  const { id: invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const componentRef = useRef();

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceAPI.getById(invoiceId);

      if (response.success) {
        setInvoice(response.data);
      } else {
        setError(response.message || 'Invoice tidak ditemukan!');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);

      // Check if it's a network error or API error
      if (error.response) {
        // API returned an error response
        setError(error.response.data?.message || 'Invoice tidak ditemukan');
      } else if (error.request) {
        // Network error - request made but no response
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${invoice?.invoiceNumber}`,
  });

  const handleCopyLink = () => {
    const link = getShareableLink(invoiceId);
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Invoice tidak ditemukan</div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      'LUNAS': { bg: 'bg-green-500', text: 'LUNAS' },
      'DP': { bg: 'bg-yellow-500', text: `DP - ${formatCurrency(invoice.dpAmount)}` },
      'BELUM LUNAS': { bg: 'bg-red-500', text: 'BELUM LUNAS' }
    };
    return statusConfig[invoice.paymentStatus] || statusConfig['BELUM LUNAS'];
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-[#111827] py-8 text-gray-100">
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto px-4 mb-4 print:hidden">
        <div className="flex gap-4 justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {copySuccess ? '✓ Link Disalin!' : 'Copy Link'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
            >
              🖨️ Print / Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto px-4">
        <div ref={componentRef} className="bg-white shadow-lg print:shadow-none">
          {/* Header dengan Logo Tokopedia Style */}
          <div className="p-8 border-b-2 border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#42b549' }}>
                  Just Jeje
                </h1>
                <p className="text-sm text-gray-600">Video Editor | Videographer | Filmmaker</p>
                <p className="text-sm text-gray-600 mt-1">Instagram: @justjeje</p>
              </div>
              <div className="text-right">
                <div className="inline-block border-4 border-red-500 px-6 py-2 mb-3">
                  <h2 className="text-2xl font-bold text-red-500">INVOICE</h2>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Penjual:</strong> Just Jeje Production</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">UNTUK</h3>
                <div className="text-gray-800">
                  <p className="font-semibold text-lg mb-1">{invoice.clientName}</p>
                  {invoice.clientAddress && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.clientAddress}</p>
                  )}
                  <p className="text-sm mt-2">
                    <strong>Project:</strong> {invoice.projectTitle}
                  </p>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Pembelian:</span>
                    <span className="font-semibold">
                      {format(new Date(invoice.invoiceDate), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                  </div>
                  {invoice.createdAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Terakhir diupdate:</span>
                      <span className="text-gray-500">
                        {format(new Date(invoice.updatedAt || invoice.createdAt), 'dd MMM yyyy HH:mm', { locale: id })} WIB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    INFO PRODUK
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    JUMLAH
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    HARGA SATUAN
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    TOTAL HARGA
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-700">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-96">
                <div className="bg-gray-50 p-4 rounded space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">SUBTOTAL HARGA BARANG</span>
                    <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {invoice.paymentStatus === 'DP' && (
                    <>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-700">DP YANG DIBAYAR</span>
                        <span className="font-semibold text-green-600">
                          -{formatCurrency(invoice.dpAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">SISA PEMBAYARAN</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(invoice.total - invoice.dpAmount)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
                    <span>TOTAL TAGIHAN</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div className="px-8 pb-6">
            <div className="flex justify-end">
              <div className={`${statusBadge.bg} text-white px-8 py-3 text-center rounded-lg shadow-lg`}>
                <div className="text-2xl font-bold tracking-wider">{statusBadge.text}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="px-8 pb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Catatan:</strong> {invoice.notes}
                </p>
              </div>
            </div>
          )}

          {/* Signature and Stamp */}
          <div className="p-8 border-t border-gray-200">
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-600">
                <p className="mb-1">Invoice ini sah dan diproses oleh komputer</p>
                <p>Silakan hubungi <strong>Just Jeje</strong> apabila kamu membutuhkan bantuan.</p>
              </div>

              {invoice.signature && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Hormat kami,</p>
                  <div className="relative inline-block">
                    <img
                      src={invoice.signature}
                      alt="Signature"
                      className="h-24 mb-2"
                    />
                    {/* Stempel */}
                    <div className="absolute -bottom-2 -right-2 w-24 h-24 border-4 border-red-500 rounded-full flex items-center justify-center transform rotate-12">
                      <div className="text-center">
                        <div className="text-xs font-bold text-red-500">JUST JEJE</div>
                        <div className="text-xs font-bold text-red-500">PRODUCTION</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mt-4">Just Jeje</p>
                  <p className="text-xs text-gray-500">Video Editor / Filmmaker</p>
                </div>
              )}
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none print:block hidden">
            <div className="text-9xl font-bold text-gray-400 rotate-[-45deg]">
              JUST JEJE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
