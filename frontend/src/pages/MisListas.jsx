import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/MisListas.scss';

export const MisListas = () => {
  const { isAuthenticated } = useAuth();
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteProcessingId, setDeleteProcessingId] = useState(null);

  const fetchListas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/listas');
      const data = response.data?.data ?? response.data;
      setListas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar listas personales:', err);
      setError('No se pudieron cargar tus listas personales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchListas();
  }, [isAuthenticated]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setFormError('El nombre de la lista es obligatorio.');
      return;
    }

    setCreating(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/listas', {
        nombre_lista: newListName.trim(),
        descripcion: newListDescription.trim(),
        publica: false,
      });

      setListas((prev) => [response.data, ...prev]);
      setSuccessMessage('Lista creada correctamente.');
      setNewListName('');
      setNewListDescription('');
    } catch (err) {
      console.error('Error al crear lista personal:', err);
      setFormError('No se pudo crear la lista. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (lista) => {
    setEditingListId(lista.id);
    setEditName(lista.nombre_lista);
    setEditDescription(lista.descripcion || '');
    setEditPublic(!!lista.publica);
    setSuccessMessage('');
    setFormError('');
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditName('');
    setEditDescription('');
    setEditPublic(false);
    setFormError('');
  };

  const handleUpdateList = async (listaId) => {
    if (!editName.trim()) {
      setFormError('El nombre de la lista es obligatorio.');
      return;
    }

    setUpdating(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const response = await api.put(`/listas/${listaId}`, {
        nombre_lista: editName.trim(),
        descripcion: editDescription.trim(),
        publica: editPublic,
      });

      setListas((prev) => prev.map((lista) => (lista.id === listaId ? response.data : lista)));
      setSuccessMessage('Lista actualizada correctamente.');
      handleCancelEdit();
    } catch (err) {
      console.error('Error al actualizar lista personal:', err);
      setFormError('No se pudo actualizar la lista. Intenta de nuevo.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteList = async (listaId) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta lista? Esta acción no se puede deshacer.');
    if (!confirmed) {
      return;
    }

    setDeleteProcessingId(listaId);
    setSuccessMessage('');
    setFormError('');

    try {
      await api.delete(`/listas/${listaId}`);
      setListas((prev) => prev.filter((lista) => lista.id !== listaId));
      setSuccessMessage('Lista eliminada correctamente.');
      if (editingListId === listaId) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error('Error al eliminar lista personal:', err);
      setFormError('No se pudo eliminar la lista. Intenta de nuevo.');
    } finally {
      setDeleteProcessingId(null);
    }
  };

  return (
    <div className="listas-page">
      <header className="page-header header-row">
        <div>
          <h1>Mis Listas</h1>
          <p className="page-subtitle">Agrupa productos y gestiona tus colecciones.</p>
        </div>
      </header>

      {error && <div className="alert alert-danger mb-md">{error}</div>}
      {successMessage && <div className="alert alert-success mb-md">{successMessage}</div>}

      {/* Create list form */}
      <section className="card mb-xl">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Crear nueva lista</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div className="form-group">
            <label>Nombre de la lista</label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ej. Lista de la PC principal"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              placeholder="Descripción opcional"
            />
          </div>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <button className="btn btn-primary" onClick={handleCreateList} disabled={creating}>
            {creating ? 'Creando…' : '+ Crear lista'}
          </button>
        </div>
      </section>

      {/* Lists grid */}
      <section>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 900 }}>Listas guardadas</h2>
        {loading ? (
          <div className="loading-container"><div className="spinner" /><span>Cargando…</span></div>
        ) : listas.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes listas aún</h3>
            <p>Crea una lista para agrupar y seguir tus productos favoritos.</p>
          </div>
        ) : (
          <div className="lists-grid">
            {listas.map((lista) => (
              <article key={lista.id} className="lista-card">
                {editingListId === lista.id ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </div>
                    <label className="form-check">
                      <input type="checkbox" checked={editPublic} onChange={(e) => setEditPublic(e.target.checked)} />
                      <span>Lista pública</span>
                    </label>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-primary" type="button" onClick={() => handleUpdateList(lista.id)} disabled={updating}>
                        {updating ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                      <button className="btn btn-sm btn-outline" type="button" onClick={handleCancelEdit} disabled={updating}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{lista.nombre_lista}</h3>
                    <p className="lista-meta">{lista.productos_count ?? 0} productos • {lista.publica ? 'Pública' : 'Privada'}</p>
                    <span className="lista-count">{lista.publica ? 'Pública' : 'Privada'}</span>
                    <div className="btn-group" style={{ marginTop: '1rem' }}>
                      <Link className="btn btn-sm btn-primary" to={`/listas/${lista.id}`}>Ver</Link>
                      <button className="btn btn-sm btn-outline" type="button" onClick={() => handleStartEdit(lista)}>Editar</button>
                      <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDeleteList(lista.id)} disabled={deleteProcessingId === lista.id}>
                        {deleteProcessingId === lista.id ? '…' : 'Eliminar'}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};