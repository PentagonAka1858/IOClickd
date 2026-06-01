import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Home.scss';

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      <div className="hero">
        <h1>Bienvenido a PFG</h1>
        <p>Gestiona tu inventario personal y descubre productos</p>

        {isAuthenticated ? (
          <div className="welcome-message">
            <h2>Hola, {user?.nombre}! 👋</h2>
            <div className="quick-links">
              <Link to="/productos" className="btn btn-primary">
                Ver Productos
              </Link>
              <Link to="/inventario" className="btn btn-outline">
                Mi Inventario
              </Link>
              <Link to="/listas" className="btn btn-outline">
                Mis Listas
              </Link>
            </div>
          </div>
        ) : (
          <div className="cta">
            <p>Inicia sesión para acceder a todas las funciones</p>
            <Link to="/login" className="btn btn-primary">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn btn-outline">
              Crear Cuenta
            </Link>
          </div>
        )}
      </div>

      <section className="features">
        <h2>Características</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📦 Gestión de Inventario</h3>
            <p>Organiza y administra tu inventario personal</p>
          </div>
          <div className="feature-card">
            <h3>🛍️ Catálogo de Productos</h3>
            <p>Explora un amplio catálogo de productos</p>
          </div>
          <div className="feature-card">
            <h3>❤️ Favoritos</h3>
            <p>Guarda tus productos favoritos</p>
          </div>
          <div className="feature-card">
            <h3>📝 Reseñas</h3>
            <p>Comparte tus opiniones sobre productos</p>
          </div>
        </div>
      </section>
    </div>
  );
};
