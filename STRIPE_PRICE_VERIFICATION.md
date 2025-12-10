# Stripe Price Verification & Fix Guide

## 🚨 Critical Issue: ¥150,000 Display

**Problem**: Stripe checkout showing "Then ¥150,000 every 3 months" instead of "Then ¥1,500 every 3 months"

**Root Cause Analysis**:
The backend code has the correct amount: `150000` (which equals ¥1,500 in smallest currency unit). However, Stripe might be:
1. Using a pre-configured Price ID with wrong amount
2. Displaying the amount incorrectly
3. Multiplying the amount somewhere

---

## ✅ Verification Steps

### **Step 1: Check if Price IDs are Being Used**

The code checks for `STRIPE_PRICE_ID_QUARTERLY` environment variable:

```typescript
quarterly: {
  amount: 150000, // Correct: ¥1,500
  priceId: Deno.env.get("STRIPE_PRICE_ID_QUARTERLY") || "",
}
```

**If Price ID exists**: Stripe uses the Price ID amount (might be wrong!)
**If Price ID is empty**: Stripe uses `price_data` with `amount: 150000` (correct)

### **Step 2: Check Supabase Secrets**

1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Check if `STRIPE_PRICE_ID_QUARTERLY` exists
3. **If it exists**: This might be pointing to a product with wrong price
4. **Solution**: Either delete the secret OR update the Stripe product price

### **Step 3: Verify Stripe Products**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Look for "Kōtsū Sensei Premium - Quarterly"
3. Check the price amount:
   - Should be: **¥1,500** or **150000** (smallest unit)
   - If it shows: **¥150,000** or **15000000** → **THIS IS WRONG!**

### **Step 4: Fix Stripe Product Prices**

**Option A: Delete Price IDs from Supabase Secrets**
- Remove `STRIPE_PRICE_ID_QUARTERLY` from Supabase secrets
- This forces the code to use `price_data` with correct amount

**Option B: Update Stripe Product Prices**
1. Go to Stripe Dashboard → Products
2. Find the quarterly product
3. Edit the price:
   - Amount: **150000** (for ¥1,500)
   - Currency: **JPY**
   - Interval: **Every 3 months**

---

## 🔧 Immediate Fix

### **Remove Price IDs (Recommended)**

1. **Go to Supabase Dashboard**:
   - Project Settings → Edge Functions → Secrets
   - Delete these secrets if they exist:
     - `STRIPE_PRICE_ID_MONTHLY`
     - `STRIPE_PRICE_ID_QUARTERLY`
     - `STRIPE_PRICE_ID_ANNUAL`
     - `STRIPE_PRICE_ID_LIFETIME`

2. **This forces the code to use `price_data`**:
   - Which has the correct amounts
   - Monthly: 98000 = ¥980 ✅
   - Quarterly: 150000 = ¥1,500 ✅
   - Annual: 880000 = ¥8,800 ✅
   - 9-Month: 240000 = ¥2,400 ✅

### **Or Update Stripe Products**

1. **Create/Update Products in Stripe**:
   - Monthly: ¥980/month
   - Quarterly: ¥1,500/3 months
   - Annual: ¥8,800/year
   - 9-Month: ¥2,400 one-time

2. **Get Price IDs**:
   - Copy the Price ID from each product
   - Add to Supabase secrets with correct amounts

---

## 🧪 Testing After Fix

1. **Use Test Mode**:
   - Enable test mode in Stripe Dashboard
   - Use test card: `4242 4242 4242 4242`

2. **Verify Amounts**:
   - Start checkout for Quarterly plan
   - Check Stripe Checkout preview
   - Should show: "Then ¥1,500 every 3 months"
   - NOT: "Then ¥150,000 every 3 months"

3. **Complete Test Payment**:
   - Use test card
   - Complete checkout
   - Check Stripe Dashboard → Payments
   - Verify charge amount is ¥1,500 (or 150000 in smallest unit)

---

## 📋 Price Verification Checklist

- [ ] Check Supabase secrets for Price IDs
- [ ] Verify Stripe Dashboard product prices
- [ ] Test checkout with test card
- [ ] Verify amount in Stripe Checkout preview
- [ ] Complete test payment
- [ ] Check actual charge amount in Stripe Dashboard
- [ ] Verify webhook updates subscription correctly

---

## ⚠️ Important Notes

- **JPY Currency**: 1 yen = 1 smallest unit (no decimal)
- **Amount 150000** = **¥1,500** (correct)
- **Amount 15000000** = **¥150,000** (wrong - 100x too high)
- **Stripe displays** amounts in the currency's standard format
- **Check Stripe Dashboard** to verify actual product prices

---

## 🔗 Quick Links

- [Stripe Dashboard - Products](https://dashboard.stripe.com/products)
- [Stripe Dashboard - API Keys](https://dashboard.stripe.com/apikeys)
- [Supabase Dashboard - Secrets](https://supabase.com/dashboard/project/_/settings/functions)



