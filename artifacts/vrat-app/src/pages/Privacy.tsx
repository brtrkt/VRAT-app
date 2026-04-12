import { Link } from "wouter";

export default function Privacy() {
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
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mb-6 tracking-wide">VRAT App · Last updated: April 2026</p>

          <p className="text-sm text-foreground/80 leading-relaxed mb-6">
            We take your privacy seriously. Here is exactly what we do and do not do with your information.
          </p>

          <div className="space-y-5">
            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                What we collect
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                VRAT does not require you to create an account. We do not collect your name, email address, or any personal information unless you voluntarily provide it through our waitlist or contact form. We collect anonymous usage data to understand how people use the app — for example which screens are visited most. We do not collect or store any health data.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                What we never do
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                We never sell your data to anyone. We never share your information with third parties for advertising. We never store your food logs or fasting history on our servers — all logging is local to your device session.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Cookies
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                We use only essential cookies to make the app function. We do not use advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Your rights
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                You have the right to know what data we hold about you. Since we hold no personal data, there is nothing to request. If you have questions email us at{" "}
                <a href="mailto:hello@vrat.app" className="text-primary underline underline-offset-2">hello@vrat.app</a>
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Children
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                VRAT is not intended for children under 13.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Changes
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                We may update this policy. Check this page for updates.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Contact
              </h2>
              <p className="text-sm text-foreground/75 leading-relaxed">
                <a href="mailto:hello@vrat.app" className="text-primary underline underline-offset-2">hello@vrat.app</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
