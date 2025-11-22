import { useNavigate } from "react-router-dom";

// URL de imagem padrão (pode ser substituída por uma imagem local se preferir)
const DEFAULT_THUMBNAIL = "https://via.placeholder.com/300x450?text=Sem+Imagem";

export default function SeriesCard({ series, locked = false }) {
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
      navigate(`/series/${series.id}`);
    }
  }

  return (
    <div className="card" onClick={handleClick} title={series.title}>
      <img 
        className="card__img" 
        src={series.thumbnailUrl || DEFAULT_THUMBNAIL} 
        alt={series.title}
        onError={handleImageError}
      />
      <div className="card__meta">
        <div className="card__title">{series.title}</div>
        {series.seasons && (
          <div className="card__subtitle">{series.seasons.length} Temporadas</div>
        )}
        {typeof series.progress === "number" && series.progress > 0 && (
          <div className="card__progress">
            <div
              className="card__progress-bar"
              style={{ width: `${Math.min(series.progress, 1) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
