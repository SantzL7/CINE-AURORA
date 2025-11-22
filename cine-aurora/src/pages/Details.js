import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const ref = doc(db, "movies", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setMovie({ id: snap.id, ...snap.data() });
        } else {
          navigate("/app", { replace: true });
        }
      } catch (e) {
        console.error(e);
        navigate("/app", { replace: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  useEffect(() => {
    async function checkWatchlist() {
      if (!currentUser || !id) return;
      try {
        setListLoading(true);
        const ref = doc(db, "users", currentUser.uid, "watchlist", id);
        const snap = await getDoc(ref);
        setInList(snap.exists());
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    }
    checkWatchlist();
  }, [currentUser, id]);

  async function toggleWatchlist() {
    if (!currentUser || !movie) return;
    try {
      setListLoading(true);
      const ref = doc(db, "users", currentUser.uid, "watchlist", movie.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        setInList(false);
      } else {
        await setDoc(ref, {
          createdAt: new Date(),
        });
        setInList(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }

  if (loading) return <div className="player__loading">Carregando...</div>;
  if (!movie) return null;

  return (
    <>
      <Navbar />
      <main className="content" style={{ padding: "16px 24px 40px" }}>
        <button className="btn ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          Voltar
        </button>
        <section className="details">
          <div className="details__hero">
            <div className="details__poster">
              {movie.thumbnailUrl && (
                <img src={movie.thumbnailUrl} alt={movie.title} className="details__poster-img" />
              )}
            </div>
            <div className="details__info">
              <h1 className="details__title">{movie.title}</h1>
              <div className="details__meta" style={{ margin: '12px 0', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {movie.year && (
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                  }}>
                    {movie.year}
                  </span>
                )}
                {movie.type && (
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    textTransform: 'capitalize'
                  }}>
                    {movie.type === "series" ? "Série" : "Filme"}
                  </span>
                )}
                {movie.genre && (
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    textTransform: 'capitalize'
                  }}>
                    {movie.genre}
                  </span>
                )}
              </div>
              {movie.description && (
                <p className="details__desc" style={{ 
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  maxWidth: '800px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  {movie.description}
                </p>
              )}
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                marginTop: "24px",
                flexWrap: 'wrap'
              }}>
                <button 
                  className="btn primary" 
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  ▶ Assistir
                </button>
                {currentUser && (
                  <button 
                    className="btn" 
                    type="button" 
                    onClick={toggleWatchlist} 
                    disabled={listLoading}
                    style={{
                      padding: '10px 16px',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {inList ? '✓ Na sua lista' : '+ Minha lista'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
