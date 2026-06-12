import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPublicUserProfile, followUser, unfollowUser, getFollowing } from '../services/api';
import '../styles/PerfilPublico.scss';

const BACKEND_URL = 'http://localhost:8000';

const getProductIcon = (tipo, size = 32) => {
  switch (tipo) {
    case 'RATON': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7" /><path d="M12 2v6" /></svg>;
    case 'TECLADO': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><path d="M6 8h.001" /><path d="M10 8h.001" /><path d="M14 8h.001" /><path d="M18 8h.001" /><path d="M8 12h.001" /><path d="M12 12h.001" /><path d="M16 12h.001" /><path d="M7 16h10" /></svg>;
    case 'AURICULAR': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></svg>;
    case 'MONITOR': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
    case 'ALFOMBRILLA': return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2" /></svg>;
    default: return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
  }
};

export const PerfilPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const isMe = currentUser?.id === Number(id);

  // ── Cargar perfil ────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError('');
    getPublicUserProfile(id)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setProfile(d);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) {
          setError('Este perfil no existe o no es público.');
        } else {
          setError('No se pudo cargar el perfil. Inténtalo de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Comprobar si ya seguimos a este usuario ──────────────────
  useEffect(() => {
    if (!isAuthenticated || isMe) return;
    getFollowing()
      .then((res) => {
        // myFollowing devuelve un array plano de IDs
        const raw = res.data;
        const ids = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setIsFollowing(ids.map(Number).includes(Number(id)));
      })
      .catch(() => { });
  }, [id, isAuthenticated, isMe]);

  // ── Follow / Unfollow ────────────────────────────────────────
  const handleFollow = async () => {
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
        setProfile((prev) =>
          prev ? { ...prev, followers_count: Math.max(0, (prev.followers_count ?? 1) - 1) } : prev
        );
      } else {
        await followUser(id);
        setIsFollowing(true);
        setProfile((prev) =>
          prev ? { ...prev, followers_count: (prev.followers_count ?? 0) + 1 } : prev
        );
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
      // Silenciar error real
    } finally {
      setFollowBusy(false);
    }
  };

  const avatarUrl = (foto) =>
    foto ? `${BACKEND_URL}/storage/${foto}` : '/user.placeholder.png';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pp-page">
        <div className="pp-skeleton">
          <div className="pp-skeleton__avatar skeleton-pulse" />
          <div className="pp-skeleton__line skeleton-pulse pp-skeleton__line--wide" />
          <div className="pp-skeleton__line skeleton-pulse" />
          <div className="pp-skeleton__line skeleton-pulse pp-skeleton__line--short" />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="pp-page">
        <div className="pp-error">
          <span className="pp-error__icon" aria-hidden="true">⚠</span>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const listasPublicas = profile.listas_publicas ?? [];
  const inventarioPrincipal = profile.inventario_principal ?? [];

  return (
    <div className="pp-page">
      {/* Botón volver */}
      <button className="pp-back" onClick={() => navigate(-1)} aria-label="Volver atrás">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      {/* ── Hero del perfil ─────────────────────────────────── */}
      <div className="pp-hero">
        <div className="pp-hero__avatar-wrap">
          <img
            src={avatarUrl(profile.foto)}
            alt={profile.nombre}
            className="pp-hero__avatar"
          />
        </div>

        <div className="pp-hero__info">
          <h1 className="pp-hero__name">{profile.nombre}</h1>
          {profile.username && (
            <p className="pp-hero__username">@{profile.username}</p>
          )}
          {profile.rol && (
            <span className={`pp-hero__badge pp-hero__badge--${profile.rol.toLowerCase()}`}>
              {profile.rol}
            </span>
          )}

          {/* Estadísticas */}
          <div className="pp-hero__stats">
            {profile.followers_count !== undefined && (
              <div className="pp-hero__stat">
                <strong>{profile.followers_count}</strong>
                <span>seguidores</span>
              </div>
            )}
            {profile.following_count !== undefined && (
              <div className="pp-hero__stat">
                <strong>{profile.following_count}</strong>
                <span>siguiendo</span>
              </div>
            )}
            {profile.created_at && (
              <div className="pp-hero__stat">
                <strong>{formatDate(profile.created_at)}</strong>
                <span>miembro desde</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="pp-hero__actions">
            {isMe ? (
              <button className="btn btn-outline" onClick={() => navigate('/perfil')}>
                ✏️ Editar mi perfil
              </button>
            ) : (
              isAuthenticated && (
                <button
                  className={`pp-follow-btn${isFollowing ? ' is-following' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollow();
                  }}
                  disabled={followBusy}
                  aria-label={isFollowing ? `Dejar de seguir a ${profile.nombre}` : `Seguir a ${profile.nombre}`}
                >
                  {followBusy ? '…' : isFollowing ? '✓ Siguiendo' : '+ Seguir'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Periféricos principales ─────────────────────────────── */}
      {inventarioPrincipal.length > 0 && (
        <section className="pp-section">
          <h2 className="pp-section__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Periféricos principales
          </h2>
          <div className="pp-main-peripherals-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {inventarioPrincipal.map((item) => (
              <button
                key={item.producto_id}
                className="pp-main-peripheral"
                onClick={() => navigate(`/productos/${item.producto_id}`)}
                title={`Ver ${item.producto?.modelo}`}
              >
                {item.producto?.foto ? (
                  <img
                    src={`${BACKEND_URL}/storage/${item.producto.foto}`}
                    alt={`${item.producto.marca} ${item.producto.modelo}`}
                    className="pp-main-peripheral__img"
                  />
                ) : (
                  <span className="pp-main-peripheral__icon" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getProductIcon(item.producto?.tipo, 32)}
                  </span>
                )}
                <div className="pp-main-peripheral__info">
                  <span className="pp-main-peripheral__type">
                    {item.producto?.tipo}
                  </span>
                  <strong className="pp-main-peripheral__model">
                    {item.producto?.marca} {item.producto?.modelo}
                  </strong>
                </div>
                <span className="pp-main-peripheral__arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Listas públicas ──────────────────────────────────── */}
      {listasPublicas.length > 0 && (
        <section className="pp-section">
          <h2 className="pp-section__title">
            Listas públicas
            <span className="pp-section__count">{listasPublicas.length}</span>
          </h2>
          <div className="pp-listas-grid">
            {listasPublicas.map((lista) => (
              <button
                key={lista.id}
                className="pp-lista-card"
                onClick={() => navigate(`/listas/${lista.id}`)}
              >
                <strong>{lista.nombre}</strong>
                {lista.descripcion && <span>{lista.descripcion}</span>}
                <span className="pp-lista-card__count">
                  {lista.productos_count ?? 0} producto{lista.productos_count !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Mensaje si no hay contenido público */}
      {listasPublicas.length === 0 && inventarioPrincipal.length === 0 && (
        <div className="pp-section pp-empty-content">
          <span aria-hidden="true" style={{ fontSize: '2rem' }}>🔒</span>
          <p>Este usuario no tiene contenido público todavía.</p>
        </div>
      )}
    </div>
  );
};
