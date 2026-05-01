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
- **Personalization:** Users can select their tradition (Hindu/Jain/Both), location (India/UK/USA-Canada/Australia), region (e.g., North India, Maharashtra), and observed vrats.
- **Vrat Data:** Over 140 vrat entries for 2026–2027, hardcoded in `src/data/vrats.ts`, including Hindu, Jain, and regional vrats.
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
- **LocalStorage:** User preferences and state are stored locally using keys like `vrat_onboarding_done`, `vrat_tradition`, `vrat_location`, `vrat_region`, `vrat_observed`, `vrat_city`, `vrat_disclaimer_accepted`, `vrat_trial_start`, `vrat_user_email_v1`, `vrat_subscribed_v1`, `vrat_language_v1`, and `vrat_journal_v1`.

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