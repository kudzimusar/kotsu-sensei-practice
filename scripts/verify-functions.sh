#!/bin/bash
# Verify which Edge Functions are deployed and their status

echo "🔍 Verifying Edge Functions deployment status..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install it with: npm install -g supabase"
  exit 1
fi

echo "📋 Listing deployed functions..."
npx supabase functions list

echo ""
echo "🔐 Checking required secrets..."
echo ""

# Required secrets for each function
declare -A REQUIRED_SECRETS=(
  ["ai-chat"]="LOVABLE_API_KEY SERPER_API_KEY GOOGLE_AI_STUDIO_API_KEY"
  ["generate-flashcards"]="LOVABLE_API_KEY SERPER_API_KEY GOOGLE_AI_STUDIO_API_KEY"
  ["generate-questions"]="GEMINI_API_KEY LOVABLE_API_KEY GOOGLE_AI_STUDIO_API_KEY"
  ["generate-s3-presigned-url"]="AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION AWS_S3_BUCKET"
  ["text-to-speech"]="LOVABLE_API_KEY GOOGLE_AI_STUDIO_API_KEY"
)

# Check secrets (this will show encrypted values, but confirms they exist)
echo "Checking secrets..."
for func in "${!REQUIRED_SECRETS[@]}"; do
  echo "  $func:"
  for secret in ${REQUIRED_SECRETS[$func]}; do
    if npx supabase secrets list | grep -q "$secret"; then
      echo "    ✅ $secret is set"
    else
      echo "    ❌ $secret is MISSING"
    fi
  done
  echo ""
done

echo "✅ Verification complete!"

