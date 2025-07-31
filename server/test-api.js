const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Notecraft Pro API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test humanize endpoint
    console.log('2. Testing humanize endpoint...');
    const testText = "The implementation of artificial intelligence in modern business environments has demonstrated significant potential for enhancing operational efficiency and productivity metrics across various organizational structures.";
    
    const humanizeResponse = await axios.post(`${API_BASE_URL}/api/humanize`, {
      text: testText,
      tone: 'professional',
      style: 'business',
      length: 'maintain'
    });
    
    console.log('✅ Humanize test passed!');
    console.log('Original:', testText);
    console.log('Humanized:', humanizeResponse.data.humanizedText);
    console.log('Word count:', humanizeResponse.data.wordCount);
    console.log('');

    // Test AI detection endpoint
    console.log('3. Testing AI detection endpoint...');
    const detectResponse = await axios.post(`${API_BASE_URL}/api/detect`, {
      text: humanizeResponse.data.humanizedText
    });
    
    console.log('✅ AI detection test passed!');
    console.log('AI Score:', detectResponse.data.aiScore + '%');
    console.log('Human Score:', detectResponse.data.humanScore + '%');
    console.log('Assessment:', detectResponse.data.assessment);
    console.log('');

    // Test advanced humanization
    console.log('4. Testing advanced humanization...');
    const advancedResponse = await axios.post(`${API_BASE_URL}/api/humanize-advanced`, {
      text: testText,
      tone: 'friendly',
      style: 'casual',
      targetAudience: 'general',
      length: 'maintain',
      creativity: 'balanced'
    });
    
    console.log('✅ Advanced humanization test passed!');
    console.log('Advanced humanized:', advancedResponse.data.humanizedText);
    console.log('Settings used:', advancedResponse.data.settings);
    console.log('');

    console.log('🎉 All API tests passed successfully!');
    console.log('🚀 Your Notecraft Pro API is ready for production!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    console.log('');
    console.log('Troubleshooting tips:');
    console.log('1. Make sure the server is running: npm start');
    console.log('2. Check that OPENAI_API_KEY is set in your .env file');
    console.log('3. Verify the API_BASE_URL is correct');
  }
}

// Run the test
testAPI(); 