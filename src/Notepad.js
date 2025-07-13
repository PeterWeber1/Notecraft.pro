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
        maximport React, { useState, useEffect } from 'react';

function Notepad({ isDarkMode, toggleTheme }) {
  const [notes, setNotes] = useState('');
  const [savedStatus, setSavedStatus] = useState('');

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
    mutedColor: isDarkMode ? '#9ca3af' : '#666666'
  });

  const theme = getThemeStyles();

  // Load saved notes on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('aiWriterNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Auto-save notes
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    // Save to localStorage
    localStorage.setItem('aiWriterNotes', newNotes);
    setSavedStatus('✅ Saved');
    
    // Clear saved status after 2 seconds
    setTimeout(() => setSavedStatus(''), 2000);
  };

  const clearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setNotes('');
      localStorage.removeItem('aiWriterNotes');
      setSavedStatus('🗑️ Cleared');
      setTimeout(() => setSavedStatus(''), 2000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes).then(() => {
      alert('✅ Notes copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy notes');
    });
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.color,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header with back link and theme toggle */}
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

        {/* Notepad */}
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
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              margin: 0,
              color: theme.color,
              fontSize: 'clamp(1.2rem, 2vw, 1.8rem)'
            }}>
              Your Notes
            </h2>
            <span style={{ 
              color: '#10b981', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {savedStatus}
            </span>
          </div>

          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Start writing your notes here... Everything is automatically saved as you type."
            style={{
              width: '100%',
              height: 'clamp(400px, 60vh, 700px)',
              padding: '20px',
              border: `2px solid ${theme.inputBorder}`,
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              marginBottom: '20px',
              fontFamily: 'monospace',
              backgroundColor: theme.inputBackground,
              color: theme.inputColor,
              transition: 'all 0.3s ease',
              lineHeight: '1.8'
            }}
          />

          <div style={{ 
            display: 'flex', 
            gap: '10px',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ color: theme.labelColor, fontSize: '14px' }}>
              {notes.length} characters • {notes.split(/\s+/).filter(word => word.length > 0).length} words • {notes.split('\n').length} lines
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
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
                  transition: 'all 0.3s ease'
                }}
              >
                📋 Copy All
              </button>
              <button
                onClick={clearNotes}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🗑️ Clear Notes
              </button>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          color: theme.mutedColor,
          fontSize: '14px' 
        }}>
          🚀 Built with React • {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'} • Auto-saving enabled
        </div>
      </div>
    </div>
  );
}

export default Notepad;
