import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export function useRowData({
  genre,
  type = 'movie',
  watchlist = false,
  continueWatching = false,
  currentUser
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar itens de uma coleção específica
  const fetchItems = useCallback(async (collectionName, genreFilter) => {
    let data = [];
    try {
      if (genreFilter) {
        // Tenta buscar com o novo formato de array de gêneros
        const qNew = query(
          collection(db, collectionName),
          where('genres', 'array-contains', genreFilter)
        );
        const snapNew = await getDocs(qNew);
        data = snapNew.docs.map(docSnap => ({
          id: docSnap.id,
          type: collectionName,
          ...docSnap.data()
        }));

        // Se não encontrar nada, tenta o formato antigo
        if (data.length === 0) {
          const qOld = query(collection(db, collectionName), where('genre', '==', genreFilter));
          const snapOld = await getDocs(qOld);
          data = snapOld.docs.map(docSnap => ({
            id: docSnap.id,
            type: collectionName,
            ...docSnap.data()
          }));
        }
      } else {
        // Se não houver gênero específico, busca todos os itens (limitado a 10)
        const q = query(collection(db, collectionName), limit(10));
        const snapshot = await getDocs(q);
        data = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          type: collectionName,
          ...docSnap.data()
        }));
      }
    } catch (err) {
      console.error(`Erro ao buscar itens de ${collectionName}:`, err);
      // Não lança erro aqui para permitir que outras buscas continuem
    }
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (continueWatching) {
          if (!currentUser) {
            if (isMounted) setItems([]);
            return;
          }

          try {
            let progressSnap,
              watchingSnap,
              userWatchingList = [];

            try {
              const [progressSnapResult, watchingSnapResult, userDoc] = await Promise.all([
                getDocs(collection(db, 'users', currentUser.uid, 'progress')),
                getDocs(collection(db, 'users', currentUser.uid, 'watching')),
                getDoc(doc(db, 'users', currentUser.uid))
              ]);

              progressSnap = progressSnapResult;
              watchingSnap = watchingSnapResult;
              userWatchingList = userDoc.exists() ? userDoc.data().watching || [] : [];
            } catch (err) {
              console.error('Erro ao buscar itens em andamento:', err);
              progressSnap = { docs: [], size: 0, empty: true };
              watchingSnap = { docs: [], size: 0, empty: true };
            }

            const allItems = [];
            const processedSeriesIds = new Set();

            // Processa filmes (progress)
            progressSnap.docs.forEach(docSnap => {
              const data = docSnap.data();
              allItems.push({
                id: docSnap.id,
                type: 'movie',
                currentTime: data.currentTime || 0,
                duration: data.duration || 0,
                ...data
              });
            });

            // Processa séries (watching)
            watchingSnap.docs.forEach(docSnap => {
              const data = docSnap.data();
              const seriesId = data.seriesId || docSnap.id.split('-')[0];
              if (!seriesId) return;

              processedSeriesIds.add(seriesId);
              allItems.push({
                id: seriesId,
                type: 'series',
                currentTime: data.currentTime || 0,
                duration: data.duration || 0,
                ...data,
                seriesId: seriesId
              });
            });

            // Adiciona as séries da lista de assistir do usuário
            userWatchingList.forEach(series => {
              if (!series.seriesId) return;
              if (processedSeriesIds.has(series.seriesId)) return;

              allItems.push({
                id: series.seriesId,
                type: 'series',
                currentTime: 0,
                duration: 0,
                ...series
              });
            });

            if (allItems.length === 0) {
              if (isMounted) setItems([]);
              return;
            }

            // Filtra por tipo se especificado
            const filteredItems = type
              ? allItems.filter(item => {
                  const normalizedType = item.type === 'movies' ? 'movie' : item.type;
                  const targetType = type === 'movies' ? 'movie' : type;
                  return normalizedType === targetType;
                })
              : allItems;

            // Busca os detalhes de cada item
            const itemPromises = filteredItems.map(item => {
              return new Promise(async resolve => {
                try {
                  const isSeries = item.type === 'series';
                  const collectionName = isSeries ? 'series' : 'movies';
                  const docId = isSeries ? item.seriesId || item.id : item.id;

                  if (!docId) {
                    resolve(null);
                    return;
                  }

                  const docSnap = await getDoc(doc(db, collectionName, docId));

                  if (docSnap.exists()) {
                    const itemData = docSnap.data();
                    if (!itemData.id) itemData.id = docSnap.id;

                    const progress =
                      item.duration > 0
                        ? item.currentTime / item.duration
                        : itemData.duration
                          ? item.currentTime / itemData.duration
                          : 0;

                    resolve({
                      id: docSnap.id,
                      type: isSeries ? 'series' : 'movies',
                      progress: Math.min(progress, 0.99),
                      ...itemData,
                      currentTime: item.currentTime,
                      duration: item.duration || itemData.duration,
                      ...(isSeries && !itemData.seriesId ? { seriesId: docSnap.id } : {})
                    });
                  } else {
                    resolve(null);
                  }
                } catch (err) {
                  console.error(`Erro ao carregar item:`, err);
                  resolve(null);
                }
              });
            });

            const itemSnaps = await Promise.all(itemPromises);
            const validItems = itemSnaps.filter(Boolean);

            if (isMounted) setItems(validItems);
          } catch (err) {
            console.error('Erro ao carregar itens em andamento:', err);
            if (isMounted) {
              setError(err);
              setItems([]);
            }
          }
        } else if (watchlist) {
          if (!currentUser) {
            if (isMounted) setItems([]);
            return;
          }

          try {
            const watchlistRef = collection(db, 'users', currentUser.uid, 'watchlist');
            const listSnap = await getDocs(watchlistRef);
            const watchlistItems = [];

            for (const docSnap of listSnap.docs) {
              const item = { id: docSnap.id, ...docSnap.data() };
              let itemType = item.type;
              if (itemType === 'movie') itemType = 'movies';

              if ((!type || itemType === type) && itemType) {
                try {
                  const itemDoc = await getDoc(doc(db, itemType, item.id));
                  if (itemDoc.exists()) {
                    watchlistItems.push({
                      id: itemDoc.id,
                      type: itemType,
                      ...itemDoc.data()
                    });
                  }
                } catch (e) {
                  console.error(`Erro ao carregar item ${item.id}:`, e);
                }
              }
            }

            watchlistItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            if (isMounted) setItems(watchlistItems);
          } catch (err) {
            console.error('Erro ao carregar lista de favoritos:', err);
            if (isMounted) {
              setError(err);
              setItems([]);
            }
          }
        } else {
          let data = [];
          if (type === 'series') {
            data = await fetchItems('series', genre);
          } else if (type === 'movie') {
            data = await fetchItems('movies', genre);
          } else {
            const [moviesData, seriesData] = await Promise.all([
              fetchItems('movies', genre),
              fetchItems('series', genre)
            ]);
            data = [...moviesData, ...seriesData];
            data.sort((a, b) => a.title.localeCompare(b.title));
          }
          if (isMounted) setItems(data);
        }
      } catch (err) {
        console.error('Erro geral ao carregar itens:', err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [genre, watchlist, continueWatching, currentUser, type, fetchItems]);

  return { items, loading, error };
}
