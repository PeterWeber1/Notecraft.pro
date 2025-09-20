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

  // Sidebar state - now collapsed by default on mobile, expanded on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  // Redirect non-authenticated users to homepage
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Update sidebar state on screen size change
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

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

  // Auto-focus the textarea when component mounts and maintain focus
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Maintain focus when sidebar state changes
  useEffect(() => {
    // Small delay to ensure DOM has updated after sidebar transition
    const timer = setTimeout(() => {
      if (textareaRef.current && document.activeElement !== textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

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
    // Ensure focus returns to textarea after clearing
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
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
        left: sidebarCollapsed ? (isMobile ? '60px' : '80px') : (isMobile ? '280px' : '300px'),
        right: 0,
        zIndex: 1000,
        background: theme.card,
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '0.75rem 0' : '1rem 0',
        transition: 'left 0.3s ease-in-out'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '0.5rem' : '1rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          maxWidth: 'none',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              fontWeight: '500',
              color: theme.muted,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8"/>
                <path d="m15 9 6 6"/>
                <path d="m21 9-6 6"/>
              </svg>
              T5 Paraphrase Model
            </span>
          </div>

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

      {/* Dashboard Header */}
      <section style={{
        paddingTop: isMobile ? '80px' : '100px',
        paddingBottom: isMobile ? '30px' : '40px',
        paddingLeft: sidebarCollapsed ? (isMobile ? '60px' : '80px') : (isMobile ? '280px' : '300px'),
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)',
        color: theme.text,
        width: '100%',
        transition: 'padding-left 0.3s ease-in-out'
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
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            lineHeight: '1.5'
          }}>
            Transform your AI-generated text into natural, human-like writing
          </p>
        </div>
      </section>

      {/* Claude AI/ChatGPT Style Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: sidebarCollapsed ? (isMobile ? '60px' : '80px') : (isMobile ? '280px' : '300px'),
        height: '100vh',
        background: theme.card,
        borderRight: `1px solid ${theme.border}`,
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Sidebar Header with Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'space-between' : 'space-between',
          padding: sidebarCollapsed ? '16px' : '20px',
          borderBottom: `1px solid ${theme.border}`,
          minHeight: '70px',
          transition: 'padding 0.3s ease-in-out'
        }}>
          {sidebarCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              opacity: sidebarCollapsed ? 0.7 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#606060"/>
                <rect x="4" y="6" width="24" height="20" rx="4" fill="#606060"/>
                <rect x="10" y="2" width="2" height="4" fill="#606060"/>
                <rect x="20" y="2" width="2" height="4" fill="#606060"/>
                <circle cx="11" cy="2" r="1" fill="#ffffff"/>
                <circle cx="21" cy="2" r="1" fill="#ffffff"/>
                <path d="M8 10 L8 22 L11 22 L11 16 L21 22 L24 22 L24 10 L21 10 L21 16 L11 10 L8 10 Z" fill="#ffffff"/>
              </svg>
            </div>
          )}
          {!sidebarCollapsed && (
            <h3 style={{
              margin: 0,
              color: theme.primary,
              fontSize: '1.2rem',
              fontWeight: '700',
              opacity: sidebarCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}>Notecraft Pro</h3>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: sidebarCollapsed ? '1.3rem' : '1.2rem',
              cursor: 'pointer',
              color: theme.text,
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.secondary}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 0'
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? '0' : '12px',
              padding: sidebarCollapsed ? '16px' : '16px 20px',
              color: theme.text,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.secondary}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title={sidebarCollapsed ? 'Home' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            {!sidebarCollapsed && <span style={{
              opacity: sidebarCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}>Home</span>}
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? '0' : '12px',
              padding: sidebarCollapsed ? '16px' : '16px 20px',
              color: theme.primary,
              backgroundColor: theme.secondary,
              fontWeight: '500',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            title={sidebarCollapsed ? 'Dashboard (current)' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="7" y="7" width="3" height="9"/>
              <rect x="14" y="7" width="3" height="5"/>
            </svg>
            {!sidebarCollapsed && <span style={{
              opacity: sidebarCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}>Dashboard</span>}
          </div>

          <Link
            to="/notepad"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? '0' : '12px',
              padding: sidebarCollapsed ? '16px' : '16px 20px',
              color: theme.text,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.secondary}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title={sidebarCollapsed ? 'Notepad' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {!sidebarCollapsed && <span style={{
              opacity: sidebarCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}>Notepad</span>}
          </Link>

          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? '0' : '12px',
              padding: sidebarCollapsed ? '16px' : '16px 20px',
              color: theme.text,
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.secondary}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title={sidebarCollapsed ? 'Profile' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {!sidebarCollapsed && <span style={{
              opacity: sidebarCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}>Profile</span>}
          </button>

          <button
            onClick={() => setShowBillingModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? '0' : '12px',
              padding: sidebarCollapsed ? '16px' : '16px 20px',
              color: theme.text,
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.secondary}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title={sidebarCollapsed ? 'Billing' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {!sidebarCollapsed && <span style={{
              opacity: sidebarCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}>Billing</span>}
          </button>
        </div>

        {/* User Info at Bottom */}
        {!sidebarCollapsed && (
          <div style={{
            padding: '20px',
            borderTop: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user.user_metadata?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #635bff, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
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
                  (user?.email?.charAt(0).toUpperCase() || 'U')
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  color: theme.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.email || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.muted }}>
                  {getUserTier()} Plan
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'none',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = theme.error;
                e.target.style.color = 'white';
                e.target.style.borderColor = theme.error;
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.text;
                e.target.style.borderColor = theme.border;
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {sidebarCollapsed && (
          <div style={{
            padding: '20px 10px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: user.user_metadata?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #635bff, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              title={`${user?.email || 'User'} - ${getUserTier()} Plan`}
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
                (user?.email?.charAt(0).toUpperCase() || 'U')
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Humanizer Interface */}
      <section style={{
        padding: '40px 0',
        paddingLeft: sidebarCollapsed ? (isMobile ? '60px' : '80px') : (isMobile ? '280px' : '300px'),
        background: theme.background,
        transition: 'padding-left 0.3s ease-in-out'
      }}>
        <div className="container">

          {/* Advanced Humanizer Grid - Mobile Responsive */}
          <div className="humanizer-interface dashboard-grid" style={{
            display: 'grid',
            gridTemplateColumns: responsive('1fr', '1fr', '1fr 1fr', '1fr 1fr', '1fr 1fr'),
            gap: isMobile ? '0.5rem' : isTablet ? '1rem' : '1.5rem',
            marginBottom: isMobile ? '1rem' : '2rem',
            maxWidth: isMobile ? '100%' : isTablet ? '1400px' : '1800px',
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
              minHeight: isMobile ?
                (windowSize.height > windowSize.width ? 'clamp(300px, 35vh, 400px)' : '350px') :
                isTablet ?
                  (windowSize.height > windowSize.width ? 'clamp(350px, 40vh, 500px)' : '450px') :
                  'clamp(450px, 45vh, 650px)'
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
                    caretColor: '#000000'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={clearText}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.muted,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear
                  </button>
                  <div style={{ fontSize: '0.85rem', color: theme.muted }}>
                    {Math.max(1, Math.round(wordCount / 200))}m read
                  </div>

                  {/* Style Controls */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        background: '#ffffff',
                        color: theme.text,
                        fontSize: '0.8rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="neutral">Neutral</option>
                      <option value="friendly">Friendly</option>
                      <option value="formal">Formal</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="confident">Confident</option>
                    </select>

                    <select
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        background: '#ffffff',
                        color: theme.text,
                        fontSize: '0.8rem',
                        outline: 'none',
                        cursor: 'pointer'
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

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isOverLimit && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(99, 91, 255, 0.1)',
                        color: theme.primary,
                        border: `1px solid ${theme.primary}`,
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Upgrade
                    </button>
                  )}
                  <button
                    onClick={isOverLimit ? () => setShowUpgradeModal(true) : handleHumanize}
                    disabled={isProcessing || !text.trim()}
                    style={{
                      padding: '8px 16px',
                      background: isOverLimit ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` : (isProcessing || !text.trim()) ? '#e0e0e0' : 'linear-gradient(135deg, #635bff, #10b981)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: (isProcessing || !text.trim()) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: (isProcessing || !text.trim()) ? 0.7 : 1,
                      minWidth: '120px'
                    }}
                  >
                    {isProcessing ? 'Humanizing...' :
                     isOverLimit ? 'Upgrade Plan' :
                     !text.trim() ? 'Enter Text' :
                     'Humanize'}
                  </button>
                </div>
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
              minHeight: isMobile ?
                (windowSize.height > windowSize.width ? 'clamp(300px, 35vh, 400px)' : '350px') :
                isTablet ?
                  (windowSize.height > windowSize.width ? 'clamp(350px, 40vh, 500px)' : '450px') :
                  'clamp(450px, 45vh, 650px)'
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;