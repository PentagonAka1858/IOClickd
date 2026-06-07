import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Productos.scss';

export const Productos = () => {
  const { isAuthenticated } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [tipo, setTipo] = useState('');
  const [personalLists, setPersonalLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState('');
  const [activeListProductId, setActiveListProductId] = useState(null);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [listActionMessage, setListActionMessage] = useState('');
  const [listActionError, setListActionError] = useState('');
  const [inventoryProcessingId, setInventoryProcessingId] = useState(null);
  const [listProcessingId, setListProcessingId] = useState(null);

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

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (buscar) params.buscar = buscar;
        if (tipo) params.tipo = tipo;

        const response = await api.get('/productos', { params });
        
        // Paginado de Laravel tiene la estructura { data: [...], current_page: ... }
        if (response.data && response.data.data) {
          setProductos(response.data.data);
        } else {
          setProductos(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError('No se pudieron cargar los productos en este momento.');
      } finally {
        setLoading(false);
      }
    };

    // Agregar un debounce simple para la búsqueda
    const delayDebounceFn = setTimeout(() => {
      fetchProductos();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [buscar, tipo]);

  useEffect(() => {
    const fetchLists = async () => {
      if (!isAuthenticated) {
        setPersonalLists([]);
        return;
      }

      setListsLoading(true);
      setListsError('');
      try {
        const response = await api.get('/listas');
        const data = response.data?.data ?? response.data;
        setPersonalLists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar listas personales:', err);
        setListsError('No se pudieron cargar tus listas personales.');
      } finally {
        setListsLoading(false);
      }
    };

    fetchLists();
  }, [isAuthenticated]);

  const handleAddToInventory = async (producto) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setInventoryProcessingId(producto.id);
    try {
      await api.post('/inventario', {
        producto_id: producto.id,
        cantidad: 1,
        principal: false,
      });
      setError('');
      setListActionMessage(`Producto ${producto.modelo} añadido a tu inventario.`);
    } catch (err) {
      console.error('Error al agregar al inventario:', err);
      const backendMessage = err.response?.data?.message;
      setError(
        backendMessage === 'Este producto ya está en tu inventario.'
          ? 'Este producto ya está en tu inventario.'
          : 'No se pudo añadir el producto al inventario.'
      );
    } finally {
      setInventoryProcessingId(null);
    }
  };

  const toggleListMenu = (productoId) => {
    setActiveListProductId((prev) => (prev === productoId ? null : productoId));
    setShowCreateListForm(false);
    setListActionMessage('');
    setListActionError('');
  };

  const handleAddToExistingList = async (listaId, productoId) => {
    setListProcessingId(productoId);
    setListActionMessage('');
    setListActionError('');

    try {
      await api.post(`/listas/${listaId}/productos`, { producto_id: productoId });
      setListActionMessage('Producto añadido a la lista.');
      await api.get('/listas').then((response) => {
        const data = response.data?.data ?? response.data;
        setPersonalLists(Array.isArray(data) ? data : []);
      });
    } catch (err) {
      console.error('Error al añadir a la lista:', err);
      const backendMessage = err.response?.data?.message;
      setListActionError(
        backendMessage === 'Este producto ya está en la lista.'
          ? 'Este producto ya está en esa lista.'
          : 'No se pudo añadir el producto a la lista.'
      );
    } finally {
      setListProcessingId(null);
    }
  };

  const handleCreateList = async (productoId) => {
    if (!newListName.trim()) {
      setListActionError('El nombre de la lista es obligatorio.');
      return;
    }

    setListProcessingId(productoId);
    setListActionMessage('');
    setListActionError('');

    try {
      const createResponse = await api.post('/listas', {
        nombre_lista: newListName.trim(),
        descripcion: newListDescription.trim(),
        publica: false,
      });

      const lista = createResponse.data;
      await api.post(`/listas/${lista.id}/productos`, { producto_id: productoId });

      setPersonalLists((prev) => [lista, ...prev]);
      setNewListName('');
      setNewListDescription('');
      setShowCreateListForm(false);
      setListActionMessage('Lista creada y producto añadido correctamente.');
    } catch (err) {
      console.error('Error al crear lista personal:', err);
      setListActionError('No se pudo crear la lista. Intenta de nuevo.');
    } finally {
      setListProcessingId(null);
    }
  };

  return (
    <div className="productos-page">
      <header className="page-header">
        <h1>Catálogo de Productos</h1>
        <p>Encuentra y analiza los mejores periféricos y componentes gaming</p>
      </header>

      {/* Barra de filtros */}
      <section className="filters-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por marca o modelo..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            <option value="RATON">Ratones</option>
            <option value="TECLADO">Teclados</option>
            <option value="AURICULAR">Auriculares</option>
            <option value="MONITOR">Monitores</option>
            <option value="ALFOMBRILLA">Alfombrillas</option>
            <option value="OTRO">Otros</option>
          </select>
        </div>
      </section>

      {/* Grid de productos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ textAlign: 'center', padding: '2rem' }}>
          {error}
        </div>
      ) : productos.length === 0 ? (
        <div className="no-products">
          <h3>No se encontraron productos</h3>
          <p>Prueba a cambiar los filtros de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((producto) => (
            <article key={producto.id} className="producto-card">
              <div className="card-image-wrapper">
                {producto.foto ? (
                  <img 
                    src={`http://localhost:8000/storage/${producto.foto}`} 
                    alt={`${producto.marca} ${producto.modelo}`} 
                    className="card-image"
                  />
                ) : (
                  <div className={`card-image-placeholder ${producto.tipo.toLowerCase()}`}>
                    {getProductIcon(producto.tipo)}
                  </div>
                )}
                <span className={`card-type-badge ${producto.tipo.toLowerCase()}`}>
                  {producto.tipo}
                </span>
              </div>
              
              <div className="card-content">
                <span className="brand">{producto.marca}</span>
                <h3>{producto.modelo}</h3>
                <p className="description">{producto.descripcion || 'Sin descripción disponible.'}</p>
                
                <div className="card-actions">
                  <Link to={`/productos/${producto.id}`} className="btn-view">
                    Ver Detalles <span>→</span>
                  </Link>
                  {isAuthenticated && (
                    <>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleAddToInventory(producto)}
                        disabled={inventoryProcessingId === producto.id}
                      >
                        {inventoryProcessingId === producto.id ? 'Agregando...' : 'Añadir al inventario'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => toggleListMenu(producto.id)}
                        type="button"
                      >
                        Listas
                      </button>
                    </>
                  )}
                </div>

                {activeListProductId === producto.id && (
                  <div className="list-popup">
                    {listActionMessage && <div className="alert alert-success">{listActionMessage}</div>}
                    {listActionError && <div className="alert alert-danger">{listActionError}</div>}
                    <div className="list-popup-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        onClick={() => setShowCreateListForm((prev) => !prev)}
                      >
                        {showCreateListForm ? 'Cancelar' : 'Crear nueva lista'}
                      </button>
                    </div>

                    {showCreateListForm && (
                      <div className="create-list-form">
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
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          onClick={() => handleCreateList(producto.id)}
                          disabled={listProcessingId === producto.id}
                        >
                          {listProcessingId === producto.id ? 'Creando...' : 'Crear lista y añadir'}
                        </button>
                      </div>
                    )}

                    <div className="existing-lists">
                      {listsLoading ? (
                        <p>Cargando tus listas...</p>
                      ) : personalLists.length > 0 ? (
                        <>
                          <h4>Selecciona una lista</h4>
                          <div className="lists-grid">
                            {personalLists.map((lista) => (
                              <button
                                key={lista.id}
                                className="btn btn-outline btn-sm"
                                type="button"
                                onClick={() => handleAddToExistingList(lista.id, producto.id)}
                                disabled={listProcessingId === producto.id}
                              >
                                {lista.nombre_lista} ({lista.productos_count ?? lista.productos?.length ?? 0})
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="empty-lists">Aún no tienes listas personales. Crea una nueva lista para empezar.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
