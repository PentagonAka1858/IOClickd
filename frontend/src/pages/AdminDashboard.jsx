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
    <div className="admin-dashboard-page">
      <div className="page-header">
        <h1>Panel de administración</h1>
        <p>Gestión y estadísticas de productos, usuarios y reseñas.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionError && <div className="alert alert-danger">{actionError}</div>}
      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}

      <section className="admin-stats-grid">
        <article className="stat-card">
          <span className="stat-label">Productos</span>
          <strong>{stats?.total_productos ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Usuarios</span>
          <strong>{stats?.total_usuarios ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Reseñas</span>
          <strong>{stats?.total_resenias ?? 0}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Consultas abiertas</span>
          <strong>{stats?.consultas_abiertas ?? 0}</strong>
        </article>
      </section>

      <section className="admin-section">
        <div className="section-title-bar">
          <h2>Moderación de reseñas</h2>
        </div>
        {resenias.length === 0 ? (
          <div className="empty-state">
            <p>No hay reseñas para moderar.</p>
          </div>
        ) : (
          <div className="admin-table admin-table-reviews">
            <div className="table-head">
              <span>Producto</span>
              <span>Usuario</span>
              <span>Visible</span>
              <span>Puntuación</span>
              <span>Creada</span>
              <span>Acciones</span>
            </div>
            {resenias.map((resenia) => (
              <div key={resenia.id} className="table-row">
                <span>{resenia.producto?.marca} {resenia.producto?.modelo}</span>
                <span>{resenia.user?.nombre || 'Anónimo'}</span>
                <span>{resenia.visible ? 'Sí' : 'No'}</span>
                <span>{resenia.puntuacion}</span>
                <span>{formatDate(resenia.created_at)}</span>
                <span className="actions-cell">
                  <button
                    className="btn btn-outline"
                    disabled={actionLoadingId === resenia.id}
                    onClick={() => handleToggleReviewVisibility(resenia)}
                  >
                    {resenia.visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={actionLoadingId === resenia.id}
                    onClick={() => handleDeleteReview(resenia.id)}
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="section-title-bar">
          <h2>Moderación de productos</h2>
        </div>
        {productos.length === 0 ? (
          <div className="empty-state">
            <p>No hay productos cargados.</p>
          </div>
        ) : (
          <div className="admin-table admin-table-products">
            <div className="table-head">
              <span>Modelo</span>
              <span>Marca</span>
              <span>Tipo</span>
              <span>Reseñas</span>
              <span>Creada</span>
              <span>Acciones</span>
            </div>
            {productos.map((producto) => (
              <div key={producto.id} className="table-row">
                <span>{producto.modelo}</span>
                <span>{producto.marca}</span>
                <span>{producto.tipo}</span>
                <span>{producto.resenias_count}</span>
                <span>{formatDate(producto.created_at)}</span>
                <span className="actions-cell">
                  <Link className="btn btn-outline" to={`/productos/${producto.id}`}>
                    Ver
                  </Link>
                  {user?.rol === 'ADMIN' && (
                    <button
                      className="btn btn-danger"
                      disabled={actionLoadingId === producto.id}
                      onClick={() => handleDeleteProduct(producto.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="admin-section admin-users-section">
          <div className="section-title-bar">
            <h2>Gestión de usuarios</h2>
          </div>
          {usuarios.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios registrados.</p>
            </div>
          ) : (
            <div className="admin-table admin-table-users">
              <div className="table-head">
                <span>Nombre</span>
                <span>Email</span>
                <span>Rol</span>
                <span>Visible</span>
                <span>Reseñas</span>
                <span>Acciones</span>
              </div>
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="table-row">
                  <span>{usuario.nombre}</span>
                  <span>{usuario.email}</span>
                  <span>{usuario.rol}</span>
                  <span>{usuario.visibilidad ? 'Sí' : 'No'}</span>
                  <span>{usuario.resenias_count}</span>
                  <span className="actions-cell">
                    <button
                      className="btn btn-outline"
                      disabled={actionLoadingId === usuario.id}
                      onClick={() => handleToggleUserVisibility(usuario)}
                    >
                      {usuario.visibilidad ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={actionLoadingId === usuario.id}
                      onClick={() => handleDeleteUser(usuario.id)}
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
