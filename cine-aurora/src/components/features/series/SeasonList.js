import React from 'react';
import OptimizedImage from '../../common/OptimizedImage';

export default function SeasonList({ seasons, seriesId, navigate }) {
  return (
    <section
      style={{
        marginTop: '60px',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '0 24px',
        marginBottom: '40px'
      }}
    >
      <h2
        style={{
          color: '#fff',
          margin: '0 0 24px 0',
          fontSize: '1.8rem',
          fontWeight: '600',
          position: 'relative',
          paddingBottom: '12px',
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
        }}
      >
        Temporadas
      </h2>

      {seasons.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}
        >
          {seasons.map(season => (
            <div
              key={season.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '18px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      color: '#fff',
                      margin: 0,
                      fontSize: '1.3rem',
                      fontWeight: '600'
                    }}
                  >
                    {season.title || `Temporada ${season.number}`}
                  </h3>
                  <div
                    style={{
                      color: '#999',
                      fontSize: '0.95rem',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>
                      {season.episodes.length}{' '}
                      {season.episodes.length === 1 ? 'episódio' : 'episódios'}
                    </span>
                    {season.year && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '4px',
                          height: '4px',
                          backgroundColor: '#666',
                          borderRadius: '50%'
                        }}
                      ></span>
                    )}
                    {season.year && <span>{season.year}</span>}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#1f1f1f'
                }}
              >
                {season.episodes.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
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
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                        onClick={() => {
                          navigate(
                            `/watch/series/${seriesId}/season/${season.number}/episode/${episode.number}`
                          );
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div
                          style={{
                            width: '160px',
                            height: '90px',
                            backgroundColor: '#222',
                            flexShrink: 0,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <OptimizedImage
                            src={episode.thumbnailUrl}
                            alt={`Episódio ${episode.number}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                          <div
                            style={{
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
                            }}
                            className="play-icon"
                          >
                            <span style={{ color: '#fff', fontSize: '1.2rem' }}>▶</span>
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginBottom: '8px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.9rem',
                                color: '#fff',
                                fontWeight: '500',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                lineHeight: 1.4
                              }}
                            >
                              Episódio {episode.number}
                            </span>
                            {episode.runtime && (
                              <span
                                style={{
                                  fontSize: '0.85rem',
                                  color: '#999',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>•</span>
                                {Math.floor(episode.runtime / 60)}m {episode.runtime % 60}s
                              </span>
                            )}
                          </div>
                          <h4
                            style={{
                              color: '#fff',
                              margin: '0 0 8px 0',
                              fontSize: '1.05rem',
                              fontWeight: '500',
                              lineHeight: 1.3
                            }}
                          >
                            {episode.title || `Episódio ${episode.number}`}
                          </h4>
                          {episode.description && (
                            <p
                              style={{
                                color: '#bbb',
                                margin: 0,
                                fontSize: '0.95rem',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {episode.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      color: '#999',
                      textAlign: 'center',
                      margin: '20px 0'
                    }}
                  >
                    Nenhum episódio disponível nesta temporada.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#1a1a1a',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              color: '#999',
              margin: 0
            }}
          >
            Nenhuma temporada disponível.
          </p>
        </div>
      )}
    </section>
  );
}
