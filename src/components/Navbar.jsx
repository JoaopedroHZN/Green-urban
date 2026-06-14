import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

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
          <li className="nav-item">
            <Link
              to="/dicionario"
              className={`nav-link ${isActive('/dicionario') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Dicionário Verde
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/assistente"
              className={`nav-link ${isActive('/assistente') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Assistente
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/eventos"
              className={`nav-link ${isActive('/eventos') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Eventos
            </Link>
          </li>
          <li className="nav-item">
            <a href="#rede" className="nav-link" onClick={closeMenu}>
              Rede Social
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
