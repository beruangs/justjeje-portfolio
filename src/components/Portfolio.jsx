import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import portfolioData from '../data/portfolio.json';

const Portfolio = () => {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'film', label: 'Film' },
    { id: 'commission', label: 'Commission' },
    { id: 'non-commission', label: 'Non-Commission' },
  ];

  // Filter projects based on category
  const filteredProjects = filter === 'all' 
    ? portfolioData 
    : portfolioData.filter(project => project.category === filter);

  // Sort projects: pinned items first, then by date
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Check if items are pinned
    const aPinned = a.pinned === 'yes';
    const bPinned = b.pinned === 'yes';
    
    // Pinned items come first
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    // If both pinned or both not pinned, keep original order
    return 0;
  });

  return (
    <section id="portfolio" className="section bg-gray-900">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">Creation</h2>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            {filters.map((filterItem) => (
              <motion.button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all ${
                  filter === filterItem.id
                    ? 'bg-secondary text-white'
                    : 'bg-gray-800 text-light hover:bg-primary'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filterItem.label}
              </motion.button>
            ))}
          </div>

          {/* Projects Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            layout
          >
            <AnimatePresence>
              {sortedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="card group relative"
                >
                  {/* Pinned Badge */}
                  {project.pinned === 'yes' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-3 right-3 z-10 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                      </svg>
                      PINNED
                    </motion.div>
                  )}
                  <Link to={`/project/${project.id}`}>
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-64 object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-3 justify-center">
                          <motion.a
                            href={project.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-secondary text-white p-3 rounded-full"
                            whileHover={{ scale: 1.2 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </motion.a>
                          <motion.div
                            className="bg-primary text-white p-3 rounded-full"
                            whileHover={{ scale: 1.2 }}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs md:text-sm text-light mb-2">{project.date}</p>
                    <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                      project.category === 'film' 
                        ? 'bg-red-500 text-white'
                        : project.category === 'commission'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {project.category.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
