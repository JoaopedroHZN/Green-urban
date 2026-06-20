import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import DicionarioVerde from './pages/DicionarioVerde/DicionarioVerde';
import Eventos from './pages/Eventos/Eventos';
import RecomendacaoInteligente from './pages/RecomendacaoInteligente/RecomendacaoInteligente';
import RedeSocial from './pages/RedeSocial/RedeSocial';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

// Componente de proteção de rota — trava rígida por localStorage
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas — exigem autenticação */}
        <Route
          path="/dicionario"
          element={
            <PrivateRoute>
              <DicionarioVerde />
            </PrivateRoute>
          }
        />
        <Route
          path="/eventos"
          element={
            <PrivateRoute>
              <Eventos />
            </PrivateRoute>
          }
        />
        <Route
          path="/assistente"
          element={
            <PrivateRoute>
              <RecomendacaoInteligente />
            </PrivateRoute>
          }
        />
        <Route
          path="/rede"
          element={
            <PrivateRoute>
              <RedeSocial />
            </PrivateRoute>
          }
        />

        {/* Rota antiga /auth redireciona para /login */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;