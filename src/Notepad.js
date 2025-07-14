import React, { useState, useEffect, useRef } from 'react';

function Notepad({ isDarkMode = false, toggleTheme = () => {} }) {
  const [text, setText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [savedStatus, setSavedStatus] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const editorRef = useRef(null);

  // Theme-based styles
  const getThemeStyles = () => ({
    background: isDarkMode ? '#0f1419' : '#f8fafc',
    color: isDarkMode ? '#ffffff' : '#1e293b',
    cardBackground: isDarkMode ? '#1e2329' : '#ffffff',
    cardBorder: isDarkMode ? '#3c4043' : '#e2e8f0',
    inputBackground: isDarkMode ? '#2d3748' : '#ffffff',
    inputBorder: isDarkMode ? '#4a5568' : '#cbd5e0',
    inputColor: isDarkMode ? '#ffffff' : '#1e293b',
    labelColor: isDarkMode ? '#e2e8f0' : '#4a5568',
    mutedColor: isDarkMode ? '#a0aec0' : '#64748b',
    editorBackground: isDarkMode ? '#1a202c' : '#ffffff',
    toolbarBackground: isDarkMode ? '#2d3748' : '#f1f5f9',
    suggestionBackground: isDarkMode ? '#2d3748' : '#f8fafc',
    successColor: '#10b981',
    errorColor: '#ef4444',
    warningColor: '#f59e0b',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4'
  });

  const theme = getThemeStyles();

  // Sample text for testing
  const sampleText = `The quick brown fox jumps over the lazy dog. This is a sample text with various issues that can be improved. Their are some grammatical errors and spelling mistakes that need to be fixed. The sentence structure could be more clear and the writing style can be enhanced for better readability.

This text also contains some punctuation issues, and repetitive words that could be improved. The clarity of the message needs enhancement and the overall flow could be better structured.`;

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  const fonts = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' }
  ];

  const textSizes = [
    { value: '13.33px', label: '10' },
    { value: '14.67px', label: '11' },
    { value: '16px', label: '12' },
    { value: '18.67px', label: '14' },
    { value: '21.33px', label: '16' },
    { value: '24px', label: '18' },
    { value: '32px', label: '24' },
    { value: '48px', label: '36' }
  ];

  const lineSpacings = [
    { value: '1', label: '1.0' },
    { value: '1.15', label: '1.15' },
    { value: '1.5', label: '1.5' },
    { value: '2', label: '2.0' }
  ];

  // Mock AI analysis function
  const analyzeText = async () => {
    if (!text.trim()) {
      alert('Please enter some text to analyze!');
      return;
    }

    setIsAnalyzing(true);
    setShowSuggestions(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock suggestions based on text content
    const mockSuggestions = [
      {
        id: 1,
        type: 'grammar',
        original: 'Their are some',
        suggestion: 'There are some',
        reason: 'Incorrect use of "their" instead of "there"',
        position: { start: 98, end: 109 },
        color: '#ef4444'
      },
      {
        id: 2,
        type: 'spelling',
        original: 'readability',
        suggestion: 'readability',
        reason: 'Spelling is correct',
        position: { start: 280, end: 291 },
        color: '#10b981'
      },
      {
        id: 3,
        type: 'style',
        original: 'This text also contains',
        suggestion: 'Additionally, this text contains',
        reason: 'More formal transition',
        position: { start: 320, end: 342 },
        color: '#8b5cf6'
      },
      {
        id: 4,
        type: 'clarity',
        original: 'could be better structured',
        suggestion: 'requires better organization',
        reason: 'More specific and clear',
        position: { start: 450, end: 474 },
        color: '#06b6d4'
      },
      {
        id: 5,
        type: 'punctuation',
        original: 'issues, and repetitive',
        suggestion: 'issues and repetitive',
        reason: 'Unnecessary comma before "and"',
        position: { start: 365, end: 386 },
        color: '#f59e0b'
      }
    ];

    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
  };

  // Apply suggestion
  const applySuggestion = (suggestion) => {
    const newText = text.replace(suggestion.original, suggestion.suggestion);
    setText(newText);
    
    // Update editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = newText.replace(/\n/g, '<br>');
    }
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    updateContent();
  };

  // Apply all suggestions
  const applyAllSuggestions = () => {
    let newText = text;
    suggestions.forEach(suggestion => {
      newText = newText.replace(suggestion.original, suggestion.suggestion);
    });
    setText(newText);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = newText.replace(/\n/g, '<br>');
    }
    
    setSuggestions([]);
    updateContent();
  };

  // Dismiss suggestion
  const dismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(s => 
    filterType === 'all' || s.type === filterType
  );

  // Load sample text
  const loadSampleText = () => {
    setText(sampleText);
    if (editorRef.current) {
      editorRef.current.innerHTML = sampleText.replace(/\n/g, '<br>');
    }
    updateContent();
  };

  // Load saved content on mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('notepadContent');
      const savedHtml = localStorage.getItem('notepadHtml');
      if (savedHtml && editorRef.current) {
        editorRef.current.innerHTML = savedHtml;
        setText(savedContent || '');
        setHtmlContent(savedHtml);
      } else if (savedContent) {
        setText(savedContent);
      }
    } catch (error) {
      console.log('localStorage not available');
    }
  }, []);

  // Execute formatting command
  const formatText = (command, value = null) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      if (command === 'fontSize') {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        
        if (range.collapsed) {
          const allContent = editorRef.current.childNodes;
          allContent.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              const span = document.createElement('span');
              span.style.fontSize = value;
              span.style.fontFamily = 'Arial';
              span.textContent = node.textContent;
              node.parentNode.replaceChild(span, node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              node.style.fontSize = value;
            }
          });
        } else {
          const contents = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = value;
          while (contents.firstChild) {
            span.appendChild(contents.firstChild);
          }
          range.insertNode(span);
          range.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        document.execCommand(command, false, value);
      }
      
      if (editorRef.current) {
        editorRef.current.focus();
      }
      updateContent();
    } catch (error) {
      console.error('Error executing format command:', error);
    }
  };

  // Update content and save
  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      
      // Extract plain text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');
      const plainText = tempDiv.textContent || '';
      setText(plainText);
      
      // Save to localStorage
      try {
        localStorage.setItem('notepadContent', plainText);
        localStorage.setItem('notepadHtml', html);
        setSavedStatus('✅ Saved');
        
        // Clear saved status after 2 seconds
        setTimeout(() => setSavedStatus(''), 2000);
      } catch (error) {
        console.log('Could not save to localStorage');
      }
    }
  };

  // Handle paste events
  const handlePaste = (e) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;
    
    const paragraphs = pastedText.split(/\n\n+/);
    const cleanHTML = paragraphs
      .map(paragraph => {
        const lines = paragraph.split('\n');
        const paragraphHTML = lines
          .map(line => line.trim())
          .filter(line => line)
          .join('<br>');
        
        if (paragraphHTML) {
          return `<div style="font-family: Arial; font-size: 16px;">${paragraphHTML}</div>`;
        }
        return '';
      })
      .filter(html => html)
      .join('<div><br></div>');
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const fragment = range.createContextualFragment(cleanHTML);
    range.insertNode(fragment);
    
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    updateContent();
  };

  // Handle link insertion
  const insertLink = () => {
    if (linkUrl) {
      formatText('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  const clearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setText('');
      setHtmlContent('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '<div><br></div>';
      }
      try {
        localStorage.removeItem('notepadContent');
        localStorage.removeItem('notepadHtml');
      } catch (error) {
        console.log('Could not clear localStorage');
      }
      setSavedStatus('🗑️ Cleared');
      setTimeout(() => setSavedStatus(''), 2000);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text).then(() => {
      setSavedStatus('📋 Copied!');
      setTimeout(() => setSavedStatus(''), 2000);
    }).catch(() => {
      alert('❌ Failed to copy text');
    });
  };

  // Icon button component
  const IconButton = ({ icon, onClick, onMouseDown, title, active = false }) => (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={title}
      style={{
        minWidth: '36px',
        height: '36px',
        padding: '8px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active 
          ? theme.primaryColor
          : 'transparent',
        color: active 
          ? 'white'
          : theme.color,
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 2px 4px rgba(139, 92, 246, 0.3)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.backgroundColor = 'transparent';
        }
      }}
    >
      {icon}
    </button>
  );

  const ToolbarSeparator = () => (
    <div style={{
      width: '1px',
      height: '24px',
      backgroundColor: isDarkMode ? '#4a5568' : '#e2e8f0',
      margin: '0 8px'
    }} />
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isColorPicker = e.target.closest('[data-dropdown="color"]');
      const isLineSpacing = e.target.closest('[data-dropdown="line-spacing"]');
      
      if (!isColorPicker) {
        setShowColorPicker(false);
      }
      if (!isLineSpacing) {
        setShowLineSpacing(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize editor on mount
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = '<div><br></div>';
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      width: '100%',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ 
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px', 
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              margin: 0,
              fontWeight: '700'
            }}>
              ✨ AI Writing Assistant
            </h1>
            <p style={{ 
              color: theme.mutedColor, 
              margin: 0,
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              fontWeight: '500'
            }}>
              Intelligent text editor with AI-powered suggestions
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a 
              href="/" 
              style={{
                background: `linear-gradient(135deg, ${theme.cardBackground}, ${theme.inputBackground})`,
                color: theme.color,
                padding: '12px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              ← Back to Tools
            </a>
            <button
              onClick={toggleTheme}
              style={{
                background: `linear-gradient(135deg, ${theme.cardBackground}, ${theme.inputBackground})`,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '20px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: showSuggestions ? '1fr 400px' : '1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Editor Panel */}
          <div style={{ 
            background: theme.cardBackground, 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0,0,0,0.3)' 
              : '0 8px 32px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.cardBorder}`,
            transition: 'all 0.3s ease'
          }}>
            {/* Editor Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h2 style={{ 
                margin: 0,
                color: theme.color,
                fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                fontWeight: '600'
              }}>
                Text Editor
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  color: theme.successColor, 
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {savedStatus}
                </span>
                <button
                  onClick={loadSampleText}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(6, 182, 212, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(6, 182, 212, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(6, 182, 212, 0.3)';
                  }}
                >
                  📝 Load Sample
                </button>
                <button
                  onClick={copyText}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '12px',
              backgroundColor: theme.toolbarBackground,
              border: `1px solid ${theme.cardBorder}`
            }}>
              {/* Font Selection */}
              <select
                onChange={(e) => formatText('fontName', e.target.value)}
                defaultValue="Arial"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground,
                  color: theme.inputColor,
                  border: `1px solid ${theme.inputBorder}`,
                  cursor: 'pointer'
                }}
                title="Font Family"
              >
                {fonts.map(font => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>

              {/* Text Size */}
              <select
                onChange={(e) => formatText('fontSize', e.target.value)}
                defaultValue="16px"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground,
                  color: theme.inputColor,
                  border: `1px solid ${theme.inputBorder}`,
                  cursor: 'pointer'
                }}
                title="Font Size"
              >
                {textSizes.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>

              <ToolbarSeparator />

              <IconButton icon="B" onClick={() => formatText('bold')} title="Bold" />
              <IconButton icon="I" onClick={() => formatText('italic')} title="Italic" />
              <IconButton icon="U" onClick={() => formatText('underline')} title="Underline" />
              
              <ToolbarSeparator />
              
              <div style={{ position: 'relative' }} data-dropdown="color">
                <IconButton 
                  icon="🎨" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }} 
                  title="Text Color" 
                />
                {showColorPicker && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '0',
                    padding: '12px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '6px'
                    }}>
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            formatText('foreColor', color);
                            setShowColorPicker(false);
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '2px solid #ccc',
                            backgroundColor: color,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <IconButton icon="🔗" onClick={() => setShowLinkDialog(true)} title="Add Link" />
            </div>

            {/* Rich Text Editor */}
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={updateContent}
              onPaste={handlePaste}
              placeholder="Start writing or paste your text here..."
              style={{
                width: '100%',
                height: '400px',
                padding: '20px',
                border: `2px solid ${theme.inputBorder}`,
                borderRadius: '12px',
                fontSize: '16px',
                marginBottom: '20px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: theme.editorBackground,
                color: theme.inputColor,
                transition: 'all 0.3s ease',
                lineHeight: '1.6',
                overflowY: 'auto',
                outline: 'none',
                resize: 'vertical'
              }}
            />

            {/* Bottom Stats and Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ color: theme.labelColor, fontSize: '14px', fontWeight: '500' }}>
                {text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={analyzeText}
                  disabled={isAnalyzing}
                  style={{
                    background: isAnalyzing 
                      ? theme.mutedColor 
                      : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isAnalyzing ? 'none' : '0 4px 8px rgba(139, 92, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAnalyzing) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 12px rgba(139, 92, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAnalyzing) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)';
                    }
                  }}
                >
                  {isAnalyzing ? '🔄 Analyzing...' : '🚀 Analyze Text'}
                </button>
                <button
                  onClick={clearNotes}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {showSuggestions && (
            <div style={{ 
              background: theme.cardBackground, 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.3)' 
                : '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.cardBorder}`,
              transition: 'all 0.3s ease',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              {/* Suggestions Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  margin: 0,
                  color: theme.color,
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  🎯 AI Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.mutedColor,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Filter Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                {['all', 'grammar', 'spelling', 'style', 'clarity', 'punctuation'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: filterType === type 
                        ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                        : theme.inputBackground,
                      color: filterType === type ? 'white' : theme.color,
                      border: `1px solid ${filterType === type ? 'transparent' : theme.inputBorder}`,
                      textTransform: 'capitalize'
                    }}
                  >
                    {type} {type !== 'all' && `(${suggestions.filter(s => s.type === type).length})`}
                  </button>
                ))}
              </div>

              {/* Suggestions List */}
              {isAnalyzing ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '40px 20px',
                  color: theme.mutedColor
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: `3px solid ${theme.primaryColor}`,
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '16px'
                  }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    Analyzing your text...
                  </p>
                </div>
              ) : filteredSuggestions.length > 0 ? (
                <>
                  {/* Apply All Button */}
                  <button
                    onClick={applyAllSuggestions}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    ✨ Apply All Suggestions ({filteredSuggestions.length})
                  </button>

                  {/* Individual Suggestions */}
                  {filteredSuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      style={{
                        background: theme.suggestionBackground,
                        border: `1px solid ${theme.inputBorder}`,
                        borderLeft: `4px solid ${suggestion.color}`,
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Suggestion Type Badge */}
                      <div style={{
                        display: 'inline-block',
                        background: suggestion.color,
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        {suggestion.type}
                      </div>

                      {/* Before/After Comparison */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          padding: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '4px' }}>
                            Original:
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                            "{suggestion.original}"
                          </div>
                        </div>
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '8px',
                          padding: '8px'
                        }}>
                          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>
                            Suggestion:
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                            "{suggestion.suggestion}"
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <p style={{
                        color: theme.mutedColor,
                        fontSize: '14px',
                        margin: '0 0 12px 0',
                        lineHeight: '1.4'
                      }}>
                        {suggestion.reason}
                      </p>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          ✓ Apply
                        </button>
                        <button
                          onClick={() => dismissSuggestion(suggestion.id)}
                          style={{
                            background: theme.inputBackground,
                            color: theme.mutedColor,
                            border: `1px solid ${theme.inputBorder}`,
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = theme.mutedColor;
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = theme.inputBackground;
                            e.target.style.color = theme.mutedColor;
                          }}
                        >
                          ✕ Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: theme.mutedColor
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.color }}>Great job!</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    No {filterType === 'all' ? '' : filterType + ' '}suggestions found. Your text looks good!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: theme.cardBackground,
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: `1px solid ${theme.cardBorder}`,
              minWidth: '400px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '16px',
                color: theme.color
              }}>
                Add Link
              </h3>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL (e.g., https://example.com)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `2px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBackground,
                  color: theme.inputColor,
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primaryColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                }}
              />
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={insertLink}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add Link
                </button>
                <button
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: theme.inputBackground,
                    color: theme.color,
                    borderRadius: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          color: theme.mutedColor,
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🚀 Powered by AI • Built with ❤️ for better writing
        </div>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          [contenteditable]:empty:before {
            content: attr(placeholder);
            color: ${theme.mutedColor};
            font-style: italic;
          }
          
          [contenteditable] {
            outline: none;
          }
          
          [contenteditable]:focus {
            border-color: ${theme.primaryColor} !important;
            box-shadow: 0 0 0 3px ${theme.primaryColor}20 !important;
          }
        `
      }} />
    </div>
  );
}

export default Notepad;
