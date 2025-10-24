import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import { seedFakeViews } from './utils/fakeViews';
import './index.css';

function App() {
  // Seed fake views saat app pertama kali load
  useEffect(() => {
    seedFakeViews(); // Auto-seed jika belum ada views
  }, []);

  return (
    <Router>
      <div className="App">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
