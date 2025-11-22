import { useNavigate } from "react-router-dom";

// URL de imagem padrão (pode ser substituída por uma imagem local se preferir)
const DEFAULT_THUMBNAIL = "https://via.placeholder.com/300x450?text=Sem+Imagem";

export default function Card({ movie, locked = false }) {
  const navigate = useNavigate();

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (e) => {
    e.target.onerror = null; // Previne loops de erro
    e.target.src = DEFAULT_THUMBNAIL;
  };

  function handleClick() {
    if (locked) {
      navigate("/login");
    } else {
      navigate(`/title/${movie.id}`);
    }
  }

  return (
    <div className="card" onClick={handleClick} title={movie.title}>
      <img 
        className="card__img" 
        src={movie.thumbnailUrl || DEFAULT_THUMBNAIL} 
        alt={movie.title}
        onError={handleImageError}
      />
      <div className="card__meta">
        <div className="card__title">{movie.title}</div>
        {typeof movie.progress === "number" && movie.progress > 0 && (
          <div className="card__progress">
            <div
              className="card__progress-bar"
              style={{ width: `${Math.min(movie.progress, 1) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
