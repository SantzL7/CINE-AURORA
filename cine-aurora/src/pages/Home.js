import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCarousel from '../components/features/MovieCarousel';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Row from '../components/features/Row';

function ContentFiltered({ type }) {
  if (type === 'movie') {
    return (
      <>
        <Row title="Filmes em Destaque" type="movie" />
        <Row title="Continuar assistindo" continueWatching type="movie" />
        <Row title="Ação" genre="Acao" type="movie" />
        <Row title="Comédia" genre="Comedia" type="movie" />
        <Row title="Terror" genre="Terror" type="movie" />
        <Row title="Ficção científica" genre="Ficcao cientifica" type="movie" />
        <Row title="Romance" genre="Romance" type="movie" />
        <Row title="Documentários" genre="Documentario" type="movie" />
        <Row title="Minha lista" watchlist type="movie" />
      </>
    );
  } else if (type === 'series') {
    return (
      <>
        <Row title="Séries em Destaque" type="series" />
        <Row title="Ação" genre="Acao" type="series" />
        <Row title="Comédia" genre="Comedia" type="series" />
        <Row title="Terror" genre="Terror" type="series" />
        <Row title="Ficção científica" genre="Ficcao cientifica" type="series" />
        <Row title="Drama" genre="Drama" type="series" />
        <Row title="Documentários" genre="Documentario" type="series" />
        <Row title="Minha lista" watchlist type="series" />
      </>
    );
  } else {
    // Conteúdo padrão (home)
    return (
      <>
        <Row title="Séries em Destaque" type="series" />
        <Row title="Filmes em Destaque" type="movie" />
        <Row title="Continuar assistindo" continueWatching />
        <Row title="Ação" genre="Acao" />
        <Row title="Comédia" genre="Comedia" />
        <Row title="Terror" genre="Terror" />
        <Row title="Ficção científica" genre="Ficcao cientifica" />
        <Row title="Romance" genre="Romance" />
        <Row title="Documentários" genre="Documentario" />
        <Row title="Minha lista" watchlist />
      </>
    );
  }
}

export default function Home() {
  const { currentUser } = useAuth();
  const [showCarousel, setShowCarousel] = useState(false);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  // Adiciona um pequeno atraso para garantir que os estilos sejam aplicados
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCarousel(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home">
      <main className="content">
        <Navbar />
        {showCarousel && (!type || type === 'movie') && <MovieCarousel />}
        <section>
          <ContentFiltered type={type} />
        </section>
      </main>
    </div>
  );
}
