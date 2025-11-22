import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("movie");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMovies() {
      setListLoading(true);
      try {
        const snap = await getDocs(collection(db, "movies"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    }
    loadMovies();
  }, []);

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "movies", id));
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir. Verifique as regras do Firestore.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title || !genre || !videoUrl) {
      setError("Título, gênero e link do vídeo são obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const ref = collection(db, "movies");
      await addDoc(ref, {
        title,
        description,
        genre,
        type, // "movie" ou "series"
        thumbnailUrl,
        videoUrl,
        year: year ? Number(year) : null,
        createdAt: new Date(),
      });
      setSuccess("Cadastro feito com sucesso!");
      setTitle("");
      setDescription("");
      setGenre("");
      setType("movie");
      setThumbnailUrl("");
      setVideoUrl("");
      setYear("");
    } catch (e) {
      console.error(e);
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="content" style={{ maxWidth: 960, margin: "0 auto" }}>
        <div className="auth-card" style={{ maxWidth: "100%", marginTop: 24 }}>
          <h1 style={{ marginBottom: 4 }}>Área do Administrador</h1>
          <p className="muted" style={{ marginBottom: 16 }}>
            Cadastre novos filmes e séries. Eles aparecerão na Home de acordo com o gênero escolhido.
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
              <label>Gênero (mesmo texto usado nas seções da Home)</label>
              <input
                className="input"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Acao, Comedia, Documentario..."
                required
              />
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
                required
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
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
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
                <div
                  key={item.id}
                  className="auth-card"
                  style={{
                    maxWidth: "100%",
                    padding: "8px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.title || "(sem título)"}</div>
                    <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                      {item.type === "series" ? "Série" : "Filme"} • {item.genre || "Sem gênero"}
                    </div>
                  </div>
                  <button className="btn" onClick={() => handleDelete(item.id)}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
