import React from 'react';

function App() {
  console.log('🚀 Simple App component loaded');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#ffffff',
      color: '#000000',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <div>
        <h1>✅ NOTECRAFT.PRO IS WORKING!</h1>
        <p>The white screen issue has been resolved.</p>
        <p>App is loading correctly now.</p>
      </div>
    </div>
  );
}

export default App;