import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import AdminForm from '../components/features/admin/AdminForm';
import AdminList from '../components/features/admin/AdminList';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState([]);
  const [type, setType] = useState('movie');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCollection, setEditingCollection] = useState('');

  // Estados para gerenciamento de séries
  const [seasons, setSeasons] = useState([
    {
      number: 1,
      title: 'Temporada 1',
      episodes: [
        {
          number: 1,
          title: 'Episódio 1',
          description: '',
          videoUrl: '',
          thumbnailUrl: '',
          duration: 0
        }
      ]
    }
  ]);
  const [activeSeason, setActiveSeason] = useState(0);

  const navigate = useNavigate();

  // Função para carregar itens (filmes e séries)
  const loadItems = async () => {
    setListLoading(true);
    try {
      // Carregar filmes
      const moviesRef = collection(db, 'movies');
      const moviesSnapshot = await getDocs(moviesRef);
      const moviesList = moviesSnapshot.docs.map((doc) => ({
        id: doc.id,
        collectionType: 'movies',
        ...doc.data()
      }));

      // Carregar séries
      const seriesRef = collection(db, 'series');
      const seriesSnapshot = await getDocs(seriesRef);
      const seriesList = seriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        collectionType: 'series',
        ...doc.data()
      }));

      setItems([...moviesList, ...seriesList]);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      setError('Erro ao carregar a lista de itens. Tente novamente.');
    } finally {
      setListLoading(false);
    }
  };

  // Função para carregar temporadas e episódios de uma série
  // Função para carregar temporadas e episódios de uma série
  const loadSeriesSeasons = useCallback(async (seriesId) => {
    try {
      setLoading(true);
      const seasonsRef = collection(db, `series/${seriesId}/seasons`);
      const seasonsSnapshot = await getDocs(seasonsRef);

      const loadedSeasons = [];

      for (const seasonDoc of seasonsSnapshot.docs) {
        const seasonData = seasonDoc.data();
        const episodesRef = collection(db, `series/${seriesId}/seasons/${seasonDoc.id}/episodes`);
        const episodesSnapshot = await getDocs(episodesRef);

        const episodes = episodesSnapshot.docs.map((epDoc) => ({
          id: epDoc.id,
          ...epDoc.data()
        }));

        loadedSeasons.push({
          id: seasonDoc.id,
          ...seasonData,
          episodes: episodes.sort((a, b) => a.number - b.number)
        });
      }

      setSeasons(loadedSeasons.sort((a, b) => a.number - b.number));
    } catch (error) {
      console.error('Erro ao carregar temporadas:', error);
      setError('Erro ao carregar as temporadas da série.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar itens quando o componente for montado
  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = useCallback(async (id, collectionType) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      setItems((prev) => {
        const item = prev.find((x) => x.id === id);
        if (item) {
          // Usando 'movies' para a coleção de filmes
          const col = item.collectionType === 'movies' ? 'movies' : 'series';
          deleteDoc(doc(db, col, id));
        }
        return prev.filter((it) => it.id !== id);
      });
      setSuccess('Item excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('Erro ao excluir item:', e);
      setError('Erro ao excluir o item. Tente novamente.');
    }
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setGenres([]);
    setType('movie');
    setThumbnailUrl('');
    setVideoUrl('');
    setYear('');
    setEditingId(null);
    setError('');
    setSuccess('');
    setSeasons([
      {
        number: 1,
        title: 'Temporada 1',
        episodes: [
          {
            number: 1,
            title: 'Episódio 1',
            description: '',
            videoUrl: '',
            thumbnailUrl: '',
            duration: 0
          }
        ]
      }
    ]);
    setActiveSeason(0);
  }, []);

  const handleEdit = useCallback(
    (item) => {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setGenres(item.genres || []);
      setType(item.type || 'movie');
      setThumbnailUrl(item.thumbnailUrl || '');
      setVideoUrl(item.videoUrl || '');
      setYear(item.year ? item.year.toString() : '');
      setBannerUrl(item.bannerUrl || '');
      setEditingId(item.id);
      setEditingCollection(item.collectionType || 'movies');

      // Se for uma série, carrega as temporadas e episódios
      if (item.type === 'series' && item.id) {
        loadSeriesSeasons(item.id);
      } else {
        setSeasons([
          {
            number: 1,
            title: 'Temporada 1',
            episodes: [
              {
                number: 1,
                title: 'Episódio 1',
                description: '',
                videoUrl: '',
                thumbnailUrl: '',
                duration: 0
              }
            ]
          }
        ]);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [loadSeriesSeasons]
  );

  // Função para salvar uma série com temporadas e episódios
  async function saveSeries() {
    try {
      setLoading(true);

      // Dados básicos da série
      const seriesData = {
        title,
        description,
        genres,
        type: 'series',
        thumbnailUrl,
        bannerUrl: bannerUrl || thumbnailUrl,
        year: year ? parseInt(year) : null,
        seasonCount: seasons.length,
        episodeCount: seasons.reduce((total, season) => total + (season.episodes?.length || 0), 0),
        updatedAt: serverTimestamp()
      };

      // Apenas adiciona o createdAt se for um novo documento
      if (!editingId || editingCollection !== 'series') {
        seriesData.createdAt = serverTimestamp();
      }

      let seriesRef;
      const batch = writeBatch(db);

      if (editingId && editingCollection === 'series') {
        // Atualiza a série existente
        seriesRef = doc(db, 'series', editingId);
        batch.update(seriesRef, seriesData);
      } else {
        // Cria uma nova série
        seriesRef = doc(collection(db, 'series'));
        batch.set(seriesRef, seriesData);
      }

      const seriesId = editingId && editingCollection === 'series' ? editingId : seriesRef.id;

      // Se for uma edição, primeiro removemos as temporadas e episódios antigos
      if (editingId && editingCollection === 'series') {
        // Obter todas as temporadas existentes
        const seasonsSnapshot = await getDocs(collection(db, `series/${seriesId}/seasons`));

        // Para cada temporada, deletar todos os episódios
        for (const seasonDoc of seasonsSnapshot.docs) {
          const episodesSnapshot = await getDocs(
            collection(db, `series/${seriesId}/seasons/${seasonDoc.id}/episodes`)
          );
          for (const episodeDoc of episodesSnapshot.docs) {
            batch.delete(episodeDoc.ref);
          }
          batch.delete(seasonDoc.ref);
        }
      }

      // Salva as temporadas e episódios
      for (const season of seasons) {
        const seasonData = {
          number: season.number,
          title: season.title,
          description: season.description || '',
          thumbnailUrl: season.thumbnailUrl || thumbnailUrl,
          year: season.year || (year ? parseInt(year) : null),
          episodeCount: season.episodes?.length || 0,
          seriesId,
          seriesTitle: title,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const seasonRef = doc(collection(db, `series/${seriesId}/seasons`));
        batch.set(seasonRef, seasonData);

        // Salva os episódios
        for (const episode of season.episodes || []) {
          const episodeData = {
            number: episode.number,
            title: episode.title,
            description: episode.description || '',
            videoUrl: episode.videoUrl,
            thumbnailUrl: episode.thumbnailUrl || thumbnailUrl,
            duration: episode.duration || 0,
            seasonNumber: season.number,
            seasonTitle: season.title,
            seriesId,
            seriesTitle: title,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          const episodeRef = doc(
            collection(db, `series/${seriesId}/seasons/${seasonRef.id}/episodes`)
          );
          batch.set(episodeRef, episodeData);
        }
      }

      // Executa todas as operações em lote
      await batch.commit();

      setSuccess(`Série ${editingId ? 'atualizada' : 'adicionada'} com sucesso!`);
      resetForm();
      loadItems(); // Recarrega a lista de itens
    } catch (error) {
      console.error('Erro ao salvar série:', error);
      setError(`Erro ao ${editingId ? 'atualizar' : 'adicionar'} a série. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação básica
    if (!title || genres.length === 0) {
      setError('Título e pelo menos um gênero são obrigatórios.');
      return;
    }

    if (type === 'movie' && !videoUrl) {
      setError('Para filmes, o link do vídeo é obrigatório.');
      return;
    }

    if (
      type === 'series' &&
      (seasons.length === 0 || seasons.some((s) => !s.episodes || s.episodes.length === 0))
    ) {
      setError('Adicione pelo menos uma temporada e um episódio à série.');
      return;
    }

    // Valida episódios
    if (type === 'series') {
      for (const season of seasons) {
        if (!season.episodes || season.episodes.length === 0) {
          setError(`A temporada "${season.title}" não possui episódios.`);
          return;
        }

        for (const episode of season.episodes) {
          if (!episode.videoUrl) {
            setError(
              `O episódio "${episode.title}" da temporada ${season.number} não possui link de vídeo.`
            );
            return;
          }
        }
      }
    }

    try {
      setLoading(true);

      if (type === 'series') {
        await saveSeries();
      } else {
        // Código existente para salvar filmes
        const targetCollection = 'movies';
        const primaryGenre = genres[0];

        const itemData = {
          title,
          description,
          genre: primaryGenre,
          genres,
          type: 'movie',
          thumbnailUrl,
          videoUrl,
          year: year ? parseInt(year) : null,
          updatedAt: serverTimestamp()
        };

        // Apenas adiciona o createdAt se for um novo documento
        if (!editingId || editingCollection !== 'movies') {
          itemData.createdAt = serverTimestamp();
        }

        if (editingId && editingCollection === 'movies') {
          await updateDoc(doc(db, targetCollection, editingId), itemData);
          setSuccess('Filme atualizado com sucesso!');
        } else {
          await addDoc(collection(db, targetCollection), itemData);
          setSuccess('Filme adicionado com sucesso!');
        }

        resetForm();
        loadItems();
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      setError(`Erro ao ${editingId ? 'atualizar' : 'adicionar'} o item. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="content" style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <AdminForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          genres={genres}
          setGenres={setGenres}
          type={type}
          setType={setType}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
          bannerUrl={bannerUrl}
          setBannerUrl={setBannerUrl}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          year={year}
          setYear={setYear}
          seasons={seasons}
          setSeasons={setSeasons}
          activeSeason={activeSeason}
          setActiveSeason={setActiveSeason}
          loading={loading}
          error={error}
          success={success}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editingId={editingId}
          navigate={navigate}
        />

        <AdminList
          items={items}
          loading={listLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
