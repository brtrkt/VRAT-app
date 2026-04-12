import { Link } from "wouter";

export default function PageFooter() {
  return (
    <div className="mt-4 mb-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/50">
      <Link href="/privacy">
        <span className="hover:text-muted-foreground/80 underline underline-offset-2 transition-colors cursor-pointer">
          Privacy Policy
        </span>
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/terms">
        <span className="hover:text-muted-foreground/80 underline underline-offset-2 transition-colors cursor-pointer">
          Terms of Use
        </span>
      </Link>
      <span aria-hidden="true">·</span>
      <a
        href="mailto:hello@vrat.app"
        className="hover:text-muted-foreground/80 underline underline-offset-2 transition-colors"
      >
        Contact Us
      </a>
    </div>
  );
}
