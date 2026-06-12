import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Consultas.scss';

export const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contenido, setContenido] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchConsultas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/consultas');
      if (response.data && response.data.data) {
        setConsultas(response.data.data);
      } else {
        setConsultas(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error al obtener consultas:', err);
      setError('No se pudieron cargar las consultas en este momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  const handleSubmitConsulta = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!contenido.trim()) {
      setSubmitError('El contenido de la consulta no puede estar vacío.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post('/consultas', {
        contenido: contenido.trim(),
      });

      setConsultas((prev) => [response.data, ...prev]);
      setContenido('');
      setSubmitSuccess('Consulta creada correctamente.');
    } catch (err) {
      console.error('Error al crear consulta:', err);
      const backendMessage = err.response?.data?.message;
      setSubmitError(backendMessage || 'No se pudo crear la consulta. Intenta de nuevo.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatFecha = (value) => {
    if (!value) return 'Desconocida';
    const parsed = new Date(value);
    return parsed.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="consultas-page">
      <header className="page-header">
        <h1>Consultas y Soporte</h1>
        <p className="page-subtitle">Envía dudas al equipo de soporte y revisa tus consultas.</p>
      </header>

      {/* New consulta form */}
      <section className="card mb-xl">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Nueva consulta</h2>
        {submitError && <div className="alert alert-danger mb-md">{submitError}</div>}
        {submitSuccess && <div className="alert alert-success mb-md">{submitSuccess}</div>}
        <form onSubmit={handleSubmitConsulta} style={{ display: 'grid', gap: '0.75rem' }}>
          <div className="form-group">
            <label htmlFor="consulta-contenido">Describe tu problema o pregunta</label>
            <textarea
              id="consulta-contenido"
              rows="5"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe aquí tu consulta con el mayor detalle posible…"
              disabled={submitLoading}
            />
          </div>
          <button type="submit" className={`btn btn-primary${submitLoading ? ' btn-loading' : ''}`} disabled={submitLoading}>
            {submitLoading ? 'Enviando…' : 'Enviar consulta'}
          </button>
        </form>
      </section>

      {/* Consultas list */}
      <section>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 900 }}>Mis consultas</h2>
        {loading ? (
          <div className="loading-container"><div className="spinner" /><span>Cargando…</span></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : consultas.length === 0 ? (
          <div className="empty-state">
            <h3>Sin consultas</h3>
            <p>Usa el formulario para enviar tu primera consulta al equipo de soporte.</p>
          </div>
        ) : (
          <div className="consultas-list">
            {consultas.map((consulta) => (
              <Link
                key={consulta.id}
                to={`/consultas/${consulta.id}`}
                className={`consulta-card status-${consulta.estado?.toLowerCase()}`}
              >
                <div className="consulta-meta">
                  <span className={`badge badge-${consulta.estado === 'ABIERTA' ? 'success' : consulta.estado === 'PENDIENTE' ? 'warning' : 'muted'}`}>
                    {consulta.estado}
                  </span>
                  <span className="text-muted text-sm">#{consulta.id}</span>
                  <span className="text-muted text-sm">{formatFecha(consulta.fecha_creacion || consulta.created_at)}</span>
                </div>
                <h3 className="consulta-title">Consulta #{consulta.id}</h3>
                <p className="consulta-preview">
                  {consulta.mensajes?.length > 0 ? consulta.mensajes[0].contenido : 'Sin contenido disponible.'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};