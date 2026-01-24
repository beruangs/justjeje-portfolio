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
    contentRef: componentRef,
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Memuat data invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-gray-800/50 p-10 rounded-3xl border border-gray-700 text-center max-w-md shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
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
    <div className="min-h-screen bg-[#0f172a] py-12 text-gray-100 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Action Buttons Container */}
      <div className="max-w-4xl mx-auto px-4 mb-8 print:hidden relative z-10">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl shadow-2xl">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all font-bold tracking-tight"
          >
            <div className="p-2 bg-gray-700/50 rounded-xl group-hover:bg-blue-600 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l-7-7m7 7h18" /></svg>
            </div>
            Kembali ke Dashboard
          </button>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 md:flex-none px-6 py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold transition-all shadow-lg border border-gray-600/50 flex items-center justify-center gap-2 group active:scale-95"
            >
              <svg className={`w-5 h-5 transition-all ${copySuccess ? 'text-green-400 scale-125' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copySuccess ? 'Link Disalin!' : 'Copy Share Link'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 group"
            >
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print / Simpan PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
        <div ref={componentRef} className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header dengan Logo Tokopedia Style */}
          <div className="p-8 border-b-2 border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <img
                  src="https://raw.githubusercontent.com/beruangs/justjeje-imagehost/refs/heads/master/_just-jeje%20%5BTransparent%5D%20-%20Normal%20Size.png"
                  alt="Just-Jeje Logo"
                  className="h-16 md:h-20 object-contain"
                />
              </div>
              <div className="text-right">
                <div className="inline-block border-4 border-red-500 px-6 py-2 mb-3">
                  <h2 className="text-2xl font-bold text-red-500">INVOICE</h2>
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  <p><strong>Penjual:</strong> Just-Jeje</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">UNTUK</h3>
                <div className="text-gray-900">
                  <p className="font-bold text-lg mb-1">{invoice.clientName}</p>
                  {invoice.clientAddress && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.clientAddress}</p>
                  )}
                  <p className="text-sm mt-2">
                    <strong>Project:</strong> {invoice.projectTitle}
                  </p>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Tanggal Pembelian</span>
                    <span className="font-bold text-gray-900">
                      {format(new Date(invoice.invoiceDate), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Invoice</span>
                    <span className="font-bold text-gray-900">{invoice.invoiceNumber}</span>
                  </div>
                  {invoice.createdAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Terakhir diupdate</span>
                      <span className="text-gray-500 text-xs">
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
                <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-100">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 font-bold text-xs uppercase tracking-wider">Subtotal</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {invoice.paymentStatus === 'DP' && (
                    <>
                      <div className="flex justify-between text-sm items-center border-t border-gray-200 pt-2">
                        <span className="text-gray-600 font-bold text-xs uppercase tracking-wider">DP Yang Dibayar</span>
                        <span className="font-bold text-green-600">
                          -{formatCurrency(invoice.dpAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600 font-bold text-xs uppercase tracking-wider">Sisa Pembayaran</span>
                        <span className="font-bold text-red-600 text-lg">
                          {formatCurrency(invoice.total - invoice.dpAmount)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3 mt-2">
                    <span className="text-gray-900 font-black text-sm uppercase tracking-wider">Total Tagihan</span>
                    <span className="text-blue-600 font-black text-2xl">{formatCurrency(invoice.total)}</span>
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

          {/* Watermark Page 1 */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none print:block hidden">
            <div className="text-9xl font-bold text-gray-400 rotate-[-45deg]">
              JUST-JEJE
            </div>
          </div>

          {/* PAGE BREAK FOR PRINT */}
          <div className="print-page-break" style={{ pageBreakBefore: 'always', borderTop: '1px dashed #eee', marginTop: '40px' }}></div>

          {/* PAGE 2: PAYMENT & GUIDE */}
          <div className="p-12 bg-white min-h-[1000px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Metode Pembayaran */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 inline-block">Metode Pembayaran</h3>

                  <div className="space-y-6">
                    {/* QRIS */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/QRIS_logo.svg/1200px-QRIS_logo.svg.png" className="h-8" alt="QRIS" />
                      <div>
                        <p className="font-bold text-gray-400">QRIS (Coming Soon)</p>
                      </div>
                    </div>

                    {/* SeaBank */}
                    <div className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SeaBank_logo.svg/1200px-SeaBank_logo.svg.png" className="h-5" alt="SeaBank" />
                        <span className="font-black text-orange-600 uppercase tracking-tighter text-[10px]">TRANSFER BANK</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-[9px]">No. Rekening</p>
                        <p className="text-xl font-mono font-black text-gray-900 tracking-tighter">9015 6421 4938</p>
                        <p className="text-gray-700 font-bold">A.N. Janoko Jentayubronto</p>
                      </div>
                    </div>

                    {/* Bank Jago */}
                    <div className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Bank_Jago_logo.svg/1200px-Bank_Jago_logo.svg.png" className="h-4" alt="Bank Jago" />
                        <span className="font-black text-orange-600 uppercase tracking-tighter text-[10px]">TRANSFER BANK</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-[9px]">No. Rekening</p>
                        <p className="text-xl font-mono font-black text-gray-900 tracking-tighter">1055 7913 5054</p>
                        <p className="text-gray-700 font-bold">A.N. Janoko Jentayubronto</p>
                      </div>
                    </div>

                    {/* GoPay */}
                    <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/1200px-Gopay_logo.svg.png" className="h-5" alt="GoPay" />
                        <span className="font-black text-blue-600 uppercase tracking-tighter text-[10px]">E-WALLET</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-[9px]">No. Handphone</p>
                        <p className="text-xl font-mono font-black text-gray-900 tracking-tighter">0857 1702 6860</p>
                        <p className="text-gray-700 font-bold">A.N. Jeje</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cara Bayar */}
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-6 border-b-4 border-green-600 inline-block">Cara Bayar</h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Pilih Metode', text: 'Pilih salah satu metode pembayaran di samping.' },
                    { step: '2', title: 'Lakukan Transfer', text: 'Transfer sesuai dengan nominal "Total Tagihan" di halaman pertama.' },
                    { step: '3', title: 'Simpan Bukti', text: 'Pastikan simpan tangkapan layar (screenshot) bukti transfer.' },
                    { step: '4', title: 'Konfirmasi', text: 'Kirimkan bukti bayar melalui WhatsApp ke nomor Jeje untuk verifikasi.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-none w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-black">{item.step}</div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-xs tracking-widest mb-1">{item.title}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-12 p-6 bg-green-50 rounded-3xl border border-green-100">
                    <p className="text-green-800 text-sm font-bold text-center">Terima kasih atas kepercayaan Anda menggunakan jasa Just-Jeje!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
