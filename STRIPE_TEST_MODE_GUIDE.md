# Stripe Test Mode Guide

## 🧪 Testing Payments with Stripe Test Mode

### **How to Enable Test Mode:**

1. **Check Your Stripe Account:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Look for the toggle in the top right: "Test mode" / "Live mode"
   - Switch to **Test mode** for testing

2. **Verify Test Mode Keys:**
   - In Stripe Dashboard → Developers → API keys
   - Make sure you're using **Test mode** keys (start with `pk_test_` and `sk_test_`)
   - Update Supabase secrets with test keys if needed

3. **Test Mode vs Live Mode:**
   - **Test Mode**: No real charges, use test card numbers
   - **Live Mode**: Real charges, use real card numbers
   - Switch between modes in Stripe Dashboard

---

## 💳 Test Card Numbers

### **For kudzimusar@gmail.com Testing:**

Use these **Stripe test card numbers** in Test Mode:

#### **Successful Payment:**
- **Card Number**: `4242 4242 4242 4242`
- **Expiry (MM/YY)**: Any future date (e.g., `12/25`, `01/26`, `12/30`)
- **CVC**: Any 3 digits (e.g., `123`, `456`, `999`)
- **Cardholder Name**: Any name (e.g., `Test User`, `John Doe`, `Your Name`)
- **ZIP/Postal Code**: Any 5 digits (e.g., `12345`, `10000`) - Optional for some countries

#### **Requires Authentication (3D Secure):**
- **Card Number**: `4000 0025 0000 3155`
- **Expiry (MM/YY)**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Cardholder Name**: Any name
- **ZIP**: Any 5 digits
- **Note**: Will prompt for authentication

#### **Declined Card:**
- **Card Number**: `4000 0000 0000 0002`
- **Expiry (MM/YY)**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Cardholder Name**: Any name
- **ZIP**: Any 5 digits
- **Note**: Will be declined for testing error handling

#### **Insufficient Funds:**
- **Card Number**: `4000 0000 0000 9995`
- **Expiry (MM/YY)**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Cardholder Name**: Any name
- **ZIP**: Any 5 digits

---

## 🇯🇵 Japan-Specific Test Cards

### **JCB (Japan Credit Bureau):**
- **Card Number**: `3530 1113 3330 0000`
- **Expiry (MM/YY)**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Cardholder Name**: Any name
- **ZIP**: Any 5 digits (e.g., `100-0001` for Japan)

### **PayPay Test:**
- PayPay requires a Japan Stripe account
- Test in Stripe Dashboard → Payment methods
- Use test mode to verify PayPay integration

---

## 🧪 Testing Subscription Flow

### **Step-by-Step Test Process:**

1. **Enable Test Mode in Stripe Dashboard**
2. **Use Test Card**: `4242 4242 4242 4242`
3. **Complete Checkout:**
   - Select plan (Monthly/Quarterly/Annual/9-Month)
   - Enter test card details
   - Complete payment
4. **Verify:**
   - Check Stripe Dashboard → Customers → Subscriptions
   - Verify subscription created with 7-day trial
   - Check webhook events in Stripe Dashboard
5. **Test Trial Cancellation:**
   - Go to Account page
   - Click "Manage Subscription"
   - Cancel subscription
   - Verify no charge

---

## 🔍 Verifying Test Mode

### **Check if Test Mode is Active:**

1. **Stripe Dashboard:**
   - Top right corner shows "Test mode" badge
   - API keys start with `pk_test_` and `sk_test_`

2. **Supabase Secrets:**
   - Check `STRIPE_SECRET_KEY` in Supabase
   - Should start with `sk_test_` for test mode
   - Should start with `sk_live_` for live mode

3. **Test Transactions:**
   - All test transactions appear in Stripe Dashboard → Payments (Test mode)
   - No real money is charged
   - Can be deleted/reset anytime

---

## ⚠️ Important Notes

- **Test cards only work in Test Mode**
- **Real cards only work in Live Mode**
- **Never use real card numbers in Test Mode**
- **Never use test card numbers in Live Mode**
- **Switch to Live Mode only when ready for production**

---

## 📝 Test Mode Checklist

- [ ] Stripe Dashboard set to Test Mode
- [ ] Using test API keys (`sk_test_...`)
- [ ] Test keys added to Supabase secrets
- [ ] Using test card numbers
- [ ] Verifying test transactions in Stripe Dashboard
- [ ] Testing all payment methods (Card, PayPal, PayPay)
- [ ] Testing trial cancellation
- [ ] Testing subscription renewal

---

## 🔗 Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Test Mode Guide](https://stripe.com/docs/keys)
- [Stripe Dashboard](https://dashboard.stripe.com/test)

