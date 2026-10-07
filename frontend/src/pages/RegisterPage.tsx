import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/apiClient";
import { useDelayedFlag } from "../lib/motion";
import { LegalLinks } from "../components/LegalLinks";
import { Logo } from "../components/Logo";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const slow = useDelayedFlag(loading);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 gap-8 stagger">
      <Link to="/" aria-label="Macros Tracker, home" className="rounded-lg">
        <Logo />
      </Link>
      <form onSubmit={handleSubmit} className="card w-full max-w-md !p-8">
        <h1 className="text-[28px] font-bold mb-8">Create account</h1>

        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-5"
        />

        <label className="label" htmlFor="password">Password (at least 8 characters)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mb-6"
        />

        {error && (
          <p role="alert" className="text-danger mb-5 animate-fade">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-[13px] text-ink-2 mt-4 text-center">
          By creating an account you agree to the{" "}
          <Link to="/terms" className="text-ink underline underline-offset-4">
            Terms of Service
          </Link>{" "}
          and the{" "}
          <Link to="/privacy" className="text-ink underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>

        {slow && (
          <p className="text-sm text-ink-2 mt-4 animate-fade" role="status">
            The server is waking up (free hosting). The first request can take up to a minute.
          </p>
        )}

        <p className="text-ink-2 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-protein underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
      <LegalLinks />
    </div>
  );
}
