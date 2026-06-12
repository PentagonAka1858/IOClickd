import { useState, useEffect, useRef } from 'react';
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
  const [actionLoading, setActionLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [consulta?.mensajes]);

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

  const parseSafeDate = (value) => {
    if (!value) return new Date(NaN);
    if (typeof value !== 'string') return new Date(value);
    // Replace space with T to ensure valid Date parsing
    return new Date(value.replace(' ', 'T'));
  };

  const formatFecha = (value) => {
    const parsed = parseSafeDate(value);
    if (isNaN(parsed.getTime())) return 'Desconocida';
    return parsed.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

      // Generate local time string like "YYYY-MM-DD HH:mm:ss" for the fallback
      const now = new Date();
      const localStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().replace('T', ' ').slice(0, 19);

      const nuevoMensaje = {
        ...response.data,
        fecha_envio: response.data.fecha_envio || localStr
      };

      setConsulta((prev) => ({
        ...prev,
        mensajes: prev?.mensajes ? [...prev.mensajes, nuevoMensaje] : [nuevoMensaje],
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

  const handleReabrirConsulta = async () => {
    if (!consulta || consulta.estado !== 'CERRADA') return;
    setCloseError('');
    setActionLoading(true);
    try {
      await api.post(`/consultas/${id}/reabrir`);
      setConsulta((prev) => ({ ...prev, estado: 'ABIERTA' }));
    } catch (err) {
      console.error('Error al reabrir consulta:', err);
      setCloseError(err.response?.data?.message || 'No se pudo reabrir la consulta.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConsulta = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta consulta permanentemente?')) return;
    setCloseError('');
    setActionLoading(true);
    try {
      await api.delete(`/consultas/${id}`);
      navigate(user?.rol === 'ADMIN' ? '/admin' : '/consultas');
    } catch (err) {
      console.error('Error al eliminar consulta:', err);
      setCloseError(err.response?.data?.message || 'No se pudo eliminar la consulta.');
      setActionLoading(false);
    }
  };

  const isSupportUser = ['ADMIN', 'MOD'].includes(user?.rol);
  const canReply = consulta?.estado !== 'CERRADA';

  return (
    <div className="consultas-page consulta-detail-page">
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
                <button className="btn btn-outline" onClick={handleCloseConsulta} disabled={closeLoading || actionLoading}>
                  {closeLoading ? 'Cerrando…' : 'Cerrar consulta'}
                </button>
              )}
              {consulta.estado === 'CERRADA' && (
                <button className="btn btn-outline" onClick={handleReabrirConsulta} disabled={actionLoading}>
                  Reabrir consulta
                </button>
              )}
              {user?.rol === 'ADMIN' && (
                <button className="btn btn-danger" onClick={handleDeleteConsulta} disabled={actionLoading}>
                  Eliminar
                </button>
              )}
            </div>
          </header>

          {closeError && <div className="alert alert-danger mb-md">{closeError}</div>}

          {/* Messages */}
          <section className="mensajes-section">
            <h2>Mensajes</h2>
            {consulta.mensajes?.length > 0 ? (
              <div className="messages-chat" ref={chatContainerRef}>
                {consulta.mensajes
                  .slice()
                  .sort((a, b) => {
                    const dateA = parseSafeDate(a.fecha_envio || a.created_at);
                    const dateB = parseSafeDate(b.fecha_envio || b.created_at);
                    return (dateA.getTime() || 0) - (dateB.getTime() || 0);
                  })
                  .map((mensaje) => {
                    const isMe = mensaje.emisor?.id === user?.id;
                    const isClient = mensaje.emisor?.id === consulta.cliente_id;
                    return (
                      <article key={mensaje.id} className={`message-bubble ${isMe ? 'from-me' : 'from-support'}`}>
                        <p className="message-author">
                          {mensaje.emisor?.nombre || 'Usuario'} — {isClient ? 'Cliente' : 'Soporte'}
                        </p>
                        <p className="message-text">{mensaje.contenido}</p>
                        <p className="message-time">{formatFecha(mensaje.fecha_envio || mensaje.created_at)}</p>
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
            <div className="reply-section">
              <h2>Enviar respuesta</h2>
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