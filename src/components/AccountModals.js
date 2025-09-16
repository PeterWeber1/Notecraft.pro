import React, { useState, useEffect } from 'react';
import { useAccount } from '../AccountManager.js';

// Custom hook for window dimensions
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Enhanced Login Modal
export function LoginModal({ isOpen, onClose, theme }) {
  const { login, isAuthenticating, error, setShowLoginModal, setShowRegisterModal } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    try {
      const { supabase } = await import('../lib/supabase.js');

      // Get proper redirect URL based on environment
      const getRedirectUrl = () => {
        if (process.env.REACT_APP_PRODUCTION_URL) {
          return process.env.REACT_APP_PRODUCTION_URL;
        }
        if (process.env.NODE_ENV === 'production') {
          return 'https://www.notecraft.pro';
        }
        return window.location.origin;
      };

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });

      if (error) {
        console.error('Google login error:', error);
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div className="card" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '400px',
        width: 'min(90vw, 400px)',
        padding: 'clamp(1rem, 4vw, 2rem)',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: theme.color + '60',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ×
        </button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: theme.color, marginBottom: '8px', fontSize: '1.5rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: theme.color + '80', fontSize: '0.9rem' }}>
            Sign in to your Notecraft Pro account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="form-input"
                style={{
                  paddingRight: '48px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: theme.color + '60',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            style={{
              width: '100%',
              background: isAuthenticating ? theme.color + '40' : theme.primary,
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '8px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
          >
            {isAuthenticating ? 'Signing In...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            style={{
              width: '100%',
              background: 'white',
              color: '#333',
              border: '1px solid #ddd',
              padding: '14px 24px',
              borderRadius: '8px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>

          <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primary,
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline',
                fontWeight: '600'
              }}
            >
              Don't have an account? Sign up
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: theme.color + '60',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Registration Modal
export function RegisterModal({ isOpen, onClose, theme }) {
  const { register, isAuthenticating, error, setShowLoginModal, setShowRegisterModal } = useAccount();
  const { height } = useWindowSize();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Combine first and last name for registration
    const registrationData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      username: formData.username || formData.email.split('@')[0]
    };

    await register(registrationData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-generate username from email
      if (field === 'email' && value) {
        const emailParts = value.split('@');
        if (emailParts.length > 0) {
          newData.username = emailParts[0];
        }
      }

      return newData;
    });
  };

  const handleGoogleSignUp = async () => {
    try {
      const { supabase } = await import('../lib/supabase.js');

      // Get proper redirect URL based on environment
      const getRedirectUrl = () => {
        if (process.env.REACT_APP_PRODUCTION_URL) {
          return process.env.REACT_APP_PRODUCTION_URL;
        }
        if (process.env.NODE_ENV === 'production') {
          return 'https://www.notecraft.pro';
        }
        return window.location.origin;
      };

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });

      if (error) {
        console.error('Google sign up error:', error);
      }
    } catch (error) {
      console.error('Google sign up error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div className="card" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '450px',
        width: 'min(90vw, 450px)',
        padding: height < 700 ? 'clamp(0.75rem, 3vw, 1.5rem)' : 'clamp(1rem, 4vw, 2rem)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: theme.color + '60',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ×
        </button>
        <div style={{ textAlign: 'center', marginBottom: height < 700 ? '20px' : '32px' }}>
          <h2 style={{ color: theme.color, marginBottom: '8px', fontSize: height < 700 ? '1.5rem' : '2rem', fontWeight: '600' }}>
            Sign Up
          </h2>
          <p style={{ color: theme.color + '80', fontSize: height < 700 ? '0.9rem' : '1rem' }}>
            Enter your information to create an account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: height < 700 ? '16px' : '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                placeholder="Max"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                placeholder="Robinson"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Username field - auto-generated from email */}
          <div style={{ marginBottom: height < 700 ? '16px' : '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Username <span style={{ color: theme.color + '60', fontSize: '0.9rem' }}>(auto-generated)</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Will be generated from email"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: formData.username ? theme.background : '#f8f8f8',
                color: formData.username ? theme.color : theme.color + '60',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Email and Password - responsive layout based on screen height */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: height < 700 ? '20px' : '32px',
            flexDirection: height < 700 ? 'row' : 'column'
          }}>
            <div style={{ flex: height < 700 ? 1 : 'none', width: height < 700 ? 'auto' : '100%' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="m@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: height < 700 ? 1 : 'none', width: height < 700 ? 'auto' : '100%', marginTop: height < 700 ? '0' : '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                placeholder=""
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={isAuthenticating}
            style={{
              width: '100%',
              background: isAuthenticating ? '#666' : '#000',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '8px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
          >
            {isAuthenticating ? 'Creating Account...' : 'Create an Account'}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isAuthenticating}
            style={{
              width: '100%',
              background: 'white',
              color: '#000',
              border: '1px solid #e5e5e5',
              padding: '16px 24px',
              borderRadius: '8px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              marginBottom: height < 700 ? '16px' : '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign Up with Google
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: theme.color + '80', marginBottom: height < 700 ? '12px' : '16px' }}>
            By signing up, you agree to our{' '}
            <a href="/terms" style={{ color: theme.color, textDecoration: 'underline' }}>
              Terms and Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: theme.color, textDecoration: 'underline' }}>
              Privacy Policy
            </a>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: theme.color + '80', fontSize: '0.9rem' }}>
              Already have an account?{' '}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(false);
                setShowLoginModal(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.color,
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline',
                fontWeight: '600'
              }}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Profile Management Modal
