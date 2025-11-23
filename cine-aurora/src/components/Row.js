import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, doc, getDoc, limit } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";
import SeriesCard from "./SeriesCard";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  const scrollerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    
    const scrollAmount = direction === 'left' ? -400 : 400;
    scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const checkScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    
    setShowLeftButton(scroller.scrollLeft > 0);
    setShowRightButton(
      scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 10
    );
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener('scroll', checkScroll);
      // Verificar estado inicial
      checkScroll();
      return () => scroller.removeEventListener('scroll', checkScroll);
    }
  }, [items]); // Re-run when items change
  
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
      console.log('Row - Iniciando carregamento...', { 
        title, 
        type, 
        watchlist, 
        continueWatching,
        currentUser: currentUser?.uid || 'Nenhum usuário logado'
      });
      setLoading(true);
      try {
        if (continueWatching) {
          if (!currentUser) {
            console.log('Usuário não autenticado, não é possível carregar itens em andamento');
            setItems([]);
            return;
          }
          
          console.log('Carregando itens em andamento...');
          setLoading(true);
          
          try {
            console.log('Buscando itens em progresso...');
            console.log('Caminho da coleção progress:', `users/${currentUser.uid}/progress`);
            console.log('Caminho da coleção watching:', `users/${currentUser.uid}/watching`);
            
            let progressSnap, watchingSnap, userWatchingList = [];
            
            try {
              // Busca os itens em andamento (filmes e séries)
              const [progressSnapResult, watchingSnapResult, userDoc] = await Promise.all([
                getDocs(collection(db, "users", currentUser.uid, "progress")),
                getDocs(collection(db, "users", currentUser.uid, "watching")),
                getDoc(doc(db, "users", currentUser.uid))
              ]);
              
              progressSnap = progressSnapResult;
              watchingSnap = watchingSnapResult;
              userWatchingList = userDoc.exists() ? (userDoc.data().watching || []) : [];
              
              console.log('Itens em progresso (filmes):', progressSnap.docs.map(d => ({
                id: d.id,
                ...d.data()
              })));
              
              console.log('Séries assistindo:', watchingSnap.docs.map(d => ({
                id: d.id,
                ...d.data()
              })));
              
              console.log('Lista de assistir do usuário:', userWatchingList);
            } catch (error) {
              console.error('Erro ao buscar itens em andamento:', error);
              // Inicializa como vazio em caso de erro
              progressSnap = { docs: [], size: 0, empty: true };
              watchingSnap = { docs: [], size: 0, empty: true };
            }

            // Processa todos os itens em progresso da mesma forma
            const allItems = [];
            const processedSeriesIds = new Set();
            
            // Processa filmes (progress)
            progressSnap.docs.forEach(doc => {
              const data = doc.data();
              console.log('Processando filme em andamento:', { id: doc.id, data });
              
              allItems.push({
                id: doc.id,
                type: 'movie',
                currentTime: data.currentTime || 0,
                duration: data.duration || 0,
                ...data
              });
            });
            
            // Processa séries (watching)
            watchingSnap.docs.forEach(doc => {
              const data = doc.data();
              console.log('Processando série em andamento:', { id: doc.id, data });
              
              // Usa o seriesId do documento ou extrai do ID se não estiver disponível
              const seriesId = data.seriesId || doc.id.split('-')[0];
              if (!seriesId) {
                console.warn('Não foi possível extrair o ID da série do documento:', doc.id, data);
                return;
              }
              
              // Adiciona à lista de IDs processados
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
            
            // Adiciona as séries da lista de assistir do usuário que ainda não foram processadas
            userWatchingList.forEach(series => {
              if (!series.seriesId) return;
              
              // Se a série já foi processada, pula para a próxima
              if (processedSeriesIds.has(series.seriesId)) {
                console.log(`Série ${series.seriesId} já está na lista de processadas`);
                return;
              }
              
              console.log('Adicionando série da lista de assistir:', series.seriesId);
              
              allItems.push({
                id: series.seriesId,
                type: 'series',
                currentTime: 0,
                duration: 0,
                ...series
              });
            });
            console.log('Itens em andamento encontrados:', allItems);

            if (allItems.length === 0) {
              console.log('Nenhum item em andamento encontrado');
              setItems([]);
              return;
            }

            // Filtra por tipo se especificado
            console.log('Itens antes do filtro:', allItems.map(item => ({
              id: item.id,
              type: item.type,
              title: item.title || 'Sem título',
              seriesId: item.seriesId || 'N/A',
              currentTime: item.currentTime,
              duration: item.duration
            })));
            
            const filteredItems = type 
              ? allItems.filter(item => {
                  // Normaliza o tipo para comparação
                  const normalizedType = item.type === 'movies' ? 'movie' : item.type;
                  const targetType = type === 'movies' ? 'movie' : type;
                  const matches = normalizedType === targetType;
                  
                  console.log(`Item ${item.id} (${item.type} -> ${normalizedType}) - Filtro para ${targetType}:`, matches, 'Item completo:', {
                    id: item.id,
                    type: item.type,
                    normalizedType,
                    title: item.title || 'Sem título',
                    seriesId: item.seriesId || 'N/A'
                  });
                  
                  return matches;
                })
              : allItems;
            console.log('Itens após filtro:', filteredItems.map(item => ({
              id: item.id,
              type: item.type,
              title: item.title || 'Sem título',
              seriesId: item.seriesId || 'N/A'
            })));

            // Busca os detalhes de cada item
            const itemPromises = filteredItems.map(item => {
              return new Promise(async (resolve) => {
                try {
                  const isSeries = item.type === 'series';
                  const collectionName = isSeries ? 'series' : 'movies';
                  const docId = isSeries ? (item.seriesId || item.id) : item.id;
                  
                  if (!docId) {
                    console.warn('ID do documento inválido para o item:', item);
                    resolve(null);
                    return;
                  }
                  
                  console.log(`Buscando ${collectionName}/${docId}...`, { item });
                  
                  const docSnap = await getDoc(doc(db, collectionName, docId));
                  
                  if (docSnap.exists()) {
                    const itemData = docSnap.data();
                    
                    // Garante que temos um ID válido
                    if (!itemData.id) {
                      itemData.id = docSnap.id;
                    }
                    
                    // Calcula o progresso (para filmes) ou usa o progresso salvo (para séries)
                    const progress = item.duration > 0 
                      ? (item.currentTime / item.duration) 
                      : (itemData.duration ? (item.currentTime / itemData.duration) : 0);
                    
                    console.log(`Item carregado: ${docId} (${collectionName}), progresso: ${(progress * 100).toFixed(1)}%`, {
                      id: docSnap.id,
                      type: isSeries ? 'series' : 'movies',
                      progress: Math.min(progress, 0.99),
                      currentTime: item.currentTime,
                      duration: item.duration || itemData.duration,
                      hasThumbnail: !!(itemData.thumbnailUrl || itemData.poster_path || itemData.backdrop_path)
                    });
                    
                    resolve({
                      id: docSnap.id,
                      type: isSeries ? 'series' : 'movies',
                      progress: Math.min(progress, 0.99), // Limita a 99% para mostrar o botão de "Continuar"
                      ...itemData,
                      // Mantém as informações de progresso
                      currentTime: item.currentTime,
                      duration: item.duration || itemData.duration,
                      // Garante que temos um ID de série para séries
                      ...(isSeries && !itemData.seriesId ? { seriesId: docSnap.id } : {})
                    });
                  } else {
                    console.warn(`Documento não encontrado: ${collectionName}/${docId}`, {
                      item,
                      collectionName,
                      docId
                    });
                    resolve(null);
                  }
                } catch (error) {
                  console.error(`Erro ao carregar item:`, error);
                  resolve(null);
                }
              });
            });

            const itemSnaps = await Promise.all(itemPromises);
            const validItems = itemSnaps.filter(Boolean);
            
            console.log('Itens carregados com sucesso:', validItems.map(item => ({
              id: item.id,
              type: item.type,
              title: item.title || 'Sem título',
              seriesId: item.seriesId || 'N/A',
              progress: item.progress,
              currentTime: item.currentTime,
              duration: item.duration
            })));
            
            // Log detalhado de cada item
            validItems.forEach((item, index) => {
              console.log(`Item ${index + 1}:`, {
                id: item.id,
                type: item.type,
                title: item.title || 'Sem título',
                progress: item.progress,
                currentTime: item.currentTime,
                duration: item.duration,
                hasThumbnail: !!(item.thumbnailUrl || (item.backdrop_path || item.poster_path))
              });
            });
            
            setItems(validItems);

          } catch (error) {
            console.error('Erro ao carregar itens em andamento:', error);
            setItems([]);
          } finally {
            setLoading(false);
          }
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
              
              // Normaliza o tipo do item (aceita 'movie' ou 'movies' para filmes)
              let itemType = item.type;
              if (itemType === 'movie') {
                itemType = 'movies'; // Padroniza para 'movies'
              }
              console.log(`Processando item ID: ${item.id}, Tipo: ${itemType}, Título: ${item.title || 'sem título'}`);
              
              // Se o tipo do item corresponder ao tipo solicitado (ou se não houver tipo específico)
              // E se o item tiver um tipo definido
              console.log(`Verificando condições: type=${type}, itemType=${itemType}, itemType existe? ${!!itemType}`);
              if ((!type || itemType === type) && itemType) {
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
  }, [genre, watchlist, continueWatching, currentUser, type, title]);

  console.log('Renderizando Row com items:', {
    title,
    type,
    itemsCount: items.length,
    items: items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title || 'Sem título',
      seriesId: item.seriesId || 'N/A',
      hasThumbnail: !!(item.thumbnailUrl || item.poster_path || item.backdrop_path)
    }))
  });
  
  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__container">
        {showLeftButton && (
          <button 
            className="nav-button nav-button--left" 
            onClick={() => scroll('left')}
            aria-label="Rolar para a esquerda"
          >
            <FaChevronLeft />
          </button>
        )}
        
        <div 
          className="row__scroller" 
          ref={scrollerRef}
        >
          {loading ? (
            <div className="row__loading">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="row__empty">
              {watchlist ? 'Nenhum item na sua lista' : 'Nenhum item encontrado'}
            </div>
          ) : (
            items.map((item) => {
            try {
              // Determina se o item é uma série com base no tipo ou no tipo da linha
              const isSeries = item.type === 'series' || type === 'series';
              
              console.log(`Renderizando item ${item.id} (${isSeries ? 'série' : 'filme'}):`, {
                id: item.id,
                type: item.type,
                title: item.title || 'Sem título',
                seriesId: item.seriesId || 'N/A',
                hasThumbnail: !!(item.thumbnailUrl || item.poster_path || item.backdrop_path)
              });
              
              // Escolhe o componente apropriado
              const Component = isSeries ? SeriesCard : Card;
              
              // Prepara as props apropriadas para cada tipo de componente
              const props = isSeries 
                ? { 
                    series: { 
                      ...item,
                      // Garante que o ID da série está definido
                      id: item.seriesId || item.id,
                      // Garante que temos um ID de série
                      seriesId: item.seriesId || item.id
                    }, 
                    locked: locked && !currentUser 
                  }
                : { 
                    movie: { 
                      ...item,
                      // Garante que o ID do filme está definido
                      id: item.id 
                    }, 
                    locked: locked && !currentUser 
                  };
              
              console.log(`Item ${item.id} - Props para ${isSeries ? 'SeriesCard' : 'Card'}:`, props);
              
              // Usa o ID da série para séries, se disponível
              const key = isSeries ? (item.seriesId || item.id) : item.id;
              
              return <Component key={key} {...props} />;
              
            } catch (error) {
              console.error('Erro ao renderizar item:', error, { item });
              return null;
            }
          })
        )}
        </div>
        
        {showRightButton && (
          <button 
            className="nav-button nav-button--right" 
            onClick={() => scroll('right')}
            aria-label="Rolar para a direita"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}
