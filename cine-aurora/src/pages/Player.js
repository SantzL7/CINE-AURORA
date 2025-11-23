import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Player() {
  const { id, type = 'movie' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [media, setMedia] = useState(null);
  const { currentUser } = useAuth();
  const videoRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      
      try {
        // Determina a coleção com base no tipo (filme ou série)
        const collectionName = type === 'series' ? 'series' : 'movies';
        const ref = doc(db, collectionName, id);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          setMedia({ 
            id: snap.id, 
            type: type,
            ...snap.data() 
          });
        } else {
          console.error('Mídia não encontrada:', { id, type });
          navigate("/app", { replace: true });
        }
      } catch (error) {
        console.error('Erro ao carregar mídia:', error);
        navigate("/app", { replace: true });
      }
    }
    
    load();
  }, [id, type, navigate]);

  useEffect(() => {
    if (!currentUser || !media) return;
    const video = videoRef.current;
    if (!video) return;

    let lastSent = 0;

    async function saveProgress() {
      if (!currentUser || !media || !video.duration) return;
      const now = Date.now();
      if (now - lastSent < 5000) return; // a cada ~5s
      lastSent = now;
      
      const ref = doc(db, "users", currentUser.uid, "progress", media.id);
      await setDoc(ref, {
        currentTime: video.currentTime,
        duration: video.duration,
        type: media.type,
        updatedAt: new Date(),
      });
    }

    video.addEventListener("timeupdate", saveProgress);
    return () => {
      video.removeEventListener("timeupdate", saveProgress);
    };
  }, [currentUser, media]);

  if (!media) {
    return (
      <div style={{
        backgroundColor: '#0f0f0f',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem'
      }}>
        <div>Carregando {type === 'series' ? 'série' : 'filme'}...</div>
      </div>
    );
  }

  // Efeito para redirecionar para o primeiro episódio quando for uma série
  useEffect(() => {
    if (media?.type === 'series') {
      async function loadFirstEpisode() {
        try {
          // Busca a primeira temporada
          const seasonsRef = collection(db, `series/${id}/seasons`);
          const seasonsQuery = query(seasonsRef, orderBy('number', 'asc'));
          const seasonsSnap = await getDocs(seasonsQuery);
          
          if (!seasonsSnap.empty) {
            const firstSeason = seasonsSnap.docs[0];
            const seasonNumber = firstSeason.data().number || 1;
            
            // Busca o primeiro episódio da primeira temporada
            const episodesRef = collection(db, `series/${id}/seasons/${firstSeason.id}/episodes`);
            const episodesQuery = query(episodesRef, orderBy('number', 'asc'));
            const episodesSnap = await getDocs(episodesQuery);
            
            if (!episodesSnap.empty) {
              const firstEpisode = episodesSnap.docs[0];
              const episodeNumber = firstEpisode.data().number || 1;
              
              // Redireciona para o player do primeiro episódio
              navigate(`/watch/series/${id}/season/${seasonNumber}/episode/${episodeNumber}`, { replace: true });
            }
          }
        } catch (error) {
          console.error("Erro ao carregar primeiro episódio:", error);
          // Em caso de erro, redireciona para a página inicial
          navigate('/', { replace: true });
        }
      }
      
      loadFirstEpisode();
    }
  }, [id, navigate, media]);
  
  if (!media) {
    return (
      <div style={{
        backgroundColor: '#0f0f0f',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>Carregando episódio...</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0f0f0f',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <Navbar />
      <main style={{
        padding: '20px 5%',
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: '80px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Voltar
            </button>
          </div>
          
          <div style={{
            width: '100%',
            maxHeight: '70vh',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            paddingTop: '56.25%' /* 16:9 Aspect Ratio */
          }}>
            <video
              ref={videoRef}
              src={media.videoUrl}
              controls
              autoPlay
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                outline: 'none',
                display: 'block',
                backgroundColor: '#000'
              }}
            />
            {!media.videoUrl && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111',
                color: '#fff',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚫</div>
                <h3>Vídeo não disponível</h3>
                <p>O vídeo solicitado não pôde ser carregado.</p>
                <button 
                  onClick={() => navigate(-1)}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#e50914',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Voltar
                </button>
              </div>
            )}
          </div>

          <div style={{
            padding: '0 20px',
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2rem',
              margin: '0 0 10px 0',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {media.title}
              {media.year && (
                <span style={{
                  fontSize: '1.2rem',
                  color: '#999',
                  fontWeight: 'normal'
                }}>
                  ({media.year})
                </span>
              )}
            </h1>
            
            {media.description && (
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.7',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '0 auto',
                maxWidth: '800px'
              }}>
                {media.description}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
