import { supabase } from './supabaseClient';

// Default user for bypassed authentication
const defaultUser = {
  id: 'default-supabase-user-id',
  email: 'user@example.com'
};

// Default session for bypassed authentication
const getDefaultSession = () => ({
  id: 'default-session-' + Date.now(),
  user: defaultUser
});

/**
 * Signs in to Supabase - authentication bypassed
 * @param {string} email - User email (ignored)
 * @param {string} password - User password (ignored)
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithEmail = async (email, password) => {
  console.log('Supabase auth bypassed: Auto-login successful');
  return { 
    success: true, 
    user: defaultUser, 
    session: getDefaultSession() 
  };
};

/**
 * Signs out from Supabase - authentication bypassed
 * @returns {Promise<Object>} - Sign out result
 */
export const signOut = async () => {
  console.log('Supabase auth bypassed: Sign out ignored');
  return { success: true };
};

/**
 * Gets the current session - authentication bypassed
 * @returns {Promise<Object>} - Current session
 */
export const getCurrentSession = async () => {
  return { 
    success: true, 
    session: getDefaultSession() 
  };
};

/**
 * Gets the current user - authentication bypassed
 * @returns {Promise<Object>} - Current user
 */
export const getCurrentUser = async () => {
  return { 
    success: true, 
    user: defaultUser 
  };
};

/**
 * Refreshes the current session - authentication bypassed
 * @returns {Promise<Object>} - Refreshed session
 */
export const refreshSession = async () => {
  return { 
    success: true, 
    session: getDefaultSession() 
  };
};

/**
 * Checks if the user is authenticated - always returns true
 * @returns {Promise<boolean>} - Is authenticated
 */
export const isAuthenticated = async () => {
  return true;
};

/**
 * Signs up with email and password - authentication bypassed
 * @param {string} email - User email (ignored)
 * @param {string} password - User password (ignored)
 * @returns {Promise<Object>} - Sign up result
 */
export const signUpWithEmail = async (email, password) => {
  console.log('Supabase auth bypassed: Auto-signup successful');
  return { 
    success: true, 
    user: defaultUser, 
    session: getDefaultSession(),
    emailConfirmationRequired: false
  };
};

/**
 * Signs in with Google OAuth - authentication bypassed
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithGoogle = async () => {
  console.log('Supabase auth bypassed: Auto-Google login successful');
  return { 
    success: true, 
    user: defaultUser,
    url: window.location.origin // Provide a URL to maintain compatibility
  };
};

/**
 * Signs in with Facebook OAuth - authentication bypassed
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithFacebook = async () => {
  console.log('Supabase auth bypassed: Auto-Facebook login successful');
  return { 
    success: true, 
    user: defaultUser,
    url: window.location.origin // Provide a URL to maintain compatibility
  };
};

/**
 * Handles the OAuth redirect - authentication bypassed
 * @returns {Promise<Object>} - Auth result
 */
export const handleOAuthRedirect = async () => {
  console.log('Supabase auth bypassed: OAuth redirect handled automatically');
  return { 
    success: true, 
    session: getDefaultSession()
  };
};
