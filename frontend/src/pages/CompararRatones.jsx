import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Compare.scss';

const getProductIcon = (tipo) => {
  switch (tipo) {
    case 'RATON': return 'RATÓN';
    case 'TECLADO': return 'TECL';
    case 'AURICULAR': return 'AUR';
    case 'MONITOR': return 'MON';
    case 'ALFOMBRA': return 'ALF';
    default: return tipo || '---';
  }
};

const parseExtraSpecs = (caracteristicas) => {
  if (!caracteristicas) return {};
  if (typeof caracteristicas.especificaciones_json === 'string') {
    try {
      return JSON.parse(caracteristicas.especificaciones_json) || {};
    } catch (error) {
      return {};
    }
  }
  return caracteristicas.especificaciones_json || {};
};

const buildTechnicalData = (producto, caracteristicas) => {
  const extraSpecs = parseExtraSpecs(caracteristicas);

  return {
    tipo: producto.tipo || 'Ratón',
    marca: producto.marca || 'Desconocida',
    modelo: producto.modelo || 'Sin modelo',
    conexion: caracteristicas?.conexion || producto.conexion || 'No disponible',
    sensor: caracteristicas?.sensor || extraSpecs.sensor || 'No disponible',
    dpi: caracteristicas?.dpi || extraSpecs.dpi || producto.dpi || 'No disponible',
    peso: caracteristicas?.peso || extraSpecs.peso || producto.peso || 'No disponible',
    dimensiones: caracteristicas?.dimensiones || extraSpecs.dimensiones || producto.dimensiones || 'No disponible',
    rgb: caracteristicas?.rgb ?? extraSpecs.rgb ?? producto.rgb ? 'Sí' : 'No',
    switch: caracteristicas?.switch || extraSpecs.switch || producto.switch || 'No disponible',
    polling: caracteristicas?.polling || extraSpecs.polling || producto.polling || 'No disponible',
    material: caracteristicas?.material || extraSpecs.material || producto.material || 'No disponible',
    serializedExtras: extraSpecs,
  };
};

const comparisonFields = [
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'conexion', label: 'Conexión' },
  { key: 'sensor', label: 'Sensor' },
  { key: 'dpi', label: 'DPI' },
  { key: 'peso', label: 'Peso' },
  { key: 'dimensiones', label: 'Dimensiones' },
  { key: 'switch', label: 'Switch' },
  { key: 'polling', label: 'Polling' },
  { key: 'material', label: 'Material' },
  { key: 'rgb', label: 'RGB' },
];

