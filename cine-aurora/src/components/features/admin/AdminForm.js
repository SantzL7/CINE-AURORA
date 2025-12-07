import React from 'react';
import SeriesManager from './SeriesManager';

function AdminForm({
  title,
  setTitle,
  description,
  setDescription,
  genres,
  setGenres,
  type,
  setType,
  thumbnailUrl,
  setThumbnailUrl,
  bannerUrl,
  setBannerUrl,
  videoUrl,
  setVideoUrl,
  year,
  setYear,
  seasons,
  setSeasons,
  activeSeason,
  setActiveSeason,
  loading,
  error,
  success,
  handleSubmit,
  resetForm,
  editingId,
  navigate
}) {
  return (
    <div className="auth-card" style={{ maxWidth: '100%', marginTop: 24 }}>
      <h1 style={{ marginBottom: 4 }}>Área do Administrador</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        {editingId ? 'Editando item' : 'Cadastre novos filmes e séries'}. Eles aparecerão na Home de
        acordo com o gênero escolhido.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div>
          <label>Título</label>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descrição</label>
          <textarea
            className="input"
            style={{ minHeight: 80, resize: 'vertical' }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Tipo</label>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            <option value="movie">Filme</option>
            <option value="series">Série</option>
          </select>
        </div>
        <div>
          <label>Gêneros</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {[
              'Acao',
              'Aventura',
              'Comedia',
              'Drama',
              'Romance',
              'Terror',
              'Suspense',
              'Ficcao cientifica',
              'Fantasia',
              'Animacao',
              'Documentario',
              'Crime'
            ].map(g => {
              const checked = genres.includes(g);
              return (
                <label
                  key={g}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setGenres(prev => (checked ? prev.filter(x => x !== g) : [...prev, g]));
                    }}
                  />
                  {g}
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <label>URL da thumbnail (imagem)</label>
          <input
            className="input"
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label>URL do vídeo (YouTube, Vimeo ou outro)</label>
          <input
            className="input"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://..."
            required={type === 'movie'}
          />
        </div>
        <div>
          <label>Ano</label>
          <input
            className="input"
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="2024"
          />
        </div>

        {/* Seção de temporadas e episódios (apenas para séries) */}
        {type === 'series' && (
          <SeriesManager
            seasons={seasons}
            setSeasons={setSeasons}
            activeSeason={activeSeason}
            setActiveSeason={setActiveSeason}
          />
        )}

        {error && <div className="error">{error}</div>}
        {success && (
          <div style={{ color: '#4caf50', fontSize: '0.9rem', marginBottom: 4 }}>{success}</div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={resetForm}
              style={{ marginLeft: '10px' }}
            >
              Cancelar Edição
            </button>
          )}
          <button type="button" className="btn" onClick={() => navigate('/app')}>
            Voltar para Home
          </button>
        </div>
      </form>
    </div>
  );
}
export default React.memo(AdminForm);
