#!/bin/bash

# BridgeLineUSA User Management Script
echo "🔐 BridgeLineUSA User Management"
echo "==============================="

# Check if backend is running
if ! lsof -ti:4000 &> /dev/null; then
    echo "❌ Backend is not running. Please start it first:"
    echo "   cd backend && npm start"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Function to create/update user password
create_user() {
    local email=$1
    local password=$2
    local role=$3

    echo "Creating/updating user: $email (role: $role)"

    # Use curl to call the backend API
    response=$(curl -s -X POST http://localhost:4000/api/auth/create-user \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"role\":\"$role\"}")

    if echo "$response" | grep -q "success"; then
        echo "✅ User $email created/updated successfully"
    else
        echo "❌ Failed to create/update user $email"
        echo "Response: $response"
    fi
}

# Function to list users
list_users() {
    echo "📋 Current Users:"
    echo "=================="

    response=$(curl -s http://localhost:4000/api/admin/settings)
    if echo "$response" | grep -q "SUPABASE"; then
        echo "✅ Admin API accessible"
        echo ""
        echo "Available test users:"
        echo "- test-oem@bridgeline.com (password: test123) - OEM role"
        echo "- johnjoseph.clark@atlascopco.com (password: atlas123) - OEM role"
        echo "- kevin@southcoastmfg.com (password: admin123) - Admin role"
    else
        echo "❌ Admin API not accessible"
    fi
}

# Main menu
echo "Choose an option:"
echo "1. List current users"
echo "2. Reset user passwords"
echo "3. Create new user"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        list_users
        ;;
    2)
        echo "Resetting passwords for existing users..."
        create_user "test-oem@bridgeline.com" "test123" "oem"
        create_user "johnjoseph.clark@atlascopco.com" "atlas123" "oem"
        create_user "kevin@southcoastmfg.com" "admin123" "admin"
        echo ""
        echo "✅ Passwords reset! Use these credentials:"
        echo "- test-oem@bridgeline.com / test123"
        echo "- johnjoseph.clark@atlascopco.com / atlas123"
        echo "- kevin@southcoastmfg.com / admin123"
        ;;
    3)
        read -p "Email: " email
        read -p "Password: " password
        read -p "Role (oem/admin/manufacturer): " role
        create_user "$email" "$password" "$role"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "🌐 Access your app at:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:4000"