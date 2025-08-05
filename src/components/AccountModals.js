import React, { useState } from 'react';
import { useAccount } from '../AccountManager.js';

// Enhanced Login Modal
export function LoginModal({ isOpen, onClose, theme }) {
  const { login, isAuthenticating, error } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: theme.cardBackground,
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '90%',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
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
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.background,
                color: theme.color,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '48px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
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

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
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
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Registration Modal
export function RegisterModal({ isOpen, onClose, theme }) {
  const { register, isAuthenticating, error } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    await register(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: theme.cardBackground,
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '90%',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: theme.color, marginBottom: '8px', fontSize: '1.5rem' }}>
            Create Account
          </h2>
          <p style={{ color: theme.color + '80', fontSize: '0.9rem' }}>
            Join Notecraft Pro and start humanizing your AI text
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.background,
                color: theme.color,
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.background,
                color: theme.color,
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                placeholder="Create a password (min 8 characters)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '48px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none'
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
            {formData.password && formData.password.length < 8 && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                Password must be at least 8 characters long
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                placeholder="Confirm your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '48px',
                  borderRadius: '8px',
                  border: `1px solid ${formData.password !== formData.confirmPassword && formData.confirmPassword ? theme.error : theme.cardBorder}`,
                  background: theme.background,
                  color: theme.color,
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div style={{ color: theme.error, fontSize: '0.8rem', marginTop: '4px' }}>
                Passwords do not match
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                required
                style={{ margin: 0 }}
              />
              <span style={{ color: theme.color, fontSize: '0.9rem' }}>
                I agree to the{' '}
                <a href="/terms" style={{ color: theme.primary, textDecoration: 'underline' }}>
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" style={{ color: theme.primary, textDecoration: 'underline' }}>
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating || !formData.agreeToTerms || formData.password !== formData.confirmPassword}
            style={{
              width: '100%',
              background: isAuthenticating || !formData.agreeToTerms || formData.password !== formData.confirmPassword 
                ? theme.color + '40' : theme.primary,
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '8px',
              cursor: isAuthenticating || !formData.agreeToTerms || formData.password !== formData.confirmPassword 
                ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
          >
            {isAuthenticating ? 'Creating Account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
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
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Profile Management Modal
export function ProfileModal({ isOpen, onClose, theme }) {
  const { user, updateProfile, isAuthenticating } = useAccount();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferences: user?.preferences || {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  if (!isOpen || !user) return null;

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: theme.cardBackground,
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: theme.color, marginBottom: '8px', fontSize: '1.5rem' }}>
            Profile Settings
          </h2>
          <p style={{ color: theme.color + '80', fontSize: '0.9rem' }}>
            Manage your account information and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.background,
                color: theme.color,
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.color, fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.background,
                color: theme.color,
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: theme.color, marginBottom: '16px', fontSize: '1.1rem' }}>
              Preferences
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.preferences.emailNotifications || false}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  style={{ margin: 0 }}
                />
                <span style={{ color: theme.color, fontSize: '0.9rem' }}>
                  Receive email notifications
                </span>
              </label>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.preferences.marketingEmails || false}
                  onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                  style={{ margin: 0 }}
                />
                <span style={{ color: theme.color, fontSize: '0.9rem' }}>
                  Receive marketing emails
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={isAuthenticating}
              style={{
                flex: 1,
                background: isAuthenticating ? theme.color + '40' : theme.primary,
                color: 'white',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '8px',
                cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {isAuthenticating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: theme.color,
                border: `1px solid ${theme.cardBorder}`,
                padding: '14px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
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

// Billing and Subscription Modal
export function BillingModal({ isOpen, onClose, theme }) {
  const { subscription, cancelSubscription, isAuthenticating, getDaysRemaining } = useAccount();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: theme.cardBackground,
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
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
      color: '#8b5cf6'
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
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: theme.cardBackground,
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '90%',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
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
                    ${plan.price}
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