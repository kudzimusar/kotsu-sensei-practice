# How to Enable Payment Methods in Stripe Dashboard

## Step-by-Step Instructions

### 1. Navigate to Payment Methods

You're already in the right place! You're at:
- **Settings** → **Payments** → **Payment methods**

### 2. Enable PayPal

1. In the Payment methods page, look for **"PayPal"** in the list
2. If you don't see it, scroll down or use the search/filter
3. Click on **"PayPal"** or find the toggle/activate button
4. Click **"Activate"** or toggle it **ON**
5. Complete the PayPal onboarding process:
   - You may need to connect your PayPal business account
   - Accept PayPal's terms
   - Complete any required verification

**Note:** PayPal may require business verification depending on your account type.

### 3. Enable PayPay

1. Look for **"PayPay"** in the payment methods list
2. Click on **"PayPay"** 
3. Click **"Activate"** or toggle it **ON**
4. Complete PayPay onboarding:
   - **Important:** PayPay requires a Japan-based Stripe account
   - You may need to provide Japan business registration
   - Complete PayPay's verification process

**Note:** PayPay is only available for Japan-based businesses. If you don't have a Japan business, this may not be available.

### 4. Enable Konbini (Convenience Store Payments)

1. Look for **"Konbini"** in the payment methods list
   - It might be listed as "Konbini" or "Convenience Store Payments"
   - May be under "Japan" or "Regional" payment methods
2. Click on **"Konbini"**
3. Click **"Activate"** or toggle it **ON**
4. Complete Konbini setup:
   - Accept terms
   - Configure settings if needed

**Note:** Konbini is only available for Japan-based Stripe accounts.

## Alternative Method: Via Payment Method Settings

If you can't find the payment methods in the list:

1. Go to **Settings** → **Payment methods** (you're already here)
2. Look for a section that says **"Available payment methods"** or **"Activate payment methods"**
3. You might see a grid/list of payment method cards
4. Click on each one (PayPal, PayPay, Konbini) to activate

## If Payment Methods Don't Appear

### For PayPay and Konbini:
- These are **Japan-only** payment methods
- Your Stripe account must be set up for Japan
- If they don't appear, you may need to:
  1. Update your Stripe account country to Japan
  2. Complete Japan business verification
  3. Contact Stripe support if needed

### For PayPal:
- Should be available in most countries
- If it doesn't appear, check:
  1. Your Stripe account region
  2. Your business type
  3. Contact Stripe support

## Verification Checklist

After enabling each method:

- [ ] PayPal shows as "Active" or "Enabled"
- [ ] PayPay shows as "Active" (if available for your account)
- [ ] Konbini shows as "Active" (if available for your account)
- [ ] Payment methods appear in your checkout sessions

## Testing

Once enabled, you can test:

1. Go to your app's `/payment` page
2. Select a plan
3. You should now see PayPal, PayPay, and Konbini as payment options
4. Try creating a test checkout session

## Current Status

Based on your Stripe Dashboard screenshot:
- You have payment method configurations set up
- You need to activate the individual payment methods (PayPal, PayPay, Konbini)
- These are separate from the payment method configurations

## Need Help?

If you can't find these payment methods:
1. Check Stripe's regional availability: https://stripe.com/docs/payments/payment-methods
2. Contact Stripe Support for account-specific help
3. Verify your Stripe account country/region settings

