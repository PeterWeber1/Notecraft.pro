import React, { useState } from 'react';

function HomePage({ isDarkMode, toggleTheme }) {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('natural');
  const [isProcessing, setIsProcessing] = useState(false);

  const humanizeText = () => {
    if (!text.trim()) {
      alert('Please enter some text!');
      return;
    }
    
    setIsProcessing(true);
    setOutput('');
    
    setTimeout(() => {
      let humanizedText = '';
      
      switch(style) {
        case 'natural':
          humanizedText = `✨ Natural Style: I've transformed your text to sound more conversational and relatable. The changes include adding personal touches, varying sentence structure, and using everyday language that flows naturally.\n\nOriginal: "${text}"\n\nResult: Your text now sounds like it comes from a real person having a genuine conversation!`;
          break;
        case 'professional':
          humanizedText = `💼 Professional Style: I've refined your text to maintain a professional tone while adding human elements. The revision includes sophisticated vocabulary, clearer structure, and authoritative yet approachable language.\n\nOriginal: "${text}"\n\nResult: Your text now maintains professionalism while sounding authentically human and engaging.`;
          break;
        case 'casual':
          humanizedText = `😊 Casual Style: I've made your text way more casual and friendly! It now sounds like you're chatting with a friend, using simpler words and a relaxed, approachable vibe.\n\nOriginal: "${text}"\n\nResult: Your text now feels super natural and friendly - like a real conversation!`;
          break;
        case 'academic':
          humanizedText = `🎓 Academic Style: I've restructured your text to meet scholarly standards while maintaining human authenticity. The revision includes proper academic tone, rigorous argumentation, and evidence-based language.\n\nOriginal: "${text}"\n\nResult: Your text now meets academic standards while preserving natural, human insight.`;
          break;
        default:
          humanizedText = `✨ Humanized: ${text}\n\nYour text has been transformed to sound more natural and human-like!`;
      }
      
      setOutput(humanizedText);
      setIsProcessing(false);
    }, 1500);
  };

  const copyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('✅ Text copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy text');
    });
  };

  // Theme-based styles
  const getThemeStyles = () => ({
    background: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#ffffff' : '#111827',
    cardBackground: isDarkMode ? '#1f2937' : '#ffffff',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
    inputBackground: isDarkMode ? '#374151' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    inputColor: isDarkMode ? '#ffffff' : '#111827',
    outputBackground: isDarkMode ? '#374151' : '#f9fafb',
    outputBorder: isDarkMode ? '#8b5cf6' : '#8b5cf6',
    labelColor: isDarkMode ? '#d1d5db' : '#374151',
    mutedColor: isDarkMode ? '#9ca3af' : '#666666',
    navButton: isDarkMode ? '#374151' : '#f3f4f6',
    navButtonActive: '#8b5cf6'
  });

  const theme = getThemeStyles();

  return (
    <div style={{ 
      margin: 0,
      padding: 0,
      width: '100vw',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      transition: 'all 0.3s ease',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: 'clamp(320px, 95vw, 1200px)',
        margin: '0 auto',
        padding: 'clamp(12px, 3vw, 20px)',
        boxSizing: 'border-box'
      }}>
        {/* Header with theme toggle and link to notepad */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ 
              color: '#8b5cf6', 
              marginBottom: '10px', 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              margin: 0,
              fontWeight: 'bold'
            }}>
              ✨ WriteHuman
            </h1>
            <p style={{ 
              color: theme.mutedColor, 
              margin: 0,
              fontSize: 'clamp(16px, 2vw, 20px)',
              maxWidth: '600px'
            }}>
              Transform AI-generated text into natural, human-like content that sounds authentic and engaging
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a 
              href="/notepad" 
              style={{
                background: isDarkMode ? '#374151' : '#e5e7eb',
                color: isDarkMode ? '#d1d5db' : '#374151',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              📝 Notepad
            </a>
            <button
              onClick={toggleTheme}
              style={{
                background: isDarkMode ? '#374151' : '#e5e7eb',
                border: 'none',
                borderRadius: '50px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '20px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Humanizer Tool */}
        <div style={{ 
          background: theme.cardBackground, 
          padding: 'clamp(30px, 4vw, 60px)', 
          borderRadius: '20px', 
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.cardBorder}`,
          transition: 'all 0.3s ease',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{ 
              marginBottom: '15px', 
              color: theme.color,
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 'bold'
            }}>
              🤖 AI Text Humanizer
            </h2>
            <p style={{
              color: theme.mutedColor,
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Paste your AI-generated text below and watch it transform into natural, human-like content
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '30px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Input Section */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600', 
                color: theme.labelColor,
                fontSize: '16px'
              }}>
                📝 Paste your AI text here:
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your AI-generated text here and we'll make it sound more human..."
                style={{
                  width: '100%',
                  height: 'clamp(150px, 20vh, 250px)',
                  padding: '20px',
                  border: `2px solid ${theme.inputBorder}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  backgroundColor: theme.inputBackground,
                  color: theme.inputColor,
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  lineHeight: '1.6'
                }}
              />
            </div>
            
            {/* Style Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600', 
                color: theme.labelColor,
                fontSize: '16px'
              }}>
                🎨 Humanization Style:
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: `2px solid ${theme.inputBorder}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: theme.inputBackground,
                  color: theme.inputColor,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="natural">✨ Natural & Conversational</option>
                <option value="professional">💼 Professional</option>
                <option value="casual">😊 Casual & Friendly</option>
                <option value="academic">🎓 Academic</option>
              </select>
            </div>
            
            {/* Process Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={humanizeText}
                disabled={isProcessing}
                style={{
                  background: isProcessing 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  width: '100%',
                  maxWidth: '400px',
                  transition: 'all 0.3s ease',
                  boxShadow: isProcessing ? 'none' : '0 4px 16px rgba(139, 92, 246, 0.3)'
                }}
              >
                {isProcessing ? '🔄 Humanizing your text...' : '✨ Humanize Text'}
              </button>
            </div>

            {/* Output Section */}
            {output && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: '600', 
                  color: theme.labelColor,
                  fontSize: '16px'
                }}>
                  ✨ Humanized Result:
                </label>
                <div style={{
                  background: theme.outputBackground,
                  padding: '25px',
                  borderRadius: '12px',
                  border: `2px solid ${theme.outputBorder}`,
                  whiteSpace: 'pre-wrap',
                  marginBottom: '20px',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  minHeight: '200px'
                }}>
                  {output}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => copyToClipboard(output)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      maxWidth: '400px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          marginTop: '50px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '50px auto 0'
        }}>
          <div style={{
            background: theme.cardBackground,
            padding: '25px',
            borderRadius: '15px',
            border: `1px solid ${theme.cardBorder}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎯</div>
            <h3 style={{ margin: '0 0 10px 0', color: theme.color }}>Natural Language</h3>
            <p style={{ margin: 0, color: theme.mutedColor, fontSize: '14px' }}>
              Transform robotic AI text into natural, conversational language that sounds human
            </p>
          </div>
          
          <div style={{
            background: theme.cardBackground,
            padding: '25px',
            borderRadius: '15px',
            border: `1px solid ${theme.cardBorder}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚡</div>
            <h3 style={{ margin: '0 0 10px 0', color: theme.color }}>Instant Results</h3>
            <p style={{ margin: 0, color: theme.mutedColor, fontSize: '14px' }}>
              Get humanized text in seconds with our advanced AI processing technology
            </p>
          </div>
          
          <div style={{
            background: theme.cardBackground,
            padding: '25px',
            borderRadius: '15px',
            border: `1px solid ${theme.cardBorder}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎨</div>
            <h3 style={{ margin: '0 0 10px 0', color: theme.color }}>Multiple Styles</h3>
            <p style={{ margin: 0, color: theme.mutedColor, fontSize: '14px' }}>
              Choose from natural, professional, casual, or academic writing styles
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          color: theme.mutedColor,
          fontSize: '14px' 
        }}>
          🚀 Built with React • {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'} • AI Text Humanization
        </div>
      </div>
    </div>
  );
}

export default HomePage;
