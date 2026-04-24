import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Countdown from '../components/Countdown'
import ReservedPricing from '../components/ReservedPricing'

interface Reservation {
  slug: string
  firstName: string
  email: string
  deadline: number
  status: 'active' | 'converted' | 'expired' | 'waitlisted'
}

type CrispWindow = Window & { $crisp?: { push: (a: unknown[]) => void } }

/* ── Radar logo (identical to homepage Nav) ── */
const RadarLogo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="radarGlowR" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#007AFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sweepGradR" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#007AFF" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle cx="14" cy="14" r="12" stroke="#007AFF" strokeWidth="1.5" fill="none"
      style={{ animation: 'logo-outer-pulse 3s ease-in-out infinite' }} />
    <circle cx="14" cy="14" r="12" stroke="#007AFF" strokeWidth="1" fill="none" opacity="0"
      style={{ animation: 'logo-scan-ring 3s ease-out infinite' }} />
    <circle cx="14" cy="14" r="7" stroke="#007AFF" strokeWidth="1.2" fill="none" opacity="0.6" />
    <g style={{ transformOrigin: '14px 14px', animation: 'logo-sweep 2.5s linear infinite' }}>
      <path d="M14 14 L14 2" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <path d="M14 14 L19.5 3.5" stroke="#007AFF" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M14 14 L23 7" stroke="#007AFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
    </g>
    <line x1="14" y1="1" x2="14" y2="6" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1="14" y1="22" x2="14" y2="27" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1="1" y1="14" x2="6" y2="14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1="22" y1="14" x2="27" y2="14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <circle cx="14" cy="14" r="2.5" fill="#007AFF"
      style={{ animation: 'logo-dot-pulse 2.5s ease-in-out infinite' }} />
    <circle cx="14" cy="14" r="2.5" fill="#007AFF" opacity="0"
      style={{ animation: 'logo-dot-halo 2.5s ease-out infinite' }} />
  </svg>
)

/* ── Custom video player ── */
function ReservedVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.muted = false
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div className="reserved-video-wrap">
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted
        className="reserved-video"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {!playing && (
        <button className="reserved-video-play-overlay" onClick={togglePlay} aria-label="Lire la vidéo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.55)" />
            <polygon points="19,15 37,24 19,33" fill="white" />
          </svg>
        </button>
      )}
      <div className="reserved-video-controls">
        <button className="reserved-video-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Lecture'}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <polygon points="4,2 14,8 4,14" />
            </svg>
          )}
        </button>
        <button className="reserved-video-btn" onClick={toggleMute} aria-label={muted ? 'Activer le son' : 'Couper le son'}>
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M8 2L4 6H1v4h3l4 4V2z" />
              <line x1="11" y1="6" x2="15" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="6" x2="11" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M8 2L4 6H1v4h3l4 4V2z" />
              <path d="M11 5.5a4 4 0 0 1 0 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M13 3.5a7 7 0 0 1 0 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

/* ── Shared Nav ── */
const ReservedNav = () => (
  <nav className="reserved-nav">
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <RadarLogo />
      <span style={{ fontWeight: 800, fontSize: '17px', color: '#1a1a1a' }}>SniperAuto</span>
    </div>
    <span style={{ fontSize: '13px', color: '#888' }}>🔒 Page personnelle sécurisée</span>
  </nav>
)

