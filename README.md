# BridgeLineUSA - Universal Access Setup

## 🎯 Problem Solved
Your app now works from **any computer** - home, office, or online!

## 🚀 Quick Setup (Any Computer)

### Option 1: GitHub Codespaces (Easiest)
1. Open repository in GitHub Codespaces
2. Run: `./setup.sh`
3. Access via forwarded ports in VS Code

### Option 2: Local Development
```bash
git clone https://github.com/JoeDitta1/BridgeLineUSA.git
cd BridgeLineUSA
./setup.sh
```

### Option 3: Docker (Universal)
```bash
docker-compose up --build
```

## 🌐 Access from Anywhere

### Development
- **GitHub Codespaces**: Automatic forwarded URLs
- **Local**: `http://localhost:3000`
- **Network**: `http://YOUR_IP:3000`

### Production Deployment

#### Frontend (Vercel - Free)
1. Connect GitHub repo to Vercel
2. Deploy automatically
3. Update `vercel.json` with your backend URL

#### Backend (Railway - Free tier)
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

#### Database (Supabase - Free)
- Already configured in your app
- Just update credentials in `.env.local`

## 🔧 Environment Variables

Create `backend/.env.local`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=file:./data/app.db
JWT_SECRET=your_secure_secret
```

## 📱 Mobile Testing
```bash
# Use ngrok for mobile testing
npm install -g ngrok
ngrok http 4000
# Use the ngrok URL in your mobile browser
```

## 🎉 You're All Set!
Your app now works from any computer with internet access!