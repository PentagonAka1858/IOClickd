import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  searchPublicProfiles,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowingList,
  getFollowersList,
} from '../services/api';
import '../styles/BuscarPerfiles.scss';

const BACKEND_URL = 'http://localhost:8000';

const TABS = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'siguiendo', label: 'Siguiendo' },
  { id: 'seguidores', label: 'Seguidores' },
];

export const BuscarPerfiles = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ── Tab activa ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('buscar');

  // ── Búsqueda ───────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Filtrar sólo los que ya sigo
  const [filterFollowing, setFilterFollowing] = useState(false);

  // ── IDs seguidos (Set) ─────────────────────────────────────
  const [followingIds, setFollowingIds] = useState(new Set());
  const [followLoading, setFollowLoading] = useState({});

  // ── Listas completas ───────────────────────────────────────
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);

  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // ── Cargar IDs seguidos + estadísticas al montar ───────────
  useEffect(() => {
    if (!isAuthenticated) return;

    // IDs seguidos (para botón seguir/siguiendo)
    // myFollowing devuelve un array plano de IDs desde el backend
    getFollowing()
      .then((res) => {
        const raw = res.data;
        const ids = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setFollowingIds(new Set(ids.map((id) => Number(id))));
      })
      .catch(() => setFollowingIds(new Set()));

    // Listas completas (tabs Siguiendo / Seguidores)
    setListsLoading(true);
    Promise.allSettled([getFollowingList(), getFollowersList()])
      .then(([fwRes, frRes]) => {
        if (fwRes.status === 'fulfilled') {
          const d = fwRes.value.data;
          setFollowingList(d?.data ?? d ?? []);
        }
        if (frRes.status === 'fulfilled') {
          const d = frRes.value.data;
          setFollowersList(d?.data ?? d ?? []);
        }
      })
      .finally(() => setListsLoading(false));
  }, [isAuthenticated]);

  // ── Búsqueda de perfiles ───────────────────────────────────
  const fetchProfiles = useCallback(async (q, p = 1, append = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await searchPublicProfiles(q, p);
      const data = res.data;
      const items = data?.data ?? data ?? [];
      const total = data?.total ?? items.length;
      const lastPage = data?.last_page ?? 1;

      if (append) {
        setProfiles((prev) => [...prev, ...items]);
      } else {
        setProfiles(items);
      }
      setTotalResults(total);
      setHasMore(p < lastPage);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        setError('El endpoint de búsqueda de perfiles aún no está disponible en el backend.');
      } else {
        setError('Error al buscar perfiles. Inténtalo de nuevo.');
      }
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce de búsqueda
  useEffect(() => {
    if (activeTab !== 'buscar') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProfiles(query.trim(), 1, false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchProfiles, activeTab]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProfiles(query.trim(), next, true);
  };

  // ── Follow / Unfollow ─────────────────────────────────────
  const handleFollow = async (profile) => {
    const uid = Number(profile.id);
    setFollowLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      if (followingIds.has(uid)) {
        await unfollowUser(uid);
        setFollowingIds((prev) => {
          const s = new Set(prev); s.delete(uid); return s;
        });
        // Quitar de la lista siguiendo
        setFollowingList((prev) => prev.filter((u) => Number(u.id) !== uid));
      } else {
        await followUser(uid);
        setFollowingIds((prev) => new Set([...prev, uid]));
        // Añadir a la lista siguiendo si no está ya
        setFollowingList((prev) =>
          prev.find((u) => Number(u.id) === uid) ? prev : [...prev, profile]
        );
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
      // Silenciar error — el estado NO se modifica si la llamada falla
    } finally {
      setFollowLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const avatarUrl = (foto) =>
    foto ? `${BACKEND_URL}/storage/${foto}` : '/user.placeholder.png';

  // ── Perfiles filtrados para la tab Buscar ─────────────────
  const displayedProfiles = filterFollowing
    ? profiles.filter((p) => followingIds.has(Number(p.id)))
    : profiles;

  // ── Render de una card ────────────────────────────────────
  const renderCard = (profile) => {
    const isMe = currentUser?.id === profile.id;
    const isFollowing = followingIds.has(Number(profile.id));
    const isBusy = followLoading[profile.id];

    return (
      <article key={profile.id} className="bp-card">
        {/* Avatar — clickable al perfil */}
        <button
          className="bp-card__avatar-wrap bp-card__avatar-wrap--link"
          onClick={() => navigate(`/perfiles/${profile.id}`)}
          title={`Ver perfil de ${profile.nombre}`}
          aria-label={`Ver perfil de ${profile.nombre}`}
        >
          <img
            src={avatarUrl(profile.foto)}
            alt={profile.nombre}
            className="bp-card__avatar"
          />
        </button>

        <div className="bp-card__body">
          {/* Nombre — clickable al perfil */}
          <button
            className="bp-card__name-link"
            onClick={() => navigate(`/perfiles/${profile.id}`)}
          >
            <h2 className="bp-card__name">{profile.nombre}</h2>
          </button>
          {profile.username && (
            <p className="bp-card__username">@{profile.username}</p>
          )}
          {profile.rol && (
            <span className={`bp-card__badge bp-card__badge--${profile.rol.toLowerCase()}`}>
              {profile.rol}
            </span>
          )}
        </div>

        {isAuthenticated && !isMe && (
          <button
            className={`bp-card__follow-btn${isFollowing ? ' is-following' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFollow(profile);
            }}
            disabled={isBusy}
            aria-label={isFollowing ? `Dejar de seguir a ${profile.nombre}` : `Seguir a ${profile.nombre}`}
          >
            {isBusy
              ? '…'
              : isFollowing
                ? '✓ Siguiendo'
                : '+ Seguir'}
          </button>
        )}
        {isMe && <span className="bp-card__you-badge">Tú</span>}
      </article>
    );
  };

  // ── Render lista (Siguiendo / Seguidores) ─────────────────
  const renderUserList = (list, emptyMsg) => {
    if (listsLoading) {
      return (
        <div className="bp-grid bp-grid--loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bp-card bp-card--skeleton" aria-hidden="true">
              <div className="bp-card__avatar-wrap skeleton-pulse" />
              <div className="bp-card__body">
                <div className="skeleton-line skeleton-line--wide skeleton-pulse" />
                <div className="skeleton-line skeleton-pulse" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="bp-state bp-state--empty">
          <span className="bp-state__icon" aria-hidden="true">👤</span>
          <p>{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="bp-grid">
        {list.map((profile) => renderCard(profile))}
      </div>
    );
  };

  return (
    <div className="buscar-perfiles-page">
      {/* ── Cabecera ── */}
      <header className="bp-header">
        <div className="bp-header__inner">
          <h1 className="bp-header__title">
            <span className="bp-header__title-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            Perfiles
          </h1>
          <p className="bp-header__subtitle">
            Descubre, sigue y conecta con otros usuarios
          </p>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav className="bp-tabs" aria-label="Secciones de perfiles">
        {TABS.map((tab) => {
          // Ocultar tabs de listas si no está autenticado
          if (!isAuthenticated && tab.id !== 'buscar') return null;
          return (
            <button
              key={tab.id}
              className={`bp-tabs__tab${activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
              {tab.id === 'siguiendo' && isAuthenticated && (
                <span className="bp-tabs__badge">{followingList.length}</span>
              )}
              {tab.id === 'seguidores' && isAuthenticated && (
                <span className="bp-tabs__badge">{followersList.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Contenido por tab ── */}
      <div className="bp-content">

        {/* ────── TAB: BUSCAR ────── */}
        {activeTab === 'buscar' && (
          <>
            {/* Barra de búsqueda + filtros */}
            <div className="bp-search-wrap">
              <div className="bp-search">
                <span className="bp-search__icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  id="bp-search-input"
                  type="search"
                  className="bp-search__input"
                  placeholder="Busca por nombre o usuario…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  aria-label="Buscar perfiles"
                />
                {query && (
                  <button
                    className="bp-search__clear"
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    aria-label="Borrar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filtro "solo los que sigo" */}
              {isAuthenticated && (
                <label className="bp-filter-check">
                  <input
                    type="checkbox"
                    checked={filterFollowing}
                    onChange={(e) => setFilterFollowing(e.target.checked)}
                  />
                  <span>Mostrar solo los que sigo</span>
                </label>
              )}

              {!loading && totalResults > 0 && (
                <p className="bp-results-count">
                  {filterFollowing
                    ? `${displayedProfiles.length} de ${totalResults} perfil${totalResults !== 1 ? 'es' : ''}`
                    : `${totalResults} perfil${totalResults !== 1 ? 'es' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
                  }
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bp-state bp-state--error">
                <span className="bp-state__icon" aria-hidden="true">⚠</span>
                <p>{error}</p>
              </div>
            )}

            {/* Skeletons carga */}
            {loading && profiles.length === 0 && (
              <div className="bp-grid bp-grid--loading">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bp-card bp-card--skeleton" aria-hidden="true">
                    <div className="bp-card__avatar-wrap skeleton-pulse" />
                    <div className="bp-card__body">
                      <div className="skeleton-line skeleton-line--wide skeleton-pulse" />
                      <div className="skeleton-line skeleton-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && !error && profiles.length === 0 && (
              <div className="bp-state bp-state--empty">
                <span className="bp-state__icon" aria-hidden="true">👤</span>
                <p>
                  {query
                    ? `No se encontraron perfiles para "${query}"`
                    : 'Escribe algo para buscar perfiles públicos'}
                </p>
              </div>
            )}

            {/* Grid */}
            {displayedProfiles.length > 0 && (
              <>
                <div className="bp-grid">
                  {displayedProfiles.map((profile) => renderCard(profile))}
                </div>

                {hasMore && !filterFollowing && (
                  <div className="bp-load-more">
                    <button
                      className="btn btn-outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? 'Cargando…' : 'Cargar más'}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Sin resultados después del filtro */}
            {!loading && profiles.length > 0 && displayedProfiles.length === 0 && filterFollowing && (
              <div className="bp-state bp-state--empty">
                <span className="bp-state__icon" aria-hidden="true">🔍</span>
                <p>No sigues a ningún perfil de los resultados actuales.</p>
              </div>
            )}
          </>
        )}

        {/* ────── TAB: SIGUIENDO ────── */}
        {activeTab === 'siguiendo' && (
          <div className="bp-list-section">
            <div className="bp-list-section__header">
              <h2 className="bp-list-section__title">
                Personas que sigues
                <span className="bp-list-section__count">{followingList.length}</span>
              </h2>
            </div>
            {renderUserList(followingList, 'Aún no sigues a nadie. ¡Busca perfiles y empieza a conectar!')}
          </div>
        )}

        {/* ────── TAB: SEGUIDORES ────── */}
        {activeTab === 'seguidores' && (
          <div className="bp-list-section">
            <div className="bp-list-section__header">
              <h2 className="bp-list-section__title">
                Personas que te siguen
                <span className="bp-list-section__count">{followersList.length}</span>
              </h2>
            </div>
            {renderUserList(followersList, 'Todavía nadie te sigue. ¡Comparte tu perfil!')}
          </div>
        )}

      </div>
    </div>
  );
};
