// Integration Test for Button Functionality
// This file tests all the button functionality in the Notecraft Pro application

const testButtonFunctionality = () => {
  console.log('🧪 Testing Button Functionality...');
  
  const tests = [
    {
      name: 'Theme Toggle',
      test: () => {
        const themeButton = document.querySelector('button[title*="Switch to"]');
        if (themeButton) {
          const initialTheme = document.body.classList.contains('dark-mode');
          themeButton.click();
          setTimeout(() => {
            const newTheme = document.body.classList.contains('dark-mode');
            return initialTheme !== newTheme;
          }, 100);
        }
        return false;
      }
    },
    {
      name: 'Login Modal',
      test: () => {
        const loginButton = document.querySelector('button:contains("Login")');
        if (loginButton) {
          loginButton.click();
          setTimeout(() => {
            const modal = document.querySelector('[data-testid="login-modal"]');
            return modal && modal.style.display !== 'none';
          }, 100);
        }
        return false;
      }
    },
    {
      name: 'Copy Text',
      test: () => {
        const copyButton = document.querySelector('button[title="Copy"]');
        if (copyButton) {
          copyButton.click();
          // Check if notification appears
          setTimeout(() => {
            const notification = document.querySelector('[style*="position: fixed"]');
            return notification && notification.textContent.includes('copied');
          }, 100);
        }
        return false;
      }
    },
    {
      name: 'Humanize Text',
      test: () => {
        const humanizeButton = document.querySelector('button:contains("Humanize Text")');
        if (humanizeButton) {
          // First load test text
          const testButton = document.querySelector('button:contains("Load Test Text")');
          if (testButton) {
            testButton.click();
            setTimeout(() => {
              humanizeButton.click();
              setTimeout(() => {
                const resultArea = document.querySelector('textarea[readonly]');
                return resultArea && resultArea.value.length > 0;
              }, 3000);
            }, 500);
          }
        }
        return false;
      }
    },
    {
      name: 'Clear Text',
      test: () => {
        const clearButton = document.querySelector('button:contains("Clear")');
        if (clearButton) {
          clearButton.click();
          const textarea = document.querySelector('textarea');
          return textarea && textarea.value === '';
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
        console.log(`✅ ${test.name}: PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All button functionality tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
};

// Auto-run tests when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(testButtonFunctionality, 2000); // Wait for app to load
  });
}

module.exports = { testButtonFunctionality };