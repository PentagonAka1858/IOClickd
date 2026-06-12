import { Link } from 'react-router-dom';
import '../styles/NotFound.scss';

export const NotFound = () => {
  return (
    <div className="not-found">
      <span className="error-code">404</span>
      <h2>Página no encontrada</h2>
      <p>La ruta que buscas no existe o fue movida.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary btn-lg">← Volver al Inicio</Link>
        <Link to="/productos" className="btn btn-outline btn-lg">Ver Productos</Link>
      </div>
    </div>
  );
};