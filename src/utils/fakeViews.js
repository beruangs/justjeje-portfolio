// Fake Views Seeder
// Generate initial fake views untuk portfolio items

import portfolioData from '../data/portfolio.json';

/**
 * Generate random number dalam range
 */
const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Fake views configuration
 */
const FAKE_VIEWS_CONFIG = {
  pinned: { min: 7000, max: 10000 },      // Pinned projects
  regular: { min: 500, max: 5000 },       // Regular projects
  new: { min: 50, max: 300 }              // New projects (recently added)
};

/**
 * Generate fake views untuk semua portfolio items
 */
export const generateFakeViews = () => {
  const fakeViews = {};
  
  portfolioData.forEach(project => {
    let views;
    
    if (project.pinned === 'yes') {
      // Pinned projects get higher views (7000-10000)
      views = randomInRange(
        FAKE_VIEWS_CONFIG.pinned.min,
        FAKE_VIEWS_CONFIG.pinned.max
      );
    } else {
      // Regular projects get normal views (500-5000)
      views = randomInRange(
        FAKE_VIEWS_CONFIG.regular.min,
        FAKE_VIEWS_CONFIG.regular.max
      );
    }
    
    fakeViews[project.id] = views;
  });
  
  return fakeViews;
};

/**
 * Generate fake views untuk project baru
 * @param {boolean} isPinned - Apakah project di-pin
 * @returns {number} - Fake view count
 */
export const generateNewProjectViews = (isPinned = false) => {
  if (isPinned) {
    return randomInRange(
      FAKE_VIEWS_CONFIG.pinned.min,
      FAKE_VIEWS_CONFIG.pinned.max
    );
  } else {
    // Project baru get lower initial views (50-300)
    return randomInRange(
      FAKE_VIEWS_CONFIG.new.min,
      FAKE_VIEWS_CONFIG.new.max
    );
  }
};

/**
 * Seed fake views ke localStorage
 * Hanya seed jika belum ada data atau force = true
 */
export const seedFakeViews = (force = false) => {
  const STORAGE_KEY = 'portfolio_views';
  const existingViews = localStorage.getItem(STORAGE_KEY);
  
  // Jika sudah ada views dan tidak force, skip seeding
  if (existingViews && !force) {
    console.log('📊 Fake views already seeded. Use force=true to reseed.');
    return JSON.parse(existingViews);
  }
  
  const fakeViews = generateFakeViews();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeViews));
  
  console.log('✅ Fake views seeded successfully!');
  console.table(fakeViews);
  
  return fakeViews;
};

/**
 * Seed fake views ke CountAPI (global)
 * WARNING: Ini akan mengubah global counter!
 * Hanya gunakan untuk testing/development
 */
export const seedFakeViewsToAPI = async () => {
  const fakeViews = generateFakeViews();
  const COUNTAPI_BASE = 'https://api.countapi.xyz';
  const namespace = 'justjeje-portfolio';
  
  console.log('🌐 Seeding fake views to CountAPI...');
  
  const promises = Object.entries(fakeViews).map(async ([projectId, views]) => {
    try {
      // Set value menggunakan CountAPI set endpoint
      const url = `${COUNTAPI_BASE}/set/${namespace}/${projectId}?value=${views}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return { projectId, success: true, views: data.value };
    } catch (error) {
      console.error(`Error seeding ${projectId}:`, error);
      return { projectId, success: false, error };
    }
  });
  
  const results = await Promise.all(promises);
  
  console.log('✅ CountAPI seeding completed!');
  console.table(results);
  
  return results;
};

/**
 * Add fake views untuk project baru yang ditambahkan
 * @param {string} projectId - ID project baru
 * @param {boolean} isPinned - Apakah project di-pin
 */
export const addFakeViewsForNewProject = (projectId, isPinned = false) => {
  const STORAGE_KEY = 'portfolio_views';
  const existingViews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  
  // Generate views untuk project baru
  const newViews = generateNewProjectViews(isPinned);
  existingViews[projectId] = newViews;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingViews));
  
  console.log(`✅ Added fake views for new project "${projectId}": ${newViews} views`);
  
  return newViews;
};

/**
 * Reset all views (untuk testing)
 */
export const resetAllViews = () => {
  const STORAGE_KEY = 'portfolio_views';
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.clear();
  
  console.log('🔄 All views have been reset!');
};

/**
 * Update fake views config
 * @param {object} newConfig - New configuration
 */
export const updateFakeViewsConfig = (newConfig) => {
  Object.assign(FAKE_VIEWS_CONFIG, newConfig);
  console.log('✅ Fake views config updated:', FAKE_VIEWS_CONFIG);
};

/**
 * Get current fake views configuration
 */
export const getFakeViewsConfig = () => {
  return { ...FAKE_VIEWS_CONFIG };
};

/**
 * Helper: Tambahkan views secara manual untuk project tertentu
 * @param {string} projectId - Project ID
 * @param {number} views - Jumlah views
 */
export const setManualViews = (projectId, views) => {
  const STORAGE_KEY = 'portfolio_views';
  const existingViews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  
  existingViews[projectId] = views;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingViews));
  
  console.log(`✅ Set manual views for "${projectId}": ${views} views`);
  
  return views;
};

// Auto-seed saat pertama kali load (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Seed fake views jika belum ada
  const hasViews = localStorage.getItem('portfolio_views');
  if (!hasViews) {
    console.log('🎬 First time loading - seeding fake views...');
    seedFakeViews();
  }
}

export default {
  generateFakeViews,
  generateNewProjectViews,
  seedFakeViews,
  seedFakeViewsToAPI,
  addFakeViewsForNewProject,
  resetAllViews,
  updateFakeViewsConfig,
  getFakeViewsConfig,
  setManualViews,
  FAKE_VIEWS_CONFIG
};
