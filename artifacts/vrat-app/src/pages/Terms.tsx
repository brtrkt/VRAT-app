import { Link } from "wouter";

const SECTIONS = [
  {
    num: "1",
    title: "What VRAT is",
    body: "VRAT is a cultural and spiritual reference app providing information about fasting traditions across Hindu, Jain, and Sikh dharmas. The Hindu coverage spans twelve sampradayas and regional traditions including Smarta (general Hindu), Swaminarayan / BAPS, ISKCON / Gaudiya Vaishnava, Pushti Marg, Warkari, Ramanandi, Sri Vaishnava, Shakta, Shaiva Siddhanta, and Lingayat. VRAT is not a medical app, a healthcare provider, or a substitute for professional medical advice.",
  },
  {
    num: "2",
    title: "No medical advice",
    body: "Nothing in VRAT constitutes medical advice. Fasting can carry health risks for certain individuals. Always consult a qualified healthcare professional before beginning any fasting practice, particularly if you are pregnant, breastfeeding, diabetic, have low blood pressure, a history of eating disorders, or any other health condition.",
  },
  {
    num: "3",
    title: "Accuracy of content",
    body: "We have taken great care to ensure the accuracy of vrat dates, food guidelines, and mantras. Dates are sourced from authoritative panchangams and sectarian calendars listed in section 4 below. However fasting rules vary by region, family tradition, lineage (parampara), and religious sect, and panchangams themselves can differ on a given tithi by ±1 day depending on sunrise location. VRAT presents general guidelines — your family tradition and your pandit, acharya, granthi, or religious authority always take precedence.",
  },
  {
    num: "4",
    title: "Source attributions per tradition",
    body: "Vrat dates in VRAT are drawn from the following authoritative sources, one per tradition: Hindu (general) — Drik Panchang (drikpanchang.com); Warkari — Marathi Drik Panchang; Swaminarayan / BAPS — BAPS Official Calendar (baps.org); ISKCON / Gaudiya Vaishnava — ISKCON Vaishnava Calendar (vaisnavacalendar.com); Jain — Jain Samvat Calendar (jainsamvat.com); Sikh — Nanakshahi Calendar published by SGPC (sgpc.net); Pushti Marg — Official Tippni VS 2083 published by Vidya Vibhag, Mandir Mandal, Nathdwara (covers Mar 20 2026 → Mar 19 2027), with Drik Panchang fallback for dates outside that window; Lingayat — Drik Panchang (Kannada); Ramanandi — Drik Panchang (Hindi); Sri Vaishnava — Vakya Panchangam, the traditional system used at Srirangam Sri Ranganathaswamy Temple and Tirumala Tirupati Devasthanam; Shakta — Drik Panchang and Shakta Panchang; Shaiva Siddhanta — Thirukanthika Panchangam, the Tamil Shaiva system used at Chidambaram Nataraja, Madurai Meenakshi-Sundareshwarar, and Thiruvannamalai Arunachaleswara temples. Where a panchangam has not yet published the full window for 2026 and 2027, a temporary fallback source is used and clearly noted in the underlying data; these may be updated as new authoritative editions are released.",
  },
  {
    num: "5",
    title: "Sectarian variations",
    body: "Jain fasting rules presented in this app are based on Shvetambara tradition unless otherwise noted; Digambara traditions may differ — please consult your Jain acharya for tradition-specific guidance. Sikh dates follow the Nanakshahi calendar as published by SGPC; some Sikh communities follow the older Bikrami reckoning, which produces different dates for some observances. Vaishnava traditions vary on Ekadashi observance rules (Smarta vs Vaishnava reckoning, viddha tithi handling, paaranam timing) — VRAT defaults to each tradition's own published reckoning.",
  },
  {
    num: "6",
    title: "Subscription and payments",
    body: "VRAT offers a 30-day free trial followed by a paid subscription. You may cancel at any time. No refunds are offered for partial subscription periods.",
  },
  {
    num: "7",
    title: "Intellectual property",
    body: "All content in VRAT including vrat descriptions, mantras, meal ideas, and hydration guides is original work owned by VRAT. Date computations and source attributions reference publicly available panchangams and sectarian calendars credited in section 4. Do not copy or reproduce VRAT content without permission.",
  },
  {
    num: "8",
    title: "Limitation of liability",
    body: "VRAT is provided as is. We are not liable for any harm arising from fasting practices undertaken based on information in this app, nor for any discrepancy between VRAT dates and your local panchangam, temple, or family tradition.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          </Link>
        </div>

        <div className="vrat-card p-6">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Terms of Use</h1>
          <p className="text-xs text-muted-foreground mb-6 tracking-wide">VRAT App · Last updated: April 29, 2026</p>

          <p className="text-sm text-foreground/80 leading-relaxed mb-6">
            By using VRAT you agree to these terms.
          </p>

          <div className="space-y-5">
            {SECTIONS.map((s) => (
              <section key={s.num}>
                <h2 className="font-semibold text-sm text-foreground mb-2 flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                    style={{ backgroundColor: "#E07B2A" }}
                  >
                    {s.num}
                  </span>
                  {s.title}
                </h2>
                <p className="text-sm text-foreground/75 leading-relaxed pl-7">
                  {s.body}
                </p>
              </section>
            ))}

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-start gap-2">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: "#E07B2A" }}
                >
                  8
                </span>
                Contact
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed pl-7">
                <a href="mailto:hello@vrat.app" className="text-primary underline underline-offset-2">
                  hello@vrat.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
