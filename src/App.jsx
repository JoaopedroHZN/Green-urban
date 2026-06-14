import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecomendacaoInteligente from './pages/RecomendacaoInteligente';

/**
 * App — Componente raiz
 *
 * Gerencia a navegação por hash (#) para alternar entre as páginas
 * sem a necessidade de um roteador externo.
 */

// Páginas disponíveis
const PAGINAS = {
  home: Home,
  assistente: RecomendacaoInteligente,
};

function App() {
  const [paginaAtual, setPaginaAtual] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (PAGINAS[hash]) {
        setPaginaAtual(hash);
      }
    };

    // Estado inicial
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const PaginaComponent = PAGINAS[paginaAtual] || Home;

  return (
    <>
      <Navbar />
      <PaginaComponent />
    </>
  );
}

export default App;
