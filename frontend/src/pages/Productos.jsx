import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
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

const TYPE_LABELS = {
  RATON: 'Ratón', TECLADO: 'Teclado', AURICULAR: 'Auricular',
  MONITOR: 'Monitor', ALFOMBRILLA: 'Alfombrilla', OTRO: 'Otro',
};

export const Productos = () => {
  const { isAuthenticated } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [buscar, setBuscar] = useState('');
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState('');
  const [pesoMax, setPesoMax] = useState('');
  const [conexion, setConexion] = useState('');
  const [color, setColor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
  const [personalLists, setPersonalLists] = useState([]);
  const [activeListProductId, setActiveListProductId] = useState(null);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [listActionMessage, setListActionMessage] = useState('');
  const [listActionError, setListActionError] = useState('');
  const [inventoryProcessingId, setInventoryProcessingId] = useState(null);
  const [listProcessingId, setListProcessingId] = useState(null);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [buscar, marca, tipo, pesoMax, conexion, color, perPage]);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const params = { page: currentPage, per_page: perPage };
        if (buscar) params.buscar = buscar;
        if (marca) params.marca = marca;
        if (tipo) params.tipo = tipo;
        if (pesoMax) params.peso = pesoMax;
        if (conexion) params.conexion = conexion;
        if (color) params.color = color;
        
        const response = await api.get('/productos', { params });
        const responseData = response.data;
        // Laravel paginator wraps items in `data`
        const items = responseData?.data ?? responseData;
        setProductos(Array.isArray(items) ? items : []);
        if (responseData?.current_page !== undefined) {
          setPagination({
            current_page: responseData.current_page,
            last_page: responseData.last_page,
            total: responseData.total,
            per_page: responseData.per_page,
          });
        }
      } catch {
        setError('No se pudieron cargar los productos en este momento.');
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchProductos, 300);
    return () => clearTimeout(timer);
  }, [buscar, marca, tipo, pesoMax, conexion, color, perPage, currentPage]);

  useEffect(() => {
    if (!isAuthenticated) { setPersonalLists([]); return; }
    api.get('/listas').then((r) => {
      const data = r.data?.data ?? r.data;
      setPersonalLists(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleAddToInventory = async (producto) => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setInventoryProcessingId(producto.id);
    setSuccess('');
    setError('');
    try {
      await api.post('/inventario', { producto_id: producto.id, cantidad: 1, principal: false });
      setSuccess(`"${producto.modelo}" añadido al inventario correctamente.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg === 'Este producto ya está en tu inventario.'
        ? 'Este producto ya está en tu inventario.'
        : 'No se pudo añadir al inventario.');
    } finally {
      setInventoryProcessingId(null);
    }
  };

  const toggleListMenu = (productoId) => {
    setActiveListProductId((p) => (p === productoId ? null : productoId));
    setShowCreateListForm(false);
    setListActionMessage('');
    setListActionError('');
  };

  const handleAddToExistingList = async (listaId, productoId) => {
    setListProcessingId(productoId);
    try {
      await api.post(`/listas/${listaId}/productos`, { producto_id: productoId });
      setListActionMessage('Producto añadido a la lista.');
      setPersonalLists((prev) =>
        prev.map((l) =>
          l.id === listaId
            ? { ...l, productos_count: (l.productos_count ?? l.productos?.length ?? 0) + 1 }
            : l
        )
      );
    } catch (err) {
      const msg = err.response?.data?.message;
      setListActionError(msg === 'Este producto ya está en la lista.'
        ? 'Ya está en esa lista.'
        : 'No se pudo añadir el producto.');
    } finally {
      setListProcessingId(null);
    }
  };

  const handleCreateList = async (productoId) => {
    if (!newListName.trim()) { setListActionError('El nombre es obligatorio.'); return; }
    setListProcessingId(productoId);
    try {
      const { data: lista } = await api.post('/listas', {
        nombre_lista: newListName.trim(),
        descripcion: newListDescription.trim(),
        publica: false,
      });
      await api.post(`/listas/${lista.id}/productos`, { producto_id: productoId });
      setPersonalLists((p) => [{ ...lista, productos_count: 1 }, ...p]);
      setNewListName('');
      setNewListDescription('');
      setShowCreateListForm(false);
      setListActionMessage('Lista creada y producto añadido.');
    } catch {
      setListActionError('No se pudo crear la lista.');
    } finally {
      setListProcessingId(null);
    }
  };

  return (
    <div className="productos-page">

      <header className="page-header compare-header-row">
        <div>
          <h1>Catálogo de Productos</h1>
          <p>Periféricos y componentes gaming con specs detalladas</p>
        </div>
        <Link to="/productos/comparar-ratones" className="btn btn-accent">
          Comparar Ratones
        </Link>
      </header>

      <section className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'var(--color-surface-alt)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <div className="input-wrapper" style={{ flex: '1 1 200px' }}>
          <svg className="input-icon icon-left" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Buscar por modelo…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="has-icon-left"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <input
            type="text"
            placeholder="Marca…"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%' }}>
            <option value="">Todas las categorías</option>
            <option value="RATON">Ratones</option>
            <option value="TECLADO">Teclados</option>
            <option value="AURICULAR">Auriculares</option>
            <option value="MONITOR">Monitores</option>
            <option value="ALFOMBRILLA">Alfombrillas</option>
            <option value="OTRO">Otros</option>
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <input
            type="number"
            placeholder="Peso máx (g)"
            value={pesoMax}
            onChange={(e) => setPesoMax(e.target.value)}
            style={{ width: '100%' }}
            min="0"
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <select value={conexion} onChange={(e) => setConexion(e.target.value)} style={{ width: '100%' }}>
            <option value="">Conexión (Todas)</option>
            <option value="inalambrica">Inalámbrica</option>
            <option value="cable">Cable / Resto</option>
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <input
            type="text"
            placeholder="Color…"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} style={{ width: '100%' }}>
            <option value={10}>10 por pág</option>
            <option value={20}>20 por pág</option>
            <option value={50}>50 por pág</option>
          </select>
        </div>
      </section>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        {success && <div className="alert alert-success" style={{ margin: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>{success}</div>}
        {error && <div className="alert alert-danger" style={{ margin: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>{error}</div>}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Cargando productos…</span>
        </div>
      ) : productos.length === 0 ? (
        <div className="empty-state">
          <h3>Sin resultados</h3>
          <p>Prueba a cambiar los filtros de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="products-grid">
          {productos.map((producto) => (
            <article key={producto.id} className="product-card">
              <div className="card-image">
                {producto.foto ? (
                  <img
                    src={`http://localhost:8000/storage/${producto.foto}`}
                    alt={`${producto.marca} ${producto.modelo}`}
                  />
                ) : (
                  <span style={{ fontSize: '3rem', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {getProductIcon(producto.tipo, 48)}
                  </span>
                )}
                <span className="card-badge">{TYPE_LABELS[producto.tipo] || producto.tipo}</span>
              </div>

              <div className="card-body">
                <span className="card-category">{producto.marca}</span>
                <h3 className="card-title">{producto.modelo}</h3>
                <p className="card-meta" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {producto.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              <div className="card-footer">
                <Link to={`/productos/${producto.id}`} className="btn btn-sm btn-primary">
                  Ver Detalles
                </Link>
                {isAuthenticated && (
                  <>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleAddToInventory(producto)}
                      disabled={inventoryProcessingId === producto.id}
                    >
                      {inventoryProcessingId === producto.id ? '…' : '+ Inv.'}
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => toggleListMenu(producto.id)}
                      type="button"
                    >
                      Listas
                    </button>
                  </>
                )}
              </div>

              {activeListProductId === producto.id && (
                <div style={{ padding: '1rem', borderTop: '2px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
                  {listActionMessage && <div className="alert alert-success mb-md">{listActionMessage}</div>}
                  {listActionError && <div className="alert alert-danger mb-md">{listActionError}</div>}

                  <div className="btn-group mb-md">
                    <button
                      className="btn btn-sm btn-accent"
                      type="button"
                      onClick={() => setShowCreateListForm((p) => !p)}
                    >
                      {showCreateListForm ? 'Cancelar' : '+ Nueva lista'}
                    </button>
                  </div>

                  {showCreateListForm && (
                    <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Nombre de la lista"
                      />
                      <textarea
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        placeholder="Descripción opcional"
                        style={{ minHeight: '60px' }}
                      />
                      <button
                        className="btn btn-sm btn-primary"
                        type="button"
                        onClick={() => handleCreateList(producto.id)}
                        disabled={listProcessingId === producto.id}
                      >
                        {listProcessingId === producto.id ? 'Creando…' : 'Crear y añadir'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {personalLists.length > 0
                      ? personalLists.map((lista) => (
                          <button
                            key={lista.id}
                            className="btn btn-sm btn-outline"
                            type="button"
                            onClick={() => handleAddToExistingList(lista.id, producto.id)}
                            disabled={listProcessingId === producto.id}
                          >
                            {lista.nombre_lista} ({lista.productos_count ?? lista.productos?.length ?? 0})
                          </button>
                        ))
                      : <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No tienes listas aún.</p>
                    }
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.last_page > 1 && (
        <nav className="pagination" aria-label="Paginación de productos" style={{ justifyContent: 'center', marginTop: 'var(--space-2xl, 2rem)' }}>
          <button
            className="page-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            aria-label="Primera página"
          >
            «
          </button>
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            ‹
          </button>

          {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="page-info">…</span>
              ) : (
                <button
                  key={item}
                  className={`page-btn${item === currentPage ? ' active' : ''}`}
                  onClick={() => setCurrentPage(item)}
                  aria-label={`Página ${item}`}
                  aria-current={item === currentPage ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            )
          }

          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
            disabled={currentPage === pagination.last_page}
            aria-label="Página siguiente"
          >
            ›
          </button>
          <button
            className="page-btn"
            onClick={() => setCurrentPage(pagination.last_page)}
            disabled={currentPage === pagination.last_page}
            aria-label="Última página"
          >
            »
          </button>

          <span className="page-info">
            {pagination.total} producto{pagination.total !== 1 ? 's' : ''}
          </span>
        </nav>
      )}
    </div>
  );
};