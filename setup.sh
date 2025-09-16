#!/bin/bash

# BridgeLineUSA Environment Setup Script
# This script helps set up the application for different environments

set -e

echo "🚀 BridgeLineUSA Environment Setup"
echo "================================="

# Function to detect environment
detect_environment() {
    if [ -n "$GITHUB_CODESPACE_TOKEN" ]; then
        echo "Detected: GitHub Codespaces"
        ENVIRONMENT="codespaces"
    elif [ -n "$VERCEL_URL" ]; then
        echo "Detected: Vercel"
        ENVIRONMENT="vercel"
    elif [ -n "$RENDER_EXTERNAL_URL" ]; then
        echo "Detected: Render"
        ENVIRONMENT="render"
    else
        echo "Detected: Local development"
        ENVIRONMENT="local"
    fi
}

# Function to setup backend
setup_backend() {
    echo "📦 Setting up backend..."

    cd backend

    # Install dependencies
    if [ ! -d "node_modules" ]; then
        npm install
    fi

    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        echo "Creating .env.local..."
        cat > .env.local << EOF
PORT=4000
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=file:./data/app.db
JWT_SECRET=change_this_secret_in_production
EOF
        echo "⚠️  Please update .env.local with your actual Supabase credentials!"
    fi

    # Create data directories
    mkdir -p data uploads

    cd ..
}

# Function to setup frontend
setup_frontend() {
    echo "🎨 Setting up frontend..."

    cd frontend

    # Install dependencies
    if [ ! -d "node_modules" ]; then
        npm install
    fi

    cd ..
}

# Function to start services
start_services() {
    echo "▶️  Starting services..."

    case $ENVIRONMENT in
        "codespaces")
            echo "Starting backend..."
            cd backend && npm start &
            echo "Starting frontend..."
            cd frontend && npm start &
            ;;
        "local")
            echo "Starting backend..."
            cd backend && npm start &
            echo "Starting frontend..."
            cd frontend && npm start &
            ;;
        *)
            echo "For cloud deployments, use the appropriate platform's deployment method"
            ;;
    esac
}

# Main execution
detect_environment
setup_backend
setup_frontend

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Backend: cd backend && npm start"
echo "  Frontend: cd frontend && npm start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up --build"
echo ""
echo "🌐 Access URLs:"
echo "  Local: http://localhost:3000"
if [ "$ENVIRONMENT" = "codespaces" ]; then
    echo "  Codespaces: Check the Ports panel for forwarded URLs"
fi