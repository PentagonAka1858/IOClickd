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

  // Filtros y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('Personalizado');

  const fetchInventario = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/inventario');
      const data = response.data?.data ?? response.data;
      
      let loadedInventory = data || [];

      // Aplicar orden personalizado guardado si existe
      const savedOrder = JSON.parse(localStorage.getItem('inventario_order') || '[]');
      if (savedOrder.length > 0) {
        loadedInventory.sort((a, b) => {
          const indexA = savedOrder.indexOf(a.producto_id);
          const indexB = savedOrder.indexOf(b.producto_id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      setInventario(loadedInventory);
      const qtyMap = {};
      loadedInventory.forEach((item) => { qtyMap[item.producto_id] = item.cantidad; });
      setQuantities(qtyMap);
    } catch {
      setError('No se pudo cargar tu inventario. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventario(); }, []);

  const handleCantidadChange = (productoId, value) => {
    setQuantities((prev) => ({ ...prev, [productoId]: Math.max(1, Number(value)) }));
  };

  const handleSaveCantidad = async (item) => {
    setSaving(true);
    setActionMessage('');
    setActionError('');
    try {
      await api.put(`/inventario/${item.producto_id}`, { cantidad: quantities[item.producto_id] });
      setActionMessage('Cantidad actualizada.');
    } catch {
      setActionError('No se pudo actualizar la cantidad.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrincipal = async (item) => {
    setSaving(true);
    setActionMessage('');
    setActionError('');
    try {
      const isPrincipal = !item.principal;
      await api.put(`/inventario/${item.producto_id}`, { principal: isPrincipal });
      setInventario(prev => prev.map(i => {
        if (i.producto_id === item.producto_id) return { ...i, principal: isPrincipal };
        if (isPrincipal && i.producto?.tipo === item.producto?.tipo) return { ...i, principal: false };
        return i;
      }));
      setActionMessage(isPrincipal ? 'Marcado como principal.' : 'Desmarcado como principal.');
    } catch {
      setActionError('No se pudo actualizar el estado.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (productoId) => {
    if (!window.confirm('¿Eliminar este producto del inventario?')) return;
    try {
      await api.delete(`/inventario/${productoId}`);
      setInventario((prev) => prev.filter((i) => i.producto_id !== productoId));
      setActionMessage('Producto eliminado del inventario.');
    } catch {
      setActionError('No se pudo eliminar el producto.');
    }
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, index) => {
    if (sortOrder !== 'Personalizado') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (sortOrder !== 'Personalizado') return;

    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newList = [...inventario];
    const [removed] = newList.splice(sourceIndex, 1);
    newList.splice(targetIndex, 0, removed);
    
    setInventario(newList);
    localStorage.setItem('inventario_order', JSON.stringify(newList.map(i => i.producto_id)));
  };

  // --- Filter and Sort ---
  const filteredInventario = inventario
    .filter(item => {
      const matchSearch = item.producto?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.producto?.marca?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ? item.producto?.tipo === typeFilter : true;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortOrder === 'A-Z') {
        return (a.producto?.modelo || '').localeCompare(b.producto?.modelo || '');
      } else if (sortOrder === 'Z-A') {
        return (b.producto?.modelo || '').localeCompare(a.producto?.modelo || '');
      } else if (sortOrder === 'Tipo') {
        return (a.producto?.tipo || '').localeCompare(b.producto?.tipo || '');
      }
      return 0; // Personalizado usa el orden actual del array (inventario ya está ordenado localmente)
    });

  const getProductIcon = (tipo) => {
    switch(tipo) {
      case 'RATON': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 2v6"/></svg>;
      case 'TECLADO': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/></svg>;
      case 'AURICULAR': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>;
      case 'MONITOR': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
      case 'ALFOMBRILLA': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/></svg>;
      default: return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    }
  };

  return (
    <div className="inventario-page">
      <header className="page-header header-row">
        <div>
          <h1>Mi Inventario</h1>
          <p className="page-subtitle">Gestiona y organiza tus periféricos</p>
        </div>
        <Link to="/productos" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" style={{marginRight: '8px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Añadir productos
        </Link>
      </header>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Buscar por nombre o marca..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="RATON">Ratón</option>
            <option value="TECLADO">Teclado</option>
            <option value="AURICULAR">Auricular</option>
            <option value="MONITOR">Monitor</option>
            <option value="ALFOMBRILLA">Alfombrilla</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="Personalizado">Personalizado (Arrastrar)</option>
            <option value="A-Z">Nombre (A-Z)</option>
            <option value="Z-A">Nombre (Z-A)</option>
            <option value="Tipo">Tipo</option>
          </select>
        </div>
      </div>

      {actionMessage && <div className="alert alert-success mb-md">{actionMessage}</div>}
      {actionError && <div className="alert alert-danger mb-md">{actionError}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Cargando inventario…</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredInventario.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <h3>Tu inventario está vacío</h3>
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <Link to="/productos" className="btn btn-primary mt-sm">Ver Catálogo</Link>
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredInventario.map((item, index) => {
            // Buscamos su index real en el array original para el D&D si está filtrado,
            // pero D&D debería funcionar bien usando el index visual si no hay filtros activos.
            // Para simplificar, deshabilitamos D&D visual si hay filtros.
            const isCustomSort = sortOrder === 'Personalizado' && !searchTerm && !typeFilter;
            const itemIndex = isCustomSort ? index : inventario.findIndex(i => i.producto_id === item.producto_id);

            return (
              <div 
                key={item.producto_id} 
                className={`inventory-item ${isCustomSort ? 'draggable' : ''}`}
                draggable={isCustomSort}
                onDragStart={(e) => handleDragStart(e, itemIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, itemIndex)}
              >
                {isCustomSort && (
                  <div className="drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                )}
                <div className="item-content">
                  <div className="item-header">
                    <span className="badge badge-primary">{item.producto?.tipo}</span>
                    {item.principal && (
                      <span className="badge badge-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="item-body">
                    {item.producto?.foto ? (
                      <img
                        src={`http://localhost:8000/storage/${item.producto.foto}`}
                        alt={`${item.producto.marca} ${item.producto.modelo}`}
                        className="item-image"
                      />
                    ) : (
                      <div className="item-image-placeholder">
                        {getProductIcon(item.producto?.tipo)}
                      </div>
                    )}
                    <div className="item-info">
                      <h3>{item.producto?.modelo || 'Producto desconocido'}</h3>
                      <span className="item-brand">{item.producto?.marca}</span>
                      <div className="item-qty">
                        <label>Cantidad:</label>
                        <input
                          type="number"
                          min="1"
                          value={quantities[item.producto_id] ?? item.cantidad}
                          onChange={(e) => handleCantidadChange(item.producto_id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="item-footer">
                    <button
                      className="btn btn-sm btn-outline btn-icon"
                      onClick={() => handleTogglePrincipal(item)}
                      disabled={saving}
                      title={item.principal ? "Quitar de principal" : "Marcar como principal"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={item.principal ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <button
                      className="btn btn-sm btn-primary btn-icon"
                      onClick={() => handleSaveCantidad(item)}
                      disabled={saving}
                      title="Guardar cantidad"
                      aria-label="Guardar cantidad"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    </button>
                    <Link to={`/productos/${item.producto_id}`} className="btn btn-sm btn-outline">
                      Ver
                    </Link>
                    <button
                      className="btn btn-sm btn-danger btn-icon"
                      onClick={() => handleRemove(item.producto_id)}
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};