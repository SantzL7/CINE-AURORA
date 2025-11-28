import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

export default function MovieCarousel() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCarouselItems() {
      try {
        setLoading(true);
        setError(null);

        // Busca apenas filmes com thumbnail
        const moviesSnapshot = await getDocs(
          query(collection(db, 'movies'), where('thumbnailUrl', '!=', ''))
        );

        // Filtra filmes com thumbnail e mapeia corretamente
        const allItems = moviesSnapshot.docs
          .filter((doc) => doc.data().thumbnailUrl)
          .map((doc) => ({
            id: doc.id,
            type: 'movie',
            ...doc.data()
          }));

        if (allItems.length === 0) {
          throw new Error('Nenhum item com thumbnail encontrado');
        }

        // Seleciona até 5 itens aleatórios
        const shuffled = [...allItems].sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, 5);

        setItems(selectedItems);
      } catch (error) {
        console.error('Erro ao carregar itens do carrossel:', error);
        setError('Não foi possível carregar o carrossel');
      } finally {
        setLoading(false);
      }
    }

    loadCarouselItems();
  }, []);

  // Efeito para trocar automaticamente os itens a cada 5 segundos
  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 10000); // Aumentei para 10 segundos para dar mais tempo ao usuário

    return () => clearInterval(timer);
  }, [items.length]);

  if (loading) {
    return (
      <div
        style={{
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#141414',
          color: '#fff',
          fontSize: '1.2rem'
        }}
      >
        <div>Carregando conteúdo do carrossel...</div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div
        style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#141414',
          color: '#e50914',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        {error || 'Nenhum conteúdo disponível no momento.'}
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div
      className="carousel"
      style={{
        position: 'relative',
        height: '500px',
        overflow: 'hidden',
        backgroundColor: '#141414',
        marginBottom: '40px'
      }}
    >
      {/* Imagem de fundo */}
      {currentItem.thumbnailUrl && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.7
          }}
        >
          <OptimizedImage
            src={currentItem.thumbnailUrl}
            alt={currentItem.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Overlay escuro */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      {/* Conteúdo */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <h1
            style={{
              color: '#fff',
              fontSize: '2.5rem',
              margin: '0 0 20px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {currentItem.title}
          </h1>

          <p
            style={{
              color: '#fff',
              fontSize: '1.1rem',
              margin: '0 0 30px 0',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {currentItem.description || 'Sinopse não disponível.'}
          </p>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => {
                const path =
                  currentItem.type === 'movie'
                    ? `/title/${currentItem.id}`
                    : `/series/${currentItem.id}`;
                navigate(path);
              }}
              style={{
                padding: '12px 30px',
                fontSize: '1.1rem',
                backgroundColor: '#0071eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>ⓘ</span>
              <span>Ver {currentItem.type === 'movie' ? 'Detalhes' : 'Série'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores de navegação */}
      {items.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 3
          }}
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                backgroundColor: index === currentIndex ? '#0071eb' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              aria-label={`Ir para o item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
