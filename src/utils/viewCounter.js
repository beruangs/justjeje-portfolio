// View Counter Utility
// Supports both localStorage (per-device) and CountAPI (global)

const STORAGE_KEY = 'portfolio_views';
const COUNTAPI_BASE = 'https://api.countapi.xyz';

/**
 * Get all views from localStorage
 */
export const getLocalViews = () => {
  try {
    const views = localStorage.getItem(STORAGE_KEY);
    return views ? JSON.parse(views) : {};
  } catch (error) {
    console.error('Error reading views from localStorage:', error);
    return {};
  }
};

/**
 * Save views to localStorage
 */
const saveLocalViews = (views) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch (error) {
    console.error('Error saving views to localStorage:', error);
  }
};

/**
 * Increment view count for a project (localStorage)
 * @param {string} projectId - The project ID
 * @returns {number} - New view count
 */
export const incrementLocalView = (projectId) => {
  const views = getLocalViews();
  views[projectId] = (views[projectId] || 0) + 1;
  saveLocalViews(views);
  return views[projectId];
};

/**
 * Get view count for a project (localStorage)
 * @param {string} projectId - The project ID
 * @returns {number} - View count
 */
export const getLocalViewCount = (projectId) => {
  const views = getLocalViews();
  return views[projectId] || 0;
};

/**
 * Increment view using CountAPI (global counter)
 * @param {string} projectId - The project ID
 * @returns {Promise<number>} - Total view count from API
 */
export const incrementGlobalView = async (projectId) => {
  try {
    // Format: namespace/key/action
    // Namespace bisa diganti dengan domain Anda
    const namespace = 'justjeje-portfolio';
    const url = `${COUNTAPI_BASE}/hit/${namespace}/${projectId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.value || 0;
  } catch (error) {
    console.error('Error incrementing global view:', error);
    return null;
  }
};

/**
 * Get global view count from CountAPI
 * @param {string} projectId - The project ID
 * @returns {Promise<number>} - View count
 */
export const getGlobalViewCount = async (projectId) => {
  try {
    const namespace = 'justjeje-portfolio';
    const url = `${COUNTAPI_BASE}/get/${namespace}/${projectId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.value || 0;
  } catch (error) {
    console.error('Error getting global view:', error);
    return null;
  }
};

/**
 * Track project view - increments both local and global counters
 * @param {string} projectId - The project ID
 * @returns {Promise<object>} - Object containing local and global view counts
 */
export const trackProjectView = async (projectId) => {
  // Check if this project was already viewed in this session
  const sessionKey = `viewed_${projectId}`;
  const alreadyViewed = sessionStorage.getItem(sessionKey);
  
  if (alreadyViewed) {
    // Already viewed in this session, just return current counts
    return {
      local: getLocalViewCount(projectId),
      global: await getGlobalViewCount(projectId),
      isNewView: false
    };
  }
  
  // Mark as viewed in this session
  sessionStorage.setItem(sessionKey, 'true');
  
  // Increment both counters
  const localCount = incrementLocalView(projectId);
  const globalCount = await incrementGlobalView(projectId);
  
  return {
    local: localCount,
    global: globalCount,
    isNewView: true
  };
};

/**
 * Format view count for display
 * @param {number} count - View count
 * @returns {string} - Formatted string (e.g., "1.2K", "15")
 */
export const formatViewCount = (count) => {
  if (!count || count === 0) return '0';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Get total views across all projects
 * @returns {Promise<object>} - Object with local and global totals
 */
export const getTotalViews = async () => {
  const localViews = getLocalViews();
  const localTotal = Object.values(localViews).reduce((sum, count) => sum + count, 0);
  
  // Note: Getting global total requires fetching each project individually
  // This is a limitation of free CountAPI
  
  return {
    local: localTotal,
    projectCount: Object.keys(localViews).length
  };
};

export default {
  trackProjectView,
  getLocalViewCount,
  getGlobalViewCount,
  incrementLocalView,
  incrementGlobalView,
  formatViewCount,
  getTotalViews,
  getLocalViews
};
