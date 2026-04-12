import { Link } from "wouter";

export default function PageFooter() {
  return (
    <div className="mt-4 mb-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/60">
      <Link href="/privacy">
        <span className="hover:text-muted-foreground underline underline-offset-2 transition-colors cursor-pointer">
          Privacy Policy
        </span>
      </Link>
      <span>·</span>
      <Link href="/terms">
        <span className="hover:text-muted-foreground underline underline-offset-2 transition-colors cursor-pointer">
          Terms of Use
        </span>
      </Link>
    </div>
  );
}
