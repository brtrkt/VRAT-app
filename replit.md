# Workspace

## Overview

This pnpm workspace monorepo contains the VRAT app, a sacred fasting companion for Hindu and Jain devotees. The project aims to provide a personalized and accurate guide for observing fasts (vrats) across various traditions, incorporating regional variations and specific sampradaya rules. It's a frontend-only React + Vite web application with a focus on a warm, culturally appropriate design and a user-friendly experience. The application also includes monetization features through a subscription model.

## User Preferences

No explicit user preferences were provided in the original `replit.md` file.

## System Architecture

The VRAT app is a React + Vite web application built with TypeScript, Tailwind CSS, and Wouter for routing.

**UI/UX Design:**
- **Color Palette:** Warm saffron, gold, and cream.
- **Typography:** Playfair Display and Lato fonts.
- **Theming:** Specific card designs for different traditions (e.g., dark navy with gold accents for Sikh Nanakshahi Calendar).

**Technical Implementations & Features:**
- **Onboarding Flow:** A 7-screen process for initial user setup covering tradition, vrat toggles, location, region, and city.
- **Personalization:** Users can select their tradition, location (India/UK/USA-Canada/Australia), region (e.g., North India, Maharashtra), and observed vrats.
- **Supported Traditions (15 total, ~377 vrat entries):**
    - **Pan-Hindu:** Hindu (119), Both (Hindu+Jain shared, 2)
    - **Vaishnava sampradayas:** ISKCON / Gaudiya (38), PushtiMarg / Vallabh (17), Ramanandi (21), SriVaishnava (16), Swaminarayan / BAPS (20), Warkari / Varkari (17)
    - **Shaiva / Shakta sampradayas:** Lingayat / Veerashaiva (24), ShaivaSiddhanta (13, incl. 6 Telugu festivals + 20 Pournami dates under Shaiva-aligned Telugu calendar), Shakta (15)
    - **Reform / regional sampradayas:** AryaSamaj (13), Bishnoi (25)
    - **Jain:** Jain (21, both Shvetambara & Digambara)
    - **Sikh:** Sikh (16, Nanakshahi calendar)
- **Vrat Data:** All entries hardcoded in `src/data/vrats.ts` for 2026–2027, with regional + sampradaya filtering via `filterVratsByTradition()`.
- **Location-Awareness:** Vrat timings (sunrise/sunset) are based on the user's device location or manually set city. Timezone adjustments are critical for diaspora users.
- **Calendar View:** A 2026–2027 year view with color-coded vrat days and gold dots for personal vrats, supporting location and regional filtering.
- **Health Warnings:** Nirjala (no-water fast) warnings and a general health disclaimer.
- **Content Features:**
    - "What to Eat" section with allowed/avoided foods and meal ideas.
    - Daily mantra and next vrat countdown on the Home screen.
    - Panchang card (Hindu/Jain) showing tithi, paksha, nakshatra.
    - Nanakshahi Calendar card (Sikh) with month, day, year, and Gurpurab countdown.
    - Fasting recipes (`/recipes`) for Hindu/Jain users, and Langar recipes (`/langar-recipes`) for Sikh users.
    - Vrat journal for personal notes on past fasts.
- **Offline Support:** Service worker (`public/sw.js`) for stale-while-revalidate offline caching.
- **PWA Installation Guide:** `src/pages/HowToInstall.tsx` and `src/components/PWAInstallPrompt.tsx`.
- **LocalStorage:** User preferences and state are stored locally using keys like `vrat_onboarding_done`, `vrat_has_seen_onboarding_v1`, `vrat_tradition`, `vrat_location`, `vrat_region`, `vrat_observed`, `vrat_city`, `vrat_disclaimer_accepted`, `vrat_trial_start`, `vrat_user_email_v1`, `vrat_subscribed_v1`, `vrat_language_v1`, `vrat_device_id_v1`, and `vrat_journal_v1`.
- **Backend Settings Persistence:** A Postgres table `public.vrat_user_settings` (user_id PK, tradition, observed JSONB, city, location, region, updated_at) backed by `GET`/`PUT /api/settings` lets users restore their full setup on a new device. The user_id is the verified email if signed in, otherwise a stable `device:<uuid>` value stored in `vrat_device_id_v1`. The frontend pulls on app mount and pushes on Settings save, tradition change, and Onboarding finish.

## Master Tradition Log

