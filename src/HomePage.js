import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  // Always use light theme
  const theme = {
    background: '#ffffff',
    text: '#1a1a1a',
    primary: '#6366f1',
    secondary: '#f3f4f6',
    accent: '#fbbf24',
    muted: '#6b7280',
    border: '#e5e7eb',
    card: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  const [faqOpen, setFaqOpen] = React.useState(null);
  const faqs = [
    {
      q: 'What is Notecraft Pro?',
      a: 'Notecraft Pro is the world’s most advanced AI humanizer, transforming AI-generated content into authentic, human-like writing.'
    },
    {
      q: 'How does Notecraft Pro differ from other AI humanizer tools?',
      a: 'Our enhanced model and built-in AI detector ensure your content passes leading AI detection tools and reads naturally.'
    },
    {
      q: 'Will my writing lose its original meaning?',
      a: 'No. Notecraft Pro preserves your message while making it sound more human.'
    },
    {
      q: 'Can I use Notecraft Pro for non-AI writing?',
      a: 'Absolutely! Our tool improves any text, AI-generated or not.'
    },
    {
      q: 'What platforms and detectors are compatible?',
      a: 'Notecraft Pro works with content from any AI generator and is tested on GPTZero, Copyleaks, Originality, and more.'
    }
  ];

  return (
    <div style={{ backgroundColor: theme.background, color: theme.text, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: theme.background, borderBottom: `1px solid ${theme.border}`, padding: '1rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.primary }}>Notecraft Pro</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/notepad" style={{ textDecoration: 'none', color: theme.text, fontWeight: '500', padding: '0.5rem 1rem', borderRadius: '0.5rem', transition: 'all 0.2s' }}>Try Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center', background: theme.gradient, color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 'bold', marginBottom: '1.2rem', lineHeight: '1.1' }}>
            Writing, Perfected.<br />
            Humanize AI with <span style={{ color: theme.accent }}>Notecraft Pro</span>
          </h1>
          <p style={{ fontSize: '1.3rem', marginBottom: '2rem', opacity: 0.95 }}>
            Turn AI into natural human writing with the world’s most advanced AI Humanizer.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
              <textarea 
                placeholder="Paste your AI-generated text here to humanize it..." 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  padding: '1.5rem', 
                  borderRadius: '0.75rem', 
                  border: '2px solid rgba(255,255,255,0.2)', 
                  fontSize: '1.1rem', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s'
                }} 
                disabled 
              />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button style={{ 
                  background: theme.accent, 
                  color: '#1a1a1a', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  padding: '1rem 3rem', 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  Humanize Text
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 500 }}>Enhanced Model</span>
            <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 500 }}>Customize</span>
            <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 500 }}>Clear</span>
            <span style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 500 }}>Words: 0/200</span>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section style={{ padding: '60px 0', background: theme.secondary }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2.5rem' }}>Humanize AI text in three simple steps:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div style={{ background: theme.card, borderRadius: '1rem', padding: '2rem', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>1️⃣</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Copy AI-generated text</div>
              <div style={{ color: theme.muted }}>Notecraft Pro works with text from ChatGPT, Claude, Deepseek, Gemini, or any other AI content generator.</div>
            </div>
            <div style={{ background: theme.card, borderRadius: '1rem', padding: '2rem', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>2️⃣</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Paste into Notecraft Pro</div>
              <div style={{ color: theme.muted }}>Our tool refines and transforms your AI-generated content to sound more human.</div>
            </div>
            <div style={{ background: theme.card, borderRadius: '1rem', padding: '2rem', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>3️⃣</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Click Humanize to transform your text</div>
              <div style={{ color: theme.muted }}>Our advanced AI humanizer is tested on tools like GPTZero, Copyleaks, and Originality.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section style={{ padding: '60px 0', background: theme.background }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Produce genuine, human-sounding text in seconds.</h2>
          <p style={{ fontSize: '1.1rem', color: theme.muted, marginBottom: '2rem' }}>
            Notecraft Pro’s AI humanizer tool transforms AI text into authentic, human-like content. Extensively tested on detectors such as GPTZero, Copyleaks, and Quillbot to ensure your content sounds human. Trusted by writers around the world for high-quality writing.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 0', background: theme.secondary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2.5rem' }}>Why Notecraft Pro?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🛡️', title: 'Built-in AI Detection', desc: 'Notecraft Pro’s trusted AI Detector ensures your text is human. If it doesn’t pass, you can retry your request for free.' },
              { icon: '✨', title: 'Effortlessly Humanize AI Text', desc: 'Refine AI-generated text into authentic, human-quality writing. Paste from any AI platform—our tool enhances it with natural phrasing and emotional depth.' },
              { icon: '⚡', title: 'Engage Your Readers in Seconds', desc: 'Instantly improve AI text and protect your authenticity. Notecraft Pro transforms any AI text into human-like content—extensively tested on leading detectors.' },
              { icon: '📝', title: 'Create Engaging Content', desc: 'Produce human-quality content with Notecraft Pro’s advanced AI humanizer—text that reads naturally, even on leading AI detectors.' },
              { icon: '🏆', title: 'Quality Humanizer Output', desc: 'No more grammatical errors or low-quality output. Notecraft Pro delivers the highest quality outputs in the industry.' }
            ].map((f, i) => (
              <div key={i} style={{ background: theme.card, borderRadius: '1rem', padding: '2rem', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{f.title}</div>
                <div style={{ color: theme.muted }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '60px 0', background: theme.background }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2.5rem' }}>Choose the plan that’s right for you.</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {[
              { name: 'Basic', price: '$12', period: 'Per month, billed annually', features: ['80 humanizer requests/month', '600 words per request', 'Access to Enhanced Model', 'Basic customer support'], badge: 'Best for light users' },
              { name: 'Pro', price: '$18', period: 'Per month, billed annually', features: ['200 humanizer requests/month', '1200 words per request', 'Access to Enhanced Model', 'Priority access to new features', 'Priority customer support'], badge: 'Best for most users', highlight: true },
              { name: 'Ultra', price: '$36', period: 'Per month, billed annually', features: ['Unlimited requests per month', '3000 words per request', 'Access to Enhanced Model', 'Priority access to new features', 'Priority customer support'], badge: 'Best for power users' }
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.highlight ? theme.primary : theme.card, color: plan.highlight ? '#fff' : theme.text, borderRadius: '1rem', padding: '2rem', minWidth: '260px', maxWidth: '320px', border: `2px solid ${plan.highlight ? theme.primary : theme.border}`, boxShadow: plan.highlight ? '0 4px 24px rgba(99,102,241,0.15)' : 'none', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-1.5rem', left: '50%', transform: 'translateX(-50%)', background: theme.accent, color: '#1a1a1a', borderRadius: '1rem', padding: '0.3rem 1.2rem', fontWeight: 600, fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>{plan.badge}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>{plan.name}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{plan.price}</div>
                <div style={{ fontSize: '1rem', color: plan.highlight ? '#e0e7ff' : theme.muted, marginBottom: '1.2rem' }}>{plan.period}</div>
                <ul style={{ textAlign: 'left', padding: 0, margin: 0, listStyle: 'none', marginBottom: '1.2rem' }}>
                  {plan.features.map((f, j) => <li key={j} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: theme.accent }}>✔️</span> {f}</li>)}
                </ul>
                <button style={{ background: theme.accent, color: '#1a1a1a', border: 'none', borderRadius: '0.5rem', padding: '0.8rem 1.5rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', width: '100%' }}>Subscribe</button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', color: theme.muted, marginTop: '2rem', fontSize: '1rem' }}>
            Not ready to commit? All users can submit 3 requests per month for free, up to 200 words each.
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section style={{ padding: '60px 0', background: theme.secondary }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>“</div>
          <div style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '1rem' }}>
            As a digital marketer, my writing gains warmth and personality, as if I’d spent days perfecting it.
          </div>
          <div style={{ fontWeight: 'bold', color: theme.primary }}>— Yuna K.</div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 0', background: theme.background }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: theme.card, borderRadius: '1rem', padding: '1.5rem 2rem', border: `1px solid ${theme.border}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', color: theme.primary }}>{faq.q}</div>
                <div style={{ color: theme.muted, maxHeight: faqOpen === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s', fontSize: '1rem' }}>{faqOpen === i && faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '60px 0', background: theme.gradient, color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Humanize your AI writing with Notecraft Pro.</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.95 }}>
            Transform your AI-generated text into authentic, human-quality content—trusted by professionals, creators, and marketers worldwide.
          </p>
          <Link to="/notepad" style={{ background: theme.accent, color: '#1a1a1a', padding: '1rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', display: 'inline-block', transition: 'all 0.2s' }}>Start Humanizing Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, padding: '3rem 0 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.primary, marginBottom: '1rem' }}>Notecraft Pro</div>
          <p style={{ color: theme.muted, marginBottom: '2rem' }}>
            The ultimate AI-powered humanizer for professionals and creators.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Link to="/notepad" style={{ color: theme.text, textDecoration: 'none', fontWeight: '500' }}>Try Now</Link>
            <Link to="/privacy" style={{ color: theme.text, textDecoration: 'none', fontWeight: '500' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: theme.text, textDecoration: 'none', fontWeight: '500' }}>Terms of Service</Link>
          </div>
          <div style={{ color: theme.muted, fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} Notecraft Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
