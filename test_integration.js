// Test script to verify FastAPI integration
const axios = require('axios');

async function testIntegration() {
    console.log('Testing FastAPI integration...');
    
    const apiUrl = 'http://localhost:8000';
    
    try {
        // Test health check
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get(`${apiUrl}/healthz`);
        console.log('Health check:', healthResponse.data);
        
        // Test humanize endpoint
        console.log('\n2. Testing humanize endpoint...');
        const testData = {
            text: "This is an AI-generated text that sounds robotic and needs humanization.",
            tone: "friendly",
            style: "casual",
            length: "maintain"
        };
        
        console.log('Sending humanization request...');
        const humanizeResponse = await axios.post(`${apiUrl}/humanize`, testData);
        
        console.log('Humanization result:');
        console.log('- Original:', humanizeResponse.data.originalText);
        console.log('- Humanized:', humanizeResponse.data.humanizedText);
        console.log('- Success:', humanizeResponse.data.success);
        
        console.log('\n✅ All integration tests passed!');
        return true;
        
    } catch (error) {
        console.error('\n❌ Integration test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        return false;
    }
}

// Run the test
testIntegration().then(success => {
    process.exit(success ? 0 : 1);
});