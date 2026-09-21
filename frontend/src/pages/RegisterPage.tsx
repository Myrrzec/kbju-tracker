import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/apiClient";
import { Logo } from "../components/Logo";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-8">
      <Logo />
      <form onSubmit={handleSubmit} className="card w-full max-w-md !p-8">
        <h1 className="text-[28px] font-bold mb-8">Регистрация</h1>

        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-5"
        />

        <label className="label" htmlFor="password">Пароль (минимум 8 символов)</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mb-6"
        />

        {error && <p className="text-danger mb-5">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>

        <p className="text-ink-2 mt-6 text-center">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-protein underline underline-offset-4">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
