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

**Vrats covered (130+ entries, 2026–2027):** Ekadashi (24), Pradosh (24), Purnima (12), Amavasya (12), Navratri (18), Sankashti Chaturthi (12), Maha Shivratri, Janmashtami, Karva Chauth, Hartalika Teej, Hariyali Teej, Vat Savitri, Ahoi Ashtami, Ram Navami, Hanuman Jayanti, Ganesh Chaturthi, Dussehra, Diwali, Dhanteras, Govardhan Puja, Chhath Puja, Nirjala Ekadashi, Akshaya Tritiya, Pitru Paksha, Jain festivals (6 types) + **11 new regional vrats** (Kajari Teej, Teeyan, Vat Pournima, Lalita Panchami, Sharad Purnima Gujarat, Lokhhi Pujo, Saraswati Puja, Jitiya, Varalakshmi Vratam, Karadaiyan Nombu, Skanda Sashti)

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
- Plans: Monthly $2.99/mo, Annual $19.99/yr (save 44%)
- Stripe URLs: placeholders in `src/pages/Paywall.tsx` constants `STRIPE_MONTHLY_URL` / `STRIPE_ANNUAL_URL` — replace with real links when ready
- "Restore purchase" flow: user enters confirmation code → sets `vrat_subscribed_v1`
- Trial banner shown at bottom of Home screen: "X free days remaining ✨" (urgent style when ≤5 days)

**New features (April 2026):**
- WhatsApp sharing: tap "Share on WhatsApp" on TodayCard (fast days) → pre-filled message with vrat name
- Panchang card on Home: shows today's tithi, paksha (Shukla/Krishna), nakshatra. Computed from lunar calendar reference (Amavasya Jan 29, 2026). Component: `src/components/PanchangCard.tsx`
- Fasting recipes page at `/recipes`: 10 traditional recipes (sabudana khichdi, kuttu ki puri, singhara halwa, makhana kheer, sama rice pulao, aloo jeera, rajgira ladoo, banana lassi, shakarkand chaat, fruit chaat). Filter by energy level. Linked from WhatToEat. Component: `src/pages/Recipes.tsx`
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
