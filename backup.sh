#!/bin/bash
# BridgeLineUSA Comprehensive Backup Script
# Created: September 8, 2025
# Usage: ./backup.sh

set -euo pipefail

echo "🔄 Starting BridgeLineUSA backup process..."
echo "📅 Date: $(date)"
echo "🌿 Current branch: $(git branch --show-current)"
echo ""

# Check prerequisites
if ! command -v zip >/dev/null 2>&1; then
    echo "❌ zip not found. Install with: sudo apt-get update && sudo apt-get install zip"
    exit 1
fi

if ! git status >/dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Generate timestamp for backup names
ts=$(date -u +%Y%m%dT%H%M%SZ)
repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

echo "🏠 Working in: $repo_root"
echo "🕐 Timestamp: $ts"
echo ""

# Create backups directory
mkdir -p backups
echo "📁 Created backups directory"

echo ""
echo "=== STEP 1: Creating ZIP backup ==="
# 1) Zip the working tree (skip heavy directories)
zip_path="backups/BridgeLineUSA-$ts.zip"
echo "📦 Creating ZIP backup (excluding .git, node_modules, dist, backups)..."
zip -r "$zip_path" . -x ".git/*" "node_modules/*" "dist/*" "backups/*" "*.zip" "*.log" "*.tmp"
echo "✅ ZIP backup created: $zip_path"
echo "📊 ZIP size: $(du -h "$zip_path" | cut -f1)"

echo ""
echo "=== STEP 2: Creating Git Bundle ==="
# 2) Full history bundle
echo "🔄 Fetching all branches and tags..."
git fetch --all --tags
bundle_path="backups/BridgeLineUSA-$ts.bundle"
echo "📦 Creating git bundle with full history..."
git bundle create "$bundle_path" --all
echo "✅ Git bundle created: $bundle_path"
echo "📊 Bundle size: $(du -h "$bundle_path" | cut -f1)"

echo ""
echo "=== STEP 3: Creating Clean Branch ==="
# 3) Push a clean, lightweight branch (no heavy dirs)
BR="backup-clean-$ts"
TMP="/tmp/$BR"
echo "🧹 Creating clean branch: $BR"
echo "📁 Using temp directory: $TMP"

mkdir -p "$TMP"
echo "📋 Copying clean files (excluding heavy directories)..."
rsync -a --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='backups' --exclude='*.zip' --exclude='*.log' --exclude='*.tmp' ./ "$TMP/"

echo "🔧 Initializing clean repo and pushing branch..."
(
  cd "$TMP"
  git init
  git remote add origin "$(git -C "$repo_root" config --get remote.origin.url)"
  git checkout -b "$BR"
  git add .
  git commit -m "Clean backup $ts - AI BOM fixes and pipe schedule separation"
  echo "🚀 Pushing clean branch to GitHub..."
  git push origin "$BR"
)
echo "✅ Clean branch pushed: $BR"

echo ""
echo "=== BACKUP SUMMARY ==="
echo "✅ ZIP backup:    $zip_path ($(du -h "$zip_path" | cut -f1))"
echo "✅ Git bundle:    $bundle_path ($(du -h "$bundle_path" | cut -f1))"
echo "✅ Clean branch:  $BR (pushed to GitHub)"
echo ""
echo "🎉 Backup completed successfully!"
echo ""
echo "📝 RESTORE INSTRUCTIONS:"
echo "   • From ZIP:    unzip $zip_path"
echo "   • From bundle: git clone $bundle_path my-restore"
echo "   • From branch: git checkout $BR"
echo ""
echo "💾 Next steps: Consider uploading to Supabase (see supabase-upload.sh)"
