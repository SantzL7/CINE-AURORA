import React, { useState } from 'react';

export default function OptimizedImage({ src, alt, className, style, ...props }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    setError(true);
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const fallbackSrc = 'https://via.placeholder.com/300x450?text=Sem+Imagem';

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#222',
        ...style
      }}
      className={className}
    >
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'block'
        }}
        {...props}
      />
    </div>
  );
}
