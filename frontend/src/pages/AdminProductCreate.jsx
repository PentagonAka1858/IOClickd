import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Admin.scss';

export const AdminProductCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Datos del producto
  const [productData, setProductData] = useState({
    marca: '',
    modelo: '',
    tipo: 'RATON',
    descripcion: '',
    fecha_salida: '',
  });
  const [foto, setFoto] = useState(null);

  // Si no es admin, redirige (en teoría ya está protegido por el router, pero por seguridad)
  if (user?.rol !== 'ADMIN') {
    navigate('/');
    return null;
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('marca', productData.marca);
      formData.append('modelo', productData.modelo);
      formData.append('tipo', productData.tipo);
      if (productData.descripcion) formData.append('descripcion', productData.descripcion);
      if (productData.fecha_salida) formData.append('fecha_salida', productData.fecha_salida);
      if (foto) formData.append('foto', foto);

      const response = await api.post(`/productos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Producto creado correctamente. Redirigiendo a edición...');
      // Redirigir al modo edición del producto recién creado para que pueda añadir características detalladas
      setTimeout(() => {
        navigate(`/admin/productos/${response.data.id}/edit`);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError('Error al crear el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="admin-header" style={{ marginBottom: '2rem' }}>
        <h1>Crear Nuevo Producto</h1>
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
          <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Marca</label>
                <input required type="text" value={productData.marca} onChange={e => setProductData({...productData, marca: e.target.value})} placeholder="Ej. Logitech" />
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input required type="text" value={productData.modelo} onChange={e => setProductData({...productData, modelo: e.target.value})} placeholder="Ej. G Pro X Superlight" />
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
              <textarea rows="4" value={productData.descripcion} onChange={e => setProductData({...productData, descripcion: e.target.value})} placeholder="Descripción del producto..." />
            </div>

            <div className="form-group">
              <label>Foto del producto (Opcional)</label>
              <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Producto'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};
