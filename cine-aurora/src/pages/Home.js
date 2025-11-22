import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Banner from "../components/Banner";
import Row from "../components/Row";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="layout-main">
        <Sidebar />
        <div className="layout-main__content">
          <Banner />
          <div className="content">
            <Row title="Ação" genre="Acao" />
            <Row title="Comédia" genre="Comedia" />
            <Row title="Documentários" genre="Documentario" />
          </div>
        </div>
      </div>
    </>
  );
}
