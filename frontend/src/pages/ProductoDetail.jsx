import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Productos.scss';

export const ProductoDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  
  const [producto, setProducto] = useState(null);
  const [caracteristicas, setCaracteristicas] = useState(null);
  const [resenias, setResenias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [newPuntuacion, setNewPuntuacion] = useState(8);
  const [newComentario, setNewComentario] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryMessage, setInventoryMessage] = useState('');

  // Iconos por tipo de producto para las vistas
  const getProductIcon = (tipo) => {
    switch (tipo) {
      case 'RATON': return '🖱️';
      case 'TECLADO': return '⌨️';
      case 'AURICULAR': return '🎧';
      case 'MONITOR': return '🖥️';
      case 'ALFOMBRILLA': return '🟥';
      default: return '📦';
    }
  };

  // Determinar la clase de color para el badge de puntuación
  const getScoreClass = (score) => {
    if (score >= 9) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 5) return 'average';
    return 'poor';
  };

  const fetchDetailData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Obtener datos básicos del producto
      const prodRes = await api.get(`/productos/${id}`);
      setProducto(prodRes.data);

      // 2. Obtener características detalladas (puede devolver 404 si no existen)
      try {
        const specsRes = await api.get(`/productos/${id}/caracteristicas-detalladas`);
        setCaracteristicas(specsRes.data);
      } catch (specsErr) {
        if (specsErr.response?.status === 404) {
          // El producto no tiene características detalladas creadas todavía, lo cual es válido
          setCaracteristicas(null);
        } else {
          console.error('Error al obtener características detalladas:', specsErr);
        }
      }

      // 3. Obtener reseñas del producto
      try {
        const reviewsRes = await api.get(`/productos/${id}/resenias`);
        if (reviewsRes.data && reviewsRes.data.data) {
          setResenias(reviewsRes.data.data);
        } else {
          setResenias(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        }
      } catch (reviewsErr) {
        console.error('Error al obtener reseñas:', reviewsErr);
      }

    } catch (err) {
      console.error('Error al cargar detalle de producto:', err);
      setError('No se pudo cargar la información del producto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const handleAgregarInventario = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar productos a tu inventario.');
      return;
    }

    if (!producto) {
      return;
    }

    setInventoryLoading(true);
    setInventoryMessage('');

    try {
      await api.post('/inventario', {
        producto_id: producto.id,
        cantidad: 1,
        principal: false,
      });
      setInventoryMessage('Producto agregado a tu inventario.');
    } catch (err) {
      console.error('Error al agregar al inventario:', err);
      const backendMessage = err.response?.data?.message;
      if (backendMessage === 'Este producto ya está en tu inventario.') {
        setInventoryMessage('Este producto ya está en tu inventario.');
      } else {
        setInventoryMessage('No se pudo agregar el producto. Intenta de nuevo.');
      }
    } finally {
      setInventoryLoading(false);
    }
  };

  // Manejar votación de reseña
  const handleVotar = async (reseniaId, voto) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para valorar reseñas.');
      return;
    }

    try {
      const response = await api.post(`/resenias/${reseniaId}/votar`, { voto });
      // Actualizar el estado local de reseñas con la reseña actualizada
      setResenias((prevResenias) =>
        prevResenias.map((r) => (r.id === reseniaId ? response.data : r))
      );
    } catch (err) {
      console.error('Error al votar la reseña:', err);
      alert('Hubo un error al registrar tu voto.');
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      alert('Debes iniciar sesión para escribir una reseña.');
      return;
    }

    if (!producto) {
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);

    try {
      const response = await api.post('/resenias', {
        producto_id: producto.id,
        puntuacion: newPuntuacion,
        comentario: newComentario.trim(),
      });

      setResenias((prevResenias) => [response.data, ...prevResenias]);
      setReviewSuccess('Reseña enviada correctamente.');
      setNewComentario('');
      setNewPuntuacion(8);
    } catch (err) {
      console.error('Error al crear reseña:', err);
      const backendMessage = err.response?.data?.message;
      setReviewError(
        backendMessage === 'Ya has reseñado este producto.'
          ? 'Ya has reseñado este producto.'
          : 'No se pudo enviar la reseña. Intenta de nuevo.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reseniaId) => {
    if (!user) {
      alert('Debes iniciar sesión para eliminar tu reseña.');
      return;
    }

    const confirmDelete = window.confirm('¿Seguro que deseas eliminar tu reseña?');
    if (!confirmDelete) {
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setDeleteLoadingId(reseniaId);

    try {
      await api.delete(`/resenias/${reseniaId}`);
      setResenias((prevResenias) => prevResenias.filter((r) => r.id !== reseniaId));
      setReviewSuccess('Reseña eliminada correctamente.');
    } catch (err) {
      console.error('Error al eliminar reseña:', err);
      setReviewError('No se pudo eliminar la reseña. Intenta de nuevo.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Formatear fecha
  const formatFecha = (dateString) => {
    if (!dateString) return 'Desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="producto-detail-page">
        <div className="loading-container">
          <p>Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="producto-detail-page">
        <Link to="/productos" className="back-link">
          ← Volver a productos
        </Link>
        <div className="alert alert-danger" style={{ marginTop: '2rem', textAlign: 'center' }}>
          {error || 'El producto no existe.'}
        </div>
      </div>
    );
  }

  // Calcular puntuación media de reseñas visibles
  const reviewsCount = resenias.length;
  const avgRating = reviewsCount > 0
    ? (resenias.reduce((acc, r) => acc + r.puntuacion, 0) / reviewsCount).toFixed(1)
    : null;

  // Analizar especificaciones_json si existen
  let especificacionesExtra = {};
  if (caracteristicas && caracteristicas.especificaciones_json) {
    try {
      especificacionesExtra = typeof caracteristicas.especificaciones_json === 'string'
        ? JSON.parse(caracteristicas.especificaciones_json)
        : caracteristicas.especificaciones_json;
    } catch (e) {
      console.error('Error parseando especificaciones_json:', e);
    }
  }

  return (
    <div className="producto-detail-page">
      <Link to="/productos" className="back-link">
        ← Volver al catálogo
      </Link>

      {/* Bloque principal del producto */}
      <section className="detail-header">
        <div className="detail-grid">
          <div className="detail-image-wrapper">
            {producto.foto ? (
              <img 
                src={`http://localhost:8000/storage/${producto.foto}`} 
                alt={`${producto.marca} ${producto.modelo}`} 
                className="detail-image"
              />
            ) : (
              <div className={`detail-image-block ${producto.tipo.toLowerCase()}`}>
                {getProductIcon(producto.tipo)}
              </div>
            )}
          </div>
          
          <div className="detail-info-block">
            <span className="brand">{producto.marca}</span>
            <h1>{producto.modelo}</h1>
            <span className={`category-pill ${producto.tipo.toLowerCase()}`}>
              {producto.tipo}
            </span>
            <p className="description">{producto.descripcion || 'Sin descripción disponible.'}</p>
            
            {producto.fecha_salida && (
              <div className="release-date">
                <span>🗓️</span> Lanzamiento: {formatFecha(producto.fecha_salida)}
              </div>
            )}

            {isAuthenticated && (
              <div className="inventory-action">
                <button
                  className="btn btn-primary"
                  onClick={handleAgregarInventario}
                  disabled={inventoryLoading}
                >
                  {inventoryLoading ? 'Agregando...' : 'Agregar a mi inventario'}
                </button>
                {inventoryMessage && <p className="inventory-message">{inventoryMessage}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Características y resumen de puntuación */}
      <div className="detail-body-grid">
        {/* Especificaciones técnicas */}
        <section className="specs-card">
          <h2>Especificaciones Técnicas</h2>
          {caracteristicas ? (
            <>
              <table className="specs-table">
                <tbody>
                  {caracteristicas.dimensiones && (
                    <tr>
                      <td className="spec-label">Dimensiones</td>
                      <td className="spec-val">{caracteristicas.dimensiones}</td>
                    </tr>
                  )}
                  {caracteristicas.peso && (
                    <tr>
                      <td className="spec-label">Peso</td>
                      <td className="spec-val">{caracteristicas.peso}</td>
                    </tr>
                  )}
                  {caracteristicas.conexion && (
                    <tr>
                      <td className="spec-label">Conexión</td>
                      <td className="spec-val">{caracteristicas.conexion}</td>
                    </tr>
                  )}
                  {caracteristicas.color && (
                    <tr>
                      <td className="spec-label">Color</td>
                      <td className="spec-val">{caracteristicas.color}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {Object.keys(especificacionesExtra).length > 0 && (
                <div className="custom-specs">
                  <h3>Características Adicionales</h3>
                  <div className="custom-specs-grid">
                    {Object.entries(especificacionesExtra).map(([key, val]) => (
                      <div key={key} className="custom-spec-item">
                        <span className="custom-label">{key}</span>
                        <span className="custom-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="no-specs">No se han registrado especificaciones técnicas detalladas para este producto.</p>
          )}
        </section>

        {/* Resumen lateral de puntuación */}
        <section className="side-stats-card">
          <h2>Resumen de Calificación</h2>
          <div className="rating-summary">
            {avgRating ? (
              <>
                <div className="avg-score">{avgRating}</div>
                <div className="out-of">Puntuación Media</div>
                <div className="total-rating-count">
                  Basado en {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
                </div>
              </>
            ) : (
              <>
                <div className="avg-score" style={{ fontSize: '2rem', color: '#9ca3af' }}>--</div>
                <div className="out-of">Sin valoraciones</div>
                <div className="total-rating-count">¡Sé el primero en reseñar!</div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Sección de Reseñas */}
      <section className="reviews-section">
        <h2>💬 Reseñas de Usuarios</h2>

        <div className="review-form">
          <h3>Comparte tu opinión</h3>
          <p>Deja una puntuación y un comentario breve sobre tu experiencia con este producto.</p>

          {reviewError && <div className="form-error">{reviewError}</div>}
          {reviewSuccess && <div className="form-success">{reviewSuccess}</div>}

          <form onSubmit={handleSubmitReview}>
            <div className="field-row">
              <label htmlFor="puntuacion">Puntuación</label>
              <select
                id="puntuacion"
                value={newPuntuacion}
                onChange={(e) => setNewPuntuacion(Number(e.target.value))}
                disabled={reviewLoading}
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} / 10</option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <label htmlFor="comentario">Comentario</label>
              <textarea
                id="comentario"
                rows="5"
                value={newComentario}
                onChange={(e) => setNewComentario(e.target.value)}
                placeholder="Describe qué te ha gustado o qué puede mejorar"
                disabled={reviewLoading}
              />
            </div>

            <button type="submit" className="primary-button" disabled={reviewLoading}>
              {reviewLoading ? 'Enviando reseña...' : 'Publicar reseña'}
            </button>
          </form>

          {!isAuthenticated && (
            <p className="login-note">
              Debes <Link to="/login">iniciar sesión</Link> para publicar una reseña.
            </p>
          )}
        </div>

        {resenias.length === 0 ? (
          <div className="no-reviews">
            <h3>No hay reseñas disponibles</h3>
            <p>Nadie ha dejado comentarios sobre este producto todavía.</p>
          </div>
        ) : (
          <div className="reviews-list">
            {resenias.map((resenia) => (
              <article key={resenia.id} className="review-item">
                <div className="review-header">
                  <div className="user-info">
                    <img 
                      src={resenia.user?.foto ? `http://localhost:8000/storage/${resenia.user.foto}` : '/user.placeholder.png'} 
                      alt={resenia.user?.nombre || 'User'} 
                      className="review-user-avatar"
                    />
                    <div>
                      <span className="username">{resenia.user?.nombre || 'Usuario Anónimo'}</span>
                      <span className="date"> • {formatFecha(resenia.created_at)}</span>
                    </div>
                  </div>
                  <div className={`score-pill ${getScoreClass(resenia.puntuacion)}`}>
                    {resenia.puntuacion} / 10
                  </div>
                </div>
                
                {resenia.comentario && (
                  <p className="comment">{resenia.comentario}</p>
                )}
                
                <div className="review-actions">
                  <span>¿Te ha sido útil esta reseña?</span>
                  <button onClick={() => handleVotar(resenia.id, 'up')}>
                    👍 {resenia.voto_up}
                  </button>
                  <button onClick={() => handleVotar(resenia.id, 'down')}>
                    👎 {resenia.voto_down}
                  </button>
                  {user?.id === resenia.user?.id && (
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteReview(resenia.id)}
                      disabled={deleteLoadingId === resenia.id}
                    >
                      {deleteLoadingId === resenia.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
