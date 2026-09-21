import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/apiClient";
import { Logo } from "../components/Logo";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-8">
      <Logo />
      <form onSubmit={handleSubmit} className="card w-full max-w-md !p-8">
        <h1 className="text-[28px] font-bold mb-8">Вход</h1>

        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-5"
        />

        <label className="label" htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          required
          
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mb-6"
        />

        {error && <p className="text-danger mb-5">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="text-ink-2 mt-6 text-center">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-protein underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
