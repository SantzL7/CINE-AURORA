import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Row from "../components/Row";

export default function Home() {
  return (
    <>
      <Navbar />
      <Banner />
      <div className="content">
        <Row title="Ação" genre="Acao" />
        <Row title="Comédia" genre="Comedia" />
        <Row title="Documentários" genre="Documentario" />
      </div>
    </>
  );
}
