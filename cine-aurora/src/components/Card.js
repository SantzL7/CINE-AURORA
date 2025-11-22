import { useNavigate } from "react-router-dom";

export default function Card({ movie, locked = false }) {
  const navigate = useNavigate();

  function handleClick() {
    if (locked) {
      navigate("/login");
    } else {
      navigate(`/watch/${movie.id}`);
    }
  }

  return (
    <div className="card" onClick={handleClick} title={movie.title}>
      <img className="card__img" src={movie.thumbnailUrl} alt={movie.title} />
      <div className="card__meta">
        <div className="card__title">{movie.title}</div>
      </div>
    </div>
  );
}
