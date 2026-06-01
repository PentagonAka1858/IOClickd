import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Inventario.scss';

export const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [quantities, setQuantities] = useState({});

  const fetchInventario = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/inventario');
      const data = response.data?.data ?? response.data;
      setInventario(data || []);
      const qtyMap = {};
      (data || []).forEach((item) => {
        qtyMap[item.producto_id] = item.cantidad;
      });
      setQuantities(qtyMap);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('No se pudo cargar tu inventario. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  const handleCantidadChange = (productoId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productoId]: value,
    }));
  };

  const handleActualizarCantidad = async (item) => {
    const cantidad = Number(quantities[item.producto_id] ?? item.cantidad);
    if (cantidad < 1) {
      setActionMessage('La cantidad debe ser al menos 1.');
      return;
    }

    setSaving(true);
    setActionMessage('');
    setActionError('');
    try {
      await api.put(`/inventario/${item.producto_id}`, { cantidad });
      setActionMessage('Cantidad actualizada correctamente.');
      fetchInventario();
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      setActionError('No se pudo actualizar la cantidad. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarcarPrincipal = async (item) => {
    setSaving(true);
    setActionMessage('');
    setActionError('');

    try {
      const actualPrincipal = inventario.find((it) => it.principal && it.producto_id !== item.producto_id);

      if (actualPrincipal) {
        await api.put(`/inventario/${actualPrincipal.producto_id}`, { principal: false });
      }

      await api.put(`/inventario/${item.producto_id}`, { principal: true });
      setActionMessage('Producto destacado actualizado.');
      fetchInventario();
    } catch (err) {
      console.error('Error al marcar producto principal:', err);
      setActionError('No se pudo marcar el producto como destacado. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (item) => {
    const confirmado = window.confirm('¿Quieres eliminar este producto de tu inventario?');
    if (!confirmado) {
      return;
    }

    setSaving(true);
    setActionMessage('');
    setActionError('');
    try {
      await api.delete(`/inventario/${item.producto_id}`);
      setActionMessage('Producto eliminado del inventario.');
      fetchInventario();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setActionError('No se pudo eliminar el producto. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inventario-page">
      <header className="inventario-header">
        <div>
          <h1>Mi Inventario Personal</h1>
          <p>Guarda los productos que tienes y marca cuál usas más comúnmente.</p>
        </div>
        <Link to="/productos" className="btn btn-outline">
          Ver Catálogo
        </Link>
      </header>

      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}
      {actionError && <div className="alert alert-danger">{actionError}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <p>Cargando tu inventario...</p>
        </div>
      ) : inventario.length === 0 ? (
        <div className="empty-state">
          <h3>No tienes productos guardados</h3>
          <p>Visita el catálogo para añadir productos a tu inventario personal.</p>
          <Link to="/productos" className="btn btn-primary">
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="inventario-grid">
          {inventario.map((item) => (
            <article key={item.producto_id} className={`inventario-card ${item.principal ? 'principal' : ''}`}>
              <div className="card-top">
                <div className="product-label">
                  <span className="brand">{item.producto.marca}</span>
                  <h2>{item.producto.modelo}</h2>
                </div>
                {item.principal && <span className="badge-principal">Destacado</span>}
              </div>

              <p className="product-type">{item.producto.tipo}</p>
              <p className="product-description">{item.producto.descripcion || 'Sin descripción disponible.'}</p>

              <div className="card-details">
                <div>
                  <span>Cantidad</span>
                  <input
                    type="number"
                    min="1"
                    value={quantities[item.producto_id] ?? item.cantidad}
                    onChange={(e) => handleCantidadChange(item.producto_id, e.target.value)}
                  />
                </div>
                <div>
                  <span>Guardado desde</span>
                  <p>{new Date(item.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => handleActualizarCantidad(item)}
                >
                  Actualizar cantidad
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={saving || item.principal}
                  onClick={() => handleMarcarPrincipal(item)}
                >
                  {item.principal ? 'Ya es destacado' : 'Marcar como destacado'}
                </button>
                <button
                  className="btn btn-danger"
                  disabled={saving}
                  onClick={() => handleEliminar(item)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
