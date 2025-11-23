import { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar";
import Row from "../components/Row";

export default function MyList() {
  const { currentUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');

  // Função para depuração: mostra o conteúdo da lista de favoritos
  const debugWatchlist = async () => {
    if (!currentUser) {
      setDebugInfo('Usuário não autenticado');
      return;
    }

    try {
      const watchlistRef = collection(db, 'users', currentUser.uid, 'watchlist');
      const querySnapshot = await getDocs(watchlistRef);
      
      let debugText = `Itens na lista (${querySnapshot.size}):\n\n`;
      
      for (const docSnap of querySnapshot.docs) {
        const item = { id: docSnap.id, ...docSnap.data() };
        debugText += `ID: ${item.id}\n`;
        debugText += `Tipo: ${item.type || 'não especificado'}\n`;
        debugText += `Título: ${item.title || 'não especificado'}\n`;
        debugText += `Adicionado em: ${item.addedAt || 'não especificado'}\n`;
        debugText += '---\n';
      }
      
      setDebugInfo(debugText);
      console.log('Conteúdo da lista de favoritos:', debugText);
    } catch (error) {
      console.error('Erro ao buscar lista de favoritos:', error);
      setDebugInfo(`Erro: ${error.message}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="content">
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <button 
            onClick={debugWatchlist}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Depurar Lista
          </button>
          
          {debugInfo && (
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              whiteSpace: 'pre-line',
              fontFamily: 'monospace',
              color: '#e0e0e0'
            }}>
              <h3>Informações de Depuração:</h3>
              {debugInfo}
            </div>
          )}
          
          <Row title="Minha lista" watchlist />
        </div>
      </main>
    </>
  );
}
