import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
  const movie = {
    id: movieProp?.id || '',
    title: movieProp?.title || 'Filme não disponível',
    thumbnailUrl: movieProp?.thumbnailUrl || DEFAULT_THUMBNAIL,
    genres: Array.isArray(movieProp?.genres) ? movieProp.genres : [],
    year: movieProp?.year || '',
    description: movieProp?.description || '',
    type: 'movie'
  };

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
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        zIndex: isHovered ? 2 : 1,
        width: '220px',
        minWidth: '220px',
        height: 'auto',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '142.2%',
          cursor: 'pointer'
        }}
        onClick={handleClick}
      >
        <div className="card__image-container" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          <img 
            src={movie.thumbnailUrl} 
            alt={`Capa de ${movie.title}`}
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        </div>
        
        <div 
          className="card__overlay" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.8) 100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '16px',
            zIndex: 2,
            cursor: 'pointer'
          }}
          onClick={handleClick}
        >
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>
            {movie.title}
          </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          gap: '8px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/title/${movie.id}`);
            }}
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
          >
            Assistir
          </button>
          
        </div>
      
          <div style={{ 
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 3
          }}>
            <button 
              onClick={toggleWatchlist}
              style={{
                background: isInWatchlist ? '#0d6efd' : 'rgba(0, 0, 0, 0.7)',
                border: isInWatchlist ? '2px solid #0d6efd' : '2px solid rgba(255, 255, 255, 0.7)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                opacity: isHovered ? 1 : 0.9,
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              title={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
              onMouseEnter={(e) => {
                if (isInWatchlist) {
                  e.currentTarget.innerHTML = '×';
                }
              }}
              onMouseLeave={(e) => {
                if (isInWatchlist) {
                  e.currentTarget.innerHTML = '✓';
                }
              }}
            >
              {isInWatchlist ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Título abaixo da imagem */}
      <div style={{ 
        padding: '8px 0 0 0',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '0.9rem',
          fontWeight: '500',
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 4px',
          lineHeight: '1.2'
        }}>
          {movie.title}
        </h3>
        
        {(movie.year || movie.genres?.length > 0) && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            padding: '0 4px',
            color: 'var(--muted)',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {movie.year && (
              <span>{movie.year}</span>
            )}
            {movie.year && movie.genres?.length > 0 && (
              <span>•</span>
            )}
            {movie.genres?.slice(0, 1).map((genre, index) => (
              <span key={index}>{genre}</span>
            ))}
            {movie.genres?.length > 1 && (
              <span>+{movie.genres.length - 1}</span>
            )}
          </div>
        )}
      </div>
      
      {locked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontWeight: '600',
          pointerEvents: 'none',
          zIndex: 3
        }}>
          Faça login para assistir
        </div>
      )}
    </div>
  );
}
