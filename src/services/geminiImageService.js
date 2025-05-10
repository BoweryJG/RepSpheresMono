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
    
    // Call Gemini API to generate an image directly
    const imageUrl = await callGeminiImageAPI(prompt);
    
    // Verify the image URL works before caching it
    if (imageUrl && imageUrl.startsWith('data:image')) { // Check if it's a data URL
      try {
        // Pre-validate the URL (data URLs are intrinsically 'valid' if correctly formatted)
        // The validateImageUrl function might need adjustment for data URLs or can be skipped.
        console.log('Successfully received Gemini-generated image data URL');
        geminiImageCache.set(cacheKey, imageUrl);
        return imageUrl;
      } catch (validationError) {
        console.error('Error during (or after) Gemini image generation:', validationError);
        // Fall through to default error handling
      }
    } else if (imageUrl) {
      // If it's not a data URL, but some other URL (less likely with this new logic)
      // attempt to validate it as before.
       try {
        const validateImage = await validateImageUrl(imageUrl);
        if (validateImage) {
          console.log('Successfully validated Gemini-returned (non-data) image URL');
          geminiImageCache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (validationError) {
        console.error('Error validating Gemini (non-data) image URL:', validationError);
      }
    }
    
    // Fallback to traditional methods if Gemini fails to return a valid image data URL
    throw new Error('Gemini image generation failed or did not return a valid image data URL');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    
    // First try reliable image URL as a fallback
    const reliableUrl = getReliableImageUrl(null, articleData, industry);
    return reliableUrl;
  }
};

/**
 * Validate that an image URL exists and can be loaded
 * @param {string} url - URL to validate
 * @returns {Promise<boolean>} - Whether the image URL is valid
 */
const validateImageUrl = async (url) => {
  // For data URLs, they are intrinsically valid if correctly formatted and generated.
  // The browser will attempt to render them directly.
  if (url.startsWith('data:')) {
    console.log('Skipping network validation for data URL.');
    return true; 
  }
  
  // For Unsplash URLs, they're generally reliable so we'll assume they work
  // This might be revisited if Unsplash reliability becomes an issue.
  if (url.includes('unsplash.com')) {
    return true;
  }
  
  try {
    // Create a promise that resolves when the image loads 
    // or rejects on error or timeout
    return await new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set a timeout in case the image takes too long to load
      const timeout = setTimeout(() => {
        reject(new Error('Image load timed out'));
      }, 5000); // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image failed to load'));
      };
      
      img.src = url;
    });
  } catch (error) {
    console.error('Image validation error:', error);
    return false;
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
  let prompt = `Generate a premium, award-winning editorial image for a prestigious ${industry} industry publication about: ${title}. `;
  
  // Add category context with emphasis on premium quality
  prompt += `This is for a feature article in the ${category} category of a high-end ${industry} industry publication. `;
  
  // Add summary for more context if available
  if (summary && summary.length > 0) {
    // Use only first 100 chars of summary to keep prompt concise
    const shortSummary = summary.length > 100 ? `${summary.substring(0, 100)}...` : summary;
    prompt += `Article summary: ${shortSummary}. `;
  }
  
  // Add specific style guidance focusing on extremely high quality
  prompt += 'The image MUST be the absolute highest quality - magazine-cover worthy, photographic excellence, perfect lighting, expert composition, with striking visual impact. ';
  
  // Add industry-specific elements with premium focus
  if (industry.toLowerCase() === 'dental') {
    prompt += 'It should feature state-of-the-art dental technology, pristine modern dental environments, award-winning dental professionals, or innovative dental treatments. Think Apple-level product photography quality for dental context. ';
  } else if (industry.toLowerCase() === 'aesthetic') {
    prompt += 'It should showcase luxury spa environments, high-end beauty treatments, celebrity-quality aesthetic outcomes, premium skincare products, or elegant beauty professionals in immaculate settings. The image should evoke aspirational beauty standards. ';
  }
  
  // Further quality enhancements
  prompt += 'The image must have perfect lighting, exceptional clarity, artistic composition, and DSLR-quality depth of field. ';
  prompt += 'Think professional magazine photography - Forbes, Vogue, or National Geographic quality. ';
  
  // Avoid problematic content
  prompt += 'Ensure the image is sophisticated, tasteful, and represents the premium side of the industry. No disturbing medical imagery.';
  
  return prompt;
};

