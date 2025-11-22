import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <div className="brand-mark" />
        <div className="brand-text">
          <span className="brand-title">Cine Aurora</span>
          <span className="brand-subtitle">Northern Lights Cinema</span>
        </div>
      </div>
      <div className="navbar__nav">
        <button className="navbar__link" onClick={() => navigate("/app")}>Início</button>
        <button className="navbar__link" onClick={() => navigate("/app")}>
          Catálogo
        </button>
        <button className="navbar__link" onClick={() => navigate("/admin")}>
          Admin
        </button>
      </div>
      <button className="btn" onClick={handleLogout}>Sair</button>
    </nav>
  );
}
