import React, { useState, useEffect, useRef } from 'react';

function Notepad({ isDarkMode = false, toggleTheme = () => {} }) {
  const [text, setText] = useState('');
  const [savedStatus, setSavedStatus] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const editorRef = useRef(null);

  // Theme styles
  const theme = {
    background: isDarkMode ? '#0f1419' : '#f8fafc',
    color: isDarkMode ? '#ffffff' : '#1e293b',
    cardBackground: isDarkMode ? '#1e2329' : '#ffffff',
    cardBorder: isDarkMode ? '#3c4043' : '#e2e8f0',
    inputBackground: isDarkMode ? '#2d3748' : '#ffffff',
    inputBorder: isDarkMode ? '#4a5568' : '#cbd5e0',
    inputColor: isDarkMode ? '#ffffff' : '#1e293b',
    labelColor: isDarkMode ? '#e2e8f0' : '#4a5568',
    mutedColor: isDarkMode ? '#a0aec0' : '#64748b',
    primaryColor: '#8b5cf6',
    successColor: '#10b981',
    errorColor: '#ef4444'
  };

  // Sample text
  const sampleText = `The quick brown fox jumps over the lazy dog. This is a sample text with various issues that can be improved. Their are some grammatical errors and spelling mistakes that need to be fixed.`;

  // Load sample text
  const loadSampleText = () => {
    setText(sampleText);
    if (editorRef.current) {
      editorRef.current.innerHTML = sampleText.replace(/\n/g, '<br>');
    }
    updateContent();
  };

  // Mock AI analysis
  const analyzeText = async () => {
    if (!text.trim()) {
      alert('Please enter some text to analyze!');
      return;
    }

    setIsAnalyzing(true);
    setShowSuggestions(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSuggestions = [
      {
        id: 1,
        type: 'grammar',
        original: 'Their are some',
        suggestion: 'There are some',
        reason: 'Incorrect use of "their" instead of "there"',
        color: '#ef4444'
      },
      {
        id: 2,
        type: 'style',
        original: 'can be improved',
        suggestion: 'could be enhanced',
        reason: 'More formal language',
        color: '#8b5cf6'
      },
      {
        id: 3,
        type: 'clarity',
        original: 'various issues',
        suggestion: 'multiple problems',
        reason: 'More specific language',
        color: '#06b6d4'
      }
    ];

    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
  };

  // Apply suggestion
  const applySuggestion = (suggestion) => {
    const newText = text.replace(suggestion.original, suggestion.suggestion);
    setText(newText);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = newText.replace(/\n/g, '<br>');
    }
    
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

  // Update content and save
  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const plainText = tempDiv.textContent || '';
      setText(plainText);
      
      try {
        localStorage.setItem('notepadContent', plainText);
        setSavedStatus('✅ Saved');
        setTimeout(() => setSavedStatus(''), 2000);
      } catch (error) {
        console.log('Could not save to localStorage');
      }
    }
  };

  // Copy text
  const copyText = () => {
    navigator.clipboard.writeText(text).then(() => {
      setSavedStatus('📋 Copied!');
      setTimeout(() => setSavedStatus(''), 2000);
    }).catch(() => {
      alert('❌ Failed to copy text');
    });
  };

  // Clear notes
  const clearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setText('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      try {
        localStorage.removeItem('notepadContent');
      } catch (error) {
        console.log('Could not clear localStorage');
      }
      setSavedStatus('🗑️ Cleared');
      setTimeout(() => setSavedStatus(''), 2000);
    }
  };

  // Load saved content on mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('notepadContent');
      if (savedContent) {
        setText(savedContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = savedContent.replace(/\n/g, '<br>');
        }
      }
    } catch (error) {
      console.log('localStorage not available');
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
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
              color: theme.primaryColor,
              marginBottom: '8px', 
              fontSize: '2.5rem',
              margin: 0,
              fontWeight: '700'
            }}>
              ✨ AI Writing Assistant
            </h1>
            <p style={{ 
              color: theme.mutedColor, 
              margin: 0,
              fontSize: '18px'
            }}>
              Intelligent text editor with AI-powered suggestions
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a 
              href="/" 
              style={{
                background: theme.cardBackground,
                color: theme.color,
                padding: '12px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                border: `1px solid ${theme.cardBorder}`
              }}
            >
              ← Back to Tools
            </a>
            <button
              onClick={toggleTheme}
              style={{
                background: theme.cardBackground,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '20px'
              }}
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
            border: `1px solid ${theme.cardBorder}`
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
                fontSize: '1.5rem',
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
                    background: '#06b6d4',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📝 Load Sample
                </button>
                <button
                  onClick={copyText}
                  style={{
                    background: theme.successColor,
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Text Editor */}
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={updateContent}
              style={{
                width: '100%',
                height: '400px',
                padding: '20px',
                border: `2px solid ${theme.inputBorder}`,
                borderRadius: '12px',
                fontSize: '16px',
                marginBottom: '20px',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                lineHeight: '1.6',
                overflowY: 'auto',
                outline: 'none'
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
                    background: isAnalyzing ? theme.mutedColor : theme.primaryColor,
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isAnalyzing ? '🔄 Analyzing...' : '🚀 Analyze Text'}
                </button>
                <button
                  onClick={clearNotes}
                  style={{
                    background: theme.errorColor,
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
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
              border: `1px solid ${theme.cardBorder}`,
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
                {['all', 'grammar', 'style', 'clarity'].map(type => (
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
                      background: filterType === type ? theme.primaryColor : theme.inputBackground,
                      color: filterType === type ? 'white' : theme.color,
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Suggestions Content */}
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
                      background: theme.successColor,
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    ✨ Apply All Suggestions ({filteredSuggestions.length})
                  </button>

                  {/* Individual Suggestions */}
                  {filteredSuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      style={{
                        background: theme.inputBackground,
                        border: `1px solid ${theme.inputBorder}`,
                        borderLeft: `4px solid ${suggestion.color}`,
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px'
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

                      {/* Before/After */}
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
                          <div style={{ fontSize: '14px' }}>
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
                          <div style={{ fontSize: '14px' }}>
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
                            background: theme.successColor,
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
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
                            cursor: 'pointer'
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
                    No suggestions found. Your text looks good!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          color: theme.mutedColor,
          fontSize: '14px'
        }}>
          🚀 Powered by AI • Built with ❤️ for better writing
        </div>
      </div>

      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

export default Notepad;
