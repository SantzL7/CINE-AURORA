import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Card from "./Card";
import "./Row.css";

export default function Row({ title, genre }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = query(collection(db, "movies"), where("genre", "==", genre));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMovies(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [genre]);

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__scroller">
        {loading && <div className="row__loading">Carregando...</div>}
        {!loading && movies.length === 0 && <div className="row__empty">Sem títulos</div>}
        {movies.map((m) => (
          <Card key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
}
