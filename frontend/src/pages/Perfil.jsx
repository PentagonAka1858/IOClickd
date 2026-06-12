import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Perfil.scss';

export const Perfil = () => {
  const { user, setUser } = useAuth();
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [idiomaPreferido, setIdiomaPreferido] = useState('es');
  const [email, setEmail] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [visibilidad, setVisibilidad] = useState(true);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setIdiomaPreferido(user.idioma_preferido || 'es');
      setVisibilidad(typeof user.visibilidad === 'boolean' ? user.visibilidad : true);
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
      formData.append('username', username.trim() || '');
      formData.append('email', email.trim());
      formData.append('visibilidad', visibilidad ? 1 : 0);
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      const response = await api.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const respUser = response.data.user ?? response.data;
      setUser(respUser);
      if (response.data.email_verification_sent) {
        setMessage('Perfil actualizado. Se ha enviado un email de verificación al nuevo correo.');
      } else {
        setMessage('Perfil actualizado correctamente.');
      }
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
        <p className="page-subtitle">Gestiona tu información y personaliza tu cuenta</p>
      </header>

      <div className="perfil-grid">
        {/* Sidebar */}
        <aside className="perfil-sidebar">
          <div className="avatar-card">
            <div className="avatar-wrap" onClick={handleAvatarClick} style={{ cursor: 'pointer' }} title="Cambiar foto">
              <img src={fotoPreview} alt="Avatar" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            <h2>{user?.nombre}</h2>
            <span className="user-role">{user?.rol}</span>
          </div>

          <div className="card">
            <p style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Cuenta
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>Email:</strong> {user?.email}</p>
            <p style={{ fontSize: '0.85rem' }}><strong>Miembro desde:</strong> {formatDate(user?.created_at)}</p>
          </div>
        </aside>

        {/* Form */}
        <div className="perfil-form-section">
          <div className="section-header">
            <h3>Editar Perfil</h3>
          </div>
          <div className="section-body">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo</label>
                <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Tu nombre completo" />
              </div>
              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nombre_usuario" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
              </div>
              <div className="form-group">
                <label htmlFor="idioma_preferido">Idioma preferido</label>
                <select id="idioma_preferido" value={idiomaPreferido} onChange={(e) => setIdiomaPreferido(e.target.value)}>
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="fr">Francés</option>
                </select>
              </div>
              <label className="form-check">
                <input type="checkbox" checked={visibilidad} onChange={(e) => setVisibilidad(e.target.checked)} />
                <span>Perfil público</span>
              </label>
              <button type="submit" className={`btn btn-primary${saving ? ' btn-loading' : ''}`} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};