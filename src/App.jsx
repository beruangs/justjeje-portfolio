import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import './index.css';

function App() {
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
