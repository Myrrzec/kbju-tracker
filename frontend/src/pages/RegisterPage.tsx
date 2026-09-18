import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/apiClient";

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-brand-700 mb-6">Регистрация</h1>

        <label className="block text-sm text-neutral-600 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4 outline-none focus:border-brand-500"
        />

        <label className="block text-sm text-neutral-600 mb-1">Пароль (минимум 8 символов)</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4 outline-none focus:border-brand-500"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>

        <p className="text-sm text-neutral-500 mt-4 text-center">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-brand-600 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
