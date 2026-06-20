import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import DicionarioVerde from './pages/DicionarioVerde/DicionarioVerde';
import Eventos from './pages/Eventos/Eventos';
import RecomendacaoInteligente from './pages/RecomendacaoInteligente/RecomendacaoInteligente';
import RedeSocial from './pages/RedeSocial/RedeSocial';
import Auth from './pages/Auth/Auth';

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