import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import Notepad from './Notepad';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import AccountManager from './AccountManager';
import Breadcrumbs from './components/Breadcrumbs';
import { LoginModal, RegisterModal, ProfileModal, BillingModal, UpgradeModal } from './components/AccountModals.js';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

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
          showEmailConfirmationBanner,
          isEmailVerified,
          theme
        }) => (
          <>
            <div style={{
              paddingTop: showEmailConfirmationBanner ? '60px' : '0px',
              transition: 'padding-top 0.3s ease',
              minHeight: '100vh'
            }}>
              {/* SEO Breadcrumbs */}
              <Breadcrumbs theme={theme} />

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
                    showEmailConfirmationBanner={showEmailConfirmationBanner}
                    isEmailVerified={isEmailVerified}
                  />
                } 
              />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
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
                    showEmailConfirmationBanner={showEmailConfirmationBanner}
                    isEmailVerified={isEmailVerified}
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
                    showEmailConfirmationBanner={showEmailConfirmationBanner}
                    isEmailVerified={isEmailVerified}
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
            </div>

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
            <UpgradeModal 
              isOpen={showUpgradeModal} 
              onClose={() => setShowUpgradeModal(false)} 
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
