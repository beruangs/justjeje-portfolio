import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invoiceAPI, portfolioAPI, authAPI, formatCurrency, getPaymentStatusColor } from '../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

const AdminDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('invoices');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Project Form State
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    id: '',
    title: '',
    date: format(new Date(), 'MMMM d, yyyy', { locale: id }),
    category: 'film',
    thumbnail: '',
    photo1: '',
    photo2: '',
    photo3: '',
    youtubeUrl: '',
    description: '',
    pinned: 'no',
    projectInfo: {
      name: '',
      categoryFull: '',
      role: '',
      fest: ''
    }
  });

  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // Custom Confirm & Alert State
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, id: null, title: '' }); // type: 'invoice' | 'project'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // type: 'success' | 'error'

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(''); // Reset search when switching tabs
    if (activeTab === 'invoices') {
      loadInvoices();
    } else {
      loadProjects();
    }
  }, [activeTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceAPI.getAll();
      if (response.success) setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Gagal memuat invoice.');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.getAll();
      if (response.success) {
        // Helper to parse date (handles Indonesian months)
        const parseDate = (dateStr) => {
          if (!dateStr) return new Date(0);
          // If it's ISO string (createdAt)
          if (dateStr.includes('T') || dateStr instanceof Date) return new Date(dateStr);

          // Replace Indonesian months
          const months = {
            'Januari': 'January', 'Februari': 'February', 'Maret': 'March', 'April': 'April',
            'Mei': 'May', 'Juni': 'June', 'Juli': 'July', 'Agustus': 'August',
            'September': 'September', 'Oktober': 'October', 'November': 'November', 'Desember': 'December'
          };
          let engDateStr = dateStr;
          Object.keys(months).forEach(key => {
            engDateStr = engDateStr.replace(key, months[key]);
          });

          // Try parsing standard English date first (e.g. "May 8, 2025")
          let d = new Date(dateStr);
          if (!isNaN(d.getTime())) return d;

          // Try parsing replaced Indonsian string
          d = new Date(engDateStr);
          if (!isNaN(d.getTime())) return d;

          return new Date(0); // Fallback
        };

        const sorted = response.data.sort((a, b) => {
          // Robust sort: use parsed 'date' field manually entered by user as primary truth
          // 'createdAt' is secondary fallback (e.g. if date text is missing/invalid)
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);

          // If both have valid dates from text, compare them
          if (dateA.getTime() !== 0 && dateB.getTime() !== 0) {
            return dateB - dateA;
          }

          // Fallback to createdAt if one is invalid
          const createdA = new Date(a.createdAt || 0);
          const createdB = new Date(b.createdAt || 0);
          return createdB - createdA;
        });
        setProjects(sorted);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Gagal memuat portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto-generate ID from title if empty
      const projectData = { ...newProject };
      if (!projectData.id) {
        projectData.id = projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      // Cleanup empty fields
      if (!projectData.photo1) delete projectData.photo1;
      if (!projectData.photo2) delete projectData.photo2;
      if (!projectData.photo3) delete projectData.photo3;
      if (!projectData.youtubeUrl) delete projectData.youtubeUrl;

      const response = await portfolioAPI.create(projectData);
      if (response.success) {
        setShowAddProject(false);
        showToast('Project berhasil ditambahkan!');
        setNewProject({
          id: '',
          title: '',
          date: format(new Date(), 'MMMM d, yyyy', { locale: id }),
          category: 'film',
          thumbnail: '',
          photo1: '',
          photo2: '',
          photo3: '',
          youtubeUrl: '',
          description: '',
          pinned: 'no',
          projectInfo: {
            name: '',
            categoryFull: '',
            role: '',
            fest: ''
          }
        });
        loadProjects();
      }
    } catch (err) {
      showToast('Gagal menambah project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Hapus item portfolio ini?')) {
      try {
        const response = await portfolioAPI.delete(id);
        if (response.success) loadProjects();
      } catch (err) {
        alert('Gagal menghapus');
      }
    }
  };

  const handleOpenInvoiceModal = async (invoiceId = null) => {
    if (invoiceId) {
      // Edit Mode
      setLoading(true);
      try {
        const response = await invoiceAPI.getById(invoiceId);
        if (response.success) {
          // Format date for input
          const invoice = response.data;
          invoice.invoiceDate = format(new Date(invoice.invoiceDate), 'yyyy-MM-dd');
          setCurrentInvoice(invoice);
          setShowInvoiceModal(true);
        }
      } catch (err) {
        setError('Gagal memuat invoice');
      } finally {
        setLoading(false);
      }
    } else {
      // New Mode
      // Generate number logic handled in backend or initial state?
      // For now let's just open blank
      const { generateInvoiceNumber } = await import('../utils/api');
      setCurrentInvoice({
        invoiceNumber: generateInvoiceNumber(),
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
      setShowInvoiceModal(true);
    }
  };

  const openDeleteConfirm = (type, id, title) => {
    setConfirmState({ isOpen: true, type, id, title });
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setConfirmState(prev => ({ ...prev, isOpen: false })); // Close modal immediately to avoid stuck UI, loading handles overlay
    try {
      if (confirmState.type === 'project') {
        const response = await portfolioAPI.delete(confirmState.id);
        if (response.success) {
          loadProjects();
          showToast('Project berhasil dihapus');
        }
      } else if (confirmState.type === 'invoice') {
        const response = await invoiceAPI.delete(confirmState.id);
        if (response.success) {
          loadInvoices();
          showToast('Invoice berhasil dihapus');
        }
      } else if (confirmState.type === 'logout') {
        logout();
        navigate('/');
      } else if (confirmState.type === 'register_passkey') {
        try {
          showToast('Starting Passkey Setup...', 'success');
          await authAPI.registerPasskey();
          showToast('Passkey registered successfully! You can now login with Face ID.', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to register passkey. Ensure your device supports it.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus item', 'error');
    } finally {
      setLoading(false);
      setConfirmState({ isOpen: false, type: null, id: null, title: '' });
    }
  };

  const startMigrateData = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.create({ action: 'migrate' });
      if (response.success) {
        showToast(response.message);
        loadProjects();
      }
    } catch (err) {
      showToast('Gagal migrasi data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Selection Logic
  const toggleSelect = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === projects.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(projects.map(p => p.id)));
  };

  const selectDuplicates = () => {
    const seenTitles = new Set();
    const duplicateIds = new Set();

    // Iterate through projects (which are already sorted newest first or naturally)
    // We want to keep one instance (preferable the newest? or oldest? user didn't specify, but usually oldest is original)
    // Actually, if we just migrated, the new ones are at top. If user wants to keep one, let's keep the one that appears first or last?
    // Let's assume we keep the FIRST one we encounter (newest if sorted by date desc) and mark others as dupes.

    projects.forEach(project => {
      const normalizedTitle = project.title.toLowerCase().trim();
      if (seenTitles.has(normalizedTitle)) {
        duplicateIds.add(project.id);
      } else {
        seenTitles.add(normalizedTitle);
      }
    });

    if (duplicateIds.size === 0) {
      showToast('Tidak ada duplikat yang ditemukan', 'success');
    } else {
      setSelectedItems(duplicateIds);
      showToast(`${duplicateIds.size} judul duplikat terpilih`);
    }
  };

  const handleBulkDelete = async () => {
    // For bulk delete, since API doesn't support array delete yet, we loop.
    // In production app, should add bulk delete endpoint.
    // Re-using confirm modal logic but with custom action
    setConfirmState({
      isOpen: true,
      type: 'bulk-delete',
      id: 'bulk',
      title: `${selectedItems.size} items`
    });
  };

  // Upgraded handleFinalConfirm to support bulk
  const handleFinalConfirm = async () => {
    if (confirmState.type === 'migrate') {
      setConfirmState({ isOpen: false, type: null, id: null, title: '' });
      await startMigrateData();
    } else if (confirmState.type === 'bulk-delete') {
      setConfirmState({ isOpen: false, type: null, id: null, title: '' });
      setLoading(true);
      try {
        // Parallel delete requests
        const deletePromises = Array.from(selectedItems).map(id => portfolioAPI.delete(id));
        await Promise.all(deletePromises);
        showToast(`Berhasil menghapus ${selectedItems.size} items`);
        setSelectedItems(new Set());
        loadProjects();
      } catch (err) {
        showToast('Gagal menghapus beberapa items', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      await handleConfirmDelete();
    }
  };

  const handleMigrate = () => {
    // We can use the custom confirm for migrate too, or a specific one.
    // Let's use a specialized check or re-use confirm state with a special type.
    // For simplicity, let's keep the confirm modal generic enough?
    // We'll just set a special type 'migrate'
    setConfirmState({
      isOpen: true,
      type: 'migrate',
      id: 'migrate',
      title: 'Semua data dari portfolio.json akan disinkronisasi ke database.'
    });
  };

  // Modify handleConfirmDelete to handle migrate
  const handleFinalConfirmIsReplacedAbove = async () => {
    // This function is replaced by the one above in the react component scope
  };

  const handleLogout = () => {
    setConfirmState({
      isOpen: true,
      type: 'logout',
      id: 'logout',
      title: 'Yakin ingin logout dari sistem?'
    });
  };

  const handleRegisterPasskey = async () => {
    setConfirmState({
      isOpen: true,
      type: 'register_passkey',
      id: 'register_passkey',
      title: 'Setup Face ID / Passkey on this device?'
    });
  };


  const stats = {
    total: invoices.length,
    lunas: invoices.filter(inv => inv.paymentStatus === 'LUNAS').length,
    dp: invoices.filter(inv => inv.paymentStatus === 'DP').length,
    belumLunas: invoices.filter(inv => inv.paymentStatus === 'BELUM LUNAS').length,
  };

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 font-sans pb-20">
      {/* Modern Header */}
      <div className="bg-[#1f2937] border-b border-gray-700/50 sticky top-0 z-30 shadow-xl backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-blue-500">Center</span></h1>
              <p className="text-xs text-gray-400 font-medium">Content Management System</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              View Site
            </button>
            <button
              onClick={handleRegisterPasskey}
              className="px-4 py-2 text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M16 3a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Setup Face ID
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-[#1f2937] p-1 rounded-xl mb-8 w-fit shadow-lg border border-gray-700">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'invoices'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
          >
            📋 Invoices
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
          >
            🎬 Portfolio
          </button>
        </div>

        {/* CUSTOM ALERT TOAST */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 border ${toast.type === 'success'
            ? 'bg-green-900/90 border-green-500 text-green-100'
            : 'bg-red-900/90 border-red-500 text-red-100'
            }`}>
            <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <p className="font-medium">{toast.message}</p>
            <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-4 hover:opacity-75">✕</button>
          </div>
        )}

        {/* --- INVOICE SECTION (KEPT AS IS BUT STYLED) --- */}
        {/* --- INVOICE SECTION (OVERHAULED) --- */}
        {activeTab === 'invoices' && !loading && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Invoices', value: stats.total, color: 'blue', icon: '📋' },
                { label: 'Lunas', value: stats.lunas, color: 'green', icon: '✅' },
                { label: 'Down Payment', value: stats.dp, color: 'yellow', icon: '⏳' },
                { label: 'Belum Lunas', value: stats.belumLunas, color: 'red', icon: '⚠️' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700 shadow-xl hover:border-gray-600 transition-all group">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-${stat.color}-500/10 text-${stat.color}-400 uppercase`}>
                      Stats
                    </span>
                  </div>
                  <h4 className="text-gray-400 text-sm font-medium">{stat.label}</h4>
                  <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 bg-[#1f2937] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search client or invoice #..."
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => handleOpenInvoiceModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Create Invoice
              </button>
            </div>

            {/* Premium Table View */}
            <div className="bg-[#1f2937] rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700/50">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Reference</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Client</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {invoices.filter(inv =>
                      inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-800/40 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-sm font-mono text-blue-400 font-medium">{invoice.invoiceNumber}</span>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">ID: {invoice.id.slice(-8)}</p>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{invoice.clientName}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{invoice.projectTitle}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-black text-white">{formatCurrency(invoice.total)}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded-lg border shadow-sm ${invoice.paymentStatus === 'LUNAS' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                            invoice.paymentStatus === 'DP' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/10 text-red-100 border-red-500/30'
                            }`}>
                            {invoice.paymentStatus}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                            className="bg-gray-700/50 hover:bg-gray-600 p-2 rounded-lg text-gray-300 hover:text-white transition-all shadow-sm"
                            title="View Public Link"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button
                            onClick={() => handleOpenInvoiceModal(invoice.id)}
                            className="bg-blue-600/10 hover:bg-blue-600 p-2 rounded-lg text-blue-400 hover:text-white transition-all shadow-sm"
                            title="Edit"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => openDeleteConfirm('invoice', invoice.id, invoice.invoiceNumber)}
                            className="bg-red-600/10 hover:bg-red-600 p-2 rounded-lg text-red-400 hover:text-white transition-all shadow-sm"
                            title="Delete"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invoices.length === 0 && (
                <div className="p-20 text-center">
                  <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">No invoices found</h3>
                  <p className="text-gray-500 mt-2">Get started by creating your first billing.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PORTFOLIO SECTION (REDESIGNED) --- */}
        {activeTab === 'projects' && !loading && (
          <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4 bg-[#1f2937] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Portfolio Gallery</h2>
                <p className="text-gray-400 text-sm">Manage your creative works seamlessly.</p>
              </div>

              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 items-center">
                {/* View Toggles */}
                <div className="bg-gray-800 p-1 rounded-lg border border-gray-600 flex mr-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>

                <div className="h-8 w-px bg-gray-600 mx-1"></div>

                <div className="flex gap-2">
                  <button
                    onClick={selectDuplicates}
                    className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-600/50 rounded-xl transition-all text-sm font-medium whitespace-nowrap"
                    title="Otomatis pilih judul yang sama (sisakan satu)"
                  >
                    ⚡ Auto Select Dupes
                  </button>
                  <button
                    onClick={handleMigrate}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-all text-sm font-medium flex items-center gap-2"
                  >
                    🔄 Sync
                  </button>
                </div>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-semibold flex items-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Upload
                </button>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {selectedItems.size > 0 && (
              <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-xl mb-6 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <span className="text-blue-200 font-medium ml-2">{selectedItems.size} Selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete Selected
                </button>
              </div>
            )}

            {/* --- GRID VIEW --- */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())).map(project => (
                  <div key={project.id}
                    className={`group bg-[#1f2937] rounded-2xl border overflow-hidden hover:shadow-2xl transition-all duration-300 relative flex flex-col ${selectedItems.has(project.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-700 hover:border-blue-500/50'}`}
                  >
                    {/* Checkbox Overlay */}
                    <div className="absolute top-3 left-3 z-20">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(project.id)}
                        onChange={() => toggleSelect(project.id)}
                        className="w-5 h-5 rounded border-gray-500 bg-gray-800/80 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Thumbnail Area */}
                    <div className="relative h-48 overflow-hidden bg-gray-900" onClick={() => toggleSelect(project.id)}>
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] via-transparent to-transparent opacity-80" />
                      {project.pinned === 'yes' && (
                        <span className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                          ★ Pinned
                        </span>
                      )}
                      <span className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border pointer-events-none ${project.category === 'film'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                        {project.category}
                      </span>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                          {project.description || `${project.date} • ${project.projectInfo?.role || 'No role specified'}`}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-700/50 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-500">ID: {project.id}</span>
                        <button
                          onClick={() => openDeleteConfirm('project', project.id, project.title)}
                          className="text-gray-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors px-2 py-1 hover:bg-red-500/10 rounded"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- LIST VIEW --- */}
            {viewMode === 'list' && (
              <div className="bg-[#1f2937] rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={projects.length > 0 && selectedItems.size === projects.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-24">Image</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Title / ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1f2937] divide-y divide-gray-700">
                    {projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())).map(project => (
                      <tr key={project.id} className={`hover:bg-gray-800/50 transition-colors ${selectedItems.has(project.id) ? 'bg-blue-900/10' : ''}`}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(project.id)}
                            onChange={() => toggleSelect(project.id)}
                            className="rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-12 w-20 rounded bg-gray-800 overflow-hidden">
                            <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-white">{project.title}</div>
                          <div className="text-xs text-gray-500 font-mono">{project.id}</div>
                          {project.pinned === 'yes' && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] rounded border border-yellow-500/30">PINNED</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${project.category === 'film'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                            {project.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{project.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openDeleteConfirm('project', project.id, project.title)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* MODERN UPLOAD MODAL */}
        {showAddProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1f2937] w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 bg-[#1f2937] p-6 border-b border-gray-700 flex justify-between items-center z-10">
                <div>
                  <h3 className="text-xl font-bold text-white">Upload Creation</h3>
                  <p className="text-sm text-gray-400">Share your latest masterpiece with the world.</p>
                </div>
                <button onClick={() => setShowAddProject(false)} className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleAddProject} className="p-6 md:p-8 space-y-8">
                {/* Main Info Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                      <input
                        required
                        value={newProject.title}
                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-gray-600"
                        placeholder="e.g. The Last Journey"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                        <select
                          value={newProject.category}
                          onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option value="film">Film</option>
                          <option value="commission">Commission</option>
                          <option value="non-commission">Non-Commission</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                        <input
                          value={newProject.date}
                          onChange={e => setNewProject({ ...newProject, date: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                          placeholder="e.g. December, 2025"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL (Wide)</label>
                      <input
                        required
                        value={newProject.thumbnail}
                        onChange={e => setNewProject({ ...newProject, thumbnail: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-600"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                        </div>
                        <input
                          value={newProject.youtubeUrl}
                          onChange={e => setNewProject({ ...newProject, youtubeUrl: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none placeholder-gray-600"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Info */}
                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-5">
                    <h4 className="text-white font-bold border-b border-gray-700 pb-2 mb-4">Detailed Metadata (Optional)</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Project Name</label>
                        <input
                          value={newProject.projectInfo.name}
                          onChange={e => setNewProject({ ...newProject, projectInfo: { ...newProject.projectInfo, name: e.target.value } })}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Sub-Category</label>
                        <input
                          value={newProject.projectInfo.categoryFull}
                          onChange={e => setNewProject({ ...newProject, projectInfo: { ...newProject.projectInfo, categoryFull: e.target.value } })}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                          placeholder="e.g. Short Film"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Your Role</label>
                      <input
                        value={newProject.projectInfo.role}
                        onChange={e => setNewProject({ ...newProject, projectInfo: { ...newProject.projectInfo, role: e.target.value } })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        placeholder="e.g. Director, Editor"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Festival / Achievement</label>
                      <input
                        value={newProject.projectInfo.fest}
                        onChange={e => setNewProject({ ...newProject, projectInfo: { ...newProject.projectInfo, fest: e.target.value } })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        placeholder="e.g. Best Editor 2025"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pinned?</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pinned"
                            value="yes"
                            checked={newProject.pinned === 'yes'}
                            onChange={e => setNewProject({ ...newProject, pinned: e.target.value })}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="text-sm text-gray-300">Yes (Featured)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pinned"
                            value="no"
                            checked={newProject.pinned === 'no'}
                            onChange={e => setNewProject({ ...newProject, pinned: e.target.value })}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="text-sm text-gray-300">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Photos */}
                <div className="pt-6 border-t border-gray-700">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Additional Stills (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((num) => (
                      <div key={num}>
                        <label className="block text-xs text-gray-500 mb-1">Photo URL {num}</label>
                        <input
                          value={newProject[`photo${num}`]}
                          onChange={e => setNewProject({ ...newProject, [`photo${num}`]: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                          placeholder={`https://...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 sticky bottom-0 bg-[#1f2937] md:static">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
                  >
                    🚀 Publish Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1f2937] w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all scale-100">
              <div className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${['migrate', 'logout', 'register_passkey'].includes(confirmState.type)
                    ? 'bg-blue-500/10'
                    : 'bg-red-500/10'
                  }`}>
                  {confirmState.type === 'migrate' ? (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  ) : ['logout', 'register_passkey'].includes(confirmState.type) ? (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {confirmState.type === 'migrate'
                    ? 'Konfirmasi Migrasi'
                    : confirmState.type === 'logout'
                      ? 'Konfirmasi Logout'
                      : confirmState.type === 'register_passkey'
                        ? 'Setup Keamanan'
                        : confirmState.type === 'bulk-delete'
                          ? 'Hapus Item Terpilih'
                          : 'Hapus Item Ini?'}
                </h3>
                <p className="text-gray-400 mb-6 px-4">
                  {confirmState.type === 'migrate'
                    ? confirmState.title
                    : confirmState.type === 'logout'
                      ? 'Apakah Anda yakin ingin keluar dari sistem admin?'
                      : confirmState.type === 'register_passkey'
                        ? 'Sistem akan mendaftarkan perangkat ini (Face ID / Touch ID) untuk keamanan akun Anda.'
                        : confirmState.type === 'bulk-delete'
                          ? `Anda yakin ingin menghapus ${confirmState.title}? Tindakan ini tidak dapat dibatalkan.`
                          : `Anda yakin ingin menghapus "${confirmState.title}"? Tindakan ini tidak dapat dibatalkan.`}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setConfirmState({ isOpen: false, type: null, id: null, title: '' })}
                    className="px-6 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleFinalConfirm}
                    className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all ${['migrate', 'logout', 'register_passkey'].includes(confirmState.type)
                        ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                        : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                      }`}
                  >
                    {confirmState.type === 'migrate' ? 'Ya, Sinkronisasi'
                      : confirmState.type === 'logout' ? 'Logout'
                        : confirmState.type === 'register_passkey' ? 'Lanjutkan Setup'
                          : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVOICE MODAL */}
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1f2937] w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 bg-[#1f2937] p-6 border-b border-gray-700 flex justify-between items-center z-10">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {currentInvoice?.id ? 'Edit Invoice' : 'Create New Invoice'}
                  </h3>
                  <p className="text-sm text-gray-400">Manage billing and payments.</p>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Form Logic Handled inline for simplicity in this refactor step, typically would be separate component */}
                <InvoiceModalContent
                  invoice={currentInvoice}
                  onClose={() => setShowInvoiceModal(false)}
                  onSave={() => {
                    setShowInvoiceModal(false);
                    loadInvoices();
                    setSuccessMsg('Invoice berhasil disimpan!');
                    setTimeout(() => setSuccessMsg(null), 3000);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <span className="text-white font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

// Internal Component for Invoice Form inside Modal
const InvoiceModalContent = ({ invoice, onClose, onSave }) => {
  const [formData, setFormData] = useState(invoice);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const total = subtotal;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.projectTitle) {
      alert('Mohon isi nama client dan judul project!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        total: total,
        subtotal: subtotal,
        dpAmount: formData.paymentStatus === 'DP' ? parseFloat(formData.dpAmount) : 0,
      };

      if (formData.id) {
        await invoiceAPI.update(formData.id, payload);
      } else {
        await invoiceAPI.create(payload);
      }
      onSave();
    } catch (error) {
      alert('Gagal menyimpan invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Group 1: General Info */}
      <section>
        <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          General Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">Reference Number</label>
            <input
              value={formData.invoiceNumber}
              onChange={handleChange}
              name="invoiceNumber"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-gray-600 font-mono"
              placeholder="e.g. INV/2026/01/001"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">Issue Date</label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={handleChange}
              name="invoiceDate"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              required
            />
          </div>
        </div>
      </section>

      {/* Group 2: Client Info */}
      <section>
        <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
          Client Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">Client Name</label>
            <input
              value={formData.clientName}
              onChange={handleChange}
              name="clientName"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              placeholder="e.g. John Doe / Company Name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">Project Title</label>
            <input
              value={formData.projectTitle}
              onChange={handleChange}
              name="projectTitle"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              placeholder="e.g. Short Film - Midnight City"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">Client Address / Billing Details</label>
            <textarea
              value={formData.clientAddress}
              onChange={handleChange}
              name="clientAddress"
              rows="3"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
              placeholder="e.g. Jalan Sudirman No. 123, Jakarta"
            />
          </div>
        </div>
      </section>

      {/* Group 3: Line Items */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
            Items & Services
          </h4>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-bold bg-green-600/20 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-lg shadow-green-900/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add New Item
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-start bg-gray-800/50 p-5 rounded-2xl border border-gray-700 group hover:border-gray-600 transition-all shadow-lg animate-in zoom-in-95 duration-200">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[8px] font-black text-gray-500 uppercase mb-1 tracking-[0.2em]">Service Description</label>
                <input
                  placeholder="e.g. Video Editing Service"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none py-2 text-white font-medium"
                />
              </div>
              <div className="w-24">
                <label className="block text-[8px] font-black text-gray-500 uppercase mb-1 tracking-[0.2em] text-center">Qty</label>
                <input
                  type="number"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none py-2 text-white text-center font-bold"
                />
              </div>
              <div className="w-40">
                <label className="block text-[8px] font-black text-gray-500 uppercase mb-1 tracking-[0.2em] text-right">Price (IDR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none py-2 text-white text-right font-bold"
                />
              </div>
              <div className="w-10 pt-5">
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-end border-t border-gray-700 pt-6 pr-6">
          <div className="flex gap-12 text-sm mb-2">
            <span className="text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
            <span className="text-gray-300 font-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex gap-12 text-2xl">
            <span className="text-gray-400 font-black uppercase tracking-widest">Total Tagihan</span>
            <span className="text-blue-500 font-black font-mono">{formatCurrency(total)}</span>
          </div>
        </div>
      </section>

      {/* Group 4: Payment Logic */}
      <section>
        <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-yellow-600 rounded-full"></span>
          Payment & Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">Current Status</label>
            <select
              value={formData.paymentStatus}
              onChange={handleChange}
              name="paymentStatus"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer font-bold"
            >
              <option value="BELUM LUNAS">🔴 BELUM LUNAS</option>
              <option value="DP">🟡 DP (Down Payment)</option>
              <option value="LUNAS">🟢 LUNAS</option>
            </select>
          </div>
          {formData.paymentStatus === 'DP' && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">DP Amount Received</label>
              <input
                type="number"
                value={formData.dpAmount}
                onChange={handleChange}
                name="dpAmount"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-blue-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                placeholder="0"
              />
            </div>
          )}
          <div className="md:col-span-2 border-t border-gray-700/30 mt-4 pt-6">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1 text-yellow-400/80 italic animate-pulse">Signature and digital stamp will be automatically applied based on your profile.</label>
          </div>
        </div>
      </section>

      {/* Form Action */}
      <div className="flex justify-end gap-4 pt-10 border-t border-gray-700 sticky bottom-0 bg-[#1f2937] pb-4 z-20">
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700 font-bold transition-all"
        >
          Discard Changes
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-12 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center gap-3 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              {formData.id ? 'Update Invoice' : 'Finalize & Save'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;
