import { NavLink } from "react-router-dom";
import { Home, Camera, BookOpen, UtensilsCrossed, Dumbbell, Users, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Accueil", end: true },
  { to: "/scanner", icon: Camera, label: "Scanner" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/plans-repas", icon: UtensilsCrossed, label: "Repas" },
  { to: "/sport", icon: Dumbbell, label: "Sport" },
  { to: "/fil", icon: Users, label: "Fil" },
  { to: "/profil", icon: User, label: "Profil" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `bottom-nav__link${isActive ? " bottom-nav__link--active" : ""}`
          }
        >
          <Icon size={22} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
