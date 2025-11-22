import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Row from "../components/Row";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="content">
        <Banner />
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
