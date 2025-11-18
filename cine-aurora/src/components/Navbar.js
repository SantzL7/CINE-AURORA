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
      <div className="navbar__brand">Cine Aurora</div>
      <button className="btn" onClick={handleLogout}>Sair</button>
    </nav>
  );
}
