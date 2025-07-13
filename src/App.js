import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Notepad from './Notepad';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
