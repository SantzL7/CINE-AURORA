import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha o menu mobile ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error(e);
    }
  }

  const handleNavigate = path => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div
        className="navbar__brand"
        onClick={() => handleNavigate('/app')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <img src="/logo192.png" alt="Logo CineAurora" style={{ height: '40px', width: 'auto' }} />
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>CineAurora</span>
      </div>

      {/* Desktop Nav */}
      <nav className="navbar__nav">
        <button
          className={`navbar__link${location.pathname === '/app' && !location.search ? ' navbar__link--active' : ''}`}
          onClick={() => navigate('/app')}
        >
          Home
        </button>
        <button
          className={`navbar__link${location.search === '?type=movie' ? ' navbar__link--active' : ''}`}
          onClick={() => navigate('/app?type=movie')}
        >
          Filmes
        </button>
        <button
          className={`navbar__link${location.search === '?type=series' ? ' navbar__link--active' : ''}`}
          onClick={() => navigate('/app?type=series')}
        >
          Séries
        </button>
        <button
          className={`navbar__link${location.pathname === '/my-list' ? ' navbar__link--active' : ''}`}
          onClick={() => navigate('/my-list')}
        >
          Minha lista
        </button>
      </nav>

      <div className="navbar__right">
        {currentUser?.email === 'matheus0mendes0marinho@gmail.com' && (
          <button className="btn" type="button" onClick={() => navigate('/admin')}>
            Admin
          </button>
        )}
        <button className="navbar__icon" aria-label="Buscar" onClick={() => navigate('/search')}>
          🔍
        </button>
        <button className="btn" onClick={handleLogout}>
          Sair
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className={`navbar__mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`navbar__mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="navbar__mobile-link" onClick={() => handleNavigate('/app')}>
          Home
        </button>
        <button className="navbar__mobile-link" onClick={() => handleNavigate('/app?type=movie')}>
          Filmes
        </button>
        <button className="navbar__mobile-link" onClick={() => handleNavigate('/app?type=series')}>
          Séries
        </button>
        <button className="navbar__mobile-link" onClick={() => handleNavigate('/my-list')}>
          Minha lista
        </button>
        {currentUser?.email === 'matheus0mendes0marinho@gmail.com' && (
          <button className="navbar__mobile-link" onClick={() => handleNavigate('/admin')}>
            Admin
          </button>
        )}
        <button
          className="navbar__mobile-link"
          onClick={() => {
            handleLogout();
            setMobileMenuOpen(false);
          }}
          style={{ color: '#ef4444' }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
