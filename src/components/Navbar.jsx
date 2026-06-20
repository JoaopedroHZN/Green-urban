import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();

  // Checagem do estado de autenticação
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (token) {
      setIsLogged(true);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.nome || 'Usuário');
        } catch {
          setUserName('Usuário');
        }
      }
    } else {
      setIsLogged(false);
      setUserName('');
    }
  };

  // Checa na montagem e escuta o evento customizado auth-change
  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Re-checa sempre que a rota muda (ex: após login/cadastro)
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🌿</span> Green Urban
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Início
            </Link>
          </li>

          {/* SE NÃO LOGADO: mostra apenas Login e Cadastre-se */}
          {!isLogged && (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className={`nav-link nav-link-login ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  🔑 Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/cadastro"
                  className={`nav-link nav-link-cadastro ${isActive('/cadastro') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  ✨ Cadastre-se
                </Link>
              </li>
            </>
          )}

          {/* SE LOGADO: mostra Dicionário, Eventos, Assistente, Rede Social, Olá + Sair */}
          {isLogged && (
            <>
              <li className="nav-item">
                <Link
                  to="/dicionario"
                  className={`nav-link ${isActive('/dicionario') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  📖 Dicionário
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/assistente"
                  className={`nav-link ${isActive('/assistente') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  🤖 Assistente
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/eventos"
                  className={`nav-link ${isActive('/eventos') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  📅 Eventos
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/rede"
                  className={`nav-link ${isActive('/rede') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  🌐 Rede Social
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/perfil"
                  className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  👤 Meu Perfil
                </Link>
              </li>
              <li className="nav-item nav-item-user">
                <span className="nav-user-greeting">
                  👋 Olá, <strong>{userName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link nav-link-logout"
                  onClick={handleLogout}
                >
                  🚪 Sair
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;