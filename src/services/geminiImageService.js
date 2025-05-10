/**
 * Gemini Image Service
 * 
 * This service uses Google's Gemini API to generate relevant images for articles.
 * It provides a fallback mechanism for when original images fail to load.
 */

import { getReliableImageUrl, getFallbackImageUrl } from './imageService';

// API key for Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Cache for generated images to avoid duplicate API calls
const geminiImageCache = new Map();

/**
 * Generate an image URL using Gemini API based on article content
 * @param {Object} articleData - Article data containing title, content, category, etc.
 * @param {string} industry - Industry (dental or aesthetic)
 * @returns {Promise<string>} - URL to the generated image
 */
export const generateImageWithGemini = async (articleData, industry) => {
  try {
    const cacheKey = `gemini-${articleData.title}-${industry}`;
    
    // Return cached image if available
    if (geminiImageCache.has(cacheKey)) {
      console.log('Using cached Gemini image for:', articleData.title);
      return geminiImageCache.get(cacheKey);
    }
    
    // Create prompt for image generation
    const prompt = createImageGenerationPrompt(articleData, industry);
    
    // Call Gemini API
    const imageUrl = await callGeminiImageAPI(prompt);
    
    // Cache the result
    if (imageUrl) {
      geminiImageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    // Fallback to traditional methods if Gemini fails
    throw new Error('Gemini image generation failed');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    
    // First try reliable image URL
    const reliableUrl = getReliableImageUrl(null, articleData, industry);
    return reliableUrl;
  }
};

/**
 * Create a detailed prompt for Gemini image generation
 * @param {Object} articleData - Article data
 * @param {string} industry - Industry
 * @returns {string} - Detailed prompt for image generation
 */
const createImageGenerationPrompt = (articleData, industry) => {
  const { title, summary, category } = articleData;
  
  // Base prompt indicating what we need
  let prompt = `Generate a professional and realistic ${industry} industry image for a news article about: ${title}. `;
  
  // Add category context
  prompt += `This is related to the ${category} category in the ${industry} industry. `;
  
  // Add summary for more context if available
  if (summary && summary.length > 0) {
    // Use only first 100 chars of summary to keep prompt concise
    const shortSummary = summary.length > 100 ? `${summary.substring(0, 100)}...` : summary;
    prompt += `Article summary: ${shortSummary}. `;
  }
  
  // Add specific style guidance
  prompt += 'The image should be photorealistic, professional, high-quality, and suitable for a business publication. ';
  
  // Add industry-specific elements
  if (industry.toLowerCase() === 'dental') {
    prompt += 'It may include elements like modern dental equipment, dental professionals, dental practices, or dental technology, as appropriate. ';
  } else if (industry.toLowerCase() === 'aesthetic') {
    prompt += 'It may include elements like skincare products, aesthetic treatments, spa environments, or beauty professionals, as appropriate. ';
  }
  
  // Avoid problematic content
  prompt += 'Avoid any disturbing medical imagery, ensure it is workplace-appropriate, and focus on positive aspects of the industry.';
  
  return prompt;
};

/**
 * Generate an image URL based on the prompt
 * Since Gemini doesn't have direct image generation capabilities,
 * we'll use a different approach - generating a consistent URL for Unsplash
 * with detailed search parameters based on our prompt.
 * 
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<string>} - URL to an image
 */
const callGeminiImageAPI = async (prompt) => {
  try {
    // Extract key phrases from the prompt
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // First, use Gemini to extract key terms from our detailed prompt
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `Extract 3-5 most important visual keywords from this text, separated by commas only, no additional text: "${prompt}"`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 256,
      }
    };
    
    console.log('Generating optimized keywords with Gemini for:', prompt.substring(0, 50) + '...');
    
    const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      console.warn(`Gemini API responded with status: ${response.status}`);
      // Fall back to direct keywords from prompt
      const keywords = prompt.split(' ').slice(0, 5).join(',');
      return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(keywords)}`;
    }
    
    const data = await response.json();
    
    // Extract keywords from Gemini response
    let keywords = '';
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      const parts = data.candidates[0].content.parts;
      for (const part of parts) {
        if (part.text) {
          keywords = part.text.trim();
          break;
        }
      }
    }
    
    if (!keywords) {
      // Fall back to direct extraction if no keywords found
      keywords = prompt.split(' ').slice(0, 5).join(',');
    }
    
    console.log('Generated optimized keywords:', keywords);
    
    // Use Unsplash with our highly specific, AI-generated keywords
    return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(keywords)}`;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
};

/**
 * Get a fallback image URL with Gemini as primary option
 * @param {Object} articleData - Article data
 * @param {string} industry - Industry
 * @returns {Promise<string>} - Best available image URL
 */
export const getGeminiFallbackImageUrl = async (articleData, industry) => {
  try {
    // First try Gemini
    const geminiUrl = await generateImageWithGemini(articleData, industry);
    if (geminiUrl) return geminiUrl;
    
    // If Gemini fails, use traditional fallbacks
    return getFallbackImageUrl(articleData, industry);
  } catch (error) {
    console.error('Error getting Gemini fallback image:', error);
    return getFallbackImageUrl(articleData, industry);
  }
};
