# Upgrade vs Subscription/Billing - User Flow Guide

## Overview

This document clarifies the difference between **Upgrade** (for free users) and **Subscription/Billing** (for premium users) processes.

---

## 🔄 Upgrade Process (Free → Premium)

### **Who:** Users on the **Free Plan**

### **Purpose:** Convert from free tier to premium subscription

### **User Journey:**

1. **Entry Points:**
   - Profile page → "Upgrade" button
   - Premium feature gates → "Unlock this feature" buttons
   - Paywall components → "Upgrade to Premium" buttons
   - Shop & Earn page → "Upgrade to Premium" button

2. **Flow:**
   ```
   User clicks "Upgrade"
   ↓
   Navigate to /payment
   ↓
   If NOT logged in:
     → Redirect to /auth with return URL
     → User logs in/signs up
     → Redirect back to /payment
   ↓
   Payment page loads
   ↓
   User selects subscription plan:
     - Monthly ($9.99/month)
     - Quarterly ($24.99/quarter - Save 17%)
     - Annual ($79.99/year - Save 33%)
     - Lifetime ($199.99 - One-time payment)
   ↓
   User selects payment method:
     - Credit/Debit Card
     - PayPal
     - PayPay (Japan)
     - Konbini (Japan, lifetime only)
   ↓
   User clicks "Subscribe"
   ↓
   Stripe Checkout opens
   ↓
   User completes payment
   ↓
   Redirect to /payment/success
   ↓
   Webhook updates subscription status
   ↓
   User becomes Premium
   ```

3. **Features:**
   - Shows all available plans
   - Allows plan selection
   - Payment method selection
   - Stripe Checkout integration
   - Success confirmation

---

## 💳 Subscription/Billing Management (Premium Users)

### **Who:** Users with **Active Premium Subscription**

### **Purpose:** Manage existing subscription, billing, and payment methods

### **User Journey:**

1. **Entry Points:**
   - Profile page → "Manage" button (when premium)
   - Settings dialog → "Account" section → "Manage" button
   - Account page → Direct navigation

2. **Flow:**
   ```
   User clicks "Manage" (on Profile or Settings)
   ↓
   Navigate to /account
   ↓
   Account page displays:
     - Current subscription plan
     - Subscription status (Active/Canceled/etc.)
     - Renewal date
     - Billing history (invoices)
   ↓
   User can:
     - Click "Manage Subscription" → Opens Stripe Customer Portal
       → Can cancel subscription
       → Can update payment method
       → Can view billing history
       → Can update billing address
     - Click "Upgrade/Change Plan" → Navigate to /payment
       → Can switch to different plan
       → Can upgrade from monthly to annual (save money)
   ```

3. **Features:**
   - View current subscription details
   - Access Stripe Customer Portal for management
   - View billing history (invoices)
   - Download invoice PDFs
   - Change subscription plan
   - Cancel subscription
   - Update payment method

---

## 🔑 Key Differences

| Aspect | Upgrade | Subscription/Billing |
|--------|---------|---------------------|
| **Target Users** | Free plan users | Premium users |
| **Primary Action** | Subscribe to premium | Manage existing subscription |
| **Page** | `/payment` | `/account` |
| **Button Label** | "Upgrade" | "Manage" |
| **Main Purpose** | New subscription | Subscription management |
| **Payment Flow** | Full checkout process | Stripe Customer Portal |
| **Plan Selection** | Yes (all plans shown) | Yes (change plan option) |
| **Billing History** | No | Yes (invoices) |
| **Cancel Subscription** | No | Yes (via portal) |

---

## 📍 Navigation Logic

### Profile Page Button Logic:
```typescript
onClick={() => navigate(isPremium ? "/account" : "/payment")}
```

- **Free users** → "Upgrade" button → `/payment`
- **Premium users** → "Manage" button → `/account`

### Settings Dialog:
- Shows subscription status summary
- "Manage" button → `/account` (for premium users)
- "Upgrade" button → `/payment` (for free users)

---

## 🔄 State Transitions

### Free User → Premium:
1. User on free plan
2. Clicks "Upgrade" → `/payment`
3. Completes checkout
4. Webhook updates subscription
5. `isPremium` becomes `true`
6. Button changes from "Upgrade" to "Manage"
7. Navigation changes from `/payment` to `/account`

### Premium User → Free (Cancellation):
1. User on premium plan
2. Clicks "Manage" → `/account`
3. Clicks "Manage Subscription" → Stripe Portal
4. Cancels subscription
5. Webhook updates subscription status
6. Subscription continues until period end
7. After period end, `isPremium` becomes `false`
8. Button changes back to "Upgrade"

---

## 🎯 Best Practices

1. **Always check subscription status** before showing upgrade/manage options
2. **Use `usePremium()` hook** to get current subscription state
3. **Show appropriate messaging** based on user's current plan
4. **Handle edge cases:**
   - User with canceled subscription (still premium until period end)
   - User with past_due subscription
   - User with trial subscription

---

## 📝 Code References

- **Upgrade Flow:** `src/pages/Payment.tsx`
- **Billing Management:** `src/pages/Account.tsx`
- **Profile Button:** `src/pages/Profile.tsx` (line 229)
- **Premium Hook:** `src/hooks/usePremium.tsx`
- **Protected Routes:** `src/components/ProtectedRoute.tsx`



