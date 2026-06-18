import { createElement } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Camera,
  BookOpen,
  UtensilsCrossed,
  Dumbbell,
  Users,
  User,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import { useApp } from "../context/AppContext";

const navItems = [
  { to: "/", icon: Home, label: "Accueil", end: true },
  { to: "/scanner", icon: Camera, label: "Scanner" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/plans-repas", icon: UtensilsCrossed, label: "Plans repas" },
  { to: "/sport", icon: Dumbbell, label: "Sport" },
  { to: "/fil", icon: Users, label: "Fil" },
  { to: "/profil", icon: User, label: "Profil" },
];

export default function Sidebar({ isOpen = false, onNavigate }) {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate("/login");
  };

  return (
    <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <div className="sidebar__brand">
        <Logo size="md" />
      </div>
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            {createElement(icon, { size: 20, strokeWidth: 2 })}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__logout">
        <button type="button" className="sidebar__link" onClick={handleLogout}>
          <LogOut size={20} strokeWidth={2} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
