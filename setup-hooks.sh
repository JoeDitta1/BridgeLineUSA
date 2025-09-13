#!/bin/bash
# Pre-push Hook Setup
# Creates a git hook to prevent large file pushes
# Usage: ./setup-hooks.sh

set -euo pipefail

echo "🔒 Setting up Git pre-push hook"
echo "=============================="

hook_file=".git/hooks/pre-push"

echo "📝 Creating pre-push hook at: $hook_file"

cat > "$hook_file" << 'EOF'
#!/usr/bin/env bash
# Pre-push hook to prevent large files from being pushed
# Created by backup setup script

set -euo pipefail

echo "🔍 Checking for large files before push..."

# Get list of files being pushed
changed=$(git diff --cached --name-only 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || true)

if [[ -z "$changed" ]]; then
    echo "ℹ️  No files to check"
    exit 0
fi

large_files=()
for f in $changed; do
    # Skip if file doesn't exist (deleted files)
    [[ -f "$f" ]] || continue
    
    # Get file size in bytes
    sz=$(wc -c <"$f" 2>/dev/null | tr -d ' ' || echo "0")
    
    # Check if file is larger than 90MB (94371840 bytes)
    if [[ "$sz" -gt 94371840 ]]; then
        # Check if file is tracked by LFS
        attr=$(git check-attr filter -- "$f" 2>/dev/null | awk '{print $3}' || echo "unspecified")
        
        if [[ "$attr" != "lfs" ]]; then
            large_files+=("$f ($(numfmt --to=iec $sz))")
        fi
    fi
done

# If we found large files not in LFS, block the push
if [[ ${#large_files[@]} -gt 0 ]]; then
    echo ""
    echo "❌ PUSH BLOCKED: Large files not tracked by Git LFS:"
    for f in "${large_files[@]}"; do
        echo "   • $f"
    done
    echo ""
    echo "🔧 To fix this:"
    echo "   1. Track the file type with LFS: git lfs track \"*.ext\""
    echo "   2. Add .gitattributes: git add .gitattributes"  
    echo "   3. Add the file again: git add filename"
    echo "   4. Commit and push"
    echo ""
    exit 1
fi

echo "✅ All files are appropriately sized or tracked by LFS"

# Chain to LFS pre-push hook if it exists
if command -v git-lfs >/dev/null 2>&1; then
    exec git lfs pre-push "$@"
fi
EOF

chmod +x "$hook_file"

echo "✅ Pre-push hook created and made executable"
echo ""
echo "🛡️  What this hook does:"
echo "   • Checks all files before pushing"
echo "   • Blocks files >90MB not in LFS"
echo "   • Gives clear instructions to fix issues"
echo "   • Chains to Git LFS hook"
echo ""
echo "📝 Test the hook:"
echo "   • Try to commit a large file"
echo "   • Hook will catch it and show instructions"
