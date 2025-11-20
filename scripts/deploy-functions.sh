#!/bin/bash
# Deploy all Edge Functions to Supabase

set -e

echo "🚀 Deploying all Edge Functions to Supabase..."
echo ""

# List of all Edge Functions
FUNCTIONS=(
  "ai-chat"
  "check-payment-methods"
  "create-booking-payment"
  "create-checkout-session"
  "create-customer-portal-session"
  "create-practice-room-payment"
  "create-video-session"
  "generate-flashcards"
  "generate-questions"
  "generate-referral-code"
  "generate-s3-presigned-url"
  "get-billing-history"
  "get-checkout-session"
  "import-schedule-pdf"
  "reset-user-schedule"
  "send-booking-notifications"
  "stripe-webhook"
  "text-to-speech"
  "track-affiliate-click"
)

SUCCESS=0
FAILED=0

for func in "${FUNCTIONS[@]}"; do
  echo "📦 Deploying $func..."
  if npx supabase functions deploy "$func" --no-verify-jwt; then
    echo "✅ $func deployed successfully"
    ((SUCCESS++))
  else
    echo "❌ Failed to deploy $func"
    ((FAILED++))
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Deployment Summary:"
echo "   ✅ Successful: $SUCCESS"
echo "   ❌ Failed: $FAILED"
echo "   📦 Total: ${#FUNCTIONS[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

