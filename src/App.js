import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('natural');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      alert('✅ Text copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy text');
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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
    mutedColor: isDarkMode ? '#9ca3af' : '#666666'
  });

  const theme = getThemeStyles();

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      {/* NEW: Header with theme toggle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ 
            color: '#8b5cf6', 
            marginBottom: '5px', 
            fontSize: '2.5rem',
            margin: 0
          }}>
            🤖 AI Writing Platform
          </h1>
          <p style={{ 
            color: theme.mutedColor, 
            margin: 0,
            fontSize: '16px'
          }}>
            Transform AI-generated text into human-like content
          </p>
        </div>
        
        {/* NEW: Theme Toggle Button */}
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

      <div style={{ 
        background: theme.cardBackground, 
        padding: '30px', 
        borderRadius: '15px', 
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 4px 20px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.cardBorder}`,
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{ 
          marginBottom: '20px', 
          color: theme.color,
          fontSize: '1.5rem'
        }}>
          AI Humanizer
        </h2>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your AI-generated text here..."
          style={{
            width: '100%',
            height: '120px',
            padding: '15px',
            border: `2px solid ${theme.inputBorder}`,
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '15px',
            fontFamily: 'inherit',
            backgroundColor: theme.inputBackground,
            color: theme.inputColor,
            transition: 'all 0.3s ease'
          }}
        />
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: theme.labelColor,
            fontSize: '14px'
          }}>
            Humanization Style:
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: `2px solid ${theme.inputBorder}`,
              borderRadius: '8px',
              fontSize: '14px',
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
        
        <button
          onClick={humanizeText}
          disabled={isProcessing}
          style={{
            background: isProcessing 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
        >
          {isProcessing ? '🔄 Processing...' : '✨ Humanize Text'}
        </button>

        {output && (
          <div>
            <div style={{
              background: theme.outputBackground,
              padding: '20px',
              borderRadius: '8px',
              border: `2px solid ${theme.outputBorder}`,
              whiteSpace: 'pre-wrap',
              marginBottom: '15px',
              fontSize: '14px',
              lineHeight: '1.6',
              transition: 'all 0.3s ease'
            }}>
              {output}
            </div>
            
            <button
              onClick={copyToClipboard}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s ease'
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        color: theme.mutedColor,
        fontSize: '14px' 
      }}>
        🚀 Built with React • {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </div>
    </div>
  );
}

export default App;
