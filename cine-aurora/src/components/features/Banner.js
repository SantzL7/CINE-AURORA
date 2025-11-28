import React from 'react';
import OptimizedImage from '../common/OptimizedImage';

export default function Banner({ movie }) {
  return (
    <header
      className="banner"
      style={{
        position: 'relative',
        height: '448px',
        color: 'white',
        objectFit: 'contain'
      }}
    >
      <div
        className="banner__image-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }}
      >
        <OptimizedImage
          src={movie?.thumbnailUrl}
          alt={movie?.title}
          className="banner__image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div
          className="banner__overlay--bottom"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '7.4rem',
            backgroundImage: 'linear-gradient(180deg, transparent, rgba(37, 37, 37, 0.61), #111)'
          }}
        />
      </div>

      <div
        className="banner__content"
        style={{
          marginLeft: '30px',
          paddingTop: '140px',
          height: '190px'
        }}
      >
        <h1
          className="banner__title"
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            paddingBottom: '0.3rem'
          }}
        >
          {movie?.title || 'Mergulhe na sua galáxia de filmes.'}
        </h1>
        <p
          className="banner__subtitle"
          style={{
            width: '45rem',
            lineHeight: 1.3,
            paddingTop: '1rem',
            fontSize: '0.8rem',
            maxWidth: '360px',
            height: '80px'
          }}
        >
          {movie?.description ||
            'Destaque lançamentos, clássicos e séries sob a luz da aurora. Tudo em um único catálogo personalizado.'}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            className="btn primary"
            style={{
              cursor: 'pointer',
              color: '#fff',
              outline: 'none',
              border: 'none',
              fontWeight: 700,
              borderRadius: '0.2vw',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              marginRight: '1rem',
              paddingTop: '0.5rem',
              backgroundColor: 'rgba(51, 51, 51, 0.5)',
              paddingBottom: '0.5rem'
            }}
          >
            Assistir agora
          </button>
          <button
            className="btn ghost"
            style={{
              cursor: 'pointer',
              color: '#fff',
              outline: 'none',
              border: 'none',
              fontWeight: 700,
              borderRadius: '0.2vw',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              marginRight: '1rem',
              paddingTop: '0.5rem',
              backgroundColor: 'rgba(51, 51, 51, 0.5)',
              paddingBottom: '0.5rem'
            }}
          >
            Mais informações
          </button>
        </div>
      </div>
      <div className="banner__fade" />
    </header>
  );
}
