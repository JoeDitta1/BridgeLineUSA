#!/bin/bash

# Mobile Testing Setup with ngrok
echo "📱 Setting up mobile testing with ngrok..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    npm install -g ngrok
fi

# Check if backend is running
if ! lsof -ti:4000 &> /dev/null; then
    echo "Starting backend..."
    cd backend && npm start &
    sleep 3
fi

echo "🚀 Starting ngrok tunnel..."
echo "This will give you a public URL for mobile testing"
echo "Press Ctrl+C to stop"
echo ""

ngrok http 4000