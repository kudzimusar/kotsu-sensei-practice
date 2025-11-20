#!/bin/bash
# Check which secrets are configured in Supabase

echo "🔐 Checking Supabase Edge Function Secrets..."
echo ""

npx supabase secrets list

echo ""
echo "📝 Required secrets for each function:"
echo ""
echo "ai-chat:"
echo "  - LOVABLE_API_KEY (primary, required)"
echo "  - GOOGLE_AI_STUDIO_API_KEY (fallback)"
echo "  - SERPER_API_KEY (optional, for images)"
echo ""
echo "generate-flashcards:"
echo "  - LOVABLE_API_KEY (primary, required)"
echo "  - GOOGLE_AI_STUDIO_API_KEY (fallback)"
echo "  - SERPER_API_KEY (optional, for images)"
echo ""
echo "generate-questions:"
echo "  - GEMINI_API_KEY (primary, required)"
echo "  - LOVABLE_API_KEY (fallback)"
echo "  - GOOGLE_AI_STUDIO_API_KEY (fallback)"
echo ""
echo "generate-s3-presigned-url:"
echo "  - AWS_ACCESS_KEY_ID (required)"
echo "  - AWS_SECRET_ACCESS_KEY (required)"
echo "  - AWS_REGION (required)"
echo "  - AWS_S3_BUCKET (required)"
echo ""
echo "text-to-speech:"
echo "  - LOVABLE_API_KEY (primary)"
echo "  - GOOGLE_AI_STUDIO_API_KEY (fallback)"
echo ""

