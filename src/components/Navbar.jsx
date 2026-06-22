import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Leaf,
  Home,
  BookOpen,
  Sparkles,
  Calendar,
  Users,
  User,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
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

  // Re-checa sempre que a rota muda
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
    <nav className="navbar bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 shadow-lg shadow-green-900/20">
      <div className="navbar-container flex items-center justify-between w-full">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white font-bold text-xl whitespace-nowrap hover:opacity-90 transition-opacity"
          onClick={closeMenu}
        >
          <img
            src="/Logo2.png"
            alt="Green Urban"
            className="navbar-logo-img"
          />
          Green Urban
        </Link>

        {/* Hamburger */}
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

        {/* Links de navegação */}
        <ul className={`nav-menu flex items-center gap-1 lg:gap-2 ${menuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Home className="w-4 h-4" />
              Início
            </Link>
          </li>

          {/* SE NÃO LOGADO: Login + Cadastre-se */}
          {!isLogged && (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className={`nav-link nav-link-login flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/cadastro"
                  className={`nav-link nav-link-cadastro flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/cadastro') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <UserPlus className="w-4 h-4" />
                  Cadastre-se
                </Link>
              </li>
            </>
          )}

          {/* SE LOGADO: Dicionário, Assistente, Eventos, Rede, Perfil, Saudação, Sair */}
          {isLogged && (
            <>
              <li className="nav-item">
                <Link
                  to="/dicionario"
                  className={`nav-link flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/dicionario') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <BookOpen className="w-4 h-4" />
                  Dicionário
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/assistente"
                  className={`nav-link flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/assistente') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Sparkles className="w-4 h-4" />
                  Assistente
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/eventos"
                  className={`nav-link flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/eventos') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Calendar className="w-4 h-4" />
                  Eventos
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/rede"
                  className={`nav-link flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/rede') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Users className="w-4 h-4" />
                  Rede
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/perfil"
                  className={`nav-link flex items-center gap-1.5 text-sm whitespace-nowrap ${isActive('/perfil') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Link>
              </li>
              <li className="nav-item nav-item-user">
                <span className="nav-user-greeting flex items-center gap-1.5 text-sm whitespace-nowrap">
                  <User className="w-4 h-4" />
                  Olá, <strong>{userName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link nav-link-logout flex items-center gap-1.5 text-sm whitespace-nowrap"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sair
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