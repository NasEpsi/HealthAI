import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function AuthLoading() {
  return (
    <div className="auth-page">
      <p className="auth-card__welcome">Chargement…</p>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { authLoading, isAuthenticated, profile } = useApp();

  if (authLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profile.onboardingComplete) return <Navigate to="/inscription" replace />;
  return children;
}

export function AuthRoute({ children }) {
  const { authLoading, isAuthenticated, profile } = useApp();

  if (authLoading) return <AuthLoading />;
  if (isAuthenticated && profile.onboardingComplete) {
    return <Navigate to="/" replace />;
  }
  return children;
}
