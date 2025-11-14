# How to Enable Payment Methods in Stripe Dashboard

## ⚠️ Important: You Need to Go to Stripe Dashboard Directly

The page you're currently viewing (Tengasell interface) is for **managing payment configurations**, not for enabling payment methods in Stripe itself.

## Step-by-Step: Enable Payment Methods in Stripe

### Step 1: Go to Stripe Dashboard

1. **Open a new browser tab**
2. **Go directly to:** https://dashboard.stripe.com
3. **Log in** with your Stripe account credentials

### Step 2: Navigate to Payment Methods Settings

Once logged into Stripe Dashboard:

1. Click on **"Settings"** in the left sidebar (gear icon)
2. Click on **"Payment methods"** (NOT "Payments" → "Payment methods")
   - Direct link: https://dashboard.stripe.com/settings/payment_methods

### Step 3: Find and Activate Payment Methods

On the Payment methods page, you should see:

**A list or grid of payment methods** with options to activate them. Look for:

- **PayPal** - Usually in the main list
- **PayPay** - May be under "Japan" or "Regional" section
- **Konbini** - May be listed as "Konbini" or "Convenience Store Payments"

**For each payment method:**

1. **Click on the payment method name/card**
2. **Click "Activate"** or toggle the switch to **ON**
3. **Complete any required setup:**
   - PayPal: Connect your PayPal business account
   - PayPay: Complete Japan business verification (if required)
   - Konbini: Accept terms and configure

### Step 4: Verify Activation

After activating, you should see:
- Status changes to "Active" or "Enabled"
- Payment method appears in your available methods
- Method will automatically be available in your checkout sessions

## Visual Guide: What You Should See

In Stripe Dashboard → Settings → Payment methods, you should see something like:

```
┌─────────────────────────────────────┐
│  Payment methods                    │
├─────────────────────────────────────┤
│  [Card]          [Activate]         │
│  [PayPal]        [Activate] ← Click│
│  [PayPay]        [Activate] ← Click│
│  [Konbini]       [Activate] ← Click│
│  [Apple Pay]     [Activate]         │
│  ...                                │
└─────────────────────────────────────┘
```

## Troubleshooting

### If You Don't See the Payment Methods Page

1. **Make sure you're logged into Stripe Dashboard** (not a third-party app)
2. **URL should be:** `dashboard.stripe.com`
3. **Navigate:** Settings → Payment methods (in left sidebar)

### If PayPay/Konbini Don't Appear

These are **Japan-only** payment methods:

1. **Check your Stripe account country:**
   - Go to: Settings → Account → Business information
   - Ensure country is set to **Japan**
   
2. **If not set to Japan:**
   - You may need to create a Japan-based Stripe account
   - Or contact Stripe support for assistance

### If PayPal Doesn't Appear

1. Check if PayPal is available in your region
2. Verify your business account type
3. Contact Stripe support if needed

## Difference: Configuration vs. Activation

**What you're currently viewing (Tengasell):**
- Payment method **configurations** (how methods are displayed/customized)
- These are settings for existing payment methods

**What you need to do (Stripe Dashboard):**
- **Activate** the actual payment methods (PayPal, PayPay, Konbini)
- This makes them available for use in checkout sessions

## Quick Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Payment Methods Settings:** https://dashboard.stripe.com/settings/payment_methods
- **Account Settings:** https://dashboard.stripe.com/settings/account

## After Activation

Once you've activated the payment methods in Stripe Dashboard:

1. ✅ They'll automatically appear in your checkout sessions
2. ✅ Users can select them on your `/payment` page
3. ✅ No code changes needed - it's automatic!
4. ✅ The Tengasell configurations you saw will work with these activated methods

## Summary

**Current Location:** Tengasell interface (managing configurations)  
**Where You Need to Go:** Stripe Dashboard → Settings → Payment methods  
**What to Do:** Activate PayPal, PayPay, and Konbini payment methods

