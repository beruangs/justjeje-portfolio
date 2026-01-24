import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceView from './pages/InvoiceView';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';
import { AuthProvider } from './context/AuthContext';
import { seedFakeViews } from './utils/fakeViews';
import { seedDemoInvoice } from './utils/demoInvoice';
import { portfolioAPI } from './utils/api';
import './index.css';

function App() {
  // Seed fake views saat app pertama kali load
  useEffect(() => {
    portfolioAPI.getAll().then(res => {
      if (res.success) seedFakeViews(res.data);
    });
    seedDemoInvoice(); // Auto-seed demo invoice
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <CustomCursor />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/project/:id"
              element={
                <>
                  <Header />
                  <ProjectDetail />
                </>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoice/new"
              element={
                <ProtectedRoute>
                  <InvoiceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoice/edit/:id"
              element={
                <ProtectedRoute>
                  <InvoiceForm />
                </ProtectedRoute>
              }
            />

            {/* Public Invoice View */}
            <Route path="/invoice/:id" element={<InvoiceView />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
