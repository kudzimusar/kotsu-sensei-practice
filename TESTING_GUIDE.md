# 🧪 Monetization System - Complete Testing Guide

## 📋 Pre-Testing Checklist

Before starting, ensure:
- ✅ You're logged into the app
- ✅ You have a test Stripe account (test mode)
- ✅ The app is running (development or production)
- ✅ Browser console is open (F12) to see any errors

---

## 🎯 Test 1: Payment Flow (Core Functionality)

### Step 1: Navigate to Payment Page
1. Open the app in your browser
2. Click on **Profile** (bottom navigation or menu)
3. Look for **"Upgrade"** or **"Premium"** button
4. Click it to navigate to `/payment` page

**Expected Result:**
- ✅ Payment page loads showing plan options (Monthly, Quarterly, Annual, Lifetime)
- ✅ Plans show prices in JPY (¥980, ¥1,500, etc.)
- ✅ Features list is visible for each plan

### Step 2: Select a Plan
1. Choose **"Quarterly"** plan (recommended for testing - has trial period)
2. Click the **"Select Plan"** or **"Subscribe"** button

**Expected Result:**
- ✅ Button shows loading state
- ✅ Redirects to Stripe Checkout page
- ✅ No errors in console

### Step 3: Complete Test Payment
1. On Stripe Checkout page, use test card: **`4242 4242 4242 4242`**
2. Enter any future expiry date (e.g., `12/25`)
3. Enter any 3-digit CVC (e.g., `123`)
4. Enter any ZIP code (e.g., `12345`)
5. Click **"Pay"** or **"Subscribe"**

**Expected Result:**
- ✅ Payment processes successfully
- ✅ Redirects back to `/payment/success` page
- ✅ No errors

### Step 4: Verify Payment Success Page
1. You should see the Payment Success page
2. Check for:
   - ✅ "Payment Successful" message
   - ✅ Plan type displayed (e.g., "Premium Quarterly Plan")
   - ✅ Subscription details (trial period, next payment date)
   - ✅ "Welcome to Premium! 🎉" toast notification (appears once)

**Expected Result:**
- ✅ Page shows subscription confirmation
- ✅ Countdown timer (15 seconds) before auto-redirect
- ✅ "Refresh Status" button is visible

### Step 5: Wait for Subscription Creation
1. The page will poll for subscription creation (up to 10 seconds)
2. Watch the console for logs:
   - `🔄 Polling for subscription...`
   - `✅ Subscription found!`

**Expected Result:**
- ✅ Subscription appears in database within 10 seconds
- ✅ Status changes from "Verifying..." to "Active"
- ✅ Auto-redirect countdown starts

---

## 🎯 Test 2: Verify Subscription in Database

### Step 1: Check Supabase Database
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ndulrvfwcqyvutcviebk/editor
2. Navigate to **Table Editor** → **subscriptions** table
3. Find your user's subscription record

**Expected Result:**
- ✅ New subscription record exists
- ✅ `status` = `"trialing"` or `"active"`
- ✅ `plan_type` = `"quarterly"` (or the plan you selected)
- ✅ `stripe_subscription_id` is populated
- ✅ `stripe_customer_id` is populated
- ✅ `trial_start` and `trial_end` dates are set (if quarterly plan)

### Step 2: Check Profile Table
1. Go to **profiles** table
2. Find your user record
3. Check the `is_premium` column

**Expected Result:**
- ✅ `is_premium` = `true`
- ✅ This should update automatically via trigger

---

## 🎯 Test 3: Verify Premium Status on Frontend

### Step 1: Check Profile Page
1. Navigate to **Profile** page (`/profile`)
2. Look for premium indicators:
   - ✅ **"Premium"** badge or crown icon
   - ✅ Subscription status shows "Premium Quarterly Plan" or similar
   - ✅ "Manage" button instead of "Upgrade" button

**Expected Result:**
- ✅ Premium status is visible
- ✅ No "Upgrade" button (should show "Manage")
- ✅ Subscription details are displayed

### Step 2: Check Account Page
1. Navigate to **Account** page (`/account`)
2. Verify:
   - ✅ Subscription section shows active subscription
   - ✅ Plan type, status, and dates are displayed
   - ✅ "Manage Payment" button is visible
   - ✅ Billing history section is visible

**Expected Result:**
- ✅ All subscription details are correct
- ✅ Trial period information is shown (if applicable)
- ✅ Next payment date is displayed

---

## 🎯 Test 4: Test Premium Features

### Test 4a: AI Question Generation (Free Tier Limit)
1. If you have a free account (not premium), test the limit:
2. Navigate to **Question Generator** page
3. Try to generate questions
4. Generate 10 questions (free tier limit)

**Expected Result:**
- ✅ First 10 questions generate successfully
- ✅ After 10 questions, shows paywall or error message
- ✅ Message: "You've reached your daily limit of 10 questions"

