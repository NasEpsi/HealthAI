import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "./Logo";
import { useApp } from "../context/AppContext";

export default function MobileHeader() {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="mobile-header">
      <Logo size="sm" />
      <button
        type="button"
        className="mobile-header__logout"
        onClick={handleLogout}
        aria-label="Se déconnecter"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}
