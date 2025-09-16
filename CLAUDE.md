# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm start` - Start development server on localhost:3000
- `npm run build` - Create production build
- `npm test` - Run React tests (currently using react-scripts test)

### Process Management
- Kill development server: `taskkill /PID <pid> /F` or `powershell "Stop-Process -Id <pid> -Force"`
- Find port usage: `netstat -ano | findstr :3000`

### Backend Services
- **Python API** (`/api`): `python main.py` or `python start.py` - FastAPI server for AI text humanization using T5/PEGASUS models
- **Node Server** (`/server`): `node server.js` - Alternative Express.js API with OpenAI GPT-4 integration
- Install Python dependencies: `pip install -r api/requirements.txt`

## Architecture Overview

### Core Application Structure
This is a React SPA for AI-powered text humanization called "Notecraft Pro". The app consists of:
- **Homepage** (`src/HomePage.js`): Main interface with text input, humanization features, and pricing
- **Notepad Editor** (`src/Notepad.js`): Rich text editor with formatting tools and export capabilities
- **Authentication System**: Real Supabase authentication with subscription tiers (Basic/Pro/Ultra)

### Key Components

**AccountManager** (`src/AccountManager.js`):
- React Context provider managing authentication state and subscription management
- Real Supabase authentication with session management and tier-based feature access
- Exports `useAccount` hook for consuming auth state throughout the app
- Alternative mock version available in `AccountManager-mock.js` and complex version in `AccountManager-complex.js`

**App Component** (`src/App.js`):
- Main router with React Router handling navigation between homepage and notepad
- Global theme management (dark/light mode) with localStorage persistence
- Passes authentication context to all routes via render props pattern

**HomePage** (`src/HomePage.js`):
- Primary interface for AI text humanization functionality
- Word count, character count, reading time statistics
- Tier-based feature access (Basic: 500 words, Pro: 2000 words, Ultra: 10000 words)
- Advanced options for Pro/Ultra users (writing style, tone, target audience)
- Mock AI humanization with simple text transformations

**Modal System** (`src/components/AccountModals.js`):
- LoginModal, RegisterModal, ProfileModal, BillingModal, UpgradeModal
- Integrated with AccountManager context for seamless authentication flow

### Authentication & Subscription Architecture
The app uses **Supabase Authentication** with real user management:

1. **User Management**: 
   - Supabase Auth handles user registration, login, and session management
   - Email/password authentication with email confirmation
   - User metadata stored in Supabase for preferences and profile data
   - Automatic session restoration on app reload

2. **Subscription Tiers**:
   - **Basic** (Free): 500 words per request, basic humanization
   - **Pro** ($29.99/month): 2000 words, advanced features, style customization  
   - **Ultra** ($59.99/month): 10000 words, all features, bulk processing
   - Subscription data currently simulated, ready for Stripe integration

3. **Feature Access Control**:
   - `getUserTier()` and `canAccessFeature()` methods control feature visibility
   - Real-time auth state changes with Supabase listeners
   - Secure logout and session cleanup

### Backend API Architecture

**Python FastAPI** (`/api`):
- Main humanization API using Transformers models (T5 paraphrase model: `Vamsi/T5_Paraphrase_Paws`)
- Advanced humanization pipeline with quality validation and content similarity scoring
- Sentence-by-sentence processing to preserve content structure
- Fallback rule-based humanization when models fail
- CORS-enabled for frontend integration with model caching

**Node.js Express API** (`/server`):
- Alternative API implementation using OpenAI GPT-4
- Endpoints: `/api/humanize`, `/api/grammar`, `/api/detect`, `/api/humanize-advanced`
- Advanced humanization with style options (tone, creativity, target audience)
- Built-in AI detection scoring using GPT-4 analysis

### Routing Structure
- `/` - HomePage with text humanization interface (www.notecraft.pro)
- `/dashboard` - User dashboard for logged-in users (app.notecraft.pro/dashboard)
- `/notepad` - Rich text editor with formatting tools
- `/privacy` - Privacy Policy page
- `/terms` - Terms of Service page

### Subdomain Architecture
- **www.notecraft.pro** - Public landing page and marketing site
- **app.notecraft.pro/dashboard** - Authenticated user dashboard and workspace

## Development Workflow

### Component File Versions
Multiple versions exist for debugging and development:
- `AccountManager.js` (current: real Supabase auth) vs `AccountManager-mock.js` (mock version)
- `AccountManager-complex.js` (legacy complex version) vs `AccountManager-backup.js` (backup version)
- `App.js` (current: production) vs `App-complex.js`, `App-test.js`, `App-step1.js` (debugging versions)
- Swap versions with: `copy AccountManager-mock.js AccountManager.js` (Windows) or `cp AccountManager-mock.js AccountManager.js` (Unix)

### Text Processing Pipeline
- **Frontend**: Real-time word/character counting, AI score simulation, clipboard operations
- **API Fallback**: HomePage.js implements advanced rule-based humanization when API unavailable
- **Quality Validation**: Python API includes content similarity scoring and length preservation checks

### Theme System
- CSS custom properties with Stripe-inspired design
- Theme object passed through AccountManager context
- Dark/light mode toggle with `.dark-mode` class on document body
- Consistent color scheme: primary (#635bff), background/text dynamic


## Common Development Tasks

### Adding New Features
1. Check tier requirements in `getTierFeatures()` method
2. Use `canAccessFeature()` to control access
3. Update pricing display in HomePage pricing section
4. Add feature to AccountManager context if needed

### Testing Authentication
- **Registration**: Create account with email/password (requires email confirmation)
- **Login**: Sign in with registered credentials
- **Session Management**: Sessions persist across browser reloads via Supabase
- **User Data**: Check browser dev tools > Application > Local Storage for Supabase session
- **Tier Access**: Use `getUserTier()` to verify subscription state
- **Auth State**: Monitor console logs for authentication flow debugging

### API Integration
- Frontend expects `/api/humanize` POST endpoint with format: `{ text, tone, style, length }`
- **Python API**: Start with `python main.py` or `python start.py` in `/api` directory
  - Requires `pip install -r api/requirements.txt` for dependencies (transformers, torch, nltk, fastapi)
  - Uses T5 model for paraphrasing with advanced quality validation
  - Endpoints: `/humanize`, `/healthz`, `/` (root info)
- **Node.js API**: Start with `node server.js` in `/server` directory
  - Requires OpenAI API key in environment variables
  - Additional endpoints: `/api/grammar` (LanguageTool), `/api/detect` (AI detection)
- Contains extensive test files for API validation (`test_*.py` and `test-api.js`)

## Project Structure Notes
- `src/` - React frontend application
- `src/lib/supabase.js` - Supabase client configuration and auth helpers
- `.env` - Environment variables including Supabase credentials
- `api/` - Python FastAPI backend with AI models
- `server/` - Node.js Express alternative backend
- `src/components/` - Reusable UI components and modals
- Multiple backup/test versions of core files for debugging

## Supabase Configuration
- **URL**: https://mxkmwaenxhkwbjbkpglv.supabase.co
- **Environment**: Free tier Supabase project
- **Auth**: Email/password authentication enabled
- **Tables**: User profiles and subscription data (to be created)
- **Security**: Row Level Security (RLS) recommended for production