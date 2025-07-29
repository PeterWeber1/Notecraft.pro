import React, { useState, useEffect } from 'react';

function AIWritingAssistant({ text, tier, isDarkMode = false }) {
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [styleSuggestions, setStyleSuggestions] = useState([]);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [aiDetectionScore, setAiDetectionScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const theme = {
    background: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#ffffff' : '#111827',
    cardBackground: isDarkMode ? '#1f2937' : '#ffffff',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };

  // Simulate AI analysis
  useEffect(() => {
    if (text.length > 50) {
      setIsAnalyzing(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Generate mock grammar issues
        const mockGrammarIssues = [
          { type: 'grammar', message: 'Consider using "its" instead of "it\'s"', position: 45 },
          { type: 'spelling', message: 'Check spelling of "recieve"', position: 120 },
          { type: 'style', message: 'Sentence is too long. Consider breaking it up.', position: 200 }
        ].slice(0, Math.floor(Math.random() * 3) + 1);

        // Generate mock style suggestions
        const mockStyleSuggestions = [
          { type: 'clarity', message: 'Use more active voice', priority: 'high' },
          { type: 'conciseness', message: 'Remove redundant words', priority: 'medium' },
          { type: 'engagement', message: 'Add more descriptive language', priority: 'low' }
        ].slice(0, Math.floor(Math.random() * 3) + 1);

        setGrammarIssues(mockGrammarIssues);
        setStyleSuggestions(mockStyleSuggestions);
        setReadabilityScore(Math.floor(Math.random() * 40) + 60); // 60-100
        setAiDetectionScore(Math.floor(Math.random() * 40) + 10); // 10-50
        setIsAnalyzing(false);
      }, 2000);
    } else {
      setGrammarIssues([]);
      setStyleSuggestions([]);
      setReadabilityScore(0);
      setAiDetectionScore(0);
    }
  }, [text]);

  const getReadabilityLevel = (score) => {
    if (score >= 90) return { level: 'Very Easy', color: theme.success };
    if (score >= 80) return { level: 'Easy', color: theme.success };
    if (score >= 70) return { level: 'Fairly Easy', color: theme.info };
    if (score >= 60) return { level: 'Standard', color: theme.warning };
    return { level: 'Difficult', color: theme.error };
  };

  const getAiDetectionLevel = (score) => {
    if (score <= 15) return { level: 'Very Human', color: theme.success };
    if (score <= 25) return { level: 'Human', color: theme.info };
    if (score <= 35) return { level: 'Suspicious', color: theme.warning };
    return { level: 'AI Detected', color: theme.error };
  };

  if (text.length < 50) {
    return (
      <div style={{
        padding: '16px',
        background: theme.cardBackground,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '8px',
        marginTop: '16px'
      }}>
        <div style={{ color: theme.color, fontSize: '0.9rem' }}>
          ✍️ Write more text to get AI writing assistance
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      background: theme.cardBackground,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: '8px',
      marginTop: '16px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          color: theme.color, 
          fontSize: '1.1rem', 
          margin: 0,
          fontWeight: 'bold'
        }}>
          🤖 AI Writing Assistant
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: theme.color,
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {isAnalyzing ? (
        <div style={{ color: theme.color, fontSize: '0.9rem' }}>
          🔍 Analyzing your text...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              background: theme.background,
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getReadabilityLevel(readabilityScore).color }}>
                {readabilityScore}
              </div>
              <div style={{ fontSize: '0.8rem', color: theme.color }}>
                Readability Score
              </div>
              <div style={{ fontSize: '0.7rem', color: getReadabilityLevel(readabilityScore).color }}>
                {getReadabilityLevel(readabilityScore).level}
              </div>
            </div>

            {tier !== 'basic' && (
              <div style={{
                padding: '12px',
                background: theme.background,
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getAiDetectionLevel(aiDetectionScore).color }}>
                  {aiDetectionScore}%
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.color }}>
                  AI Detection
                </div>
                <div style={{ fontSize: '0.7rem', color: getAiDetectionLevel(aiDetectionScore).color }}>
                  {getAiDetectionLevel(aiDetectionScore).level}
                </div>
              </div>
            )}

            <div style={{
              padding: '12px',
              background: theme.background,
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: grammarIssues.length > 0 ? theme.error : theme.success }}>
                {grammarIssues.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: theme.color }}>
                Issues Found
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          {showDetails && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Grammar Issues */}
              {grammarIssues.length > 0 && (
                <div>
                  <h4 style={{ color: theme.color, fontSize: '1rem', marginBottom: '8px' }}>
                    🔧 Grammar & Style Issues
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {grammarIssues.map((issue, index) => (
                      <div key={index} style={{
                        padding: '8px 12px',
                        background: theme.background,
                        borderRadius: '4px',
                        borderLeft: `3px solid ${issue.type === 'grammar' ? theme.error : issue.type === 'spelling' ? theme.warning : theme.info}`
                      }}>
                        <div style={{ fontSize: '0.9rem', color: theme.color }}>
                          {issue.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: theme.color, opacity: 0.7 }}>
                          Position: {issue.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Suggestions */}
              {styleSuggestions.length > 0 && tier !== 'basic' && (
                <div>
                  <h4 style={{ color: theme.color, fontSize: '1rem', marginBottom: '8px' }}>
                    💡 Style Suggestions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {styleSuggestions.map((suggestion, index) => (
                      <div key={index} style={{
                        padding: '8px 12px',
                        background: theme.background,
                        borderRadius: '4px',
                        borderLeft: `3px solid ${suggestion.priority === 'high' ? theme.error : suggestion.priority === 'medium' ? theme.warning : theme.info}`
                      }}>
                        <div style={{ fontSize: '0.9rem', color: theme.color }}>
                          {suggestion.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: theme.color, opacity: 0.7 }}>
                          Priority: {suggestion.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Features for Pro & Ultra */}
              {(tier === 'pro' || tier === 'ultra') && (
                <div>
                  <h4 style={{ color: theme.color, fontSize: '1rem', marginBottom: '8px' }}>
                    🚀 Advanced Analysis
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{
                      padding: '12px',
                      background: theme.background,
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.9rem', color: theme.color, fontWeight: 'bold' }}>
                        Sentence Structure
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme.color }}>
                        {text.split('.').length - 1} sentences
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme.color }}>
                        Avg: {Math.round(text.length / (text.split('.').length - 1))} chars/sentence
                      </div>
                    </div>

                    <div style={{
                      padding: '12px',
                      background: theme.background,
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.9rem', color: theme.color, fontWeight: 'bold' }}>
                        Word Diversity
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme.color }}>
                        {new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size} unique words
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme.color }}>
                        {Math.round((new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size / (text.split(/\s+/).filter(word => word.length > 0).length)) * 100)}% diversity
                      </div>
                    </div>

                    {tier === 'ultra' && (
                      <div style={{
                        padding: '12px',
                        background: theme.background,
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: theme.color, fontWeight: 'bold' }}>
                          Sentiment Analysis
                        </div>
                        <div style={{ fontSize: '0.8rem', color: theme.color }}>
                          Neutral tone detected
                        </div>
                        <div style={{ fontSize: '0.8rem', color: theme.color }}>
                          Professional style
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIWritingAssistant; 