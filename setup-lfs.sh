#!/bin/bash
# Git LFS Setup Script
# Sets up Git Large File Storage for binary files
# Usage: ./setup-lfs.sh

set -euo pipefail

echo "📦 Setting up Git LFS for BridgeLineUSA"
echo "======================================"

echo "🔧 Installing Git LFS..."
git lfs install --force

echo "📋 Tracking large file types..."
git lfs track "*.docx"
git lfs track "*.pdf" 
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "*.jpeg"
git lfs track "*.webp"
git lfs track "*.dxf"
git lfs track "*.dwg"
git lfs track "*.step"
git lfs track "*.zip"
git lfs track "*.7z"
git lfs track "*.tar"
git lfs track "*.gz"
git lfs track "*.db"
git lfs track "*.sqlite"

echo "📄 Git LFS tracking rules:"
cat .gitattributes

echo ""
echo "💾 Committing LFS configuration..."
git add .gitattributes
if git commit -m "chore: track large artifacts with Git LFS" 2>/dev/null; then
    echo "✅ LFS configuration committed"
else
    echo "ℹ️  LFS configuration already committed or no changes"
fi

echo ""
echo "✅ Git LFS setup completed!"
echo ""
echo "📝 What this does:"
echo "   • PDF drawings will be stored in LFS (not bloating repo)"
echo "   • Images and CAD files handled efficiently"
echo "   • Database files won't cause push failures"
echo "   • ZIP backups tracked in LFS"
