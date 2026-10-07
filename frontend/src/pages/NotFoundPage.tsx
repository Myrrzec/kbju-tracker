import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

export function NotFoundPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found | Macros Tracker";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 gap-8 stagger text-center">
      <Logo />
      <div>
        <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">Page not found</h1>
        <p className="text-ink-2 mt-2">The page you are looking for does not exist or has moved.</p>
      </div>
      <Link to="/" className="btn btn-primary">
        Back to the app
      </Link>
    </div>
  );
}
