import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, authHelpers } from './lib/supabase';

// Account Management Context
const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

// Enhanced Account Manager with Supabase Authentication
function AccountManager({ children, isDarkMode = false }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // { text: string, type: 'success' | 'error' | 'warning' | 'info' }
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const theme = {
    background: isDarkMode ? '#000000' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    cardBackground: isDarkMode ? '#202020' : '#ffffff',
    cardBorder: isDarkMode ? '#404040' : '#e0e0e0',
    primary: '#635bff',
    accent: '#635bff',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  // Helper function to show messages with appropriate types
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setError(null); // Clear any existing error when showing a new message
  };

  const showSuccess = (text) => showMessage(text, 'success');
  const showError = (text) => showMessage(text, 'error');
  const showWarning = (text) => showMessage(text, 'warning');
  const showInfo = (text) => showMessage(text, 'info');

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔧 Initializing Supabase auth...');
        
        // Get initial session
        const { session, error: sessionError } = await authHelpers.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to restore session');
        } else if (session?.user) {
          console.log('✅ Found existing session for user:', session.user.email);
          setUser(session.user);
          await loadUserSubscription(session.user.id);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription: authSubscription } } = authHelpers.onAuthStateChange(
      async (event, session) => {
        console.log('🔧 Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserSubscription(session.user.id);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubscription(null);
          setError(null);
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  // Load user subscription data
  const loadUserSubscription = async (userId) => {
    try {
      // For now, create a default subscription
      // In a real app, you'd query your subscription table
      const defaultSubscription = {
        id: `sub_${userId}`,
        user_id: userId,
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: getPlanFeatures('basic'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSubscription(defaultSubscription);
      console.log('✅ Loaded subscription for user:', userId);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setError('Failed to load subscription data');
    }
  };

  // Enhanced registration with Supabase
  const register = async (userData) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log('🔧 Registering user with Supabase:', userData.email);
      
      // Validate user data
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('All fields are required');
      }
      
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (!userData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Register with Supabase
      const { data, error } = await authHelpers.signUp(userData.email, userData.password, {
        full_name: userData.name,
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          theme: isDarkMode ? 'dark' : 'light'
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user && !data.session) {
        // Email confirmation required
        showSuccess('Registration successful! Please check your email and click the confirmation link to complete your account setup.');
      } else if (data.session) {
        // User is automatically signed in
        console.log('✅ User registered and signed in:', data.user.email);
        showSuccess('Welcome! Your account has been created successfully.');
        setShowRegisterModal(false);
        setShowLoginModal(false);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Enhanced login with Supabase
  const login = async (email, password) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log('🔧 Signing in user with Supabase:', email);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        console.log('✅ User signed in successfully:', data.user.email);
        showSuccess('Welcome back! You have been signed in successfully.');
        setShowLoginModal(false);
        return { success: true };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Secure logout with Supabase
  const logout = async () => {
    try {
      console.log('🔧 Signing out user...');
      
      const { error } = await authHelpers.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        showError('Failed to sign out');
      } else {
        console.log('✅ User signed out successfully');
        showSuccess('You have been signed out successfully.');
        
        // Close any open modals
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowUpgradeModal(false);
        setShowProfileModal(false);
        setShowBillingModal(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to sign out');
    }
  };

  // Enhanced subscription management
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
      
      // In a real app, you would:
      // 1. Create Stripe checkout session
      // 2. Handle payment processing
      // 3. Update subscription in database
      // 4. Update user's subscription status
      
      // For now, simulate the upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔧 Creating subscription...');
      const newSubscription = {
        id: `sub_${user.id}_${Date.now()}`,
        user_id: user.id,
        plan: plan,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: getPlanFeatures(plan),
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: {
          type: 'card',
          last4: '1234',
          brand: 'visa'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🔧 Setting subscription:', newSubscription);
      setSubscription(newSubscription);
      setShowUpgradeModal(false);
      showSuccess(`Successfully upgraded to ${plan.toUpperCase()} plan! Welcome to premium features.`);
      console.log('✅ Subscription upgrade completed successfully');
      
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      showError(error.message);
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSubscription = {
        ...subscription,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSubscription(updatedSubscription);
      showSuccess('Your subscription has been cancelled successfully.');
      console.log('✅ Subscription cancelled successfully');
      
    } catch (error) {
      console.error('Cancel subscription error:', error);
      showError(error.message);
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
      
      console.log('🔧 Updating user profile:', profileData);
      
      // Update user metadata in Supabase
      const { data, error } = await authHelpers.updateUser({
        data: {
          ...user.user_metadata,
          ...profileData,
          updated_at: new Date().toISOString()
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      showSuccess('Your profile has been updated successfully.');
      console.log('✅ Profile updated successfully');
      setShowProfileModal(false);
      
    } catch (error) {
      console.error('Update profile error:', error);
      showError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      if (!user) return;
      
      console.log('🔧 Updating user preferences:', preferences);
      
      const { data, error } = await authHelpers.updateUser({
        data: {
          ...user.user_metadata,
          preferences: {
            ...user.user_metadata?.preferences,
            ...preferences
          },
          updated_at: new Date().toISOString()
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      showSuccess('Your preferences have been updated successfully.');
      console.log('✅ Preferences updated successfully');
      
    } catch (error) {
      console.error('Update preferences error:', error);
      showError('Failed to update preferences');
    }
  };

  // Get plan features
  const getPlanFeatures = (plan) => {
    const features = {
      basic: {
        wordLimit: 500,
        features: ['Basic humanization', 'Word count', 'Reading time', 'Auto-save'],
        price: 0
      },
      pro: {
        wordLimit: 2000,
        features: ['Advanced humanization', 'AI detection', 'Export options', 'Style customization'],
        price: 29.99
      },
      ultra: {
        wordLimit: 10000,
        features: ['Ultra humanization', 'All Pro features', 'Bulk processing', 'Priority support'],
        price: 59.99
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
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const contextValue = {
    user,
    subscription,
    isLoading,
    isAuthenticating,
    error,
    message,
    showLoginModal,
    showRegisterModal,
    showUpgradeModal,
    showProfileModal,
    showBillingModal,
    login,
    logout,
    register,
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
    setMessage,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
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
          <div style={{ fontSize: '0.9rem', color: theme.color + '80' }}>Initializing Supabase authentication</div>
        </div>
      </div>
    );
  }

  return (
    <AccountContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
      
      {/* Message Display */}
      {(message || error) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: message ? theme[message.type] : theme.error,
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          zIndex: 10000,
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{message ? message.text : error}</span>
            <button
              onClick={() => {
                setMessage(null);
                setError(null);
              }}
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
              Please wait while we process your request
            </div>
          </div>
        </div>
      )}
    </AccountContext.Provider>
  );
}

export default AccountManager;