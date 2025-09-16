import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxkmwaenxhkwbjbkpglv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14a213YWVueGhrd2JqYmtwZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDA3NTcsImV4cCI6MjA3MDA3Njc1N30.4FgFW-aaiNBz1FKIh-RroWw4UHEICEqmVPkf2gG2efI'

// Get the redirect URL based on environment and current domain
const getRedirectUrl = () => {
  // Priority: 1. Environment variable, 2. Production fallback, 3. Current origin (development)
  if (process.env.REACT_APP_PRODUCTION_URL) {
    return process.env.REACT_APP_PRODUCTION_URL;
  }

  // Production fallback - use the current domain to support both www and app subdomains
  if (process.env.NODE_ENV === 'production') {
    const currentHostname = window.location.hostname;
    if (currentHostname === 'app.notecraft.pro') {
      return 'https://app.notecraft.pro';
    }
    return 'https://www.notecraft.pro';
  }

  // Development fallback - use localhost for testing
  return window.location.origin;
};

/* 
 * IMPORTANT: Supabase Dashboard Configuration
 *
 * To fix email confirmation redirects completely, you also need to:
 * 1. Go to your Supabase Dashboard → Authentication → URL Configuration
 * 2. Set Site URL to: https://www.notecraft.pro
 * 3. Add Redirect URLs:
 *    - https://www.notecraft.pro/**
 *    - http://localhost:3000/** (for development testing)
 *
 * This ensures emails use the correct redirect URL regardless of where the request originates.
 */

// Create Supabase client with auto-confirm disabled (users can login before email verification)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const authHelpers = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Additional user metadata
        emailRedirectTo: getRedirectUrl()
      }
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user session
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen for auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Update user profile
  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  },

  // Reset password
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl()
    })
    return { data, error }
  },

  // Resend email confirmation
  resendEmailConfirmation: async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: getRedirectUrl()
      }
    })
    return { data, error }
  }
}

export default supabase