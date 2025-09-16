# BridgeLineUSA - Universal Access Setup

This guide ensures BridgeLineUSA works from **any Codespace session from any computer**, both in browser and desktop versions.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the universal setup script
./setup-universal.sh
```

### Option 2: Manual Setup
```bash
# Terminal 1: Start Backend
cd backend && npm start

# Terminal 2: Start Frontend
cd frontend && npm start
```

## 🌐 Access URLs

### GitHub Codespaces
- **Frontend (Browser)**: `https://[codespace-name]-3000.app.github.dev`
- **Backend API**: Automatically detected as `https://[codespace-name]-4000.app.github.dev`

### Local Development
- **Frontend (Browser)**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`

## 🔧 Environment Detection

The app automatically detects your environment:

### GitHub Codespaces
- ✅ CORS configured for `.app.github.dev` domains
- ✅ API base automatically set to backend port
- ✅ WebSocket connections handled properly
- ✅ File uploads and downloads work correctly

### VS Code Desktop
- ✅ Local development with hot reload
- ✅ Full debugging capabilities
- ✅ Native file system access

### Browser Access
- ✅ Works in any modern browser
- ✅ Responsive design for all screen sizes
- ✅ PWA capabilities for offline use

## 🛠️ Troubleshooting

### CORS Issues
If you see CORS errors:
1. Check that the backend is running on port 4000
2. Verify the frontend is accessing the correct API URL
3. The CORS configuration allows all GitHub.dev domains

### Connection Refused
If you get connection errors:
1. Ensure both backend and frontend are running
2. Check that ports 3000 and 4000 are available
3. In Codespaces, use the provided URLs, not localhost

### WebSocket Issues
WebSocket connection failures are normal in Codespaces:
- These don't affect app functionality
- Hot reload still works through polling
- All API calls work correctly

## 📁 Project Structure

```
BridgeLineUSA/
├── setup-universal.sh      # Universal setup script
├── backend/                # Node.js/Express backend
│   ├── src/
│   │   ├── index.js       # Main server with CORS config
│   │   ├── db.js          # Database setup
│   │   └── routes/        # API routes
│   └── data/              # SQLite database & uploads
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/base.js    # API base detection
│   │   ├── pages/         # React components
│   │   └── components/    # Reusable components
│   └── public/
│       └── index.html     # HTML with API injection
└── README-UNIVERSAL.md    # This file
```

## 🔄 API Base Detection

The frontend automatically detects the correct API base:

```javascript
// In frontend/src/api/base.js
export function getApiBase() {
  // GitHub Codespaces: replace -3000 with -4000
  if (hostname.includes('.app.github.dev')) {
    return origin.replace('-3000.', '-4000.');
  }
  // Local development
  return 'http://localhost:4000';
}
```

## 🛡️ Security Features

- **CORS Protection**: Only allows approved domains
- **Session Management**: Secure cookie-based sessions
- **JWT Tokens**: For API authentication
- **Role-Based Access**: OEM, Admin, Manufacturer roles
- **File Upload Security**: Validated file types and sizes

## 📊 Database & File Storage

- **SQLite Database**: `/backend/data/app.db`
- **File Uploads**: `/backend/data/uploads/`
- **Quote Files**: `/data/quotes/` (workspace root)
- **Automatic Backups**: `/workspaces/_archives/`

## 🚀 Deployment Options

### Development
- Run `./setup-universal.sh` for any Codespace
- Automatic environment detection
- Hot reload enabled

### Production
- Set `SERVE_FRONTEND=true` to serve built frontend
- Use environment variables for configuration
- Enable HTTPS for security

## 🔧 Configuration

### Environment Variables
```bash
# Backend
PORT=4000
NODE_ENV=development
SESSION_SECRET=your-secret-key

# Frontend
REACT_APP_API_BASE=https://your-codespace-4000.app.github.dev
REACT_APP_MARKETING_AT_ROOT=true
```

### CORS Configuration
The backend allows:
- All GitHub Codespaces domains (`*.app.github.dev`)
- Localhost for development
- Any origin in development mode

## 📞 Support

If you encounter issues:

1. Run `./setup-universal.sh` to reset everything
2. Check browser console for specific errors
3. Verify both servers are running on correct ports
4. Test API connectivity: `curl http://localhost:4000/api/health`

## 🎯 Key Features

- ✅ **Universal Access**: Works from any Codespace session
- ✅ **Auto-Detection**: Automatically detects environment
- ✅ **CORS Ready**: Properly configured for GitHub.dev
- ✅ **Responsive**: Works on desktop and mobile
- ✅ **Secure**: Role-based access and file validation
- ✅ **Real-time**: Live updates and notifications

---

**Ready to use BridgeLineUSA from anywhere! 🌟**