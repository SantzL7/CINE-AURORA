import React, { useCallback } from 'react';

function SeriesManager({ seasons, setSeasons, activeSeason, setActiveSeason }) {
  // Função para adicionar uma nova temporada
  const addSeason = useCallback(() => {
    const newSeasonNumber = seasons.length > 0 ? Math.max(...seasons.map((s) => s.number)) + 1 : 1;
    const newSeason = {
      number: newSeasonNumber,
      title: `Temporada ${newSeasonNumber}`,
      episodes: [
        {
          number: 1,
          title: 'Episódio 1',
          description: '',
          videoUrl: '',
          thumbnailUrl: '',
          duration: 0
        }
      ]
    };
    setSeasons([...seasons, newSeason]);
    setActiveSeason(seasons.length);
  }, [seasons, setSeasons, setActiveSeason]);

  // Função para remover uma temporada
  const removeSeason = useCallback(
    (index) => {
      if (seasons.length <= 1) return; // Não permite remover a última temporada
      const newSeasons = [...seasons];
      newSeasons.splice(index, 1);
      setSeasons(newSeasons);
      setActiveSeason(Math.min(activeSeason, newSeasons.length - 1));
    },
    [seasons, setSeasons, activeSeason, setActiveSeason]
  );

  // Função para adicionar um novo episódio a uma temporada
  const addEpisode = useCallback(
    (seasonIndex) => {
      const newSeasons = [...seasons];
      const episodeNumber = newSeasons[seasonIndex].episodes.length + 1;
      newSeasons[seasonIndex].episodes.push({
        number: episodeNumber,
        title: `Episódio ${episodeNumber}`,
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        duration: 0
      });
      setSeasons(newSeasons);
    },
    [seasons, setSeasons]
  );

  // Função para remover um episódio de uma temporada
  const removeEpisode = useCallback(
    (seasonIndex, episodeIndex) => {
      const newSeasons = [...seasons];
      if (newSeasons[seasonIndex].episodes.length <= 1) return; // Não permite remover o último episódio
      newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
      // Atualiza os números dos episódios
      newSeasons[seasonIndex].episodes = newSeasons[seasonIndex].episodes.map((ep, idx) => ({
        ...ep,
        number: idx + 1,
        title: ep.title.replace(/Episódio \d+/, `Episódio ${idx + 1}`)
      }));
      setSeasons(newSeasons);
    },
    [seasons, setSeasons]
  );

  // Função para atualizar um campo de uma temporada
  const updateSeasonField = useCallback(
    (seasonIndex, field, value) => {
      const newSeasons = [...seasons];
      newSeasons[seasonIndex] = { ...newSeasons[seasonIndex], [field]: value };
      setSeasons(newSeasons);
    },
    [seasons, setSeasons]
  );

  // Função para atualizar um campo de um episódio
  const updateEpisodeField = useCallback(
    (seasonIndex, episodeIndex, field, value) => {
      const newSeasons = [...seasons];
      newSeasons[seasonIndex].episodes[episodeIndex] = {
        ...newSeasons[seasonIndex].episodes[episodeIndex],
        [field]: value
      };
      setSeasons(newSeasons);
    },
    [seasons, setSeasons]
  );

  return (
    <div
      className="series-section"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px'
      }}
    >
      <h3 style={{ marginTop: 0 }}>Temporadas e Episódios</h3>

      {/* Abas de temporadas */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', marginBottom: '16px' }}>
        {seasons.map((season, sIndex) => (
          <button
            key={sIndex}
            type="button"
            onClick={() => setActiveSeason(sIndex)}
            style={{
              padding: '8px 16px',
              border: `1px solid ${activeSeason === sIndex ? '#e50914' : '#e0e0e0'}`,
              background: activeSeason === sIndex ? '#f8f8f8' : 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeSeason === sIndex ? '#e50914' : 'inherit'
            }}
          >
            {season.title}
            {seasons.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeSeason(sIndex);
                }}
                style={{
                  marginLeft: '8px',
                  color: '#ff4444',
                  fontWeight: 'bold'
                }}
              >
                ×
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={addSeason}
          style={{
            padding: '8px 16px',
            border: '1px dashed #ccc',
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          + Adicionar Temporada
        </button>
      </div>

      {/* Formulário da temporada ativa */}
      {seasons.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Título da Temporada</label>
              <input
                type="text"
                className="input"
                value={seasons[activeSeason].title}
                onChange={(e) => updateSeasonField(activeSeason, 'title', e.target.value)}
                required
              />
            </div>
            <div>
              <label>Número</label>
              <input
                type="number"
                className="input"
                value={seasons[activeSeason].number}
                onChange={(e) =>
                  updateSeasonField(activeSeason, 'number', parseInt(e.target.value) || 1)
                }
                min="1"
                required
                style={{ width: '80px' }}
              />
            </div>
          </div>

          {/* Lista de episódios */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <h4 style={{ margin: 0 }}>Episódios</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const count = prompt('Quantos episódios deseja adicionar?', '1');
                    const numEpisodes = Math.max(1, parseInt(count) || 1);
                    for (let i = 0; i < numEpisodes; i++) {
                      addEpisode(activeSeason);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  + Adicionar Vários
                </button>
                <button
                  type="button"
                  onClick={() => addEpisode(activeSeason)}
                  style={{
                    padding: '6px 12px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  + Adicionar 1
                </button>
              </div>
            </div>

            {seasons[activeSeason].episodes.map((episode, eIndex) => (
              <div
                key={eIndex}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <h4 style={{ margin: 0 }}>Episódio {episode.number}</h4>
                  {seasons[activeSeason].episodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEpisode(activeSeason, eIndex)}
                      style={{
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '4px'
                      }}
                    >
                      Título do Episódio
                    </label>
                    <input
                      type="text"
                      value={episode.title}
                      onChange={(e) =>
                        updateEpisodeField(activeSeason, eIndex, 'title', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Título do episódio"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '4px'
                      }}
                    >
                      URL do Vídeo (obrigatório)
                    </label>
                    <input
                      type="url"
                      value={episode.videoUrl || ''}
                      onChange={(e) =>
                        updateEpisodeField(activeSeason, eIndex, 'videoUrl', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}
                      placeholder="https://exemplo.com/video.mp4"
                      required
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '4px'
                      }}
                    >
                      Descrição
                    </label>
                    <textarea
                      value={episode.description || ''}
                      onChange={(e) =>
                        updateEpisodeField(activeSeason, eIndex, 'description', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        minHeight: '80px',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Descrição do episódio"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '4px'
                      }}
                    >
                      URL da Miniatura (opcional)
                    </label>
                    <input
                      type="url"
                      value={episode.thumbnailUrl || ''}
                      onChange={(e) =>
                        updateEpisodeField(activeSeason, eIndex, 'thumbnailUrl', e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Deixe em branco para usar a miniatura da série"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '4px'
                      }}
                    >
                      Duração (em segundos)
                    </label>
                    <input
                      type="number"
                      value={episode.duration || 0}
                      onChange={(e) =>
                        updateEpisodeField(
                          activeSeason,
                          eIndex,
                          'duration',
                          parseInt(e.target.value) || 0
                        )
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(SeriesManager);
