/**
 * Demo Authentication Service
 * 
 * This service provides simplified authentication for demonstration purposes.
 * It allows anyone to sign up and sign in with minimal validation.
 */

// In-memory store for demo users
const demoUsers = new Map();

// Demo user counter for generating IDs
let userCounter = 1;

/**
 * Signs in using provided email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithEmail = async (email, password) => {
  try {
    // Basic validation
    if (!email) {
      throw new Error('Email is required');
    }
    
    if (!password) {
      throw new Error('Password is required');
    }
    
    // Check if user exists
    if (!demoUsers.has(email)) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    
    // Get the user
    const user = demoUsers.get(email);
    console.log(`Demo auth: Login successful for ${email}`);
    
    return { 
      success: true, 
      user: { id: user.id, email: user.email }, 
      session: { id: 'demo-session-' + Date.now() }
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Signs out user
 * @returns {Promise<Object>} - Sign out result
 */
export const signOut = async () => {
  try {
    console.log('Demo auth: Signed out');
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets the current session (always returns a demo session)
 * @returns {Promise<Object>} - Current session
 */
export const getCurrentSession = async () => {
  return { 
    success: true, 
    session: { id: 'demo-session-' + Date.now() }
  };
};

/**
 * Gets the current user
 * @returns {Promise<Object>} - Current user
 */
export const getCurrentUser = async () => {
  try {
    // In a real implementation, this would get the user from localStorage or cookies
    // For demo purposes, we'll check if any users exist and return the first one
    if (demoUsers.size > 0) {
      // Get the first user in the Map
      const firstUserKey = Array.from(demoUsers.keys())[0];
      const user = demoUsers.get(firstUserKey);
      
      return { 
        success: true, 
        user: { id: user.id, email: user.email }
      };
    }
    
    // No users exist yet
    return { 
      success: false, 
      error: 'No authenticated user found' 
    };
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
  return getCurrentSession();
};

/**
 * Checks if the user is authenticated
 * @returns {Promise<boolean>} - Is authenticated
 */
export const isAuthenticated = async () => {
  // In a real implementation, this would check the localStorage or cookies
  // For demo purposes, we'll check if there are any users in our Map
  return demoUsers.size > 0;
};

/**
 * Signs up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Sign up result
 */
export const signUpWithEmail = async (email, password) => {
  try {
    // Basic validation
    if (!email) {
      throw new Error('Email is required');
    }
    
    if (!password) {
      throw new Error('Password is required');
    }
    
    // Create new user
    const userId = `demo-user-${userCounter++}`;
    demoUsers.set(email, {
      id: userId,
      email,
      password
    });
    
    console.log(`Demo auth: Created new user ${email}`);
    
    return { 
      success: true, 
      user: { id: userId, email },
      session: { id: 'demo-session-' + Date.now() }
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Signs in with Google OAuth (mocked in demo mode)
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithGoogle = async () => {
  try {
    // Generate a Google email
    const email = `google-user-${Date.now()}@example.com`;
    
    // Create a user if needed
    const userId = `google-user-${userCounter++}`;
    demoUsers.set(email, {
      id: userId,
      email,
      password: 'google-oauth-login',
      provider: 'google'
    });
    
    console.log(`Demo auth: Google login simulated for ${email}`);
    
    return { 
      success: true, 
      user: { id: userId, email },
      session: { id: 'google-session-' + Date.now() }
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Signs in with Facebook OAuth (mocked in demo mode)
 * @returns {Promise<Object>} - Sign in result
 */
export const signInWithFacebook = async () => {
  try {
    // Generate a Facebook email
    const email = `facebook-user-${Date.now()}@example.com`;
    
    // Create a user if needed
    const userId = `facebook-user-${userCounter++}`;
    demoUsers.set(email, {
      id: userId,
      email,
      password: 'facebook-oauth-login',
      provider: 'facebook'
    });
    
    console.log(`Demo auth: Facebook login simulated for ${email}`);
    
    return { 
      success: true, 
      user: { id: userId, email },
      session: { id: 'facebook-session-' + Date.now() }
    };
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handles the OAuth redirect (not needed in demo mode)
 * @returns {Promise<Object>} - Auth result
 */
export const handleOAuthRedirect = async () => {
  return { 
    success: true, 
    session: { id: 'oauth-session-' + Date.now() }
  };
};
