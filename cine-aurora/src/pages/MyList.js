import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Row from '../components/features/Row';

export default function MyList() {
  useAuth(); // Keep the hook call to maintain any potential side effects

  return (
    <>
      <Navbar />
      <main className="content">
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Row title="Minha lista" watchlist type={null} />
        </div>
      </main>
    </>
  );
}
