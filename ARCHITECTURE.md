# icandrive — Architecture & AI Scalability Manual
> **Platform Overview:** On-demand driving lesson marketplace for Vadodara (Baroda), Gujarat, India.
> **Target Audience:** Learners (students), Certified Driving School Owners & Instructors, and Platform Super Administrators.
> **AI Companion Compatibility:** Fully structured for expansion by **Codex**, **Kiro AI**, **Cursor**, **Claude Code**, or human engineering teams.

---

## 1. Bifurcated Platform Views

The application implements strict three-way domain bifurcation across UI layouts, routing guards, and business operations:

```
                          ┌───────────────────────────┐
                          │   PortalSwitchBar.tsx     │
                          │   (Global Role Switcher)  │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   Learner Portal    │      │  School Partner Hub │      │ Super Admin Console │
│   (LearnerLayout)   │      │   (SchoolLayout)    │      │    (AdminLayout)    │
│  Path: / , /bookings│      │    Path: /school    │      │    Path: /admin     │
│  Theme: Blue #1D4ED8│      │   Theme: Emerald    │      │   Theme: Indigo     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

### 1.1 Learner Marketplace Portal (`/`, `/school-detail/:id`, `/checkout/:id`, `/bookings`, `/profile`)
- **Primary Persona:** Pooja Patel (Demo Learner, `user_learner_pooja`)
- **Key Capabilities:**
  - Search 8 Vadodara areas (Alkapuri, Manjalpur, Gotri, Karelibaug, Makarpura, Waghodia Road, Akota, Fatehgunj).
  - Filter by dual-control car (manual/automatic) and two-wheeler (scooter).
  - Slot selection with real-time overlap exclusion (prevents double-booking).
  - 10-minute hold lock (`pending_payment`) countdown timer.
  - Simulated UPI checkout (GPay, PhonePe, Paytm, QR).
  - Booking success with `.ics` calendar file download and share receipt.
  - 6-hour cancellation refund policy (100% refund if > 6h, 50% if < 6h).
  - Syllabus mastery tracker (Clutch control, Reverse parking, Night driving, Highway).

### 1.2 Driving School Owner Portal (`/school/*`)
- **Primary Persona:** Ketan Trivedi, Sayaji Motor Driving School (`user_school_sayaji`)
- **Key Capabilities:**
  - **Today's Itinerary:** Instant status update (Start Lesson, Mark Completed, No-Show).
  - **Fleet Management:** Add/manage dual-control manual cars, automatic sedans, and scooters.
  - **Certified Instructors:** Manage male/female instructors and phone contacts.
  - **Availability Rules & Time-Off:** Set weekly operating hours and block vacation/car servicing days.
  - **Earnings & Payouts:** Real-time net payout calculator after 15% marketplace commission.
  - **Review Management:** Read and reply to student reviews.

### 1.3 Super Admin Operations Console (`/admin/*`)
- **Primary Persona:** Harsh Shah, icandrive Central Operations (`user_admin_harsh`)
- **Key Capabilities:**
  - **Marketplace Analytics:** Total Gross Merchandise Value (GMV), net platform commissions, cancellation rate, and daily booking volume trends.
  - **School Approvals:** RTO license audit (`GJ-06-...`), verification status toggle, partner onboarding.
  - **All Bookings Directory:** Global search and audit trail across all 8 academies.
  - **Refunds Queue:** Instant 1-click UPI refund settlement for cancelled lessons.
  - **Commission Settings:** Customize take rates per driving academy (default 15%).
  - **Review Moderation:** Flag fake or abusive student reviews.
  - **User Registry:** Complete directory of registered learners and school partners.

---

## 2. Directory Structure

```
icandrive/
├── ARCHITECTURE.md                 <-- You are here
├── README.md                       <-- Setup and run instructions
├── index.html                      <-- Entry HTML with Plus Jakarta Sans & PWA tags
├── src/
│   ├── App.tsx                     <-- Bifurcated layout routing & role guards
│   ├── main.tsx                    <-- React 19 root bootstrap
│   ├── index.css                   <-- Tailwind CSS v4 design tokens
│   │
│   ├── layouts/                    <-- 3 Bifurcated View Wrappers
│   │   ├── PortalSwitchBar.tsx     <-- 1-tap view switcher & persona sync
│   │   ├── LearnerLayout.tsx       <-- Blue theme learner shell + bottom nav
│   │   ├── SchoolLayout.tsx        <-- Emerald theme school partner shell
│   │   └── AdminLayout.tsx         <-- Indigo theme central ops shell
│   │
│   ├── components/
│   │   ├── common/                 <-- Reusable UI elements (Badge, Modal, Toast)
│   │   ├── illustrations/          <-- Vector SVG covers, avatars & vehicles
│   │   └── learner/                <-- SlotPicker, SchoolCard, ReviewModal
│   │
│   ├── pages/
│   │   ├── learner/                <-- Home, SchoolDetail, Checkout, Success, Bookings
│   │   ├── school/                 <-- SchoolDashboardPage (10 tabs)
│   │   ├── admin/                  <-- AdminDashboardPage (7 tabs)
│   │   └── auth/                   <-- LoginPage with demo OTP 123456
│   │
│   ├── services/                   <-- Modular data layer (LocalStorage -> Supabase)
│   │   ├── config.ts               <-- APP_CONFIG & backend switch
│   │   ├── storage.ts              <-- LocalStorage abstraction
│   │   ├── authService.ts          <-- User login, profiles, persona switching
│   │   ├── schoolService.ts        <-- School queries, instructors, vehicles, packages
│   │   ├── bookingService.ts       <-- Slot generation, holds, checkout, cancellations
│   │   ├── analyticsService.ts     <-- Marketplace GMV & school stats
│   │   └── reviewService.ts        <-- Reviews and moderation
│   │
│   ├── types/
│   │   ├── index.ts                <-- Core application domain types
│   │   └── database.types.ts       <-- PostgreSQL & Supabase schema definitions
│   │
│   ├── hooks/                      <-- useAuth, useI18n, useDarkMode
│   ├── i18n/                       <-- en.json, hi.json, gu.json
│   └── data/                       <-- seedData.ts (Vadodara schools & bookings)
```

---

## 3. Database Schema (PostgreSQL / Supabase DDL)

When scaling to Supabase or Cloud SQL, execute this SQL migration:

```sql
-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('learner', 'school_admin', 'admin')),
  language_pref TEXT NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'hi', 'gu')),
  learner_license_no TEXT,
  school_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SCHOOLS
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  rto_license_no TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('approved', 'pending_approval', 'rejected')),
  rating NUMERIC(2,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  commission_rate NUMERIC(4,2) DEFAULT 15.0,
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  facilities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INSTRUCTORS
CREATE TABLE public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  phone TEXT NOT NULL,
  experience_years INT DEFAULT 1,
  rating NUMERIC(2,1) DEFAULT 5.0,
  photo_url TEXT,
  languages TEXT[] DEFAULT '{"en", "gu"}',
  is_active BOOLEAN DEFAULT true,
  bio TEXT
);

-- 4. VEHICLES
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car_manual', 'car_automatic', 'two_wheeler')),
  reg_no TEXT NOT NULL,
  model_year INT DEFAULT 2024,
  is_dual_control BOOLEAN DEFAULT true,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 5. PACKAGES
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car_manual', 'car_automatic', 'two_wheeler')),
  lesson_count INT NOT NULL DEFAULT 10,
  duration_minutes INT NOT NULL DEFAULT 45,
  price_inr NUMERIC(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 6. BOOKINGS (with double-booking exclusion logic)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT UNIQUE NOT NULL,
  learner_id UUID REFERENCES public.profiles(id),
  learner_name TEXT NOT NULL,
  learner_phone TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  instructor_id UUID REFERENCES public.instructors(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  package_id UUID REFERENCES public.packages(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('pending_payment', 'confirmed', 'completed', 'cancelled_by_learner', 'cancelled_by_school', 'no_show')
  ),
  hold_expires_at TIMESTAMPTZ NOT NULL,
  amount_inr NUMERIC(10,2) NOT NULL,
  pickup_from_home BOOLEAN DEFAULT false,
  pickup_address TEXT,
  cancellation_reason TEXT,
  refund_amount_inr NUMERIC(10,2),
  refund_status TEXT CHECK (refund_status IN ('none', 'pending', 'processed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id),
  school_id UUID REFERENCES public.schools(id),
  learner_id UUID REFERENCES public.profiles(id),
  learner_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  school_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. How Codex / Kiro AI Can Scale This App

### Recipe 1: Swapping LocalStorage for Supabase Client
1. Install `@supabase/supabase-js`:
   ```bash
   npm install @supabase/supabase-js
   ```
2. In `src/services/config.ts`, set `USE_MOCK_STORAGE: false` and supply `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`.
3. In `src/services/supabaseClient.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';
   import { Database } from '../types/database.types';
   import { APP_CONFIG } from './config';

   export const supabase = createClient<Database>(
     APP_CONFIG.SUPABASE_URL,
     APP_CONFIG.SUPABASE_ANON_KEY
   );
   ```
4. Each service in `src/services/*.ts` already contains comment markers detailing the exact Supabase query to swap in.

### Recipe 2: Integrating Razorpay / Cashfree UPI Payments
1. In `src/pages/learner/CheckoutPage.tsx`, replace the simulated UPI modal with the Razorpay Standard Checkout SDK:
   ```ts
   const options = {
     key: APP_CONFIG.RAZORPAY_KEY_ID,
     amount: booking.amount_inr * 100, // paise
     currency: 'INR',
     name: 'icandrive Vadodara',
     description: `Driving Lesson: ${booking.booking_code}`,
     handler: async function (response: any) {
       await BookingService.confirmPayment(booking.id, response.razorpay_payment_id);
       navigate(`/booking-success/${booking.id}`);
     },
     prefill: {
       contact: user.phone,
       name: user.full_name,
     },
   };
   const rzp = new (window as any).Razorpay(options);
   rzp.open();
   ```

### Recipe 3: Automated WhatsApp / SMS Lesson Alerts
1. Create a server endpoint or Edge Function `supabase/functions/send-sms/index.ts`.
2. When `BookingService.createBooking` confirms, post payload to Gupshup / Twilio:
   - Message: `"Namaste [Learner], your driving lesson with [School] is scheduled for [Date & Time]. Your instructor is [Instructor] (GJ-06 dual-control car). Track here: https://icandrive.in/bookings"`

---

## 5. Verification Commands

To compile and verify zero lint or build errors:
```bash
# 1. Lint and type-check
npm run lint

# 2. Production build
npm run build
```
