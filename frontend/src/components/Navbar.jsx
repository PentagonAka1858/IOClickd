import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.scss';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.rol === 'ADMIN';
  const isAdminOrMod = user?.rol === 'ADMIN' || user?.rol === 'MOD';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo-text">PFG</span>
        </Link>

        <div className="navbar-menu">
          <ul className="navbar-nav">
            {!isAdmin && (
              <>
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    Inicio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/productos" className="nav-link">
                    Productos
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && !isAdmin && (
              <>
                <li className="nav-item">
                  <Link to="/inventario" className="nav-link">
                    Mi Inventario
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/listas" className="nav-link">
                    Mis Listas
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/consultas" className="nav-link">
                    Consultas
                  </Link>
                </li>
              </>
            )}

            {isAdminOrMod && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-section">
                <Link to="/perfil" className="user-profile-link">
                  <img 
                    src={user?.foto ? `http://localhost:8000/storage/${user.foto}` : '/user.placeholder.png'} 
                    alt={user?.nombre} 
                    className="user-avatar"
                  />
                  <span className="user-name">{user?.nombre}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