export function ProfileModal({ isOpen, onClose, theme }) {
  const { user, logout, setShowUpgradeModal, setShowBillingModal } = useAccount();
  const { width } = useWindowSize();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleUpgrade = () => {
    onClose();
    setShowUpgradeModal(true);
  };

  const handleBilling = () => {
    onClose();
    setShowBillingModal(true);
  };

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed',
        top: '80px',
        right: width <= 480 ? '10px' : 'calc(20px + 18px)', // 20px nav padding + 18px (half of 36px avatar)
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '24px',
        borderRadius: '12px',
        width: Math.min(280, width - (width <= 480 ? 20 : 76)) + 'px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        transform: width <= 480 ? 'none' : 'translateX(50%)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: theme.color + '60',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ×
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: theme.color, marginBottom: '0', fontSize: '1.2rem', fontWeight: '600' }}>
            Account
          </h2>
        </div>

        {/* Profile Picture Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: user?.user_metadata?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #635bff, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 auto 12px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span style={{
              display: user?.user_metadata?.avatar_url ? 'none' : 'block'
            }}>
              {(user?.user_metadata?.username?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
            </span>
          </div>
          <p style={{ color: theme.color, fontSize: '1rem', margin: '0 0 4px 0', fontWeight: '600' }}>
            {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
          </p>
          <p style={{ color: theme.color + '80', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
            {user?.email}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleUpgrade}
            style={{
              width: '100%',
              background: theme.primary,
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Upgrade Plan
          </button>

          <button
            onClick={handleBilling}
            style={{
              width: '100%',
              background: 'transparent',
              color: theme.color,
              border: `1px solid ${theme.color}40`,
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Billing
          </button>

          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#000000',
              border: '1px solid #000000',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Billing and Subscription Modal
export function BillingModal({ isOpen, onClose, theme }) {
  const { subscription, cancelSubscription, isAuthenticating, getDaysRemaining } = useAccount();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCancelSubscription = async () => {
    await cancelSubscription();
    setShowCancelConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: 'clamp(1.5rem, 5vw, 2rem)',
        borderRadius: '16px',
        maxWidth: '500px',
        width: 'min(90vw, 500px)',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: theme.color + '60',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ×
        </button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: theme.color, marginBottom: '8px', fontSize: '1.5rem' }}>
            Billing & Subscription
          </h2>
          <p style={{ color: theme.color + '80', fontSize: '0.9rem' }}>
            Manage your subscription and billing information
          </p>
        </div>

        {subscription ? (
          <div>
            <div style={{
              background: theme.background,
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: `1px solid ${theme.cardBorder}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: theme.color, margin: 0, fontSize: '1.2rem' }}>
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                </h3>
                <span style={{
                  background: subscription.status === 'active' ? theme.success : theme.error,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {subscription.status}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: theme.color + '80' }}>Billing Cycle:</span>
                  <span style={{ color: theme.color, fontWeight: '500' }}>
                    {subscription.billingCycle}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: theme.color + '80' }}>Next Billing:</span>
                  <span style={{ color: theme.color, fontWeight: '500' }}>
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: theme.color + '80' }}>Days Remaining:</span>
                  <span style={{ color: theme.color, fontWeight: '500' }}>
                    {getDaysRemaining()} days
                  </span>
                </div>
              </div>

              {subscription.paymentMethod && (
                <div style={{
                  background: theme.cardBackground,
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  <div style={{ fontSize: '0.9rem', color: theme.color + '80', marginBottom: '4px' }}>
                    Payment Method
                  </div>
                  <div style={{ color: theme.color, fontWeight: '500' }}>
                    {subscription.paymentMethod.brand.charAt(0).toUpperCase() + subscription.paymentMethod.brand.slice(1)} •••• {subscription.paymentMethod.last4}
                  </div>
                </div>
              )}
            </div>

            {subscription.status === 'active' && (
              <div style={{ textAlign: 'center' }}>
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    style={{
                      background: theme.error,
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <div style={{
                    background: theme.background,
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.cardBorder}`
                  }}>
                    <p style={{ color: theme.color, marginBottom: '16px' }}>
                      Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isAuthenticating}
                        style={{
                          background: isAuthenticating ? theme.color + '40' : theme.error,
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {isAuthenticating ? 'Cancelling...' : 'Yes, Cancel'}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        style={{
                          background: 'transparent',
                          color: theme.color,
                          border: `1px solid ${theme.cardBorder}`,
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        No, Keep
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💳</div>
            <h3 style={{ color: theme.color, marginBottom: '8px' }}>No Active Subscription</h3>
            <p style={{ color: theme.color + '80', marginBottom: '24px' }}>
              You don't have an active subscription. Upgrade to access premium features.
            </p>
            <button
              onClick={() => {
                onClose();
                // Trigger upgrade modal
              }}
              style={{
                background: theme.primary,
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              View Plans
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.color + '80',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 

// Upgrade Modal
export function UpgradeModal({ isOpen, onClose, theme }) {
  const { upgradeSubscription, isAuthenticating } = useAccount();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      features: [
        '2,000 words per document',
        'AI detection',
        'Export options', 
        'Style customization',
        'Priority support'
      ],
      color: theme.primary,
      popular: true
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: 59.99,
      features: [
        '10,000 words per document',
        'All Pro features',
        'Bulk processing',
        'Advanced analytics',
        'Dedicated support',
        'API access'
      ],
      color: '#635bff'
    }
  ];

  const handleUpgrade = async (planId) => {
    console.log('🔧 handleUpgrade called with planId:', planId);
    try {
      console.log('🔧 Calling upgradeSubscription...');
      await upgradeSubscription(planId);
      console.log('✅ Upgrade successful');
      onClose();
    } catch (error) {
      console.error('❌ Upgrade failed:', error);
      alert('Upgrade failed: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: 'clamp(1.5rem, 5vw, 2rem)',
        borderRadius: '16px',
        maxWidth: '600px',
        width: 'min(90vw, 600px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: theme.color + '60',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ×
        </button>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: theme.color, marginBottom: '8px', fontSize: '1.8rem' }}>
            Choose Your Plan
          </h2>
          <p style={{ color: theme.color + '80', fontSize: '1rem' }}>
            Upgrade to access advanced features and higher word limits
          </p>
        </div>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: `2px solid ${selectedPlan === plan.id ? plan.color : theme.cardBorder}`,
                borderRadius: '12px',
                padding: '24px',
                background: selectedPlan === plan.id ? `${plan.color}10` : theme.background,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.color,
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  Most Popular
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: theme.color, margin: 0, fontSize: '1.4rem' }}>
                  {plan.name}
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: plan.color, fontWeight: 'bold', fontSize: '1.8rem' }}>
                    <span style={{
                      background: '#635bff',
                      color: 'white',
                      fontSize: '0.6em',
                      padding: '1px 4px',
                      borderRadius: '8px',
                      marginRight: '4px',
                      fontWeight: 'bold'
                    }}>
                      $
                    </span>
                    {plan.price}
                  </span>
                  <span style={{ color: theme.color + '80', fontSize: '0.9rem' }}>/month</span>
                </div>
              </div>
              
              <ul style={{ margin: 0, paddingLeft: '20px', color: theme.color }}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
            disabled={!selectedPlan || isAuthenticating}
            style={{
              background: !selectedPlan || isAuthenticating ? theme.color + '40' : theme.primary,
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              cursor: !selectedPlan || isAuthenticating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              minWidth: '120px'
            }}
          >
            {isAuthenticating ? 'Processing...' : `Upgrade to ${selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : 'Plan'}`}
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: theme.color,
              border: `1px solid ${theme.cardBorder}`,
              padding: '12px 32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: theme.color + '60', fontSize: '0.85rem' }}>
            All plans include a 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
} 