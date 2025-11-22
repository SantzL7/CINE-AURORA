import { useState, useEffect } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function MovieCarousel() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRandomMovies() {
      try {
        // Busca todos os filmes
        const moviesRef = collection(db, "movies");
        const snapshot = await getDocs(moviesRef);
        
        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        // Converte para array e seleciona 5 filmes aleatórios
        const allMovies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const shuffled = [...allMovies].sort(() => 0.5 - Math.random());
        const selectedMovies = shuffled.slice(0, 5);
        
        setMovies(selectedMovies);
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRandomMovies();
  }, []);

  // Efeito para trocar automaticamente os filmes a cada 5 segundos
  useEffect(() => {
    if (movies.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [movies.length]);

  if (loading) {
    return (
      <div className="carousel-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null; // Não mostra nada se não houver filmes
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="carousel">
      <div 
        className="carousel-content"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(5, 7, 11, 0.95) 0%, rgba(5, 7, 11, 0.7) 100%), url(${currentMovie.thumbnailUrl})`,
        }}
      >
        <div className="carousel-info">
          <h1 className="carousel-title">{currentMovie.title}</h1>
          <p className="carousel-desc">
            {currentMovie.description?.length > 200 
              ? `${currentMovie.description.substring(0, 200)}...` 
              : currentMovie.description}
          </p>
          <div className="carousel-buttons">
            <button 
              className="btn primary"
              onClick={() => navigate(`/watch/${currentMovie.id}`)}
            >
              Assistir agora
            </button>
            <button 
              className="btn ghost"
              onClick={() => navigate(`/details/${currentMovie.id}`)}
            >
              Mais informações
            </button>
          </div>
        </div>
        
        <div className="carousel-indicators">
          {movies.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir para o filme ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
