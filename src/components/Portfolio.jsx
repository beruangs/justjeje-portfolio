import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getLocalViewCount, formatViewCount } from '../utils/viewCounter';
import { portfolioAPI } from '../utils/api';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await portfolioAPI.getAll();
        if (response.success) {
          setProjects(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Parallax effect for the section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'film', label: 'Film' },
    { id: 'commission', label: 'Commission' },
    { id: 'non-commission', label: 'Non-Commission' },
  ];

  // Filter projects based on category
  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(project => project.category === filter);

  // Sort projects: pinned items first (7 pinned items max usually), then rely on API order (newest first)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Check if items are pinned
    const aPinned = a.pinned === 'yes';
    const bPinned = b.pinned === 'yes';

    // Pinned items come first
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // If both pinned or both not pinned, keep original order (which is newest first from API)
    return 0;
  });

  return (
    <section ref={ref} id="portfolio" className="section bg-gray-900 relative overflow-hidden">
      {/* Parallax Background Element */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-5 pointer-events-none"
      >
        <div className="absolute top-20 left-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </motion.div>

      <div className="container-custom px-4 relative z-10">
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
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all ${filter === filterItem.id
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
          {loading ? (
            <div className="text-center py-20 text-light/50 font-medium">Loading projects...</div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              layout
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1], // Cinematic ease-in-out
                      layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                    }}
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
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                          <div className="flex gap-3">
                            <motion.div
                              className="bg-secondary text-white p-3 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-secondary transition-colors duration-300">
                        {project.title}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs md:text-sm text-light/70">{project.date}</p>
                        <div className="flex items-center gap-1 text-xs text-light/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{formatViewCount(getLocalViewCount(project.id))}</span>
                        </div>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-sm text-[10px] font-black tracking-widest uppercase ${project.category === 'film'
                        ? 'bg-red-600/20 text-red-500 border border-red-500/30'
                        : project.category === 'commission'
                          ? 'bg-green-600/20 text-green-500 border border-green-500/30'
                          : 'bg-blue-600/20 text-blue-500 border border-blue-500/30'
                        }`}>
                        {project.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
