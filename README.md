# 🪔 VRAT — Your Fast, Your Way

**A culturally specific fasting companion app for Hindu and Jain women**

Live at: [vrat-app.netlify.app](https://vrat-app.netlify.app)

---

## What is VRAT?

VRAT is a dedicated vrat (religious fasting) companion built for Hindu and Jain women — both diaspora and India-based. Unlike generic fasting apps, VRAT offers religiously accurate, regionally sensitive content: correct mantras, authentic puja vidhi, culturally appropriate food guides, and location-specific features like moonrise countdowns for Karva Chauth.

---

## Features

- **50+ vrats covered** across Hindu and Jain traditions
- **Food guide** using light/medium/heavy energy categories (not calorie counts)
- **Mantras with Sanskrit text, transliteration, and English meaning**
- **Puja vidhi (step-by-step worship instructions)** for every vrat
- **Hydration guide** tailored to each fast type
- **Parana times** (correct break-fast timings)
- **Regional sensitivity** — state filtering, location detection, regional disclaimers
- **Moonrise countdown** for Karva Chauth (city-specific, live)
- **Navratri colour-of-the-day** with deity bhog
- **Jain-specific content** — boiled water rules, Ayambil, Paryushana, Namokar Mantra

---

## Content Coverage

### Hindu Monthly Vrats
Ekadashi (Kamada, Mohini, Nirjala, Vaikuntha), Pradosh Vrat, Purnima, Amavasya, Sankashti Chaturthi

### Hindu Major Festivals
Chaitra & Sharad Navratri, Maha Shivratri, Janmashtami, Karva Chauth, Vat Savitri, Ahoi Ashtami, Hartalika Teej, Chhath Puja, Jivitputrika, Mangala Gauri Vrat, Varalakshmi Vratam

### Hindu Weekly Vrats
Somvar (Monday / Sawan Somvar), Mangalvar, Budhvar, Guruvar, Shukravar, Shanivar

### Jain Sacred Vrats
Paryushana Parva (Shvetambara 8-day & Digambara 10-day), Samvatsari, Ayambil, Ekasana, Navpad Oli, Paryushana Upvas, Das Lakshana Parva, Shravan Shukla

---

## Content Database

The master content database (`VRAT_Master_Content_Database.xlsx`) contains 9 sheets:

| Sheet | Contents |
|---|---|
| 🪔 VRAT Master Guide | Overview and sheet index |
| 📅 Hindu Monthly Vrats | 8 monthly vrats with full detail |
| 🌺 Hindu Major Festivals | 12 major festivals |
| 📆 Hindu Weekly Vrats | 7 weekly vrats (Mon–Sat + Sawan Somvar) |
| 🕊️ Jain Sacred Vrats | 8 Jain vrats and austerities |
| 🥛 Hydration Guide | 12 vrat-specific drinks with timing |
| 🙏 Mantras & Puja Vidhi | 12 mantras with Sanskrit, meaning, recitation method |
| 🍽️ Food Master List | 13 key foods — allowed/avoided per vrat, Jain status |
| ⚙️ Airtable Setup Guide | Steps to import content into Airtable |

Each vrat entry includes:
- Vrat name and alternate names
- Religion and deity
- Frequency and 2026 dates
- Fast type and start/break times
- Foods allowed and avoided
- Hydration tips
- Mantra (Sanskrit) and English meaning
- Puja vidhi (step-by-step)
- Significance and special notes

---

## Tech Stack

| Layer | Tool |
|---|---|
| Development | Replit (AI-assisted) |
| Build | pnpm (`@workspace/vrat-app`) |
| Deployment | Netlify (drag-and-drop from `artifacts/vrat-app/dist/public`) |
| Payments (planned) | Stripe ($2.99/month or $19.99/year, 30-day free trial) |
| Content database | Excel → future Airtable integration |
| Calendar references | Drik Panchang IST (Hindu), Veer Nirvana Samvat (Jain) |

---

## Deployment Workflow

1. Make changes in Replit
2. Run: `pnpm --filter @workspace/vrat-app run build`
3. Download the `artifacts/vrat-app/dist/public` folder as a ZIP
4. Drag the ZIP into the Netlify dashboard
5. Live in ~60 seconds

> **Note:** Replit preview URLs require login and cannot be shared publicly. Always deploy to Netlify before sharing links.

---

## Pricing

Pricing is milestone-gated:
- **Free** during traction phase (until 100 unique visitors)
- **$2.99/month** or **$19.99/year** after 30-day free trial
- Stripe integration to be activated at the 100-visitor milestone

---

## Distribution Channels

- WhatsApp groups (Hindu/Jain women communities)
- Facebook groups
- Instagram
- Temples
- YouTube channel (with pinned app links in relevant videos)

---

## Design Principles

**Cultural accuracy over completeness.** Content corrections during development included:
- Paneer removed from strict Hindu vrat food lists where not applicable
- Rice/dal removed from Amavasya food guide
- Mantra text corrections
- Brahma Muhurta timing fix

**Energy framing, not calorie counting.** The food guide uses light/medium/heavy energy categories — a deliberate, culturally resonant choice for this audience.

**Regional sensitivity built-in.** State filtering, location detection for moonrise times, and regional disclaimers acknowledge that vrat practices vary by community and geography.
Content is proprietary — see CONTENT_LICENSE.md
---

## Roadmap

- [ ] Stripe integration (at 100 unique visitor milestone)
- [ ] Custom domain purchase
- [ ] Batch 2 festival kathas: Navratri, Karva Chauth, Shivratri, Janmashtami (on content calendar)
- [ ] Micchami Dukkadam message template feature (Samvatsari)
- [ ] Expanded regional vrat coverage

---

## Calendar References

- **Hindu vrat dates:** [Drik Panchang IST](https://www.drikpanchang.com)
- **Jain vrat dates:** Veer Nirvana Samvat panchang
- Dates should be updated annually each January using the new year's panchang

---

## Content Accuracy Notice

VRAT is committed to cultural accuracy. If you notice any errors in mantra text, food lists, puja steps, or dates, please report them. Accuracy is the core differentiator of this product and a matter of respect for these traditions.

---

*Built with care for Hindu and Jain devotees, wherever they are.*
Rachna Tiwari [vrat-app.netlify.app] (https://vrat-app.netlify.app)*
