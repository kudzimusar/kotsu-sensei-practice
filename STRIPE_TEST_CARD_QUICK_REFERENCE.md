# Stripe Test Card - Quick Reference

## 🧪 For Testing Payments (kudzimusar@gmail.com)

### **Standard Test Card (Recommended)**

Use this card for successful payments:

| Field | Value | Example |
|-------|-------|---------|
| **Card Number** | `4242 4242 4242 4242` | (Already filled) |
| **Expiry (MM/YY)** | Any future date | `12/25`, `01/26`, `06/30` |
| **CVC** | Any 3 digits | `123`, `456`, `999` |
| **Cardholder Name** | Any name | `Test User`, `John Doe`, `Your Name` |
| **Country** | Japan (or any) | Already selected |
| **ZIP/Postal Code** | Any valid code | `12345`, `100-0001` (for Japan) |

---

## ✅ Quick Test Values

**Copy & Paste These:**

```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
Cardholder Name: Test User
ZIP: 12345
```

**Or Use These:**

```
Card Number: 4242 4242 4242 4242
Expiry: 01/26
CVC: 456
Cardholder Name: John Doe
ZIP: 100-0001
```

---

## 📝 Important Notes

1. **Expiry Date**: Must be in the future
   - ✅ Valid: `12/25`, `01/26`, `12/30`
   - ❌ Invalid: `12/20`, `01/21` (past dates)

2. **CVC**: Any 3 digits work
   - ✅ Valid: `123`, `456`, `999`, `000`
   - ❌ Invalid: `12` (too short), `1234` (too long)

3. **Cardholder Name**: Can be anything
   - ✅ Valid: `Test User`, `John Doe`, `Your Name`, `ABC`
   - No restrictions for test cards

4. **ZIP Code**: Format depends on country
   - Japan: `100-0001` or `1000001`
   - US: `12345` (5 digits)
   - Any valid format works for testing

---

## 🎯 Testing Different Scenarios

### **Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVC: `123`
- Name: `Test User`

### **3D Secure Authentication:**
- Card: `4000 0025 0000 3155`
- Expiry: `12/25`
- CVC: `123`
- Name: `Test User`
- **Note**: Will prompt for additional authentication

### **Declined Payment (Test Error Handling):**
- Card: `4000 0000 0000 0002`
- Expiry: `12/25`
- CVC: `123`
- Name: `Test User`
- **Note**: Will be declined

---

## 🔍 What You're Testing

After entering these details and clicking "Subscribe":

1. **Check Price**: Should show correct amount (¥980, not ¥98,000)
2. **7-Day Trial**: Should start immediately
3. **No Charge**: No money charged during trial
4. **Stripe Dashboard**: Check test payments in Stripe Dashboard

---

## ⚠️ Remember

- **Test Mode Only**: These cards only work in Stripe Test Mode
- **No Real Charges**: No real money is charged
- **Test Data**: All transactions are test data
- **Switch to Live**: Use real cards only in Live Mode

---

## 🚀 Quick Start

1. **Card Number**: `4242 4242 4242 4242` (already filled)
2. **Expiry**: Enter `12/25` (or any future date)
3. **CVC**: Enter `123` (or any 3 digits)
4. **Name**: Enter `Test User` (or any name)
5. **Click**: "Subscribe"
6. **Verify**: Check that price is correct (¥980/month)

That's it! The payment should process successfully in test mode.


