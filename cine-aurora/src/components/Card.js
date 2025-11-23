import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

// URL de imagem padrão
const DEFAULT_THUMBNAIL = "https://via.placeholder.com/300x450?text=Sem+Imagem";

export default function Card({ movie: movieProp, locked = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Garante que movie nunca será undefined ou nulo e define valores padrão
  const movie = useMemo(() => ({
    id: movieProp?.id || '',
    title: movieProp?.title || 'Filme não disponível',
    thumbnailUrl: movieProp?.thumbnailUrl || DEFAULT_THUMBNAIL,
    genres: Array.isArray(movieProp?.genres) ? movieProp.genres : [],
    year: movieProp?.year || '',
    description: movieProp?.description || '',
    type: 'movie'
  }), [movieProp]);

  // Verifica se o filme está na lista de favoritos
  const checkWatchlist = useCallback(async () => {
    if (!currentUser?.uid || !movie.id) {
      setIsInWatchlist(false);
      return;
    }

    try {
      const watchlistRef = doc(db, 'users', currentUser.uid, 'watchlist', movie.id);
      const docSnap = await getDoc(watchlistRef);
      setIsInWatchlist(docSnap.exists());
    } catch (error) {
      console.error('Erro ao verificar lista de favoritos:', error);
      setIsInWatchlist(false);
    }
  }, [currentUser, movie.id]);

  useEffect(() => {
    checkWatchlist();
  }, [checkWatchlist]);

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = useCallback((e) => {
    if (!e?.target) return;
    e.target.onerror = null;
    e.target.src = DEFAULT_THUMBNAIL;
  }, []);

  // Função para alternar o filme na lista de favoritos
  const toggleWatchlist = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!movie.id) {
      console.error('ID do filme inválido');
      return;
    }

    try {
      const watchlistRef = doc(db, 'users', currentUser.uid, 'watchlist', movie.id);
      
      if (isInWatchlist) {
        await deleteDoc(watchlistRef);
        setIsInWatchlist(false);
      } else {
        await setDoc(watchlistRef, {
          id: movie.id,
          type: movie.type,
          title: movie.title || 'Filme sem título',
          thumbnailUrl: movie.thumbnailUrl || DEFAULT_THUMBNAIL,
          addedAt: new Date().toISOString()
        });
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de favoritos:', error);
    }
  }, [currentUser, isInWatchlist, navigate, movie]);

  const handleClick = useCallback(() => {
    if (locked) {
      navigate("/login");
    } else if (movie.id) {
      navigate(`/title/${movie.id}`);
    }
  }, [locked, navigate, movie.id]);

  return (
    <div 
      className="card" 
      onClick={handleClick} 
      title={movie.title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        position: 'relative',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.7 : 1,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        zIndex: isHovered ? 2 : 1,
        width: '200px',
        minWidth: '200px',
        height: 'auto',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ position: 'relative', width: '100%', paddingTop: '150%' }}>
        <img 
          src={movie.thumbnailUrl} 
          alt={`Capa de ${movie.title}`}
          onError={handleImageError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '12px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          <h3 style={{ 
            color: '#fff', 
            margin: '0 0 8px 0',
            fontSize: '0.95rem',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)'
          }}>
            {movie.title}
          </h3>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.8rem'
            }}>
              {movie.year && (
                <span>{movie.year}</span>
              )}
              {movie.genres?.[0] && (
                <span>• {movie.genres[0]}</span>
              )}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(e);
              }}
              style={{
                background: isInWatchlist ? 'rgba(13, 110, 253, 0.9)' : 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                color: '#fff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}
              title={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
              onMouseEnter={(e) => {
                if (isInWatchlist) {
                  e.currentTarget.innerHTML = '×';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (isInWatchlist) {
                  e.currentTarget.innerHTML = '✓';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {isInWatchlist ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>
      
      {locked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}>
          Faça login
        </div>
      )}
    </div>
  );
}
