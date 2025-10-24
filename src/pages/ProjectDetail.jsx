import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import portfolioData from '../data/portfolio.json';
import SEO from '../components/SEO';
import { trackProjectView, formatViewCount } from '../utils/viewCounter';

// Carousel Component
const PhotoCarousel = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const photoArray = [photos.photo1, photos.photo2, photos.photo3].filter(Boolean);

  if (photoArray.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photoArray.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photoArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-2xl bg-gray-800">
      {/* Current Photo */}
      <img
        src={photoArray[currentIndex]}
        alt={`Photo ${currentIndex + 1}`}
        className="absolute top-0 left-0 w-full h-full object-contain"
      />

      {/* Navigation Arrows */}
      {photoArray.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all z-10 backdrop-blur-sm"
            aria-label="Previous photo"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all z-10 backdrop-blur-sm"
            aria-label="Next photo"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
            {photoArray.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 md:h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-secondary w-6 md:w-8' 
                    : 'bg-white/50 hover:bg-white/70 w-1.5 md:w-2'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [viewCount, setViewCount] = useState({ local: 0, global: null });
  const [isLoadingViews, setIsLoadingViews] = useState(true);

  useEffect(() => {
    const foundProject = portfolioData.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
      
      // Track view and get count
      trackProjectView(id).then((result) => {
        setViewCount({
          local: result.local,
          global: result.global
        });
        setIsLoadingViews(false);
      });
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-secondary mx-auto mb-4"></div>
          <p className="text-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getYouTubeVideoId(project.youtubeUrl);

  // SEO data for this project
  const seoTitle = `${project.title} - Just-Jeje Portfolio`;
  const seoDescription = project.description || `Watch ${project.title} by Just-Jeje. Professional video editing and videography work.`;
  const seoImage = project.thumbnail;


  return (
    <div className="min-h-screen pt-16 md:pt-20 lg:pl-64">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        type="video.other"
      />
      <div className="section bg-gray-900">
        <div className="container-custom px-4">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-2 text-sm md:text-base text-light mb-6 md:mb-8"
          >
            <div className="flex items-center gap-2">
              <Link to="/" className="hover:text-secondary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">{project.title}</span>
            </div>
            
            {/* Pinned Badge */}
            {project.pinned === 'yes' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                PINNED
              </motion.div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Video/Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {videoId ? (
                <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={project.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : project.photo1 || project.photo2 || project.photo3 ? (
                <PhotoCarousel photos={project} />
              ) : (
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              )}
            </motion.div>

            {/* Project Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-gray-800 rounded-lg p-4 md:p-6 lg:sticky lg:top-24">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Project information</h3>
                
                {/* View Counter */}
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-light text-sm">Views</span>
                    </div>
                    <div className="text-right">
                      {isLoadingViews ? (
                        <div className="animate-pulse">
                          <div className="h-6 w-12 bg-gray-600 rounded"></div>
                        </div>
                      ) : (
                        <>
                          {viewCount.global !== null ? (
                            <>
                              <div className="text-2xl font-bold text-white">
                                {formatViewCount(viewCount.global)}
                              </div>
                              <div className="text-xs text-light/70">
                                {viewCount.global === 1 ? 'view' : 'views'}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-white">
                                {formatViewCount(viewCount.local)}
                              </div>
                              <div className="text-xs text-light/70">
                                local {viewCount.local === 1 ? 'view' : 'views'}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
                  {project.projectInfo ? (
                    <>
                      <li>
                        <strong className="text-secondary">Project date:</strong>
                        <p className="text-light mt-1">{project.date}</p>
                      </li>
                      <li>
                        <strong className="text-secondary">Project name:</strong>
                        <p className="text-light mt-1">{project.projectInfo.name}</p>
                      </li>
                      <li>
                        <strong className="text-secondary">Category:</strong>
                        <p className="text-light mt-1">{project.projectInfo.categoryFull}</p>
                      </li>
                      <li>
                        <strong className="text-secondary">My Role:</strong>
                        <p className="text-light mt-1">{project.projectInfo.role}</p>
                      </li>
                      {project.projectInfo.fest && (
                        <li>
                          <strong className="text-secondary">Fest:</strong>
                          <p className="text-light mt-1">{project.projectInfo.fest}</p>
                        </li>
                      )}
                    </>
                  ) : (
                    <>
                      <li>
                        <strong className="text-secondary">Title:</strong>
                        <p className="text-light mt-1">{project.title}</p>
                      </li>
                      <li>
                        <strong className="text-secondary">Category:</strong>
                        <p className="text-light mt-1 capitalize">{project.category}</p>
                      </li>
                      <li>
                        <strong className="text-secondary">Date:</strong>
                        <p className="text-light mt-1">{project.date}</p>
                      </li>
                      {project.description && (
                        <li>
                          <strong className="text-secondary">Description:</strong>
                          <p className="text-light mt-1">{project.description}</p>
                        </li>
                      )}
                    </>
                  )}
                </ul>

                {project.youtubeUrl && (
                  <motion.a
                    href={project.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch on YouTube
                  </motion.a>
                )}

                {project.detailPage && (
                  <motion.a
                    href={project.detailPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2 bg-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Project Website
                  </motion.a>
                )}

                <motion.button
                  onClick={() => navigate(-1)}
                  className="w-full mt-4 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Back to Portfolio
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
