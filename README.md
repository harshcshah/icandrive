# icandrive — Vadodara Driving Lessons Marketplace 🚗

> "Learn to drive at your own pace, anytime. You can drive."

**icandrive** is a production-quality, mobile-first marketplace web application for learner drivers in **Vadodara (Baroda), Gujarat, India**.

---

## 🏛️ 3 Bifurcated Platform Views

The application features three dedicated, decoupled portals:

1. 🎓 **Learner Marketplace Portal (`/`, `/school-detail/:id`, `/checkout/:id`, `/bookings`)**
   - Blue theme (`#1D4ED8`)
   - Search 8 Vadodara areas (Alkapuri, Gotri, Manjalpur, Karelibaug, etc.)
   - Real-time slot conflict prevention & 10-minute hold window
   - Simulated UPI checkout with QR & instant confirmation
   - Reschedule & cancel with 6-hour refund policy calculation
   - Vadodara RTO syllabus tracker & multilingual support (EN, HI, GU)

2. 🏫 **Driving School Owner Portal (`/school/*`)**
   - Emerald theme (`#059669`)
   - Today's session schedule with 1-click status actions (Start, Complete, No-Show)
   - Certified instructor & dual-control fleet vehicle management
   - Calendar availability rules and time-off/vacation blocking
   - Net earnings and monthly UPI payout ledger after 15% marketplace commission
   - Student reviews and official school replies

3. 🛡️ **Super Admin Operations Console (`/admin/*`)**
   - Royal Indigo theme (`#4F46E5`)
   - Platform GMV, net commissions, cancellation rates, and daily trend analytics
   - Driving school partner approvals & RTO license audit (`GJ-06-...`)
   - All platform bookings directory with global filter
   - Refunds queue with 1-click UPI settlement back to learners
   - Custom commission rates per driving school (default 15%)
   - Review moderation & audit flags

*Use the top **Portal Switch Bar** (`PortalSwitchBar.tsx`) to seamlessly toggle between the three views.*

---

## 🤖 Scalability for Codex, Kiro AI & AI Coding Assistants

This codebase is specifically engineered to be scalable and extensible by **Codex**, **Kiro AI**, **Cursor**, or developer teams after downloading the repository.

- **`ARCHITECTURE.md`**: Complete architectural reference with PostgreSQL/Supabase DDL, schema diagrams, RLS rules, and step-by-step recipes to connect Supabase, Razorpay, and WhatsApp alerts.
- **`/src/types/database.types.ts`**: Complete typed database contracts for all tables (`profiles`, `schools`, `instructors`, `vehicles`, `packages`, `bookings`, `payments`, `reviews`).
- **`/src/services/config.ts`**: Centralized configuration (`USE_MOCK_STORAGE`, `SUPABASE_URL`, `RAZORPAY_KEY_ID`).
- **Clean Service Layer (`/src/services/`)**: Async typed functions with inline JSDoc comments detailing the exact Supabase query to swap in.

---

## 🚀 Quick Setup & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Run local development server (port 3000)
npm run dev

# 3. Lint and type-check
npm run lint

# 4. Production build
npm run build
```

---

## 🌐 Languages Supported
- **English** (`en`)
- **Hindi** (`hi`) — हिंदी
- **Gujarati** (`gu`) — ગુજરાતી (uses `Noto Sans Gujarati` font)
