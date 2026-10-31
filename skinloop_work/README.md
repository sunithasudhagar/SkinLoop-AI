# SkinLoop AI

> "Understand your skin. Find your look. Shop smarter."

SkinLoop AI is an AI-powered personalized skincare and beauty intelligence web application connecting computer vision skin analysis, foundation shade finding, virtual makeup simulation, intelligent routine planning, environmental atmospheric adaptation, and conscious budget management.

---

## Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Google Fonts (Plus Jakarta Sans & Playfair Display).
- **Backend API**: Express running on Node.js via `tsx server.ts` mounted with Vite middleware for unified development and production routing.
- **AI Intelligence**: `@google/genai` TypeScript SDK using `gemini-2.5-flash` with deterministic beauty engine fallback.
- **Computer Vision**: Perfect Corp YouCam S2S v2.0 REST API (File Upload, Skin Analysis, and Look Virtual Try-On) with transparent offline evaluation sandbox.
- **Environmental Data**: Real-time meteorological, UV index, and air quality (US EPA AQI & India CPCB NAQI) intelligence powered by Open-Meteo.
- **Persistence**: Resilient on-device storage with complete JSON data portability (export/backup) and permanent one-click wipe.

---

## Core Feature Overview

1. **AI Skin Analysis (Computer Vision)**
   - Upload selfie photos or capture live video via device webcam with alignment oval guides.
   - Explicit user consent and non-medical cosmetic disclosure required before any photo processing.
   - Server-side execution of official Perfect Corp YouCam S2S v2.0 API:
     - `POST /s2s/v2.0/file` initiates presigned S3 upload.
     - Server transfers binary buffer directly to presigned destination URL.
     - `POST /s2s/v2.0/task/skin-analysis` schedules asynchronous diagnostics.
     - Polls `GET /s2s/v2.0/task/skin-analysis/{task_id}` for completion.
   - Maps 7 diagnostic surface metrics: Hydration, Texture Smoothness, Redness Calmness, Spots Clarity, Oil Balance, Radiance, and Firmness.
   - Real user accounts start with zero preloaded scans. Users explicitly choose whether to save a session to their Progress Journal.

2. **Foundation & Concealer Shade Finder**
   - Filter by coverage (Sheer, Medium, Full), finish (Matte, Natural, Dewy), and price tier.
   - Ranks candidate shades based on undertone compatibility (Warm, Neutral, Cool, Olive) and Fitzpatrick classification.
   - Side-by-side interactive split-slider photo preview to compare bare skin with tentative foundation tint.
   - Critical cosmetic boundary: skin health scores never condition or alter skin tone match.

3. **Virtual Makeup Studio**
   - 9 makeup categories: Eyeliner, Kajal, Mascara, Eyeshadow, Lipstick, Blush, Contour, Primer, and Powder.
   - Interactive 2D Face Canvas try-on with real-time SVG blending, opacity adjustments, and custom color pickers.
   - Photo-based virtual makeup rendering via YouCam Look VTO endpoints (`POST /s2s/v2.0/task/look-vto`).
   - Coordinated occasion look presets: Everyday Minimalist, Fresh Campus, Polished Executive, Sunset Glamour, and Wedding.

4. **Atmospheric & Environmental Adaptation**
   - Real-time meteorological intelligence for local GPS coordinates or curated global cities.
   - Tracks UV Radiation Index, Relative Humidity (TEWL risk), Temperature, US EPA AQI, and Indian CPCB NAQI.
   - Dual air quality standard labeling: clearly differentiates US EPA AQI categories from Indian CPCB breakpoints (PM2.5 / PM10 µg/m³).
   - Zero fabricated fallbacks: displays "Unavailable" when live sensor data is unreachable, and clearly badges cached readings.

5. **My Shelf (Owned Inventory) & Anti-Waste Optimization**
   - Personal inventory tracking: category, purchase price, remaining fill percentage, opening date, expiry, and verified ingredients.
   - Recommendation engine checks My Shelf first to flag duplicates and prioritize using existing products before purchasing new ones.

6. **Personal Routine Builder**
   - Morning & Evening routines with drag-free reordering, step editing, purpose explanations, and completion checkoffs.
   - Direct linking to owned shelf items or catalogue recommendations.
   - User confirmation required before modifying active routines.

7. **AI Beauty Concierge (`gemini-2.5-flash`)**
   - Grounded in user's profile, skin type, sensitivities, routine history, My Shelf inventory, active experiments, and budget.
   - Answers ingredient synergy questions (e.g., Vitamin C + Retinol timing, TEWL causes, barrier repair).
   - Server-side Gemini API calls via `@google/genai`; falls back gracefully to deterministic rule engine if API key is not configured.

8. **Skin Experiment Lab (Flagship Innovation)**
   - Systematic single-variable routine testing over standard durations (14, 21, or 28 days).
   - Daily observation logs on 1-5 Likert scales: Dryness, Oiliness, Redness, Irritation, Breakouts, and Comfort.
   - Confounder tracking for missed routine days and unexpected product additions.
   - Early termination safety protocol when elevated irritation or stinging is encountered.
   - Chronological observation timeline and baseline vs. final observation comparison.
   - AI-written experiment synthesis via `/api/experiments/synthesize` (`gemini-2.5-flash`) with non-causal scientific disclaimers.

