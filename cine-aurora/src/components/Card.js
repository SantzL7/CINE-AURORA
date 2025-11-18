import { useNavigate } from "react-router-dom";

export default function Card({ movie }) {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/watch/${movie.id}`)} title={movie.title}>
      <img className="card__img" src={movie.thumbnailUrl} alt={movie.title} />
      <div className="card__meta">
        <div className="card__title">{movie.title}</div>
      </div>
    </div>
  );
}
