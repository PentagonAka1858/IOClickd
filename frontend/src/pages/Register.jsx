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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const result = await register(nombre, email, password, passwordConfirmation);

      if (result.success) {
        setRegisterSuccess(true);
        setRegisteredEmail(email);
        // Clear form
        setNombre('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
      } else {
        setError(result.message || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  // Success message state
  if (registerSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="register-success">
            <div className="success-icon">✓</div>
            <h2>¡Cuenta creada exitosamente!</h2>
            <p>Hemos enviado un email de verificación a:</p>
            <p className="success-email">{registeredEmail}</p>
            <p className="verification-instructions">
              Por favor, haz clic en el enlace de verificación en tu email para completar el registro.
              El enlace expirará en 24 horas.
            </p>
            <div className="verification-info">
              <p className="small">¿No recibiste el email?</p>
              <Link to="/resend-verification" className="btn btn-secondary btn-block">
                Reenviar Email de Verificación
              </Link>
            </div>
            <Link to="/login" className="btn btn-outline btn-block">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crear Cuenta</h1>
        <p className="auth-subtitle">Regístrate y empieza a usar la aplicación</p>

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
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
