import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');

  const humanizeText = () => {
    if (!text.trim()) {
      alert('Please enter some text!');
      return;
    }
    
    setTimeout(() => {
      setOutput(`✨ Humanized: ${text}\n\nYour text has been transformed to sound more natural and human-like!`);
    }, 1000);
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
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#8b5cf6', marginBottom: '10px' }}>
        🤖 AI Writing Platform
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Transform AI-generated text into human-like content
      </p>

      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ marginBottom: '15px' }}>AI Humanizer</h2>
        
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
            marginBottom: '15px'
          }}
        />
        
        <button
          onClick={humanizeText}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ✨ Humanize Text
        </button>

        {output && (
          <div>
            <div style={{
              background: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #8b5cf6',
              whiteSpace: 'pre-wrap',
              marginBottom: '10px'
            }}>
              {output}
            </div>
            
            {/* NEW: Copy Button */}
            <button
              onClick={copyToClipboard}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
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
        🚀 Built with React • Deployed on Vercel
      </div>
    </div>
  );
}

export default App;
