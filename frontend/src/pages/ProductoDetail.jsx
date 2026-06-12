import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Productos.scss';
const getProductIcon = (tipo, size = 24) => {
  switch(tipo) {
    case 'RATON': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 2v6"/></svg>;
    case 'TECLADO': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/></svg>;
    case 'AURICULAR': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>;
    case 'MONITOR': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'ALFOMBRILLA': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/></svg>;
    default: return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  }
};

const getScoreBadge = (score) => {
  if (score >= 9) return 'badge-success';
  if (score >= 7) return 'badge-accent';
  if (score >= 5) return 'badge-warning';
  return 'badge-danger';
};

export const ProductoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // Pagination for reviews
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsLastPage, setReviewsLastPage] = useState(1);

  // Mis Listas
  const [misListas, setMisListas] = useState([]);
  const [showListasModal, setShowListasModal] = useState(false);
  const [listasLoading, setListasLoading] = useState(false);
  const [listasMessage, setListasMessage] = useState('');

  // Características Reales
  const [realData, setRealData] = useState([]);
  const [showRealDataForm, setShowRealDataForm] = useState(false);
  const [realDataForm, setRealDataForm] = useState({ peso: '', latencia: '', autonomia: '' });
  const [additionalFields, setAdditionalFields] = useState([{ attr: '', val: '' }]);
  const [realDataLoading, setRealDataLoading] = useState(false);
  const [realDataMessage, setRealDataMessage] = useState('');

  const fetchDetailData = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const prodRes = await api.get(`/productos/${id}`);
      setProducto(prodRes.data);

      try {
        const specsRes = await api.get(`/productos/${id}/caracteristicas-detalladas`);
        setCaracteristicas(specsRes.data);
      } catch (specsErr) {
        if (specsErr.response?.status !== 404) {
          console.error('Error al obtener características:', specsErr);
        }
      }

      try {
        const realDataRes = await api.get(`/productos/${id}/caracteristicas-reales`);
        setRealData(realDataRes.data?.data || []);
      } catch (err) {
        console.error('Error al obtener datos reales:', err);
      }

      fetchReviews(page);
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError('No se pudo cargar la información del producto.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      const reviewsRes = await api.get(`/productos/${id}/resenias?page=${page}`);
      setResenias(reviewsRes.data?.data || []);
      setReviewsCurrentPage(reviewsRes.data?.current_page || 1);
      setReviewsLastPage(reviewsRes.data?.last_page || 1);
    } catch (reviewsErr) {
      console.error('Error al obtener reseñas:', reviewsErr);
    }
  };

  useEffect(() => { fetchDetailData(1); }, [id]);

  const handleAgregarInventario = async () => {
    if (!isAuthenticated) { alert('Debes iniciar sesión para agregar al inventario.'); return; }
    setInventoryLoading(true);
    setInventoryMessage('');
    try {
      await api.post('/inventario', { producto_id: producto.id, cantidad: 1, principal: false });
      setInventoryMessage('✓ Producto agregado a tu inventario.');
    } catch (err) {
      const msg = err.response?.data?.message;
      setInventoryMessage(
        msg === 'Este producto ya está en tu inventario.'
          ? 'Ya tienes este producto en tu inventario.'
          : 'No se pudo agregar. Intenta de nuevo.'
      );
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleOpenListas = async () => {
    if (!isAuthenticated) { alert('Debes iniciar sesión para añadir a tus listas.'); return; }
    setShowListasModal(true);
    setListasLoading(true);
    setListasMessage('');
    try {
      const res = await api.get('/listas');
      setMisListas(res.data);
    } catch (err) {
      setListasMessage('Error al cargar tus listas.');
    } finally {
      setListasLoading(false);
    }
  };

  const handleAddToLista = async (listaId) => {
    setListasLoading(true);
    setListasMessage('');
    try {
      await api.post(`/listas/${listaId}/productos`, { producto_id: producto.id });
      setListasMessage('✓ Producto añadido a la lista.');
    } catch (err) {
      setListasMessage(err.response?.data?.message || 'Error al añadir el producto.');
    } finally {
      setListasLoading(false);
    }
  };

  const handleDeleteMyRealData = async () => {
    if (!window.confirm('¿Eliminar tus datos aportados?')) return;
    setRealDataLoading(true);
    setRealDataMessage('');
    try {
      const myData = realData.filter(d => d.user_id === user?.id);
      for (const d of myData) {
        await api.delete(`/caracteristicas-reales/${d.id}`);
      }
      setRealDataMessage('✓ Datos eliminados correctamente.');
      const realDataRes = await api.get(`/productos/${id}/caracteristicas-reales`);
      setRealData(realDataRes.data?.data || []);
      setShowRealDataForm(false);
    } catch (err) {
      setRealDataMessage('Error al eliminar tus datos.');
    } finally {
      setRealDataLoading(false);
    }
  };

  const handleSubmitRealData = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { alert('Debes iniciar sesión para aportar datos.'); return; }
    
    setRealDataLoading(true);
    setRealDataMessage('');
    
    const fieldsToSubmit = [];
    if (realDataForm.peso) {
      const v = realDataForm.peso.toLowerCase().includes('g') ? realDataForm.peso : `${realDataForm.peso}g`;
      fieldsToSubmit.push({ atributo: 'peso', valor: v });
    }
    if (realDataForm.latencia) {
      const v = realDataForm.latencia.toLowerCase().includes('ms') ? realDataForm.latencia : `${realDataForm.latencia}ms`;
      fieldsToSubmit.push({ atributo: 'latencia', valor: v });
    }
    if (realDataForm.autonomia) {
      const v = realDataForm.autonomia.toLowerCase().includes('h') ? realDataForm.autonomia : `${realDataForm.autonomia}h`;
      fieldsToSubmit.push({ atributo: 'autonomia', valor: v });
    }
    
    additionalFields.forEach(field => {
      if (field.attr && field.val) {
        fieldsToSubmit.push({ atributo: field.attr, valor: field.val });
      }
    });

    if (fieldsToSubmit.length === 0) {
      setRealDataMessage('Por favor completa al menos un campo.');
      setRealDataLoading(false);
      return;
    }

    try {
      for (const field of fieldsToSubmit) {
        await api.post('/caracteristicas-reales', {
          producto_id: producto.id,
          atributo: field.atributo,
          valor: field.valor
        });
      }
      setRealDataMessage('✓ Datos aportados correctamente.');
      setRealDataForm({ peso: '', latencia: '', autonomia: '' });
      setAdditionalFields([{ attr: '', val: '' }]);
      const realDataRes = await api.get(`/productos/${id}/caracteristicas-reales`);
      setRealData(realDataRes.data?.data || []);
      setShowRealDataForm(false);
    } catch (err) {
      setRealDataMessage('Error al enviar los datos.');
    } finally {
      setRealDataLoading(false);
    }
  };

  const handleVotar = async (reseniaId, voto) => {
    if (!isAuthenticated) { alert('Debes iniciar sesión para valorar reseñas.'); return; }
    try {
      const response = await api.post(`/resenias/${reseniaId}/votar`, { voto });
      setResenias((prev) => prev.map((r) => (r.id === reseniaId ? response.data : r)));
    } catch (err) {
      console.error('Error al votar:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { alert('Debes iniciar sesión para escribir una reseña.'); return; }
    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);
    try {
      const response = await api.post('/resenias', {
        producto_id: producto.id,
        puntuacion: newPuntuacion,
        comentario: newComentario.trim(),
      });
      setResenias((prev) => [response.data, ...prev]);
      setReviewSuccess('Reseña publicada correctamente.');
      setNewComentario('');
      setNewPuntuacion(8);
    } catch (err) {
      const msg = err.response?.data?.message;
      setReviewError(
        msg === 'Ya has reseñado este producto.'
          ? 'Ya has reseñado este producto anteriormente.'
          : 'No se pudo enviar la reseña. Intenta de nuevo.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reseniaId) => {
    if (!window.confirm('¿Eliminar tu reseña?')) return;
    setDeleteLoadingId(reseniaId);
    try {
      await api.delete(`/resenias/${reseniaId}`);
      setResenias((prev) => prev.filter((r) => r.id !== reseniaId));
      setReviewSuccess('Reseña eliminada.');
    } catch (err) {
      setReviewError('No se pudo eliminar la reseña.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const formatFecha = (dateString) => {
    if (!dateString) return 'Desconocida';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="producto-detail">
        <div className="loading-container">
          <div className="spinner" />
          <span>Cargando producto…</span>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !producto) {
    return (
      <div className="producto-detail">
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
        <div className="alert alert-danger mt-lg">{error || 'El producto no existe.'}</div>
      </div>
    );
  }

  // ── Derived data ──
  const reviewsCount = resenias.length;
  const avgRating = reviewsCount > 0
    ? (resenias.reduce((acc, r) => acc + r.puntuacion, 0) / reviewsCount).toFixed(1)
    : null;

  let especificacionesExtra = {};
  if (caracteristicas?.especificaciones_json) {
    try {
      especificacionesExtra = typeof caracteristicas.especificaciones_json === 'string'
        ? JSON.parse(caracteristicas.especificaciones_json)
        : caracteristicas.especificaciones_json;
    } catch { /* noop */ }
  }

  const specsBase = caracteristicas
    ? [
        { label: 'Dimensiones', value: caracteristicas.dimensiones },
        { label: 'Peso',        value: caracteristicas.peso },
        { label: 'Conexión',    value: caracteristicas.conexion },
        { label: 'Color',       value: caracteristicas.color },
        { label: 'Sensor',      value: caracteristicas.sensor },
        { label: 'DPI',         value: caracteristicas.dpi },
      ].filter((s) => s.value)
    : [];

  // Calculate real data averages
  const calculateAverages = () => {
    const grouped = {};
    realData.forEach(item => {
      const attr = item.atributo.toLowerCase();
      // Try to parse number from value
      const match = item.valor.match(/[\d.]+/);
      if (match) {
        const val = parseFloat(match[0]);
        if (!grouped[attr]) grouped[attr] = { sum: 0, count: 0, unit: item.valor.replace(/[\d.]+/g, '').trim() };
        grouped[attr].sum += val;
        grouped[attr].count += 1;
      }
    });

    return Object.entries(grouped).map(([attr, data]) => ({
      label: attr.charAt(0).toUpperCase() + attr.slice(1),
      value: (data.sum / data.count).toFixed(2) + (data.unit ? ` ${data.unit}` : '')
    }));
  };
  const realDataAverages = calculateAverages();
  const hasSubmittedRealData = isAuthenticated && realData.some(d => d.user_id === user?.id);

  // ── Main render ──
  return (
    <div className="producto-detail">
      <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás" style={{ marginBottom: '1.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      {/* ── Hero grid: imagen + info ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="detail-grid">

          {/* Imagen */}
          <div className="detail-image-wrap">
            {producto.foto ? (
              <img
                src={`http://localhost:8000/storage/${producto.foto}`}
                alt={`${producto.marca} ${producto.modelo}`}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', minHeight: 280,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '5rem', background: 'var(--color-surface-alt)',
              }}>
                {getProductIcon(producto.tipo, 120)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <span className="detail-category">{producto.tipo}</span>
            <h1 className="detail-title">{producto.modelo}</h1>
            <span className="detail-brand">{producto.marca}</span>

            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className={`badge ${getScoreBadge(parseFloat(avgRating))}`} style={{ fontSize: '1rem', padding: '4px 10px' }}>
                  {avgRating} / 10
                </span>
                <span className="text-muted text-sm">
                  {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
            )}

            {producto.descripcion && (
              <p className="detail-desc">{producto.descripcion}</p>
            )}

            {producto.fecha_salida && (
              <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                Lanzamiento: {formatFecha(producto.fecha_salida)}
              </p>
            )}

            <div className="detail-actions">
              {isAuthenticated ? (
                <>
                  <button
                    className={`btn btn-primary btn-lg${inventoryLoading ? ' btn-loading' : ''}`}
                    onClick={handleAgregarInventario}
                    disabled={inventoryLoading}
                  >
                    {inventoryLoading ? 'Agregando…' : '+ Añadir a inventario'}
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={handleOpenListas}
                  >
                    + Añadir a lista personal
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg">
                  Inicia sesión para añadir
                </Link>
              )}
              <Link to="/productos" className="btn btn-outline btn-lg">
                Ver catálogo
              </Link>
            </div>

            {/* Listas Modal / Dropdown */}
            {showListasModal && (
              <div className="card mt-sm" style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>Tus Listas Personales</h4>
                  <button className="btn btn-sm" onClick={() => setShowListasModal(false)}>Cerrar</button>
                </div>
                {listasMessage && <div className={`alert ${listasMessage.startsWith('✓') ? 'alert-success' : 'alert-warning'} mt-sm mb-sm`}>{listasMessage}</div>}
                {listasLoading ? (
                  <p>Cargando listas...</p>
                ) : misListas.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {misListas.map(lista => (
                      <li key={lista.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--color-bg-alt)' }}>
                        <span>{lista.nombre_lista}</span>
                        <button className="btn btn-sm btn-primary" onClick={() => handleAddToLista(lista.id)}>Añadir</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No tienes listas personales.</p>
                )}
              </div>
            )}

            {inventoryMessage && (
              <div className={`alert ${inventoryMessage.startsWith('✓') ? 'alert-success' : 'alert-warning'} mt-md`}>
                {inventoryMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Specs ── */}
      <section className="detail-specs">
        <h2>Especificaciones Técnicas</h2>

        {specsBase.length > 0 || Object.keys(especificacionesExtra).length > 0 ? (
          <>
            {specsBase.length > 0 && (
              <div className="specs-grid">
                {specsBase.map(({ label, value }) => (
                  <div key={label} className="spec-row">
                    <span className="spec-label">{label}</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(especificacionesExtra).length > 0 && (
              <>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Características adicionales
                </h3>
                <div className="specs-grid">
                  {Object.entries(especificacionesExtra).map(([key, val]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-label">{key}</span>
                      <span className="spec-value">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ minHeight: 120 }}>
            <p>No se han registrado especificaciones técnicas para este producto.</p>
          </div>
        )}
      </section>

      {/* ── Media de datos de usuarios ── */}
      <section className="detail-specs" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Media de datos de usuarios</h2>
          {hasSubmittedRealData ? (
            <button 
              className="btn btn-danger btn-outline" 
              onClick={handleDeleteMyRealData}
              disabled={realDataLoading}
            >
              {realDataLoading ? 'Eliminando...' : 'Eliminar mis datos'}
            </button>
          ) : (
            <button 
              className="btn btn-outline" 
              onClick={() => setShowRealDataForm(!showRealDataForm)}
            >
              {showRealDataForm ? 'Cancelar' : 'Aportar datos reales'}
            </button>
          )}
        </div>

        {hasSubmittedRealData && (
          <div className="alert alert-success mb-md">
            Ya has aportado datos reales para este producto. Gracias por tu contribución. Puedes eliminarlos para volver a aportar.
          </div>
        )}

        {!hasSubmittedRealData && showRealDataForm && (
          <div className="card mb-xl" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Aporta datos reales de tu experiencia</h3>
            {realDataMessage && <div className={`alert ${realDataMessage.startsWith('✓') ? 'alert-success' : 'alert-danger'} mb-md`}>{realDataMessage}</div>}
            
            <form onSubmit={handleSubmitRealData} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Peso (ej: 50)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={realDataForm.peso} 
                      onChange={e => setRealDataForm({...realDataForm, peso: e.target.value})} 
                      placeholder="Peso real..." 
                    />
                    <span className="text-muted">g</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Latencia (ej: 1)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={realDataForm.latencia} 
                      onChange={e => setRealDataForm({...realDataForm, latencia: e.target.value})} 
                      placeholder="Latencia real..." 
                    />
                    <span className="text-muted">ms</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Autonomía (ej: 40)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={realDataForm.autonomia} 
                      onChange={e => setRealDataForm({...realDataForm, autonomia: e.target.value})} 
                      placeholder="Autonomía..." 
                    />
                    <span className="text-muted">h</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Características Adicionales</h4>
                {additionalFields.map((field, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input 
                        type="text" 
                        value={field.attr} 
                        onChange={e => {
                          const newFields = [...additionalFields];
                          newFields[index].attr = e.target.value;
                          setAdditionalFields(newFields);
                        }} 
                        placeholder="Ej: Material" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Valor</label>
                      <input 
                        type="text" 
                        value={field.val} 
                        onChange={e => {
                          const newFields = [...additionalFields];
                          newFields[index].val = e.target.value;
                          setAdditionalFields(newFields);
                        }} 
                        placeholder="Ej: Plástico PBT" 
                      />
                    </div>
                    {additionalFields.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline btn-danger" 
                        onClick={() => {
                          const newFields = additionalFields.filter((_, i) => i !== index);
                          setAdditionalFields(newFields);
                        }}
                        style={{ height: '38px' }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline" 
                  onClick={() => setAdditionalFields([...additionalFields, { attr: '', val: '' }])}
                >
                  + Añadir otra característica
                </button>
              </div>

              <button type="submit" className="btn btn-primary mt-md" disabled={realDataLoading} style={{ justifySelf: 'start' }}>
                {realDataLoading ? 'Enviando...' : 'Enviar datos'}
              </button>
            </form>
          </div>
        )}

        {realDataAverages.length > 0 ? (
          <div className="specs-grid">
            {realDataAverages.map(({ label, value }) => (
              <div key={label} className="spec-row" style={{ backgroundColor: 'var(--color-surface)' }}>
                <span className="spec-label">{label}</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>
        ) : (
           <p className="text-muted">Aún no hay datos aportados por los usuarios.</p>
        )}
      </section>

      {/* ── Reviews ── */}
      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontWeight: 900, marginBottom: '1.5rem', fontSize: '1.75rem' }}>
          Reseñas
          {reviewsCount > 0 && (
            <span className="badge badge-primary" style={{ marginLeft: '0.75rem', verticalAlign: 'middle' }}>
              {reviewsCount}
            </span>
          )}
        </h2>

        {/* Review form */}
        <div className="card mb-xl">
          <h3 style={{ fontWeight: 900, marginBottom: '0.5rem' }}>
            {isAuthenticated ? 'Escribe una reseña' : 'Inicia sesión para reseñar'}
          </h3>

          {reviewError   && <div className="alert alert-danger mt-md">{reviewError}</div>}
          {reviewSuccess && <div className="alert alert-success mt-md">{reviewSuccess}</div>}

          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="puntuacion">Puntuación</label>
                <select
                  id="puntuacion"
                  value={newPuntuacion}
                  onChange={(e) => setNewPuntuacion(Number(e.target.value))}
                  disabled={reviewLoading}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>{v} / 10</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comentario">Comentario</label>
                <textarea
                  id="comentario"
                  rows="4"
                  value={newComentario}
                  onChange={(e) => setNewComentario(e.target.value)}
                  placeholder="Describe tu experiencia con este producto…"
                  disabled={reviewLoading}
                />
              </div>
              <button
                type="submit"
                className={`btn btn-primary${reviewLoading ? ' btn-loading' : ''}`}
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Publicando…' : 'Publicar reseña'}
              </button>
            </form>
          ) : (
            <p className="text-muted text-sm mt-md">
              <Link to="/login">Inicia sesión</Link> para publicar una reseña.
            </p>
          )}
        </div>

        {/* Reviews list */}
        {resenias.length === 0 ? (
          <div className="empty-state">
            <h3>Sin reseñas todavía</h3>
            <p>Sé el primero en compartir tu opinión sobre este producto.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {resenias.map((resenia) => (
              <article
                key={resenia.id}
                className="card"
                style={{ padding: '1.25rem', borderLeft: `4px solid var(--color-${getScoreBadge(resenia.puntuacion).replace('badge-', '')}, var(--color-primary))` }}
              >
                {/* Review header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {resenia.user?.id ? (
                      <Link to={`/perfiles/${resenia.user.id}`} style={{ display: 'flex' }}>
                        <img
                          src={resenia.user?.foto
                            ? `http://localhost:8000/storage/${resenia.user.foto}`
                            : '/user.placeholder.png'}
                          alt={resenia.user?.nombre || 'Usuario'}
                          style={{ width: 36, height: 36, objectFit: 'cover', border: '2px solid var(--color-border)', flexShrink: 0 }}
                        />
                      </Link>
                    ) : (
                      <img
                        src={resenia.user?.foto
                          ? `http://localhost:8000/storage/${resenia.user.foto}`
                          : '/user.placeholder.png'}
                        alt={resenia.user?.nombre || 'Usuario'}
                        style={{ width: 36, height: 36, objectFit: 'cover', border: '2px solid var(--color-border)', flexShrink: 0 }}
                      />
                    )}
                    <div>
                      {resenia.user?.id ? (
                        <Link
                          to={`/perfiles/${resenia.user.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          onMouseEnter={(e) => e.target.style.textDecoration='underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration='none'}
                        >
                          <p style={{ fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {resenia.user.nombre}
                          </p>
                        </Link>
                      ) : (
                        <p style={{ fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.2 }}>
                          {resenia.user?.nombre || 'Usuario Anónimo'}
                        </p>
                      )}
                      <p className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                        {formatFecha(resenia.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${getScoreBadge(resenia.puntuacion)}`} style={{ fontSize: '0.95rem', padding: '4px 10px' }}>
                    {resenia.puntuacion} / 10
                  </span>
                </div>

                {/* Comment */}
                {resenia.comentario && (
                  <p style={{ lineHeight: 1.65, marginBottom: '0.75rem' }}>{resenia.comentario}</p>
                )}

                {/* Votes + delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-bg-alt)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span className="text-muted text-sm" style={{ marginRight: '0.25rem' }}>¿Útil?</span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleVotar(resenia.id, 'up')}
                    type="button"
                  >
                    + {resenia.voto_up ?? 0}
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleVotar(resenia.id, 'down')}
                    type="button"
                  >
                    − {resenia.voto_down ?? 0}
                  </button>

                  {user?.id === resenia.user?.id && (
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => handleDeleteReview(resenia.id)}
                      disabled={deleteLoadingId === resenia.id}
                      type="button"
                    >
                      {deleteLoadingId === resenia.id ? '…' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {reviewsLastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button 
              className="btn btn-outline" 
              disabled={reviewsCurrentPage === 1}
              onClick={() => fetchReviews(reviewsCurrentPage - 1)}
            >
              Anterior
            </button>
            <span>Página {reviewsCurrentPage} de {reviewsLastPage}</span>
            <button 
              className="btn btn-outline" 
              disabled={reviewsCurrentPage === reviewsLastPage}
              onClick={() => fetchReviews(reviewsCurrentPage + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
};