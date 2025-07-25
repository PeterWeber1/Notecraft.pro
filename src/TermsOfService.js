import React from 'react';

function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem', fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Terms of Service</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>1. Acceptance of Terms</h2>
        <p>By using Notecraft Pro, you agree to these Terms of Service and all applicable laws and regulations.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>2. Use of Service</h2>
        <p>You agree to use Notecraft Pro only for lawful purposes. You are responsible for any content you submit and must not use the service for illegal or harmful activities.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>3. Intellectual Property</h2>
        <p>All content, trademarks, and intellectual property on Notecraft Pro belong to their respective owners. You may not copy, modify, or distribute any part of the service without permission.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>4. Disclaimers</h2>
        <p>Notecraft Pro is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>5. Contact</h2>
        <p>If you have any questions about these Terms, please contact us at support@notecraftpro.com.</p>
      </section>
    </div>
  );
}

export default TermsOfService; 