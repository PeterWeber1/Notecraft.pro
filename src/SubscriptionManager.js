import React, { useState, useEffect } from 'react';

function SubscriptionManager({ children, isDarkMode = false }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const theme = {
    background: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#ffffff' : '#111827',
    cardBackground: isDarkMode ? '#1f2937' : '#ffffff',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
    primary: '#6366f1',
    accent: '#fbbf24',
    success: '#10b981',
    error: '#ef4444'
  };

  // Simulate checking user authentication and subscription status
  useEffect(() => {
    // In a real app, this would check localStorage, cookies, or API
    const checkAuthStatus = () => {
      const savedUser = localStorage.getItem('user');
      const savedSubscription = localStorage.getItem('subscription');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      if (savedSubscription) {
        setSubscription(JSON.parse(savedSubscription));
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (email, password) => {
    // Simulate login API call
    const mockUser = {
      id: 'user_123',
      email: email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setShowLoginModal(false);
  };

  const logout = () => {
    setUser(null);
    setSubscription(null);
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
  };

  const upgradeSubscription = (plan) => {
    // Simulate payment processing
    const mockSubscription = {
      id: `sub_${Date.now()}`,
      plan: plan,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      features: getPlanFeatures(plan)
    };
    
    setSubscription(mockSubscription);
    localStorage.setItem('subscription', JSON.stringify(mockSubscription));
    setShowUpgradeModal(false);
  };

  const getPlanFeatures = (plan) => {
    const features = {
      basic: {
        wordLimit: 500,
        features: ['Basic formatting', 'Word count', 'Reading time', 'Auto-save'],
        price: 0
      },
      pro: {
        wordLimit: 2000,
        features: ['Advanced formatting', 'AI detection', 'Export options', 'Style customization'],
        price: 9.99
      },
      ultra: {
        wordLimit: 10000,
        features: ['Ultra formatting', 'All Pro features', 'Bulk processing', 'Priority support'],
        price: 19.99
      }
    };
    return features[plan];
  };

  const getUserTier = () => {
    if (!user) return 'basic';
    if (!subscription) return 'basic';
    return subscription.plan;
  };

  const canAccessFeature = (requiredTier) => {
    const userTier = getUserTier();
    const tierOrder = { basic: 0, pro: 1, ultra: 2 };
    return tierOrder[userTier] >= tierOrder[requiredTier];
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
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {children({ user, subscription, getUserTier, canAccessFeature, login, logout, upgradeSubscription, setShowLoginModal, setShowUpgradeModal })}
      
      {/* Login Modal */}
      {showLoginModal && (
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
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            border: `1px solid ${theme.cardBorder}`
          }}>
            <h2 style={{ color: theme.color, marginBottom: '16px' }}>Sign In</h2>
            <LoginForm onLogin={login} onClose={() => setShowLoginModal(false)} theme={theme} />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
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
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            border: `1px solid ${theme.cardBorder}`
          }}>
            <h2 style={{ color: theme.color, marginBottom: '16px' }}>Upgrade Your Plan</h2>
            <UpgradeForm onUpgrade={upgradeSubscription} onClose={() => setShowUpgradeModal(false)} theme={theme} />
          </div>
        </div>
      )}
    </>
  );
}

function LoginForm({ onLogin, onClose, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: theme.color }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${theme.cardBorder}`,
            background: theme.background,
            color: theme.color
          }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: theme.color }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${theme.cardBorder}`,
            background: theme.background,
            color: theme.color
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="submit"
          style={{
            background: theme.primary,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            color: theme.color,
            border: `1px solid ${theme.cardBorder}`,
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function UpgradeForm({ onUpgrade, onClose, theme }) {
  const plans = [
    {
      name: 'Pro',
      price: 9.99,
      features: ['2,000 words per document', 'AI detection', 'Export options', 'Style customization'],
      color: theme.accent
    },
    {
      name: 'Ultra',
      price: 19.99,
      features: ['10,000 words per document', 'All Pro features', 'Bulk processing', 'Priority support'],
      color: '#8b5cf6'
    }
  ];

  return (
    <div>
      <p style={{ color: theme.color, marginBottom: '20px' }}>
        Upgrade to access advanced features and higher word limits.
      </p>
      <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              border: `2px solid ${plan.color}`,
              borderRadius: '8px',
              padding: '16px',
              background: `${plan.color}10`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: theme.color, margin: 0 }}>{plan.name}</h3>
              <span style={{ color: plan.color, fontWeight: 'bold', fontSize: '1.2rem' }}>
                ${plan.price}/month
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: theme.color }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => onUpgrade(plan.name.toLowerCase())}
              style={{
                background: plan.color,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '12px',
                width: '100%'
              }}
            >
              Upgrade to {plan.name}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          color: theme.color,
          border: `1px solid ${theme.cardBorder}`,
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default SubscriptionManager; 