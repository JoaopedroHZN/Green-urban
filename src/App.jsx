import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DicionarioVerde from './pages/DicionarioVerde';
import Eventos from './pages/Eventos';
import RecomendacaoInteligente from './pages/RecomendacaoInteligente';
import RedeSocial from './pages/RedeSocial';
import Auth from './pages/Auth';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dicionario" element={<DicionarioVerde />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/assistente" element={<RecomendacaoInteligente />} />
        <Route path="/rede" element={<RedeSocial />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  );
}

export default App;