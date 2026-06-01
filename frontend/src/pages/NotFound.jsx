import { Link } from 'react-router-dom';
import '../styles/NotFound.scss';

export const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <p>Página no encontrada</p>
        <Link to="/" className="btn btn-primary">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};
