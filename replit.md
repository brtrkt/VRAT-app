# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the VRAT app — a sacred fasting companion for Hindu and Jain devotees.

## Artifacts

### VRAT — Your Fast, Your Way (`artifacts/vrat-app`)

- **Type**: React + Vite web app (frontend-only, no backend)
- **Preview path**: `/`
- **Stack**: React, TypeScript, Tailwind CSS, Wouter (routing)
- **Design**: Warm saffron/gold/cream palette, Playfair Display + Lato fonts
- **Data**: All vrat data hardcoded in `src/data/vrats.ts`

**Features:**
- **Onboarding** (7 screens, shown once): Welcome → Tradition → Vrat toggles → Location → **Region** → City → "Jai Mata Di"
- Home screen: today's fasting status, next vrat countdown, daily mantra
- What to Eat: foods allowed/avoided + meal ideas based on today's vrat
- Calendar: 2026–2027 year view, colour-coded vrat days, gold dot for personal vrats; location-aware disclaimer; **regional vrat filtering + badge**
- Nirjala warnings: red badge + health modal for strict no-water fasts
- Health disclaimer banner + one-time popup + Privacy/Terms pages
- **Settings page** (bottom nav tab): change location, **region**, tradition, observed vrats, city; links to Privacy/Terms
- **Location selector**: India / UK / USA-Canada / Australia — stored in localStorage, drives calendar disclaimer text
- **Region selector**: All Regions / North India / Maharashtra / Gujarat / Bengal-Odisha / South India / Punjab-Haryana / Rajasthan-UP-Bihar — regional vrats filtered by this setting; regional badge shown in detail sheet
- Personalisation: tradition preference (Hindu/Jain/Both) sets default calendar filter; observed vrats show gold dots

**Vrats covered (140+ entries, 2026–2027):** Ekadashi (24), Pradosh (24), Purnima (12), Amavasya (12), Navratri (18), Sankashti Chaturthi (12), Maha Shivratri, Janmashtami, Karva Chauth, Hartalika Teej, Hariyali Teej, Vat Savitri, Ahoi Ashtami, Ram Navami, Hanuman Jayanti, Ganesh Chaturthi, Dussehra, Diwali, Dhanteras, Govardhan Puja, Chhath Puja, Nirjala Ekadashi, Akshaya Tritiya, Pitru Paksha, **Jain festivals (20 total)**: Mahavir Jayanti, Navpad Oli Spring/Autumn (VNS-corrected), Paryushana (Aug 30–Sep 6), Paryushana Upvas, Samvatsari (Sep 6), Das Lakshana (Sep 7–16), Kshamavani (Sep 16), Mahavira Nirvana, Rohini Vrat (12×), Ayambil, Ekasana, Shravan Jain, **+7 new**: Meru Trayodashi (Jan 13), Phalguna Chaumasi Chaudas (Feb 1), Varsitap Parana (May 19), Anant Chaturdashi (Sep 16), Jain New Year (Nov 9), Gyan Pancham/Labh Pancham (Nov 13), Kartik Chaumasi Chaudas (Nov 23) + **11 regional vrats** (Kajari Teej, Teeyan, Vat Pournima, Lalita Panchami, Sharad Purnima Gujarat, Lokhhi Pujo, Saraswati Puja, Jitiya, Varalakshmi Vratam, Karadaiyan Nombu, Skanda Sashti)

**LocalStorage keys:**
- `vrat_onboarding_done` — onboarding completed flag
- `vrat_tradition` — "Hindu" | "Jain" | "Both"
- `vrat_location` — "india" | "uk" | "usa" | "australia"
- `vrat_region` — UserRegion (e.g. "north-india", "maharashtra", "all")
- `vrat_observed` — JSON array of observed vrat ID patterns
- `vrat_city` — user's city for moonrise/sunrise calculations
- `vrat_disclaimer_accepted` — health disclaimer accepted
- `vrat_trial_start` — Unix ms timestamp when trial began (set on first launch)
- `vrat_user_email_v1` — user email collected on paywall email step
- `vrat_subscribed_v1` — set to "1" when user restores/confirms subscription
- `vrat_language_v1` — selected language code (en/hi/gu/pa/mr/ta/te/kn)

**Monetization:**
- 30-day free trial, no credit card required
- Trial start tracked via `vrat_trial_start` (set by `initTrial()` on first launch)
- After trial: two-step paywall — email collection → plan selection
- Plans: Monthly $2.99/mo (₹249/mo), Annual $19.99/yr (₹1,699/yr, save 44%)
- Stripe Checkout: frontend calls `/api/stripe/checkout` → API creates session → redirects to Stripe
- Currency auto-detected: India → INR, elsewhere → USD
- "Restore access" flow: user enters email → API verifies active subscription in DB
- Trial banner shown at bottom of Home screen: "X free days remaining ✨" (urgent style when ≤5 days)

