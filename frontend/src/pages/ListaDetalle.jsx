import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/ListaDetalle.scss';

export const ListaDetalle = () => {
  const { id } = useParams();
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
        <Link to="/listas" className="back-link">
          ← Volver a mis listas
        </Link>
        <div className="alert alert-danger" style={{ marginTop: '2rem' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="lista-detalle-page">
      <Link to="/listas" className="back-link">
        ← Volver a mis listas
      </Link>

      <header className="lista-header">
        <div>
          <h1>{lista.nombre_lista}</h1>
          <p>{lista.descripcion || 'Sin descripción'}</p>
          <div className="meta-row">
            <span className={`status-pill ${lista.publica ? 'publica' : 'privada'}`}>
              {lista.publica ? 'Pública' : 'Privada'}
            </span>
            <span>{lista.productos?.length ?? 0} productos</span>
          </div>
        </div>
      </header>

      <section className="lista-productos-section">
        {lista.productos?.length > 0 ? (
          <div className="productos-grid">
            {lista.productos.map((producto) => (
              <article key={producto.id} className="producto-card">
                <div className="card-content">
                  <div className="product-head">
                    <h2>{producto.modelo}</h2>
                    <span className="product-type">{producto.tipo}</span>
                  </div>
                  <p className="product-brand">{producto.marca}</p>
                  <p className="product-description">
                    {producto.descripcion || 'Sin descripción disponible.'}
                  </p>
                  <Link to={`/productos/${producto.id}`} className="btn btn-outline btn-sm">
                    Ver producto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Esta lista está vacía</h3>
            <p>Añade productos desde el catálogo para empezar a organizar tus listas.</p>
          </div>
        )}
      </section>
    </div>
  );
};
