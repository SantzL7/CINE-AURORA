import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Navbar from '../components/layout/Navbar';

export default function SeriesEpisodes() {
  const { id } = useParams(); // id da série (series/{id})
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeUrl, setEpisodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        // carregar dados básicos da série
        const seriesDoc = await import('firebase/firestore').then(({ getDoc }) =>
          getDoc(doc(db, 'series', id))
        );
        if (seriesDoc.exists()) {
          setSeries({ id: seriesDoc.id, ...seriesDoc.data() });
        }

        // carregar episódios (coleção simples episodes)
        const epsRef = collection(db, 'series', id, 'episodes');
        const epsSnap = await getDocs(epsRef);
        const allEpisodes = epsSnap.docs.map((e) => ({
          id: e.id,
          ...e.data()
        }));
        allEpisodes.sort((a, b) =>
          a.seasonNumber === b.seasonNumber
            ? (a.episodeNumber || 0) - (b.episodeNumber || 0)
            : a.seasonNumber - b.seasonNumber
        );
        setEpisodes(allEpisodes);
      } catch (e) {
        console.error(e);
      }
    }
    if (id) load();
  }, [id]);

  async function handleAddEpisode(e) {
    e.preventDefault();
    if (!episodeTitle || !episodeUrl) return;
    setLoading(true);
    try {
      const seasonId = String(seasonNumber);
      const episodesRef = collection(db, 'series', id, 'episodes');
      const docRef = await addDoc(episodesRef, {
        episodeNumber: Number(episodeNumber),
        seasonNumber: Number(seasonNumber),
        title: episodeTitle,
        videoUrl: episodeUrl,
        createdAt: new Date()
      });
      setEpisodeTitle('');
      setEpisodeUrl('');
      setEpisodeNumber((prev) => Number(prev) + 1);
      // adiciona episódio recém-criado diretamente ao estado local
      setEpisodes((prev) => {
        const next = [
          ...prev,
          {
            id: docRef.id,
            seasonId,
            seasonNumber: Number(seasonId),
            episodeNumber: Number(episodeNumber),
            title: episodeTitle,
            videoUrl: episodeUrl
          }
        ];
        next.sort((a, b) =>
          a.seasonNumber === b.seasonNumber
            ? (a.episodeNumber || 0) - (b.episodeNumber || 0)
            : a.seasonNumber - b.seasonNumber
        );
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar episódio. Verifique as regras do Firestore.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="content" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="auth-card" style={{ maxWidth: '100%', marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/admin')} style={{ marginBottom: 8 }}>
            Voltar para Admin
          </button>
          <h1 style={{ marginBottom: 4 }}>{series ? series.title : 'Série'} - Episódios</h1>

          <form onSubmit={handleAddEpisode} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div>
              <label>Temporada</label>
              <input
                className="input"
                type="number"
                min={1}
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <label>Número do episódio</label>
              <input
                className="input"
                type="number"
                min={1}
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <label>Título do episódio</label>
              <input
                className="input"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
              />
            </div>
            <div>
              <label>URL do vídeo do episódio</label>
              <input
                className="input"
                value={episodeUrl}
                onChange={(e) => setEpisodeUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar episódio'}
            </button>
          </form>
        </div>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Episódios cadastrados</h2>
          {episodes.length === 0 && <div>Sem episódios ainda.</div>}
          {episodes.length > 0 && (
            <div style={{ display: 'grid', gap: 8 }}>
              {episodes.map((ep) => (
                <div
                  key={`${ep.seasonId}-${ep.id}`}
                  className="auth-card"
                  style={{
                    maxWidth: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      T{ep.seasonNumber || 1}E{ep.episodeNumber || '?'} -{' '}
                      {ep.title || '(sem título)'}
                    </div>
                    <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>{ep.videoUrl}</div>
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
