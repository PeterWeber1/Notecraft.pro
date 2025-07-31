const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Notecraft Pro API is running' });
});

// Humanize text endpoint
app.post('/api/humanize', async (req, res) => {
  try {
    const { text, tone = 'neutral', style = 'professional', length = 'maintain' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Create system prompt for humanization
    const systemPrompt = `You are an expert AI humanizer. Your task is to rewrite the given text to make it sound more human and natural while preserving the original meaning and intent.

Guidelines:
- Maintain the original message and key points
- Use natural, conversational language
- Avoid repetitive or robotic patterns
- Add appropriate transitions and flow
- Keep the tone: ${tone}
- Maintain writing style: ${style}
- ${length === 'shorter' ? 'Make it more concise' : length === 'longer' ? 'Expand with more detail' : 'Maintain similar length'}

Important: Focus on making the text sound genuinely human-written, not AI-generated.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const humanizedText = completion.choices[0].message.content;

    res.json({
      success: true,
      originalText: text,
      humanizedText: humanizedText,
      wordCount: humanizedText.split(/\s+/).length,
      characterCount: humanizedText.length
    });

  } catch (error) {
    console.error('Humanize error:', error);
    res.status(500).json({ 
      error: 'Failed to humanize text',
      details: error.message 
    });
  }
});

// Grammar check endpoint
app.post('/api/grammar', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use LanguageTool API for grammar checking
    const response = await axios.post('https://api.languagetool.org/v2/check', {
      text: text,
      language: 'en-US'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const issues = response.data.matches.map(match => ({
      message: match.message,
      shortMessage: match.shortMessage,
      offset: match.offset,
      length: match.length,
      context: match.context,
      rule: match.rule,
      replacements: match.replacements
    }));

    res.json({
      success: true,
      issues: issues,
      issueCount: issues.length
    });

  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({ 
      error: 'Failed to check grammar',
      details: error.message 
    });
  }
});

// AI detection endpoint
app.post('/api/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use OpenAI to analyze the text for AI-like patterns
    const systemPrompt = `Analyze the following text and rate how likely it is to be AI-generated on a scale of 0-100. Consider factors like:
- Repetitive patterns
- Unnatural transitions
- Overly formal or robotic language
- Lack of personal voice
- Generic phrasing

Return only a number between 0-100, where 0 = definitely human, 100 = definitely AI-generated.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const aiScore = parseInt(completion.choices[0].message.content) || 50;

    res.json({
      success: true,
      aiScore: aiScore,
      humanScore: 100 - aiScore,
      assessment: aiScore < 30 ? 'Likely Human' : aiScore < 60 ? 'Uncertain' : 'Likely AI'
    });

  } catch (error) {
    console.error('AI detection error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze text',
      details: error.message 
    });
  }
});

// Advanced humanization with style options
app.post('/api/humanize-advanced', async (req, res) => {
  try {
    const { 
      text, 
      tone = 'neutral', 
      style = 'professional', 
      targetAudience = 'general',
      length = 'maintain',
      creativity = 'balanced'
    } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const systemPrompt = `You are an expert AI humanizer specializing in making AI-generated text sound natural and human-written.

TASK: Rewrite the given text to sound more human while preserving the original meaning.

STYLE GUIDELINES:
- Tone: ${tone}
- Writing Style: ${style}
- Target Audience: ${targetAudience}
- Length: ${length === 'shorter' ? 'Make it more concise' : length === 'longer' ? 'Expand with more detail' : 'Maintain similar length'}
- Creativity Level: ${creativity}

TECHNIQUES TO USE:
- Add natural transitions and flow
- Use varied sentence structures
- Include appropriate contractions and informal language where suitable
- Avoid repetitive patterns
- Add personality and voice
- Make it sound conversational and engaging

IMPORTANT: The goal is to make the text sound genuinely human-written, not AI-generated.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: creativity === 'conservative' ? 0.5 : creativity === 'creative' ? 0.9 : 0.7,
      max_tokens: 4000,
    });

    const humanizedText = completion.choices[0].message.content;

    res.json({
      success: true,
      originalText: text,
      humanizedText: humanizedText,
      wordCount: humanizedText.split(/\s+/).length,
      characterCount: humanizedText.length,
      settings: {
        tone,
        style,
        targetAudience,
        length,
        creativity
      }
    });

  } catch (error) {
    console.error('Advanced humanize error:', error);
    res.status(500).json({ 
      error: 'Failed to humanize text',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notecraft Pro API server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 