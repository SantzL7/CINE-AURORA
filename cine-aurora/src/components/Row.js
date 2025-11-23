import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, doc, getDoc, limit } from "firebase/firestore";
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
  const CardComponent = type === "series" ? SeriesCard : Card;
  
  // Função para buscar itens de uma coleção específica
  const fetchItems = async (collectionName, genre) => {
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
        type: collectionName, // Adiciona o tipo para identificar se é filme ou série
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
          type: collectionName, // Adiciona o tipo para identificar se é filme ou série
          ...docSnap.data()
        }));
      }
    } else {
      // Se não houver gênero específico, busca todos os itens
      const q = query(collection(db, collectionName), limit(10));
      const snapshot = await getDocs(q);
      data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        type: collectionName, // Adiciona o tipo para identificar se é filme ou série
        ...docSnap.data()
      }));
    }
    return data;
  };

  useEffect(() => {
    async function load() {
      console.log('Row - Iniciando carregamento...', { title, type, watchlist, continueWatching });
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
            getDoc(doc(db, type === 'series' ? 'series' : 'movies', p.id))
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
          console.log('Carregando lista de favoritos...');
          if (!currentUser) {
            console.log('Usuário não autenticado');
            setItems([]);
            setLoading(false);
            return;
          }
          
          try {
            const watchlistRef = collection(db, "users", currentUser.uid, "watchlist");
            console.log('Referência da watchlist:', watchlistRef.path);
            
            console.log('Tentando buscar documentos da watchlist...');
            const listSnap = await getDocs(watchlistRef);
            console.log('Documentos encontrados na watchlist:', listSnap.docs.length);
            
            // Log detalhado de cada documento
            listSnap.docs.forEach((doc, index) => {
              console.log(`Documento ${index + 1}:`, { id: doc.id, ...doc.data() });
            });
            
            const watchlistItems = [];
            
            for (const docSnap of listSnap.docs) {
              const item = { id: docSnap.id, ...docSnap.data() };
              console.log('Item da watchlist:', item);
              
              // Se o tipo não estiver definido, assume que é um filme (para compatibilidade)
              const itemType = item.type || 'movies';
              
              // Se o tipo do item corresponder ao tipo solicitado (ou se não houver tipo específico)
              if (!type || itemType === type) {
                try {
                  console.log(`Buscando ${itemType}/${item.id}...`);
                  const itemDoc = await getDoc(doc(db, itemType, item.id));
                  
                  if (itemDoc.exists()) {
                    console.log(`Item encontrado: ${itemType}/${item.id}`);
                    watchlistItems.push({
                      id: itemDoc.id,
                      type: itemType,
                      ...itemDoc.data()
                    });
                  } else {
                    console.warn(`Item não encontrado: ${itemType}/${item.id}`);
                  }
                } catch (e) {
                  console.error(`Erro ao carregar item ${item.id} do tipo ${itemType}:`, e);
                }
              }
            }
            
            console.log('Itens carregados:', watchlistItems);
            // Ordena por título
            watchlistItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            console.log('Itens ordenados:', watchlistItems);
            setItems(watchlistItems);
          } catch (error) {
            console.error('Erro ao carregar lista de favoritos:', error);
            setItems([]);
          } finally {
            setLoading(false);
          }
        } else {
          let data = [];
          // Busca tanto filmes quanto séries quando não especificado
          if (type === 'series') {
            data = await fetchItems('series', genre);
          } else if (type === 'movie') {
            data = await fetchItems('movies', genre);
          } else {
            // Se não for especificado, busca ambos
            const [moviesData, seriesData] = await Promise.all([
              fetchItems('movies', genre),
              fetchItems('series', genre)
            ]);
            data = [...moviesData, ...seriesData];
            // Ordena por título para misturar filmes e séries
            data.sort((a, b) => a.title.localeCompare(b.title));
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
  }, [genre, watchlist, continueWatching, currentUser, type]);

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__scroller">
        {loading ? (
          <div className="row__loading">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="row__empty">
            {watchlist ? 'Nenhum item na sua lista' : 'Nenhum item encontrado'}
          </div>
        ) : (
          items.map((item) => {
            console.log('Renderizando item:', item);
            const isSeries = item.type === 'series' || type === 'series';
            const Component = isSeries ? SeriesCard : Card;
            const props = isSeries 
              ? { series: item, locked: locked && !currentUser }
              : { movie: item, locked: locked && !currentUser };
              
            return <Component key={item.id} {...props} />;
          })
        )}
      </div>
    </section>
  );
}
