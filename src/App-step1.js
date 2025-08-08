import React, { useState, useEffect } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Debug log
  console.log('🚀 Step 1 App component loaded');

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Update document body class for global theme
    document.body.classList.toggle('dark-mode', newTheme);
    document.documentElement.classList.toggle('dark-mode', newTheme);
  };

  // Save theme preference and update document classes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: isDarkMode ? '#000000' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
      fontSize: '18px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <h1>✅ NOTECRAFT.PRO - Step 1 Test</h1>
        <p>Theme system is working!</p>
        <p>Current mode: {isDarkMode ? 'Dark' : 'Light'}</p>
        
        <button
          onClick={toggleTheme}
          style={{
            padding: '12px 24px',
            backgroundColor: '#635bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '1rem'
          }}
        >
          Toggle Theme
        </button>
        
        <div style={{ marginTop: '2rem', fontSize: '14px', opacity: '0.7' }}>
          <p>✅ React is working</p>
          <p>✅ useState is working</p>
          <p>✅ useEffect is working</p>
          <p>✅ localStorage is working</p>
          <p>✅ Theme toggle is working</p>
        </div>
      </div>
    </div>
  );
}

export default App;