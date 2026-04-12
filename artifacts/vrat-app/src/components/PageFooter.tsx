import { Link } from "wouter";

export default function PageFooter() {
  return (
    <div className="mt-4 mb-2 text-center">
      <Link href="/privacy">
        <span className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors cursor-pointer">
          Privacy Policy
        </span>
      </Link>
    </div>
  );
}
