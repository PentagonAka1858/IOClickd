import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Consultas.scss';

export const ConsultaDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [consulta, setConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contenido, setContenido] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState('');

  const fetchConsulta = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/consultas/${id}`);
      setConsulta(response.data);
    } catch (err) {
      console.error('Error al obtener consulta:', err);
      setError('No se pudo cargar la consulta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsulta();
  }, [id]);

  const formatFecha = (value) => {
    if (!value) return 'Desconocida';
    const parsed = new Date(value);
    return parsed.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!contenido.trim()) {
      setSubmitError('El contenido del mensaje no puede estar vacío.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post(`/consultas/${id}/mensajes`, {
        contenido: contenido.trim(),
      });

      setConsulta((prev) => ({
        ...prev,
        mensajes: prev?.mensajes ? [...prev.mensajes, response.data] : [response.data],
      }));
      setContenido('');
      setSubmitSuccess('Mensaje enviado correctamente.');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      const backendMessage = err.response?.data?.message;
      setSubmitError(backendMessage || 'No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseConsulta = async () => {
    if (!consulta || consulta.estado === 'CERRADA') {
      return;
    }

    setCloseError('');
    setCloseLoading(true);

    try {
      await api.post(`/consultas/${id}/cerrar`);
      setConsulta((prev) => ({ ...prev, estado: 'CERRADA' }));
    } catch (err) {
      console.error('Error al cerrar consulta:', err);
      const backendMessage = err.response?.data?.message;
      setCloseError(backendMessage || 'No se pudo cerrar la consulta.');
    } finally {
      setCloseLoading(false);
    }
  };

  const isSupportUser = ['ADMIN', 'MOD'].includes(user?.rol);
  const canReply = consulta?.estado !== 'CERRADA';

  return (
    <div className="consulta-detail-page">
      <div className="detail-toolbar">
        <Link to="/consultas" className="back-link">
          ← Volver a consultas
        </Link>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Cargando consulta...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !consulta ? (
        <div className="empty-state">
          <h3>Consulta no encontrada</h3>
        </div>
      ) : (
        <>
          <header className="page-header">
            <h1>Consulta #{consulta.id}</h1>
            <p>Estado: <span className={`status-pill ${consulta.estado.toLowerCase()}`}>{consulta.estado}</span></p>
          </header>

          <div className="consulta-summary-card">
            <div>
              <p><strong>Cliente:</strong> {consulta.cliente?.nombre || 'Desconocido'}</p>
              <p><strong>Soporte:</strong> {consulta.soporte?.nombre || 'Pendiente'}</p>
              <p><strong>Creada:</strong> {formatFecha(consulta.fecha_creacion || consulta.created_at)}</p>
            </div>

            <div className="consulta-actions">
              {canReply && (
                <button
                  className="btn btn-outline"
                  onClick={handleCloseConsulta}
                  disabled={closeLoading}
                >
                  {closeLoading ? 'Cerrando...' : 'Cerrar consulta'}
                </button>
              )}
              {closeError && <div className="alert alert-danger">{closeError}</div>}
            </div>
          </div>

          <section className="mensajes-section">
            <h2>Mensajes</h2>

            {consulta.mensajes?.length > 0 ? (
              <div className="mensajes-list">
                {consulta.mensajes
                  .slice()
                  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                  .map((mensaje) => (
                    <article key={mensaje.id} className="mensaje-item">
                      <div className="mensaje-header">
                        <div>
                          <span className="mensaje-author">{mensaje.emisor?.nombre || 'Usuario'}</span>
                          <span className="mensaje-role">
                            {mensaje.emisor?.id === consulta.cliente_id ? 'Cliente' : 'Soporte'}
                          </span>
                        </div>
                        <span className="mensaje-date">{formatFecha(mensaje.created_at)}</span>
                      </div>
                      <p>{mensaje.contenido}</p>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay mensajes en esta consulta todavía.</p>
              </div>
            )}
          </section>

          <section className="reply-section">
            <h2>Enviar respuesta</h2>
            <p>
              {isSupportUser
                ? 'Como admin o moderador, tu respuesta ayudará a resolver esta consulta. Si aún no está asignada, responderla te asignará automáticamente.'
                : 'Puedes responder para añadir más información o aclarar tu consulta.'}
            </p>

            {consulta.estado === 'CERRADA' ? (
              <div className="alert alert-info">Esta consulta está cerrada y no puede recibir nuevos mensajes.</div>
            ) : (
              <form onSubmit={handleSendMessage}>
                {submitError && <div className="alert alert-danger">{submitError}</div>}
                {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

                <label htmlFor="reply-content">Mensaje</label>
                <textarea
                  id="reply-content"
                  rows="5"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  disabled={submitLoading}
                />

                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Enviando mensaje...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
};
