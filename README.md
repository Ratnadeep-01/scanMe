# ReviewFlow — Google Maps Review Funnel & Stand Studio

> A mobile-first, enterprise-ready web application engineered to accelerate authentic Google Maps reviews through physical QR table stands, AI-assisted review drafting, 1-tap clipboard handoffs, and private grievance deflection.

---

## 1. Executive Summary & Architecture

### The Problem
- **Customer Typing Friction:** Customers are willing to leave positive reviews, but staring at an empty mobile review text area leads to high drop-off rates.
- **Google Security Sandbox Constraints:** Due to Google's cross-origin iframe policies and native app sandboxing, **no third-party application can programmatically pre-fill or type into the native Google Maps review textarea**.
- **Public Negative Reviews:** Customers with minor, fixable grievances often vent publicly via 1-to-3-star reviews on Google Maps because they lack a private, direct communication channel to management.
- **Customer Access Confusion:** In many review tools, customers can inadvertently access administrative tools or venue configuration.

### The Solution: ReviewFlow
1. **Dynamic Physical QR Stands:** Generate print-ready 4" × 6" table tents and counter stands with high-error-correction QR codes (`level="H"`) encoding venue-specific review routes (`/review?placeId=...&name=...`).
2. **AI-Assisted Review Drafting:** When a customer selects 4 or 5 stars, an anti-robotic AI engine drafts an authentic, natural, first-person review based on the venue category, selected highlight tags, and chosen tone (*Casual*, *Friendly*, *Short*).
3. **1-Tap Clipboard Handoff:** 
   - Copies the drafted review text to the device clipboard (`navigator.clipboard.writeText` with legacy fallback).
   - Displays a clean 2-step visual guidance modal: *"1. Select 5 stars in Google Maps  •  2. Paste clipboard text"*.
   - Deep-links directly to Google's official Local WriteReview dialog:
     ```text
     https://search.google.com/local/writereview?placeid=<GOOGLE_PLACE_ID>
     ```
4. **Private Grievance Shielding (1–3 Stars):** Dissatisfied visitors are seamlessly guided to a private internal feedback form routed directly to management, protecting the public Google Maps rating while facilitating immediate customer recovery.
5. **Strict Customer Isolation:** The customer review flow contains zero links, breadcrumbs, or entry points to administrative consoles or QR generation tools.
6. **Authenticated Admin Console (`/admin`):** Password-protected portal with HMAC SHA-256 signed HTTP-only cookies, conversion funnel analytics, a 300 DPI canvas print studio, feedback triage inbox, and multi-location management with bulk CSV import.

---

## 2. Project Directory Structure

