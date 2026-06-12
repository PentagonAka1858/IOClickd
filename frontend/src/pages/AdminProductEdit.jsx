import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Admin.scss';

export const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Datos del producto
  const [productData, setProductData] = useState({
    marca: '',
    modelo: '',
    tipo: 'RATON',
    descripcion: '',
    fecha_salida: '',
    foto_actual: null,
  });
  const [foto, setFoto] = useState(null);

  // 2. Características detalladas
  const [caracteristicas, setCaracteristicas] = useState({
    dimensiones: '',
    peso: '',
    conexion: '',
    color: '',
  });
  // Extra fields that we will turn into especificaciones_json
  const [extraSpecs, setExtraSpecs] = useState([{ key: '', value: '' }]);

  // 3. Datos Reales
  const [realData, setRealData] = useState([]);

  // 4. Reseñas
  const [resenias, setResenias] = useState([]);
  
  // Pagination
  const [pageResenias, setPageResenias] = useState(1);
  const [pageRealData, setPageRealData] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user?.rol !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchData();
  }, [id, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const prodRes = await api.get(`/productos/${id}`);
      const p = prodRes.data;
      setProductData({
        marca: p.marca || '',
        modelo: p.modelo || '',
        tipo: p.tipo || 'RATON',
        descripcion: p.descripcion || '',
        fecha_salida: p.fecha_salida ? p.fecha_salida.split('T')[0] : '',
        foto_actual: p.foto || null,
      });

      try {
        const specsRes = await api.get(`/productos/${id}/caracteristicas-detalladas`);
        const c = specsRes.data;
        setCaracteristicas({
          dimensiones: c.dimensiones || '',
          peso: c.peso || '',
          conexion: c.conexion || '',
          color: c.color || '',
        });
        if (c.especificaciones_json) {
          try {
            const parsed = JSON.parse(c.especificaciones_json);
            const extra = Object.keys(parsed).map(k => ({ key: k, value: parsed[k] }));
            if (extra.length > 0) setExtraSpecs(extra);
          } catch (e) {
            console.error('Error parsing especificaciones_json', e);
          }
        }
      } catch (err) {
        // Ignorar si no tiene características 404
      }

      try {
        const realRes = await api.get(`/productos/${id}/caracteristicas-reales`);
        setRealData(realRes.data.data || []);
      } catch (err) {}

      try {
        const reviewsRes = await api.get(`/productos/${id}/resenias?limit=1000`);
        setResenias(reviewsRes.data.data || []);
      } catch (err) {}

    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('marca', productData.marca);
      formData.append('modelo', productData.modelo);
      formData.append('tipo', productData.tipo);
      if (productData.descripcion) formData.append('descripcion', productData.descripcion);
      if (productData.fecha_salida) formData.append('fecha_salida', productData.fecha_salida);
      if (foto) formData.append('foto', foto);

      await api.post(`/productos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Datos básicos actualizados correctamente.');
    } catch (err) {
      console.error(err);
      setError('Error al actualizar datos básicos.');
    }
  };

  const handleUpdateCaracteristicas = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const extraJson = {};
      extraSpecs.forEach(item => {
        if (item.key && item.value) {
          extraJson[item.key] = item.value;
        }
      });

      await api.post(`/productos/${id}/caracteristicas-detalladas`, {
        ...caracteristicas,
        especificaciones_json: Object.keys(extraJson).length > 0 ? JSON.stringify(extraJson) : null
      });
      setSuccess('Características detalladas actualizadas.');
    } catch (err) {
      console.error(err);
      setError('Error al actualizar características detalladas.');
    }
  };

  const handleDeleteRealData = async (dataId) => {
    if (!window.confirm('¿Eliminar este dato real?')) return;
    try {
      await api.delete(`/caracteristicas-reales/${dataId}`);
      setRealData(prev => prev.filter(d => d.id !== dataId));
      setSuccess('Dato real eliminado.');
    } catch (err) {
      setError('Error al eliminar dato real.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    try {
      await api.delete(`/resenias/${reviewId}`);
      setResenias(prev => prev.filter(r => r.id !== reviewId));
      setSuccess('Reseña eliminada.');
    } catch (err) {
      setError('Error al eliminar reseña.');
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

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-header"><h2>Cargando Producto...</h2></div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="admin-header" style={{ marginBottom: '2rem' }}>
        <h1>Editar Producto: {productData.marca} {productData.modelo}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin')}>
          Volver al Panel
        </button>
      </header>

      {error && <div className="alert alert-danger mb-md">{error}</div>}
      {success && <div className="alert alert-success mb-md">{success}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Datos Básicos */}
        <section className="card mb-xl">
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Datos Básicos</h2>
          <form onSubmit={handleUpdateProduct} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Marca</label>
                <input required type="text" value={productData.marca} onChange={e => setProductData({...productData, marca: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input required type="text" value={productData.modelo} onChange={e => setProductData({...productData, modelo: e.target.value})} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Tipo</label>
                <select value={productData.tipo} onChange={e => setProductData({...productData, tipo: e.target.value})}>
                  <option value="RATON">Ratón</option>
                  <option value="TECLADO">Teclado</option>
                  <option value="AURICULAR">Auricular</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="ALFOMBRILLA">Alfombrilla</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de salida</label>
                <input type="date" value={productData.fecha_salida} onChange={e => setProductData({...productData, fecha_salida: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea rows="4" value={productData.descripcion} onChange={e => setProductData({...productData, descripcion: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Foto del producto (Opcional - dejar en blanco para mantener actual)</label>
              {productData.foto_actual && (
                <div style={{ marginBottom: '1rem' }}>
                  <img src={`http://localhost:8000/storage/${productData.foto_actual}`} alt="Foto actual" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '1rem' }}>
              Guardar Datos Básicos
            </button>
          </form>
        </section>

        {/* Características Detalladas */}
        <section className="card mb-xl">
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Características Detalladas</h2>
          <form onSubmit={handleUpdateCaracteristicas} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Dimensiones</label>
                <input type="text" value={caracteristicas.dimensiones} onChange={e => setCaracteristicas({...caracteristicas, dimensiones: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Peso</label>
                <input type="text" value={caracteristicas.peso} onChange={e => setCaracteristicas({...caracteristicas, peso: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Conexión</label>
                <input type="text" value={caracteristicas.conexion} onChange={e => setCaracteristicas({...caracteristicas, conexion: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="text" value={caracteristicas.color} onChange={e => setCaracteristicas({...caracteristicas, color: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Especificaciones Adicionales</h4>
              {extraSpecs.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input type="text" placeholder="Clave (ej. Sensor)" value={item.key} onChange={e => {
                    const newSpecs = [...extraSpecs];
                    newSpecs[index].key = e.target.value;
                    setExtraSpecs(newSpecs);
                  }} style={{ flex: 1 }} />
                  <input type="text" placeholder="Valor (ej. Óptico)" value={item.value} onChange={e => {
                    const newSpecs = [...extraSpecs];
                    newSpecs[index].value = e.target.value;
                    setExtraSpecs(newSpecs);
                  }} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => {
                    setExtraSpecs(extraSpecs.filter((_, i) => i !== index));
                  }}>X</button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline mt-sm" onClick={() => setExtraSpecs([...extraSpecs, { key: '', value: '' }])}>
                + Añadir Otra
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '1rem' }}>
              Guardar Características
            </button>
          </form>
        </section>

        {/* Datos Reales */}
        <section className="card mb-xl">
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Gestión de Datos Reales Aportados</h2>
          {realData.length === 0 ? (
            <p className="text-muted">No hay datos reales para este producto.</p>
          ) : (
            <div className="table-container admin-panel">
              <table className="neo-table" style={{ width: '100%' }}>
                <thead>
                  <tr><th>Usuario</th><th>Atributo</th><th>Valor</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {realData.slice((pageRealData - 1) * itemsPerPage, pageRealData * itemsPerPage).map(d => (
                    <tr key={d.id}>
                      <td>{d.user?.nombre || d.user_id}</td>
                      <td>{d.atributo}</td>
                      <td>{d.valor}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRealData(d.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(pageRealData, setPageRealData, realData.length)}
            </div>
          )}
        </section>

        {/* Reseñas */}
        <section className="card mb-xl">
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Gestión de Reseñas</h2>
          {resenias.length === 0 ? (
            <p className="text-muted">No hay reseñas para este producto.</p>
          ) : (
            <div className="table-container admin-panel">
              <table className="neo-table" style={{ width: '100%' }}>
                <thead>
                  <tr><th>Usuario</th><th>Puntuación</th><th>Visible</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {resenias.slice((pageResenias - 1) * itemsPerPage, pageResenias * itemsPerPage).map(r => (
                    <tr key={r.id}>
                      <td>{r.user?.nombre || 'Anónimo'}</td>
                      <td>{r.puntuacion} / 10</td>
                      <td>{r.visible ? 'Sí' : 'No'}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReview(r.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(pageResenias, setPageResenias, resenias.length)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
