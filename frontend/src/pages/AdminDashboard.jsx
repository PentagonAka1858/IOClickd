import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Admin.scss';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resenias, setResenias] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  const [selectedReviewContent, setSelectedReviewContent] = useState(null);
  const [showClosedConsultas, setShowClosedConsultas] = useState(false);

  const [pageConsultas, setPageConsultas] = useState(1);
  const [pageResenias, setPageResenias] = useState(1);
  const [pageProductos, setPageProductos] = useState(1);
  const [pageUsuarios, setPageUsuarios] = useState(1);
  const itemsPerPage = 10;

  const isAdmin = user?.rol === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, usersRes, productsRes, reviewsRes, consultasRes] = await Promise.all([
        api.get('/admin/estadisticas'),
        api.get('/admin/usuarios'),
        api.get('/admin/productos'),
        api.get('/admin/resenias'),
        api.get('/consultas'),
      ]);

      setStats(statsRes.data);
      setUsuarios(usersRes.data.data || []);
      setProductos(productsRes.data.data || []);
      setResenias(reviewsRes.data.data || []);
      setConsultas(consultasRes.data.data || []);
    } catch (err) {
      console.error('Error al cargar datos de admin:', err);
      setError('No se pudieron cargar los datos administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (value) => {
    if (!value) return 'Desconocida';
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const actionStart = (id) => {
    setActionError('');
    setActionMessage('');
    setActionLoadingId(id);
  };

  const actionEnd = () => {
    setActionLoadingId(null);
  };

  const handleDeleteProduct = async (id) => {
    actionStart(id);
    try {
      await api.delete(`/productos/${id}`);
      setProductos((prev) => prev.filter((item) => item.id !== id));
      setActionMessage('Producto eliminado correctamente.');
    } catch (err) {
      console.error('Error eliminando producto:', err);
      setActionError('No se pudo eliminar el producto.');
    } finally {
      actionEnd();
    }
  };

  const handleDeleteReview = async (id) => {
    actionStart(id);
    try {
      await api.delete(`/resenias/${id}`);
      setResenias((prev) => prev.filter((item) => item.id !== id));
      setActionMessage('Reseña eliminada correctamente.');
    } catch (err) {
      console.error('Error eliminando reseña:', err);
      setActionError('No se pudo eliminar la reseña.');
    } finally {
      actionEnd();
    }
  };

  const handleToggleReviewVisibility = async (resenia) => {
    actionStart(resenia.id);
    try {
      const response = await api.patch(`/resenias/${resenia.id}/moderar`, {
        visible: !resenia.visible,
      });
      setResenias((prev) => prev.map((item) => (item.id === resenia.id ? response.data.resenia || response.data : item)));
      setActionMessage(`Reseña ${resenia.visible ? 'ocultada' : 'visible'} correctamente.`);
    } catch (err) {
      console.error('Error modificando visibilidad:', err);
      setActionError('No se pudo actualizar la visibilidad de la reseña.');
    } finally {
      actionEnd();
    }
  };

  const handleDeleteUser = async (id) => {
    actionStart(id);
    try {
      await api.delete(`/admin/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((item) => item.id !== id));
      setActionMessage('Usuario eliminado correctamente.');
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      setActionError('No se pudo eliminar el usuario.');
    } finally {
      actionEnd();
    }
  };

  const handleToggleUserVisibility = async (usuario) => {
    actionStart(usuario.id);
    try {
      const response = await api.patch(`/admin/usuarios/${usuario.id}/visibilidad`, {
        visibilidad: !usuario.visibilidad,
      });
      setUsuarios((prev) => prev.map((item) => (item.id === usuario.id ? response.data : item)));
      setActionMessage(`Visibilidad del usuario actualizada correctamente.`);
    } catch (err) {
      console.error('Error cambiando visibilidad de usuario:', err);
      setActionError('No se pudo actualizar la visibilidad del usuario.');
    } finally {
      actionEnd();
    }
  };

  const renderPagination = (currentPage, setPage, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', paddingBottom: '1rem' }}>
        <button 
          className="btn btn-sm btn-outline" 
          disabled={currentPage === 1} 
          onClick={() => setPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Página {currentPage} de {totalPages}</span>
        <button 
          className="btn btn-sm btn-outline" 
          disabled={currentPage === totalPages} 
          onClick={() => setPage(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    );
  };

  const renderProductTypesBar = () => {
    if (!stats?.productos_por_tipo || stats.productos_por_tipo.length === 0) return null;
    const total = stats.total_productos || 1;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

    return (
      <div className="product-types-stats" style={{ marginTop: '1.5rem', background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Distribución de Productos por Tipo</h3>
        <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
          {stats.productos_por_tipo.map((tipo, idx) => {
            const percentage = (tipo.total / total) * 100;
            return (
              <div 
                key={tipo.tipo} 
                style={{ 
                  width: `${percentage}%`, 
                  backgroundColor: colors[idx % colors.length],
                  transition: 'width 0.3s ease'
                }} 
                title={`${tipo.tipo}: ${tipo.total} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem' }}>
          {stats.productos_por_tipo.map((tipo, idx) => (
            <div key={tipo.tipo} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
              <span style={{ textTransform: 'capitalize' }}>{tipo.tipo}</span>
              <span style={{ fontWeight: 700, opacity: 0.8 }}>{((tipo.total / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="page-header">
          <h1>Panel de administración</h1>
        </div>
        <div className="empty-state">
          <p>Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <span className="admin-badge">ADMIN</span>
      </header>

      {error && <div className="alert alert-danger mb-md">{error}</div>}
      {actionError && <div className="alert alert-danger mb-md">{actionError}</div>}
      {actionMessage && <div className="alert alert-success mb-md">{actionMessage}</div>}

      {/* Stats */}
      <div className="stats-container" style={{ marginBottom: '2rem' }}>
        <div className="stats-row">
          {[
            { label: 'Productos', value: stats?.total_productos ?? 0 },
            { label: 'Usuarios', value: stats?.total_usuarios ?? 0 },
            { label: 'Reseñas', value: stats?.total_resenias ?? 0 },
            { label: 'C. Abiertas', value: stats?.consultas_abiertas ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
            </div>
          ))}
        </div>
        {renderProductTypesBar()}
      </div>

      {/* Consultas */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Gestión de Consultas</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <input 
              type="checkbox" 
              checked={showClosedConsultas} 
              onChange={() => setShowClosedConsultas(!showClosedConsultas)}
            />
            Mostrar consultas cerradas
          </label>
        </div>
        {consultas.filter(c => showClosedConsultas || c.estado !== 'CERRADA').length === 0 ? (
          <div className="empty-state">
            <p>No hay consultas para mostrar.</p>
          </div>
        ) : (
          <div className="table-container admin-panel">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultas
                  .filter(c => showClosedConsultas || c.estado !== 'CERRADA')
                  .slice((pageConsultas - 1) * itemsPerPage, pageConsultas * itemsPerPage)
                  .map((c) => (
                  <tr key={c.id}>
                    <td className="mono">#{c.id}</td>
                    <td>{c.cliente?.nombre || 'Desconocido'}</td>
                    <td><span className={`badge badge-${c.estado === 'ABIERTA' ? 'success' : c.estado === 'PENDIENTE' ? 'warning' : 'muted'}`}>{c.estado}</span></td>
                    <td className="mono text-sm">{formatDate(c.created_at)}</td>
                    <td>
                      <Link className="btn btn-sm btn-primary" to={`/consultas/${c.id}`}>Ver / Responder</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(pageConsultas, setPageConsultas, consultas.filter(c => showClosedConsultas || c.estado !== 'CERRADA').length)}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 900, marginBottom: '1rem', fontSize: '1.5rem' }}>Moderación de Reseñas</h2>
        {resenias.length === 0 ? (
          <div className="empty-state">
            <p>No hay reseñas para moderar.</p>
          </div>
        ) : (
          <div className="table-container admin-panel">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Usuario</th>
                  <th>Visible</th>
                  <th>Puntuación</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resenias
                  .slice((pageResenias - 1) * itemsPerPage, pageResenias * itemsPerPage)
                  .map((r) => (
                  <tr key={r.id}>
                    <td>{r.producto?.marca} {r.producto?.modelo}</td>
                    <td>{r.user?.nombre || 'Anónimo'}</td>
                    <td><span className={`badge ${r.visible ? 'badge-success' : 'badge-muted'}`}>{r.visible ? 'Sí' : 'No'}</span></td>
                    <td className="mono">{r.puntuacion}</td>
                    <td className="mono text-sm">{formatDate(r.created_at)}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-primary" onClick={() => setSelectedReviewContent(r)}>
                          Leer
                        </button>
                        <button className="btn btn-sm btn-outline" disabled={actionLoadingId === r.id} onClick={() => handleToggleReviewVisibility(r)}>
                          {r.visible ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button className="btn btn-sm btn-danger" disabled={actionLoadingId === r.id} onClick={() => handleDeleteReview(r.id)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(pageResenias, setPageResenias, resenias.length)}
          </div>
        )}
      </section>

      {/* Products */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Moderación de Productos</h2>
          <Link to="/admin/productos/create" className="btn btn-primary">
            + Crear Producto
          </Link>
        </div>
        {productos.length === 0 ? (
          <div className="empty-state"><p>No hay productos.</p></div>
        ) : (
          <div className="table-container admin-panel">
            <table className="neo-table">
              <thead>
                <tr><th>Modelo</th><th>Marca</th><th>Tipo</th><th>Reseñas</th><th>Fecha</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos
                  .slice((pageProductos - 1) * itemsPerPage, pageProductos * itemsPerPage)
                  .map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.modelo}</td>
                    <td>{p.marca}</td>
                    <td><span className={`badge cat-${p.tipo?.toLowerCase()}`}>{p.tipo}</span></td>
                    <td className="mono">{p.resenias_count}</td>
                    <td className="mono text-sm">{formatDate(p.created_at)}</td>
                    <td>
                      <div className="btn-group">
                        <Link className="btn btn-sm btn-primary" to={`/admin/productos/${p.id}/edit`}>Editar</Link>
                        {user?.rol === 'ADMIN' && (
                          <button className="btn btn-sm btn-danger" disabled={actionLoadingId === p.id} onClick={() => handleDeleteProduct(p.id)}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(pageProductos, setPageProductos, productos.length)}
          </div>
        )}
      </section>

      {/* Users */}
      {isAdmin && (
        <section>
          <h2 style={{ fontWeight: 900, marginBottom: '1rem', fontSize: '1.5rem' }}>Gestión de Usuarios</h2>
          {usuarios.length === 0 ? (
            <div className="empty-state"><p>No hay usuarios.</p></div>
          ) : (
            <div className="table-container admin-panel">
              <table className="neo-table">
                <thead>
                  <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Visible</th><th>Reseñas</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {usuarios
                    .slice((pageUsuarios - 1) * itemsPerPage, pageUsuarios * itemsPerPage)
                    .map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.nombre}</td>
                      <td className="mono text-sm">{u.email}</td>
                      <td><span className="badge badge-secondary">{u.rol}</span></td>
                      <td><span className={`badge ${u.visibilidad ? 'badge-success' : 'badge-muted'}`}>{u.visibilidad ? 'Sí' : 'No'}</span></td>
                      <td className="mono">{u.resenias_count}</td>
                      <td>
                        <div className="btn-group">
                          <Link className="btn btn-sm btn-primary" to={`/perfiles/${u.id}`}>
                            Ver Perfil
                          </Link>
                          <button className="btn btn-sm btn-outline" disabled={actionLoadingId === u.id} onClick={() => handleToggleUserVisibility(u)}>
                            {u.visibilidad ? 'Ocultar' : 'Mostrar'}
                          </button>
                          <button className="btn btn-sm btn-danger" disabled={actionLoadingId === u.id} onClick={() => handleDeleteUser(u.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(pageUsuarios, setPageUsuarios, usuarios.length)}
            </div>
          )}
        </section>
      )}

      {/* Review Modal */}
      {selectedReviewContent && (
        <div 
          className="modal-overlay" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setSelectedReviewContent(null)}
        >
          <div 
            className="modal-content" 
            style={{ backgroundColor: 'var(--color-bg)', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedReviewContent(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-color)' }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1.25rem' }}>
              Reseña - {selectedReviewContent.producto?.marca} {selectedReviewContent.producto?.modelo}
            </h3>
            <p style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Por: <strong>{selectedReviewContent.user?.nombre || 'Anónimo'}</strong></p>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>Puntuación:</span> 
              <span className="badge badge-secondary">{selectedReviewContent.puntuacion} / 5</span>
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '300px', overflowY: 'auto' }}>
              {selectedReviewContent.comentario || <em style={{opacity: 0.6}}>Sin comentario de texto.</em>}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedReviewContent(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};