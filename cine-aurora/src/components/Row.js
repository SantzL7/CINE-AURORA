import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";
import SeriesCard from "./SeriesCard";
import "./Row.css";

export default function Row({ 
  title, 
  genre, 
  type = "movie", // 'movie' ou 'series'
  locked = false, 
  watchlist = false, 
  continueWatching = false 
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const collectionName = type === "series" ? "series" : "movies";
  const CardComponent = type === "series" ? SeriesCard : Card;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (continueWatching) {
          if (!currentUser) {
            setItems([]);
            return;
          }
          const progSnap = await getDocs(
            collection(db, "users", currentUser.uid, "progress")
          );
          const items = progSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (items.length === 0) {
            setItems([]);
            return;
          }
          
          const itemPromises = items.map((p) => 
            getDoc(doc(db, collectionName, p.id))
          );
          const itemSnaps = await Promise.all(itemPromises);
          const data = itemSnaps
            .filter((s) => s.exists())
            .map((s) => {
              const base = items.find((p) => p.id === s.id);
              const progress = base && base.duration ? base.currentTime / base.duration : 0;
              return { id: s.id, progress, ...s.data() };
            });
          setItems(data);
        } else if (watchlist) {
          if (!currentUser) {
            setItems([]);
            return;
          }
          const listSnap = await getDocs(
            collection(db, "users", currentUser.uid, "watchlist")
          );
          const ids = listSnap.docs.map((d) => d.id);
          if (ids.length === 0) {
            setItems([]);
            return;
          }
          
          // Buscar itens da lista de desejos do tipo correto
          const itemPromises = ids.map((id) => 
            getDoc(doc(db, collectionName, id))
              .then(doc => doc.exists() ? { id: doc.id, ...doc.data() } : null)
          );
          const items = await Promise.all(itemPromises);
          setItems(items.filter(Boolean));
        } else {
          let data = [];
          if (genre) {
            // Tenta buscar com o novo formato de array de gêneros
            const qNew = query(
              collection(db, collectionName),
              where("genres", "array-contains", genre)
            );
            const snapNew = await getDocs(qNew);
            data = snapNew.docs.map((docSnap) => ({ 
              id: docSnap.id, 
              ...docSnap.data() 
            }));

            // Se não encontrar nada, tenta o formato antigo
            if (data.length === 0) {
              const qOld = query(
                collection(db, collectionName), 
                where("genre", "==", genre)
              );
              const snapOld = await getDocs(qOld);
              data = snapOld.docs.map((docSnap) => ({ 
                id: docSnap.id, 
                ...docSnap.data() 
              }));
            }
          }
          setItems(data);
        }
      } catch (e) {
        console.error("Erro ao carregar itens:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [genre, watchlist, continueWatching, currentUser, collectionName]);

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__scroller">
        {loading && <div className="row__loading">Carregando...</div>}
        {!loading && items.length === 0 && (
          <div className="row__empty">Nenhum item encontrado</div>
        )}
        {items.map((item) => (
          <CardComponent 
            key={item.id} 
            movie={item} 
            series={item}
            locked={locked} 
          />
        ))}
      </div>
    </section>
  );
}
