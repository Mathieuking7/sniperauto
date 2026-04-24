import { useEffect, useState, useCallback } from 'react'
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

export default function ReservedPage() {
  const { slug } = useParams<{ slug: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expired, setExpired] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  useEffect(() => {
    fetch(`/api/reservations/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((data: Reservation | null) => {
        if (!data) return
        setReservation(data)
        if (data.status !== 'active' || data.deadline <= Date.now()) {
          setExpired(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleExpire = useCallback(() => setExpired(true), [])

  const handleWaitlist = async () => {
    setWaitlistLoading(true)
    try {
      const res = await fetch(`/api/reservations/${slug}/waitlist`, { method: 'POST' })
      if (res.ok) setWaitlistDone(true)
    } finally {
      setWaitlistLoading(false)
    }
  }

  const openCrisp = () => {
    (window as CrispWindow).$crisp?.push(['do', 'chat:open'])
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #007AFF', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: '-apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', color: '#1a1a1a' }}>Ce lien n'existe pas</h1>
        <a href="/" style={{ color: '#007AFF', fontSize: '16px' }}>Retour à l'accueil</a>
      </div>
    )
  }

  const res = reservation!
  const isConverted = res.status === 'converted'
  const isExpiredOrWaitlisted = expired || ['expired', 'waitlisted'].includes(res.status)

  return (
    <div className="reserved-page">
      {/* Nav */}
      <nav className="reserved-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#007AFF,#5856d6)', borderRadius: '8px' }} />
          <span style={{ fontWeight: 800, fontSize: '17px', color: '#1a1a1a' }}>SniperAuto</span>
        </div>
        <span style={{ fontSize: '13px', color: '#888' }}>🔒 Page personnelle sécurisée</span>
      </nav>

      {isExpiredOrWaitlisted || isConverted ? (
        /* ── Expiry / Converted state ── */
        <div className="reserved-expired-wrap">
          {isConverted ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h1 className="reserved-expired-title">Votre abonnement SniperAuto est actif</h1>
              <p className="reserved-expired-body">
                Bienvenue dans SniperAuto ! Notre équipe vous contacte pour finaliser votre configuration.
              </p>
              <a href="/" className="reserved-cta-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px' }}>
                Retour à l'accueil
              </a>
            </>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⌛</div>
              <h1 className="reserved-expired-title">Votre place a été réattribuée</h1>
              <p className="reserved-expired-body">
                Le délai de 48h est écoulé. Votre place a été proposée à un autre client de la liste d'attente.
                Vous pouvez rejoindre la liste à nouveau pour être recontacté dès qu'une nouvelle place se libère.
              </p>
              {waitlistDone ? (
                <p style={{ color: '#34c759', fontWeight: 600, marginTop: '16px', fontSize: '16px' }}>
                  ✅ Vous êtes inscrit, nous vous recontacterons.
                </p>
              ) : (
                <button className="reserved-cta-primary" onClick={handleWaitlist} disabled={waitlistLoading} style={{ marginTop: '16px' }}>
                  {waitlistLoading ? 'Inscription...' : "Rejoindre à nouveau la liste d'attente"}
                </button>
              )}
            </>
          )}

          <div style={{ marginTop: '24px' }}>
            <button className="reserved-crisp-link" onClick={openCrisp}>
              💬 Une question ? Discuter avec nous →
            </button>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
            <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rappel — comment ça marche
            </p>
            <video
              src="/demo-sniperauto.mp4"
              autoPlay muted loop playsInline
              style={{ width: '100%', borderRadius: '12px' }}
            />
          </div>
        </div>
      ) : (
        /* ── Active state ── */
        <>
          <div className="reserved-hero">
            <p className="reserved-eyebrow">👋 Bonjour {res.firstName || ''}</p>
            <h1 className="reserved-title">
              Votre place est réservée <span style={{ color: '#007AFF' }}>48 h</span>
            </h1>
            <p className="reserved-subtitle">
              Passé ce délai, elle sera réattribuée au prochain client de la liste d'attente.
            </p>
            <Countdown deadline={res.deadline} onExpire={handleExpire} />
          </div>

          <div className="reserved-grid">
            {/* Left: video + benefits */}
            <div className="reserved-col-left">
              <p className="reserved-col-label">Rappel — comment ça marche</p>
              <video src="/demo-sniperauto.mp4" autoPlay muted loop playsInline className="reserved-video" />
              <div className="reserved-benefits">
                <div className="reserved-benefit-card">
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <span>Alertes WhatsApp ou mail</span>
                </div>
                <div className="reserved-benefit-card">
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <span>Scoring IA des deals</span>
                </div>
                <div className="reserved-benefit-card">
                  <span style={{ fontSize: '20px' }}>🔍</span>
                  <span>5 sources 24/7</span>
                </div>
              </div>
            </div>

            {/* Right: pricing */}
            <ReservedPricing slug={res.slug} email={res.email} firstName={res.firstName} />
          </div>
        </>
      )}
    </div>
  )
}
