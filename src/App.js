import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Notepad from './Notepad';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import AccountManager from './AccountManager';
import { LoginModal, RegisterModal, ProfileModal, BillingModal } from './components/AccountModals.js';

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
      <AccountManager isDarkMode={isDarkMode}>
        {({ 
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
          showLoginModal,
          showRegisterModal,
          showUpgradeModal,
          showProfileModal,
          showBillingModal,
          setShowLoginModal,
          setShowRegisterModal,
          setShowUpgradeModal,
          setShowProfileModal,
          setShowBillingModal,
          theme
        }) => (
          <>
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
                    register={register}
                    updateProfile={updateProfile}
                    cancelSubscription={cancelSubscription}
                    setShowLoginModal={setShowLoginModal}
                    setShowRegisterModal={setShowRegisterModal}
                    setShowUpgradeModal={setShowUpgradeModal}
                    setShowProfileModal={setShowProfileModal}
                    setShowBillingModal={setShowBillingModal}
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
                    register={register}
                    updateProfile={updateProfile}
                    cancelSubscription={cancelSubscription}
                    setShowLoginModal={setShowLoginModal}
                    setShowRegisterModal={setShowRegisterModal}
                    setShowUpgradeModal={setShowUpgradeModal}
                    setShowProfileModal={setShowProfileModal}
                    setShowBillingModal={setShowBillingModal}
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

            {/* Account Management Modals */}
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
              theme={theme} 
            />
            <RegisterModal 
              isOpen={showRegisterModal} 
              onClose={() => setShowRegisterModal(false)} 
              theme={theme} 
            />
            <ProfileModal 
              isOpen={showProfileModal} 
              onClose={() => setShowProfileModal(false)} 
              theme={theme} 
            />
            <BillingModal 
              isOpen={showBillingModal} 
              onClose={() => setShowBillingModal(false)} 
              theme={theme} 
            />
          </>
        )}
      </AccountManager>
    </Router>
  );
}

export default App;
