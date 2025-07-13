import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Notepad from './Notepad';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<HomePage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} 
        />
        <Route 
          path="/notepad" 
          element={<Notepad isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
