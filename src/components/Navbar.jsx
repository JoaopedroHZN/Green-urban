import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🌿</span> Green Urban
        </a>

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
              <a href="#home" className="nav-link" onClick={closeMenu}>
                Início
              </a>
            </li>
            <li className="nav-item">
              <a href="#assistente" className="nav-link" onClick={closeMenu}>
                Assistente 🌱
              </a>
            </li>
            <li className="nav-item">
              <a href="#dicionario" className="nav-link" onClick={closeMenu}>
                Dicionário Verde
              </a>
            </li>
            <li className="nav-item">
              <a href="#eventos" className="nav-link" onClick={closeMenu}>
                Eventos
              </a>
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