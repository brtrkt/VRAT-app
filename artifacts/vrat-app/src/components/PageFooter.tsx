import { Link } from "wouter";

export default function PageFooter() {
  return (
    <div className="mt-4 mb-2 flex items-center justify-center flex-wrap gap-1 text-[11px] text-muted-foreground/50">
      <Link href="/privacy">
        <span className="inline-flex items-center min-h-[44px] px-2 hover:text-muted-foreground/80 underline underline-offset-2 transition-colors cursor-pointer">
          Privacy Policy
        </span>
      </Link>
      <span aria-hidden="true" className="opacity-40">·</span>
      <Link href="/terms">
        <span className="inline-flex items-center min-h-[44px] px-2 hover:text-muted-foreground/80 underline underline-offset-2 transition-colors cursor-pointer">
          Terms of Use
        </span>
      </Link>
      <span aria-hidden="true" className="opacity-40">·</span>
      <a
        href="mailto:hello@vrat.app"
        className="inline-flex items-center min-h-[44px] px-2 hover:text-muted-foreground/80 underline underline-offset-2 transition-colors"
      >
        Contact Us
      </a>
    </div>
  );
}
