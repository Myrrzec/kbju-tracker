import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/apiClient";
import { useDelayedFlag } from "../lib/motion";
import { LegalLinks } from "../components/LegalLinks";
import { Logo } from "../components/Logo";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const slow = useDelayedFlag(loading);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in");
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
        <h1 className="text-[28px] font-bold mb-8">Sign in</h1>

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

        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
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
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {slow && (
          <p className="text-sm text-ink-2 mt-4 animate-fade" role="status">
            The server is waking up (free hosting). The first request can take up to a minute.
          </p>
        )}

        <p className="text-ink-2 mt-6 text-center">
          No account yet?{" "}
          <Link to="/register" className="text-protein underline underline-offset-4">
            Create one
          </Link>
        </p>
      </form>
      <LegalLinks />
    </div>
  );
}
