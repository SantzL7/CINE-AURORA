import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <button className="sidebar__item" onClick={() => navigate("/app")}>
        <span className="sidebar__dot" />
        <span className="sidebar__label">Início</span>
      </button>
      <button className="sidebar__item" onClick={() => navigate("/app")}>
        <span className="sidebar__dot" />
        <span className="sidebar__label">Filmes</span>
      </button>
      <button className="sidebar__item" onClick={() => navigate("/app")}>
        <span className="sidebar__dot" />
        <span className="sidebar__label">Séries</span>
      </button>
      <button className="sidebar__item" onClick={() => navigate("/admin")}>
        <span className="sidebar__dot sidebar__dot--accent" />
        <span className="sidebar__label">Admin</span>
      </button>
    </aside>
  );
}
