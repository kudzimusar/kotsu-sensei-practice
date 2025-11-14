# Stripe Payment Setup Guide

This guide explains how to configure Stripe for Kōtsū Sensei premium subscriptions with support for multiple payment methods.

## Payment Methods Supported

1. **Credit/Debit Cards** - Visa, Mastercard, JCB, American Express
2. **PayPal** - PayPal account payments
3. **PayPay** - Popular mobile payment in Japan
4. **Konbini (Convenience Store)** - 7-Eleven, FamilyMart, Lawson, etc.

## Step 1: Configure Stripe API Keys in Supabase

### For Supabase Edge Functions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add the following environment variables:

```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_... (you'll get this after setting up webhooks)
```

### For Frontend (Optional - if using Stripe.js directly)

Create a `.env.local` file in the project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51MUuwxAqp8pYwqz4DzaJIdozgNlyIMPpZspvb6gfmxLJ1drgmnx8namGKGUlkpYxQipYX691CBf04hASSzgW4zzk00oluKs5cr
```

⚠️ **Important**: Never commit API keys to version control!

## Step 2: Set Up Stripe Webhooks

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Set the endpoint URL to:
   ```
   https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
   ```
5. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`

## Step 3: Enable Payment Methods in Stripe

### Enable PayPal

1. Go to Stripe Dashboard → **Settings** → **Payment methods**
2. Find **PayPal** and click **Activate**
3. Complete the PayPal onboarding process
4. For Japan, ensure PayPal is enabled for JPY currency

### Enable PayPay

1. Go to Stripe Dashboard → **Settings** → **Payment methods**
2. Find **PayPay** and click **Activate**
3. Complete the PayPay onboarding (requires Japan business verification)
4. Note: PayPay is only available for Japan-based businesses

### Enable Konbini Payments

1. Go to Stripe Dashboard → **Settings** → **Payment methods**
2. Find **Konbini** (under Japan payment methods)
3. Click **Activate**
4. Complete the setup process

## Step 4: Create Stripe Products and Prices (Optional)

While the Edge Function can create prices dynamically, you can pre-create them for better management:

1. Go to Stripe Dashboard → **Products**
2. Create a product: "Kōtsū Sensei Premium"
3. Create prices for each plan:
   - Monthly: ¥980/month (recurring)
   - Quarterly: ¥2,400/3 months (recurring)
   - Annual: ¥8,800/year (recurring)
   - Lifetime: ¥19,800 (one-time)

4. Copy the Price IDs and add them to Supabase Edge Functions secrets:
   ```
   STRIPE_PRICE_ID_MONTHLY=price_...
   STRIPE_PRICE_ID_QUARTERLY=price_...
   STRIPE_PRICE_ID_ANNUAL=price_...
   STRIPE_PRICE_ID_LIFETIME=price_...
   ```

## Step 5: Test the Integration

### Test Mode

1. Use Stripe test keys (starts with `sk_test_` and `pk_test_`)
2. Use Stripe test cards: https://stripe.com/docs/testing
3. Test PayPal with test accounts
4. Test PayPay in test mode

### Live Mode

1. Switch to live keys (starts with `sk_live_` and `pk_live_`)
2. Ensure all payment methods are activated
3. Test with real payment methods (small amounts recommended)

## Step 6: Database Migration

Make sure you've run the subscription system migration:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/20251114135334_subscription_system.sql
```

## Troubleshooting

### Payment Methods Not Showing

- Check that payment methods are activated in Stripe Dashboard
- Verify your Stripe account is set up for Japan (for PayPay and Konbini)
- Check browser console for errors

### Webhook Not Receiving Events

- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook logs in Stripe Dashboard
- Check Supabase Edge Function logs

### Subscription Not Updating

- Check webhook is processing events correctly
- Verify database triggers are working
- Check `is_premium` field in profiles table

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Always use environment variables** for sensitive data
3. **Enable webhook signature verification** (already implemented)
4. **Use HTTPS** for all payment endpoints
5. **Regularly rotate API keys** for security

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For app-specific issues:
- Check Supabase Edge Function logs
- Review database subscription records
- Check browser console for frontend errors

