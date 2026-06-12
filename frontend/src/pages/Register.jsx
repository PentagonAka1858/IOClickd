import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.scss';

export const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const result = await register(nombre, email, password, passwordConfirmation);
      if (result.success) {
        setRegisteredEmail(email);
        setRegisterSuccess(true);
      } else {
        setError(result.message || 'Error al registrarse');
      }
    } catch {
      setError('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>¡Cuenta creada!</h1>
            <p className="auth-subtitle">Revisa tu bandeja de entrada</p>
          </div>
          <div className="auth-card-body">
            <div className="register-success">
              <div className="success-icon">✓</div>
              <h2>¡Registro exitoso!</h2>
              <p>Hemos enviado un email de verificación a:</p>
              <span className="success-email">{registeredEmail}</span>
              <p className="verification-instructions">
                Haz clic en el enlace de tu email para activar la cuenta. El enlace caduca en 24 horas.
              </p>
              <div className="verification-actions">
                <Link to="/resend-verification" className="btn btn-secondary">
                  Reenviar email
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Ir a Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Crear Cuenta</h1>
          <p className="auth-subtitle">Regístrate y empieza a gestionar tus periféricos</p>
        </div>

        <div className="auth-card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirmation">Confirmar contraseña</label>
              <input
                type="password"
                id="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block${loading ? ' btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creando cuenta…' : 'Registrarse'}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};