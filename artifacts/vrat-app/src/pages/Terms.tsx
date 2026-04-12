import { Link } from "wouter";

const SECTIONS = [
  {
    num: "1",
    title: "What VRAT is",
    body: "VRAT is a cultural and spiritual reference app providing information about Hindu and Jain fasting traditions. It is not a medical app, a healthcare provider, or a substitute for professional medical advice.",
  },
  {
    num: "2",
    title: "No medical advice",
    body: "Nothing in VRAT constitutes medical advice. Fasting can carry health risks for certain individuals. Always consult a qualified healthcare professional before beginning any fasting practice, particularly if you are pregnant, breastfeeding, diabetic, have low blood pressure, a history of eating disorders, or any other health condition.",
  },
  {
    num: "3",
    title: "Accuracy of content",
    body: "We have taken great care to ensure the accuracy of vrat dates, food guidelines, and mantras. However fasting rules vary by region, family tradition, and religious sect. VRAT presents general guidelines — your family tradition and your pandit or religious authority always take precedence.",
  },
  {
    num: "4",
    title: "Jain content",
    body: "Jain fasting rules presented in this app are based on Shvetambara tradition unless otherwise noted. Digambara traditions may differ. Please consult your Jain acharya for guidance specific to your tradition.",
  },
  {
    num: "5",
    title: "Subscription and payments",
    body: "VRAT offers a 30-day free trial followed by a paid subscription. You may cancel at any time. No refunds are offered for partial subscription periods.",
  },
  {
    num: "6",
    title: "Intellectual property",
    body: "All content in VRAT including vrat descriptions, mantras, meal ideas, and hydration guides is original work owned by VRAT. Do not copy or reproduce without permission.",
  },
  {
    num: "7",
    title: "Limitation of liability",
    body: "VRAT is provided as is. We are not liable for any harm arising from fasting practices undertaken based on information in this app.",
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
          <p className="text-xs text-muted-foreground mb-6 tracking-wide">VRAT App · Last updated: April 2026</p>

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