### Test 4b: AI Question Generation (Premium - Unlimited)
1. With your premium account, navigate to **Question Generator**
2. Generate multiple sets of questions (more than 10)

**Expected Result:**
- ✅ Can generate unlimited questions
- ✅ No limit warnings
- ✅ All questions generate successfully

### Test 4c: PDF Export (Premium Only)
1. Navigate to a page with PDF export feature
2. Try to export content as PDF

**Expected Result:**
- ✅ PDF export works (if premium)
- ✅ Shows paywall if not premium

---

## 🎯 Test 5: Account Management

### Step 1: Test "Manage Payment" Button
1. Go to **Account** page
2. Click **"Manage Payment"** button
3. Wait for redirect

**Expected Result:**
- ✅ Redirects to Stripe Customer Portal
- ✅ Can see subscription details
- ✅ Can update payment method
- ✅ Can cancel subscription (if needed)

### Step 2: Test Billing History
1. On **Account** page, scroll to **"Billing History"** section
2. Check if invoices are displayed

**Expected Result:**
- ✅ Billing history loads (may be empty for new subscriptions)
- ✅ If invoices exist, they're displayed with:
   - Invoice ID
   - Amount
   - Date
   - Download link (if available)

---

## 🎯 Test 6: Webhook Verification

### Step 1: Check Stripe Dashboard
1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Find your webhook endpoint: `stripe-webhook`
3. Click on it to see event deliveries

**Expected Result:**
- ✅ Recent events show:
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `invoice.payment_succeeded` ✅

### Step 2: Check Supabase Edge Function Logs
1. Go to Supabase Dashboard → **Edge Functions** → **stripe-webhook**
2. Check **Logs** tab
3. Look for recent executions

**Expected Result:**
- ✅ Webhook function executed successfully
- ✅ Logs show subscription creation
- ✅ No errors in logs

---

## 🎯 Test 7: Edge Cases

### Test 7a: Duplicate Subscription Prevention
1. Try to create another subscription while one is active:
   - Go to Payment page
   - Try to select a plan again

**Expected Result:**
- ✅ Should show message: "You already have an active subscription"
- ✅ Should redirect to Account page
- ✅ Prevents duplicate subscriptions

### Test 7b: Test Subscription Status Update
1. In Stripe Dashboard, manually change subscription status
2. Wait a few seconds
3. Refresh the app

**Expected Result:**
- ✅ App reflects the updated status
- ✅ Premium status updates accordingly

### Test 7c: Trial Period Display
1. If on quarterly plan, check trial period:
   - Account page should show "7-Day Free Trial Active"
   - Should show trial end date
   - Should show first charge date (after trial)

**Expected Result:**
- ✅ Trial information is displayed correctly
- ✅ Dates are accurate

---

## 🐛 Troubleshooting Common Issues

### Issue: Subscription not appearing in database
**Solution:**
- Check Stripe webhook logs
- Verify webhook endpoint is configured
- Check Edge Function logs in Supabase

### Issue: `is_premium` not updating
**Solution:**
- Check database trigger: `trigger_update_profile_premium_status`
- Manually run: `UPDATE profiles SET is_premium = true WHERE id = 'your-user-id'`
- Refresh React Query cache

### Issue: "Manage Payment" button not working
**Solution:**
- Check if `stripe_customer_id` exists in subscription
- Verify Edge Function `create-customer-portal-session` is deployed
- Check browser console for errors

### Issue: Billing history not loading
**Solution:**
- Verify `stripe_customer_id` is set
- Check Edge Function `get-billing-history` logs
- Ensure customer has invoices in Stripe

---

## ✅ Success Criteria

Your monetization system is working correctly if:

1. ✅ Payment flow completes successfully
2. ✅ Subscription appears in database within 10 seconds
3. ✅ `is_premium` flag updates to `true`
4. ✅ Profile page shows Premium badge
5. ✅ Account page shows subscription details
6. ✅ Premium features are accessible
7. ✅ Free tier limits are enforced
8. ✅ "Manage Payment" opens Stripe portal
9. ✅ Webhook events are received
10. ✅ No duplicate subscriptions can be created

---

## 📝 Testing Checklist

Print this checklist and check off as you test:

- [ ] Payment page loads correctly
- [ ] Can select a plan
- [ ] Stripe checkout redirects work
- [ ] Test payment completes successfully
- [ ] Payment success page displays
- [ ] Subscription appears in database
- [ ] `is_premium` updates to `true`
- [ ] Profile page shows Premium status
- [ ] Account page shows subscription
- [ ] AI questions work (premium unlimited)
- [ ] Free tier limits enforced
- [ ] "Manage Payment" button works
- [ ] Billing history loads
- [ ] Webhook events received
- [ ] Duplicate subscription prevented

---

**Ready to start testing?** Begin with Test 1 and work through each test systematically! 🚀



