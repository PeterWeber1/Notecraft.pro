import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AIWritingAssistant from './AIWritingAssistant';
import { useResponsive } from './hooks/useResponsive';

function Notepad({ 
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
  const { windowSize, isMobile, isTablet, responsive, containerPadding } = useResponsive();
  const [text, setText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  // Removed savedStatus to eliminate popup notifications
  const [savedNotes, setSavedNotes] = useState([]); // NEW: array of saved notes
  const [expandedNotes, setExpandedNotes] = useState([]); // Track expanded notes
  const [toast, setToast] = useState(''); // For subtle confirmation
  const toastTimer = useRef();
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formatState, setFormatState] = useState({});
  
  // Tier-based features
  const [selectedTier, setSelectedTier] = useState(() => getUserTier ? getUserTier() : 'basic');

  // Update selected tier when user subscription changes
  useEffect(() => {
    if (getUserTier) {
      setSelectedTier(getUserTier());
    }
  }, [getUserTier, subscription]);
  const [aiScore, setAiScore] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [writingStyle, setWritingStyle] = useState('professional');
  const [tone, setTone] = useState('neutral');
  const [targetAudience, setTargetAudience] = useState('general');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Minimalist theme - Twitter Dim inspired dark mode
  const getThemeStyles = () => ({
    background: isDarkMode ? '#15202b' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    cardBackground: isDarkMode ? '#1e2732' : '#ffffff',
    cardBorder: isDarkMode ? '#38444d' : '#e0e0e0',
    inputBackground: isDarkMode ? '#253341' : '#ffffff',
    inputBorder: isDarkMode ? '#38444d' : '#e0e0e0',
    inputColor: isDarkMode ? '#ffffff' : '#000000',
    labelColor: isDarkMode ? '#8899a6' : '#606060',
    mutedColor: isDarkMode ? '#8899a6' : '#a0a0a0',
    editorBackground: isDarkMode ? '#192734' : '#ffffff',
    toolbarBackground: isDarkMode ? '#1e2732' : '#f9f9f9',
    primary: '#635bff',
    accent: '#635bff', 
    success: '#17bf63',
    warning: '#ffad1f',
    error: '#f91880'
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

  const getTierFeatures = (tier) => {
    const features = {
      basic: {
        wordLimit: 500,
        features: ['Basic formatting', 'Word count', 'Reading time', 'Auto-save'],
        color: theme.primary || '#635bff',
        canExport: false,
        canAiDetect: false,
        canAdvancedFormat: false
      },
      pro: {
        wordLimit: 2000,
        features: ['Advanced formatting', 'AI detection', 'Export options', 'Style customization'],
        color: theme.accent || '#635bff',
        canExport: true,
        canAiDetect: true,
        canAdvancedFormat: true
      },
      ultra: {
        wordLimit: 10000,
        features: ['Ultra formatting', 'All Pro features', 'Bulk processing', 'Priority support'],
        color: '#635bff',
        canExport: true,
        canAiDetect: true,
        canAdvancedFormat: true
      }
    };
    return features[tier];
  };

  const currentTier = getTierFeatures(selectedTier);

  // Load saved notes from localStorage on mount
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
      // Load saved notes array
      const notes = JSON.parse(localStorage.getItem('notepadSavedNotes') || '[]');
      setSavedNotes(notes);
    } catch (error) {
      console.log('localStorage not available');
    }
  }, []);

  // Calculate text statistics including AI score and reading time
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed
    
    setReadingTime(readingTimeMinutes);
    
    // Simulate AI detection score (in real app, this would be API call)
    if (text.length > 50 && currentTier.canAiDetect) {
      const randomScore = Math.floor(Math.random() * 40) + 10; // 10-50% AI score
      setAiScore(randomScore);
    } else {
      setAiScore(0);
    }
  }, [text, currentTier.canAiDetect]);

  // Execute formatting command
  const formatText = (command, value = null) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      // Handle alignment commands with toggle functionality
      if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight') {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
          document.execCommand(command, false, null);
          setTimeout(() => updateFormatState(), 50);
          return;
        }

        const range = selection.getRangeAt(0);
        let element = range.commonAncestorContainer;
        
        // Find the block element that contains our selection
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }
        
        // Find the closest block element
        while (element && element !== editorRef.current && !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
          element = element.parentElement;
        }

        if (element && element !== editorRef.current) {
          // Store the current selection and preserve its formatting state
          const currentRange = selection.getRangeAt(0).cloneRange();
          
          // Check current formatting before applying alignment
          const wasBold = document.queryCommandState('bold');
          const wasItalic = document.queryCommandState('italic');
          const wasUnderline = document.queryCommandState('underline');
          
          // Check if this alignment is already active (for toggle functionality)
          const currentAlign = element.style.textAlign;
          const targetAlign = command === 'justifyLeft' ? 'left' : 
                             command === 'justifyCenter' ? 'center' : 'right';
          
          if (currentAlign === targetAlign) {
            // Toggle off - remove alignment (return to default)
            element.style.textAlign = '';
          } else {
            // Apply new alignment
            element.style.textAlign = targetAlign;
          }
          
          // Restore selection first
          selection.removeAllRanges();
          selection.addRange(currentRange);
          
          // If formatting was lost, reapply it
          setTimeout(() => {
            if (selection.rangeCount > 0) {
              const newBold = document.queryCommandState('bold');
              const newItalic = document.queryCommandState('italic');
              const newUnderline = document.queryCommandState('underline');
              
              if (wasBold && !newBold) document.execCommand('bold', false, null);
              if (wasItalic && !newItalic) document.execCommand('italic', false, null);
              if (wasUnderline && !newUnderline) document.execCommand('underline', false, null);
              
              updateFormatState();
            }
          }, 10);
        } else {
          // Fallback to execCommand if we can't find a suitable block element
          document.execCommand(command, false, null);
        }
        
        setTimeout(() => updateFormatState(), 50);
        return;
      }
      
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
              span.style.fontFamily = 'Times New Roman';
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
        setLastSaved(new Date());
        
        // Don't show saved status popup for automatic saves
      } catch (error) {
        console.log('Could not save to localStorage');
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentNote();
      }
      
      // Ctrl/Cmd + Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        document.execCommand('undo');
      }
      
      // Ctrl/Cmd + Y to redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        document.execCommand('redo');
      }
      
      // Ctrl/Cmd + B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        formatText('bold');
      }
      
      // Ctrl/Cmd + I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        formatText('italic');
      }
      
      // Ctrl/Cmd + U for underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        formatText('underline');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          return `<div style="font-family: 'Times New Roman'; font-size: 16px;">${paragraphHTML}</div>`;
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

  // Show toast helper
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
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
      showToast('Notes cleared');
    }
  };

  const copyText = async () => {
    try {
      const textToCopy = editorRef.current ? editorRef.current.innerText : '';
      if (!textToCopy.trim()) {
        alert('No text to copy!');
        return;
      }
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
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
      showToast('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      showToast('Failed to copy text. Please try selecting and copying manually.');
    }
  };

  // Export note as Word document
  const downloadNote = () => {
    try {
      const htmlToExport = editorRef.current ? editorRef.current.innerHTML : '';
      if (!htmlToExport.trim()) {
        alert('No text to export!');
        return;
      }
      
      // Create Word document HTML structure
      const wordDocContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>Notecraft Document</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>90</w:Zoom>
                <w:DoNotPromptForConvert/>
                <w:DoNotShowInsertionsAndDeletions/>
              </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              @page {
                margin: 1in;
              }
              body {
                font-family: "Times New Roman", serif;
                font-size: 12pt;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            ${htmlToExport}
          </body>
        </html>
      `;
      
      const blob = new Blob([wordDocContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notecraft-note-${new Date().toISOString().slice(0, 10)}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Word document exported successfully!');
    } catch (error) {
      console.error('Failed to export Word document:', error);
      showToast('Failed to export Word document. Please try again.');
    }
  };

  // Print current note
  const printNote = () => {
    try {
      const textToPrint = editorRef.current ? editorRef.current.innerHTML : '';
      if (!textToPrint.trim()) {
        alert('No text to print!');
        return;
      }
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Notecraft Note</title>
            <style>
              body { font-family: "Times New Roman", serif; margin: 20px; line-height: 1.6; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${textToPrint}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      console.error('Failed to print note:', error);
      showToast('Failed to print note. Please try again.');
    }
  };

  // Save note to savedNotes array
  const saveCurrentNote = () => {
    if (!text.trim()) {
      showToast('Cannot save empty note');
      return;
    }
    const notes = JSON.parse(localStorage.getItem('notepadSavedNotes') || '[]');
    notes.push(text);
    localStorage.setItem('notepadSavedNotes', JSON.stringify(notes));
    setSavedNotes(notes);
    showToast('Saved Note ' + notes.length);
  };

  // Delete a saved note by index
  const deleteSavedNote = (idx) => {
    const notes = JSON.parse(localStorage.getItem('notepadSavedNotes') || '[]');
    notes.splice(idx, 1);
    localStorage.setItem('notepadSavedNotes', JSON.stringify(notes));
    setSavedNotes(notes);
    setExpandedNotes(expandedNotes.filter(i => i !== idx));
  };

  // Toggle expand/collapse for a note
  const toggleExpandNote = (idx) => {
    setExpandedNotes(expandedNotes.includes(idx)
      ? expandedNotes.filter(i => i !== idx)
      : [...expandedNotes, idx]);
  };

  const insertEmoji = (emoji) => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(emoji);
    range.insertNode(textNode);
    // Move cursor after emoji
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
    editorRef.current.focus();
    updateContent();
  };

  // Update format state (bold, italic, underline, alignment, etc.)
  const updateFormatState = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    
    // Only update format state if selection is actually inside the editor
    const range = sel.getRangeAt(0);
    const isInsideEditor = editorRef.current.contains(range.commonAncestorContainer) || 
                          editorRef.current.contains(range.startContainer) ||
                          editorRef.current.contains(range.endContainer) ||
                          range.commonAncestorContainer === editorRef.current;
    
    if (!isInsideEditor) {
      // If selection is outside editor, reset all format states
      setFormatState({
        bold: false,
        italic: false,
        underline: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false
      });
      return;
    }
    
    try {
      const state = {};
      
      // Check each format state individually and safely
      try { state.bold = document.queryCommandState('bold'); } catch { state.bold = false; }
      try { state.italic = document.queryCommandState('italic'); } catch { state.italic = false; }
      try { state.underline = document.queryCommandState('underline'); } catch { state.underline = false; }
      
      // For alignment, check the current selection/cursor position
      let element = range.commonAncestorContainer;
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }
      
      // Find the closest block element to check alignment
      while (element && element !== editorRef.current && !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
        element = element.parentElement;
      }
      
      if (element && element !== editorRef.current) {
        // Check both CSS style and computed style for alignment
        const inlineTextAlign = element.style.textAlign;
        const computedTextAlign = window.getComputedStyle(element).textAlign;
        const effectiveAlign = inlineTextAlign || computedTextAlign;
        
        // Only show alignment as active if explicitly set by user (not default browser behavior)
        state.justifyLeft = inlineTextAlign === 'left';
        state.justifyCenter = inlineTextAlign === 'center' || effectiveAlign === 'center';
        state.justifyRight = inlineTextAlign === 'right' || effectiveAlign === 'right' || effectiveAlign === 'end';
      } else {
        // No alignment buttons selected initially - user must explicitly choose
        state.justifyLeft = false;
        state.justifyCenter = false;
        state.justifyRight = false;
      }
      
      setFormatState(state);
    } catch (error) {
      console.log('Format state update error:', error);
      // Set safe default state - no alignment buttons selected initially
      setFormatState({
        bold: false,
        italic: false,
        underline: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false
      });
    }
  };

  // Attach selectionchange event to update format state with debouncing
  useEffect(() => {
    let timeoutId;
    const debouncedUpdateFormatState = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateFormatState();
      }, 100); // Debounce by 100ms
    };
    
    document.addEventListener('selectionchange', debouncedUpdateFormatState);
    return () => {
      document.removeEventListener('selectionchange', debouncedUpdateFormatState);
      clearTimeout(timeoutId);
    };
  }, []);

  // Also update format state on input
  const handleEditorInput = (e) => {
    updateContent();
    // Only update format state if editor is focused
    if (document.activeElement === editorRef.current) {
      setTimeout(() => updateFormatState(), 150);
    }
  };

  // Enhanced IconButton with clear active states for both light and dark modes
  const IconButton = ({ icon, onClick, onMouseDown, title, active = false }) => (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={title}
      style={{
        minWidth: '36px',
        height: '36px',
        padding: '8px',
        border: `1px solid ${active ? (isDarkMode ? '#635bff' : '#635bff') : 'transparent'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: active ? 'bold' : 'normal',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active 
          ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)') 
          : 'transparent',
        color: active 
          ? (isDarkMode ? '#ffffff' : '#000000') 
          : (isDarkMode ? '#ffffff' : '#000000'),
        boxShadow: active ? `0 0 0 1px ${isDarkMode ? '#ffffff' : '#000000'}` : 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.target.style.backgroundColor = isDarkMode ? 'rgba(56, 68, 77, 0.3)' : 'rgba(0,0,0,0.04)';
        }
      }}
      onMouseLeave={e => {
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
      backgroundColor: isDarkMode ? '#404040' : '#e0e0e0',
      margin: '0 4px'
    }} />
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isColorPicker = e.target.closest('[data-dropdown="color"]');
      const isLineSpacing = e.target.closest('[data-dropdown="line-spacing"]');
      const isEmojiPicker = e.target.closest('[data-dropdown="emoji"]');
      
      if (!isColorPicker) {
        setShowColorPicker(false);
      }
      if (!isLineSpacing) {
        setShowLineSpacing(false);
      }
      if (!isEmojiPicker) {
        setShowEmojiPicker(false);
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

  // Allow scrolling on Notepad page
  React.useEffect(() => {
    document.body.classList.add('notepad-scrollable');
    document.documentElement.classList.add('notepad-scrollable');
    return () => {
      document.body.classList.remove('notepad-scrollable');
      document.documentElement.classList.remove('notepad-scrollable');
    };
  }, []);

  return (
    <div style={{
      padding: '40px 20px',
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      minHeight: '100vh',
      transition: 'all 0.3s ease',
      boxShadow: 'none', // Remove any shadow
      border: 'none', // Remove any border
    }}>
      <style>{`
        /* Hide scrollbars for all scrollable elements */
        ::-webkit-scrollbar { display: none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        *:focus { outline: none !important; }
        /* Allow scrolling on Notepad page */
        html.notepad-scrollable, body.notepad-scrollable {
          overflow: auto !important;
          height: 100%;
        }
        /* Custom scrollbar for emoji picker */
        .emoji-picker-scroll::-webkit-scrollbar {
          display: block;
          width: 6px;
        }
        .emoji-picker-scroll::-webkit-scrollbar-track {
          background: ${isDarkMode ? 'rgba(56, 68, 77, 0.3)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 3px;
        }
        .emoji-picker-scroll::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(99, 91, 255, 0.4)' : 'rgba(99, 91, 255, 0.3)'};
          border-radius: 3px;
        }
        .emoji-picker-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'rgba(99, 91, 255, 0.6)' : 'rgba(99, 91, 255, 0.5)'};
        }
      `}</style>
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
              to="/"
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
                whiteSpace: 'nowrap',
                background: '#635bff',
                color: '#ffffff',
                border: 'none',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#000000'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#635bff'}
            >
              Back to Humanizer
            </Link>
            {user ? (
              <div className="user-nav" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
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
                    onClick={() => setShowProfileModal && setShowProfileModal(true)}
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
              <button
                onClick={() => setShowLoginModal && setShowLoginModal(true)}
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
                  whiteSpace: 'nowrap',
                  background: '#635bff',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#000000'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#635bff'}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container" style={{
        paddingTop: '80px', // Reduced space from fixed header
        boxSizing: 'border-box',
        boxShadow: 'none',
        border: 'none',
        background: 'none',
      }}>
        {/* Editor Card */}
        <div style={{
          background: theme.background, // Match background for seamlessness
          padding: '0', // Remove padding to align with header
          borderRadius: 0, // Remove radius
          boxShadow: 'none', // Remove shadow
          border: 'none', // Remove border
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
              onChange={(e) => { formatText('fontName', e.target.value); }}
              defaultValue="Times New Roman"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                border: `1px solid ${theme.inputBorder}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              title="Font Family"
              onFocus={e => {
                e.target.style.border = `1px solid #635bff`;
                e.target.style.boxShadow = '0 0 0 2px rgba(99, 91, 255, 0.1)';
              }}
              onBlur={e => {
                e.target.style.border = `1px solid ${theme.inputBorder}`;
                e.target.style.boxShadow = 'none';
              }}
            >
              {fonts.map(font => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>

            {/* Text Size */}
            <select
              onChange={(e) => { formatText('fontSize', e.target.value); }}
              defaultValue="16px"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: theme.inputBackground,
                color: theme.inputColor,
                border: `1px solid ${theme.inputBorder}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              title="Font Size"
              onFocus={e => {
                e.target.style.border = `1px solid #635bff`;
                e.target.style.boxShadow = '0 0 0 2px rgba(99, 91, 255, 0.1)';
              }}
              onBlur={e => {
                e.target.style.border = `1px solid ${theme.inputBorder}`;
                e.target.style.boxShadow = 'none';
              }}
            >
              {textSizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>

            <ToolbarSeparator />

            <IconButton icon="B" onClick={() => { formatText('bold'); setTimeout(() => updateFormatState(), 10); }} title="Bold" active={!!formatState.bold} />
            <IconButton icon="I" onClick={() => { formatText('italic'); setTimeout(() => updateFormatState(), 10); }} title="Italic" active={!!formatState.italic} />
            <IconButton icon="U" onClick={() => { formatText('underline'); setTimeout(() => updateFormatState(), 10); }} title="Underline" active={!!formatState.underline} />
            
            <ToolbarSeparator />
            
            {/* Undo and Redo buttons */}
            <IconButton 
              icon="↶" 
              onClick={() => { document.execCommand('undo'); setTimeout(() => updateFormatState(), 10); }} 
              title="Undo" 
            />
            <IconButton 
              icon="↷" 
              onClick={() => { document.execCommand('redo'); setTimeout(() => updateFormatState(), 10); }} 
              title="Redo" 
            />
            
            {/* Add Emoji with minimalist icon */}
            <div style={{ position: 'relative' }} data-dropdown="emoji">
              <IconButton 
                icon="☺" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmojiPicker(!showEmojiPicker);
                }} 
                title="Add Emoji" 
              />
              {showEmojiPicker && (
                <div 
                  className="emoji-picker-scroll"
                  style={{
                    position: 'absolute',
                    top: '42px',
                    left: '0',
                    width: '280px',
                    maxHeight: '320px',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: isDarkMode 
                      ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 91, 255, 0.2)' 
                      : '0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 91, 255, 0.1)',
                    zIndex: 1000,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${isDarkMode ? '#635bff' : theme.cardBorder}`,
                    backdropFilter: 'blur(20px)',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.labelColor,
                    textAlign: 'center'
                  }}>
                    Choose an Emoji
                  </div>
                  
                  {/* Emoji Categories */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.mutedColor,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Smileys & People
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                      {["😀","😁","😂","🤣","😊","😍","😎","😢","😡","🥳","🤔","😴","😋","😇","🤪","😘"].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            insertEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          style={{
                            fontSize: 18,
                            background: 'transparent',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isDarkMode ? 'rgba(99, 91, 255, 0.15)' : 'rgba(99, 91, 255, 0.08)';
                            e.currentTarget.style.border = '1px solid rgba(99, 91, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.15)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.border = '1px solid transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.mutedColor,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Gestures & Symbols
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                      {["👍","👎","👏","🙏","✋","👋","🤝","💪","🔥","💡","✅","❌","⭐","🎉","🏆","🎯"].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            insertEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          style={{
                            fontSize: 18,
                            background: 'transparent',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isDarkMode ? 'rgba(99, 91, 255, 0.15)' : 'rgba(99, 91, 255, 0.08)';
                            e.currentTarget.style.border = '1px solid rgba(99, 91, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.15)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.border = '1px solid transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.mutedColor,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Objects & Nature
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                      {["🌟","⚡","🌈","🎨","📝","💼","🔍","⚙️","🎵","📱","💻","🚀","🎪","🎭","🎲","🎪"].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            insertEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          style={{
                            fontSize: 18,
                            background: 'transparent',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isDarkMode ? 'rgba(99, 91, 255, 0.15)' : 'rgba(99, 91, 255, 0.08)';
                            e.currentTarget.style.border = '1px solid rgba(99, 91, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.15)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.border = '1px solid transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <ToolbarSeparator />
            
            <IconButton icon={<div style={{display:'flex', flexDirection:'column', gap:'2px', width:'16px'}}><div style={{height:'1px', backgroundColor:'currentColor', width:'12px'}}></div><div style={{height:'1px', backgroundColor:'currentColor', width:'16px'}}></div><div style={{height:'1px', backgroundColor:'currentColor', width:'8px'}}></div></div>} onClick={() => { formatText('justifyLeft'); }} title="Align Left" active={!!formatState.justifyLeft} />
            <IconButton icon={<div style={{display:'flex', flexDirection:'column', gap:'2px', width:'16px', alignItems:'center'}}><div style={{height:'1px', backgroundColor:'currentColor', width:'12px'}}></div><div style={{height:'1px', backgroundColor:'currentColor', width:'16px'}}></div><div style={{height:'1px', backgroundColor:'currentColor', width:'8px'}}></div></div>} onClick={() => { formatText('justifyCenter'); }} title="Align Center" active={!!formatState.justifyCenter} />
            <IconButton icon={<div style={{display:'flex', flexDirection:'column', gap:'2px', width:'16px', alignItems:'flex-end'}}><div style={{height:'1px', backgroundColor:'currentColor', width:'12px'}}></div><div style={{height:'1px', backgroundColor:'currentColor', width:'16px'}}></div><div style={{height:'1px', backgroundColor:'currentColor', width:'8px'}}></div></div>} onClick={() => { formatText('justifyRight'); }} title="Align Right" active={!!formatState.justifyRight} />
            
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
                  top: '42px',
                  left: '0',
                  padding: '8px',
                  borderRadius: '10px',
                  boxShadow: isDarkMode 
                    ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 91, 255, 0.1)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 91, 255, 0.1)',
                  zIndex: 10,
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${isDarkMode ? '#635bff' : theme.cardBorder}`,
                  backdropFilter: 'blur(12px)',
                  minWidth: '120px'
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
                          padding: '8px 12px',
                          fontSize: '14px',
                          fontWeight: '500',
                          textAlign: 'left',
                          borderRadius: '6px',
                          border: '1px solid transparent',
                          backgroundColor: 'transparent',
                          color: theme.color,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'rgba(99, 91, 255, 0.1)' : 'rgba(99, 91, 255, 0.05)';
                          e.target.style.border = '1px solid rgba(99, 91, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.border = '1px solid transparent';
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
            
            <ToolbarSeparator />
            
            {/* Action Buttons - Minimalist Icons */}
            <IconButton 
              icon="⧉" 
              onClick={copyText} 
              title="Copy text to clipboard" 
            />
            <IconButton 
              icon="⎙" 
              onClick={printNote} 
              title="Print note" 
            />
            <IconButton 
              icon="⤋" 
              onClick={downloadNote} 
              title="Export as Word document" 
            />
            <IconButton 
              icon="⊡" 
              onClick={saveCurrentNote} 
              title="Save to my notes collection" 
            />
          </div>

          {/* Link Dialog */}
          {showLinkDialog && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: isDarkMode ? 'rgba(21, 32, 43, 0.8)' : 'rgba(0, 0, 0, 0.5)',
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
                      backgroundColor: '#635bff',
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
                      backgroundColor: isDarkMode ? '#38444d' : '#e0e0e0',
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
          <style 
            dangerouslySetInnerHTML={{ __html: `
              [contenteditable] {
                outline: none;
              }
              [contenteditable] ul,
              [contenteditable] ol {
                margin: 8px 0;
                padding-left: 24px;
                font-family: inherit;
                font-size: inherit;
              }
              [contenteditable] li {
                margin: 4px 0;
                font-family: inherit;
                font-size: inherit;
                list-style-position: outside;
              }
              [contenteditable] ul {
                list-style-type: disc;
              }
              [contenteditable] ol {
                list-style-type: decimal;
              }
              [contenteditable] ul ul {
                list-style-type: circle;
              }
              [contenteditable] ul ul ul {
                list-style-type: square;
              }
              [contenteditable]:empty:before {
                content: "";
                display: inline-block;
              }
              [contenteditable] div {
                font-family: inherit;
                font-size: inherit;
                margin: 0;
                padding: 0;
                min-height: 1.2em;
              }
              [contenteditable] li > div {
                display: inline;
              }
              ${isDarkMode ? `
                [contenteditable] li::marker {
                  color: #d1d5db;
                }
              ` : ''}
            `}} />
          <div style={{
            position: 'relative',
            background: isDarkMode ? 'rgba(56, 68, 77, 0.3)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '0.75rem',
            border: isDarkMode ? '1px solid rgba(56, 68, 77, 0.5)' : '2px solid rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleEditorInput}
              onPaste={handlePaste}
              onFocus={() => setTimeout(() => updateFormatState(), 50)}
              onBlur={() => {
                // Reset format state when editor loses focus
                setFormatState({
                  bold: false,
                  italic: false,
                  underline: false,
                  justifyLeft: false,
                  justifyCenter: false,
                  justifyRight: false
                });
              }}
              placeholder="Start writing your notes here... Everything is automatically saved as you type."
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                height: 'auto',
                minHeight: '400px',
                maxHeight: '60vh',
                padding: 'clamp(12px, 2vw, 32px)',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '16px',
                resize: 'vertical',
                marginBottom: 0,
                fontFamily: '"Times New Roman", serif',
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
          </div>

          {/* Enhanced Statistics */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            margin: '10px 0',
            padding: '12px',
            background: theme.cardBackground,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '8px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              flexWrap: 'wrap',
              fontSize: '14px',
              color: theme.labelColor
            }}>
              <span>Characters: {text.length}</span>
              <span>{text.split(/\s+/).filter(word => word.length > 0).length} words</span>
              <span>Lines: {text.split('\n').length}</span>
              <span>Reading time: {readingTime} min</span>
              {currentTier.canAiDetect && aiScore > 0 && (
                <span style={{ 
                  color: aiScore > 30 ? theme.error : aiScore > 15 ? theme.warning : theme.success,
                  fontWeight: 'bold'
                }}>
                  AI Score: {aiScore}%
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={copyText}
                disabled={!text}
                style={{
                  background: theme.cardBackground,
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.color,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: text ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  fontWeight: '500',
                  opacity: text ? 1 : 0.5
                }}
                title="Copy text to clipboard"
              >
                📋 Copy Text
              </button>
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                style={{
                  background: theme.cardBackground,
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.color,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ⌨️
              </button>
              <button
                onClick={clearNotes}
                title="Clear Notes"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDarkMode ? '#a0a0a0' : '#606060',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 0,
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: theme.background,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: theme.mutedColor,
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span>Auto-save: {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}</span>
              <span>Plan: {selectedTier.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>Ctrl+S: Save</span>
              <span>Ctrl+Z: Undo</span>
              <span>Ctrl+B: Bold</span>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          {showKeyboardShortcuts && (
            <div style={{
              marginBottom: '16px',
              padding: '16px',
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px'
            }}>
              <h4 style={{ 
                color: theme.color, 
                fontSize: '1rem', 
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                ⌨️ Keyboard Shortcuts
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                fontSize: '0.9rem'
              }}>
                <div><strong>Ctrl+S:</strong> Save note</div>
                <div><strong>Ctrl+Z:</strong> Undo</div>
                <div><strong>Ctrl+Y:</strong> Redo</div>
                <div><strong>Ctrl+B:</strong> Bold</div>
                <div><strong>Ctrl+I:</strong> Italic</div>
                <div><strong>Ctrl+U:</strong> Underline</div>
                <div><strong>Ctrl+C:</strong> Copy</div>
                <div><strong>Ctrl+V:</strong> Paste</div>
              </div>
            </div>
          )}

          {/* Advanced Features Panel (Pro & Ultra) */}
          {(selectedTier === 'pro' || selectedTier === 'ultra') && showAdvancedFeatures && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px'
            }}>
              <h3 style={{ 
                color: theme.color, 
                fontSize: '1rem', 
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                Advanced Options
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: theme.labelColor }}>Writing Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.inputColor,
                      fontSize: '0.9rem'
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
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: theme.labelColor }}>Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.inputColor,
                      fontSize: '0.9rem'
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
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: theme.labelColor }}>Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.inputColor,
                      fontSize: '0.9rem'
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
            </div>
          )}

          {/* Export Options Panel (Pro & Ultra) */}
          {currentTier.canExport && canAccessFeature && canAccessFeature('pro') && showExportOptions && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px'
            }}>
              <h3 style={{ 
                color: theme.color, 
                fontSize: '1rem', 
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                Export Options
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={downloadNote}
                  style={{
                    background: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.color,
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  title="Export as plain text file"
                >
                  📄 Export as TXT
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'note.html';
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Exported as HTML');
                  }}
                  style={{
                    background: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.color,
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  title="Export with formatting as HTML file"
                >
                  🌐 Export as HTML
                </button>
                {selectedTier === 'ultra' && (
                  <button
                    onClick={() => {
                      const blob = new Blob([text], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'note.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast('Exported as JSON');
                    }}
                    style={{
                      background: theme.cardBackground,
                      border: `1px solid ${theme.cardBorder}`,
                      color: theme.color,
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                    title="Export as JSON data file"
                  >
                    🔧 Export as JSON
                  </button>
                )}
              </div>
            </div>
          )}

          {/* AI Writing Assistant */}
          {canAccessFeature && canAccessFeature('pro') ? (
            <AIWritingAssistant 
              text={text} 
              tier={selectedTier} 
              isDarkMode={isDarkMode} 
            />
          ) : (
            <div style={{
              padding: '16px',
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '8px',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div style={{ color: theme.color, marginBottom: '12px', fontWeight: 'bold' }}>
                🔒 AI Writing Assistant Requires Pro Subscription
              </div>
              <div style={{ color: theme.mutedColor, marginBottom: '16px', fontSize: '0.9rem' }}>
                Upgrade to Pro to access AI-powered grammar checking, style suggestions, and readability analysis.
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                style={{
                  background: theme.primary,
                  color: 'white',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* Saved Notes Section */}
          {savedNotes.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: theme.color, fontSize: '1.1rem', marginBottom: '10px' }}>Saved Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {savedNotes.map((note, idx) => (
                  <div key={idx} style={{
                    background: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '8px',
                    padding: '16px',
                    position: 'relative',
                  }}>
                    <div style={{
                      whiteSpace: expandedNotes.includes(idx) ? 'pre-wrap' : 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: expandedNotes.includes(idx) ? 'none' : '2.5em',
                      cursor: 'pointer',
                      color: theme.inputColor,
                    }}
                      onClick={() => toggleExpandNote(idx)}
                    >
                      {note}
                    </div>
                    <button
                      onClick={() => deleteSavedNote(idx)}
                      title="Delete Note"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: 'none',
                        border: 'none',
                        color: theme.mutedColor,
                        fontSize: 18,
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          left: '50%',
          bottom: 32,
          transform: 'translateX(-50%)',
          background: isDarkMode ? 'rgba(30, 39, 50, 0.95)' : 'rgba(243,244,246,0.97)',
          color: isDarkMode ? '#ffffff' : '#222',
          padding: '12px 28px',
          borderRadius: 24,
          fontSize: 16,
          fontWeight: 500,
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          zIndex: 1000,
          opacity: toast ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default Notepad;