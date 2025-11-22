import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MovieCarousel from "../components/MovieCarousel";
import Row from "../components/Row";

export default function Home() {
  const [showCarousel, setShowCarousel] = useState(false);

  // Adiciona um pequeno atraso para garantir que os estilos sejam aplicados
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCarousel(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main className="content">
        {showCarousel && <MovieCarousel />}
        <section>
          <Row title="Continuar assistindo" continueWatching />
          <Row title="Ação" genre="Acao" />
          <Row title="Comédia" genre="Comedia" />
          <Row title="Terror" genre="Terror" />
          <Row title="Ficção científica" genre="Ficcao cientifica" />
          <Row title="Romance" genre="Romance" />
          <Row title="Documentários" genre="Documentario" />
          <Row title="Minha lista" watchlist />
        </section>
      </main>
    </>
  );
}
