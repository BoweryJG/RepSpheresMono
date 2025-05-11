/**
 * Demo Authentication Service - AUTHENTICATION DISABLED
 * 
 * This service has been modified to bypass all authentication.
 * It always returns authenticated status with a default user.
 */

// Default user for bypassed authentication
const defaultUser = {
  id: 'default-user-id',
  email: 'user@example.com'
};

/**
 * Signs in - always succeeds with default user
 * @param {string} email - User email (ignored)
 * @param {string} password - User password (ignored)
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithEmail = async (email, password) => {
  console.log('Auth bypassed: Auto-login successful');
  return { 
    success: true, 
    user: defaultUser, 
    session: { id: 'auto-session-' + Date.now() }
  };
};

/**
 * Signs out user - no-op since auth is bypassed
 * @returns {Promise<Object>} - Sign out result
 */
export const signOut = async () => {
  console.log('Auth bypassed: Sign out ignored');
  return { success: true };
};

/**
 * Gets the current session (always returns a session)
 * @returns {Promise<Object>} - Current session
 */
export const getCurrentSession = async () => {
  return { 
    success: true, 
    session: { id: 'auto-session-' + Date.now() }
  };
};

/**
 * Gets the current user - always returns default user
 * @returns {Promise<Object>} - Current user
 */
export const getCurrentUser = async () => {
  return { 
    success: true, 
    user: defaultUser
  };
};

/**
 * Refreshes the current session
 * @returns {Promise<Object>} - Refreshed session
 */
export const refreshSession = async () => {
  return getCurrentSession();
};

/**
 * Checks if the user is authenticated - always returns true
 * @returns {Promise<boolean>} - Is authenticated
 */
export const isAuthenticated = async () => {
  return true;
};

/**
 * Signs up with email and password - always succeeds with default user
 * @param {string} email - User email (ignored)
 * @param {string} password - User password (ignored)
 * @returns {Promise<Object>} - Sign up result
 */
export const signUpWithEmail = async (email, password) => {
  console.log('Auth bypassed: Auto-signup successful');
  return { 
    success: true, 
    user: defaultUser,
    session: { id: 'auto-session-' + Date.now() }
  };
};

/**
 * Signs in with Google OAuth - always succeeds with default user
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithGoogle = async () => {
  console.log('Auth bypassed: Auto-Google login successful');
  return { 
    success: true, 
    user: defaultUser,
    session: { id: 'auto-session-' + Date.now() }
  };
};

/**
 * Signs in with Facebook OAuth - always succeeds with default user
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithFacebook = async () => {
  console.log('Auth bypassed: Auto-Facebook login successful');
  return { 
    success: true, 
    user: defaultUser,
    session: { id: 'auto-session-' + Date.now() }
  };
};

/**
 * Handles the OAuth redirect - always succeeds with default session
 * @returns {Promise<Object>} - Auth result
 */
export const handleOAuthRedirect = async () => {
  return { 
    success: true, 
    session: { id: 'auto-session-' + Date.now() }
  };
};
