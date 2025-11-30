import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

export default function EpisodePlayer() {
  const { seriesId, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const videoRef = useRef(null);

  const [series, setSeries] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextEpisode, setNextEpisode] = useState(null);

  useEffect(() => {
    async function loadEpisode() {
      try {
        setLoading(true);

        // Carrega os dados da série
        const seriesRef = doc(db, 'series', seriesId);
        const seriesSnap = await getDoc(seriesRef);

        if (!seriesSnap.exists()) {
          throw new Error('Série não encontrada');
        }

        setSeries({ id: seriesSnap.id, ...seriesSnap.data() });

        // Carrega a temporada específica
        const seasonsRef = collection(db, `series/${seriesId}/seasons`);
        const seasonQuery = query(seasonsRef, where('number', '==', parseInt(seasonNumber)));
        const seasonSnap = await getDocs(seasonQuery);

        if (seasonSnap.empty) {
          throw new Error('Temporada não encontrada');
        }

        const seasonData = seasonSnap.docs[0];
        const seasonId = seasonData.id;

        // Carrega o episódio específico
        const episodesRef = collection(db, `series/${seriesId}/seasons/${seasonId}/episodes`);
        const episodeQuery = query(episodesRef, where('number', '==', parseInt(episodeNumber)));
        const episodeSnap = await getDocs(episodeQuery);

        if (episodeSnap.empty) {
          throw new Error('Episódio não encontrado');
        }

        const episodeData = {
          id: episodeSnap.docs[0].id,
          ...episodeSnap.docs[0].data(),
          seasonNumber: parseInt(seasonNumber),
          episodeNumber: parseInt(episodeNumber)
        };

        setEpisode(episodeData);

        // Tenta encontrar o próximo episódio na mesma temporada
        const currentSeasonEpisodesRef = collection(
          db,
          `series/${seriesId}/seasons/${seasonId}/episodes`
        );
        const currentSeasonEpisodesQuery = query(
          currentSeasonEpisodesRef,
          orderBy('number', 'asc')
        );
        const currentSeasonEpisodesSnap = await getDocs(currentSeasonEpisodesQuery);

        const episodes = [];
        currentSeasonEpisodesSnap.forEach((doc) => {
          episodes.push({
            id: doc.id,
            ...doc.data(),
            episodeNumber: doc.data().number || 0
          });
        });

        // Encontra o índice do episódio atual
        const currentIndex = episodes.findIndex(
          (ep) => ep.episodeNumber === parseInt(episodeNumber)
        );

        // Se houver próximo episódio na mesma temporada, define-o
        if (currentIndex < episodes.length - 1) {
          setNextEpisode({
            ...episodes[currentIndex + 1],
            seasonNumber: parseInt(seasonNumber)
          });
        } else {
          // Se for o último episódio da temporada, verifica se há próxima temporada
          const seasonsRef = collection(db, `series/${seriesId}/seasons`);
          const nextSeasonQuery = query(
            seasonsRef,
            where('number', '==', parseInt(seasonNumber) + 1)
          );
          const nextSeasonSnap = await getDocs(nextSeasonQuery);

          if (!nextSeasonSnap.empty) {
            const nextSeasonData = nextSeasonSnap.docs[0];
            const nextSeasonId = nextSeasonData.id;

            // Busca o primeiro episódio da próxima temporada
            const nextEpisodesRef = collection(
              db,
              `series/${seriesId}/seasons/${nextSeasonId}/episodes`
            );
            const nextEpisodesQuery = query(nextEpisodesRef, orderBy('number', 'asc'), limit(1));
            const nextEpisodesSnap = await getDocs(nextEpisodesQuery);

            if (!nextEpisodesSnap.empty) {
              const nextEpDoc = nextEpisodesSnap.docs[0];
              setNextEpisode({
                ...nextEpDoc.data(),
                id: nextEpDoc.id,
                seasonNumber: parseInt(seasonNumber) + 1,
                episodeNumber: nextEpDoc.data().number || 1
              });
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar episódio:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    if (seriesId && seasonNumber && episodeNumber) {
      loadEpisode();
    }
  }, [seriesId, seasonNumber, episodeNumber]);

  // Atualiza o progresso do usuário
  useEffect(() => {
    if (!currentUser || !episode) return;

    const video = videoRef.current;
    if (!video) return;

    let lastSent = 0;
    let timeoutId = null;

    async function saveProgress() {
      if (!currentUser || !episode || !video.duration) return;

      const now = Date.now();
      if (now - lastSent < 5000) return; // A cada ~5s
      lastSent = now;

      const progressData = {
        seriesId: series.id,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        currentTime: video.currentTime,
        duration: video.duration,
        updatedAt: new Date(),
        title: episode.title || `Episódio ${episode.episodeNumber}`,
        thumbnailUrl: episode.thumbnailUrl || series.thumbnailUrl
      };

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docId = `${series.id}-${episode.seasonNumber}-${episode.episodeNumber}`;
        const progressRef = doc(db, 'users', currentUser.uid, 'watching', docId);

        // Primeiro, verifica se já existe um documento de progresso
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          // Se existir, atualiza
          await updateDoc(progressRef, progressData);
        } else {
          // Se não existir, cria um novo
          await setDoc(progressRef, progressData);

          // Adiciona à lista de assistindo do usuário
          await updateDoc(
            userRef,
            {
              watching: arrayUnion({
                seriesId: series.id,
                seasonNumber: episode.seasonNumber,
                episodeNumber: episode.episodeNumber,
                title: episode.title || `Episódio ${episode.episodeNumber}`,
                thumbnailUrl: episode.thumbnailUrl || series.thumbnailUrl || ''
              })
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.error('Erro ao salvar progresso:', err);
      }
    }

    function handleTimeUpdate() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(saveProgress, 1000);
    }

    async function handleVideoEnd() {
      // Marcar episódio como concluído
      if (currentUser && episode && series) {
        try {
          const progressRef = doc(
            db,
            'users',
            currentUser.uid,
            'watching',
            `${series.id}-${episode.seasonNumber}-${episode.episodeNumber}`
          );

          // Primeiro, verifica se já existe um documento de progresso
          const progressSnap = await getDoc(progressRef);

          const completedData = {
            seriesId: series.id,
            seasonNumber: episode.seasonNumber,
            episodeNumber: episode.episodeNumber,
            completed: true,
            completedAt: new Date(),
            title: episode.title || `Episódio ${episode.episodeNumber}`,
            thumbnailUrl: episode.thumbnailUrl || series.thumbnailUrl || '',
            // Mantém o progresso atual se existir
            ...(progressSnap.exists()
              ? {
                  currentTime: progressSnap.data().currentTime,
                  duration: progressSnap.data().duration,
                  updatedAt: new Date()
                }
              : {})
          };

          // Atualiza ou cria o documento de progresso
          if (progressSnap.exists()) {
            await updateDoc(progressRef, completedData);
          } else {
            await setDoc(progressRef, completedData);

            // Adiciona à lista de assistindo do usuário
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(
              userRef,
              {
                watching: arrayUnion({
                  seriesId: series.id,
                  seasonNumber: episode.seasonNumber,
                  episodeNumber: episode.episodeNumber,
                  title: episode.title || `Episódio ${episode.episodeNumber}`,
                  thumbnailUrl: episode.thumbnailUrl || series.thumbnailUrl || ''
                })
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.error('Erro ao marcar episódio como concluído:', err);
        }
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnd);

    // Carrega o tempo salvo, se existir
    async function loadProgress() {
      if (!currentUser || !video || !series || !episode) {
        return;
      }

      try {
        const docId = `${series.id}-${episode.seasonNumber}-${episode.episodeNumber}`;

        const progressRef = doc(db, 'users', currentUser.uid, 'watching', docId);

        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          const data = progressSnap.data();

          // Se o vídeo não foi concluído ou foi concluído recentemente, retoma do último ponto salvo
          if (
            (!data.completed ||
              (data.completedAt && new Date() - data.completedAt < 1000 * 60 * 60 * 24)) &&
            data.currentTime &&
            data.duration
          ) {
            // Se faltar menos de 10% para acabar, começa do início
            if (data.currentTime / data.duration > 0.9) {
              video.currentTime = 0;
            } else {
              // Retoma do ponto salvo, mas não mais que 5 segundos atrás
              const resumeTime = Math.max(0, data.currentTime - 5);
              video.currentTime = resumeTime;
            }
          } else if (data.completed) {
            // Se o episódio foi concluído, começa do início
            video.currentTime = 0;
          }
        }
      } catch (err) {
        console.error('Erro ao carregar progresso:', err);
      }
    }

    loadProgress();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnd);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentUser, episode, series, seriesId, seasonNumber, episodeNumber]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>Carregando episódio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorMessage}>
          <h2>Erro ao carregar o episódio</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorMessage}>
          <h2>Episódio não encontrado</h2>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.videoContainer}>
          <div style={styles.videoWrapper}>
            <video
              ref={videoRef}
              src={episode.videoUrl}
              controls
              autoPlay
              style={styles.video}
              playsInline
            />

            {!episode.videoUrl && (
              <div style={styles.videoError}>
                <div style={styles.videoErrorContent}>
                  <div style={styles.videoErrorIcon}>🚫</div>
                  <h3>Vídeo não disponível</h3>
                  <p>O vídeo solicitado não pôde ser carregado.</p>
                  <button onClick={() => navigate(-1)} style={styles.videoErrorButton}>
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.episodeInfo}>
            <h1 style={styles.episodeTitle}>
              {series?.title || 'Série'} - {episode.title || `Episódio ${episode.episodeNumber}`}
              {episode.seasonNumber && (
                <span style={styles.seasonEpisode}>
                  Temporada {episode.seasonNumber} • Episódio {episode.episodeNumber}
                </span>
              )}
            </h1>

            {episode.description && <p style={styles.episodeDescription}>{episode.description}</p>}

            {nextEpisode && (
              <div style={styles.nextEpisode}>
                <h3>Próximo:</h3>
                <button
                  onClick={() => {
                    navigate(
                      `/watch/series/${seriesId}/season/${nextEpisode.seasonNumber}/episode/${nextEpisode.episodeNumber}`
                    );
                  }}
                  style={styles.nextEpisodeButton}
                >
                  <span style={styles.nextEpisodePlayIcon}>▶</span>
                  <div style={styles.nextEpisodeInfo}>
                    <span style={styles.nextEpisodeTitle}>
                      {nextEpisode.title || `Episódio ${nextEpisode.episodeNumber}`}
                    </span>
                    <span style={styles.nextEpisodeDetails}>
                      {nextEpisode.seasonNumber !== episode.seasonNumber
                        ? `Temporada ${(nextEpisode.seasonNumber, episode.seasonNumber)} • `
                        : ''}
                      Episódio {nextEpisode.episodeNumber}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            Voltar para a série
          </button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0f0f0f',
    minHeight: '100vh',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    flex: 1,
    padding: '20px 5%',
    maxWidth: '1400px',
    margin: '0 auto',
    paddingTop: '80px',
    width: '100%'
  },
  videoContainer: {
    width: '100%',
    marginBottom: '30px'
  },
  videoWrapper: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    paddingTop: '56.25%' /* 16:9 Aspect Ratio */
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    outline: 'none',
    backgroundColor: '#000'
  },
  videoError: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
    zIndex: 10
  },
  videoErrorContent: {
    maxWidth: '400px',
    margin: '0 auto'
  },
  videoErrorIcon: {
    fontSize: '3rem',
    marginBottom: '15px'
  },
  videoErrorButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  episodeInfo: {
    marginTop: '20px',
    padding: '0 10px'
  },
  episodeTitle: {
    fontSize: '1.8rem',
    margin: '0 0 10px 0',
    color: '#fff'
  },
  seasonEpisode: {
    display: 'block',
    fontSize: '1rem',
    color: '#aaa',
    marginTop: '5px',
    fontWeight: 'normal'
  },
  episodeDescription: {
    color: '#ddd',
    lineHeight: 1.6,
    margin: '15px 0 0 0',
    fontSize: '1.05rem'
  },
  nextEpisode: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #333'
  },
  nextEpisodeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    padding: '15px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '10px',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  nextEpisodePlayIcon: {
    fontSize: '1.5rem',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  nextEpisodeInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  nextEpisodeTitle: {
    fontSize: '1rem',
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  nextEpisodeDetails: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginTop: '3px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px'
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    }
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#fff',
    fontSize: '1.2rem'
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#e50914',
    textAlign: 'center',
    padding: '20px'
  },
  errorMessage: {
    maxWidth: '500px',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
  }
};
