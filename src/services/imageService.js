/**
 * Image Service
 * 
 * This service handles image loading with multiple fallbacks.
 * It ensures that relevant images are always displayed, even when
 * original images fail to load.
 */

// Cache successful image URLs in memory to avoid repeated fallbacks
const imageCache = new Map();

/**
 * Get an image URL with multiple fallback options
 * @param {string} originalImageUrl - Original image URL from article
 * @param {Object} articleData - Article data containing title, content, etc.
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {string} - A reliable image URL
 */
export const getReliableImageUrl = (originalImageUrl, articleData, industry) => {
  const cacheKey = `${articleData.title}-${industry}`;
  
  // Return cached URL if available
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  // Return original URL if provided
  if (originalImageUrl && originalImageUrl.trim() !== '') {
    return originalImageUrl;
  }
  
  // Extract keywords for better image search
  const keywords = extractKeywords(articleData, industry);
  
  // Return Unsplash image URL with specific keywords
  const unsplashUrl = `https://source.unsplash.com/featured/600x400/?${keywords}`;
  
  // Cache the URL
  imageCache.set(cacheKey, unsplashUrl);
  
  return unsplashUrl;
};

/**
 * Get a reliable fallback image URL if the primary image fails to load
 * Uses a different image source to ensure diversity
 * @param {Object} articleData - Article data containing title, content, etc.
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {string} - A reliable fallback image URL
 */
export const getFallbackImageUrl = (articleData, industry) => {
  const { category } = articleData;
  
  // First try a category-specific default image
  const categoryImage = getDefaultCategoryImage(category, industry);
  if (categoryImage) {
    return categoryImage;
  }
  
  // Otherwise, return an industry-specific image
  return getDefaultIndustryImage(industry);
};

/**
 * Extract relevant keywords from article data for better image search
 * @param {Object} articleData - Article data containing title, content, etc.
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {string} - Comma-separated keywords for image search
 */
const extractKeywords = (articleData, industry) => {
  const { title, content, category } = articleData;
  
  // Start with industry and category
  let keywords = `${industry},${category}`;
  
  // Extract important words from title
  if (title) {
    // Remove common words
    const filteredTitle = title.replace(/\b(and|the|a|an|of|for|in|on|to|with|by)\b/gi, '');
    
    // Find key terms
    const titleMatches = filteredTitle.match(/\b(\w{4,})\b/g);
    if (titleMatches && titleMatches.length > 0) {
      // Add up to 3 key terms from title
      const titleTerms = titleMatches.slice(0, 3).join(',');
      keywords += `,${titleTerms}`;
    }
  }
  
  return encodeURIComponent(keywords);
};

/**
 * Get a default category-specific image URL
 * @param {string} category - Article category
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {string} - Default image URL for the category
 */
export const getDefaultCategoryImage = (category, industry) => {
  // Define reliable image URLs for dental industry categories
  const dentalImages = {
    'Technology': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Business': 'https://images.unsplash.com/photo-1573164574001-518958d9aeea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Clinical': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Education': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Research': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Regulation': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
  };
  
  // Define reliable image URLs for aesthetic industry categories
  const aestheticImages = {
    'Technology': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Business': 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Treatments': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Skincare': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'Trends': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
  };
  
  const categoryImages = industry.toLowerCase() === 'dental' ? dentalImages : aestheticImages;
  
  return categoryImages[category] || null;
};

/**
 * Get a default industry-specific image URL
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {string} - Default image URL for the industry
 */
const getDefaultIndustryImage = (industry) => {
  // Default industry images as final fallback
  const industryImages = {
    'dental': 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'aesthetic': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
  };
  
  return industryImages[industry.toLowerCase()] || 
         'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
};

/**
 * Get array of reliable backup image URLs for a specific category and industry
 * @param {string} category - Article category
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {Array<string>} - Array of backup image URLs
 */
export const getBackupImagesForCategory = (category, industry) => {
  const backupImages = {
    'dental': {
      'Technology': [
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1590424263400-5b8ceec7aa24?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1609840112990-4265448268d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      ],
      'Business': [
        'https://images.unsplash.com/photo-1573164574001-518958d9aeea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      ],
      'Clinical': [
        'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      ]
    },
    'aesthetic': {
      'Technology': [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      ],
      'Skincare': [
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1556228578-b2451426aabb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      ]
    }
  };
  
  const industryBackups = backupImages[industry.toLowerCase()] || {};
  const categoryBackups = industryBackups[category] || [];
  
  // If we don't have specific backups for this category, return general industry backups
  if (categoryBackups.length === 0) {
    const general = industry.toLowerCase() === 'dental' ? [
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    ] : [
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    ];
    
    return general;
  }
  
  return categoryBackups;
};

/**
 * Get a random rotation index for backup images to avoid showing the same image every time
 * @param {string} title - Article title to use as seed
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} - Index between 0 and max-1
 */
export const getRotationIndex = (title, max) => {
  // Use the title as a simple hash to get a consistent index for the same article
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Get a positive number and modulo by max
  return Math.abs(hash) % max;
};
