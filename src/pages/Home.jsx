import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Portfolio from '../components/Portfolio';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Easter egg: Tekan "Ctrl + Shift + A" untuk akses admin
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <div className="lg:pl-64">
      <SEO />
      <Header />
      <Hero />
      <About />
      <Skills />
      <Portfolio />
      <Footer />
    </div>
  );
};

export default Home;