/* ── Converted page ── */
function ConvertedPage({ firstName }: { firstName: string }) {
  const openCrisp = () => (window as CrispWindow).$crisp?.push(['do', 'chat:open'])
  return (
    <div className="reserved-page">
      <ReservedNav />
      <div className="reserved-expired-wrap">
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
        <h1 className="reserved-expired-title">
          Bienvenue dans SniperAuto{firstName ? `, ${firstName}` : ''} !
        </h1>
        <p className="reserved-expired-body">
          Votre abonnement est actif. Notre équipe va vous contacter dans les prochaines heures
          pour finaliser la configuration de vos alertes.
        </p>
        <div className="reserved-converted-steps">
          <div className="reserved-step">
            <span className="reserved-step-num">1</span>
            <span>Vous recevrez un message WhatsApp de notre équipe</span>
          </div>
          <div className="reserved-step">
            <span className="reserved-step-num">2</span>
            <span>On configure ensemble vos critères de recherche</span>
          </div>
          <div className="reserved-step">
            <span className="reserved-step-num">3</span>
            <span>Les alertes démarrent — vous ne ratez plus aucun deal</span>
          </div>
        </div>
        <div style={{ marginTop: '28px' }}>
          <button className="reserved-crisp-link" onClick={openCrisp}>
            💬 Une question ? Discuter avec nous →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Expired / Waitlisted page ── */
function ExpiredPage({ slug, firstName }: { slug: string; firstName: string }) {
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)
  const openCrisp = () => (window as CrispWindow).$crisp?.push(['do', 'chat:open'])

  const handleWaitlist = async () => {
    setWaitlistLoading(true)
    try {
      const res = await fetch(`/api/reservations/${slug}/waitlist`, { method: 'POST' })
      if (res.ok) setWaitlistDone(true)
    } finally {
      setWaitlistLoading(false)
    }
  }

  return (
    <div className="reserved-page">
      <ReservedNav />
      <div className="reserved-expired-wrap">
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>⌛</div>
        <h1 className="reserved-expired-title">Votre place a été réattribuée</h1>
        <p className="reserved-expired-body">
          Le délai de 48h est écoulé{firstName ? `, ${firstName}` : ''}. Votre place a été proposée
          au prochain client de la liste d'attente.
        </p>

        {waitlistDone ? (
          <div className="reserved-waitlist-confirm">
            <span style={{ fontSize: '24px' }}>✅</span>
            <p style={{ fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Vous êtes inscrit sur la liste</p>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              On vous recontacte dès qu'une place se libère.
            </p>
          </div>
        ) : (
          <button
            className="reserved-cta-primary"
            onClick={handleWaitlist}
            disabled={waitlistLoading}
            style={{ marginTop: '20px', maxWidth: '320px' }}
          >
            {waitlistLoading ? 'Inscription...' : "Rejoindre la liste d'attente →"}
          </button>
        )}

        <div style={{ marginTop: '24px' }}>
          <button className="reserved-crisp-link" onClick={openCrisp}>
            💬 Une question ? Discuter avec nous →
          </button>
        </div>

        <div style={{ marginTop: '40px', width: '100%', maxWidth: '440px' }}>
          <p className="reserved-col-label" style={{ textAlign: 'center', marginBottom: '10px' }}>
            En attendant — comment ça marche
          </p>
          <ReservedVideoPlayer src="/demo-sniperauto.mp4" />
        </div>
      </div>
    </div>
  )
}

/* ── Main component ── */
export default function ReservedPage() {
  const { slug } = useParams<{ slug: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    fetch(`/api/reservations/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        if (!r.ok) { setFetchError(true); return null }
        return r.json()
      })
      .then((data: Reservation | null) => {
        if (!data) return
        setReservation(data)
        if (data.status !== 'active' || data.deadline <= Date.now()) {
          setExpired(true)
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleExpire = useCallback(() => setExpired(true), [])

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #007AFF', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  /* ── Not found ── */
  if (notFound) {
    return (
      <div className="reserved-page">
        <ReservedNav />
        <div className="reserved-expired-wrap">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <h1 className="reserved-expired-title">Ce lien n'existe pas</h1>
          <p className="reserved-expired-body">Vérifiez le lien ou contactez-nous.</p>
          <a href="/" className="reserved-cta-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', padding: '12px 28px', borderRadius: '12px' }}>
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  /* ── Fetch error ── */
  if (fetchError || !reservation) {
    return (
      <div className="reserved-page">
        <ReservedNav />
        <div className="reserved-expired-wrap">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
          <h1 className="reserved-expired-title">Une erreur est survenue</h1>
          <p className="reserved-expired-body">Impossible de charger votre page. Réessayez dans quelques instants.</p>
          <button className="reserved-cta-primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  /* ── Converted ── */
  if (reservation.status === 'converted') {
    return <ConvertedPage firstName={reservation.firstName} />
  }

  /* ── Expired / Waitlisted ── */
  if (expired || reservation.status === 'expired' || reservation.status === 'waitlisted') {
    return <ExpiredPage slug={reservation.slug} firstName={reservation.firstName} />
  }

  /* ── Active ── */
  return (
    <div className="reserved-page">
      <ReservedNav />
      <div className="reserved-hero">
        <p className="reserved-eyebrow">👋 Bonjour {reservation.firstName || ''}</p>
        <h1 className="reserved-title">
          Votre place est réservée <span style={{ color: '#007AFF' }}>48 h</span>
        </h1>
        <p className="reserved-subtitle">
          Passé ce délai, elle sera réattribuée au prochain client de la liste d'attente.
        </p>
        <Countdown deadline={reservation.deadline} onExpire={handleExpire} />
      </div>

      <div className="reserved-grid">
        <div className="reserved-col-left">
          <p className="reserved-col-label">Rappel — comment ça marche</p>
          <ReservedVideoPlayer src="/demo-sniperauto.mp4" />
        </div>
        <ReservedPricing slug={reservation.slug} email={reservation.email} firstName={reservation.firstName} />
      </div>
    </div>
  )
}
