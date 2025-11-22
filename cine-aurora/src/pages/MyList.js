import Navbar from "../components/Navbar";
import Row from "../components/Row";

export default function MyList() {
  return (
    <>
      <Navbar />
      <main className="content">
        <Row title="Minha lista" watchlist />
      </main>
    </>
  );
}
