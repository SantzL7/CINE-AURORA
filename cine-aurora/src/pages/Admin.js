import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState([]);
  const [type, setType] = useState("movie");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCollection, setEditingCollection] = useState("");
  
  // Estados para gerenciamento de séries
  const [seasons, setSeasons] = useState([{ 
    number: 1, 
    title: "Temporada 1", 
    episodes: [{ 
      number: 1, 
      title: "Episódio 1", 
      description: "", 
      videoUrl: "", 
      thumbnailUrl: "", 
      duration: 0 
    }] 
  }]);
  const [activeSeason, setActiveSeason] = useState(0);
  
  const navigate = useNavigate();

  // Função para carregar itens (filmes e séries)
  const loadItems = async () => {
    setListLoading(true);
    try {
      // Carregar filmes
      const moviesRef = collection(db, "movies");
      const moviesSnapshot = await getDocs(moviesRef);
      const moviesList = moviesSnapshot.docs.map(doc => ({
        id: doc.id,
        collectionType: "movies",
        ...doc.data()
      }));

      // Carregar séries
      const seriesRef = collection(db, "series");
      const seriesSnapshot = await getDocs(seriesRef);
      const seriesList = seriesSnapshot.docs.map(doc => ({
        id: doc.id,
        collectionType: "series",
        ...doc.data()
      }));

      setItems([...moviesList, ...seriesList]);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      setError("Erro ao carregar a lista de itens. Tente novamente.");
    } finally {
      setListLoading(false);
    }
  };

  // Função para carregar temporadas e episódios de uma série
  const loadSeriesSeasons = async (seriesId) => {
    try {
      setLoading(true);
      const seasonsRef = collection(db, `series/${seriesId}/seasons`);
      const seasonsSnapshot = await getDocs(seasonsRef);
      
      const loadedSeasons = [];
      
      for (const seasonDoc of seasonsSnapshot.docs) {
        const seasonData = seasonDoc.data();
        const episodesRef = collection(db, `series/${seriesId}/seasons/${seasonDoc.id}/episodes`);
        const episodesSnapshot = await getDocs(episodesRef);
        
        const episodes = episodesSnapshot.docs.map(epDoc => ({
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
      console.error("Erro ao carregar temporadas:", error);
      setError("Erro ao carregar as temporadas da série.");
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar uma nova temporada
  const addSeason = () => {
    const newSeasonNumber = seasons.length > 0 ? Math.max(...seasons.map(s => s.number)) + 1 : 1;
    const newSeason = {
      number: newSeasonNumber,
      title: `Temporada ${newSeasonNumber}`,
      episodes: [{
        number: 1,
        title: "Episódio 1",
        description: "",
        videoUrl: "",
        thumbnailUrl: "",
        duration: 0
      }]
    };
    setSeasons([...seasons, newSeason]);
    setActiveSeason(seasons.length);
  };

  // Função para remover uma temporada
  const removeSeason = (index) => {
    if (seasons.length <= 1) return; // Não permite remover a última temporada
    const newSeasons = [...seasons];
    newSeasons.splice(index, 1);
    setSeasons(newSeasons);
    setActiveSeason(Math.min(activeSeason, newSeasons.length - 1));
  };

  // Função para adicionar um novo episódio a uma temporada
  const addEpisode = (seasonIndex) => {
    const newSeasons = [...seasons];
    const episodeNumber = newSeasons[seasonIndex].episodes.length + 1;
    newSeasons[seasonIndex].episodes.push({
      number: episodeNumber,
      title: `Episódio ${episodeNumber}`,
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0
    });
    setSeasons(newSeasons);
  };

  // Função para remover um episódio de uma temporada
  const removeEpisode = (seasonIndex, episodeIndex) => {
    const newSeasons = [...seasons];
    if (newSeasons[seasonIndex].episodes.length <= 1) return; // Não permite remover o último episódio
    newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
    // Atualiza os números dos episódios
    newSeasons[seasonIndex].episodes = newSeasons[seasonIndex].episodes.map((ep, idx) => ({
      ...ep,
      number: idx + 1,
      title: ep.title.replace(/Episódio \d+/, `Episódio ${idx + 1}`)
    }));
    setSeasons(newSeasons);
  };

  // Função para atualizar um campo de uma temporada
  const updateSeasonField = (seasonIndex, field, value) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex] = { ...newSeasons[seasonIndex], [field]: value };
    setSeasons(newSeasons);
  };

  // Função para atualizar um campo de um episódio
  const updateEpisodeField = (seasonIndex, episodeIndex, field, value) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes[episodeIndex] = {
      ...newSeasons[seasonIndex].episodes[episodeIndex],
      [field]: value
    };
    setSeasons(newSeasons);
  };

  // Carregar itens quando o componente for montado
  useEffect(() => {
    loadItems();
  }, []);

  async function handleDelete(id, collectionType) {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }
    
    try {
      setItems((prev) => {
        const item = prev.find((x) => x.id === id);
        if (item) {
          // Usando 'movies' para a coleção de filmes
          const col = item.collectionType === "movies" ? "movies" : "series";
          deleteDoc(doc(db, col, id));
        }
        return prev.filter((it) => it.id !== id);
      });
      setSuccess("Item excluído com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error("Erro ao excluir item:", e);
      setError("Erro ao excluir o item. Tente novamente.");
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setGenres([]);
    setType("movie");
    setThumbnailUrl("");
    setVideoUrl("");
    setYear("");
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  function handleEdit(item) {
    setTitle(item.title || "");
    setDescription(item.description || "");
    setGenres(item.genres || []);
    setType(item.type || "movie");
    setThumbnailUrl(item.thumbnailUrl || "");
    setVideoUrl(item.videoUrl || "");
    setYear(item.year ? item.year.toString() : "");
    setBannerUrl(item.bannerUrl || "");
    setEditingId(item.id);
    setEditingCollection(item.collectionType || "movies");
    
    // Se for uma série, carrega as temporadas e episódios
    if (item.type === "series" && item.id) {
      loadSeriesSeasons(item.id);
    } else {
      setSeasons([{ 
        number: 1, 
        title: "Temporada 1", 
        episodes: [{ 
          number: 1, 
          title: "Episódio 1", 
          description: "", 
          videoUrl: "", 
          thumbnailUrl: "", 
          duration: 0 
        }] 
      }]);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Função para salvar uma série com temporadas e episódios
  async function saveSeries() {
    try {
      setLoading(true);
      
      // Dados básicos da série
      const seriesData = {
        title,
        description,
        genres,
        type: "series",
        thumbnailUrl,
        bannerUrl: bannerUrl || thumbnailUrl,
        year: year ? parseInt(year) : null,
        seasonCount: seasons.length,
        episodeCount: seasons.reduce((total, season) => total + (season.episodes?.length || 0), 0),
        updatedAt: serverTimestamp()
      };
      
      // Apenas adiciona o createdAt se for um novo documento
      if (!editingId || editingCollection !== "series") {
        seriesData.createdAt = serverTimestamp();
      }
      
      let seriesRef;
      const batch = writeBatch(db);
      
      if (editingId && editingCollection === "series") {
        // Atualiza a série existente
        seriesRef = doc(db, "series", editingId);
        batch.update(seriesRef, seriesData);
      } else {
        // Cria uma nova série
        seriesRef = doc(collection(db, "series"));
        batch.set(seriesRef, seriesData);
      }
      
      const seriesId = editingId && editingCollection === "series" ? editingId : seriesRef.id;
      
      // Se for uma edição, primeiro removemos as temporadas e episódios antigos
      if (editingId && editingCollection === "series") {
        // Obter todas as temporadas existentes
        const seasonsSnapshot = await getDocs(collection(db, `series/${seriesId}/seasons`));
        
        // Para cada temporada, deletar todos os episódios
        for (const seasonDoc of seasonsSnapshot.docs) {
          const episodesSnapshot = await getDocs(collection(db, `series/${seriesId}/seasons/${seasonDoc.id}/episodes`));
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
          description: season.description || "",
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
        for (const episode of (season.episodes || [])) {
          const episodeData = {
            number: episode.number,
            title: episode.title,
            description: episode.description || "",
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
          
          const episodeRef = doc(collection(db, `series/${seriesId}/seasons/${seasonRef.id}/episodes`));
          batch.set(episodeRef, episodeData);
        }
      }
      
      // Executa todas as operações em lote
      await batch.commit();
      
      setSuccess(`Série ${editingId ? 'atualizada' : 'adicionada'} com sucesso!`);
      resetForm();
      loadItems(); // Recarrega a lista de itens
      
    } catch (error) {
      console.error("Erro ao salvar série:", error);
      setError(`Erro ao ${editingId ? 'atualizar' : 'adicionar'} a série. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validação básica
    if (!title || genres.length === 0) {
      setError("Título e pelo menos um gênero são obrigatórios.");
      return;
    }
    
    if (type === "movie" && !videoUrl) {
      setError("Para filmes, o link do vídeo é obrigatório.");
      return;
    }
    
    if (type === "series" && (seasons.length === 0 || seasons.some(s => !s.episodes || s.episodes.length === 0))) {
      setError("Adicione pelo menos uma temporada e um episódio à série.");
      return;
    }
    
    // Valida episódios
    if (type === "series") {
      for (const season of seasons) {
        if (!season.episodes || season.episodes.length === 0) {
          setError(`A temporada "${season.title}" não possui episódios.`);
          return;
        }
        
        for (const episode of season.episodes) {
          if (!episode.videoUrl) {
            setError(`O episódio "${episode.title}" da temporada ${season.number} não possui link de vídeo.`);
            return;
          }
        }
      }
    }
    
    try {
      setLoading(true);
      
      if (type === "series") {
        await saveSeries();
      } else {
        // Código existente para salvar filmes
        const targetCollection = "movies";
        const primaryGenre = genres[0];
        
        const itemData = {
          title,
          description,
          genre: primaryGenre,
          genres,
          type: "movie",
          thumbnailUrl,
          videoUrl,
          year: year ? parseInt(year) : null,
          updatedAt: serverTimestamp()
        };
        
        // Apenas adiciona o createdAt se for um novo documento
        if (!editingId || editingCollection !== "movies") {
          itemData.createdAt = serverTimestamp();
        }
        
        if (editingId && editingCollection === "movies") {
          await updateDoc(doc(db, targetCollection, editingId), itemData);
          setSuccess("Filme atualizado com sucesso!");
        } else {
          await addDoc(collection(db, targetCollection), itemData);
          setSuccess("Filme adicionado com sucesso!");
        }
        
        resetForm();
        loadItems();
      }
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      setError(`Erro ao ${editingId ? 'atualizar' : 'adicionar'} o item. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="content" style={{ maxWidth: 960, margin: "0 auto", padding: '20px' }}>
        <div className="auth-card" style={{ maxWidth: "100%", marginTop: 24 }}>
          <h1 style={{ marginBottom: 4 }}>Área do Administrador</h1>
          <p className="muted" style={{ marginBottom: 16 }}>
            {editingId ? 'Editando item' : 'Cadastre novos filmes e séries'}. Eles aparecerão na Home de acordo com o gênero escolhido.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <div>
              <label>Título</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Descrição</label>
              <textarea
                className="input"
                style={{ minHeight: 80, resize: "vertical" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label>Tipo</label>
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="movie">Filme</option>
                <option value="series">Série</option>
              </select>
            </div>
            <div>
              <label>Gêneros</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {[
                  "Acao",
                  "Aventura",
                  "Comedia",
                  "Drama",
                  "Romance",
                  "Terror",
                  "Suspense",
                  "Ficcao cientifica",
                  "Fantasia",
                  "Animacao",
                  "Documentario",
                  "Crime",
                ].map((g) => {
                  const checked = genres.includes(g);
                  return (
                    <label key={g} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setGenres((prev) =>
                            checked ? prev.filter((x) => x !== g) : [...prev, g]
                          );
                        }}
                      />
                      {g}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label>URL da thumbnail (imagem)</label>
              <input
                className="input"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label>URL do vídeo (YouTube, Vimeo ou outro)</label>
              <input
                className="input"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                required={type === "movie"}
              />
            </div>
            <div>
              <label>Ano</label>
              <input
                className="input"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
              />
            </div>
            
            {/* Seção de temporadas e episódios (apenas para séries) */}
            {type === "series" && (
              <div className="series-section" style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                padding: '16px',
                marginTop: '16px'
              }}>
                <h3 style={{ marginTop: 0 }}>Temporadas e Episódios</h3>
                
                {/* Abas de temporadas */}
                <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', marginBottom: '16px' }}>
                  {seasons.map((season, sIndex) => (
                    <button
                      key={sIndex}
                      type="button"
                      onClick={() => setActiveSeason(sIndex)}
                      style={{
                        padding: '8px 16px',
                        border: `1px solid ${activeSeason === sIndex ? '#e50914' : '#e0e0e0'}`,
                        background: activeSeason === sIndex ? '#f8f8f8' : 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        color: activeSeason === sIndex ? '#e50914' : 'inherit'
                      }}
                    >
                      {season.title}
                      {seasons.length > 1 && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSeason(sIndex);
                          }}
                          style={{ 
                            marginLeft: '8px', 
                            color: '#ff4444',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </span>
                      )}
                    </button>
                  ))}
                  <button 
                    type="button" 
                    onClick={addSeason}
                    style={{
                      padding: '8px 16px',
                      border: '1px dashed #ccc',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Adicionar Temporada
                  </button>
                </div>

                {/* Formulário da temporada ativa */}
                {seasons.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label>Título da Temporada</label>
                        <input
                          type="text"
                          className="input"
                          value={seasons[activeSeason].title}
                          onChange={(e) => updateSeasonField(activeSeason, 'title', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>Número</label>
                        <input
                          type="number"
                          className="input"
                          value={seasons[activeSeason].number}
                          onChange={(e) => updateSeasonField(activeSeason, 'number', parseInt(e.target.value) || 1)}
                          min="1"
                          required
                          style={{ width: '80px' }}
                        />
                      </div>
                    </div>

                    {/* Lista de episódios */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0 }}>Episódios</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const count = prompt('Quantos episódios deseja adicionar?', '1');
                              const numEpisodes = Math.max(1, parseInt(count) || 1);
                              for (let i = 0; i < numEpisodes; i++) {
                                addEpisode(activeSeason);
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            + Adicionar Vários
                          </button>
                          <button
                            type="button"
                            onClick={() => addEpisode(activeSeason)}
                            style={{
                              padding: '6px 12px',
                              background: '#2196f3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            + Adicionar 1
                          </button>
                        </div>
                      </div>

                      {seasons[activeSeason].episodes.map((episode, eIndex) => (
                        <div key={eIndex} style={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '4px', 
                          padding: '12px', 
                          marginBottom: '12px' 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0 }}>Episódio {episode.number}</h4>
                            {seasons[activeSeason].episodes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEpisode(activeSeason, eIndex)}
                                style={{
                                  background: '#ff4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                Título do Episódio
                              </label>
                              <input
                                type="text"
                                value={episode.title}
                                onChange={(e) => updateEpisodeField(activeSeason, eIndex, 'title', e.target.value)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9rem' }}
                                placeholder="Título do episódio"
                              />
                            </div>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                URL do Vídeo (obrigatório)
                              </label>
                              <input
                                type="url"
                                value={episode.videoUrl || ''}
                                onChange={(e) => updateEpisodeField(activeSeason, eIndex, 'videoUrl', e.target.value)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9rem' }}
                                placeholder="https://exemplo.com/video.mp4"
                                required
                              />
                            </div>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                Descrição
                              </label>
                              <textarea
                                value={episode.description || ''}
                                onChange={(e) => updateEpisodeField(activeSeason, eIndex, 'description', e.target.value)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', minHeight: '80px', fontSize: '0.9rem' }}
                                placeholder="Descrição do episódio"
                              />
                            </div>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                URL da Miniatura (opcional)
                              </label>
                              <input
                                type="url"
                                value={episode.thumbnailUrl || ''}
                                onChange={(e) => updateEpisodeField(activeSeason, eIndex, 'thumbnailUrl', e.target.value)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9rem' }}
                                placeholder="Deixe em branco para usar a miniatura da série"
                              />
                            </div>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                Duração (em segundos)
                              </label>
                              <input
                                type="number"
                                value={episode.duration || 0}
                                onChange={(e) => updateEpisodeField(activeSeason, eIndex, 'duration', parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9rem' }}
                                min="0"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {error && <div className="error">{error}</div>}
            {success && (
              <div style={{ color: "#4caf50", fontSize: "0.9rem", marginBottom: 4 }}>
                {success}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? "Salvando..." : (editingId ? "Atualizar" : "Adicionar")}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={resetForm}
                  style={{ marginLeft: '10px' }}
                >
                  Cancelar Edição
                </button>
              )}
              <button type="button" className="btn" onClick={() => navigate("/app")}>
                Voltar para Home
              </button>
            </div>
          </form>
        </div>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Catálogo atual</h2>
          {listLoading && <div>Carregando títulos...</div>}
          {!listLoading && items.length === 0 && <div>Sem títulos cadastrados.</div>}
          {!listLoading && items.length > 0 && (
            <div style={{ display: "grid", gap: 8 }}>
              {items.map((item) => (
                <div key={item.id} className="admin-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{item.title}</h3>
                    <p className="muted" style={{ margin: 0 }}>
                      {item.type === "series" ? "Série" : "Filme"} • {item.genre} • {item.year || 'Sem ano'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleEdit(item)}
                      style={{ padding: '6px 12px' }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => handleDelete(item.id)}
                      style={{ padding: '6px 12px' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
