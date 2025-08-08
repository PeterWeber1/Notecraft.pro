import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabase';
import Cookies from 'js-cookie';

// Account Management Context
const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

// Enhanced Account Manager with Supabase Auth + Secure Token Storage
function AccountManager({ children, isDarkMode = false }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Debug log
  console.log('🔐 AccountManager loaded');

  const theme = {
    background: isDarkMode ? '#000000' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    cardBackground: isDarkMode ? '#202020' : '#ffffff',
    cardBorder: isDarkMode ? '#404040' : '#e0e0e0',
    primary: '#635bff',
    accent: '#635bff',
    success: '#000000',
    error: '#000000',
    warning: '#000000'
  };

  // Initialize Supabase Auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if supabase is properly initialized
        if (!supabase || !supabase.auth) {
          console.warn('Supabase not configured, using fallback mode');
          setIsLoading(false);
          return;
        }

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Load user subscription from secure storage or API
          await loadUserSubscription(session.user.id);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session);
            
            if (session) {
              setSession(session);
              setUser(session.user);
              await loadUserSubscription(session.user.id);
              
              // Store refresh token in httpOnly cookie (simulated with secure cookie)
              Cookies.set('supabase_refresh_token', session.refresh_token, {
                httpOnly: false, // Note: Real httpOnly requires server-side implementation
                secure: true,
                sameSite: 'strict',
                expires: 30 // 30 days
              });
              
            } else {
              setSession(null);
              setUser(null);
              setSubscription(null);
              
              // Clear cookies
              Cookies.remove('supabase_refresh_token');
              Cookies.remove('user_subscription');
            }
          }
        );
        
        return () => subscription.unsubscribe();
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Authentication system not configured. Please check your environment variables.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Load user subscription data
  const loadUserSubscription = async (userId) => {
    try {
      // In production, this would be a Supabase RPC call or API endpoint
      // For now, we'll use secure cookie storage as a bridge
      const savedSubscription = Cookies.get('user_subscription');
      
      if (savedSubscription) {
        setSubscription(JSON.parse(savedSubscription));
      } else {
        // Set default basic subscription for new users
        const basicSubscription = {
          id: `sub_${Date.now()}`,
          user_id: userId,
          plan: 'basic',
          status: 'active',
          created_at: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: getPlanFeatures('basic')
        };
        
        setSubscription(basicSubscription);
        Cookies.set('user_subscription', JSON.stringify(basicSubscription), {
          secure: true,
          sameSite: 'strict',
          expires: 30
        });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  // Enhanced registration with Supabase Auth
  const register = async (userData) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Validate user data
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('All fields are required');
      }
      
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!userData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            preferences: {
              emailNotifications: true,
              marketingEmails: false,
              theme: isDarkMode ? 'dark' : 'light'
            }
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        setError('Please check your email for a confirmation link');
      } else {
        setShowRegisterModal(false);
        setShowLoginModal(false);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Enhanced login with Supabase Auth
  const login = async (email, password) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setShowLoginModal(false);
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Social login with Supabase
  const loginWithProvider = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Social login error:', error);
      setError(error.message);
    }
  };

  // Secure logout with Supabase
  const logout = async () => {
    try {
      setIsAuthenticating(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all user data
      setUser(null);
      setSession(null);
      setSubscription(null);
      setError(null);
      
      // Clear cookies
      Cookies.remove('supabase_refresh_token');
      Cookies.remove('user_subscription');
      
      // Close any open modals
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowUpgradeModal(false);
      setShowProfileModal(false);
      setShowBillingModal(false);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Enhanced subscription management (will integrate with Stripe)
  const upgradeSubscription = async (plan) => {
    console.log('🔧 upgradeSubscription called with plan:', plan);
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Validate user is logged in
      if (!user) {
        console.log('❌ No user logged in');
        throw new Error('Please log in to upgrade your subscription');
      }
      
      console.log('🔧 User is logged in, processing upgrade...');
      
      // In production, this would integrate with Stripe
      // For now, we'll simulate the upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔧 Creating subscription...');
      const newSubscription = {
        id: `sub_${Date.now()}`,
        user_id: user.id,
        plan: plan,
        status: 'active',
        created_at: new Date().toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: getPlanFeatures(plan),
        billing_cycle: 'monthly',
        stripe_subscription_id: `stripe_sub_${Date.now()}`,
        stripe_customer_id: `stripe_cust_${user.id}`
      };
      
      console.log('🔧 Setting subscription:', newSubscription);
      setSubscription(newSubscription);
      
      // Store in secure cookie
      Cookies.set('user_subscription', JSON.stringify(newSubscription), {
        secure: true,
        sameSite: 'strict',
        expires: 30
      });
      
      setShowUpgradeModal(false);
      console.log('✅ Subscription upgrade completed successfully');
      
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      setError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      if (!subscription) {
        throw new Error('No active subscription to cancel');
      }
      
      // In production, this would call Stripe API to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSubscription = {
        ...subscription,
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      };
      
      setSubscription(updatedSubscription);
      
      // Update secure cookie
      Cookies.set('user_subscription', JSON.stringify(updatedSubscription), {
        secure: true,
        sameSite: 'strict',
        expires: 30
      });
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update profile in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...profileData,
          updated_at: new Date().toISOString()
        }
      });

      if (error) throw error;
      
      setShowProfileModal(false);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      if (!user) return;
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          preferences: {
            ...user.user_metadata?.preferences,
            ...preferences
          },
          updated_at: new Date().toISOString()
        }
      });

      if (error) throw error;
      
    } catch (error) {
      setError('Failed to update preferences');
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get plan features
  const getPlanFeatures = (plan) => {
    const features = {
      basic: {
        wordLimit: 500,
        features: ['Basic humanization', 'Word count', 'Reading time', 'Auto-save'],
        price: 0,
        stripePriceId: null
      },
      pro: {
        wordLimit: 2000,
        features: ['Advanced humanization', 'AI detection', 'Export options', 'Style customization'],
        price: 29.99,
        stripePriceId: 'price_pro_monthly'
      },
      ultra: {
        wordLimit: 10000,
        features: ['Ultra humanization', 'All Pro features', 'Bulk processing', 'Priority support'],
        price: 59.99,
        stripePriceId: 'price_ultra_monthly'
      }
    };
    return features[plan] || features.basic;
  };

  // Get user tier
  const getUserTier = () => {
    if (!user) return 'basic';
    if (!subscription || subscription.status !== 'active') return 'basic';
    return subscription.plan;
  };

  // Check feature access
  const canAccessFeature = (requiredTier) => {
    const userTier = getUserTier();
    const tierOrder = { basic: 0, pro: 1, ultra: 2 };
    return tierOrder[userTier] >= tierOrder[requiredTier];
  };

  // Check if subscription is active
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return subscription.status === 'active';
  };

  // Get subscription days remaining
  const getDaysRemaining = () => {
    if (!subscription || subscription.status !== 'active') return 0;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const contextValue = {
    user,
    session,
    subscription,
    isLoading,
    isAuthenticating,
    error,
    showLoginModal,
    showRegisterModal,
    showUpgradeModal,
    showProfileModal,
    showBillingModal,
    login,
    logout,
    register,
    loginWithProvider,
    resetPassword,
    upgradeSubscription,
    cancelSubscription,
    updateProfile,
    updatePreferences,
    getUserTier,
    canAccessFeature,
    isSubscriptionActive,
    getDaysRemaining,
    setShowLoginModal,
    setShowRegisterModal,
    setShowUpgradeModal,
    setShowProfileModal,
    setShowBillingModal,
    setError,
    theme
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: theme.background,
        color: theme.color
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</div>
          <div style={{ fontSize: '0.9rem', color: theme.color + '80' }}>
            Initializing secure authentication
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccountContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
      
      {/* Error Display */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: theme.error,
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          zIndex: 10000,
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                marginLeft: '8px',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isAuthenticating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            border: `1px solid ${theme.cardBorder}`
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '12px', color: theme.color }}>
              Processing...
            </div>
            <div style={{ fontSize: '0.9rem', color: theme.color + '80' }}>
              Please wait while we securely process your request
            </div>
          </div>
        </div>
      )}
    </AccountContext.Provider>
  );
}

export default AccountManager;