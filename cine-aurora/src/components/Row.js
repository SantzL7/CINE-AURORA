import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";
import "./Row.css";

export default function Row({ title, genre, locked = false, watchlist = false, continueWatching = false }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (continueWatching) {
          if (!currentUser) {
            setMovies([]);
            return;
          }
          const progSnap = await getDocs(collection(db, "users", currentUser.uid, "progress"));
          const items = progSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (items.length === 0) {
            setMovies([]);
            return;
          }
          const moviePromises = items.map((p) => getDoc(doc(db, "movies", p.id)));
          const movieSnaps = await Promise.all(moviePromises);
          const data = movieSnaps
            .filter((s) => s.exists())
            .map((s) => {
              const base = items.find((p) => p.id === s.id);
              const progress = base && base.duration ? base.currentTime / base.duration : 0;
              return { id: s.id, progress, ...s.data() };
            });
          setMovies(data);
        } else if (watchlist) {
          if (!currentUser) {
            setMovies([]);
            return;
          }
          const listSnap = await getDocs(collection(db, "users", currentUser.uid, "watchlist"));
          const ids = listSnap.docs.map((d) => d.id);
          if (ids.length === 0) {
            setMovies([]);
            return;
          }
          const moviePromises = ids.map((id) => getDoc(doc(db, "movies", id)));
          const movieSnaps = await Promise.all(moviePromises);
          const data = movieSnaps
            .filter((s) => s.exists())
            .map((s) => ({ id: s.id, ...s.data() }));
          setMovies(data);
        } else {
          let data = [];
          if (genre) {
            const qNew = query(
              collection(db, "movies"),
              where("genres", "array-contains", genre)
            );
            const snapNew = await getDocs(qNew);
            data = snapNew.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

            if (data.length === 0) {
              const qOld = query(collection(db, "movies"), where("genre", "==", genre));
              const snapOld = await getDocs(qOld);
              data = snapOld.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
            }
          }
          setMovies(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [genre, watchlist, continueWatching, currentUser]);

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__scroller">
        {loading && <div className="row__loading">Carregando...</div>}
        {!loading && movies.length === 0 && <div className="row__empty">Sem títulos</div>}
        {movies.map((m) => (
          <Card key={m.id} movie={m} locked={locked} />
        ))}
      </div>
    </section>
  );
}
