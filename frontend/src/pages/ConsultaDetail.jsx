import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Consultas.scss';

export const ConsultaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver atrás" style={{ marginBottom: '1.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><span>Cargando…</span></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !consulta ? (
        <div className="empty-state"><h3>Consulta no encontrada</h3></div>
      ) : (
        <>
          <header className="page-header header-row">
            <div>
              <h1>Consulta #{consulta.id}</h1>
              <p className="page-subtitle">
                Cliente: {consulta.cliente?.nombre || 'Desconocido'} —
                Soporte: {consulta.soporte?.nombre || 'Pendiente'} —
                {formatFecha(consulta.fecha_creacion || consulta.created_at)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge badge-${consulta.estado === 'ABIERTA' ? 'success' : consulta.estado === 'PENDIENTE' ? 'warning' : 'muted'}`}>
                {consulta.estado}
              </span>
              {canReply && (
                <button className="btn btn-sm btn-outline" onClick={handleCloseConsulta} disabled={closeLoading}>
                  {closeLoading ? 'Cerrando…' : 'Cerrar consulta'}
                </button>
              )}
            </div>
          </header>

          {closeError && <div className="alert alert-danger mb-md">{closeError}</div>}

          {/* Messages */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 900 }}>Mensajes</h2>
            {consulta.mensajes?.length > 0 ? (
              <div className="messages">
                {consulta.mensajes
                  .slice()
                  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                  .map((mensaje) => {
                    const isClient = mensaje.emisor?.id === consulta.cliente_id;
                    return (
                      <article key={mensaje.id} className={`message-bubble ${isClient ? 'from-me' : 'from-support'}`}>
                        <p className="message-author">
                          {mensaje.emisor?.nombre || 'Usuario'} — {isClient ? 'Cliente' : 'Soporte'}
                        </p>
                        <p className="message-text">{mensaje.contenido}</p>
                        <p className="message-time">{formatFecha(mensaje.created_at)}</p>
                      </article>
                    );
                  })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>No hay mensajes aún.</p>
              </div>
            )}
          </section>

          {/* Reply form */}
          {consulta.estado === 'CERRADA' ? (
            <div className="alert alert-info">Esta consulta está cerrada.</div>
          ) : (
            <div className="reply-form">
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 900 }}>Enviar respuesta</h2>
              {submitError && <div className="alert alert-danger mb-md">{submitError}</div>}
              {submitSuccess && <div className="alert alert-success mb-md">{submitSuccess}</div>}
              <form onSubmit={handleSendMessage} style={{ display: 'grid', gap: '0.75rem' }}>
                <div className="form-group">
                  <label htmlFor="reply-content">Mensaje</label>
                  <textarea
                    id="reply-content"
                    rows="4"
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Escribe tu respuesta aquí…"
                    disabled={submitLoading}
                  />
                </div>
                <button type="submit" className={`btn btn-primary${submitLoading ? ' btn-loading' : ''}`} disabled={submitLoading}>
                  {submitLoading ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};