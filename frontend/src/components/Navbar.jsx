import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ioclickdLogo from '../assets/ioclickd.svg';
import '../styles/Navbar.scss';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Leer el tema inicial desde el atributo data-theme del html
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  // Sincronizar cuando el atributo cambie externamente
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar dropdown y menú al cambiar de ruta
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (_) { }
  };

  // Restaurar tema guardado al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved && saved !== theme) {
        document.documentElement.setAttribute('data-theme', saved);
        setTheme(saved);
      }
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = user?.rol === 'ADMIN';
  const isAdminOrMod = user?.rol === 'ADMIN' || user?.rol === 'MOD';
  const isActive = (path) => location.pathname === path;

  // ¿Alguna de las rutas del dropdown está activa?
  const isDropdownActive =
    isActive('/perfil') ||
    (!isAdmin && isActive('/inventario')) ||
    (!isAdmin && isActive('/listas')) ||
    (!isAdmin && location.pathname.startsWith('/consultas'));

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* ── BRAND / LOGO ─────────────────────────────────── */}
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <img
            src={ioclickdLogo}
            alt="I/OClickd logo"
            className="logo-img"
          />
          <span className="logo-text">
            <span className="logo-io">I/O</span>
            <span className="logo-name">Clickd</span>
            <span className="logo-bang">!</span>
          </span>
        </Link>

        {/* ── NAVIGATION (centro) + RIGHT SIDE en hamburguesa ── */}
        <div className={`navbar-menu${menuOpen ? ' is-open' : ''}`}>
          <ul className="navbar-nav">
            {!isAdmin && (
              <>
                <li className="nav-item">
                  <Link
                    to="/"
                    className={`nav-link${isActive('/') ? ' active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/productos"
                    className={`nav-link${isActive('/productos') ? ' active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Productos
                  </Link>
                </li>
              </>
            )}

            {isAdminOrMod && (
              <li className="nav-item">
                <Link
                  to="/admin"
                  className={`nav-link${isActive('/admin') ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* ── RIGHT SIDE: TEMA + AUTH ── */}
          <div className="navbar-right">

            {/* Botón búsqueda de perfiles (solo autenticados no admin) */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/perfiles"
                className={`btn-icon-nav${isActive('/perfiles') ? ' active' : ''}`}
                title="Buscar perfiles"
                aria-label="Buscar perfiles públicos"
                onClick={() => setMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </Link>
            )}

            {/* Botón cambio de tema */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              <span className="theme-toggle__icon" aria-hidden="true">
                {theme === 'light' ? '◐' : '◑'}
              </span>
              <span className="theme-toggle__label">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Auth */}
            <div className="navbar-auth">
              {isAuthenticated ? (
                <>
                  {/* ── DROPDOWN Mi Perfil ── */}
                  <div
                    className={`user-dropdown${dropdownOpen ? ' is-open' : ''}${isDropdownActive ? ' route-active' : ''}`}
                    ref={dropdownRef}
                  >
                    {/* Trigger */}
                    <button
                      className="user-dropdown__trigger"
                      onClick={() => setDropdownOpen((p) => !p)}
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                      aria-label="Menú de perfil"
                    >
                      <img
                        src={user?.foto ? `http://localhost:8000/storage/${user.foto}` : '/user.placeholder.png'}
                        alt={user?.nombre}
                        className="user-avatar"
                      />
                      <span className="user-name">{user?.nombre}</span>
                      <span className="user-dropdown__chevron" aria-hidden="true">▾</span>
                    </button>

                    {/* Panel desplegable */}
                    <div className="user-dropdown__panel" role="menu">
                      {/* Cabecera */}
                      <div className="user-dropdown__header">
                        <img
                          src={user?.foto ? `http://localhost:8000/storage/${user.foto}` : '/user.placeholder.png'}
                          alt={user?.nombre}
                          className="user-dropdown__avatar-lg"
                        />
                        <div>
                          <button
                            className="user-dropdown__display-name user-dropdown__display-name--link"
                            onClick={() => { setDropdownOpen(false); navigate(`/perfiles/${user?.id}`); }}
                            title="Ver mi perfil público"
                          >
                            {user?.nombre}
                          </button>
                          {user?.username && (
                            <p className="user-dropdown__username">@{user.username}</p>
                          )}
                        </div>
                      </div>

                      <div className="user-dropdown__divider" />

                      {/* Links de navegación */}
                      <nav className="user-dropdown__nav" aria-label="Menú de perfil">
                        <Link
                          to="/perfil"
                          className={`user-dropdown__item${isActive('/perfil') ? ' active' : ''}`}
                          role="menuitem"
                        >
                          <span className="user-dropdown__item-icon" aria-hidden="true">✎</span>
                          Editar perfil
                        </Link>
                        {!isAdmin && (
                          <Link
                            to="/inventario"
                            className={`user-dropdown__item${isActive('/inventario') ? ' active' : ''}`}
                            role="menuitem"
                          >
                            <span className="user-dropdown__item-icon" aria-hidden="true">▤</span>
                            Inventario
                          </Link>
                        )}
                        {!isAdmin && (
                          <Link
                            to="/listas"
                            className={`user-dropdown__item${isActive('/listas') ? ' active' : ''}`}
                            role="menuitem"
                          >
                            <span className="user-dropdown__item-icon" aria-hidden="true">☰</span>
                            Mis Listas
                          </Link>
                        )}
                        {!isAdmin && (
                          <Link
                            to="/consultas"
                            className={`user-dropdown__item${location.pathname.startsWith('/consultas') ? ' active' : ''}`}
                            role="menuitem"
                          >
                            <span className="user-dropdown__item-icon" aria-hidden="true">✉</span>
                            Consultas
                          </Link>
                        )}
                      </nav>

                      <div className="user-dropdown__divider" />

                      {/* Salir */}
                      <button
                        onClick={handleLogout}
                        className="user-dropdown__logout"
                        role="menuitem"
                      >
                        <span className="user-dropdown__item-icon" aria-hidden="true">⏻</span>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link
                    to="/login"
                    className="btn btn-sm btn-outline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-sm btn-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Registro
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── HAMBURGER (mobile) ───────────────────────────── */}
        <button
          className={`navbar-toggle${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

      </div>
    </nav>
  );
};