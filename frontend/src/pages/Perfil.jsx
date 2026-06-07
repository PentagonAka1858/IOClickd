import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Perfil.scss';

export const Perfil = () => {
  const { user, setUser } = useAuth();
  const [nombre, setNombre] = useState('');
  const [idiomaPreferido, setIdiomaPreferido] = useState('es');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setIdiomaPreferido(user.idioma_preferido || 'es');
      setFotoPreview(user.foto ? `http://localhost:8000/storage/${user.foto}` : '/user.placeholder.png');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('El archivo seleccionado debe ser una imagen.');
        return;
      }
      if (file.size > 2048 * 1024) {
        setError('La imagen no debe superar los 2MB.');
        return;
      }
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('idioma_preferido', idiomaPreferido);
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      const response = await api.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setMessage('Perfil actualizado correctamente.');
      setFotoFile(null);
    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="perfil-page">
      <header className="page-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona la información de tu cuenta y personaliza tu perfil</p>
      </header>

      <div className="perfil-container">
        {/* Lado izquierdo: Avatar y Detalles básicos */}
        <section className="perfil-sidebar">
          <div className="avatar-card">
            <div className="avatar-preview-container" onClick={handleAvatarClick} title="Haga clic para cambiar la foto">
              <img src={fotoPreview} alt="Avatar de usuario" className="profile-avatar-large" />
              <div className="avatar-overlay">
                <span>Cambiar Foto</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <h3>{user?.nombre}</h3>
            <span className={`role-badge ${user?.rol?.toLowerCase()}`}>{user?.rol}</span>
          </div>

          <div className="info-card">
            <h4>Información de la Cuenta</h4>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Miembro desde:</span>
              <span className="info-value">{formatDate(user?.created_at)}</span>
            </div>
          </div>
        </section>

        {/* Lado derecho: Formulario de Edición */}
        <section className="perfil-form-card">
          <h2>Editar Perfil</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="perfil-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="idioma_preferido">Idioma preferido</label>
              <select
                id="idioma_preferido"
                value={idiomaPreferido}
                onChange={(e) => setIdiomaPreferido(e.target.value)}
              >
                <option value="es">Español (es)</option>
                <option value="en">Inglés (en)</option>
                <option value="fr">Francés (fr)</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
