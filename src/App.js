import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Notepad from './Notepad';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import SubscriptionManager from './SubscriptionManager';

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
      <SubscriptionManager isDarkMode={isDarkMode}>
        {({ user, subscription, getUserTier, canAccessFeature, login, logout, upgradeSubscription, setShowLoginModal, setShowUpgradeModal }) => (
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  isDarkMode={isDarkMode} 
                  toggleTheme={toggleTheme}
                  user={user}
                  subscription={subscription}
                  getUserTier={getUserTier}
                  canAccessFeature={canAccessFeature}
                  login={login}
                  logout={logout}
                  upgradeSubscription={upgradeSubscription}
                  setShowLoginModal={setShowLoginModal}
                  setShowUpgradeModal={setShowUpgradeModal}
                />
              } 
            />
            <Route 
              path="/notepad" 
              element={
                <Notepad 
                  isDarkMode={isDarkMode} 
                  toggleTheme={toggleTheme}
                  user={user}
                  subscription={subscription}
                  getUserTier={getUserTier}
                  canAccessFeature={canAccessFeature}
                  login={login}
                  logout={logout}
                  upgradeSubscription={upgradeSubscription}
                  setShowLoginModal={setShowLoginModal}
                  setShowUpgradeModal={setShowUpgradeModal}
                />
              } 
            />
            <Route 
              path="/privacy" 
              element={<PrivacyPolicy />} 
            />
            <Route 
              path="/terms" 
              element={<TermsOfService />} 
            />
          </Routes>
        )}
      </SubscriptionManager>
    </Router>
  );
}

export default App;
