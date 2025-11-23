import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function SeriesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadSeries() {
      try {
        // Carrega os dados da série
        const seriesRef = doc(db, 'series', id);
        const seriesSnap = await getDoc(seriesRef);
        
        if (!seriesSnap.exists()) {
          throw new Error('Série não encontrada');
        }

        const seriesData = { id: seriesSnap.id, ...seriesSnap.data() };
        setSeries(seriesData);

        // Carrega as temporadas
        const seasonsRef = collection(db, `series/${id}/seasons`);
        const seasonsQuery = query(seasonsRef, orderBy('number', 'asc'));
        const seasonsSnap = await getDocs(seasonsQuery);
        
        const seasonsData = await Promise.all(
          seasonsSnap.docs.map(async (seasonDoc) => {
            const seasonData = { id: seasonDoc.id, ...seasonDoc.data() };
            
            // Carrega os episódios de cada temporada
            const episodesRef = collection(db, `series/${id}/seasons/${seasonDoc.id}/episodes`);
            const episodesQuery = query(episodesRef, orderBy('number', 'asc'));
            const episodesSnap = await getDocs(episodesQuery);
            
            const episodes = episodesSnap.docs.map(episodeDoc => ({
              id: episodeDoc.id,
              ...episodeDoc.data()
            }));

            return {
              ...seasonData,
              episodes
            };
          })
        );

        setSeasons(seasonsData);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar série:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadSeries();
  }, [id]);

  useEffect(() => {
    async function checkWatchlist() {
      if (!currentUser || !id) return;
      try {
        setListLoading(true);
        const ref = doc(db, "users", currentUser.uid, "watchlist", id);
        const snap = await getDoc(ref);
        setInList(snap.exists());
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    }
    checkWatchlist();
  }, [currentUser, id]);

  async function toggleWatchlist() {
    if (!currentUser || !series) return;
    try {
      setListLoading(true);
      const ref = doc(db, "users", currentUser.uid, "watchlist", series.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        setInList(false);
      } else {
        await setDoc(ref, {
          id: series.id,
          type: 'series',
          title: series.title,
          thumbnailUrl: series.thumbnailUrl,
          addedAt: new Date().toISOString()
        });
        setInList(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#141414',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#141414',
        color: '#e50914',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p>Erro ao carregar a série: {error}</p>
        <button 
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#e50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!series) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#141414',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Série não encontrada</p>
        <button 
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#e50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="content" style={{ padding: "16px 24px 40px" }}>
        <button 
          className="btn ghost" 
          onClick={() => navigate(-1)} 
          style={{ 
            marginBottom: '16px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #666',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          Voltar
        </button>
        <section className="details" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div className="details__hero" style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'flex-start',
            maxWidth: '100%',
            marginTop: '20px'
          }}>
            <div className="details__poster" style={{
              flex: '0 0 300px',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              '@media (max-width: 767px)': {
                margin: '0 auto',
                maxWidth: '300px',
                width: '100%',
                aspectRatio: '2/3'
              }
            }}>
              <img 
                src={series.thumbnailUrl || 'https://via.placeholder.com/300x450?text=Sem+Imagem'} 
                alt={series.title}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x450?text=Sem+Imagem';
                }}
              />
            </div>
            <div className="details__info" style={{
              flex: '1',
              maxWidth: '800px'
            }}>
              <h1 className="details__title" style={{
                fontSize: '2.5rem',
                margin: '0 0 16px 0',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.2',
                '@media (max-width: 1023px)': {
                  fontSize: '2rem',
                  marginTop: '0'
                },
                '@media (max-width: 480px)': {
                  fontSize: '1.8rem'
                }
              }}>
                {series.title}
                {series.year && (
                  <span style={{ 
                    color: '#999', 
                    marginLeft: '10px',
                    fontSize: '1.5rem',
                    fontWeight: '400',
                    '@media (max-width: 480px)': {
                      display: 'block',
                      margin: '5px 0 0 0',
                      fontSize: '1.2rem'
                    }
                  }}>
                    ({series.year})
                  </span>
                )}
              </h1>
              <div className="details__meta" style={{ 
                margin: '20px 0', 
                display: 'flex', 
                gap: '12px', 
                flexWrap: 'wrap', 
                alignItems: 'center' 
              }}>
                {series.year && (
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    color: '#fff',
                    fontWeight: '500'
                  }}>
                    {series.year}
                  </span>
                )}
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  color: '#fff',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  Série
                </span>
                {series.genres && series.genres.length > 0 && (
                  series.genres.slice(0, 2).map((genre, index) => (
                    <span 
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        color: '#fff',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}
                    >
                      {genre.trim()}
                    </span>
                  ))
                )}
                {series.seasonCount > 0 && (
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    color: '#fff',
                    fontWeight: '500'
                  }}>
                    {series.seasonCount} {series.seasonCount === 1 ? 'Temporada' : 'Temporadas'}
                  </span>
                )}
              </div>
              {series.description && (
                <p className="details__desc" style={{ 
                  lineHeight: '1.8',
                  margin: '24px 0 32px',
                  fontSize: '1.1rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '100%'
                }}>
                  {series.description}
                </p>
              )}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '32px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <button 
                  className="btn primary" 
                  onClick={() => {
                    if (seasons.length > 0 && seasons[0].episodes.length > 0) {
                      navigate(`/watch/series/${id}/season/${seasons[0].number}/episode/${seasons[0].episodes[0].number}`);
                    }
                  }}
                  disabled={!seasons.length || !seasons[0].episodes.length}
                  style={{
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    minWidth: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  ▶ Assistir ao Primeiro Episódio
                </button>
                
                {currentUser && (
                  <button 
                    className="btn" 
                    type="button" 
                    onClick={toggleWatchlist} 
                    disabled={listLoading}
                    style={{
                      padding: '12px 24px',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '8px',
                      backgroundColor: inList ? 'rgba(13, 110, 253, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      border: inList ? '1px solid #0d6efd' : '1px solid rgba(255, 255, 255, 0.2)',
                      color: inList ? '#0d6efd' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '180px',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = inList ? 'rgba(13, 110, 253, 0.2)' : 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = inList ? 'rgba(13, 110, 253, 0.1)' : 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    {inList ? '✓ Na sua lista' : '+ Minha lista'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ 
          marginTop: '60px',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 24px',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            color: '#fff', 
            margin: '0 0 24px 0',
            fontSize: '1.8rem',
            fontWeight: '600',
            position: 'relative',
            paddingBottom: '12px',
            '@media (max-width: 767px)': {
              fontSize: '1.5rem',
              marginBottom: '20px'
            },
            '::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '80px',
              height: '3px',
              backgroundColor: '#0d6efd',
              borderRadius: '3px'
            }
          }}>
            Temporadas
          </h2>
          
          {seasons.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '30px',
              '@media (max-width: 767px)': {
                gap: '25px'
              }
            }}>
              {seasons.map(season => (
                <div key={season.id} style={{ 
                  backgroundColor: '#1a1a1a', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                  },
                  '@media (max-width: 767px)': {
                    borderRadius: '6px'
                  }
                }}>
                  <div style={{ 
                    backgroundColor: '#2a2a2a', 
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    ':hover': {
                      backgroundColor: '#333'
                    },
                    '@media (max-width: 767px)': {
                      padding: '15px 18px'
                    }
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ 
                        color: '#fff', 
                        margin: 0,
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        '@media (max-width: 767px)': {
                          fontSize: '1.1rem'
                        }
                      }}>
                        {season.title || `Temporada ${season.number}`}
                      </h3>
                      <div style={{ 
                        color: '#999', 
                        fontSize: '0.95rem',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        '@media (max-width: 767px)': {
                          fontSize: '0.9rem',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '2px'
                        }
                      }}>
                        <span>{season.episodes.length} {season.episodes.length === 1 ? 'episódio' : 'episódios'}</span>
                        {season.year && (
                          <span style={{ 
                            display: 'inline-block',
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#666',
                            borderRadius: '50%',
                            '@media (max-width: 767px)': {
                              display: 'none'
                            }
                          }}></span>
                        )}
                        {season.year && (
                          <span>{season.year}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#1f1f1f',
                    '@media (max-width: 767px)': { 
                      padding: '15px' 
                    } 
                  }}>
                    {season.episodes.length > 0 ? (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px' 
                      }}>
                        {season.episodes.map(episode => (
                          <div 
                            key={episode.id} 
                            style={{
                              display: 'flex',
                              gap: '16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              ':hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                transform: 'translateX(4px)'
                              },
                              '@media (max-width: 767px)': {
                                flexDirection: 'column',
                                gap: '0'
                              }
                            }}
                            onClick={() => {
                              navigate(`/watch/series/${id}/season/${season.number}/episode/${episode.number}`);
                            }}
                          >
                            <div style={{ 
                              width: '160px', 
                              height: '90px',
                              backgroundColor: '#222',
                              flexShrink: 0,
                              position: 'relative',
                              overflow: 'hidden',
                              '@media (max-width: 767px)': {
                                width: '100%',
                                height: '160px',
                                aspectRatio: '16/9'
                              }
                            }}>
                              <img 
                                src={episode.thumbnailUrl} 
                                alt={`Episódio ${episode.number}`}
                                style={{ 
                                  width: '100%', 
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}>
                                <span style={{ color: '#fff', fontSize: '1.2rem' }}>▶</span>
                              </div>
                            </div>
                            
                            <div style={{ 
                              flex: 1, 
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              '@media (max-width: 767px)': {
                                padding: '12px 16px 16px'
                              }
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{
                                  fontSize: '0.9rem',
                                  color: '#fff',
                                  fontWeight: '500',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  lineHeight: 1.4
                                }}>
                                  Episódio {episode.number}
                                </span>
                                {episode.runtime && (
                                  <span style={{
                                    fontSize: '0.85rem',
                                    color: '#999',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <span>•</span>
                                    {Math.floor(episode.runtime / 60)}m {episode.runtime % 60}s
                                  </span>
                                )}
                              </div>
                              <h4 style={{ 
                                color: '#fff', 
                                margin: '0 0 8px 0',
                                fontSize: '1.05rem',
                                fontWeight: '500',
                                lineHeight: 1.3,
                                '@media (max-width: 767px)': {
                                  fontSize: '1rem',
                                  marginBottom: '6px'
                                }
                              }}>
                                {episode.title || `Episódio ${episode.number}`}
                              </h4>
                              {episode.description && (
                                <p style={{ 
                                  color: '#bbb', 
                                  margin: 0,
                                  fontSize: '0.95rem',
                                  lineHeight: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  '@media (max-width: 767px)': {
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5,
                                    WebkitLineClamp: 3
                                  }
                                }}>
                                  {episode.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ 
                        color: '#999', 
                        textAlign: 'center', 
                        margin: '20px 0',
                        '@media (max-width: 767px)': {
                          margin: '15px 0',
                          fontSize: '0.9rem'
                        }
                      }}>
                        Nenhum episódio disponível nesta temporada.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#1a1a1a', 
              padding: '30px', 
              borderRadius: '8px',
              textAlign: 'center',
              '@media (max-width: 767px)': {
                padding: '20px 15px'
              }
            }}>
              <p style={{ 
                color: '#999', 
                margin: 0,
                '@media (max-width: 767px)': {
                  fontSize: '0.9rem'
                }
              }}>
                Nenhuma temporada disponível.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
