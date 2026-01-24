import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import profileData from '../data/profile.json';
import ParticleCanvas from './ParticleCanvas';

const Hero = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if screen is desktop size (1024px and above)
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Extract YouTube video ID from URL or use direct ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    // If already just an ID (11 characters)
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return url;
    }

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const videoId = getYouTubeVideoId(profileData.showreelVideo);
  const isYouTube = !!videoId;

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-dark to-primary px-4">
      {/* Video Background - Desktop Only */}
      {isDesktop && profileData.showreelVideo && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>

          {/* YouTube Embed */}
          {isYouTube ? (
            <iframe
              className="w-full h-full object-cover"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${videoId}&playsinline=1`}
              title="Showreel"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* Direct Video File */
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              poster={profileData.profileImage}
            >
              <source src={profileData.showreelVideo} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      {/* Animated Background Pattern - Mobile Only */}
      {!isDesktop && (
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(80, 109, 255, 0.05) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(80, 109, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      )}

      {/* Desktop Particle Animation */}
      {isDesktop && <ParticleCanvas />}

      {/* Floating Blobs (Background) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(isDesktop ? 6 : 3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-secondary/10 rounded-full blur-[100px]"
            style={{
              width: isDesktop ? 400 : 250,
              height: isDesktop ? 400 : 250,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              x: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container-custom text-center z-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 font-maginia leading-tight"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          >
            Just-Jeje
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-light mb-6 md:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Video Editor & Videographer
          </motion.p>

          <motion.a
            href="#about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="inline-block"
          >
            <motion.div
              className="btn-primary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Scroll Down
              <motion.svg
                className="w-5 h-5 inline-block ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
