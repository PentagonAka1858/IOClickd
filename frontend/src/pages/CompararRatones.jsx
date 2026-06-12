import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Compare.scss';

const getProductIcon = (tipo) => {
  switch (tipo) {
    case 'RATON': return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="7"></rect>
        <path d="M12 2v10"></path>
        <path d="M5 10h14"></path>
      </svg>
    );
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

const getVal = (obj, keys) => {
  if (!obj) return null;
  const lowerKeys = keys.map(k => k.toLowerCase());
  const foundKey = Object.keys(obj).find(k => lowerKeys.includes(k.toLowerCase()));
  return foundKey ? obj[foundKey] : null;
};

const buildTechnicalData = (producto, caracteristicas) => {
  const extraSpecs = parseExtraSpecs(caracteristicas);
  const allSpecs = { ...caracteristicas, ...extraSpecs };

  return {
    tipo: producto.tipo || 'Ratón',
    marca: producto.marca || 'Desconocida',
    modelo: producto.modelo || 'Sin modelo',
    conexion: getVal(allSpecs, ['conexion', 'conectividad', 'conexión']) || producto.conexion || 'No disponible',
    sensor: getVal(allSpecs, ['sensor', 'modelo de sensor']) || 'No disponible',
    dpi: getVal(allSpecs, ['dpi', 'resolucion', 'resolución', 'sensibilidad', 'sensibilidad máxima']) || producto.dpi || 'No disponible',
    peso: getVal(allSpecs, ['peso', 'peso (g)']) || producto.peso || 'No disponible',
    dimensiones: getVal(allSpecs, ['dimensiones', 'tamaño']) || producto.dimensiones || 'No disponible',
    rgb: getVal(allSpecs, ['rgb', 'iluminacion', 'iluminación']) ?? producto.rgb ? 'Sí' : 'No',
    switch: getVal(allSpecs, ['switch', 'interruptores', 'tipo de switch']) || producto.switch || 'No disponible',
    polling: getVal(allSpecs, ['polling', 'polling rate', 'tasa de sondeo']) || producto.polling || 'No disponible',
    material: getVal(allSpecs, ['material', 'materiales']) || producto.material || 'No disponible',
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
  const navigate = useNavigate();
  const [miceList, setMiceList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMouseId, setSelectedMouseId] = useState('');
  const [selectedMice, setSelectedMice] = useState([]);
  const [mouseDetails, setMouseDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedDetailRows = useMemo(() => {
    return selectedMice
      .map((id) => {
        const detail = mouseDetails[id];
        if (!detail) return null;
        return {
          id,
          ...buildTechnicalData(detail.producto, detail.caracteristicas)
        };
      })
      .filter(Boolean);
  }, [selectedMice, mouseDetails]);

  const filteredMice = useMemo(() => {
    if (!searchQuery.trim()) return miceList;
    const lower = searchQuery.toLowerCase();
    return miceList.filter(m => `${m.marca} ${m.modelo}`.toLowerCase().includes(lower));
  }, [miceList, searchQuery]);

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
      await fetchMice();
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

  return (
    <div className="consultas-page comparar-ratones-page">
      <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás" style={{ marginBottom: '1.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      <header className="page-header header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Comparador de Ratones</h1>
          <p className="page-subtitle">Agrega ratones de la base de datos y compara sus especificaciones técnicas de forma visual.</p>
        </div>
      </header>

      <section className="compare-actions-card">
        <div className="compare-add-panel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleAddMouse}>
            + Añadir ratón
          </button>

          <input
            type="text"
            className="search-input"
            placeholder="Buscar ratón..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
          />

          <select
            value={selectedMouseId}
            onChange={(e) => setSelectedMouseId(e.target.value)}
            className="mouse-selector"
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: '250px' }}
          >
            <option value="">Selecciona un ratón de la base de datos</option>
            {filteredMice.map((mouse) => (
              <option key={mouse.id} value={mouse.id}>
                {mouse.marca} {mouse.modelo}
              </option>
            ))}
          </select>
        </div>

        <div className="compare-info-panel" style={{ marginTop: '1rem' }}>
          <p>Selecciona hasta 3 ratones para comparar su rendimiento, sensor, conectividad y datos extendidos.</p>
        </div>
      </section>

      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="comparison-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="comparison-table-card">
          <h2>Comparativa técnica</h2>
          <div className="table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Características</th>
                  {selectedDetailRows.length > 0 ? selectedDetailRows.map((row, index) => (
                    <th key={index} style={{ position: 'relative', paddingRight: '2.5rem' }}>
                      {`${row.marca} ${row.modelo}`}
                      <button
                        onClick={() => handleRemoveMouse(row.id)}
                        className="btn btn-danger"
                        style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </th>
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
      </section>

      <section className="mouse-cards-grid" style={{ marginTop: '2rem' }}>
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
            const techData = buildTechnicalData(detail.producto, detail.caracteristicas);
            return (
              <article key={mouseId} className="mouse-card">
                <div className="mouse-card-header">
                  <div>
                    <span className="mouse-badge">{getProductIcon(detail.producto.tipo)}</span>
                    <h3>{detail.producto.marca} {detail.producto.modelo}</h3>
                    <p>{detail.producto.tipo}</p>
                  </div>
                  <button className="btn btn-danger" onClick={() => handleRemoveMouse(mouseId)}>
                    Eliminar
                  </button>
                </div>

                <p className="mouse-card-description">{detail.producto.descripcion || 'Sin descripción disponible.'}</p>

                <div className="mouse-card-specs">
                  <div>
                    <span>Conexión</span>
                    <strong>{techData.conexion !== 'No disponible' ? techData.conexion : '—'}</strong>
                  </div>
                  <div>
                    <span>Sensor</span>
                    <strong>{techData.sensor !== 'No disponible' ? techData.sensor : '—'}</strong>
                  </div>
                  <div>
                    <span>DPI</span>
                    <strong>{techData.dpi !== 'No disponible' ? techData.dpi : '—'}</strong>
                  </div>
                  <div>
                    <span>Peso</span>
                    <strong>{techData.peso !== 'No disponible' ? techData.peso : '—'}</strong>
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
