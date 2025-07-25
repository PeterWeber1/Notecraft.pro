import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HomePage({ isDarkMode, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const theme = {
    background: isDarkMode ? '#0f0f23' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1a1a1a',
    primary: '#6366f1',
    secondary: isDarkMode ? '#374151' : '#f3f4f6',
    accent: '#8b5cf6',
    muted: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    card: isDarkMode ? '#1f2937' : '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  return (
    <div style={{
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: theme.background,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.border}`,
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.primary }}>
            Notecraft Pro
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/notepad" style={{
              textDecoration: 'none',
              color: theme.text,
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              ':hover': { backgroundColor: theme.secondary }
            }}>
              Try Now
            </Link>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: theme.text,
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                fontSize: '1.2rem'
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        textAlign: 'center',
        background: theme.gradient,
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Transform Your Writing with
            <br />
            <span style={{ color: '#fbbf24' }}>Notecraft Pro</span>
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
            marginBottom: '2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            The ultimate AI-powered writing assistant that helps you create professional, 
            engaging content that sounds authentically human.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/notepad" style={{
              backgroundColor: '#fbbf24',
              color: '#1a1a1a',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.2s',
              ':hover': { transform: 'translateY(-2px)' }
            }}>
              Start Writing Free
            </Link>
            <button style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: theme.secondary
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '3rem'
          }}>
            Why Choose Notecraft Pro?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '✍️',
                title: 'Smart Writing Assistant',
                description: 'Advanced AI that understands context and helps you write more naturally and effectively.'
              },
              {
                icon: '🎯',
                title: 'Multiple Writing Styles',
                description: 'Choose from professional, casual, academic, or natural writing styles to match your needs.'
              },
              {
                icon: '⚡',
                title: 'Real-time Processing',
                description: 'Get instant feedback and suggestions as you write, with lightning-fast processing.'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'Your content stays private and secure. We never store or share your writing.'
              },
              {
                icon: '📱',
                title: 'Cross-platform',
                description: 'Access Notecraft Pro from any device - desktop, tablet, or mobile.'
              },
              {
                icon: '🚀',
                title: 'Always Improving',
                description: 'Regular updates with new features and improvements based on user feedback.'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: theme.card,
                padding: '2rem',
                borderRadius: '1rem',
                border: `1px solid ${theme.border}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: theme.muted,
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '80px 0',
        backgroundColor: theme.background
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '3rem'
          }}>
            How It Works
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              {
                step: '1',
                title: 'Write Your Content',
                description: 'Start typing your text in our intuitive editor. No complex setup required.'
              },
              {
                step: '2',
                title: 'Choose Your Style',
                description: 'Select from professional, casual, academic, or natural writing styles.'
              },
              {
                step: '3',
                title: 'Get Enhanced Text',
                description: 'Receive your improved, human-like text that maintains your original meaning.'
              }
            ].map((step, index) => (
              <div key={index}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: theme.primary,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem'
                }}>
                  {step.step}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  color: theme.muted,
                  lineHeight: '1.6'
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: theme.gradient,
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Ready to Transform Your Writing?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Join thousands of writers who are already using Notecraft Pro to create better content.
          </p>
          <Link to="/notepad" style={{
            backgroundColor: '#fbbf24',
            color: '#1a1a1a',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'inline-block',
            transition: 'all 0.2s'
          }}>
            Start Writing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: theme.card,
        borderTop: `1px solid ${theme.border}`,
        padding: '3rem 0 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: theme.primary,
            marginBottom: '1rem'
          }}>
            Notecraft Pro
          </div>
          <p style={{
            color: theme.muted,
            marginBottom: '2rem'
          }}>
            The ultimate AI-powered writing assistant for professionals and creators.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            <Link to="/notepad" style={{
              color: theme.text,
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Try Now
            </Link>
            <a href="#" style={{
              color: theme.text,
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Privacy Policy
            </a>
            <a href="#" style={{
              color: theme.text,
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Terms of Service
            </a>
          </div>
          <div style={{
            color: theme.muted,
            fontSize: '0.9rem'
          }}>
            © 2024 Notecraft Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
