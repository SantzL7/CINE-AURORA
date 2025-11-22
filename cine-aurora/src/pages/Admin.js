import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState([]);
  const [type, setType] = useState("movie");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMovies() {
      console.log('Iniciando carregamento de filmes...');
      console.log('Configuração do Firebase:', db.app.options);
      
      setListLoading(true);
      try {
        // Carregar filmes
        console.log('Buscando coleção de filmes...');
        const moviesRef = collection(db, "movies");
        console.log('Referência da coleção de filmes:', moviesRef.path);
        
        // Verificar se a coleção existe
        const collections = await getDocs(collection(db, '/'));
        console.log('Coleções disponíveis no banco de dados:');
        collections.forEach(doc => {
          console.log('-', doc.id);
        });
        
        const moviesSnapshot = await getDocs(moviesRef);
        console.log(`Encontrados ${moviesSnapshot.size} filmes`);
        
        // Log detalhado dos documentos encontrados
        moviesSnapshot.forEach((doc) => {
          console.log(`Filme ID: ${doc.id}`, doc.data());
        });
        
        const moviesList = [];
        
        moviesSnapshot.forEach((doc) => {
          console.log('Processando filme:', doc.id);
          const data = doc.data();
          console.log('Dados do filme:', data);
          
          moviesList.push({
            id: doc.id,
            collectionType: "movies",
            ...data
          });
        });
        
        console.log('Lista de filmes processada:', moviesList);

        // Carregar séries - Mantendo como está já que não há coleção de séries no banco
        console.log('Buscando coleção de séries...');
        const seriesRef = collection(db, "series");
        console.log('Referência da coleção de séries:', seriesRef);
        
        const seriesSnapshot = await getDocs(seriesRef);
        console.log(`Encontradas ${seriesSnapshot.size} séries`);
        
        const seriesList = [];
        
        seriesSnapshot.forEach((doc) => {
          console.log('Processando série:', doc.id);
          const data = doc.data();
          console.log('Dados da série:', data);
          
          seriesList.push({
            id: doc.id,
            collectionType: "series",
            ...data
          });
        });
        
        console.log('Lista de séries processada:', seriesList);

        // Combinar e ordenar por título
        const allItems = [...moviesList, ...seriesList].sort((a, b) => 
          a.title.localeCompare(b.title)
        );

        setItems(allItems);
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
        setError("Erro ao carregar a lista de itens. Tente novamente mais tarde.");
      } finally {
        setListLoading(false);
      }
    }
    
    loadMovies();
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
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const isMovie = type === "movie";
    if (!title || genres.length === 0 || (isMovie && !videoUrl)) {
      setError(
        isMovie
          ? "Para filmes: título, pelo menos um gênero e link do vídeo são obrigatórios."
          : "Para séries: título e pelo menos um gênero são obrigatórios."
      );
      return;
    }
    setLoading(true);
    try {
      const targetCollection = type === "series" ? "series" : "movies";
      const primaryGenre = genres[0];
      
      const itemData = {
        title,
        description,
        genre: primaryGenre,
        genres,
        type,
        thumbnailUrl,
        videoUrl,
        year: year ? Number(year) : null,
        updatedAt: new Date(),
      };

      console.log('Preparando para salvar:', { targetCollection, editingId, itemData });

      if (editingId) {
        // Atualizar item existente
        console.log(`Atualizando item ${editingId} na coleção ${targetCollection}`);
        await updateDoc(doc(db, targetCollection, editingId), itemData);
        console.log('Item atualizado com sucesso');
        setSuccess("Item atualizado com sucesso!");
      } else {
        // Adicionar novo item
        itemData.createdAt = new Date();
        console.log('Adicionando novo item à coleção', targetCollection);
        const docRef = await addDoc(collection(db, targetCollection), itemData);
        console.log('Novo item adicionado com ID:', docRef.id);
        setSuccess("Item cadastrado com sucesso!");
      }
      
      // Atualizar a lista
      console.log('Atualizando lista de itens...');
      const snap = await getDocs(collection(db, targetCollection));
      console.log(`Encontrados ${snap.size} itens na coleção ${targetCollection}`);
      
      const newItems = snap.docs.map((d) => {
        const data = d.data();
        console.log(`Item ${d.id}:`, data);
        return {
          id: d.id,
          collectionType: targetCollection,
          ...data,
        };
      });
      
      // Atualizar o estado mantendo os itens de outras coleções
      setItems(prev => {
        const otherItems = prev.filter(item => 
          item.collectionType !== targetCollection && item.id !== editingId
        );
        const updatedItems = [...otherItems, ...newItems];
        console.log('Lista de itens atualizada:', updatedItems);
        return updatedItems;
      });
      
      resetForm();
    } catch (e) {
      console.error('Erro ao salvar item:', e);
      setError(`Erro ao ${editingId ? 'atualizar' : 'salvar'}. Tente novamente.`);
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
