import React, { useState } from 'react';

function HomePage({ isDarkMode, toggleTheme }) {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('natural');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Navigation state
  const [currentTool, setCurrentTool] = useState('humanizer');
  
  // AI Writer state
  const [writerPrompt, setWriterPrompt] = useState('');
  const [writerType, setWriterType] = useState('article');
  const [writerOutput, setWriterOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  // AI Writer function
  const generateContent = () => {
    if (!writerPrompt.trim()) {
      alert('Please enter a writing prompt!');
      return;
    }
    
    setIsGenerating(true);
    setWriterOutput('');
    
    setTimeout(() => {
      let generatedContent = '';
      
      switch(writerType) {
        case 'article':
          generatedContent = `📰 Article: "${writerPrompt}"\n\nIn today's rapidly evolving world, the topic you've chosen represents a fascinating area of exploration. This subject offers multiple perspectives that deserve careful consideration.\n\nThe key aspects to understand include the fundamental principles, practical applications, and long-term implications. Each element contributes to a comprehensive understanding that benefits both newcomers and experts in the field.\n\nAs we look toward the future, it's clear that continued research and development in this area will yield significant benefits. The potential for innovation remains vast, with opportunities for breakthrough discoveries that could reshape our understanding.\n\nIn conclusion, this topic represents an exciting frontier that merits continued attention and investment from researchers, practitioners, and enthusiasts alike.`;
          break;
        case 'blog':
          generatedContent = `✍️ Blog Post: "${writerPrompt}"\n\nHey there! Let's dive into something I've been thinking about lately: ${writerPrompt.toLowerCase()}.\n\nYou know what's interesting? This topic has been on my mind because it affects so many of us in our daily lives. I've noticed that people often overlook the subtle details that make all the difference.\n\nHere's what I've learned from my experience:\n\n• The importance of taking a step back and seeing the bigger picture\n• How small changes can lead to significant improvements\n• Why it's worth investing time to understand the fundamentals\n\nThe more I explore this subject, the more fascinated I become. There's always another layer to uncover, another perspective to consider.\n\nWhat do you think? Have you had similar experiences? I'd love to hear your thoughts in the comments below!`;
          break;
        case 'email':
          generatedContent = `📧 Email: "${writerPrompt}"\n\nSubject: Regarding ${writerPrompt}\n\nHi there,\n\nI hope this email finds you well. I wanted to reach out to discuss ${writerPrompt.toLowerCase()} and share some thoughts that might be helpful.\n\nAfter giving this some consideration, I believe there are several important points worth highlighting:\n\n1. The current situation presents both opportunities and challenges\n2. A strategic approach will help us navigate the complexities involved\n3. Collaboration and open communication will be key to success\n\nI'd appreciate the opportunity to discuss this further at your convenience. Please let me know when you might be available for a brief conversation.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]`;
          break;
        case 'story':
          generatedContent = `📚 Creative Story: "${writerPrompt}"\n\nThe morning mist hung low over the quiet town as Sarah opened her laptop, ready to explore the intriguing world of ${writerPrompt.toLowerCase()}. Little did she know that this simple action would set in motion a series of events that would change everything.\n\nAs she delved deeper into her research, patterns began to emerge that she'd never noticed before. Each discovery led to new questions, and each answer opened doors to possibilities she'd never imagined.\n\n"This is incredible," she whispered to herself, scrolling through page after page of fascinating information. The more she learned, the more she realized how much there was still to discover.\n\nHours passed like minutes as Sarah became completely absorbed in her exploration. By the time the sun began to set, she had uncovered insights that would reshape her understanding forever.\n\nAnd this was only the beginning of her journey into the remarkable world of ${writerPrompt.toLowerCase()}.`;
          break;
        default:
          generatedContent = `Generated content about: ${writerPrompt}\n\nYour content has been created with a human-like approach, incorporating natural language patterns and engaging storytelling elements.`;
      }
      
      setWriterOutput(generatedContent);
      setIsGenerating(false);
    }, 2000);
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
        maxWidth: 'clamp(320px, 95vw, 1400px)',
        margin: '0 auto',
        padding: 'clamp(12px, 3vw, 20px)',
        boxSizing: 'border-box'
      }}>
        {/* Header with theme toggle and link to notepad */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ 
              color: '#8b5cf6', 
              marginBottom: '5px', 
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              margin: 0
            }}>
              🤖 AI Writing Platform
            </h1>
            <p style={{ 
              color: theme.mutedColor, 
              margin: 0,
              fontSize: 'clamp(14px, 1.5vw, 18px)'
            }}>
              Transform and create content with AI-powered tools
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a 
              href="/notepad" 
              style={{
                background: isDarkMode ? '#374151' : '#e5e7eb',
                color: isDarkMode ? '#d1d5db' : '#374151',
                padding: '10px 20px',
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

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          background: theme.cardBackground,
          padding: '10px',
          borderRadius: '12px',
          border: `1px solid ${theme.cardBorder}`,
          maxWidth: '600px'
        }}>
          <button
            onClick={() => setCurrentTool('humanizer')}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: currentTool === 'humanizer' ? theme.navButtonActive : theme.navButton,
              color: currentTool === 'humanizer' ? 'white' : theme.color
            }}
          >
            🤖 AI Humanizer
          </button>
          <button
            onClick={() => setCurrentTool('writer')}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: currentTool === 'writer' ? theme.navButtonActive : theme.navButton,
              color: currentTool === 'writer' ? 'white' : theme.color
            }}
          >
            ✍️ AI Writer
          </button>
        </div>

        {/* AI Humanizer Tool */}
        {currentTool === 'humanizer' && (
          <div style={{ 
            background: theme.cardBackground, 
            padding: 'clamp(20px, 3vw, 40px)', 
            borderRadius: '15px', 
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.cardBorder}`,
            transition: 'all 0.3s ease',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ 
              marginBottom: '20px', 
              color: theme.color,
              fontSize: 'clamp(1.2rem, 2vw, 1.8rem)'
            }}>
              AI Humanizer
            </h2>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your AI-generated text here..."
              style={{
                width: '100%',
                height: 'clamp(120px, 15vh, 200px)',
                padding: '15px',
                border: `2px solid ${theme.inputBorder}`,
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                marginBottom: '15px',
                fontFamily: 'inherit',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
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
                  maxWidth: '400px',
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
                fontSize: '16px',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                marginBottom: '20px',
                width: '100%',
                maxWidth: '400px',
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
                  fontSize: '16px',
                  lineHeight: '1.6',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}>
                  {output}
                </div>
                
                <button
                  onClick={() => copyToClipboard(output)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Writer Tool */}
        {currentTool === 'writer' && (
          <div style={{ 
            background: theme.cardBackground, 
            padding: 'clamp(20px, 3vw, 40px)', 
            borderRadius: '15px', 
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.cardBorder}`,
            transition: 'all 0.3s ease',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ 
              marginBottom: '20px', 
              color: theme.color,
              fontSize: 'clamp(1.2rem, 2vw, 1.8rem)'
            }}>
              AI Writer
            </h2>
            
            <textarea
              value={writerPrompt}
              onChange={(e) => setWriterPrompt(e.target.value)}
              placeholder="Describe what you want to write about..."
              style={{
                width: '100%',
                height: 'clamp(120px, 15vh, 200px)',
                padding: '15px',
                border: `2px solid ${theme.inputBorder}`,
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                marginBottom: '15px',
                fontFamily: 'inherit',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
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
                Content Type:
              </label>
              <select
                value={writerType}
                onChange={(e) => setWriterType(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
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
                <option value="article">📰 Article</option>
                <option value="blog">✍️ Blog Post</option>
                <option value="email">📧 Email</option>
                <option value="story">📚 Creative Story</option>
              </select>
            </div>
            
            <button
              onClick={generateContent}
              disabled={isGenerating}
              style={{
                background: isGenerating 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                marginBottom: '20px',
                width: '100%',
                maxWidth: '400px',
                transition: 'all 0.3s ease'
              }}
            >
              {isGenerating ? '🔄 Generating...' : '✨ Generate Content'}
            </button>

            {writerOutput && (
              <div>
                <div style={{
                  background: theme.outputBackground,
                  padding: '20px',
                  borderRadius: '8px',
                  border: `2px solid #059669`,
                  whiteSpace: 'pre-wrap',
                  marginBottom: '15px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}>
                  {writerOutput}
                </div>
                
                <button
                  onClick={() => copyToClipboard(writerOutput)}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          color: theme.mutedColor,
          fontSize: '14px' 
        }}>
          🚀 Built with React • {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'} • {currentTool === 'humanizer' ? 'AI Humanizer' : 'AI Writer'} Active
        </div>
      </div>
    </div>
  );
}

export default HomePage;
