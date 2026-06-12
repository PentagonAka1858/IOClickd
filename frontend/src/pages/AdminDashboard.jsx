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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isAdmin = user?.rol === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, usersRes, productsRes, reviewsRes] = await Promise.all([
        api.get('/admin/estadisticas'),
        api.get('/admin/usuarios'),
        api.get('/admin/productos'),
        api.get('/admin/resenias'),
      ]);

      setStats(statsRes.data);
      setUsuarios(usersRes.data.data || []);
      setProductos(productsRes.data.data || []);
      setResenias(reviewsRes.data.data || []);
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
      <div className="stats-row">
        {[
          { label: 'Productos', value: stats?.total_productos ?? 0 },
          { label: 'Usuarios', value: stats?.total_usuarios ?? 0 },
          { label: 'Reseñas', value: stats?.total_resenias ?? 0 },
          { label: 'Consultas abiertas', value: stats?.consultas_abiertas ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

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
                {resenias.map((r) => (
                  <tr key={r.id}>
                    <td>{r.producto?.marca} {r.producto?.modelo}</td>
                    <td>{r.user?.nombre || 'Anónimo'}</td>
                    <td><span className={`badge ${r.visible ? 'badge-success' : 'badge-muted'}`}>{r.visible ? 'Sí' : 'No'}</span></td>
                    <td className="mono">{r.puntuacion}</td>
                    <td className="mono text-sm">{formatDate(r.created_at)}</td>
                    <td>
                      <div className="btn-group">
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
          </div>
        )}
      </section>

      {/* Products */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 900, marginBottom: '1rem', fontSize: '1.5rem' }}>Moderación de Productos</h2>
        {productos.length === 0 ? (
          <div className="empty-state"><p>No hay productos.</p></div>
        ) : (
          <div className="table-container admin-panel">
            <table className="neo-table">
              <thead>
                <tr><th>Modelo</th><th>Marca</th><th>Tipo</th><th>Reseñas</th><th>Fecha</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.modelo}</td>
                    <td>{p.marca}</td>
                    <td><span className={`badge cat-${p.tipo?.toLowerCase()}`}>{p.tipo}</span></td>
                    <td className="mono">{p.resenias_count}</td>
                    <td className="mono text-sm">{formatDate(p.created_at)}</td>
                    <td>
                      <div className="btn-group">
                        <Link className="btn btn-sm btn-outline" to={`/productos/${p.id}`}>Ver</Link>
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
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.nombre}</td>
                      <td className="mono text-sm">{u.email}</td>
                      <td><span className="badge badge-secondary">{u.rol}</span></td>
                      <td><span className={`badge ${u.visibilidad ? 'badge-success' : 'badge-muted'}`}>{u.visibilidad ? 'Sí' : 'No'}</span></td>
                      <td className="mono">{u.resenias_count}</td>
                      <td>
                        <div className="btn-group">
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
            </div>
          )}
        </section>
      )}
    </div>
  );
};