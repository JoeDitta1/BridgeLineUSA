# BridgeLineUSA - Multi-Environment Setup Guide

## 🚀 Quick Start Options

### Option 1: GitHub Codespaces (Recommended for Development)
1. Open in GitHub Codespaces
2. Run: `npm install && npm start` in both backend and frontend
3. Access via forwarded ports

### Option 2: Local Development
```bash
# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm start
```

### Option 3: Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Option 4: Cloud Deployment (Production)
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Heroku, Railway, or Render
- **Database**: Supabase (already configured)

## 🌐 Environment Configuration

### Development
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:4000`
- **Database**: Local SQLite

### GitHub Codespaces
- **Frontend**: `https://[codespace]-3000.app.github.dev`
- **Backend**: `https://[codespace]-4000.app.github.dev`
- **Database**: Local SQLite

### Production
- **Frontend**: Your deployment URL
- **Backend**: Your API deployment URL
- **Database**: Supabase

## 🔧 Environment Variables

Create `.env.local` in backend directory:
```env
PORT=4000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=file:./data/app.db
JWT_SECRET=your_jwt_secret
```

## 📱 Mobile Development
For mobile testing, use ngrok:
```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 4000

# Use the ngrok URL in your mobile app
```