/**
 * Calls the Gemini API to generate an image based on the prompt.
 * Uses the 'gemini-2.0-flash-preview-image-generation' model.
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<string|null>} - Data URL of the generated image (e.g., data:image/png;base64,...) or null on failure.
 */
const callGeminiImageAPI = async (prompt) => {
  try {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';
    
    const requestData = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"], // Request both image and text as per documentation
        // Other potential configs (match to API docs if needed):
        // "temperature": 0.4,
        // "topP": 1.0,
        // "topK": 32,
        // "maxOutputTokens": 2048, // Or whatever is appropriate for image metadata/text part
      },
      // Safety settings can be configured here if needed. Example from docs:
      // safetySettings: [
      //   { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      //   { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      //   { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      // ],
    };
    
    console.log(`Generating image with Gemini (gemini-2.0-flash-preview-image-generation) for prompt: "${prompt.substring(0, 100)}..."`);
    
    const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorBody = await response.text(); // Get more details from the error response
      console.error('Gemini API Error Status:', response.status, 'Body:', errorBody);
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();

    // Process the response to extract the image data
    if (responseData.candidates && responseData.candidates.length > 0) {
      const candidate = responseData.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png'; // Default to png if not specified
            const base64ImageData = part.inlineData.data;
            console.log(`Successfully received image data from Gemini. Mime-type: ${mimeType}.`);
            return `data:${mimeType};base64,${base64ImageData}`;
          } else if (part.text) {
            // Log any text part, it might contain useful info or refusal reasons
            console.log('Gemini API returned text part:', part.text);
          }
        }
      }
    }

    // If no image data is found after checking all parts and candidates
    console.warn('Gemini API response did not contain image data in the expected format. Response:', JSON.stringify(responseData, null, 2));
    throw new Error('Gemini API did not return image data.');

  } catch (error) {
    console.error('Error in callGeminiImageAPI:', error);
    return null; // Return null to allow fallbacks in generateImageWithGemini to take over
  }
};

/**
 * Get a fallback image URL using various strategies, with Gemini image generation as a primary option.
 * This function attempts to generate an image with Gemini first. If that fails or returns an invalid URL,
 * it falls back to other methods defined in `imageService.js`.
 * 
 * @param {Object} articleData - The article object, containing title, summary, category etc.
 * @param {string} industry - The industry context (e.g., 'dental', 'aesthetic').
 * @returns {Promise<string>} - A promise that resolves to the best available image URL.
 */
export const getGeminiFallbackImageUrl = async (articleData, industry) => {
  try {
    // Attempt to generate a unique image with Gemini first
    const geminiImageUrl = await generateImageWithGemini(articleData, industry);
    if (geminiImageUrl && geminiImageUrl.startsWith('data:image')) {
      // If Gemini provides a valid data URL, use it
      console.log('Using Gemini-generated image for:', articleData.title);
      return geminiImageUrl;
    } else if (geminiImageUrl) {
      // If it's some other URL from Gemini (less likely with new logic, but handle just in case)
      const isValid = await validateImageUrl(geminiImageUrl);
      if (isValid) {
        console.log('Using validated (non-data) Gemini URL for:', articleData.title);
        return geminiImageUrl;
      }
    }
    // If Gemini fails or returns an invalid/non-data URL, log it and proceed to other fallbacks
    console.warn('Gemini image generation failed or returned invalid URL, attempting other fallbacks for:', articleData.title);
  } catch (geminiError) {
    console.error('Error during Gemini image generation attempt:', geminiError);
    // Log the error and proceed to other fallbacks
  }

  // Fallback to Unsplash or category image if Gemini fails
  console.log('Falling back to Unsplash/category image for:', articleData.title);
  const fallbackUrl = getFallbackImageUrl(articleData.category, industry, articleData.title);
  return fallbackUrl;
};
