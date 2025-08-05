import React, { useState, useEffect, createContext, useContext } from 'react';

// Account Management Context
const AccountContext = createContext();

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

// Enhanced Account Manager with Industry Standards
function AccountManager({ children, isDarkMode = false }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  const theme = {
    background: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#ffffff' : '#111827',
    cardBackground: isDarkMode ? '#1f2937' : '#ffffff',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
    primary: '#6366f1',
    accent: '#fbbf24',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  };

  // Session management with auto-logout
  useEffect(() => {
    const checkSession = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
      
      if (lastActivity && Date.now() - parseInt(lastActivity) > sessionDuration) {
        logout();
        setError('Session expired. Please log in again.');
      }
    };

    const updateActivity = () => {
      if (user) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    // Check session on mount
    checkSession();
    
    // Update activity on user interaction
    document.addEventListener('mousedown', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);

    return () => {
      document.removeEventListener('mousedown', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('scroll', updateActivity);
    };
  }, [user]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedSubscription = localStorage.getItem('subscription');
        const savedToken = localStorage.getItem('authToken');
        
        if (savedUser && savedToken) {
          // Verify token validity (in real app, this would be an API call)
          const isValid = await verifyToken(savedToken);
          if (isValid) {
            setUser(JSON.parse(savedUser));
            if (savedSubscription) {
              setSubscription(JSON.parse(savedSubscription));
            }
          } else {
            // Token expired, clear everything
            localStorage.removeItem('user');
            localStorage.removeItem('subscription');
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Mock token verification (replace with real API call)
  const verifyToken = async (token) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return token && token.length > 10; // Simple validation
  };

  // Enhanced registration with validation
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          theme: isDarkMode ? 'dark' : 'light'
        }
      };
      
      const authToken = generateAuthToken(newUser);
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('lastActivity', Date.now().toString());
      
      setShowRegisterModal(false);
      setShowLoginModal(false);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Enhanced login with security
  const login = async (email, password) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Simulate API call - in production this would be a real authentication endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // For demo purposes, accept any email/password combination
      // In production, this would validate against your backend
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Create a mock user object
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0], // Use email prefix as name
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true
        }
      };
      
      // Generate auth token
      const token = generateAuthToken(mockUser);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', token);
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Set default subscription for demo
      const defaultSubscription = {
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      localStorage.setItem('subscription', JSON.stringify(defaultSubscription));
      
      // Update state
      setUser(mockUser);
      setSubscription(defaultSubscription);
      
      // Close login modal
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

  // Secure logout
  const logout = () => {
    try {
      // Clear all user data
      setUser(null);
      setSubscription(null);
      setError(null);
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('subscription');
      localStorage.removeItem('authToken');
      localStorage.removeItem('lastActivity');
      
      // Clear any session timeouts
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }
      
      // Close any open modals
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowUpgradeModal(false);
      setShowProfileModal(false);
      setShowBillingModal(false);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Enhanced subscription management
  const upgradeSubscription = async (plan) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Validate user is logged in
      if (!user) {
        throw new Error('Please log in to upgrade your subscription');
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSubscription = {
        id: `sub_${Date.now()}`,
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
        }
      };
      
      setSubscription(mockSubscription);
      localStorage.setItem('subscription', JSON.stringify(mockSubscription));
      setShowUpgradeModal(false);
      
    } catch (error) {
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSubscription = {
        ...subscription,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
      
      setSubscription(updatedSubscription);
      localStorage.setItem('subscription', JSON.stringify(updatedSubscription));
      
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
      
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences
        },
        updatedAt: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      setError('Failed to update preferences');
    }
  };

  // Generate mock auth token
  const generateAuthToken = (user) => {
    return `token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    return features[plan];
  };

  // Get user tier
  const getUserTier = () => {
    if (!user) return 'basic';
    if (!subscription) return 'basic';
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
          <div style={{ fontSize: '0.9rem', color: theme.color + '80' }}>Initializing account system</div>
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
              Please wait while we process your request
            </div>
          </div>
        </div>
      )}
    </AccountContext.Provider>
  );
}

export default AccountManager; 