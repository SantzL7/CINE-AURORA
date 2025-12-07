import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

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
        const ref = doc(db, 'movies', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setMovie({ id: snap.id, ...snap.data() });
        } else {
          navigate('/app', { replace: true });
        }
      } catch (e) {
        console.error(e);
        navigate('/app', { replace: true });
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
        const ref = doc(db, 'users', currentUser.uid, 'watchlist', id);
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
      const ref = doc(db, 'users', currentUser.uid, 'watchlist', movie.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        setInList(false);
      } else {
        await setDoc(ref, {
          createdAt: new Date()
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
      <main className="content" style={{ padding: '16px 24px 40px' }}>
        <button className="btn ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          Voltar
        </button>
        <section
          className="details"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px'
          }}
        >
          <div
            className="details__hero"
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'flex-start',
              maxWidth: '100%',
              marginTop: '20px'
            }}
          >
            <div
              className="details__poster"
              style={{
                flex: '0 0 300px',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              {movie.thumbnailUrl && (
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              )}
            </div>
            <div
              className="details__info"
              style={{
                flex: '1',
                maxWidth: '800px'
              }}
            >
              <h1
                className="details__title"
                style={{
                  fontSize: '2.5rem',
                  margin: '0 0 16px 0',
                  fontWeight: '700',
                  color: '#fff'
                }}
              >
                {movie.title}
              </h1>
              <div
                className="details__meta"
                style={{
                  margin: '20px 0',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                {movie.year && (
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '1rem',
                      color: '#fff',
                      fontWeight: '500'
                    }}
                  >
                    {movie.year}
                  </span>
                )}
                {movie.type && (
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '1rem',
                      color: '#fff',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}
                  >
                    {movie.type === 'series' ? 'Série' : 'Filme'}
                  </span>
                )}
                {movie.genres &&
                  movie.genres.length > 0 &&
                  movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        color: '#fff',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}
                    >
                      {genre.trim()}
                    </span>
                  ))}
              </div>
              {movie.description && (
                <p
                  className="details__desc"
                  style={{
                    lineHeight: '1.8',
                    margin: '24px 0 32px',
                    fontSize: '1.1rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    maxWidth: '100%'
                  }}
                >
                  {movie.description}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '32px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <button
                  className="btn primary"
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  style={{
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    minWidth: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
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
                      padding: '12px 24px',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '180px',
                      justifyContent: 'center'
                    }}
                    onMouseOver={e => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseOut={e => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
