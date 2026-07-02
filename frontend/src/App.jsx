import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import FallingLeaves from './components/FallingLeaves/FallingLeaves';
import Home from './pages/Home/Home';
import DicionarioVerde from './pages/DicionarioVerde/DicionarioVerde';
import Eventos from './pages/Eventos/Eventos';
import CriarEvento from './pages/Eventos/CriarEvento';
import GerenciarEvento from './pages/Eventos/GerenciarEvento';
import DetalhesEvento from './pages/Eventos/DetalhesEvento';
import RecomendacaoInteligente from './pages/RecomendacaoInteligente/RecomendacaoInteligente';
import RedeSocial from './pages/RedeSocial/RedeSocial';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil/Perfil';
import { UserProvider } from './contexts/UserContext';

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
    <UserProvider>
      <FallingLeaves quantidade={80} />
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
          path="/eventos/criar"
          element={
            <PrivateRoute>
              <CriarEvento />
            </PrivateRoute>
          }
        />
        <Route
          path="/eventos/gerenciar/:id"
          element={
            <PrivateRoute>
              <GerenciarEvento />
            </PrivateRoute>
          }
        />
        <Route
          path="/eventos/:id"
          element={
            <PrivateRoute>
              <DetalhesEvento />
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

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />

        {/* Rota antiga /auth redireciona para /login */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
      </Routes>
    </UserProvider>
  );
}

export default App;