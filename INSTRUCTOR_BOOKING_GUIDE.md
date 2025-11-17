# Instructor Booking & Practice Rooms - Access Guide

## 📍 Page Locations

All pages are located in: `src/pages/`

### Main Feature Pages:
- **Book Instructor**: `BookInstructor.tsx` → Route: `/book-instructor`
- **Practice Rooms**: `PracticeRooms.tsx` → Route: `/practice-rooms`
- **Become Instructor**: `BecomeInstructor.tsx` → Route: `/become-instructor`
- **Instructor Profile**: `InstructorProfile.tsx` → Route: `/instructor/:id`
- **My Bookings**: `MyBookings.tsx` → Route: `/my-bookings`
- **Instructor Dashboard**: `InstructorDashboard.tsx` → Route: `/instructor/dashboard`
- **Admin Dashboard**: `AdminInstructors.tsx` → Route: `/admin/instructors`

### Booking Flow Pages:
- **Booking Flow**: `BookingFlow.tsx` → Route: `/book-instructor/:id`
- **Booking Payment**: `BookingPayment.tsx` → Route: `/booking/:id/payment`
- **Booking Success**: `BookingSuccess.tsx` → Route: `/booking/:id/success`
- **Booking Details**: `BookingDetails.tsx` → Route: `/booking/:id`
- **Booking Review**: `BookingReview.tsx` → Route: `/booking/:id/review`

### Practice Room Pages:
- **Practice Room Details**: `PracticeRoomDetails.tsx` → Route: `/practice-room/:id`
- **Practice Room Payment**: `PracticeRoomPayment.tsx` → Route: `/practice-room/:id/payment`
- **Practice Room Success**: `PracticeRoomSuccess.tsx` → Route: `/practice-room/:id/success`

---

## 🚀 How to Access Features

### For Regular Users:

#### 1. **Book an Instructor**
   - **From Profile Page**: 
     - Go to Profile (bottom nav or `/profile`)
     - Click "Book Instructor" in the menu
   - **From Study Page**:
     - Go to Study tab (bottom nav or `/study`)
     - Click the "Book an Instructor" card
   - **Direct URL**: `/book-instructor`

#### 2. **Practice Rooms**
   - **From Profile Page**:
     - Go to Profile
     - Click "Practice Rooms" in the menu
   - **Direct URL**: `/practice-rooms`

#### 3. **My Bookings**
   - **From Profile Page**:
     - Go to Profile
     - Click "My Bookings" in the menu
   - **Direct URL**: `/my-bookings`

#### 4. **Become an Instructor**
   - **From Profile Page**:
     - Scroll down to find "Become an Instructor" option (if available)
   - **Direct URL**: `/become-instructor`

### For Instructors:

#### 1. **Instructor Dashboard**
   - **From Profile Page**:
     - If you're an approved instructor, you'll see "Instructor Dashboard" in the menu
   - **Direct URL**: `/instructor/dashboard`

### For Admins:

#### 1. **Admin Dashboard**
   - **Direct URL**: `/admin/instructors`
   - **Note**: You must have 'admin' role in the `user_roles` table
   - The route is protected - non-admins will be redirected

---

## ✅ All Functions Created

### Backend Functions (Supabase Edge Functions):
1. ✅ `create-booking-payment` - Creates Stripe checkout for bookings
2. ✅ `create-practice-room-payment` - Creates Stripe checkout for practice rooms
3. ✅ `stripe-webhook` - Handles payment confirmations (updated for practice rooms)
4. ✅ `create-video-session` - Creates Zoom/Google Meet links (ready for integration)

### Database Functions:
1. ✅ All tables created with migrations
2. ✅ RLS policies in place
3. ✅ Triggers for timestamps and participant counts

