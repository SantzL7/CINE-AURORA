import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { getVideoSource } from '../utils/helpers';

// Função auxiliar para extrair o ID do arquivo do Google Drive
const getDriveFileId = (url) => {
  if (!url) return '';

  // Tenta extrair o ID do arquivo de diferentes formatos de URL
  const fileMatch = url.match(/\/file\/d\/([\w-]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  const openMatch = url.match(/[&?]id=([\w-]+)/);
  if (openMatch && openMatch[1]) return openMatch[1];

  const directMatch = url.match(/^[\w-]{25,}$/);
  if (directMatch) return directMatch[0];

  return '';
};

export default function Player() {
  // Hooks de estado
  const { id, type = 'movie' } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const { currentUser } = useAuth();
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoSources, setVideoSources] = useState([]);

  // Carrega os dados da mídia
  const loadMedia = useCallback(async () => {
    if (!id) return;

    try {
      const collectionName = type === 'series' ? 'series' : 'movies';
      const ref = doc(db, collectionName, id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const mediaData = {
          id: snap.id,
          type: type,
          ...snap.data()
        };
        setMedia(mediaData);
        return mediaData;
      } else {
        console.error('Mídia não encontrada:', { id, type });
        navigate('/app', { replace: true });
        return null;
      }
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
      navigate('/app', { replace: true });
      return null;
    }
  }, [id, type, navigate]);

  // Carrega o primeiro episódio para séries
  const loadFirstEpisode = useCallback(
    async (mediaData) => {
      if (!mediaData || mediaData.type !== 'series') return null;

      try {
        const seasonsRef = collection(db, `series/${id}/seasons`);
        const seasonsQuery = query(seasonsRef, orderBy('number', 'asc'));
        const seasonsSnap = await getDocs(seasonsQuery);

        if (seasonsSnap.empty) return null;

        const firstSeason = seasonsSnap.docs[0];
        const seasonNumber = firstSeason.data().number || 1;

        const episodesRef = collection(db, `series/${id}/seasons/${firstSeason.id}/episodes`);
        const episodesQuery = query(episodesRef, orderBy('number', 'asc'));
        const episodesSnap = await getDocs(episodesQuery);

        if (episodesSnap.empty) return null;

        const firstEpisode = episodesSnap.docs[0];
        const episodeNumber = firstEpisode.data().number || 1;

        return { seasonNumber, episodeNumber };
      } catch (error) {
        console.error('Erro ao carregar primeiro episódio:', error);
        return null;
      }
    },
    [id]
  );

  // Efeito para configurar as fontes de vídeo quando a mídia for carregada
  useEffect(() => {
    if (!media) return;

    const sources = Array.isArray(media.videoUrl) ? media.videoUrl : [media.videoUrl];

    // Se for um link do Google Drive, obtém as URLs de fallback
    if (
      media.videoUrl &&
      typeof media.videoUrl === 'string' &&
      media.videoUrl.includes('drive.google.com')
    ) {
      const driveSources = getVideoSource(media.videoUrl);
      // Garante que driveSources seja um array
      setVideoSources(Array.isArray(driveSources) ? driveSources : [driveSources]);
    } else {
      setVideoSources(sources);
    }
    setCurrentVideoIndex(0);
  }, [media]);

  // Efeito principal de carregamento
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const mediaData = await loadMedia();

        if (mediaData?.type === 'series') {
          const episodeData = await loadFirstEpisode(mediaData);
          if (episodeData) {
            navigate(
              `/watch/series/${id}/season/${episodeData.seasonNumber}/episode/${episodeData.episodeNumber}`,
              { replace: true }
            );
            return;
          }
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        navigate('/app', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadMedia, loadFirstEpisode, id, navigate]);

  // Efeito para salvar o progresso do vídeo
  useEffect(() => {
    if (!currentUser || !media) return;

    const video = videoRef.current;
    if (!video) return;

    let lastSent = 0;
    let isMounted = true;

    const saveProgress = async () => {
      if (!isMounted || !video.duration) return;

      const now = Date.now();
      if (now - lastSent < 5000) return;

      lastSent = now;

      try {
        const ref = doc(db, 'users', currentUser.uid, 'progress', media.id);
        await setDoc(ref, {
          currentTime: video.currentTime,
          duration: video.duration,
          type: media.type,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    };

    video.addEventListener('timeupdate', saveProgress);

    return () => {
      isMounted = false;
      video.removeEventListener('timeupdate', saveProgress);
    };
  }, [currentUser, media]);

  if (isLoading || !media) {
    return (
      <div
        style={{
          backgroundColor: '#0f0f0f',
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.2rem'
        }}
      >
        <div>Carregando {type === 'series' ? 'série' : 'filme'}...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#0f0f0f',
        minHeight: '100vh',
        color: '#fff'
      }}
    >
      <Navbar />
      <main
        style={{
          padding: '20px 5%',
          maxWidth: '1400px',
          margin: '0 auto',
          paddingTop: '80px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
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

          <div
            style={{
              width: '100%',
              maxHeight: '70vh',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              paddingTop: '56.25%' // 16:9 aspect ratio
            }}
          >
            {media?.videoUrl?.includes('drive.google.com') ? (
              <iframe
                src={`https://drive.google.com/file/d/${getDriveFileId(media.videoUrl)}/preview`}
                width="100%"
                height="100%"
                allow="autoplay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#000'
                }}
                title="Player de vídeo"
                allowFullScreen
              ></iframe>
            ) : videoSources.length > 0 ? (
              <video
                ref={videoRef}
                key={`video-${currentVideoIndex}`}
                src={videoSources[currentVideoIndex]}
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
                onError={(e) => {
                  console.error('Erro ao carregar o vídeo:', e);

                  // Tenta a próxima fonte de vídeo
                  if (currentVideoIndex < videoSources.length - 1) {
                    console.log('Tentando próxima fonte de vídeo...');
                    setCurrentVideoIndex((prev) => prev + 1);
                  } else {
                    console.error('Todas as fontes de vídeo falharam');
                  }
                }}
                onLoadedData={() => {
                  console.log('Vídeo carregado com sucesso:', videoSources[currentVideoIndex]);
                }}
              />
            ) : (
              <div
                style={{
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
                }}
              >
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

          <div
            style={{
              padding: '0 20px',
              maxWidth: '1000px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <h1
              style={{
                fontSize: '2rem',
                margin: '0 0 10px 0',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              {media.title}
              {media.year && (
                <span
                  style={{
                    fontSize: '1.2rem',
                    color: '#999',
                    fontWeight: 'normal'
                  }}
                >
                  ({media.year})
                </span>
              )}
            </h1>

            {media.description && (
              <p
                style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: '0 auto',
                  maxWidth: '800px'
                }}
              >
                {media.description}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