**Stripe setup (direct API keys — NOT Replit integration):**
- `STRIPE_SECRET_KEY` secret: Replit Secret (starts with `sk_test_` for test mode)
- `STRIPE_WEBHOOK_SECRET` secret: Replit Secret (from Stripe Dashboard → Webhooks → signing secret)
- After adding keys: run `pnpm --filter @workspace/scripts run seed-products` in Shell to create products in Stripe and save price IDs to DB
- Webhook endpoint: `https://<your-domain>/api/stripe/webhook` — register this in Stripe Dashboard → Webhooks
- NOTE: Replit Stripe integration was dismissed; using env secrets directly instead

**Vrat interface fields (vrats.ts):**
- `hinduEquivalent?: string` — optional cross-tradition label shown on Sikh entries (e.g. "Holi", "Diwali", "Purnima / Purnmasi"). Display-only; does not affect date logic. Rendered as italic subtitle in Home next-vrat card, WhatToEat header, and Calendar detail sheet.
- Tagged entries: `hola-mohalla` → "Holi", `sangrand` → "Purnima / Purnmasi", `bandi-chhor-divas` → "Diwali"

**New features (April 2026):**
- WhatsApp sharing: tap "Share on WhatsApp" on TodayCard (fast days) → pre-filled message with vrat name
- Panchang card on Home: shows today's tithi, paksha (Shukla/Krishna), nakshatra. Computed from lunar calendar reference (Amavasya Jan 29, 2026). Component: `src/components/PanchangCard.tsx` — **shown only for Hindu/Jain/Both users**
- **Nanakshahi Calendar card on Home (Sikh only):** replaces PanchangCard when tradition = Sikh. Shows today's Nanakshahi month (12 months: Chet→Phagun), day, and NS year; today's Sikh observance with Khanda icon if any; next upcoming Gurpurab with countdown. Dark navy (#003DA5) card with gold (#F4A900) accents. Component: `src/components/NanakshahiCard.tsx`. Month dates derived from Sangrand dates in vrats.ts. No date logic touched for Hindu/Jain.
- Fasting recipes page at `/recipes`: 10 traditional recipes (sabudana khichdi, kuttu ki puri, singhara halwa, makhana kheer, sama rice pulao, aloo jeera, rajgira ladoo, banana lassi, shakarkand chaat, fruit chaat). Filter by energy level. Linked from WhatToEat (Hindu/Jain only). Component: `src/pages/Recipes.tsx`
- **Langar recipes page at `/langar-recipes`** (Sikh only): 4 traditional langar dishes — Khichdi (ਖਿਚੜੀ), Saag (ਸਾਗ), Meethe Chawal (ਮਿੱਠੇ ਚਾਵਲ), Dal Makhani (ਦਾਲ ਮਖਣੀ). Each card has: Punjabi name, description, occasion, dietary note, numbered ingredients, step-by-step method, langar tip. Sikh users are routed to `/langar-recipes` from WhatToEat; Hindu/Jain users continue to `/recipes`. Component: `src/pages/LangarRecipes.tsx`
- Vrat journal in VratHistory: tap pencil icon on any history entry to add a personal note (max 300 chars). Stored in localStorage under `vrat_journal_v1` (JSON object, keys: `date__vratId`)

**Key files:**
- `src/data/vrats.ts` — all vrat data (130+ entries) with `region?` and `regionLabel?` fields
- `src/hooks/useUserPrefs.ts` — localStorage helpers; exports UserRegion type, REGION_OPTIONS, getUserRegion, setUserRegion
- `src/components/Onboarding.tsx` — 7-screen onboarding flow
- `src/components/NirjalaWarning.tsx` — nirjala health warning badge/modal
- `src/components/DisclaimerBanner.tsx` — health disclaimer banner
- `src/pages/Calendar.tsx` — personalised calendar with gold dots
- `src/pages/HowToInstall.tsx` — PWA installation guide (iPhone + Android steps)
- `src/components/PWAInstallPrompt.tsx` — bottom-banner install prompt (shows after 2 visits)
- `public/sw.js` — service worker (stale-while-revalidate offline caching)
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` — generated diya PWA icons

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (api-server not used by vrat-app)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/vrat-app run dev` — run VRAT app locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## GitHub Push

- **Repo**: https://github.com/brtrkt/VRAT-app
- **Token secret**: `GITHUB_TOKEN` (stored in Replit Secrets — never share or print this)
- **Branch**: `main`

To push from the Shell, create and run the script:
```bash
# Create the script
echo 'git remote set-url origin https://brtrkt:$GITHUB_TOKEN@github.com/brtrkt/VRAT-app.git && git push origin main' > push.sh
# Run it
bash push.sh
# Clean up
rm push.sh
```

Or in one line in the Shell:
```
git remote set-url origin https://brtrkt:$GITHUB_TOKEN@github.com/brtrkt/VRAT-app.git && git push origin main
```

## Master Calendar Sources (Authoritative — DO NOT DEVIATE)

Per `attached_assets/VRAT_Master_Calendar_Sources_*.pdf` (Dr. Rachna Tiwari, last updated April 29, 2026). All vrat dates must be sourced from these references. Never guess. Cross-check with two sources when in doubt.

### Tradition → Source Mapping

| Tradition | Authoritative Source | URL |
|---|---|---|
| Hindu (general) | Drik Panchang | drikpanchang.com |
| Warkari | Marathi Drik Panchang | drikpanchang.com (Marathi) |
| Swaminarayan / BAPS | BAPS Official Calendar | baps.org |
| ISKCON / Gaudiya Vaishnava | ISKCON Vaishnava Calendar | vaisnavacalendar.com |
| Jain | Jain Samvat Calendar | jainsamvat.com |
| Sikh | Nanakshahi Calendar (SGPC) | sgpc.net |
| Pushti Marg | Official Tippni VS 2083 (Vidya Vibhag, Mandir Mandal, Nathdwara) | pushtimarg.net/wp-content/uploads/2026/03/Tippni-2083-Final.pdf — covers Mar 20 2026 → Mar 19 2027; Drik Panchang fallback for pre/post window |
| Lingayat | Drik Panchang (Kannada) | drikpanchang.com (Kannada) |
| Ramanandi / Ram Bhakti | Drik Panchang (Hindi) | drikpanchang.com (Hindi) |
| Sri Vaishnava | Sri Vaishnava Calendar | srivaishnava.org |
| Shakta | Drik Panchang + Shakta Panchang | drikpanchang.com |
| Shaiva Siddhanta | Tamil Hindu Calendar | tamilhinducalendar.com |

### Regional Festival Layer (shows for ALL users in that state, regardless of sampradaya)

| State | Key Dates | Source |
|---|---|---|
| Maharashtra | Ashadhi Ekadashi, Ganesh Chaturthi fast | Marathi Drik Panchang |
| Tamil Nadu | Skanda Sashti, Karthigai Deepam, Thaipusam | Tamil Hindu Calendar |
| Telangana | Bathukamma, Bonalu, Karthika Masam | Telugu Panchang |
| Andhra Pradesh | Karthika Masam, Ugadi | Telugu Panchang |
| West Bengal | Durga Puja fast, Kali Puja, Saraswati Puja | Bengali Panchang |
| Rajasthan | Gangaur, Teej | Drik Panchang (Hindi) |
| Karnataka | Ugadi, Shivaratri | Kannada Panchang |
| Gujarat | Diwali fast, Uttarayan | Gujarati Panchang |

### Date Extraction Rules

1. Always use the authoritative source above — never guess
2. Extract dates annually, before Diwali for the next year
3. Timezone-adjust all dates for diaspora users based on device location
4. Regional festival dates show for ALL users in that state — not sampradaya-filtered
5. Jain and Sikh data — DO NOT modify; use sources above only
6. When in doubt — cross-check with TWO sources before publishing

### Location & Timezone Rules (global)

- All vrat start/end times based on user's device location (GPS or manually set city)
- Ekadashi, Pradosham, Shivaratri etc. start at local sunrise — varies by city
- Mumbai vs Kolkata = ~1.5 hour difference — cannot use one fixed time for all India
- Tithis (lunar dates) can shift by a day depending on location
- Use user's local sunrise/sunset for all vrat timing calculations
- If location permission denied — ask user to manually select their city
- Default fallback: New Delhi time (never use a fixed UTC time)

### Diaspora Timezones

US East (EST/EDT), US West (PST/PDT), UK (GMT/BST), Canada (multiple — use device tz), Singapore/Malaysia (SGT — Thaipusam critical), UAE (GST — Tamil/Hindi diaspora), Australia (AEST).

### Operational Reminder

Stripe API key rotation cadence: every 7 days. Next due per master file: May 6, 2026.
