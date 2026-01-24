import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invoiceAPI, portfolioAPI, formatCurrency, getPaymentStatusColor } from '../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

const AdminDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('invoices');
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
      if (response.success) setProjects(response.data);
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
  const handleFinalConfirm = async () => {
    if (confirmState.type === 'migrate') {
      setConfirmState({ isOpen: false, type: null, id: null, title: '' });
      await startMigrateData();
    } else {
      await handleConfirmDelete();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      logout();
      navigate('/');
    }
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
        {activeTab === 'invoices' && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#1f2937] p-4 rounded-xl border border-gray-700 search-bar">
              <input
                type="text"
                placeholder="Search invoices..."
                className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none w-96"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => navigate('/admin/invoice/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
              >
                + New Invoice
              </button>
            </div>

            {/* Invoice List (Styled table) */}
            <div className="bg-[#1f2937] rounded-xl border border-gray-700 overflow-hidden shadow-xl">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1f2937] divide-y divide-gray-700">
                  {invoices.filter(inv => inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase())).map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{invoice.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{formatCurrency(invoice.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${invoice.paymentStatus === 'LUNAS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          invoice.paymentStatus === 'DP' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-3">
                        <button onClick={() => navigate(`/invoice/${invoice.id}`)} className="text-blue-400 hover:text-blue-300 font-medium">View</button>
                        <button onClick={() => handleOpenInvoiceModal(invoice.id)} className="text-green-400 hover:text-green-300 font-medium">Edit</button>
                        <button onClick={() => openDeleteConfirm('invoice', invoice.id, invoice.invoiceNumber)} className="text-red-400 hover:text-red-300 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PORTFOLIO SECTION (REDESIGNED) --- */}
        {activeTab === 'projects' && !loading && (
          <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-[#1f2937] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Portfolio Gallery</h2>
                <p className="text-gray-400 text-sm">Manage your creative works seamlessly.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMigrate}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-all text-sm font-medium flex items-center gap-2"
                >
                  🔄 Sync Legacy Data
                </button>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Upload New Project
                </button>
              </div>
            </div>

            {/* Grid Layout for Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map(project => (
                <div key={project.id} className="group bg-[#1f2937] rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 relative flex flex-col">
                  {/* Thumbnail Area */}
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] via-transparent to-transparent opacity-80" />
                    {project.pinned === 'yes' && (
                      <span className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                        ★ Pinned
                      </span>
                    )}
                    <span className={`absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${project.category === 'film'
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
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {confirmState.type === 'migrate' ? 'Konfirmasi Migrasi' : 'Hapus Item Ini?'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {confirmState.type === 'migrate'
                    ? confirmState.title
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
                    className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all ${confirmState.type === 'migrate'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                      : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                      }`}
                  >
                    {confirmState.type === 'migrate' ? 'Ya, Sinkronisasi' : 'Ya, Hapus'}
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
    </div>
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
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Nomor Invoice</label>
          <input
            value={formData.invoiceNumber}
            onChange={handleChange}
            name="invoiceNumber"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Tanggal</label>
          <input
            type="date"
            value={formData.invoiceDate}
            onChange={handleChange}
            name="invoiceDate"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Client Name</label>
          <input
            value={formData.clientName}
            onChange={handleChange}
            name="clientName"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Project Title</label>
          <input
            value={formData.projectTitle}
            onChange={handleChange}
            name="projectTitle"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-gray-400">Client Address</label>
          <textarea
            value={formData.clientAddress}
            onChange={handleChange}
            name="clientAddress"
            rows="2"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-white">Items / Services</h4>
          <button type="button" onClick={addItem} className="text-sm bg-green-600/20 text-green-400 px-3 py-1 rounded hover:bg-green-600/30 transition">+ Add Item</button>
        </div>
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <div className="flex-1">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-1 text-sm"
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-1 text-sm text-center"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-1 text-sm text-right"
                />
              </div>
              <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">✕</button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right text-xl font-bold text-blue-400">
          Total: {formatCurrency(total)}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Payment Status</label>
          <select
            value={formData.paymentStatus}
            onChange={handleChange}
            name="paymentStatus"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="BELUM LUNAS">BELUM LUNAS</option>
            <option value="DP">DP (Down Payment)</option>
            <option value="LUNAS">LUNAS</option>
          </select>
        </div>
        {formData.paymentStatus === 'DP' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">DP Amount</label>
            <input
              type="number"
              value={formData.dpAmount}
              onChange={handleChange}
              name="dpAmount"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-600 hover:bg-gray-700 transition">Cancel</button>
        <button type="submit" disabled={loading} className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition">
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;
