import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen cream-gradient flex items-center justify-center px-4">
      <div className="text-center">
        <span className="font-serif text-6xl text-primary block mb-4">ॐ</span>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          This path doesn't exist, but your devotion does.
        </p>
        <Link href="/" className="saffron-gradient text-white px-6 py-3 rounded-2xl text-sm font-medium inline-block hover:opacity-90 transition-opacity">
          Return Home
        </Link>
      </div>
    </div>
  );
}