This section is updated whenever a new tradition (or significant set of vrats for an existing tradition) is added. Each entry records: tradition key, display label, sampradaya family, entry count, and notable additions.

| Key | Label | Family | Entries | Notes |
|---|---|---|---|---|
| `Hindu` | Hindu (Pan-Hindu) | Pan-Hindu | 119 | Ekadashi, Amavasya, Purnima, Navratri, festivals |
| `Both` | Hindu + Jain shared | Pan-Hindu | 2 | Days observed by both communities |
| `Jain` | Jain | Jain | 21 | Shvetambara + Digambara, Paryushan, Kshamavani |
| `Sikh` | Sikh | Sikh | 16 | Nanakshahi calendar, Gurpurabs |
| `ISKCON` | ISKCON / Gaudiya Vaishnava | Vaishnava | 38 | Vaishnava Calendar — Ekadashi tithi, Janmashtami |
| `PushtiMarg` | PushtiMarg (Vallabh Sampradaya) | Vaishnava | 17 | Pushtimarg Tippni — Krishna utsavs |
| `Swaminarayan` | Swaminarayan / BAPS | Vaishnava | 20 | BAPS official calendar |
| `SriVaishnava` | Sri Vaishnava | Vaishnava | 16 | Srirangam, Ahobila Mutt, Andavan, Parakala panchangams |
| `Ramanandi` | Ramanandi Sampradaya | Vaishnava | 21 | Ram Navami, Hanuman Jayanti emphasis |
| `Warkari` | Warkari / Varkari | Vaishnava (Marathi) | 17 | Pandharpur Wari, Ekadashi-centric |
| `Lingayat` | Lingayat / Veerashaiva | Shaiva | 24 | Basava Jayanti, Lingayat festivals + Hindu lunar fasts |
| `ShaivaSiddhanta` | Shaiva Siddhanta | Shaiva | 13 | Tamil Shaiva (Thirukanthika) + Telugu Shaiva (6 festivals + 20 Pournami) |
| `Shakta` | Shakta | Shakta | 15 | Devi-centric — Navratri, Durga Puja, Lalita Panchami |
| `AryaSamaj` | Arya Samaj | Reform | 13 | Maharishi Dayanand related observances; orange `#9A3412` legend |
| `Bishnoi` | Bishnoi | Reform / regional | 25 | Guru Jambheshwar tradition, 29 principles |

**Total: 15 traditions, 377 vrat entries.**

When adding a new tradition, update:
1. Tradition union in `artifacts/vrat-app/src/data/vrats.ts` (and `useUserPrefs.ts`)
2. `VRAT_OPTIONS` in `Onboarding.tsx` and `Settings.tsx`
3. Branch in `filterVratsByTradition()`
4. Calendar legend ternary + LEGEND constant in `Calendar.tsx`
5. Home.tsx tradition card branding (if a unique theme is desired)
6. WhatToEat label mapping
7. Translations in `data/translations.ts`
8. **This master log table.**

**Monetization:**
- **Subscription Model:** 30-day free trial followed by a paid subscription (monthly/annual plans).
- **Paywall:** Two-step process (email collection → plan selection) after trial expiry.
- **Currency Detection:** Auto-detects currency (INR for India, USD elsewhere).
- **Subscription Management:** "Restore access" flow verifies active subscriptions.

**Development Stack:**
- **Monorepo Tool:** pnpm workspaces
- **Node.js:** v24
- **Package Manager:** pnpm
- **TypeScript:** v5.9

## External Dependencies

- **Stripe:** Used for processing subscriptions and payments. Integrates directly via API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) for checkout and webhook handling, *not* Replit's built-in Stripe integration.
- **GitHub:** For version control and deployment (repo: `https://github.com/brtrkt/VRAT-app`).
- **Authoritative Calendar Sources (PDFs and Websites):**
    - **Hindu:** Drik Panchang (general, Marathi, Kannada, Hindi), BAPS Official Calendar, ISKCON Vaishnava Calendar, Pushtimarg Tippni, Thirukanthika Panchangam (Tamil Shaiva), Sri Vaishnava Vishesha Panchangam (from mutts like Srirangam, Tirumala, Ahobila Mutt, Andavan Ashramam, Parakala Mutt).
    - **Jain:** Jain Samvat Calendar.
    - **Sikh:** Nanakshahi Calendar (SGPC).
    - **Regional:** Various regional Drik Panchang versions and local Hindu Calendars.