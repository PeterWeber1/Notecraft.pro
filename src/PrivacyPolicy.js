import React from 'react';

function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem', fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>1. Data Collection</h2>
        <p>We collect only the minimum information necessary to provide and improve Notecraft Pro. This may include usage data, device information, and any text you submit for processing. We do not sell or share your data with third parties.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>2. Use of Information</h2>
        <p>Your data is used solely to deliver and enhance our AI humanizer services. We do not use your content for training our models or for advertising purposes.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>3. Security</h2>
        <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure.</p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>4. Contact</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@notecraftpro.com.</p>
      </section>
    </div>
  );
}

export default PrivacyPolicy; 