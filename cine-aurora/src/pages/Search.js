import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Navbar from '../components/layout/Navbar';
import Card from '../components/features/Card';

export default function Search() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    const q = term.trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'movies'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = all.filter(m => (m.title || '').toLowerCase().includes(q));
      setResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="content">
        <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
          <input
            className="input"
            placeholder="Buscar filmes e séries..."
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </form>
        {loading && <div>Carregando...</div>}
        {!loading && results.length === 0 && term && (
          <div className="muted">Nenhum resultado encontrado.</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {results.map(movie => (
            <Card key={movie.id} movie={movie} />
          ))}
        </div>
      </main>
    </>
  );
}
