#!/bin/bash

# Smart server startup script that handles port conflicts
PORT=4000

echo "🔍 Checking for processes using port $PORT..."

# Find and kill any processes using the port
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "⚠️  Found process $PID using port $PORT, killing it..."
    kill -9 $PID 2>/dev/null
    sleep 2
fi

# Also kill any lingering node processes that might be our server
echo "🧹 Cleaning up any lingering backend processes..."
pkill -f "node.*src/index.js" 2>/dev/null
sleep 1

# Verify port is free before starting
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "❌ Port $PORT is still in use after cleanup. Manual intervention required."
    echo "Run: sudo lsof -ti:$PORT | xargs sudo kill -9"
    exit 1
fi

echo "✅ Port $PORT is free"
echo "🚀 Starting BridgeLineUSA backend server..."

# Change to script directory and start server
cd "$(dirname "$0")"
exec npm start
