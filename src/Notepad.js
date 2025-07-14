import React, { useState, useEffect, useRef } from 'react';

function Notepad({ isDarkMode = false, toggleTheme = () => {} }) {
  const [text, setText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [savedStatus, setSavedStatus] = useState('');
  const editorRef = useRef(null);

  // Theme-based styles
  const getThemeStyles = () => ({
    background: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#ffffff' : '#111827',
    cardBackground: isDarkMode ? '#1f2937' : '#ffffff',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
    inputBackground: isDarkMode ? '#374151' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    inputColor: isDarkMode ? '#ffffff' : '#111827',
    labelColor: isDarkMode ? '#d1d5db' : '#374151',
    mutedColor: isDarkMode ? '#9ca3af' : '#666666',
    editorBackground: isDarkMode ? '#111827' : '#f9fafb',
    toolbarBackground: isDarkMode ? '#111827' : '#f9fafb'
  });

  const theme = getThemeStyles();

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
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' }
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
      } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.commonAncestorContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
          }
          
          const inList = node.closest('ul, ol');
          
          if (inList) {
            document.execCommand(command, false, null);
          } else {
            const block = node.closest('div, p');
            if (!block || block === editorRef.current) {
              document.execCommand('formatBlock', false, 'div');
            }
            
            setTimeout(() => {
              document.execCommand(command, false, null);
              if (editorRef.current) {
                editorRef.current.focus();
              }
            }, 10);
          }
        }
      } else if (command === 'indent' || command === 'outdent') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.commonAncestorContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
          }
          
          const listItem = node.closest('li');
          if (listItem) {
            document.execCommand(command, false, null);
          } else {
            const block = node.closest('div, p') || node;
            if (block && block !== editorRef.current) {
              const currentMargin = parseInt(block.style.marginLeft || 0);
              if (command === 'indent') {
                block.style.marginLeft = `${currentMargin + 40}px`;
              } else if (currentMargin > 0) {
                block.style.marginLeft = `${Math.max(0, currentMargin - 40)}px`;
              }
            }
          }
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
    
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    
    const paragraphs = text.split(/\n\n+/);
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
      alert('✅ Notes copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy notes');
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
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active 
          ? (isDarkMode ? '#8b5cf6' : '#8b5cf6')
          : 'transparent',
        color: active 
          ? 'white'
          : (isDarkMode ? '#d1d5db' : '#374151'),
        transition: 'all 0.2s ease'
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
      backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
      margin: '0 4px'
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
      padding: '40px 20px', 
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
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
              📝 NoteCraft
            </h1>
            <p style={{ 
              color: theme.mutedColor, 
              margin: 0,
              fontSize: 'clamp(14px, 1.5vw, 18px)'
            }}>
              Your personal writing space with auto-save
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a 
              href="/" 
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
              ← Back to AI Tools
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

        {/* Editor Card */}
        <div style={{ 
          background: theme.cardBackground, 
          padding: 'clamp(20px, 3vw, 40px)', 
          borderRadius: '15px', 
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.cardBorder}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h2 style={{ 
              margin: 0,
              color: theme.color,
              fontSize: 'clamp(1.2rem, 2vw, 1.8rem)'
            }}>
              Your Notes
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                color: '#8b5cf6', // soft purple for status
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {savedStatus}
              </span>
              <button
                onClick={copyText}
                style={{
                  background: '#8b5cf6', // soft purple
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '999px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isDarkMode ? '0 2px 8px rgba(139,92,246,0.10)' : '0 2px 8px rgba(139,92,246,0.08)'
                }}
              >
                📋 Copy All
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '8px',
            border: `1px solid ${theme.cardBorder}`,
            backgroundColor: theme.toolbarBackground
          }}>
            {/* Font Selection */}
            <select
              onChange={(e) => formatText('fontName', e.target.value)}
              defaultValue="Arial"
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                border: `1px solid ${theme.inputBorder}`
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
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                border: `1px solid ${theme.inputBorder}`
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
                  padding: '8px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px'
                  }}>
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          formatText('foreColor', color);
                          setShowColorPicker(false);
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          backgroundColor: color,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <IconButton icon="🔗" onClick={() => setShowLinkDialog(true)} title="Add Link" />
            
            <ToolbarSeparator />
            
            <IconButton icon="←" onClick={() => formatText('justifyLeft')} title="Align Left" />
            <IconButton icon="↔" onClick={() => formatText('justifyCenter')} title="Align Center" />
            <IconButton icon="→" onClick={() => formatText('justifyRight')} title="Align Right" />
            
            <ToolbarSeparator />
            
            <div style={{ position: 'relative' }} data-dropdown="line-spacing">
              <IconButton 
                icon="⇅" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLineSpacing(!showLineSpacing);
                }} 
                title="Line Spacing" 
              />
              {showLineSpacing && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: '0',
                  padding: '8px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${theme.cardBorder}`
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {lineSpacings.map(spacing => (
                      <button
                        key={spacing.value}
                        onClick={() => {
                          if (editorRef.current) {
                            editorRef.current.style.lineHeight = spacing.value;
                          }
                          setShowLineSpacing(false);
                        }}
                        style={{
                          padding: '4px 12px',
                          fontSize: '14px',
                          textAlign: 'left',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: theme.color,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {spacing.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <ToolbarSeparator />
            
            <IconButton 
              icon="•" 
              onMouseDown={(e) => {
                e.preventDefault();
                formatText('insertUnorderedList');
              }} 
              title="Bullet List" 
            />
            <IconButton 
              icon="1." 
              onMouseDown={(e) => {
                e.preventDefault();
                formatText('insertOrderedList');
              }} 
              title="Numbered List" 
            />
            <IconButton icon="⬅" onClick={() => formatText('outdent')} title="Decrease Indent" />
            <IconButton icon="➡" onClick={() => formatText('indent')} title="Increase Indent" />
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
              zIndex: 50
            }}>
              <div style={{
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: theme.color
                }}>
                  Add Link
                </h3>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL"
                  style={{
                    width: '300px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.inputBorder}`,
                    backgroundColor: theme.inputBackground,
                    color: theme.inputColor,
                    fontSize: '14px'
                  }}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  <button
                    onClick={insertLink}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowLinkDialog(false);
                      setLinkUrl('');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                      color: theme.color,
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Rich Text Editor */}
          <div
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={updateContent}
            onPaste={handlePaste}
            style={{
              width: '100%',
              minHeight: '120px',
              maxHeight: 'clamp(350px, 40vh, 500px)',
              padding: '20px',
              border: `2px solid ${theme.inputBorder}`,
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              marginBottom: '20px',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: theme.editorBackground,
              color: theme.inputColor,
              transition: 'all 0.3s ease',
              lineHeight: '1.6',
              overflowY: 'auto',
              outline: 'none',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ 
            display: 'flex', 
            gap: '10px',
            justifyContent: 'flex-end', // right align
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: '8px'
          }}>
            <div style={{ color: theme.labelColor, fontSize: '14px', marginRight: 'auto' }}>
              {text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words • {text.split('\n').length} lines
            </div>
            <button
              onClick={clearNotes}
              style={{
                background: '#ef4444', // soft red
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isDarkMode ? '0 2px 8px rgba(239,68,68,0.10)' : '0 2px 8px rgba(239,68,68,0.08)'
              }}
            >
              🗑️ Clear Notes
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          color: theme.mutedColor,
          fontSize: '14px'
        }}>
          Built with ❤️ by NoteCraft.pro
        </div>
      </div>
    </div>
  );
}

export default Notepad;
