import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================
//  UserContext — Green Urban
//  Gerencia o estado do usuário ativo.
//  Obtém o ID do localStorage (salvo após login/cadastro) e
//  busca os dados completos do MongoDB via API.
// ============================================================

const UserContext = createContext(null);

const API_BASE = 'http://localhost:4000';

function obterUserIdDoLocalStorage() {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user.id) return user.id;
    }
  } catch {
    /* ignora */
  }
  return null;
}

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [userId, setUserId] = useState(obterUserIdDoLocalStorage);

  const carregarPerfil = useCallback(async (id) => {
    if (!id) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/perfil/${id}`);
      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        throw new Error(data.erro || 'Perfil não encontrado');
      }

      setUsuario(data.usuario);
    } catch (err) {
      console.warn('⚠️ Erro ao buscar perfil:', err.message);
      setErro(err.message);
      // Fallback com dados do localStorage
      const localUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('auth_user'));
        } catch {
          return null;
        }
      })();
      setUsuario({
        _id: id,
        nome: localUser?.nome || 'Voluntário(a)',
        xp: localUser?.xp ?? 0,
        pontuacaoTotal: localUser?.pontuacaoTotal ?? 0,
        listaConquistas: localUser?.listaConquistas || [],
        role: 'user',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Escuta mudanças de autenticação
  useEffect(() => {
    const handleAuthChange = () => {
      const novoId = obterUserIdDoLocalStorage();
      setUserId(novoId);
      carregarPerfil(novoId);
    };

    window.addEventListener('auth-change', handleAuthChange);

    // Carrega na montagem
    const idInicial = obterUserIdDoLocalStorage();
    if (idInicial) {
      carregarPerfil(idInicial);
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [carregarPerfil]);

  const valor = {
    usuario,
    loading,
    erro,
    userId: usuario?._id || userId || null,
    recarregar: () => {
      const id = userId || obterUserIdDoLocalStorage();
      if (id) carregarPerfil(id);
    },
  };

  return <UserContext.Provider value={valor}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser deve ser usado dentro de UserProvider');
  return ctx;
}

export default UserContext;