import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Home.scss';

const FEATURES = [
  { title: 'Gestión de Inventario', desc: 'Organiza y administra tu inventario personal con control total sobre cantidades y estado.' },
  { title: 'Catálogo de Productos', desc: 'Explora un amplio catálogo de periféricos con specs detalladas y comparativas.' },
  { title: 'Listas Personales', desc: 'Crea listas de deseos, de compra o de referencia y compártelas con otros.' },
  { title: 'Reseñas', desc: 'Comparte tu opinión sobre los productos que has usado y lee las de otros.' },
];

const STEPS = [
  { n: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos y verifica tu email para activarla.' },
  { n: '02', title: 'Explora', desc: 'Navega el catálogo de productos, filtra por categoría y lee especificaciones.' },
  { n: '03', title: 'Gestiona', desc: 'Añade productos a tu inventario, crea listas y comparte reseñas.' },
];

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">Base de datos de productos</span>

          {isAuthenticated ? (
            <>
              <h1>
                Hola, <em>{user?.nombre}</em>. Bienvenido de vuelta.
              </h1>
              <p className="hero-desc">Gestiona tu inventario, revisa tu colección o descubre productos nuevos.</p>
              <div className="quick-links">
                {user?.rol === 'ADMIN' ? (
                  <Link to="/admin" className="btn btn-primary btn-lg">Panel Admin</Link>
                ) : (
                  <>
                    <Link to="/productos" className="btn btn-primary btn-lg">Ver Productos</Link>
                    <Link to="/inventario" className="btn btn-outline btn-lg">Mi Inventario</Link>
                    <Link to="/listas" className="btn btn-outline btn-lg">Mis Listas</Link>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h1>Tu base de datos de <em>periféricos</em> personales.</h1>
              <p className="hero-desc">
                Gestiona inventario, compara specs, guarda listas y comparte reseñas — todo en un solo lugar.
              </p>
              <div className="cta">
                <Link to="/register" className="btn btn-inverse btn-lg">Crear cuenta gratis</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Iniciar sesión</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      {!isAuthenticated && (
        <section className="how-it-works">
          <h2 className="section-title">
            ¿Cómo funciona? <span>Simple.</span>
          </h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <span className="step-number">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="features">
        <h2>Características</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};