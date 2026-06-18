import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useApp } from "../context/AppContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userProfile = await login(email, password);
      if (userProfile.onboardingComplete) {
        navigate("/");
      } else {
        navigate("/inscription");
      }
    } catch (err) {
      setError(err.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Logo centered size="lg" />
          <p className="auth-card__welcome">
            Bon retour ! Connectez-vous pour accéder à votre session
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Adresse mail</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="Ex : nom@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? "Connexion…" : "Connectez-vous"}
          </button>
        </form>

        <div className="auth-card__footer">
          <span>Mot de passe oublié ?</span>
          <span>
            Vous n&apos;avez pas de compte ?{" "}
            <Link to="/inscription" className="link-primary">
              Inscrivez-vous
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
