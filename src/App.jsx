import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecomendacaoInteligente from './pages/RecomendacaoInteligente';
import DicionarioVerde from './pages/DicionarioVerde';

/**
 * App — Componente raiz
 *
 * Gerencia as rotas da aplicação usando react-router-dom.
 * Cada página é mapeada para uma rota específica.
 */
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistente" element={<RecomendacaoInteligente />} />
        <Route path="/dicionario" element={<DicionarioVerde />} />
      </Routes>
    </>
  );
}

export default App;
