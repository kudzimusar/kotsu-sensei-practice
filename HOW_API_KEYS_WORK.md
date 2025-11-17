# How API Keys Work in This Project

## 🔐 The Key Point: Keys Are NOT in Code

The API keys are **NOT stored in your code or GitHub**. They're stored securely in **Supabase's secret management system** and injected at runtime.

---

## 📁 Where Keys Actually Are

### ✅ Real Keys (Working Now)
**Location:** Supabase Dashboard → Settings → Edge Functions → Secrets

```
STRIPE_SECRET_KEY = sk_live_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Status:** ✅ Already configured and working!

### ❌ NOT in Code Files
**Location:** `supabase/functions/create-checkout-session/index.ts`

```typescript
// ✅ CORRECT - Reads from environment variable
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});
```

**What this does:**
- `Deno.env.get("STRIPE_SECRET_KEY")` reads from Supabase secrets
- Supabase automatically injects the real key at runtime
- No hardcoded keys in code!

### 📝 Placeholders Only in Documentation
**Location:** Documentation files (`.md` files)

```markdown
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
```

**Why:** 
- These are just instructions for other developers
- They show WHERE to put keys, not the actual keys
- Safe to commit to GitHub

---

## 🔄 How It Works at Runtime

### Step-by-Step Flow:

1. **You deploy Edge Function to Supabase**
   ```bash
   supabase functions deploy create-checkout-session
   ```

2. **Supabase reads your code:**
   ```typescript
   Deno.env.get("STRIPE_SECRET_KEY")  // Code asks for the key
   ```

3. **Supabase looks up the secret:**
   - Checks: Settings → Edge Functions → Secrets
   - Finds: `STRIPE_SECRET_KEY = sk_live_YOUR_KEY...`
   - Injects: The real key into the environment

4. **Edge Function runs with real key:**
   ```typescript
   // At runtime, this becomes:
   const stripe = new Stripe("sk_live_YOUR_KEY...", { ... });
   ```

5. **Payment works!** ✅

---

## 🎯 Why This Approach?

### ✅ Security Benefits:
- **Keys never in code** → Can't be accidentally committed
- **Keys never in GitHub** → Can't be stolen from repo
- **Keys in secure storage** → Only accessible to authorized users
- **Easy to rotate** → Change in Supabase, no code changes needed

### ✅ Practical Benefits:
- **Code is portable** → Works in dev/staging/prod with different keys
- **Team-friendly** → Each developer uses their own test keys
- **No secrets in git history** → Even if you commit by mistake, keys aren't there

---

## 📊 Current Status

### What's Working Right Now:

| Component | Location | Status |
|-----------|----------|--------|
| **Real API Keys** | Supabase Secrets | ✅ Configured |
| **Code** | Edge Functions | ✅ Uses `Deno.env.get()` |
| **Documentation** | `.md` files | ✅ Has placeholders |
| **GitHub** | Repository | ✅ No secrets committed |
| **Payment System** | Live | ✅ Working! |

---

## 🧪 How to Verify It's Working

### Test 1: Check Supabase Secrets
```bash
supabase secrets list --project-ref ndulrvfwcqyvutcviebk
```
**Expected:** See `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` listed

### Test 2: Check Code
```bash
grep -r "sk_live_" supabase/functions/
```
**Expected:** No results (keys not in code)

### Test 3: Test Payment
1. Go to `/payment` page
2. Select a plan
3. Try to checkout
4. **Expected:** Works! (because Supabase injects the real key)

---

## 🔑 If You Need to Add Keys

### For New Developers:

1. **Get your Stripe keys** from Stripe Dashboard
2. **Add to Supabase:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY --project-ref ndulrvfwcqyvutcviebk
   ```
3. **Code automatically uses them** - no code changes needed!

### For Production:

1. Use production Stripe keys
2. Add to production Supabase project
3. Deploy same code
4. Works automatically!

---

## ❓ Common Questions

### Q: "But the docs say to use placeholders?"
**A:** Yes! The docs are instructions. You put REAL keys in Supabase, not in the docs.

### Q: "How does the code know which key to use?"
**A:** Supabase automatically injects keys from its secret storage into `Deno.env` at runtime.

### Q: "What if I commit the code to GitHub?"
**A:** Perfect! The code is safe because it doesn't contain keys - only references to environment variables.

### Q: "Can someone steal my keys from GitHub?"
**A:** No! The keys are only in Supabase secrets, not in the code or GitHub.

---

## ✅ Summary

**The app works because:**
1. ✅ Real keys are in Supabase secrets (configured)
2. ✅ Code reads from environment variables (secure)
3. ✅ Supabase injects keys at runtime (automatic)
4. ✅ Documentation has placeholders (safe to commit)
5. ✅ GitHub has no secrets (secure)

**Your payment system is working right now** because the keys are properly configured in Supabase! 🎉


