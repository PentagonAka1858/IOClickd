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
    <div className="mis-listas-page">
      <header className="mis-listas-header">
        <div>
          <h1>Mis Listas Personales</h1>
          <p>Administra tus listas de productos guardadas y revisa qué productos has agrupado.</p>
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <section className="create-list-card">
        <h2>Crear nueva lista</h2>
        <p>Organiza productos en listas para darle seguimiento a tus intereses.</p>

        <div className="form-row">
          <label>Nombre de la lista</label>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Ej. Lista de la PC principal"
          />
        </div>

        <div className="form-row">
          <label>Descripción</label>
          <textarea
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
            placeholder="Descripción opcional"
          />
        </div>

        {formError && <div className="form-error">{formError}</div>}

        <button className="btn btn-primary" onClick={handleCreateList} disabled={creating}>
          {creating ? 'Creando...' : 'Crear lista'}
        </button>
      </section>

      <section className="listas-grid-section">
        <h2>Listas guardadas</h2>

        {loading ? (
          <div className="loading-container">
            <p>Cargando tus listas...</p>
          </div>
        ) : listas.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes listas personales aún</h3>
            <p>Crea una lista para guardar productos y agruparlos como quieras.</p>
          </div>
        ) : (
          <div className="listas-grid">
            {listas.map((lista) => (
              <article key={lista.id} className="lista-card">
                {editingListId === lista.id ? (
                  <div className="edit-list-form">
                    <div className="form-row">
                      <label>Nombre</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <label>Descripción</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="form-row checkbox-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={editPublic}
                          onChange={(e) => setEditPublic(e.target.checked)}
                        />
                        Lista pública
                      </label>
                    </div>
                    <div className="list-footer">
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        onClick={() => handleUpdateList(lista.id)}
                        disabled={updating}
                      >
                        {updating ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={updating}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="card-header">
                      <div>
                        <h3>{lista.nombre_lista}</h3>
                        <p className="list-meta">{lista.productos_count ?? 0} productos</p>
                      </div>
                      <span className={`visibility-pill ${lista.publica ? 'publica' : 'privada'}`}>
                        {lista.publica ? 'Pública' : 'Privada'}
                      </span>
                    </div>

                    <p className="list-description">{lista.descripcion || 'Sin descripción'}</p>

                    <div className="list-footer">
                      <Link className="btn btn-outline btn-sm" to={`/listas/${lista.id}`}>
                        Ver lista
                      </Link>
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={() => handleStartEdit(lista)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => handleDeleteList(lista.id)}
                        disabled={deleteProcessingId === lista.id}
                      >
                        {deleteProcessingId === lista.id ? 'Eliminando...' : 'Eliminar'}
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
