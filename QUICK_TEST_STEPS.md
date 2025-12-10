# ⚡ Quick Testing Steps - Monetization System

## 🚀 Fast Track Testing (15 minutes)

### Step 1: Make a Test Payment (5 min)
1. **Open app** → Go to **Profile** → Click **"Upgrade"**
2. **Select "Quarterly" plan** → Click **"Subscribe"**
3. **On Stripe Checkout:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`
4. **Click "Pay"**
5. **Wait for redirect** to success page

**✅ Check:** Success page shows "Payment Successful"

---

### Step 2: Verify Database (2 min)
1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/ndulrvfwcqyvutcviebk/editor
2. **Check `subscriptions` table:**
   - Find your user's record
   - Verify `status` = `"trialing"` or `"active"`
   - Verify `stripe_subscription_id` is populated
3. **Check `profiles` table:**
   - Find your user's record
   - Verify `is_premium` = `true`

**✅ Check:** Both tables updated correctly

---

### Step 3: Verify Frontend (3 min)
1. **Go to Profile page:**
   - Should show **"Premium"** badge
   - Should show **"Manage"** button (not "Upgrade")
2. **Go to Account page:**
   - Should show subscription details
   - Should show **"Manage Payment"** button
   - Should show billing history section

**✅ Check:** Premium status visible everywhere

---

### Step 4: Test Premium Feature (3 min)
1. **Go to Question Generator:**
   - Generate more than 10 questions
   - Should work without limits (if premium)
2. **Or test free tier:**
   - Create a new free account
   - Try to generate 11th question
   - Should show paywall

**✅ Check:** Premium features work, free limits enforced

---

### Step 5: Test Account Management (2 min)
1. **On Account page, click "Manage Payment"**
2. **Should redirect to Stripe Customer Portal**
3. **Can see subscription, update payment method, etc.**

**✅ Check:** Customer portal opens correctly

---

## 🎯 What to Look For

### ✅ Success Indicators:
- Payment completes without errors
- Subscription in database within 10 seconds
- Premium badge appears on Profile
- Can access premium features
- "Manage Payment" opens Stripe portal

### ❌ Failure Indicators:
- Payment fails or errors
- Subscription doesn't appear in database
- Premium badge doesn't show
- Premium features still blocked
- "Manage Payment" doesn't work

---

## 🐛 Quick Fixes

**If subscription doesn't appear:**
- Check browser console for errors
- Check Supabase Edge Function logs
- Verify webhook is configured in Stripe

**If premium status doesn't update:**
- Refresh the page
- Check `profiles.is_premium` in database
- Manually update if needed: `UPDATE profiles SET is_premium = true WHERE id = 'your-id'`

**If "Manage Payment" fails:**
- Check if `stripe_customer_id` exists in subscription
- Verify Edge Function is deployed
- Check browser console for errors

---

**Total Time: ~15 minutes** ⏱️

**Ready? Start with Step 1!** 🚀

