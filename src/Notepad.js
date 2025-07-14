import React, { useState, useEffect } from 'react';

function Notepad({ isDarkMode, toggleTheme }) {
  const [note, setNote] = useState('');

  // Load saved note from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('simpleNotepadNote');
    if (saved) setNote(saved);
  }, []);

  // Save note to localStorage
  const saveNote = () => {
    localStorage.setItem('simpleNotepadNote', note);
    alert('Note saved!');
  };

  const themeStyles = {
    background: isDarkMode ? '#18181b' : '#f4f4f5',
    color: isDarkMode ? '#fafafa' : '#18181b',
    minHeight: '100vh',
    padding: '40px 20px',
    transition: 'all 0.3s',
    fontFamily: 'Arial, sans-serif',
  };

  const textareaStyles = {
    width: '100%',
    minHeight: '300px',
    fontSize: '1.1rem',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #d4d4d8',
    background: isDarkMode ? '#27272a' : '#fff',
    color: isDarkMode ? '#fafafa' : '#18181b',
    resize: 'vertical',
    marginBottom: '20px',
    boxSizing: 'border-box',
  };

  return (
    <div style={themeStyles}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: '#8b5cf6', fontSize: '2rem' }}>📝 Simple Notepad</h1>
          <button
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? '#374151' : '#e5e7eb',
              border: 'none',
              borderRadius: '50%',
              padding: 12,
              cursor: 'pointer',
              fontSize: 20,
              marginLeft: 12
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <textarea
          style={textareaStyles}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Start typing your notes here..."
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={saveNote}
            style={{
              background: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Save
          </button>
          <button
            onClick={() => setNote('')}
            style={{
              background: isDarkMode ? '#4b5563' : '#e5e7eb',
              color: isDarkMode ? '#fff' : '#18181b',
              border: 'none',
              borderRadius: 6,
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notepad;
