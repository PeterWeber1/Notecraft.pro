import React from 'react';
import { useAccount } from '../AccountManager.js';

export function UserDashboard({ theme }) {
  const { 
    user, 
    subscription, 
    getUserTier, 
    isSubscriptionActive, 
    getDaysRemaining,
    setShowProfileModal,
    setShowBillingModal,
    setShowUpgradeModal,
    logout
  } = useAccount();

  if (!user) return null;

  const userTier = getUserTier();
  const isActive = isSubscriptionActive();
  const daysRemaining = getDaysRemaining();

  const getTierColor = (tier) => {
    switch (tier) {
      case 'ultra': return '#8b5cf6';
      case 'pro': return theme.accent;
      default: return theme.primary;
    }
  };

  const getUsageStats = () => {
    // Mock usage statistics - in real app, this would come from API
    const stats = {
      basic: { documentsCreated: 12, wordsProcessed: 2400, lastActivity: '2 hours ago' },
      pro: { documentsCreated: 45, wordsProcessed: 89000, lastActivity: '1 hour ago' },
      ultra: { documentsCreated: 128, wordsProcessed: 256000, lastActivity: '30 minutes ago' }
    };
    return stats[userTier] || stats.basic;
  };

  const usageStats = getUsageStats();

  return (
    <div style={{
      background: theme.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${theme.cardBorder}`,
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: theme.color, marginBottom: '4px', fontSize: '1.5rem' }}>
            Welcome back, {user.name}!
          </h2>
          <p style={{ color: theme.color + '80', fontSize: '0.9rem' }}>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{
          background: getTierColor(userTier),
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: '600',
          textTransform: 'uppercase'
        }}>
          {userTier} Plan
        </div>
      </div>

      {/* Subscription Status */}
      <div style={{
        background: theme.background,
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: `1px solid ${theme.cardBorder}`
      }}>
        <h3 style={{ color: theme.color, marginBottom: '16px', fontSize: '1.1rem' }}>
          Subscription Status
        </h3>
        
        {subscription && isActive ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
                Plan
              </div>
              <div style={{ color: theme.color, fontWeight: '600' }}>
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
              </div>
            </div>
            <div>
              <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
                Status
              </div>
              <div style={{ 
                color: theme.success, 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: theme.success
                }}></div>
                Active
              </div>
            </div>
            <div>
              <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
                Days Remaining
              </div>
              <div style={{ color: theme.color, fontWeight: '600' }}>
                {daysRemaining} days
              </div>
            </div>
            <div>
              <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
                Next Billing
              </div>
              <div style={{ color: theme.color, fontWeight: '600' }}>
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💳</div>
            <h4 style={{ color: theme.color, marginBottom: '8px' }}>No Active Subscription</h4>
            <p style={{ color: theme.color + '80', marginBottom: '16px', fontSize: '0.9rem' }}>
              Upgrade to access premium features and higher word limits.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              style={{
                background: theme.primary,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              View Plans
            </button>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      <div style={{
        background: theme.background,
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: `1px solid ${theme.cardBorder}`
      }}>
        <h3 style={{ color: theme.color, marginBottom: '16px', fontSize: '1.1rem' }}>
          Usage Statistics
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
              Documents Created
            </div>
            <div style={{ color: theme.color, fontWeight: '600', fontSize: '1.2rem' }}>
              {usageStats.documentsCreated}
            </div>
          </div>
          <div>
            <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
              Words Processed
            </div>
            <div style={{ color: theme.color, fontWeight: '600', fontSize: '1.2rem' }}>
              {usageStats.wordsProcessed.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ color: theme.color + '80', fontSize: '0.9rem', marginBottom: '4px' }}>
              Last Activity
            </div>
            <div style={{ color: theme.color, fontWeight: '600' }}>
              {usageStats.lastActivity}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: theme.background,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${theme.cardBorder}`
      }}>
        <h3 style={{ color: theme.color, marginBottom: '16px', fontSize: '1.1rem' }}>
          Quick Actions
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.cardBorder}`,
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: theme.color,
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.background;
              e.target.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = theme.cardBorder;
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>👤</span>
            Edit Profile
          </button>
          
          <button
            onClick={() => setShowBillingModal(true)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.cardBorder}`,
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: theme.color,
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.background;
              e.target.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = theme.cardBorder;
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>💳</span>
            Billing & Subscription
          </button>
          
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.cardBorder}`,
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: theme.color,
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.background;
              e.target.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = theme.cardBorder;
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            Upgrade Plan
          </button>
          
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.error}`,
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: theme.error,
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.error;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = theme.error;
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Security */}
      <div style={{
        background: theme.background,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${theme.cardBorder}`,
        marginTop: '24px'
      }}>
        <h3 style={{ color: theme.color, marginBottom: '16px', fontSize: '1.1rem' }}>
          Account Security
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: theme.cardBackground,
            borderRadius: '8px',
            border: `1px solid ${theme.cardBorder}`
          }}>
            <div style={{ fontSize: '1.2rem' }}>🔐</div>
            <div>
              <div style={{ color: theme.color, fontWeight: '500', fontSize: '0.9rem' }}>
                Two-Factor Authentication
              </div>
              <div style={{ color: theme.color + '80', fontSize: '0.8rem' }}>
                Not enabled
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: theme.cardBackground,
            borderRadius: '8px',
            border: `1px solid ${theme.cardBorder}`
          }}>
            <div style={{ fontSize: '1.2rem' }}>📧</div>
            <div>
              <div style={{ color: theme.color, fontWeight: '500', fontSize: '0.9rem' }}>
                Email Verified
              </div>
              <div style={{ color: theme.success, fontSize: '0.8rem' }}>
                ✓ Verified
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: theme.cardBackground,
            borderRadius: '8px',
            border: `1px solid ${theme.cardBorder}`
          }}>
            <div style={{ fontSize: '1.2rem' }}>🕒</div>
            <div>
              <div style={{ color: theme.color, fontWeight: '500', fontSize: '0.9rem' }}>
                Last Login
              </div>
              <div style={{ color: theme.color + '80', fontSize: '0.8rem' }}>
                {new Date(user.lastLogin).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 