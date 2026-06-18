import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Logo from "./Logo";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";
import { isNative } from "../utils/platform";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isNative) {
    return (
      <div className="app-layout app-layout--native">
        <MobileHeader />
        <main className="main-content main-content--native">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <header className="mobile-header">
        <Logo size="xs" />
        <button
          type="button"
          className="burger-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <Sidebar isOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
