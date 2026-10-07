import { Link } from "react-router-dom";

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[13px] text-ink-2 flex flex-wrap gap-x-5 gap-y-1 ${className}`}>
      <Link to="/privacy" className="hover:text-ink transition-colors underline-offset-4 hover:underline">
        Privacy Policy
      </Link>
      <Link to="/terms" className="hover:text-ink transition-colors underline-offset-4 hover:underline">
        Terms of Service
      </Link>
      <span>© 2026 Macros Tracker</span>
    </p>
  );
}
