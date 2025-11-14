# Quick Guide: Enable Payment Methods in Stripe

## You're Already in the Right Place! ✅

You're currently at: **Settings** → **Payments** → **Payment methods**

## Quick Steps

### Step 1: Find the Payment Methods List

On the Payment methods page, you should see a list or grid of available payment methods. Look for:

- **PayPal** - Usually near the top
- **PayPay** - May be under "Japan" or "Regional" section  
- **Konbini** - May be listed as "Konbini" or "Convenience Store"

### Step 2: Activate Each Method

For each payment method you want to enable:

1. **Click on the payment method name/card**
2. **Click the "Activate" button** (usually purple/blue)
3. **Complete any required setup:**
   - PayPal: Connect PayPal account, accept terms
   - PayPay: Complete Japan business verification
   - Konbini: Accept terms, configure settings

### Step 3: Verify Activation

After activating, you should see:
- Status changes to "Active" or "Enabled"
- Payment method appears in your available methods list
- Method will be available in checkout sessions

## If You Don't See the Payment Methods

### PayPay & Konbini Not Showing?

These are **Japan-only** payment methods. If they don't appear:

1. **Check your Stripe account country:**
   - Go to **Settings** → **Account** → **Business information**
   - Ensure country is set to **Japan**

2. **Complete Japan business verification:**
   - May require Japan business registration number
   - Contact Stripe support if needed

3. **Alternative:** These methods may not be available for your account type

### PayPal Not Showing?

1. Check if it's available in your region
2. Verify your business account type
3. Contact Stripe support if needed

## What Happens After Activation

Once activated:
- ✅ Payment methods appear in your checkout sessions
- ✅ Users can select them on your `/payment` page
- ✅ Payments will process through these methods
- ✅ No code changes needed - it's automatic!

## Testing

After enabling:

1. Go to your app: `/payment`
2. Select a plan
3. You should see the enabled payment methods as options
4. Try creating a test checkout to verify

## Current Status

Based on your screenshot:
- ✅ You're in the Payment methods section
- ✅ You have payment configurations set up
- ⏳ Need to activate individual payment methods (PayPal, PayPay, Konbini)

The payment method **configurations** (what you see in the table) are different from the payment method **activation**. You need to activate the actual payment methods (PayPal, PayPay, Konbini) so they appear in checkout.

