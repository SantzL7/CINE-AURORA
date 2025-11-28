import React from 'react';
import OptimizedImage from '../../common/OptimizedImage';

export default function SeriesHero({
  series,
  seasons,
  navigate,
  currentUser,
  toggleWatchlist,
  inList,
  listLoading
}) {
  return (
    <section
      className="details"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}
    >
      <div
        className="details__hero"
        style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'flex-start',
          maxWidth: '100%',
          marginTop: '20px'
        }}
      >
        <div
          className="details__poster"
          style={{
            flex: '0 0 300px',
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <OptimizedImage
            src={series.thumbnailUrl}
            alt={series.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
        <div
          className="details__info"
          style={{
            flex: '1',
            maxWidth: '800px'
          }}
        >
          <h1
            className="details__title"
            style={{
              fontSize: '2.5rem',
              margin: '0 0 16px 0',
              fontWeight: '700',
              color: '#fff',
              lineHeight: '1.2'
            }}
          >
            {series.title}
            {series.year && (
              <span
                style={{
                  color: '#999',
                  marginLeft: '10px',
                  fontSize: '1.5rem',
                  fontWeight: '400'
                }}
              >
                ({series.year})
              </span>
            )}
          </h1>
          <div
            className="details__meta"
            style={{
              margin: '20px 0',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            {series.year && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  color: '#fff',
                  fontWeight: '500'
                }}
              >
                {series.year}
              </span>
            )}
            <span
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
              Série
            </span>
            {series.genres &&
              series.genres.length > 0 &&
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
              ))}
            {series.seasonCount > 0 && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  color: '#fff',
                  fontWeight: '500'
                }}
              >
                {series.seasonCount} {series.seasonCount === 1 ? 'Temporada' : 'Temporadas'}
              </span>
            )}
          </div>
          {series.description && (
            <p
              className="details__desc"
              style={{
                lineHeight: '1.8',
                margin: '24px 0 32px',
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '100%'
              }}
            >
              {series.description}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '32px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <button
              className="btn primary"
              onClick={() => {
                if (seasons.length > 0 && seasons[0].episodes.length > 0) {
                  navigate(
                    `/watch/series/${series.id}/season/${seasons[0].number}/episode/${seasons[0].episodes[0].number}`
                  );
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
                  e.target.style.backgroundColor = inList
                    ? 'rgba(13, 110, 253, 0.2)'
                    : 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = inList
                    ? 'rgba(13, 110, 253, 0.1)'
                    : 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {inList ? '✓ Na sua lista' : '+ Minha lista'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
