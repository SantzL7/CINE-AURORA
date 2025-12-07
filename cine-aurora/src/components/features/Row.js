import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from './Card';
import SeriesCard from './SeriesCard';
import Skeleton from '../common/Skeleton';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRowData } from '../../hooks/useRowData';
import './Row.css';

export default function Row({
  title,
  genre,
  type = 'movie', // 'movie' ou 'series'
  locked = false,
  watchlist = false,
  continueWatching = false
}) {
  const { currentUser } = useAuth();
  const { items, loading } = useRowData({
    genre,
    type,
    watchlist,
    continueWatching,
    currentUser
  });

  const scrollerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = useCallback(direction => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollAmount = direction === 'left' ? -400 : 400;
    scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  const checkScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setShowLeftButton(scroller.scrollLeft > 0);
    setShowRightButton(scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 10);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener('scroll', checkScroll);
      // Verificar estado inicial
      checkScroll();
      return () => scroller.removeEventListener('scroll', checkScroll);
    }
  }, [items, checkScroll]); // Re-run when items change

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__container">
        {showLeftButton && (
          <button
            className="nav-button nav-button--left"
            onClick={() => scroll('left')}
            aria-label="Rolar para a esquerda"
          >
            <FaChevronLeft />
          </button>
        )}

        <div className="row__scroller" ref={scrollerRef}>
          {loading ? (
            // Exibe 6 skeletons enquanto carrega
            Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} type="card" />)
          ) : items.length === 0 ? (
            <div className="row__empty">
              {watchlist ? 'Nenhum item na sua lista' : 'Nenhum item encontrado'}
            </div>
          ) : (
            items.map(item => {
              try {
                // Determina se o item é uma série com base no tipo ou no tipo da linha
                const isSeries = item.type === 'series' || type === 'series';

                // Escolhe o componente apropriado
                const Component = isSeries ? SeriesCard : Card;

                // Prepara as props apropriadas para cada tipo de componente
                const props = isSeries
                  ? {
                      series: {
                        ...item,
                        // Garante que o ID da série está definido
                        id: item.seriesId || item.id,
                        // Garante que temos um ID de série
                        seriesId: item.seriesId || item.id
                      },
                      locked: locked && !currentUser
                    }
                  : {
                      movie: {
                        ...item,
                        // Garante que o ID do filme está definido
                        id: item.id
                      },
                      locked: locked && !currentUser
                    };

                // Usa o ID da série para séries, se disponível
                const key = isSeries ? item.seriesId || item.id : item.id;

                return <Component key={key} {...props} />;
              } catch (error) {
                console.error('Erro ao renderizar item:', error, { item });
                return null;
              }
            })
          )}
        </div>

        {showRightButton && (
          <button
            className="nav-button nav-button--right"
            onClick={() => scroll('right')}
            aria-label="Rolar para a direita"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}
