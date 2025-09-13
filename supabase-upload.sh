#!/bin/bash
# Supabase Storage Upload Script
# Upload backup files to Supabase Storage
# Usage: ./supabase-upload.sh

set -euo pipefail

echo "☁️  Supabase Storage Upload"
echo "=========================="

# Check if environment variables are set
if [[ -z "${SUPABASE_URL:-}" ]]; then
    echo "❌ SUPABASE_URL not set"
    echo "   Run: export SUPABASE_URL='https://your-project-ref.supabase.co'"
    exit 1
fi

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"
    echo "   Get service_role key from Supabase Dashboard > Settings > API"
    echo "   Run: export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    exit 1
fi

bucket="code-backups"
echo "🪣 Uploading to bucket: $bucket"
echo ""

if [[ ! -d "backups" ]]; then
    echo "❌ No backups directory found. Run ./backup.sh first."
    exit 1
fi

for f in backups/*; do
    if [[ -f "$f" ]]; then
        name=$(basename "$f")
        echo "📤 Uploading: $name ($(du -h "$f" | cut -f1))"
        
        response=$(curl -sS -w "%{http_code}" -X POST \
            "${SUPABASE_URL}/storage/v1/object/${bucket}/${name}" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
            -H "x-upsert: true" \
            -H "Content-Type: application/octet-stream" \
            --data-binary @"$f")
        
        http_code="${response: -3}"
        if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
            echo "✅ Uploaded successfully: $name"
        else
            echo "❌ Upload failed for $name (HTTP $http_code)"
        fi
    fi
done

echo ""
echo "☁️  Supabase upload completed!"
echo ""
echo "📋 To set up environment variables:"
echo "   1. Go to Supabase Dashboard > Your Project > Settings > API"
echo "   2. Copy Project URL and service_role key"
echo "   3. Run these commands:"
echo "      export SUPABASE_URL='https://your-project-ref.supabase.co'"
echo "      export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
echo "   4. Create 'code-backups' bucket in Storage if it doesn't exist"
