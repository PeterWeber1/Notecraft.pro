// Test file for pricing buttons functionality - FIXED VERSION
// This file can be run in the browser console to test pricing button functionality

const testPricingButtonsFixed = () => {
  console.log('🧪 Testing Pricing Buttons - FIXED VERSION...');
  
  const tests = [
    {
      name: 'HomePage Subscribe Buttons',
      test: () => {
        // Find subscribe buttons on homepage
        const subscribeButtons = document.querySelectorAll('button');
        const pricingButtons = Array.from(subscribeButtons).filter(btn => 
          btn.textContent.includes('Subscribe') || 
          btn.textContent.includes('Get Started')
        );
        
        console.log('Found pricing buttons:', pricingButtons.length);
        
        if (pricingButtons.length > 0) {
          // Test the first button
          const firstButton = pricingButtons[0];
          console.log('Testing button:', firstButton.textContent);
          firstButton.click();
          return true;
        }
        return false;
      }
    },
    {
      name: 'Upgrade Modal Trigger',
      test: () => {
        // Find upgrade buttons
        const upgradeButtons = document.querySelectorAll('button');
        const upgradeButton = Array.from(upgradeButtons).find(btn => 
          btn.textContent.includes('Upgrade') || 
          btn.textContent.includes('Pro') ||
          btn.textContent.includes('Ultra')
        );
        
        if (upgradeButton) {
          console.log('Found upgrade button:', upgradeButton.textContent);
          upgradeButton.click();
          setTimeout(() => {
            const modal = document.querySelector('[style*="position: fixed"]');
            return modal && modal.textContent.includes('Choose Your Plan');
          }, 500);
        }
        return false;
      }
    },
    {
      name: 'Plan Selection in Modal',
      test: () => {
        const planCards = document.querySelectorAll('[style*="border-radius: 12px"]');
        if (planCards.length > 0) {
          console.log('Found plan cards:', planCards.length);
          planCards[0].click();
          return true;
        }
        return false;
      }
    },
    {
      name: 'Upgrade Process',
      test: () => {
        const upgradeButton = document.querySelector('button[disabled="false"]');
        if (upgradeButton && upgradeButton.textContent.includes('Upgrade to')) {
          console.log('Found upgrade button in modal:', upgradeButton.textContent);
          upgradeButton.click();
          return true;
        }
        return false;
      }
    },
    {
      name: 'Basic Plan Notification',
      test: () => {
        const basicButton = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Get Started')
        );
        if (basicButton) {
          console.log('Found basic plan button:', basicButton.textContent);
          basicButton.click();
          return true;
        }
        return false;
      }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach((test, index) => {
    try {
      console.log(`\n🧪 Running test: ${test.name}`);
      const result = test.test();
      if (result) {
        console.log(`✅ ${test.name} - PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All pricing button tests passed!');
  } else {
    console.log('⚠️ Some pricing button tests failed. Check the implementation.');
  }
};

// Auto-run tests when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(testPricingButtonsFixed, 3000); // Wait for app to load
  });
}

module.exports = { testPricingButtonsFixed }; 