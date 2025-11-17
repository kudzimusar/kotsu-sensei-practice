# How to Switch Stripe from Live Mode to Test Mode

## 🎯 Step-by-Step Guide

### **Method 1: Using the Toggle (Easiest)**

1. **Go to Stripe Dashboard**
   - Open: https://dashboard.stripe.com
   - Log in with your Stripe account

2. **Look at the TOP RIGHT corner of the page**
   - You should see a toggle switch or button
   - It might say:
     - **"Live mode"** (if currently in live mode)
     - **"Test mode"** (if currently in test mode)
   - OR it might show a toggle switch with "Test mode" / "Live mode" labels

3. **Click the toggle or button**
   - If it says "Live mode" → Click it to switch to "Test mode"
   - The page will reload and show "Test mode" badge

4. **Verify**
   - After switching, you should see:
     - Green "Test mode" badge in top right
     - URL might change to include `/test` (e.g., `dashboard.stripe.com/test/...`)

---

### **Method 2: Using the URL (Direct)**

1. **Go directly to Test Mode**
   - Open: https://dashboard.stripe.com/test
   - This will automatically switch you to Test Mode

2. **Verify**
   - You should see "Test mode" badge in top right
   - URL should contain `/test`

---

### **Method 3: Using the Menu (If Toggle Not Visible)**

1. **Go to Stripe Dashboard**
   - Open: https://dashboard.stripe.com

2. **Look for a Menu or Settings Icon**
   - Top right corner
   - Might be a dropdown menu (three dots or your account icon)
   - Or a "Settings" link

3. **Navigate to Mode Settings**
   - Click on your account/profile icon (top right)
   - Look for "Switch to Test Mode" or "Test Mode" option
   - OR go to Settings → Account → Mode

4. **Switch Mode**
   - Click "Switch to Test Mode" or toggle the mode setting

---

## 🔍 Where to Look

### **Visual Guide:**

```
┌─────────────────────────────────────────────────┐
│  Stripe Dashboard                              │
│                                                 │
│  [Logo]  [Menu]  [Search]  [Live mode] ← HERE │
│                                                 │
│  ────────────────────────────────────────────  │
│                                                 │
│  Main Content Area                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**The toggle is ALWAYS in the TOP RIGHT corner**

---

## 📱 If You're on Mobile

1. **Open Stripe Dashboard** on mobile browser
2. **Look for menu icon** (three lines ☰) in top right
3. **Tap the menu** → Look for "Test Mode" or "Switch Mode"
4. **OR** tap your profile icon → Settings → Mode

---

## 🖥️ If You're on Desktop

### **Option A: Toggle Button (Most Common)**

1. Top right corner
2. Look for a button that says:
   - **"Live mode"** (red/orange) → Click to switch
   - **"Test mode"** (green) → Already in test mode

### **Option B: Dropdown Menu**

1. Click your **profile icon** (top right)
2. Look for **"Switch to Test Mode"** option
3. Click it

### **Option C: Settings Page**

1. Click **Settings** (left sidebar or top menu)
2. Go to **Account** or **General**
3. Look for **"Mode"** or **"Environment"** setting
4. Select **"Test Mode"**

---

## 🔗 Direct Links

### **Test Mode Dashboard:**
https://dashboard.stripe.com/test

### **Live Mode Dashboard:**
https://dashboard.stripe.com

### **API Keys (Test Mode):**
https://dashboard.stripe.com/test/apikeys

### **API Keys (Live Mode):**
https://dashboard.stripe.com/apikeys

---

## ✅ How to Verify You're in Test Mode

### **Visual Indicators:**

1. **Top Right Badge:**
   - ✅ Green "Test mode" badge = Test Mode
   - ❌ Red "Live mode" badge = Live Mode

2. **URL:**
   - ✅ Contains `/test` = Test Mode
   - ❌ No `/test` = Live Mode

3. **API Keys:**
   - ✅ Keys start with `pk_test_` and `sk_test_` = Test Mode
   - ❌ Keys start with `pk_live_` and `sk_live_` = Live Mode

4. **Data:**
   - ✅ Test transactions appear = Test Mode
   - ❌ Real transactions appear = Live Mode

---

## 🆘 If You Still Can't Find It

### **Possible Reasons:**

1. **Account Type:**
   - Some Stripe account types might have different interfaces
   - Try the direct URL: https://dashboard.stripe.com/test

2. **Permissions:**
   - You might not have permission to switch modes
   - Contact your Stripe account administrator

3. **Browser Issues:**
   - Try a different browser
   - Clear cache and cookies
   - Try incognito/private mode

4. **Account Status:**
   - New accounts might need to complete setup first
   - Check if your account is fully activated

---

## 🎯 Quick Action Steps

**If you can't find the toggle, try this:**

1. **Go directly to Test Mode:**
   ```
   https://dashboard.stripe.com/test
   ```

2. **Check the URL:**
   - If it shows `/test` → You're in Test Mode ✅
   - If it doesn't → You're in Live Mode ❌

3. **Get Test API Keys:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the **Secret key** (starts with `sk_test_...`)

4. **Update Supabase:**
   - Go to Supabase Dashboard → Settings → Edge Functions → Secrets
   - Update `STRIPE_SECRET_KEY` with test key

---

## 📸 What It Looks Like

### **In Live Mode:**
- Badge: "Live mode" (usually red/orange)
- URL: `dashboard.stripe.com` (no `/test`)
- Keys: `pk_live_...` and `sk_live_...`

### **In Test Mode:**
- Badge: "Test mode" (usually green)
- URL: `dashboard.stripe.com/test` (has `/test`)
- Keys: `pk_test_...` and `sk_test_...`

---

## 💡 Pro Tip

**Easiest Way:**
1. Just go to: https://dashboard.stripe.com/test
2. This automatically puts you in Test Mode
3. No toggle needed!

---

## ✅ After Switching to Test Mode

1. **Verify you're in Test Mode:**
   - See green "Test mode" badge
   - URL contains `/test`

2. **Get Test API Keys:**
   - Go to: Developers → API keys
   - Copy Secret key (`sk_test_...`)

3. **Update Supabase Secret:**
   - Replace `STRIPE_SECRET_KEY` with test key

4. **Test Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Should work now!

---

## 🔗 Need Help?

- **Stripe Support:** https://support.stripe.com
- **Stripe Docs:** https://stripe.com/docs/testing
- **Test Mode Guide:** https://stripe.com/docs/keys

