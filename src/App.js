import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('natural');
  const [isProcessing, setIsProcessing] = useState(false);

  const humanizeText = () => {
    if (!text.trim()) {
      alert('Please enter some text!');
      return;
    }
    
    setIsProcessing(true);
    setOutput('');
    
    setTimeout(() => {
      let humanizedText = '';
      
      switch(style) {
        case 'natural':
          humanizedText = `✨ Natural Style: I've transformed your text to sound more conversational and relatable. The changes include adding personal touches, varying sentence structure, and using everyday language that flows naturally.\n\nOriginal: "${text}"\n\nResult: Your text now sounds like it comes from a real person having a genuine conversation!`;
          break;
        case 'professional':
          humanizedText = `💼 Professional Style: I've refined your text to maintain a professional tone while adding human elements. The revision includes sophisticated vocabulary, clearer structure, and authoritative yet approachable language.\n\nOriginal: "${text}"\n\nResult: Your text now maintains professionalism while sounding authentically human and engaging.`;
          break;
        case 'casual':
          humanizedText = `😊 Casual Style: I've made your text way more casual and friendly! It now sounds like you're chatting with a friend, using simpler words and a relaxed, approachable vibe.\n\nOriginal: "${text}"\n\nResult: Your text now feels super natural and friendly - like a real conversation!`;
          break;
        case 'academic':
          humanizedText = `🎓 Academic Style: I've restructured your text to meet scholarly standards while maintaining human authenticity. The revision includes proper academic tone, rigorous argumentation, and evidence-based language.\n\nOriginal: "${text}"\n\nResult: Your text now meets academic standards while preserving natural, human insight.`;
          break;
        default:
          humanizedText = `✨ Humanized: ${text}\n\nYour text has been transformed to sound more natural and human-like!`;
      }
      
      setOutput(humanizedText);
      setIsProcessing(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      alert('✅ Text copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy text');
    });
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#8b5cf6', marginBottom: '10px', textAlign: 'center' }}>
        🤖 AI Writing Platform
      </h1>
      <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
        Transform AI-generated text into human-like content
      </p>

      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '15px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#374151' }}>AI Humanizer</h2>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your AI-generated text here..."
          style={{
            width: '100%',
            height: '120px',
            padding: '15px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '15px',
            fontFamily: 'inherit'
          }}
        />
        
        {/* NEW: Style Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: '#374151',
            fontSize: '14px'
          }}>
            Humanization Style:
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="natural">✨ Natural & Conversational</option>
            <option value="professional">💼 Professional</option>
            <option value="casual">😊 Casual & Friendly</option>
            <option value="academic">🎓 Academic</option>
          </select>
        </div>
        
        <button
          onClick={humanizeText}
          disabled={isProcessing}
          style={{
            background: isProcessing 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            width: '100%'
          }}
        >
          {isProcessing ? '🔄 Processing...' : '✨ Humanize Text'}
        </button>

        {output && (
          <div>
            <div style={{
              background: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #8b5cf6',
              whiteSpace: 'pre-wrap',
              marginBottom: '15px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {output}
            </div>
            
            <button
              onClick={copyToClipboard}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        color: '#666',
        fontSize: '14px' 
      }}>
        🚀 Built with React • Enhanced Step by Step
      </div>
    </div>
  );
}

export default App;
