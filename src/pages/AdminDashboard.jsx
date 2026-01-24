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

  // New Project Form State
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    thumbnail: '',
    youtubeUrl: '',
    category: 'film',
    pinned: 'no'
  });

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
    try {
      const response = await portfolioAPI.create(newProject);
      if (response.success) {
        setShowAddProject(false);
        setNewProject({ title: '', thumbnail: '', youtubeUrl: '', category: 'film', pinned: 'no' });
        loadProjects();
      }
    } catch (err) {
      alert('Gagal menambah project');
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

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Yakin ingin menghapus invoice ini?')) {
      try {
        const response = await invoiceAPI.delete(id);
        if (response.success) loadInvoices();
      } catch (error) {
        alert('Gagal menghapus invoice');
      }
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
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Project & Invoice Management</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate('/')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Ke Beranda</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex bg-white rounded-lg shadow mb-8 p-1">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-3 text-center rounded-md font-medium transition-all ${activeTab === 'invoices' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            📋 Invoices
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3 text-center rounded-md font-medium transition-all ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            🎬 Portfolio (Creation)
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between">
            <span>{error}</span>
            <button onClick={() => activeTab === 'invoices' ? loadInvoices() : loadProjects()} className="underline">Coba Lagi</button>
          </div>
        )}

        {/* INVOICE TAB */}
        {activeTab === 'invoices' && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Invoice</div>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <div className="bg-green-50 rounded-lg shadow p-6">
                <div className="text-sm text-green-600 mb-1">Lunas</div>
                <div className="text-3xl font-bold text-green-600">{stats.lunas}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg shadow p-6">
                <div className="text-sm text-yellow-600 mb-1">DP</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.dp}</div>
              </div>
              <div className="bg-red-50 rounded-lg shadow p-6">
                <div className="text-sm text-red-600 mb-1">Belum Lunas</div>
                <div className="text-3xl font-bold text-red-600">{stats.belumLunas}</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                placeholder="Cari invoice..."
                className="px-4 py-2 border border-gray-300 rounded-lg w-96"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => navigate('/admin/invoice/new')} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow">
                + Buat Invoice Baru
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.filter(inv => inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase())).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(invoice.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getPaymentStatusColor(invoice.paymentStatus)}`}>{invoice.paymentStatus}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        <button onClick={() => navigate(`/invoice/${invoice.id}`)} className="text-blue-600">Lihat</button>
                        <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'projects' && !loading && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Portfolio Items</h2>
              <button
                onClick={() => setShowAddProject(!showAddProject)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow transition-all"
              >
                {showAddProject ? 'Batal' : '+ Tambah Post Baru'}
              </button>
            </div>

            {showAddProject && (
              <div className="bg-white rounded-lg shadow p-6 mb-8 border-2 border-green-100">
                <h3 className="font-bold mb-4">Tambah Project Baru</h3>
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Judul Project" className="p-2 border rounded" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                  <input required placeholder="Thumbnail URL" className="p-2 border rounded" value={newProject.thumbnail} onChange={e => setNewProject({ ...newProject, thumbnail: e.target.value })} />
                  <input required placeholder="YouTube URL / ID" className="p-2 border rounded" value={newProject.youtubeUrl} onChange={e => setNewProject({ ...newProject, youtubeUrl: e.target.value })} />
                  <select className="p-2 border rounded" value={newProject.category} onChange={e => setNewProject({ ...newProject, category: e.target.value })}>
                    <option value="film">FILM</option>
                    <option value="commission">COMMISSION</option>
                    <option value="non-commission">NON-COMMISSION</option>
                  </select>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Simpan Ke portfolio.json</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden relative group">
                  <img src={project.thumbnail} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 truncate">{project.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{project.category} • {project.date}</p>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="mt-3 text-xs text-red-500 hover:underline"
                    >
                      Hapus Post
                    </button>
                  </div>
                  {project.pinned === 'yes' && <span className="absolute top-2 right-2 bg-yellow-400 text-[10px] font-bold px-2 py-1 rounded">PINNED</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {loading && <div className="text-center py-20 font-medium">Memuat data...</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;
