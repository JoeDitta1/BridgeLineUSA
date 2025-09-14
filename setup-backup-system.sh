#!/bin/bash
# Master Setup Script
# Sets up complete backup system for BridgeLineUSA
# Usage: ./setup-backup-system.sh

set -euo pipefail

echo "🚀 BridgeLineUSA Backup System Setup"
echo "===================================="
echo "📅 Date: $(date)"
echo ""

# Make all scripts executable
echo "🔧 Making scripts executable..."
chmod +x backup.sh
chmod +x supabase-upload.sh  
chmod +x setup-lfs.sh
chmod +x setup-hooks.sh

echo ""
echo "📦 Step 1: Setting up Git LFS..."
./setup-lfs.sh

echo ""
echo "🔒 Step 2: Setting up Git hooks..."
./setup-hooks.sh

echo ""
echo "✅ Backup system setup completed!"
echo ""
echo "📋 WHAT WAS INSTALLED:"
echo "   ✅ backup.sh           - Main backup script"
echo "   ✅ supabase-upload.sh  - Cloud storage upload"
echo "   ✅ Git LFS             - Large file tracking"
echo "   ✅ Pre-push hook       - Large file blocker"
echo "   ✅ Updated .gitignore  - Cleaner repo"
echo ""
echo "🎯 NEXT STEPS:"
echo "   1. Run backup:    ./backup.sh"
echo "   2. Upload cloud:  ./supabase-upload.sh (optional)"
echo ""
echo "🛡️  PROTECTION ENABLED:"
echo "   • Large files automatically tracked in LFS"
echo "   • Pre-push hook prevents repo bloat"
echo "   • Multiple backup formats created"
echo "   • Clean branches pushed to GitHub"
