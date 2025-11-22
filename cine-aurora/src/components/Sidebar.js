import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { key: "home", path: "/app", title: "Início", label: "Início", iconChar: "⌂" },
  { key: "series", path: "/app", title: "Séries", label: "Séries", iconChar: "📺" },
  { key: "mylist", path: "/app", title: "Minha lista", label: "Minha lista", iconChar: "★" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin =
    currentUser?.email === "matheus0mendes0marinho@gmail.com";

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <button
          type="button"
          className="sidebar__avatar sidebar__avatar--large sidebar__avatar-btn"
          onClick={() => setProfileOpen((open) => !open)}
          title={currentUser?.email || "Perfil"}
        >
          {(currentUser?.email || "?").charAt(0).toUpperCase()}
        </button>
        {profileOpen && (
          <div className="sidebar__profile-menu">
            <div className="sidebar__profile-email">
              {currentUser?.email || "Convidado"}
            </div>
            {isAdmin && (
              <button
                type="button"
                className="sidebar__profile-item"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/admin");
                }}
              >
                ⚙ Painel admin
              </button>
            )}
          </div>
        )}
        <button
          className="sidebar__icon-btn sidebar__icon-btn--search"
          type="button"
          title="Buscar"
        >
          <span className="sidebar__icon sidebar__icon--search" />
          <span className="sidebar__icon-label">Buscar</span>
        </button>
        <nav className="sidebar__nav sidebar__nav--icons">
          {navItems.map((item) => {
            const active =
              item.path !== "/app"
                ? location.pathname.startsWith(item.path)
                : location.pathname === "/app";
            return (
              <button
                key={item.key}
                className={`sidebar__icon-btn${active ? " sidebar__icon-btn--active" : ""}`}
                onClick={() => navigate(item.path)}
                title={item.title}
              >
                <span className="sidebar__icon">{item.iconChar}</span>
                <span className="sidebar__icon-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar__footer sidebar__footer--minimal">
        <button
          className="sidebar__icon-btn"
          onClick={handleLogout}
          title="Sair"
        >
          <span className="sidebar__icon sidebar__icon--logout" />
          <span className="sidebar__icon-label">Sair</span>
        </button>
      </div>
    </aside>
  );
}
