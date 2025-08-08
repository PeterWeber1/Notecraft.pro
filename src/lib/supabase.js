import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxkmwaenxhkwbjbkpglv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14a213YWVueGhrd2JqYmtwZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDA3NTcsImV4cCI6MjA3MDA3Njc1N30.4FgFW-aaiNBz1FKIh-RroWw4UHEICEqmVPkf2gG2efI'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const authHelpers = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Additional user metadata
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
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }
}

export default supabase