9. **Skin Trigger Detective**
   - Cross-analyzes daily journal entries, experiment logs, Open-Meteo weather/humidity/UV, user-supplied sleep notes, and routine consistency.
   - Surfaces observational co-occurrences (e.g., Low Humidity ↔ Transepidermal Water Loss, Routine Skipping ↔ Barrier Sensitivity).
   - Strict non-causal statistical correlation framing without false clinical causation claims.
   - Drill-down Evidence Inspector showing exact timestamps and environmental metrics for correlated events.

10. **Smart Beauty Purchase Simulator**
    - Pre-purchase cosmetic evaluation before spending money.
    - Shelf duplicate defense: identifies category or active ingredient overlap and computes remaining days of owned supply.
    - Chemical routine conflict analysis against active AM/PM products (e.g., AHA + Retinol layering risk).
    - Personal allergy and sensitivity warnings matched against user profile.
    - True cost-per-use calculation (₹ / day or application) and monthly budget consumption impact.
    - Curated cheaper/cleaner alternatives and saveable purchase decisions (`wishlist`, `approved`, `deferred`, `rejected`).

11. **Progress Journal & Streak Gamification**
    - Objective longitudinal metric progression curves (SVG).
    - Side-by-side scan comparison tool with lighting and angle disclaimers.
    - Daily subjective skin comfort and routine completion log.
    - Unbroken streak calculation computed strictly from actual dated completion records (no hardcoded counters).

12. **Conscious Budget & Shelf Savings Calculator**
    - Monthly budget progress tracking in INR (₹).
    - Calculates cumulative money saved by utilizing owned shelf items instead of purchasing duplicates.

13. **Data Privacy, Portability & Offline PWA**
    - 100% on-device local storage for user data.
    - Export complete dossier as JSON backup at any time.
    - One-click permanent "Wipe All Records" with irreversible confirmation.
    - Progressive Web App (PWA) manifest with offline caching.

---

## Live API Mode vs. Demo Evaluation Mode

| Capability | Live API Mode | Demo Evaluation Mode |
| :--- | :--- | :--- |
| **Trigger** | `YOUCAM_API_KEY` configured in server environment | `YOUCAM_API_KEY` omitted / unconfigured |
| **YouCam CV** | Live Perfect Corp S2S v2.0 calls to `https://yce-api-01.makeupar.com` | Certified sandbox simulation with realistic non-medical metrics |
| **Result Badge** | `Live Computer Vision` | `Evaluation Sandbox Scan` |
| **New Accounts** | Starts with 0 preloaded scans (clean slate) | Starts with 0 preloaded scans; optional "Load Sample Demo Records" button available |
| **Gemini AI** | Real-time `gemini-2.5-flash` completions via `@google/genai` | Grounded deterministic beauty advisory engine with identical schema |
| **Weather/AQI** | Live Open-Meteo sensor feed with real-time US EPA & CPCB NAQI | Live Open-Meteo sensor feed; marks missing data as "Unavailable" (no fake defaults) |
| **Data Safety** | API keys strictly confined to server-side memory | No credentials required or transmitted |

---

## Environment Variables Configuration

Create a `.env` file in the project root (see `.env.example`):

```bash
# GEMINI_API_KEY: Injected automatically by AI Studio secrets or set manually
GEMINI_API_KEY="your_gemini_api_key_here"

# YOUCAM_API_KEY: Perfect Corp / YouCam AI Skin Analysis & Virtual Try-On Bearer Token
# Server-side only. Never sent to or stored on browser client.
YOUCAM_API_KEY="your_youcam_bearer_token_here"

# YOUCAM_BASE_URL: Official YouCam S2S v2.0 REST Host
# Default: https://yce-api-01.makeupar.com
YOUCAM_BASE_URL="https://yce-api-01.makeupar.com"

# APP_URL: AI Studio hosting URL
APP_URL="http://localhost:3000"
```

> **Security Note**: API keys are strictly server-side environment variables. They are never transmitted in frontend POST bodies, never exposed in URL query parameters, and never stored in browser `localStorage`.

---

## Installation, Testing & Execution

Compatible with **Windows**, **macOS**, and **Linux**:

```bash
# 1. Install dependencies
npm install

# 2. Run full automated test suite (All 68+ assertions)
npm run test:all

# 3. Run individual test suites
npm run test:audit       # 42 unit, storage, recommendation, and gamification tests
npm run test:companion   # 33 AI Beauty Companion, shelf check, and query tests
npm run test:youcam      # 25 YouCam S2S v2.0 integration & validation tests

# 4. Type-check codebase (zero errors)
npm run lint

# 5. Build for production
npm run build

# 6. Start full-stack application (runs on http://localhost:3000)
npm run dev
# or
npm start
```

---

## Verification Endpoints

- `GET /api/health` — Full system readiness and subsystem status.
- `GET /api/youcam/status` — Server-side YouCam configuration health (without revealing credentials).
- `GET /api/companion/status` — Gemini AI model readiness and operating mode.
- `GET /api/youcam/templates` — Remote or catalog Look VTO styles.

---

## License

Apache-2.0. Built for Google AI Studio Hackathon.
