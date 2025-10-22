import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Gear from '../components/Gear';
import Portfolio from '../components/Portfolio';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <div className="lg:pl-64">
      <SEO />
      <Header />
      <Hero />
      <About />
      <Skills />
      <Gear />
      <Portfolio />
      <Footer />
    </div>
  );
};

export default Home;
