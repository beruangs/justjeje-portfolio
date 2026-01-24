import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLocalViews, formatViewCount, getTotalViews } from '../utils/viewCounter';
import { portfolioAPI } from '../utils/api';

const ViewStats = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    views: {},
    total: 0,
    projectCount: 0
  });
  const [sortBy, setSortBy] = useState('views'); // 'views' or 'title'

  useEffect(() => {
    const loadStats = async () => {
      const localViews = getLocalViews();
      const totals = await getTotalViews();
      const res = await portfolioAPI.getAll();

      if (res.success) setProjects(res.data);

      setStats({
        views: localViews,
        total: totals.local,
        projectCount: totals.projectCount
      });
    };

    loadStats();

    // Refresh stats every 5 seconds when component is mounted
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get projects with view counts
  const projectsWithViews = projects.map(project => ({
    ...project,
    viewCount: stats.views[project.id] || 0
  }));

  // Sort projects
  const sortedProjects = [...projectsWithViews].sort((a, b) => {
    if (sortBy === 'views') {
      return b.viewCount - a.viewCount;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <section id="stats" className="section bg-gray-900">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">
            Portfolio Statistics
          </h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg text-center"
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(80, 109, 255, 0.3)' }}
            >
              <div className="text-5xl mb-2">👁️</div>
              <div className="text-4xl font-bold text-secondary mb-2">
                {formatViewCount(stats.total)}
              </div>
              <p className="text-light">Total Views</p>
            </motion.div>

            <motion.div
              className="bg-gray-800 p-6 rounded-lg text-center"
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(80, 109, 255, 0.3)' }}
            >
              <div className="text-5xl mb-2">📁</div>
              <div className="text-4xl font-bold text-secondary mb-2">
                {stats.projectCount}
              </div>
              <p className="text-light">Viewed Projects</p>
            </motion.div>

            <motion.div
              className="bg-gray-800 p-6 rounded-lg text-center"
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(80, 109, 255, 0.3)' }}
            >
              <div className="text-5xl mb-2">📊</div>
              <div className="text-4xl font-bold text-secondary mb-2">
                {stats.projectCount > 0 ? Math.round(stats.total / stats.projectCount) : 0}
              </div>
              <p className="text-light">Avg Views/Project</p>
            </motion.div>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Project Views</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('views')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${sortBy === 'views'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-800 text-light hover:bg-primary'
                  }`}
              >
                Sort by Views
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${sortBy === 'title'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-800 text-light hover:bg-primary'
                  }`}
              >
                Sort by Title
              </button>
            </div>
          </div>

          {/* Project List */}
          <div className="space-y-4">
            {sortedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-lg p-4 md:p-6 flex items-center gap-4 hover:bg-gray-700 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <h4 className="text-white font-bold text-lg mb-1">{project.title}</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-light">{project.date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${project.category === 'film'
                      ? 'bg-red-500 text-white'
                      : project.category === 'commission'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                      }`}>
                      {project.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* View Count */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 text-secondary mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-2xl font-bold text-white">
                      {formatViewCount(project.viewCount)}
                    </span>
                  </div>
                  <p className="text-xs text-light">
                    {project.viewCount === 1 ? 'view' : 'views'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-2">About View Statistics</h4>
                <p className="text-light text-sm leading-relaxed">
                  These statistics are stored locally in your browser. Each unique visitor will have their own count.
                  For global view tracking across all visitors, the system uses CountAPI which provides real-time analytics.
                  Views are counted once per browser session to avoid inflating numbers from page refreshes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ViewStats;
