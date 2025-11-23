import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

// URL de imagem padrão
const DEFAULT_THUMBNAIL = "https://via.placeholder.com/300x450?text=Sem+Imagem";

export default function SeriesCard({ series: seriesProp, locked = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Garante que series nunca será undefined ou nulo e define valores padrão
  const series = {
    id: seriesProp?.id || '',
    title: seriesProp?.title || 'Série não disponível',
    thumbnailUrl: seriesProp?.thumbnailUrl || DEFAULT_THUMBNAIL,
    genres: Array.isArray(seriesProp?.genres) ? seriesProp.genres : [],
    year: seriesProp?.year || '',
    type: seriesProp?.type || 'series', // Garante que o tipo está definido
    description: seriesProp?.description || ''
  };

  // Verifica se a série está na lista de favoritos
  const checkWatchlist = useCallback(async () => {
    if (!currentUser?.uid || !series.id) {
      setIsInWatchlist(false);
      return;
    }

    try {
      const watchlistRef = doc(db, 'users', currentUser.uid, 'watchlist', series.id);
      const docSnap = await getDoc(watchlistRef);
      setIsInWatchlist(docSnap.exists());
    } catch (error) {
      console.error('Erro ao verificar lista de favoritos:', error);
      setIsInWatchlist(false);
    }
  }, [currentUser, series.id]);

  useEffect(() => {
    checkWatchlist();
  }, [checkWatchlist]);

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = useCallback((e) => {
    if (!e?.target) return;
    e.target.onerror = null;
    e.target.src = DEFAULT_THUMBNAIL;
  }, []);

  // Função para alternar a série na lista de favoritos
  const toggleWatchlist = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!series.id) {
      console.error('ID da série inválido');
      return;
    }

    try {
      const watchlistRef = doc(db, 'users', currentUser.uid, 'watchlist', series.id);
      
      if (isInWatchlist) {
        await deleteDoc(watchlistRef);
        setIsInWatchlist(false);
      } else {
        await setDoc(watchlistRef, {
          id: series.id,
          type: series.type, // Usa o tipo da série
          title: series.title || 'Série sem título',
          thumbnailUrl: series.thumbnailUrl || DEFAULT_THUMBNAIL,
          addedAt: new Date().toISOString()
        });
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de favoritos:', error);
    }
  }, [currentUser, isInWatchlist, navigate, series]);

  const handleClick = useCallback(() => {
    if (!series.id) {
      console.error('ID da série inválido');
      return;
    }
    
    if (locked) {
      navigate("/login");
    } else {
      navigate(`/series/${series.id}`);
    }
  }, [locked, navigate, series.id]);

  return (
    <div 
      className="card" 
      onClick={handleClick} 
      title={series.title}
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
          src={series.thumbnailUrl} 
          alt={`Capa de ${series.title}`}
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
            {series.title}
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
              {series.year && (
                <span>{series.year}</span>
              )}
              {series.genres?.[0] && (
                <span>• {series.genres[0]}</span>
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
                fontSize: '1rem',
                ':hover': {
                  transform: 'scale(1.1)'
                }
              }}
              title={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
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
