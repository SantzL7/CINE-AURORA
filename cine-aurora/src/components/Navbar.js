import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar__brand" onClick={() => navigate("/app")} style={{ cursor: "pointer", display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src="/logo192.png" 
          alt="Logo CineAurora" 
          style={{ height: '40px', width: 'auto' }}
        />
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>CineAurora</span>
      </div>

      <nav className="navbar__nav">
        <button
          className={`navbar__link${location.pathname === "/app" && !location.search ? " navbar__link--active" : ""}`}
          onClick={() => navigate("/app")}
        >
          Home
        </button>
        <button
          className={`navbar__link${location.search === "?type=movie" ? " navbar__link--active" : ""}`}
          onClick={() => navigate("/app?type=movie")}
        >
          Filmes
        </button>
        <button
          className={`navbar__link${location.search === "?type=series" ? " navbar__link--active" : ""}`}
          onClick={() => navigate("/app?type=series")}
        >
          Séries
        </button>
        <button
          className={`navbar__link${location.pathname === "/my-list" ? " navbar__link--active" : ""}`}
          onClick={() => navigate("/my-list")}
        >
          Minha lista
        </button>
      </nav>

      <div className="navbar__right">
        {currentUser?.email === "matheus0mendes0marinho@gmail.com" && (
          <button
            className="btn"
            type="button"
            onClick={() => navigate("/admin")}
          >
            Admin
          </button>
        )}
        <button
          className="navbar__icon"
          aria-label="Buscar"
          onClick={() => navigate("/search")}
        >
          🔍
        </button>
        <button className="btn" onClick={handleLogout}>Sair</button>
      </div>
    </header>
  );
}
