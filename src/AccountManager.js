import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authHelpers } from './lib/supabase';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // { text: string, type: 'success' | 'error' | 'warning' | 'info' }
  const [showEmailConfirmationBanner, setShowEmailConfirmationBanner] = useState(false);
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

  // Helper function to show messages with appropriate types and auto-dismiss
  const showMessage = (text, type = 'info', autoDismiss = true) => {
    setMessage({ text, type });
    setError(null); // Clear any existing error when showing a new message

    // Auto-dismiss after 5 seconds for success messages, 7 seconds for others
    if (autoDismiss) {
      const dismissTime = type === 'success' ? 5000 : 7000;
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, dismissTime);
    }
  };

  const showSuccess = (text) => showMessage(text, 'success');
  const showError = (text) => showMessage(text, 'error');
  const showWarning = (text) => showMessage(text, 'warning');
  const showInfo = (text) => showMessage(text, 'info');

  // Check if user's email is verified
  const isEmailVerified = () => {
    return user?.email_confirmed_at || user?.user_metadata?.email_verified;
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔧 Initializing Firebase auth...');
        
        // Get initial session
        const { session, error: sessionError } = await authHelpers.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          showError('Failed to restore session');
        } else if (session?.user) {
          console.log('✅ Found existing session for user:', session.user.email);
          setUser(session.user);
          await loadUserSubscription(session.user.id);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        showError('Failed to initialize authentication');
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
          setMessage(null);

          // Redirect to dashboard for all sign-in methods (including Google OAuth)
          // Only redirect if we're not already on dashboard and not in loading state
          if (location.pathname !== '/dashboard' && !isLoading) {
            console.log('🔄 Redirecting to dashboard after sign-in');
            setTimeout(() => {
              navigate('/dashboard');
            }, 500); // Short delay to ensure state is updated
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubscription(null);
          setError(null);
          setMessage(null);
          // Ensure we're not stuck in loading state after logout
          setIsLoading(false);
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authSubscription?.unsubscribe();
    };
  }, [location.pathname, navigate, isLoading]);

  // Handle redirect from protected routes when user logs out
  useEffect(() => {
    if (!isLoading && !user && (location.pathname === '/dash' || location.pathname === '/dashboard')) {
      console.log('🔄 Redirecting from protected route after logout');
      navigate('/', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  // Monitor email verification status
  useEffect(() => {
    if (user) {
      const emailVerified = isEmailVerified();
      const shouldShowBanner = !emailVerified;

      // Always update banner state based on current verification status
      setShowEmailConfirmationBanner(shouldShowBanner);

      // If email was just verified (banner was showing but now email is verified)
      if (emailVerified && showEmailConfirmationBanner) {
        showSuccess('Email verified successfully! Welcome to Notecraft Pro.');
      }
    } else {
      setShowEmailConfirmationBanner(false);
    }
  }, [user, user?.email_confirmed_at, user?.user_metadata?.email_verified]);

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
        username: userData.username || userData.email.split('@')[0],
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          theme: isDarkMode ? 'dark' : 'light'
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        console.log('✅ User registered successfully:', data.user.email);

        // Always close the registration modal
        setShowRegisterModal(false);
        setShowLoginModal(false);

        // If no session (email confirmation required), automatically log them in
        if (!data.session) {
          console.log('🔧 Automatically logging in user...');
          const loginResult = await login(userData.email, userData.password);

          if (loginResult.success) {
            showSuccess('Account created successfully! Please check your email to verify your account.');
            // Redirect happens in login function
          } else {
            // If automatic login fails, still set user manually to trigger UI updates
            setUser(data.user);
            await loadUserSubscription(data.user.id);
            showSuccess('Account created successfully! Please check your email to verify your account.');
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }
        } else {
          // User is automatically signed in and verified
          console.log('✅ User registered and signed in with verified email:', data.user.email);
          setUser(data.user);
          await loadUserSubscription(data.user.id);
          showSuccess('Welcome! Your account has been created and verified successfully.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
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

        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000); // Small delay to show success message

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
      setIsLoggingOut(true);

      // Close any open modals first
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowUpgradeModal(false);
      setShowProfileModal(false);
      setShowBillingModal(false);

      const { error } = await authHelpers.signOut();

      if (error) {
        console.error('Logout error:', error);
        showError('Failed to sign out');
        setIsLoggingOut(false);
      } else {
        console.log('✅ User signed out successfully');
        showSuccess('You have been signed out successfully.');

        // Clear user state immediately
        setUser(null);
        setSubscription(null);
        setError(null);
        setIsLoading(false);

        // Navigate immediately without delay to prevent blank screen
        navigate('/', { replace: true });

        // Clear logout flag after navigation
        setTimeout(() => {
          setIsLoggingOut(false);
        }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to sign out');
      setIsLoggingOut(false);
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
    showEmailConfirmationBanner,
    setShowEmailConfirmationBanner,
    isEmailVerified,
    theme
  };

  // Only show loading on initial load, not after logout or during logout
  if (isLoading && !user && !error && !isLoggingOut) {
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
          <div style={{ fontSize: '0.9rem', color: theme.color + '80' }}>Initializing authentication</div>
        </div>
      </div>
    );
  }

  return (
    <AccountContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
      
      {/* Modern Toast Notification */}
      {(message || error) && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#1a1a1a',
          padding: '16px 20px',
          borderRadius: '12px',
          zIndex: 10000,
          maxWidth: '400px',
          minWidth: '320px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease-out',
          animation: 'slideInTop 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Icon based on message type */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              flexShrink: 0,
              marginTop: '2px',
              background: message ?
                (message.type === 'success' ? '#10b981' :
                 message.type === 'error' ? '#ef4444' :
                 message.type === 'warning' ? '#f59e0b' : '#3b82f6') : '#ef4444',
              color: 'white'
            }}>
              {message ?
                (message.type === 'success' ? '✓' :
                 message.type === 'error' ? '!' :
                 message.type === 'warning' ? '⚠' : 'i') : '!'}
            </div>

            <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>
              <div style={{
                fontWeight: '500',
                marginBottom: '2px',
                color: message ?
                  (message.type === 'success' ? '#065f46' :
                   message.type === 'error' ? '#991b1b' :
                   message.type === 'warning' ? '#92400e' : '#1e40af') : '#991b1b'
              }}>
                {message ?
                  (message.type === 'success' ? 'Success' :
                   message.type === 'error' ? 'Error' :
                   message.type === 'warning' ? 'Warning' : 'Info') : 'Error'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>
                {message ? message.text : error}
              </div>
            </div>

            <button
              onClick={() => {
                setMessage(null);
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                fontSize: '16px',
                lineHeight: '1',
                flexShrink: 0,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#374151'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Email Confirmation Banner */}
      {showEmailConfirmationBanner && user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: theme.warning,
          color: 'white',
          padding: '12px 16px',
          zIndex: 9999,
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px' }}>
              📧 Please verify your email address ({user.email}) to access all features.
            </span>
            <button
              onClick={async () => {
                try {
                  setIsAuthenticating(true);
                  const { error } = await authHelpers.resendEmailConfirmation(user.email);
                  if (error) {
                    showError('Failed to resend confirmation email: ' + error.message);
                  } else {
                    showSuccess('Confirmation email sent! Please check your inbox.');
                  }
                } catch (error) {
                  showError('Failed to resend confirmation email');
                } finally {
                  setIsAuthenticating(false);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Resend Email
            </button>
            <button
              onClick={() => setShowEmailConfirmationBanner(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px 8px'
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