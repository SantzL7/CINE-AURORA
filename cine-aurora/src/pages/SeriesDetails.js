import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import SeriesHero from '../components/features/series/SeriesHero';
import SeasonList from '../components/features/series/SeasonList';

export default function SeriesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadSeries() {
      try {
        // Carrega os dados da série
        const seriesRef = doc(db, 'series', id);
        const seriesSnap = await getDoc(seriesRef);

        if (!seriesSnap.exists()) {
          throw new Error('Série não encontrada');
        }

        const seriesData = { id: seriesSnap.id, ...seriesSnap.data() };
        setSeries(seriesData);

        // Carrega as temporadas
        const seasonsRef = collection(db, `series/${id}/seasons`);
        const seasonsQuery = query(seasonsRef, orderBy('number', 'asc'));
        const seasonsSnap = await getDocs(seasonsQuery);

        const seasonsData = await Promise.all(
          seasonsSnap.docs.map(async (seasonDoc) => {
            const seasonData = { id: seasonDoc.id, ...seasonDoc.data() };

            // Carrega os episódios de cada temporada
            const episodesRef = collection(db, `series/${id}/seasons/${seasonDoc.id}/episodes`);
            const episodesQuery = query(episodesRef, orderBy('number', 'asc'));
            const episodesSnap = await getDocs(episodesQuery);

            const episodes = episodesSnap.docs.map((episodeDoc) => ({
              id: episodeDoc.id,
              ...episodeDoc.data()
            }));

            return {
              ...seasonData,
              episodes
            };
          })
        );

        setSeasons(seasonsData);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar série:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadSeries();
  }, [id]);

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
    if (!currentUser || !series) return;
    try {
      setListLoading(true);
      const ref = doc(db, 'users', currentUser.uid, 'watchlist', series.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        setInList(false);
      } else {
        await setDoc(ref, {
          id: series.id,
          type: 'series',
          title: series.title,
          thumbnailUrl: series.thumbnailUrl,
          addedAt: new Date().toISOString()
        });
        setInList(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#141414',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#141414',
          color: '#e50914',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <p>Erro ao carregar a série: {error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#e50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!series) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#141414',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p>Série não encontrada</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#e50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="content" style={{ padding: '16px 24px 40px' }}>
        <button
          className="btn ghost"
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '16px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #666',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          Voltar
        </button>

        <SeriesHero
          series={series}
          seasons={seasons}
          navigate={navigate}
          currentUser={currentUser}
          toggleWatchlist={toggleWatchlist}
          inList={inList}
          listLoading={listLoading}
        />

        <SeasonList seasons={seasons} seriesId={id} navigate={navigate} />
      </main>
    </>
  );
}
