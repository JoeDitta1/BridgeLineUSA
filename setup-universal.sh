#!/bin/bash

# BridgeLineUSA Universal Setup Script
# This script ensures the app works from any Codespace session from any computer

echo "🚀 BridgeLineUSA Universal Setup"
echo "================================="

# Function to detect environment
detect_environment() {
    if [[ $GITHUB_CODESPACES == "true" ]]; then
        echo "Detected: GitHub Codespaces"
        ENVIRONMENT="codespaces"
    elif [[ -n $CODESPACES ]]; then
        echo "Detected: VS Code Codespaces"
        ENVIRONMENT="vscode-codespaces"
    else
        echo "Detected: Local development"
        ENVIRONMENT="local"
    fi
}

# Function to get the correct API base URL
get_api_base() {
    if [[ $ENVIRONMENT == "codespaces" ]] || [[ $ENVIRONMENT == "vscode-codespaces" ]]; then
        # Extract the current hostname and replace port for backend
        CURRENT_HOST=$(hostname -f 2>/dev/null || hostname)
        if [[ $CURRENT_HOST == *"-3000"* ]]; then
            API_BASE="https://${CURRENT_HOST/-3000/-4000}"
        else
            API_BASE="http://localhost:4000"
        fi
        echo "API Base for Codespaces: $API_BASE"
    else
        API_BASE="http://localhost:4000"
        echo "API Base for Local: $API_BASE"
    fi
}

# Function to check if backend is running
check_backend() {
    echo "Checking backend status..."
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is running on localhost:4000"
        return 0
    else
        echo "❌ Backend is not running on localhost:4000"
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "Starting backend server..."
    cd backend

    # Kill any existing backend processes
    pkill -f "node.*index.js" || true
    sleep 2

    # Start backend in background
    npm start &
    BACKEND_PID=$!

    # Wait for backend to start
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
            echo "✅ Backend started successfully"
            break
        fi
        sleep 2
        if [[ $i -eq 30 ]]; then
            echo "❌ Backend failed to start within 60 seconds"
            return 1
        fi
    done

    cd ..
    return 0
}

# Function to start frontend
start_frontend() {
    echo "Starting frontend server..."
    cd frontend

    # Kill any existing frontend processes
    pkill -f "react-scripts start" || true
    sleep 2

    # Start frontend in background
    npm start &
    FRONTEND_PID=$!

    # Wait for frontend to start
    echo "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Frontend started successfully"
            break
        fi
        sleep 2
        if [[ $i -eq 30 ]]; then
            echo "❌ Frontend failed to start within 60 seconds"
            return 1
        fi
    done

    cd ..
    return 0
}

# Function to test API connectivity
test_api_connectivity() {
    echo "Testing API connectivity..."

    # Test health endpoint
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "✅ Health endpoint accessible"
    else
        echo "❌ Health endpoint not accessible"
        return 1
    fi

    # Test CORS preflight
    if curl -s -X OPTIONS \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "✅ CORS preflight working"
    else
        echo "❌ CORS preflight failed"
        return 1
    fi

    return 0
}

# Function to display access information
display_access_info() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "🌐 Frontend Access:"
    if [[ $ENVIRONMENT == "codespaces" ]] || [[ $ENVIRONMENT == "vscode-codespaces" ]]; then
        echo "   Browser: https://$CODESPACE_NAME-3000.app.github.dev"
        echo "   Desktop: Use VS Code's built-in browser or external browser"
    else
        echo "   Browser: http://localhost:3000"
        echo "   Desktop: http://localhost:3000"
    fi
    echo ""
    echo "🔧 Backend API:"
    echo "   Health Check: http://localhost:4000/api/health"
    echo "   API Base: $API_BASE"
    echo ""
    echo "📝 Environment Info:"
    echo "   Environment: $ENVIRONMENT"
    echo "   API Base: $API_BASE"
    echo "   Backend PID: $BACKEND_PID"
    echo "   Frontend PID: $FRONTEND_PID"
    echo ""
    echo "🔄 To restart services:"
    echo "   ./setup-universal.sh"
    echo ""
    echo "🛑 To stop services:"
    echo "   pkill -f 'node.*index.js' && pkill -f 'react-scripts start'"
}

# Main execution
main() {
    detect_environment
    get_api_base

    echo "Environment: $ENVIRONMENT"
    echo "API Base: $API_BASE"
    echo ""

    # Check if backend is already running
    if check_backend; then
        echo "Backend is already running"
    else
        if ! start_backend; then
            echo "Failed to start backend"
            exit 1
        fi
    fi

    # Start frontend
    if ! start_frontend; then
        echo "Failed to start frontend"
        exit 1
    fi

    # Test connectivity
    if ! test_api_connectivity; then
        echo "API connectivity test failed"
        exit 1
    fi

    # Display access information
    display_access_info

    echo ""
    echo "✅ BridgeLineUSA is ready!"
    echo "   Open your browser and navigate to the URL above to start using the app."
}

# Run main function
main "$@"