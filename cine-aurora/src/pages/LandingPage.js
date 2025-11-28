import { useNavigate } from 'react-router-dom';
import Row from '../components/features/Row';

// Estilos globais para a página
const styles = {
  hero: {
    padding: '80px 24px 60px',
    background:
      'radial-gradient(circle at 10% 0%, rgba(84, 242, 156, 0.4) 0, transparent 45%), ' +
      'radial-gradient(circle at 90% 10%, rgba(58, 200, 255, 0.4) 0, transparent 50%), ' +
      'linear-gradient(135deg, #020813, #0a1a2e)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center'
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    padding: '0 24px'
  },
  heroContent: {
    maxWidth: 1160,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
    gap: 48,
    alignItems: 'center'
  },
  title: {
    fontSize: '3.5rem',
    margin: '0 0 20px',
    lineHeight: 1.1,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #ffffff, #a5f3fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.2rem',
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0 0 32px',
    maxWidth: 520
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px'
  },
  primaryButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 28px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
  },
  primaryButtonHover: {
    background: '#2563eb',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
  },
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px 28px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  secondaryButtonHover: {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)'
  },
  note: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.6)',
    maxWidth: 520
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '24px'
  },
  movieCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '2/3',
    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  movieCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
  },
  contentSection: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '60px 24px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '16px',
    color: '#ffffff'
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '24px',
    maxWidth: 600
  }
};

export default function LandingPage() {
  const navigate = useNavigate();

  // Efeito hover para os botões
  const handleMouseEnter = (e, style) => {
    Object.assign(e.target.style, style);
  };

  const handleMouseLeave = (e, style) => {
    Object.assign(e.target.style, style);
  };

  return (
    <div className="landing-page" style={{ background: '#020617', minHeight: '100vh' }}>
      {/* Hero Section */}
      <header className="landing-hero" style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <div>
              <h1 style={styles.title}>Filmes, séries e muito mais sob a luz da Aurora</h1>
              <p style={styles.subtitle}>
                Um ambiente de streaming inspirado na aurora boreal para você apresentar e destacar
                o seu catálogo de filmes e séries com uma experiência imersiva.
              </p>
              <div style={styles.buttonGroup}>
                <button
                  style={styles.primaryButton}
                  onMouseEnter={(e) => handleMouseEnter(e, styles.primaryButtonHover)}
                  onMouseLeave={(e) => handleMouseLeave(e, styles.primaryButton)}
                  onClick={() => navigate('/login')}
                >
                  Entrar
                </button>
                <button
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => handleMouseEnter(e, styles.secondaryButtonHover)}
                  onMouseLeave={(e) => handleMouseLeave(e, styles.secondaryButton)}
                  onClick={() => navigate('/login')}
                >
                  Criar conta gratuita
                </button>
              </div>
              <p style={styles.note}>
                Acesse o painel administrador, cadastre títulos e veja tudo como se fosse um serviço
                de streaming profissional.
              </p>
            </div>

            <div style={styles.movieGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={styles.movieCard}
                  onMouseEnter={(e) => handleMouseEnter(e, styles.movieCardHover)}
                  onMouseLeave={(e) => handleMouseLeave(e, styles.movieCard)}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <main style={styles.contentSection}>
        <section>
          <h2 style={styles.sectionTitle}>Em alta no Cine Aurora</h2>
          <p style={styles.sectionSubtitle}>
            Quando estiver logado, você verá aqui os destaques reais do seu catálogo.
          </p>
          <Row title="Ação" genre="Acao" locked />
        </section>
      </main>
    </div>
  );
}
