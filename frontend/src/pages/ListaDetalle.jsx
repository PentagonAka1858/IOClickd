import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ListaDetalle.scss';

export const ListaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lista, setLista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLista = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/listas/${id}`);
      setLista(response.data);
    } catch (err) {
      console.error('Error al cargar la lista:', err);
      if (err.response?.status === 403) {
        setError('No tienes permiso para ver esta lista.');
      } else if (err.response?.status === 404) {
        setError('La lista no existe.');
      } else {
        setError('No se pudo cargar la lista. Intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLista();
  }, [id]);

  if (loading) {
    return (
      <div className="lista-detalle-page">
        <div className="loading-container">
          <p>Cargando lista...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-detalle-page">
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
        <div className="alert alert-danger" style={{ marginTop: '2rem' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="lista-detalle-page">
      <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás" style={{ marginBottom: '1.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      <header className="lista-header">
        <div>
          <h1>{lista.nombre_lista}</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{lista.descripcion || 'Sin descripción'}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`badge ${lista.publica ? 'badge-success' : 'badge-muted'}`}>
              {lista.publica ? '🌐 Pública' : '🔒 Privada'}
            </span>
            <span className="badge badge-primary">{lista.productos?.length ?? 0} productos</span>
          </div>
        </div>
      </header>

      {lista.productos?.length > 0 ? (
        <div className="lista-items">
          {lista.productos.map((producto) => (
            <div key={producto.id} className="lista-item-row">
              {producto.foto ? (
                <img src={`http://localhost:8000/storage/${producto.foto}`} alt={producto.modelo} />
              ) : (
                <div style={{ width: 80, height: 80, background: 'var(--color-surface-alt)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  📦
                </div>
              )}
              <div>
                <p className="item-name">{producto.modelo}</p>
                <p className="item-note">{producto.marca} — {producto.tipo}</p>
                <p className="item-note" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  {producto.descripcion || 'Sin descripción.'}
                </p>
              </div>
              <Link to={`/productos/${producto.id}`} className="btn btn-sm btn-primary">Ver</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>Lista vacía</h3>
          <p>Añade productos desde el catálogo para empezar a organizar tus listas.</p>
          <Link to="/productos" className="btn btn-primary">Ver Catálogo</Link>
        </div>
      )}
    </div>
  );
};