### Frontend Functions:
1. ✅ Instructor registration (`BecomeInstructor.tsx`)
2. ✅ Instructor search and filtering (`BookInstructor.tsx`)
3. ✅ Booking flow (`BookingFlow.tsx`)
4. ✅ Payment processing (`BookingPayment.tsx`, `PracticeRoomPayment.tsx`)
5. ✅ Practice room management (`PracticeRooms.tsx`)
6. ✅ Review system (`BookingReview.tsx`)
7. ✅ Admin approval system (`AdminInstructors.tsx`)

---

## 🔐 Admin Access Setup

### To Enable Admin Access:

1. **Get Your User ID**:
   - Sign in to your app
   - Open browser console (F12)
   - Run: `(await supabase.auth.getUser()).data.user.id`
   - Copy the UUID

2. **Add Admin Role**:
   - Go to Supabase Dashboard → SQL Editor
   - Run this SQL (replace with your user ID):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_ID_HERE', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

3. **Access Admin Dashboard**:
   - Navigate to: `/admin/instructors`
   - You should now see the instructor management interface

### Admin Features Available:
- ✅ View all instructor applications
- ✅ Filter by status (pending, approved, rejected, suspended)
- ✅ Approve instructors
- ✅ Reject instructors (with reason)
- ✅ Suspend instructors
- ✅ View instructor details and certifications
- ✅ Download certification documents

---

## 📱 Navigation Structure

### Bottom Navigation Bar:
- Home (`/`)
- Study (`/study`) - Contains "Book an Instructor" card
- Tests (`/tests`)
- AI Tutor (`/ai-chat`)
- Schedule (`/planner`)
- Profile (`/profile`) - Contains all booking-related links

### Profile Page Menu Items:
1. **Book Instructor** (highlighted)
2. **Practice Rooms** (highlighted)
3. **My Bookings**
4. **Instructor Dashboard** (only for approved instructors)
5. Account, Settings, etc.

---

## 🧪 Testing Checklist

### As a User:
- [ ] Can browse instructors at `/book-instructor`
- [ ] Can view instructor profiles
- [ ] Can book a session
- [ ] Can complete payment
- [ ] Can view bookings in "My Bookings"
- [ ] Can join practice rooms
- [ ] Can pay for practice room participation

### As an Instructor:
- [ ] Can register at `/become-instructor`
- [ ] Can view dashboard after approval
- [ ] Can manage availability
- [ ] Can view bookings

### As an Admin:
- [ ] Can access `/admin/instructors`
- [ ] Can view pending applications
- [ ] Can approve/reject instructors
- [ ] Can suspend instructors

---

## 🔗 Quick Access URLs

```
# User Features
/book-instructor              - Browse and search instructors
/practice-rooms              - Browse practice rooms
/my-bookings                 - View all bookings
/become-instructor           - Register as instructor

# Instructor Features
/instructor/dashboard        - Instructor management (requires approval)
/instructor/:id             - View instructor profile

# Admin Features
/admin/instructors           - Manage instructor applications (requires admin role)

# Booking Flow
/book-instructor/:id         - Book specific instructor
/booking/:id/payment         - Pay for booking
/booking/:id                - View booking details
/booking/:id/review          - Review instructor

# Practice Room Flow
/practice-room/:id           - View practice room details
/practice-room/:id/payment   - Pay for practice room
/practice-room/:id/success   - Payment success
```

---

## ⚠️ Important Notes

1. **Authentication Required**: Most features require login (except browsing instructors)
2. **Admin Access**: Must have 'admin' role in database
3. **Instructor Access**: Must be approved by admin first
4. **Payment**: Uses Stripe - ensure Stripe keys are configured
5. **Video Calls**: Zoom integration ready but needs API keys

---

## 🛠️ Missing/To-Do Items

1. **Notifications**: Email/in-app notifications for bookings (structure ready)
2. **Video Integration**: Zoom API keys need to be configured
3. **Practice Room Creation**: Instructors can't create rooms yet (only join)
4. **Instructor Availability Management**: UI exists but needs refinement

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify user roles in Supabase
3. Check Stripe webhook configuration
4. Ensure all migrations are applied

