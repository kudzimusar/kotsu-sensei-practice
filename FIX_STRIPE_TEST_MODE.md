# Fix: "Your request was in live mode, but used a known test card"

## 🚨 Problem

You're seeing this error:
> "Your card was declined. Your request was in live mode, but used a known test card."

**This means**: Your Stripe account is in **Live Mode**, but you're trying to use a **test card**.

**Test cards only work in Test Mode!**

---

## ✅ Solution: Switch to Test Mode

### **Step 1: Check Stripe Dashboard Mode**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Look at the **top right corner**
3. You'll see either:
   - **"Test mode"** badge (green) ✅ → You're in test mode
   - **"Live mode"** badge (red) ❌ → You need to switch

### **Step 2: Switch to Test Mode**

1. Click the mode toggle in the top right
2. Switch from **"Live mode"** to **"Test mode"**
3. The badge should change to green "Test mode"

### **Step 3: Get Test Mode API Keys**

1. In Stripe Dashboard → **Developers** → **API keys**
2. Make sure you're in **Test mode** (toggle in top right)
3. You'll see:
   - **Publishable key**: Starts with `pk_test_...`
   - **Secret key**: Starts with `sk_test_...`

### **Step 4: Update Supabase Secrets**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **Edge Functions** → **Secrets**
4. Find `STRIPE_SECRET_KEY`
5. **Replace** the value with your **test secret key**:
   - Should start with: `sk_test_...`
   - NOT: `sk_live_...`

### **Step 5: Redeploy Edge Functions (if needed)**

After updating the secret:
1. The Edge Function will automatically use the new key
2. Or manually redeploy: `supabase functions deploy create-checkout-session`

---

## 🔍 How to Verify

### **Check Current Mode:**

1. **Stripe Dashboard**: Look for "Test mode" badge (top right)
2. **Supabase Secret**: Check if `STRIPE_SECRET_KEY` starts with `sk_test_`
3. **Test Payment**: Try the test card again - should work now

### **Test Card Should Work:**

- Card: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVC: `123`
- Name: `Test User`

---

## ⚠️ Important Notes

### **Test Mode vs Live Mode:**

| Mode | API Key Prefix | Test Cards | Real Cards |
|------|---------------|------------|------------|
| **Test Mode** | `sk_test_...` | ✅ Work | ❌ Don't work |
| **Live Mode** | `sk_live_...` | ❌ Don't work | ✅ Work |

### **When to Use Each:**

- **Test Mode**: Development, testing, debugging
- **Live Mode**: Production, real customers, real payments

### **Never Mix:**

- ❌ Test cards in Live Mode → Error (what you're seeing)
- ❌ Real cards in Test Mode → Won't process
- ✅ Test cards in Test Mode → Works perfectly
- ✅ Real cards in Live Mode → Works perfectly

---

## 🎯 Quick Fix Checklist

- [ ] Stripe Dashboard set to **Test Mode** (green badge)
- [ ] Supabase secret `STRIPE_SECRET_KEY` starts with `sk_test_`
- [ ] Using test card `4242 4242 4242 4242`
- [ ] Try payment again - should work now

---

## 📝 Current Status

**Your Issue:**
- Stripe is in **Live Mode** (using `sk_live_...` key)
- You're using a **test card** (`4242 4242 4242 4242`)
- Result: Error - test cards don't work in live mode

**Fix:**
1. Switch Stripe Dashboard to **Test Mode**
2. Update Supabase secret to use `sk_test_...` key
3. Try test card again - should work!

---

## 🔗 Quick Links

- [Stripe Dashboard - Test Mode](https://dashboard.stripe.com/test)
- [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
- [Supabase Dashboard - Secrets](https://supabase.com/dashboard/project/_/settings/functions)

---

## 💡 Alternative: Use Real Card in Live Mode

If you want to test with real payments:

1. Keep Stripe in **Live Mode**
2. Use a **real credit card** (not test card)
3. **Warning**: This will charge real money!

**Recommendation**: Use Test Mode for all testing.