export const CompararRatones = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [miceList, setMiceList] = useState([]);
  const [selectedMouseId, setSelectedMouseId] = useState('');
  const [selectedMice, setSelectedMice] = useState([]);
  const [mouseDetails, setMouseDetails] = useState({});
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const inventoryMouse = useMemo(() => {
    const ratones = inventory.filter((item) => item.producto?.tipo === 'RATON');
    if (ratones.length === 0) return null;
    return ratones.find((item) => item.principal) ?? ratones[0];
  }, [inventory]);

  const selectedDetailRows = useMemo(() => {
    return selectedMice
      .map((id) => {
        const detail = mouseDetails[id];
        if (!detail) return null;
        return buildTechnicalData(detail.producto, detail.caracteristicas);
      })
      .filter(Boolean);
  }, [selectedMice, mouseDetails]);

  const fetchMice = async () => {
    try {
      const response = await api.get('/productos', { params: { tipo: 'RATON', per_page: 1000 } });
      const data = response.data?.data ?? response.data;
      setMiceList(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error('Error al cargar ratones:', fetchError);
      setError('No se pudo cargar la lista de ratones en este momento.');
    }
  };

  const fetchInventory = async () => {
    if (!isAuthenticated) {
      setInventory([]);
      return;
    }

    try {
      const response = await api.get('/inventario');
      const data = response.data?.data ?? response.data;
      setInventory(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error('Error al cargar inventario:', fetchError);
      setInventory([]);
    }
  };

  const fetchMouseDetailsById = async (mouseId) => {
    const detail = { producto: null, caracteristicas: null };
    const [productoRes, specsRes] = await Promise.allSettled([
      api.get(`/productos/${mouseId}`),
      api.get(`/productos/${mouseId}/caracteristicas-detalladas`),
    ]);

    if (productoRes.status === 'fulfilled') {
      detail.producto = productoRes.value.data;
    }

    if (specsRes.status === 'fulfilled') {
      detail.caracteristicas = specsRes.value.data;
    } else if (specsRes.status === 'rejected' && specsRes.reason.response?.status !== 404) {
      console.error('Error al cargar especificaciones detalladas:', specsRes.reason);
    }

    return detail;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMice(), fetchInventory()]);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    const idsToLoad = selectedMice.filter((id) => !mouseDetails[id]);
    if (idsToLoad.length === 0) return;

    const loadDetails = async () => {
      setLoadingDetails(true);
      const resolved = {};
      await Promise.all(
        idsToLoad.map(async (id) => {
          try {
            const detail = await fetchMouseDetailsById(id);
            resolved[id] = detail;
          } catch (err) {
            console.error('Error cargando detalle del ratón:', err);
          }
        })
      );
      setMouseDetails((prev) => ({ ...prev, ...resolved }));
      setLoadingDetails(false);
    };

    loadDetails();
  }, [selectedMice, mouseDetails]);

  useEffect(() => {
    if (!inventoryMouse) return;
    if (mouseDetails[inventoryMouse.producto_id]) return;

    const loadInventoryMouseDetail = async () => {
      try {
        const detail = await fetchMouseDetailsById(inventoryMouse.producto_id);
        setMouseDetails((prev) => ({ ...prev, [inventoryMouse.producto_id]: detail }));
      } catch (err) {
        console.error('Error cargando detalle del ratón de inventario:', err);
      }
    };
    loadInventoryMouseDetail();
  }, [inventoryMouse, mouseDetails]);

  const handleAddMouse = () => {
    if (!selectedMouseId) {
      setMessage('Selecciona un ratón para comparar.');
      return;
    }

    if (selectedMice.includes(selectedMouseId)) {
      setMessage('Ya has añadido ese ratón a la comparación.');
      return;
    }

    if (selectedMice.length >= 3) {
      setMessage('Puedes comparar hasta 3 ratones a la vez.');
      return;
    }

    setSelectedMice((prev) => [...prev, selectedMouseId]);
    setSelectedMouseId('');
    setMessage('Ratón añadido para comparación.');
  };

  const handleRemoveMouse = (mouseId) => {
    setSelectedMice((prev) => prev.filter((id) => id !== mouseId));
    setMessage('Ratón eliminado de la comparación.');
  };

  const renderSpecs = (detail) => {
    const specs = parseExtraSpecs(detail.caracteristicas);
    const rows = [];

    if (detail.caracteristicas) {
      Object.entries(detail.caracteristicas).forEach(([key, value]) => {
        if (key === 'especificaciones_json') return;
        rows.push({ label: key.replace(/_/g, ' '), value });
      });
    }

    Object.entries(specs).forEach(([field, value]) => {
      rows.push({ label: field.replace(/_/g, ' '), value });
    });

    if (rows.length === 0) {
      return <p className="no-specs">No hay datos extendidos disponibles para este ratón.</p>;
    }

    return (
      <div className="extended-specs">
        {rows.map((spec) => (
          <div key={spec.label} className="spec-row">
            <span>{spec.label}</span>
            <strong>{spec.value ?? '—'}</strong>
          </div>
        ))}
      </div>
    );
  };

  const inventorySummary = inventoryMouse && mouseDetails[inventoryMouse.producto_id]
    ? buildTechnicalData(
        mouseDetails[inventoryMouse.producto_id].producto,
        mouseDetails[inventoryMouse.producto_id].caracteristicas
      )
    : null;

  return (
    <div className="comparar-ratones-page">
      <header className="page-header">
        <div>
          <h1>Comparador de Ratones</h1>
          <p>Agrega ratones de la base de datos y compara sus especificaciones técnicas de forma visual.</p>
        </div>
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
      </header>

      <section className="compare-actions-card">
        <div className="compare-add-panel">
          <button className="btn btn-primary plus-button" onClick={handleAddMouse}>
            + Añadir ratón
          </button>

          <select
            value={selectedMouseId}
            onChange={(e) => setSelectedMouseId(e.target.value)}
            className="mouse-selector"
          >
            <option value="">Selecciona un ratón de la base de datos</option>
            {miceList.map((mouse) => (
              <option key={mouse.id} value={mouse.id}>
                {mouse.marca} {mouse.modelo}
              </option>
            ))}
          </select>
        </div>

        <div className="compare-info-panel">
          <p>Selecciona hasta 3 ratones para comparar su rendimiento, sensor, conectividad y datos extendidos.</p>
          <p className="hint">
            Si tienes un ratón guardado en tu inventario, aparecerá como referencia en el resumen de tu ratón real.
          </p>
        </div>
      </section>

      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="comparison-grid">
        <div className="comparison-table-card">
          <h2>Comparativa técnica</h2>
          <div className="table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Características</th>
                  {selectedDetailRows.length > 0 ? selectedDetailRows.map((row, index) => (
                    <th key={index}>{`${row.marca} ${row.modelo}`}</th>
                  )) : (
                    <th colSpan={1}>Añade un ratón para comparar</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field) => (
                  <tr key={field.key}>
                    <td>{field.label}</td>
                    {selectedDetailRows.length > 0 ? selectedDetailRows.map((row, index) => (
                      <td key={`${field.key}-${index}`}>{row[field.key]}</td>
                    )) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="inventory-summary-card">
          <h2>Tu ratón real</h2>
          {inventorySummary ? (
            <div className="inventory-summary-content">
              <div className="inventory-summary-title">
                <span className="icon" style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.05em' }}>RATÓN</span>
                <div>
                  <strong>{inventorySummary.marca} {inventorySummary.modelo}</strong>
                  <p>{inventorySummary.tipo}</p>
                </div>
              </div>
              <div className="inventory-summary-list">
                <div>
                  <span>Conexión</span>
                  <strong>{inventorySummary.conexion}</strong>
                </div>
                <div>
                  <span>Sensor</span>
                  <strong>{inventorySummary.sensor}</strong>
                </div>
                <div>
                  <span>DPI</span>
                  <strong>{inventorySummary.dpi}</strong>
                </div>
                <div>
                  <span>Peso</span>
                  <strong>{inventorySummary.peso}</strong>
                </div>
              </div>
              <p className="inventory-summary-note">
                Este resumen se basa en el ratón tipo "RATON" que tienes guardado en tu inventario.
              </p>
            </div>
          ) : (
            <div className="empty-inventory-note">
              <p>No hay ratones en tu inventario para usar como referencia.</p>
              <Link to="/inventario" className="btn btn-primary">
                Añadir mi ratón
              </Link>
            </div>
          )}
        </aside>
      </section>

      <section className="mouse-cards-grid">
        {loading ? (
          <div className="loading-empty">Cargando ratones...</div>
        ) : selectedMice.length === 0 ? (
          <div className="empty-comparison">Añade ratones para comenzar la comparación.</div>
        ) : (
          selectedMice.map((mouseId) => {
            const detail = mouseDetails[mouseId];
            if (!detail) {
              return (
                <article key={mouseId} className="mouse-card loading-card">
                  <div className="mouse-card-loading">Cargando información...</div>
                </article>
              );
            }

            const extraSpecs = parseExtraSpecs(detail.caracteristicas);
            return (
              <article key={mouseId} className="mouse-card">
                <div className="mouse-card-header">
                  <div>
                    <span className="mouse-badge">{getProductIcon(detail.producto.tipo)}</span>
                    <h3>{detail.producto.marca} {detail.producto.modelo}</h3>
                    <p>{detail.producto.tipo}</p>
                  </div>
                  <button className="btn btn-outline remove-button" onClick={() => handleRemoveMouse(mouseId)}>
                    Eliminar
                  </button>
                </div>

                <p className="mouse-card-description">{detail.producto.descripcion || 'Sin descripción disponible.'}</p>

                <div className="mouse-card-specs">
                  <div>
                    <span>Conexión</span>
                    <strong>{detail.caracteristicas?.conexion || '—'}</strong>
                  </div>
                  <div>
                    <span>Sensor</span>
                    <strong>{detail.caracteristicas?.sensor || '—'}</strong>
                  </div>
                  <div>
                    <span>DPI</span>
                    <strong>{detail.caracteristicas?.dpi || '—'}</strong>
                  </div>
                  <div>
                    <span>Peso</span>
                    <strong>{detail.caracteristicas?.peso || '—'}</strong>
                  </div>
                </div>

                <div className="mouse-card-extended">
                  <h4>Datos extendidos</h4>
                  {Object.keys(extraSpecs).length === 0 && !detail.caracteristicas ? (
                    <p className="no-specs">No hay datos extendidos registrados.</p>
                  ) : (
                    <div className="extended-specs-grid">
                      {Object.entries(extraSpecs).map(([field, value]) => (
                        <div key={field} className="spec-item">
                          <span>{field.replace(/_/g, ' ')}</span>
                          <strong>{value ?? '—'}</strong>
                        </div>
                      ))}
                      {detail.caracteristicas && Object.entries(detail.caracteristicas)
                        .filter(([key]) => key !== 'especificaciones_json')
                        .map(([field, value]) => (
                          <div key={field} className="spec-item">
                            <span>{field.replace(/_/g, ' ')}</span>
                            <strong>{value ?? '—'}</strong>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};
