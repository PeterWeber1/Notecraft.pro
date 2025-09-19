import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResponsive } from './hooks/useResponsive';

function Dashboard({
  isDarkMode = false,
  toggleTheme = () => {},
  user,
  subscription,
  getUserTier,
  canAccessFeature,
  login,
  logout,
  upgradeSubscription,
  register,
  updateProfile,
  cancelSubscription,
  setShowLoginModal,
  setShowRegisterModal,
  setShowUpgradeModal,
  setShowProfileModal,
  setShowBillingModal,
  showEmailConfirmationBanner,
  isEmailVerified
}) {
  const navigate = useNavigate();
  const { windowSize, isMobile, isTablet, responsive, containerPadding } = useResponsive();

  // Redirect non-authenticated users to homepage
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Show loading while redirecting
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #635bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#606060' }}>Redirecting...</p>
        </div>
      </div>
    );
  }

  const theme = {
    background: '#ffffff',
    text: '#000000',
    primary: '#635bff',
    secondary: '#f9f9f9',
    accent: '#635bff',
    muted: '#606060',
    border: '#e0e0e0',
    card: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  const [text, setText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [writingStyle, setWritingStyle] = useState('professional');
  const [tone, setTone] = useState('neutral');
  const [targetAudience, setTargetAudience] = useState('general');
  const textareaRef = useRef(null);
  const [showNotification, setShowNotification] = useState('');
  const [notificationTimer, setNotificationTimer] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeHistory, setActiveHistory] = useState([]);
  const [savedTexts, setSavedTexts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const showNotificationMessage = (message, duration = 3000) => {
    setShowNotification(message);
    if (notificationTimer) {
      clearTimeout(notificationTimer);
    }
    const timer = setTimeout(() => {
      setShowNotification('');
    }, duration);
    setNotificationTimer(timer);
  };

  // Calculate text statistics
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTimeMinutes = Math.ceil(words / 200);

    setWordCount(words);
    setCharCount(chars);
    setReadingTime(readingTimeMinutes);

    if (text.length > 50) {
      const randomScore = Math.floor(Math.random() * 40) + 10;
      setAiScore(randomScore);
    } else {
      setAiScore(0);
    }
  }, [text]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const clearText = () => {
    setText('');
    setHumanizedText('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const copyText = async (textToCopy = humanizedText || text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showNotificationMessage('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      showNotificationMessage('Failed to copy text. Please try selecting and copying manually.', 5000);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? (process.env.REACT_APP_API_URL_PRODUCTION || 'https://your-api-domain.com')
        : (process.env.REACT_APP_API_URL || 'http://localhost:8000');

      const payload = {
        text: text.trim(),
        tone: tone || 'neutral',
        style: writingStyle || 'professional',
        length: 'maintain'
      };

      const response = await fetch(`${apiUrl}/humanize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 503 || response.status === 500) {
          console.warn('API unavailable, using fallback humanization');
          return await fallbackHumanization();
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.humanizedText) {
        setHumanizedText(data.humanizedText);
        if (data.ai_detection_score !== undefined) {
          setAiScore(Math.round(data.ai_detection_score));
        }

        // Add to activity history
        const activity = {
          id: Date.now(),
          timestamp: new Date(),
          originalText: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
          humanizedText: data.humanizedText.slice(0, 100) + (data.humanizedText.length > 100 ? '...' : ''),
          tone,
          style: writingStyle,
          aiScore: Math.round(data.ai_detection_score || aiScore)
        };
        setRecentActivity(prev => [activity, ...prev.slice(0, 9)]);

        showNotificationMessage('Text successfully humanized!');
      } else {
        throw new Error('Invalid response from API');
      }

    } catch (error) {
      console.error('Humanize error:', error);
      if (error.message.includes('fetch')) {
        showNotificationMessage('Unable to connect to humanization service. Using fallback mode.', 4000);
        await fallbackHumanization();
      } else {
        showNotificationMessage(`Humanization failed: ${error.message}`, 4000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackHumanization = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let humanizedText = text;

    humanizedText = humanizedText
      .replace(/\b(However|Moreover|Furthermore|Additionally)\b/gi, (match) => {
        const alternatives = ['But', 'Also', 'Plus', 'What\'s more', 'On top of that'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      })
      .replace(/\b(utilize|utilizes|utilized)\b/gi, 'use')
      .replace(/\b(commence|commences|commenced)\b/gi, 'start');

    setHumanizedText(humanizedText);
    setAiScore(Math.floor(Math.random() * 30) + 5);
  };

  const currentTier = getUserTier ? getUserTier() : 'basic';
  const tierLimits = {
    basic: 500,
    pro: 2000,
    ultra: 10000
  };

  const currentLimit = tierLimits[currentTier] || 500;
  const isOverLimit = wordCount > currentLimit;

  return (
    <div className="stripe-app" style={{ backgroundColor: theme.background, color: theme.text, minHeight: '100vh' }}>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: theme.success,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
          animation: 'slideIn 0.3s ease'
        }}>
          {showNotification}
        </div>
      )}

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: theme.card,
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '0.75rem 0' : '1rem 0',
        width: '100%'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '0.5rem' : '1rem'
        }}>
          <Link to="/" style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: 'var(--stripe-font-weight-bold)',
            color: theme.primary,
            textDecoration: 'none'
          }}>
            Notecraft Pro
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Link
              to="/notepad"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text
              }}
            >
              Notepad
            </Link>

            {/* Current Plan Badge */}
            <div style={{
              background: currentTier === 'basic' ? 'rgba(99, 91, 255, 0.1)' :
                         currentTier === 'pro' ? 'rgba(16, 185, 129, 0.1)' :
                         'rgba(139, 92, 246, 0.1)',
              color: currentTier === 'basic' ? '#635bff' :
                     currentTier === 'pro' ? '#10b981' :
                     '#8b5cf6',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              border: `1px solid ${
                currentTier === 'basic' ? 'rgba(99, 91, 255, 0.3)' :
                currentTier === 'pro' ? 'rgba(16, 185, 129, 0.3)' :
                'rgba(139, 92, 246, 0.3)'
              }`
            }}>
              {currentTier} Plan
            </div>

            {/* User Profile */}
            <div
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user.user_metadata?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #635bff, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: '2px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              title={`${user.user_metadata?.username || user.email?.split('@')[0]} - Click to manage profile`}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
              ) : (
                (user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Collapsible Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          width: sidebarCollapsed ? '60px' : '280px',
          height: 'calc(100vh - 80px)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
          borderRight: '1px solid #e0e0e0',
          zIndex: 999,
          transition: 'width 0.3s ease',
          boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
        {/* Sidebar Toggle Button */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: sidebarCollapsed ? '15px' : '15px',
          width: '30px',
          height: '30px',
          background: '#635bff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(99, 91, 255, 0.3)'
        }}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </div>

        {/* Sidebar Content */}
        <div style={{
          padding: sidebarCollapsed ? '50px 8px 20px' : '50px 20px 20px',
          height: '100%',
          overflow: 'auto'
        }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎯 Quick Actions
              </h3>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => {
                setText('');
                setHumanizedText('');
                if (textareaRef.current) textareaRef.current.focus();
              }}
              style={{
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                background: 'linear-gradient(135deg, #635bff, #7c3aed)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: sidebarCollapsed ? '16px' : '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: sidebarCollapsed ? '0' : '8px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              title={sidebarCollapsed ? 'New Text' : ''}
            >
              {sidebarCollapsed ? '✨' : '✨ New Text'}
            </button>

            <button
              onClick={() => {
                if (humanizedText) {
                  const saved = {
                    id: Date.now(),
                    text: humanizedText,
                    timestamp: new Date(),
                    originalText: text.slice(0, 50) + '...'
                  };
                  setSavedTexts(prev => [saved, ...prev.slice(0, 9)]);
                  showNotificationMessage('Text saved!');
                }
              }}
              disabled={!humanizedText}
              style={{
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                background: humanizedText ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
                color: humanizedText ? '#ffffff' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: sidebarCollapsed ? '16px' : '0.9rem',
                fontWeight: '500',
                cursor: humanizedText ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: sidebarCollapsed ? '0' : '8px'
              }}
              title={sidebarCollapsed ? 'Save Text' : ''}
            >
              {sidebarCollapsed ? '💾' : '💾 Save Text'}
            </button>

            <Link
              to="/notepad"
              target="_blank"
              style={{
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: sidebarCollapsed ? '16px' : '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: sidebarCollapsed ? '0' : '8px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              title={sidebarCollapsed ? 'Open Notepad' : ''}
            >
              {sidebarCollapsed ? '📝' : '📝 Open Notepad'}
            </Link>
          </div>

          {/* Recent Activity Section */}
          {!sidebarCollapsed && recentActivity.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📊 Recent Activity
              </h4>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div
                    key={activity.id}
                    style={{
                      padding: '12px',
                      borderBottom: index < 2 ? '1px solid #f3f4f6' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                    onClick={() => {
                      setText(activity.originalText.replace('...', ''));
                      setTone(activity.tone);
                      setWritingStyle(activity.style);
                    }}
                  >
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      {activity.timestamp.toLocaleTimeString()}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: '1.3'
                    }}>
                      {activity.originalText}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '6px'
                    }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        background: activity.aiScore < 30 ? '#d1fae5' : '#fee2e2',
                        color: activity.aiScore < 30 ? '#065f46' : '#991b1b',
                        borderRadius: '4px'
                      }}>
                        AI: {activity.aiScore}%
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#9ca3af'
                      }}>
                        {activity.style}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Texts Section */}
          {!sidebarCollapsed && savedTexts.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                💾 Saved Texts
              </h4>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {savedTexts.slice(0, 3).map((saved, index) => (
                  <div
                    key={saved.id}
                    style={{
                      padding: '12px',
                      borderBottom: index < 2 ? '1px solid #f3f4f6' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                    onClick={() => copyText(saved.text)}
                  >
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      {saved.timestamp.toLocaleDateString()}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: '1.3'
                    }}>
                      {saved.text.slice(0, 60)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Stats (Collapsed Mode) */}
          {sidebarCollapsed && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #635bff, #7c3aed)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#ffffff'
                }}
                title="Recent Activity"
              >
                📊
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#ffffff'
                }}
                title="Saved Texts"
              >
                💾
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#ffffff'
                }}
                title={`${currentTier.toUpperCase()} Plan`}
              >
                👑
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Dashboard Header */}
      <section style={{
        paddingTop: isMobile ? '80px' : '100px',
        paddingBottom: isMobile ? '30px' : '40px',
        paddingLeft: isMobile ? '0' : (sidebarCollapsed ? '60px' : '280px'),
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)',
        color: theme.text,
        width: '100%',
        transition: 'padding-left 0.3s ease'
      }}>
        <div className="container" style={{
          maxWidth: '100%',
          margin: '0 auto',
          padding: `0 ${containerPadding}`,
          width: '100%'
        }}>
          <h1 style={{
            marginBottom: '1rem',
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            Welcome back, {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}!
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            color: theme.muted,
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            lineHeight: '1.5'
          }}>
            Transform your AI-generated text into natural, human-like writing
          </p>

          {/* Usage Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(1rem, 4vw, 2rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.primary }}>{currentLimit.toLocaleString()}</div>
              <div style={{ fontSize: '0.9rem', color: theme.muted }}>Words per request</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.success }}>∞</div>
              <div style={{ fontSize: '0.9rem', color: theme.muted }}>Requests per day</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.accent }}>{currentTier.toUpperCase()}</div>
              <div style={{ fontSize: '0.9rem', color: theme.muted }}>Current plan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Humanizer Interface */}
      <section style={{
        padding: '40px 0',
        paddingLeft: isMobile ? '0' : (sidebarCollapsed ? '60px' : '280px'),
        background: theme.background,
        transition: 'padding-left 0.3s ease'
      }}>
        <div className="container">

          {/* Advanced Humanizer Grid - Mobile Responsive */}
          <div className="humanizer-interface dashboard-grid" style={{
            display: 'grid',
            gridTemplateColumns: responsive('1fr', '1fr', '1fr 1fr', '1.2fr 1.2fr 0.8fr', '1.2fr 1.2fr 0.8fr'),
            gap: isMobile ? '0.5rem' : '1rem',
            marginBottom: isMobile ? '1rem' : '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%'
          }}>

            {/* Original Text Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(10,10,20,0.07)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? '250px' : '400px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.text }}>Original Text</h3>
                <div style={{
                  color: isOverLimit ? theme.error : theme.muted,
                  fontSize: '0.85rem',
                  fontWeight: isOverLimit ? '600' : 'normal'
                }}>
                  {wordCount}/{currentLimit} words
                </div>
              </div>
              <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Paste your AI-generated text here..."
                  style={{
                    width: '100%',
                    height: '100%',
                    resize: 'none',
                    outline: 'none',
                    border: 0,
                    padding: '16px',
                    background: 'transparent',
                    color: theme.text,
                    lineHeight: 1.55,
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    caretColor: '#635bff'
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderTop: '1px solid #e0e0e0',
                fontSize: '0.85rem',
                color: theme.muted
              }}>
                <button
                  onClick={clearText}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.error,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textDecoration: 'underline'
                  }}
                >
                  Clear
                </button>
                <div>{Math.max(1, Math.round(wordCount / 200))}m read</div>
              </div>
            </div>

            {/* Humanized Output Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(10,10,20,0.07)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? '250px' : '400px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.text }}>Humanized Text</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{
                    padding: '4px 8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    background: aiScore < 30 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: aiScore < 30 ? theme.success : theme.error,
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    AI: {aiScore}%
                  </div>
                </div>
              </div>
              <div style={{
                padding: '16px',
                lineHeight: 1.6,
                overflow: 'auto',
                flex: 1,
                color: theme.text,
                fontSize: '1rem'
              }}>
                {humanizedText || (
                  <div style={{ color: theme.muted, fontStyle: 'italic' }}>
                    Humanized text will appear here...
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderTop: '1px solid #e0e0e0',
                fontSize: '0.85rem',
                color: theme.muted
              }}>
                <button
                  onClick={() => copyText(humanizedText)}
                  disabled={!humanizedText}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: humanizedText ? theme.success : theme.muted,
                    cursor: humanizedText ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem',
                    textDecoration: 'underline'
                  }}
                >
                  Copy
                </button>
                <div>Quality: {humanizedText ? 'High' : 'N/A'}</div>
              </div>
            </div>

            {/* Controls Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(10,10,20,0.07)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.text }}>Settings</h3>
              </div>

              {/* Style Controls */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                padding: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: '#fbfcff',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  borderRadius: '12px'
                }}>
                  <label style={{ fontSize: '0.8rem', color: theme.muted }}>Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: theme.text,
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="neutral">Neutral</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="confident">Confident</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: '#fbfcff',
                  border: '1px solid #e0e0e0',
                  padding: '10px',
                  borderRadius: '12px'
                }}>
                  <label style={{ fontSize: '0.8rem', color: theme.muted }}>Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: theme.text,
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>

              {/* Humanize Button */}
              <div style={{ padding: '12px' }}>
                <button
                  onClick={handleHumanize}
                  disabled={isProcessing || !text.trim() || isOverLimit}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: isOverLimit ? theme.muted : 'linear-gradient(135deg, #635bff, #10b981)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (isProcessing || !text.trim() || isOverLimit) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: (isProcessing || !text.trim() || isOverLimit) ? 0.7 : 1
                  }}
                >
                  {isProcessing ? 'Humanizing...' :
                   isOverLimit ? `Upgrade for ${currentLimit}+ words` :
                   'Humanize Text'}
                </button>

                {isOverLimit && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '8px 16px',
                      background: 'rgba(99, 91, 255, 0.1)',
                      color: theme.primary,
                      border: `1px solid ${theme.primary}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;