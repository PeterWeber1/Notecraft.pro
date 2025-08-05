// Test file for pricing buttons functionality
// This file can be run in the browser console to test pricing button functionality

const testPricingButtons = () => {
  console.log('🧪 Testing Pricing Buttons...');
  
  const tests = [
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
      name: 'Plan Selection',
      test: () => {
        const planCards = document.querySelectorAll('[style*="border-radius: 12px"]');
        if (planCards.length > 0) {
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
          upgradeButton.click();
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
    setTimeout(testPricingButtons, 3000); // Wait for app to load
  });
}

module.exports = { testPricingButtons }; 