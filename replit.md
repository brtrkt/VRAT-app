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
- **Onboarding** (6 screens, shown once): Welcome → Tradition → Vrat toggles → Location → City → "Jai Mata Di"
- Home screen: today's fasting status, next vrat countdown, daily mantra
- What to Eat: foods allowed/avoided + meal ideas based on today's vrat
- Calendar: 2026–2027 year view, colour-coded vrat days, gold dot for personal vrats; location-aware disclaimer
- Nirjala warnings: red badge + health modal for strict no-water fasts
- Health disclaimer banner + one-time popup + Privacy/Terms pages
- **Settings page** (bottom nav tab): change location, tradition, observed vrats, city; links to Privacy/Terms
- **Location selector**: India / UK / USA-Canada / Australia — stored in localStorage, drives calendar disclaimer text
- Personalisation: tradition preference (Hindu/Jain/Both) sets default calendar filter; observed vrats show gold dots

**Vrats covered (119 entries, 2026–2027):** Ekadashi (24), Pradosh (24), Purnima (12), Amavasya (12), Navratri (18), Sankashti Chaturthi (12), Maha Shivratri, Janmashtami, Karva Chauth, Hartalika Teej, Hariyali Teej, Vat Savitri, Ahoi Ashtami, Ram Navami, Hanuman Jayanti, Ganesh Chaturthi, Dussehra, Diwali, Dhanteras, Govardhan Puja, Chhath Puja, Nirjala Ekadashi, Akshaya Tritiya, Pitru Paksha, Jain festivals (6 types)

**LocalStorage keys:**
- `vrat_onboarding_done` — onboarding completed flag
- `vrat_tradition` — "Hindu" | "Jain" | "Both"
- `vrat_location` — "india" | "uk" | "usa" | "australia"
- `vrat_observed` — JSON array of observed vrat ID patterns
- `vrat_city` — user's city for moonrise/sunrise calculations
- `vrat_disclaimer_accepted` — health disclaimer accepted

**Key files:**
- `src/data/vrats.ts` — all vrat data (119 entries)
- `src/hooks/useUserPrefs.ts` — localStorage helpers
- `src/components/Onboarding.tsx` — 5-screen onboarding flow
- `src/components/NirjalaWarning.tsx` — nirjala health warning badge/modal
- `src/components/DisclaimerBanner.tsx` — health disclaimer banner
- `src/pages/Calendar.tsx` — personalised calendar with gold dots

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
