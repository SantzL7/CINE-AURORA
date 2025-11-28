import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

export function useWatchlist(user) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega a lista de favoritos do usuário
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    const watchlistRef = collection(db, 'users', user.uid, 'watchlist');
    const unsubscribe = onSnapshot(
      watchlistRef,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setWatchlist(items);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar lista de favoritos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Adiciona um item à lista de favoritos
  const addToWatchlist = async (itemId, itemType = 'movie') => {
    if (!user) return false;

    try {
      const watchlistRef = doc(db, 'users', user.uid, 'watchlist', itemId);
      await setDoc(watchlistRef, {
        id: itemId,
        type: itemType,
        addedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar à lista de favoritos:', error);
      return false;
    }
  };

  // Remove um item da lista de favoritos
  const removeFromWatchlist = async (itemId) => {
    if (!user) return false;

    try {
      const watchlistRef = doc(db, 'users', user.uid, 'watchlist', itemId);
      await deleteDoc(watchlistRef);
      return true;
    } catch (error) {
      console.error('Erro ao remover da lista de favoritos:', error);
      return false;
    }
  };

  // Verifica se um item está na lista de favoritos
  const isInWatchlist = (itemId) => {
    return watchlist.some((item) => item.id === itemId);
  };

  // Alterna um item na lista de favoritos
  const toggleWatchlist = async (itemId, itemType = 'movie') => {
    if (isInWatchlist(itemId)) {
      return await removeFromWatchlist(itemId);
    } else {
      return await addToWatchlist(itemId, itemType);
    }
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };
}
