import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, profile } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profile.onboardingComplete) return <Navigate to="/inscription" replace />;
  return children;
}

export function AuthRoute({ children }) {
  const { isAuthenticated, profile } = useApp();
  if (isAuthenticated && profile.onboardingComplete) {
    return <Navigate to="/" replace />;
  }
  return children;
}
