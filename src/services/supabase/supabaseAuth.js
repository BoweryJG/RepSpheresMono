import { supabase } from './supabaseClient';

// Providers
const GOOGLE_PROVIDER = 'google';
const FACEBOOK_PROVIDER = 'facebook';

/**
 * Signs in to Supabase using email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Signs out from Supabase
 * @returns {Promise<Object>} - Sign out result
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets the current session
 * @returns {Promise<Object>} - Current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Error getting session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets the current user
 * @returns {Promise<Object>} - Current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Refreshes the current session
 * @returns {Promise<Object>} - Refreshed session
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Checks if the user is authenticated
 * @returns {Promise<boolean>} - Is authenticated
 */
export const isAuthenticated = async () => {
  const { success, session } = await getCurrentSession();
  return success && session !== null;
};

/**
 * Signs up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Sign up result
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { 
      success: true, 
      user: data.user, 
      session: data.session,
      emailConfirmationRequired: !data.session 
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Signs in with Google OAuth
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: GOOGLE_PROVIDER,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    
    return { success: true, url: data.url };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Signs in with Facebook OAuth
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: FACEBOOK_PROVIDER,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    
    return { success: true, url: data.url };
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handles the OAuth redirect
 * @returns {Promise<Object>} - Auth result
 */
export const handleOAuthRedirect = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Error handling OAuth redirect:', error);
    return { success: false, error: error.message };
  }
};
