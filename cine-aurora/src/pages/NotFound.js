import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#141414',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        backgroundImage: 'radial-gradient(circle at center, #1f1f1f 0%, #141414 100%)'
      }}
    >
      <h1
        style={{
          fontSize: '8rem',
          fontWeight: 'bold',
          margin: 0,
          color: '#e50914',
          textShadow: '0 4px 10px rgba(229, 9, 20, 0.5)'
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '2rem',
          marginBottom: '20px',
          fontWeight: 'normal'
        }}
      >
        Página não encontrada
      </h2>
      <p
        style={{
          fontSize: '1.2rem',
          color: '#999',
          maxWidth: '500px',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}
      >
        Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido
        removida ou o link pode estar incorreto.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 32px',
          fontSize: '1.1rem',
          fontWeight: '600',
          backgroundColor: '#fff',
          color: '#141414',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, background-color 0.2s ease',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}
        onMouseOver={e => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.backgroundColor = '#e6e6e6';
        }}
        onMouseOut={e => {
          e.target.style.transform = 'scale(1)';
          e.target.style.backgroundColor = '#fff';
        }}
      >
        Voltar para o Início
      </button>
    </div>
  );
}