```text
├── app/
│   ├── admin/
│   │   └── page.tsx              # Authenticated management console
│   ├── api/
│   │   ├── analytics/
│   │   │   └── route.ts          # Scan, draft, and handoff tracking API
│   │   ├── auth/
│   │   │   └── route.ts          # Session authentication (HMAC SHA-256 cookie)
│   │   ├── db-status/
│   │   │   └── route.ts          # MongoDB connection health & document counts
│   │   ├── feedback/
│   │   │   └── route.ts          # Private grievance intake & status triage
│   │   ├── generate-review/
│   │   │   └── route.ts          # Review generator (OpenAI + anti-robotic fallback)
│   │   └── locations/
│   │       └── route.ts          # Location management & cloud sync API
│   ├── review/
│   │   ├── [placeId]/
│   │   │   └── page.tsx          # Dynamic route for specific Place ID
│   │   └── page.tsx              # Universal query route (?placeId=...&name=...)
│   ├── globals.css               # Tailwind CSS v4 & @media print rules
│   ├── layout.tsx                # Root layout with mobile-first viewport
│   └── page.tsx                  # Root route (redirects to /admin)
├── components/
│   ├── AdminAuthGuard.tsx        # Gatekeeper login card & session verification
│   ├── AdminDashboard.tsx        # Analytics funnel, feedback inbox, location manager
│   ├── Navbar.tsx                # Top navigation for console & customer preview
│   ├── PlaceQRCodeCard.tsx       # QR generator & 300 DPI canvas print studio
│   ├── ReviewFlow.tsx            # Customer review UI (rating, drafter, grievance shield)
│   ├── ReviewPageClient.tsx      # Hydration-safe client wrapper for /review
│   └── StarRating.tsx            # Tactile 5-star rating component
├── lib/
│   ├── db/
│   │   └── collections.ts        # MongoDB schemas & collection accessors
│   ├── business-store.ts         # Hybrid data store (MongoDB + localStorage fallback)
│   ├── google-maps-utils.ts      # Place ID extraction, deep-links, clipboard utilities
│   ├── mongodb.ts                # MongoDB Atlas connection client
│   ├── prompt-templates.ts       # Anti-robotic AI prompt templates & heuristics
│   └── types.ts                  # TypeScript domain models
├── public/                       # Static public assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 3. Authentication & Security

### Admin Console Gate
- Management operations at `/admin` are gated by [`components/AdminAuthGuard.tsx`](file:///C:/Desktop/New%20folder%20(3)/components/AdminAuthGuard.tsx).
- When unauthenticated, visitors see only a clean sign-in card.
- Authentication requests are handled by [`app/api/auth/route.ts`](file:///C:/Desktop/New%20folder%20(3)/app/api/auth/route.ts):
  - **Constant-Time Verification:** Uses `crypto.timingSafeEqual` to prevent timing attacks.
  - **Signed Session Token:** Generates an HMAC SHA-256 session token stored in an HTTP-only, `SameSite=Lax` cookie (`rf_admin_session`).
  - **Configurable Credentials:** Set via `ADMIN_PASSWORD` in `.env.local` (default: `admin123`).

### Customer Isolation
- Customers scan physical QR stands linking directly to `/review?placeId=...&name=...`.
- The customer review view contains **no links to `/` or `/admin`**, and no QR generator controls.
- Root route `/` immediately redirects (`HTTP 307`) to `/admin`, ensuring curious visitors cannot bypass the authentication gate.

---

## 4. Supported Business Categories

ReviewFlow supports 11 tailored industry profiles with category-specific review highlight chips and grievance presets:

| Category ID | Label | Highlight Chip Examples |
| :--- | :--- | :--- |
| `college` | College / University / Higher Education | *Knowledgeable faculty*, *Modern labs & library*, *Vibrant campus* |
| `restaurant` | Restaurant / Food & Beverage | *Delicious food*, *Great atmosphere*, *Fast service*, *Attentive staff* |
| `cafe` | Cafe / Bakery | *Quality coffee*, *Fast takeaway*, *Friendly baristas*, *Clean seating* |
| `dentist` | Dental Clinic | *Punctual appointment*, *Gentle treatment*, *Clean clinic* |
| `healthcare` | Healthcare / Hospital / Clinic | *Attentive care*, *Clear explanations*, *Minimal wait time* |
| `hotel` | Hotel / Hospitality | *Clean rooms*, *Comfortable bed*, *Smooth check-in* |
| `salon` | Salon / Barber / Spa | *Skilled stylist*, *Clean salon*, *Punctual service* |
| `automotive` | Automotive Service / Repair | *Honest diagnosis*, *Fast turnaround*, *Clear quote* |
| `retail` | Retail Store / Shop | *Helpful staff*, *Organized layout*, *Smooth checkout* |
| `gym` | Gym / Fitness Center | *Clean equipment*, *Well-maintained facilities*, *Helpful trainers* |
| `professional` | Professional Services | *Prompt communication*, *Attention to detail*, *Reliable delivery* |

---

## 5. Hybrid Data Storage & Cloud Sync

ReviewFlow employs a **hybrid architecture** that operates seamlessly offline or cloud-connected:

1. **MongoDB Atlas (Primary Cloud Store):**
   - Automatically activates when `MONGODB_URI` is defined in `.env.local`.
   - Collections: `locations`, `feedbacks`, `analytics`.
   - Real-time connection status check via `GET /api/db-status`.
2. **Local Browser Fallback (Zero Setup):**
   - If MongoDB is unconfigured or temporarily unreachable, ReviewFlow transparently falls back to local storage.
   - All locations, analytics counters, and feedback items persist across page refreshes.

---

## 6. Google Maps Deep-Link & Clipboard Specification

### Technical Deep Link Strategy
1. **Direct Google Review Dialog URL:**
   ```text
   https://search.google.com/local/writereview?placeid=<GOOGLE_PLACE_ID>
   ```
   When opened on mobile (iOS/Android), this link launches the native Google Maps app or mobile web view directly on the star-rating and review submission sheet.

2. **Android Intent URI Scheme (App Deep-Link):**
   ```text
   intent://search.google.com/local/writereview?placeid=<PLACE_ID>#Intent;scheme=https;package=com.google.android.apps.maps;end
   ```

3. **Universal Place Search Fallback:**
   ```text
   https://www.google.com/maps/search/?api=1&query=<BUSINESS_NAME>
   ```

---

## 7. Getting Started & Installation

### Prerequisites
- Node.js `v18.17.0+` (tested on Node `v20` and `v22`)
- npm `v9+`

### Installation
```bash
# Navigate to the project directory
cd "google-review-booster"

# Install dependencies
npm install

# Run the development server
npm run dev

# Or run production build & start
npm run build
npm run start
```
The application will be live at `http://localhost:3000`.

### Environment Variables
Configure your environment variables in `.env.local`:

```env
# Administrator Authentication (Required for custom password)
ADMIN_PASSWORD=admin123
ADMIN_SESSION_SECRET=your_super_secret_session_key_minimum_32_characters

# MongoDB Cloud Database (Optional — runs with local fallback if omitted)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/reviewflow?retryWrites=true&w=majority

# OpenAI API Key (Optional — built-in heuristic engine runs 100% offline if omitted)
OPENAI_API_KEY=sk-...your-openai-api-key...
```

---

## 8. Verification & Routes

| Route | Role / Audience | Description | Access Control |
| :--- | :--- | :--- | :--- |
| `/` | System | Redirects directly to `/admin` | Automatic HTTP 307 |
| `/admin` | Management | Analytics, QR Studio, Feedback Inbox, Settings | Password Required (`ADMIN_PASSWORD`) |
| `/review` | Customer | Mobile review portal with star rating & AI drafter | Public (Encoded in QR Code) |
| `/review/[placeId]` | Customer | Direct Place ID review portal | Public (Encoded in QR Code) |
| `/api/auth` | Internal | Password verification, session check, logout | Protected |
| `/api/db-status` | Internal | MongoDB ping, counts, and configuration status | Public / Admin |
| `/api/feedback` | Customer & Admin | Intake private complaints (POST) / Triage (GET/PATCH) | Public POST / Admin GET |
| `/api/generate-review` | Customer | AI review drafter endpoint | Public |
| `/api/locations` | Admin | Multi-location sync and directory CRUD | Public / Admin |

---

## 9. Operational Workflows for Venue Managers

For a detailed step-by-step operational guide covering bulk CSV imports, Place ID discovery, print stand setups, and grievance resolution workflows, please refer to [`ADMIN_GUIDE.md`](file:///C:/Desktop/New%20folder%20%283%29/ADMIN_GUIDE.md).
