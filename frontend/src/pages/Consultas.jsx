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
        <p>Envía tus dudas al equipo de soporte y revisa el estado de tus consultas.</p>
      </header>

      <section className="consulta-card new-consulta-card">
        <div className="card-heading">
          <h2>Crear nueva consulta</h2>
          <p>Describe tu problema o pregunta con el mayor detalle posible.</p>
        </div>

        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

        <form onSubmit={handleSubmitConsulta}>
          <label htmlFor="consulta-contenido">Contenido de la consulta</label>
          <textarea
            id="consulta-contenido"
            rows="5"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe aquí tu consulta..."
            disabled={submitLoading}
          />

          <button type="submit" className="btn btn-primary" disabled={submitLoading}>
            {submitLoading ? 'Enviando consulta...' : 'Enviar consulta'}
          </button>
        </form>
      </section>

      <section className="consultas-list-section">
        <h2>Mis consultas</h2>

        {loading ? (
          <div className="empty-state">
            <p>Cargando consultas...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : consultas.length === 0 ? (
          <div className="empty-state">
            <h3>No hay consultas</h3>
            <p>Aún no has creado ninguna consulta. Usa el formulario para enviar tu primera pregunta.</p>
          </div>
        ) : (
          <div className="consultas-grid">
            {consultas.map((consulta) => (
              <Link key={consulta.id} to={`/consultas/${consulta.id}`} className="consulta-item consulta-link">
                <div className="consulta-header">
                  <div>
                    <span className={`consulta-status ${consulta.estado.toLowerCase()}`}>{consulta.estado}</span>
                    <h3>Consulta #{consulta.id}</h3>
                  </div>
                  <span className="consulta-date">{formatFecha(consulta.fecha_creacion || consulta.created_at)}</span>
                </div>
                <p className="consulta-content">{consulta.mensajes?.length > 0 ? consulta.mensajes[0].contenido : 'Sin contenido disponible.'}</p>
                <div className="consulta-meta">
                  <span>{consulta.soporte?.nombre ? `Soporte: ${consulta.soporte.nombre}` : 'Soporte: Pendiente'}</span>
                  <span>{consulta.mensajes ? `${consulta.mensajes.length} mensaje(s)` : '0 mensajes'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
