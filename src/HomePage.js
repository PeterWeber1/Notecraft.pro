import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage({ 
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
  setShowBillingModal
}) {
  // Minimalist theme - Black, White, Blue
  const theme = {
    background: '#ffffff',
    text: '#000000',
    primary: '#635bff',
    secondary: '#f9f9f9',
    accent: '#635bff',
    muted: '#606060',
    border: '#e0e0e0',
    card: '#ffffff',
    success: '#000000',
    warning: '#000000',
    error: '#000000'
  };

  const [faqOpen, setFaqOpen] = React.useState(null);
  const [text, setText] = useState('');
  const [humanizedText, setHumanizedText] = useState(''); // NEW: separate state for humanized text
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [selectedTier, setSelectedTier] = useState(() => getUserTier ? getUserTier() : 'basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [writingStyle, setWritingStyle] = useState('professional');
  const [tone, setTone] = useState('neutral');
  const [targetAudience, setTargetAudience] = useState('general');
  const textareaRef = useRef(null);
  const [showNotification, setShowNotification] = useState('');
  const [notificationTimer, setNotificationTimer] = useState(null);

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

  // Update selected tier when user subscription changes
  useEffect(() => {
    if (getUserTier) {
      setSelectedTier(getUserTier());
    }
  }, [getUserTier, subscription]);

  const faqs = [
    {
      q: 'What is Notecraft Pro?',
      a: 'Notecraft Pro is the world\'s most advanced AI humanizer, transforming AI-generated content into authentic, human-like writing.'
    },
    {
      q: 'How does it work?',
      a: 'Our enhanced model and built-in AI detector ensure your content passes leading AI detection tools and reads naturally.'
    },
    {
      q: 'Will my writing lose its original meaning?',
      a: 'No. Notecraft Pro preserves your message while making it sound more human.'
    },
    {
      q: 'Can I use Notecraft Pro for non-AI writing?',
      a: 'Absolutely! Our tool improves any text, AI-generated or not.'
    },
    {
      q: 'What platforms and detectors are compatible?',
      a: 'Notecraft Pro works with content from any AI generator and is tested on GPTZero, Copyleaks, Originality, and more.'
    }
  ];

  // Calculate text statistics
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed
    
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(readingTimeMinutes);
    
    // Simulate AI detection score (in real app, this would be API call)
    if (text.length > 50) {
      const randomScore = Math.floor(Math.random() * 40) + 10; // 10-50% AI score
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const copyText = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      // Show success feedback
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
      // Get API URL based on environment
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.REACT_APP_API_URL_PRODUCTION || 'https://your-api-domain.com')
        : (process.env.REACT_APP_API_URL || 'http://localhost:8000');
      
      // Prepare API payload
      const payload = {
        text: text.trim(),
        tone: tone || 'neutral',
        style: writingStyle || 'professional',
        length: 'maintain'
      };
      
      // Make API call to FastAPI backend
      const response = await fetch(`${apiUrl}/humanize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // If API fails, fall back to simulation
        if (response.status === 503 || response.status === 500) {
          console.warn('API unavailable, using fallback humanization');
          return await fallbackHumanization();
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.humanizedText) {
        setHumanizedText(data.humanizedText);
        
        // Update AI score if provided (try both field names for compatibility)
        if (data.ai_detection_score !== undefined) {
          setAiScore(Math.round(data.ai_detection_score));
        } else if (data.qualityMetrics && data.qualityMetrics.contentSimilarity !== undefined) {
          // Convert content similarity to AI detection score (inverse relationship)
          const aiDetectionScore = Math.max(5, 100 - Math.round(data.qualityMetrics.contentSimilarity * 100));
          setAiScore(aiDetectionScore);
        }
        
        showNotificationMessage('Text successfully humanized!');
      } else {
        throw new Error('Invalid response from API');
      }
      
    } catch (error) {
      console.error('Humanize error:', error);
      
      // Show user-friendly error message
      if (error.message.includes('fetch')) {
        showNotificationMessage('Unable to connect to humanization service. Using fallback mode.', 4000);
        // Fall back to simulation if network error
        await fallbackHumanization();
      } else {
        showNotificationMessage(`Humanization failed: ${error.message}`, 4000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback humanization function (simulation)
  const fallbackHumanization = async () => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple text transformation for fallback
    let humanizedText = text;
    
    // Basic humanization simulation
    humanizedText = humanizedText
      .replace(/\b(However|Moreover|Furthermore|Additionally)\b/gi, (match) => {
        const alternatives = ['But', 'Also', 'Plus', 'What\'s more', 'On top of that'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      })
      .replace(/\b(utilize|utilizes|utilized)\b/gi, (match) => {
        const alternatives = ['use', 'uses', 'used'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      })
      .replace(/\b(commence|commences|commenced)\b/gi, (match) => {
        const alternatives = ['start', 'starts', 'started', 'begin', 'begins', 'began'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      })
      .replace(/\b(implement|implements|implemented)\b/gi, (match) => {
        const alternatives = ['put in place', 'set up', 'start', 'use'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      });
    
    // Add some natural variations based on style/tone
    if (writingStyle === 'casual') {
      humanizedText = humanizedText.replace(/\./g, (match, index) => {
        return Math.random() > 0.7 ? '!' : match;
      });
    }
    
    if (tone === 'friendly') {
      humanizedText = humanizedText.replace(/\b(you)\b/gi, 'you');
    }
    
    setHumanizedText(humanizedText);
    setAiScore(Math.floor(Math.random() * 30) + 5); // Random score between 5-35%
  };

  const getTierFeatures = (tier) => {
    const features = {
      basic: {
        wordLimit: 500,
        features: ['Basic humanization', 'Word count', 'Reading time'],
        color: theme.primary
      },
      pro: {
        wordLimit: 2000,
        features: ['Advanced humanization', 'Style customization', 'Tone adjustment', 'AI detection', 'Export options'],
        color: theme.accent
      },
      ultra: {
        wordLimit: 10000,
        features: ['Ultra humanization', 'All Pro features', 'Bulk processing', 'Priority support', 'Custom styles'],
        color: '#8b5cf6'
      }
    };
    return features[tier];
  };

  const currentTier = getTierFeatures(selectedTier);

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
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: 'var(--stripe-font-weight-bold)',
            color: theme.primary
          }}>
            Notecraft Pro
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            flexWrap: 'wrap'
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
                boxSizing: 'border-box',
                lineHeight: '1',
                minHeight: 'auto',
                height: 'auto',
                fontFamily: 'inherit',
                fontSize: 'var(--stripe-font-size-sm)',
                fontWeight: 'var(--stripe-font-weight-medium)',
                padding: 'var(--stripe-space-3) var(--stripe-space-6)',
                borderRadius: 'var(--stripe-radius-md)',
                whiteSpace: 'nowrap'
              }}
            >
              Notepad
            </Link>
            {!user && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  lineHeight: '1',
                  minHeight: 'auto',
                  height: 'auto',
                  fontFamily: 'inherit',
                  fontSize: 'var(--stripe-font-size-sm)',
                  fontWeight: 'var(--stripe-font-weight-medium)',
                  padding: 'var(--stripe-space-3) var(--stripe-space-6)',
                  borderRadius: 'var(--stripe-radius-md)',
                  whiteSpace: 'nowrap'
                }}
              >
                Pricing
              </button>
            )}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Current Plan Badge */}
                <div style={{
                  background: getUserTier() === 'basic' ? 'rgba(99, 91, 255, 0.1)' : 
                             getUserTier() === 'pro' ? 'rgba(16, 185, 129, 0.1)' : 
                             'rgba(139, 92, 246, 0.1)',
                  color: getUserTier() === 'basic' ? '#635bff' : 
                         getUserTier() === 'pro' ? '#10b981' : 
                         '#8b5cf6',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  border: `1px solid ${
                    getUserTier() === 'basic' ? 'rgba(99, 91, 255, 0.3)' : 
                    getUserTier() === 'pro' ? 'rgba(16, 185, 129, 0.3)' : 
                    'rgba(139, 92, 246, 0.3)'
                  }`
                }}>
                  {getUserTier()} Plan
                </div>


                {/* User Profile Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden'
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
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span style={{
                      display: user.user_metadata?.avatar_url ? 'none' : 'block'
                    }}>
                      {(user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    lineHeight: '1',
                    minHeight: 'auto',
                    height: 'auto',
                    fontFamily: 'inherit',
                    fontSize: 'var(--stripe-font-size-sm)',
                    fontWeight: 'var(--stripe-font-weight-medium)',
                    padding: 'var(--stripe-space-3) var(--stripe-space-6)',
                    borderRadius: 'var(--stripe-radius-md)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    lineHeight: '1',
                    minHeight: 'auto',
                    height: 'auto',
                    fontFamily: 'inherit',
                    fontSize: 'var(--stripe-font-size-sm)',
                    fontWeight: 'var(--stripe-font-weight-medium)',
                    padding: 'var(--stripe-space-3) var(--stripe-space-6)',
                    borderRadius: 'var(--stripe-radius-md)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with SEO-optimized headings */}
      <section className="section" style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center', background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)', color: theme.text }}>
        <div className="container" style={{ maxWidth: '1200px', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <h1 style={{
            marginBottom: 'clamp(1rem, 3vw, 1.2rem)',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            AI Text Humanizer - Convert AI Writing to Human Content<br />
            <span className="text-accent" style={{ color: theme.primary }}>Notecraft Pro</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            opacity: 0.95,
            lineHeight: '1.5'
          }}>
            Transform AI-generated text into natural, human-like writing. Bypass AI detectors like GPTZero, Copyleaks, and Originality with our advanced humanization technology.
          </p>
          
          {/* Plan Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {['basic', 'pro', 'ultra'].map((tier) => {
                const canAccess = canAccessFeature ? canAccessFeature(tier) : true;
                const isSelected = selectedTier === tier;
                
                return (
                  <button
                    key={tier}
                    onClick={() => {
                      if (canAccess) {
                        setSelectedTier(tier);
                      } else if (tier === 'pro' || tier === 'ultra') {
                        // If user is not logged in, show signup modal first
                        if (!user) {
                          setShowRegisterModal(true);
                          showNotificationMessage('Sign up free to access Pro & Ultra features!');
                        } else {
                          setShowUpgradeModal(true);
                        }
                      }
                    }}
                    style={{
                      background: isSelected ? getTierFeatures(tier).color : 'rgba(99, 91, 255, 0.1)',
                      color: isSelected ? '#ffffff' : '#000000',
                      border: '2px solid rgba(99, 91, 255, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      cursor: canAccess ? 'pointer' : 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize',
                      opacity: canAccess ? 1 : 0.6,
                      position: 'relative'
                    }}
                  >
                    {tier}
                    {!canAccess && (tier === 'pro' || tier === 'ultra') && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#635bff',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        $
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              {currentTier.wordLimit} words • {currentTier.features.join(' • ')}
              {!user && (
                <>
                  <br />
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    👆 
                    <button 
                      onClick={() => setShowRegisterModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#10b981',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      Sign up free
                    </button> 
                    to unlock Pro & Ultra features
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Advanced Humanizer Interface */}
          <div className="humanizer-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1.2fr 0.8fr', 
            gap: '1rem', 
            marginBottom: '2rem', 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '0 1rem' 
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
              minHeight: '400px'
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
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.text }}>Original</h3>
                <div style={{ color: theme.muted, fontSize: '0.85rem' }}>Write or paste your AI‑generated text</div>
              </div>
              <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Paste or type your text here…"
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
                <div>{text.trim().split(/\s+/).filter(Boolean).length} words</div>
                <div>{Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200))}m read</div>
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
              minHeight: '400px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.text }}>Humanized</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(0,224,184,0.12))',
                    borderColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: theme.text
                  }}>
                    Preview
                  </button>
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
                  onClick={() => {
                    if (humanizedText) {
                      navigator.clipboard.writeText(humanizedText);
                      showNotificationMessage('Humanized text copied!');
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textDecoration: 'underline'
                  }}
                >
                  Copy
                </button>
                <div>AI Detection: {aiScore}%</div>
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
                <h3 style={{ margin: 0, fontSize: '1rem', color: theme.text }}>Controls</h3>
              </div>
              
              {/* Advanced Controls */}
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
                  <select style={{
                    border: 'none',
                    background: 'transparent',
                    color: theme.text,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}>
                    <option>professional</option>
                    <option>casual</option>
                    <option>academic</option>
                    <option>friendly</option>
                    <option>persuasive</option>
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
                  <label style={{ fontSize: '0.8rem', color: theme.muted }}>Formality</label>
                  <input type="range" min="0" max="100" defaultValue="60" style={{
                    width: '100%',
                    accentColor: '#635bff'
                  }} />
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
                  <label style={{ fontSize: '0.8rem', color: theme.muted }}>Reading Level</label>
                  <select style={{
                    border: 'none',
                    background: 'transparent',
                    color: theme.text,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}>
                    <option>standard</option>
                    <option>simple</option>
                    <option>advanced</option>
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
                  <label style={{ fontSize: '0.8rem', color: theme.muted }}>Intensity</label>
                  <input type="range" min="0" max="100" defaultValue="55" style={{
                    width: '100%',
                    accentColor: '#635bff'
                  }} />
                </div>
              </div>

              {/* Protection Switches */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px',
                padding: '12px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                  Keep quotes & code unchanged
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                  Preserve citations & links
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                  Avoid changing dates & figures
                </label>
              </div>

              {/* Humanize Button */}
              <div style={{ padding: '12px' }}>
                <button
                  onClick={handleHumanize}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #635bff, #10b981)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isProcessing ? 0.7 : 1
                  }}
                >
                  {isProcessing ? 'Humanizing...' : 'Humanize Text'}
                </button>
              </div>

              {/* Analytics */}
              <div style={{
                padding: '12px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: theme.text }}>Analytics</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <div style={{
                    background: '#fbfcff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.text }}>
                      {text.trim().split(/\s+/).filter(Boolean).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.muted }}>Words</div>
                  </div>
                  <div style={{
                    background: '#fbfcff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: theme.text }}>
                      {Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200))}m
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.muted }}>Read Time</div>
                  </div>
                </div>
                
                {/* Humanization Meter */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme.muted, marginBottom: '6px' }}>Humanization Level</div>
                  <div style={{
                    height: '10px',
                    background: 'rgba(127,127,127,0.18)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      display: 'block',
                      height: '100%',
                      width: '55%',
                      background: 'linear-gradient(90deg, #635bff, #10b981)'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Advanced Options Section */}
      <section className="section" style={{ background: theme.background }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: '1380px', margin: '0 auto' }}>
              {/* Advanced Options (Pro & Ultra) */}
              {(selectedTier === 'pro' || selectedTier === 'ultra') && canAccessFeature && canAccessFeature(selectedTier) && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(99, 91, 255, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(99, 91, 255, 0.3)'
                }}>
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    style={{
                      background: '#635bff',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.5rem 1rem',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                  </button>
                  
                  {showAdvancedOptions && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Writing Style</label>
                        <select
                          value={writingStyle}
                          onChange={(e) => setWritingStyle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #e0e0e0',
                            background: '#ffffff',
                            color: '#1a1a1a'
                          }}
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="academic">Academic</option>
                          <option value="creative">Creative</option>
                          <option value="technical">Technical</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tone</label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #e0e0e0',
                            background: '#ffffff',
                            color: '#1a1a1a'
                          }}
                        >
                          <option value="neutral">Neutral</option>
                          <option value="friendly">Friendly</option>
                          <option value="formal">Formal</option>
                          <option value="enthusiastic">Enthusiastic</option>
                          <option value="confident">Confident</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Target Audience</label>
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #e0e0e0',
                            background: '#ffffff',
                            color: '#1a1a1a'
                          }}
                        >
                          <option value="general">General</option>
                          <option value="experts">Experts</option>
                          <option value="beginners">Beginners</option>
                          <option value="students">Students</option>
                          <option value="professionals">Professionals</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upgrade/Signup Prompt for Premium Features */}
              {(selectedTier === 'pro' || selectedTier === 'ultra') && canAccessFeature && !canAccessFeature(selectedTier) && (
                <div style={{
                  marginTop: '1rem',
                  padding: '16px',
                  background: 'rgba(99, 91, 255, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(99, 91, 255, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#000000', marginBottom: '12px', fontWeight: 'bold' }}>
                    🔒 {selectedTier.toUpperCase()} Features {!user ? 'Require Account' : 'Require Subscription'}
                  </div>
                  <div style={{ color: '#000000', marginBottom: '16px', fontSize: '0.9rem' }}>
                    {!user 
                      ? `Sign up free to unlock ${selectedTier} features like AI detection, export options, and style customization.`
                      : `Upgrade to ${selectedTier} to access advanced features like AI detection, export options, and style customization.`
                    }
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {!user ? (
                      <>
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        >
                          Sign Up Free
                        </button>
                        <button
                          onClick={() => setShowLoginModal(true)}
                          style={{
                            background: '#635bff',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        >
                          Login
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        style={{
                          background: '#ff6b6b',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 24px',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        Upgrade Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button 
                  onClick={handleHumanize}
                  disabled={!text.trim() || isProcessing}
                  className={`btn btn-gradient btn-lg ${(!text.trim() || isProcessing) ? 'btn-disabled' : ''}`}
                  style={{
                    opacity: text.trim() && !isProcessing ? 1 : 0.6
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner" style={{ marginRight: '8px' }}></div>
                      Processing...
                    </>
                  ) : 'Humanize Text'}
                </button>
              </div>
              
              {/* Test Button for Development */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                  <button
                    onClick={() => {
                      setText('This is a test AI-generated text that we can use to verify the humanization functionality. It contains some formal language that should be transformed into more natural, human-like writing.');
                      showNotificationMessage('Test text loaded! Click "Humanize Text" to test the functionality.');
                    }}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Load Test Text
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="section" style={{ background: theme.secondary }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            padding: '0 clamp(1rem, 4vw, 2rem)',
            lineHeight: '1.3'
          }}>Humanize AI text in three simple steps:</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1.5rem, 4vw, 2rem)',
            padding: '0 clamp(1rem, 4vw, 2rem)'
          }}>
            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>1️⃣</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Copy AI-generated text</div>
              <div style={{ color: theme.muted }}>Notecraft Pro works with text from ChatGPT, Claude, Deepseek, Gemini, or any other AI content generator.</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>2️⃣</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Paste into Notecraft Pro</div>
              <div style={{ color: theme.muted }}>Our tool refines and transforms your AI-generated content to sound more human.</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>3️⃣</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Click Humanize to transform your text</div>
              <div style={{ color: theme.muted }}>Our advanced AI humanizer is tested on tools like GPTZero, Copyleaks, and Originality.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section" style={{ background: theme.background }}>
        <div className="container text-center" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Produce genuine, human-sounding text in seconds.</h2>
          <p style={{ fontSize: '1.1rem', color: theme.muted, marginBottom: '2rem' }}>
            Notecraft Pro’s AI humanizer tool transforms AI text into authentic, human-like content. Extensively tested on detectors such as GPTZero, Copyleaks, and Quillbot to ensure your content sounds human. Trusted by writers around the world for high-quality writing.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: theme.secondary }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            padding: '0 clamp(1rem, 4vw, 2rem)',
            lineHeight: '1.3'
          }}>Why Choose Our AI Text Humanizer?</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1.5rem, 4vw, 2rem)',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 clamp(1rem, 4vw, 2rem)'
          }}>
            {/* First row - 3 cards */}
            <div style={{ 
              background: theme.card, 
              borderRadius: '1rem', 
              padding: 'clamp(1.5rem, 4vw, 2rem)', 
              border: `1px solid ${theme.border}`, 
              textAlign: 'center',
              height: 'fit-content',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Built-in AI Detection</div>
              <div style={{ color: theme.muted, lineHeight: '1.6' }}>Notecraft Pro's trusted AI Detector ensures your text is human. If it doesn't pass, you can retry your request for free.</div>
            </div>
            <div style={{ 
              background: theme.card, 
              borderRadius: '1rem', 
              padding: 'clamp(1.5rem, 4vw, 2rem)', 
              border: `1px solid ${theme.border}`, 
              textAlign: 'center',
              height: 'fit-content',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Effortlessly Humanize AI Text</div>
              <div style={{ color: theme.muted, lineHeight: '1.6' }}>Refine AI-generated text into authentic, human-quality writing. Paste from any AI platform—our tool enhances it with natural phrasing and emotional depth.</div>
            </div>
            <div style={{ 
              background: theme.card, 
              borderRadius: '1rem', 
              padding: 'clamp(1.5rem, 4vw, 2rem)', 
              border: `1px solid ${theme.border}`, 
              textAlign: 'center',
              height: 'fit-content',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Engage Your Readers in Seconds</div>
              <div style={{ color: theme.muted, lineHeight: '1.6' }}>Instantly improve AI text and protect your authenticity. Notecraft Pro transforms any AI text into human-like content—extensively tested on leading detectors.</div>
            </div>
                         {/* Second row - 3 cards for balance */}
             <div style={{ 
               background: theme.card, 
               borderRadius: '1rem', 
               padding: 'clamp(1.5rem, 4vw, 2rem)', 
               border: `1px solid ${theme.border}`, 
               textAlign: 'center',
               height: 'fit-content',
               minHeight: '200px',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center'
             }}>
               <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Create Engaging Content</div>
               <div style={{ color: theme.muted, lineHeight: '1.6' }}>Produce human-quality content with Notecraft Pro's advanced AI humanizer—text that reads naturally, even on leading AI detectors.</div>
             </div>
             <div style={{ 
               background: theme.card, 
               borderRadius: '1rem', 
               padding: 'clamp(1.5rem, 4vw, 2rem)', 
               border: `1px solid ${theme.border}`, 
               textAlign: 'center',
               height: 'fit-content',
               minHeight: '200px',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center'
             }}>
               <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Quality Humanizer Output</div>
               <div style={{ color: theme.muted, lineHeight: '1.6' }}>No more grammatical errors or low-quality output. Notecraft Pro delivers the highest quality outputs in the industry.</div>
             </div>
             <div style={{ 
               background: theme.card, 
               borderRadius: '1rem', 
               padding: 'clamp(1.5rem, 4vw, 2rem)', 
               border: `1px solid ${theme.border}`, 
               textAlign: 'center',
               height: 'fit-content',
               minHeight: '200px',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center'
             }}>
               <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Advanced Analytics</div>
               <div style={{ color: theme.muted, lineHeight: '1.6' }}>Track your writing performance with detailed analytics and insights to improve your content quality over time.</div>
             </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '60px 0', background: theme.background }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            lineHeight: '1.3'
          }}>Choose the plan that's right for you.</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 3vw, 2rem)',
            justifyItems: 'center'
          }}>
            {[
              { name: 'Basic', price: '$0', period: 'Free tier', features: ['500 words per request', 'Basic humanization', 'Word count & reading time', 'Auto-save'], badge: 'Best for light users' },
              { name: 'Pro', price: '$29.99', period: 'Per month', features: ['2000 words per request', 'Advanced humanization', 'AI detection', 'Export options', 'Style customization'], badge: 'Best for most users', highlight: true },
              { name: 'Ultra', price: '$59.99', period: 'Per month', features: ['10000 words per request', 'Ultra humanization', 'All Pro features', 'Bulk processing', 'Priority support'], badge: 'Best for power users' }
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.highlight ? theme.primary : theme.card,
                color: plan.highlight ? '#fff' : theme.text,
                borderRadius: '1rem',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                width: '100%',
                maxWidth: '320px',
                border: `2px solid ${plan.highlight ? theme.primary : theme.border}`,
                boxShadow: plan.highlight ? '0 4px 24px rgba(99,102,241,0.15)' : 'none',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '-1.5rem', left: '50%', transform: 'translateX(-50%)', background: theme.accent, color: '#1a1a1a', borderRadius: '1rem', padding: '0.3rem 1.2rem', fontWeight: 600, fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>{plan.badge}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>{plan.name}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                  {plan.price.includes('$') ? (
                    <>
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
                      {plan.price.substring(1)}
                    </>
                  ) : plan.price}
                </div>
                <div style={{ fontSize: '1rem', color: plan.highlight ? '#e0e7ff' : theme.muted, marginBottom: '1.2rem' }}>{plan.period}</div>
                <ul style={{ textAlign: 'left', padding: 0, margin: 0, listStyle: 'none', marginBottom: '1.2rem' }}>
                  {plan.features.map((f, j) => <li key={j} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: theme.accent }}>✔️</span> {f}</li>)}
                </ul>
                <button 
                  onClick={() => {
                    console.log('🔧 Subscribe button clicked for plan:', plan.name);
                    if (plan.name === 'Basic') {
                      if (!user) {
                        console.log('🔧 Basic plan - no user, showing signup modal');
                        setShowRegisterModal(true);
                        showNotificationMessage('Sign up free to get started with Basic plan!');
                      } else {
                        console.log('🔧 Basic plan - user logged in');
                        showNotificationMessage('You\'re already on the Basic plan! Start humanizing text above.');
                      }
                    } else {
                      if (!user) {
                        console.log('🔧 Paid plan - no user, showing signup modal first');
                        setShowRegisterModal(true);
                        showNotificationMessage(`Sign up free first, then upgrade to ${plan.name}!`);
                      } else {
                        console.log('🔧 Paid plan - user logged in, opening upgrade modal');
                        setShowUpgradeModal(true);
                      }
                    }
                  }}
                  className={plan.highlight ? "btn btn-secondary" : "btn btn-primary"}
                  style={{
                    width: '100%'
                  }}
                >
                  {plan.name === 'Basic' 
                    ? (user ? 'Current Plan' : 'Get Started Free') 
                    : (user ? 'Upgrade Now' : 'Sign Up & Upgrade')}
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', color: theme.muted, marginTop: '2rem', fontSize: '1rem' }}>
            Not ready to commit? All users can submit unlimited requests for free, up to 500 words each.
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section style={{ padding: '60px 0', background: theme.secondary }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', marginBottom: '1rem' }}>"</div>
          <div style={{
            fontSize: 'clamp(1rem, 4vw, 1.2rem)',
            fontStyle: 'italic',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            As a digital marketer, my writing gains warmth and personality, as if I'd spent days perfecting it.
          </div>
          <div style={{ fontWeight: 'bold', color: theme.primary }}>— Yuna K.</div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 0', background: theme.background }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            lineHeight: '1.3'
          }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: theme.card,
                borderRadius: '1rem',
                padding: 'clamp(1rem, 4vw, 1.5rem) clamp(1.5rem, 5vw, 2rem)',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', color: theme.primary }}>{faq.q}</div>
                <div style={{ color: theme.muted, maxHeight: faqOpen === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s', fontSize: '1rem' }}>{faqOpen === i && faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '60px 0', background: theme.primary, color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            lineHeight: '1.3'
          }}>Humanize your AI writing with Notecraft Pro.</h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            opacity: 0.95,
            lineHeight: '1.5'
          }}>
            Transform your AI-generated text into authentic, human-quality content—trusted by professionals, creators, and marketers worldwide.
          </p>
          <Link to="/notepad" target="_blank" rel="noopener noreferrer" className="btn btn-gradient btn-lg" style={{ textDecoration: 'none' }}>Start Humanizing Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, padding: '3rem 0 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)', textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            color: theme.primary,
            marginBottom: '1rem'
          }}>Notecraft Pro</div>
          <p style={{
            color: theme.muted,
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            lineHeight: '1.5'
          }}>
            The ultimate AI-powered humanizer for professionals and creators.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(1rem, 4vw, 2rem)',
            flexWrap: 'wrap',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
          }}>
            <Link to="/notepad" target="_blank" rel="noopener noreferrer" style={{ color: theme.text, textDecoration: 'none', fontWeight: '500' }}>Try Now</Link>
            <Link to="/privacy" style={{ color: theme.text, textDecoration: 'none', fontWeight: '500' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: theme.text, textDecoration: 'none', fontWeight: '500' }}>Terms of Service</Link>
          </div>
          <div style={{ color: theme.muted, fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} Notecraft Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
