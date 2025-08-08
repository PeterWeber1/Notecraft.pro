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

// Simple fallback Account Manager (mock version)
function AccountManager({ children, isDarkMode = false }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Set to false to load immediately
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
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
    success: '#000000',
    error: '#000000',
    warning: '#000000'
  };

  // Mock functions to prevent crashes
  const login = async (email, password) => {
    setError('Authentication system is temporarily using mock mode. Please check console for setup instructions.');
    return { success: false };
  };

  const register = async (userData) => {
    setError('Authentication system is temporarily using mock mode. Please check console for setup instructions.');
  };

  const logout = async () => {
    setUser(null);
    setSubscription(null);
  };

  const loginWithProvider = async (provider) => {
    setError('Social login requires Supabase configuration');
  };

  const resetPassword = async (email) => {
    return { success: false, error: 'Password reset requires Supabase configuration' };
  };

  const upgradeSubscription = async (plan) => {
    setError('Subscription upgrades require Stripe configuration');
  };

  const cancelSubscription = async () => {
    setError('Subscription management requires Stripe configuration');
  };

  const updateProfile = async (profileData) => {
    setError('Profile updates require Supabase configuration');
  };

  const updatePreferences = async (preferences) => {
    console.warn('Preferences update requires Supabase configuration');
  };

  const getUserTier = () => 'basic';
  const canAccessFeature = (requiredTier) => true; // Allow all features in mock mode
  const isSubscriptionActive = () => false;
  const getDaysRemaining = () => 0;

  const contextValue = {
    user,
    session: null,
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

  // Show setup instructions
  useEffect(() => {
    console.warn('🚨 AUTHENTICATION SYSTEM IN MOCK MODE');
    console.warn('📖 To enable full authentication:');
    console.warn('1. Follow SETUP-GUIDE.md');
    console.warn('2. Configure Supabase credentials in .env');
    console.warn('3. Configure Stripe credentials in .env');
    console.warn('4. Restart the development server');
  }, []);

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
    </AccountContext.Provider>
  );
}

export default AccountManager;