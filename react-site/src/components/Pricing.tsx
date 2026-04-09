import { useEffect, useRef, useState } from 'react'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l4 4 6-7" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) {
      sectionRef.current.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
    }
    return () => observer.disconnect()
  }, [])

  const checkout = async (plan: string, billing: string) => {
    const key = `${plan}_${billing}`
    setLoadingPlan(key)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erreur: ' + (data.error || 'Veuillez réessayer'))
        setLoadingPlan(null)
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.')
      setLoadingPlan(null)
    }
  }

  return (
    <section className="pricing" id="pricing" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title animate-on-scroll">Choisissez votre avantage concurrentiel</h2>
        <p className="section-subtitle animate-on-scroll">Pendant que vous comparez, un abonné Pro vient de recevoir une alerte.</p>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: '#f5f5f5', padding: '8px 16px', borderRadius: '8px' }}>
            <span style={{ color: isAnnual ? '#999' : '#000', fontWeight: isAnnual ? 400 : 600 }}>Mensuel</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              style={{
                background: isAnnual ? '#34c759' : '#ccc',
                border: 'none',
                borderRadius: '16px',
                width: '48px',
                height: '24px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.3s',
              }}
            >
              <div style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                background: 'white',
                borderRadius: '50%',
                top: '2px',
                left: isAnnual ? '26px' : '2px',
                transition: 'left 0.3s',
              }} />
            </button>
            <span style={{ color: isAnnual ? '#000' : '#999', fontWeight: isAnnual ? 600 : 400 }}>Annuel <span style={{ color: '#34c759', fontWeight: 700 }}>-20%</span></span>
          </div>
        </div>

        <div className="pricing-grid pricing-grid-2">

          {/* Essentiel */}
          <div className="pricing-card animate-on-scroll">
            <div className="pricing-name">Essentiel</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginRight: '6px' }}>{isAnnual ? '948 EUR' : '149 EUR'}</span>
              <span>EUR</span> {isAnnual ? Math.round(79 * 12 * 0.8) : 79}<span>/{isAnnual ? 'an' : 'mois'}</span>
            </div>
            <div className="pricing-period" style={{ color: '#666', fontWeight: 600, fontSize: '13px' }}>Sans engagement</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
              Frais de mise en service: 99 EUR
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> Alertes illimitées</li>
              <li><CheckIcon /> Scan toutes les heures</li>
              <li><CheckIcon /> 1 canal au choix</li>
              <li><CheckIcon /> Alertes WhatsApp</li>
              <li><CheckIcon /> Support par email</li>
              <li style={{ color: '#e53e3e' }}><CrossIcon /> <s>Scan temps réel</s></li>
              <li style={{ color: '#e53e3e' }}><CrossIcon /> <s>Filtres avancés</s></li>
              <li style={{ color: '#e53e3e' }}><CrossIcon /> <s>Historique des prix</s></li>
            </ul>
            <button
              className="pricing-btn secondary"
              onClick={() => checkout('essentiel', isAnnual ? 'annual' : 'monthly')}
              disabled={loadingPlan === (isAnnual ? 'essentiel_annual' : 'essentiel_monthly')}
            >
              {loadingPlan?.startsWith('essentiel') ? 'Chargement...' : "Demarrer avec l'Essentiel"}
            </button>
          </div>

          {/* Pro */}
          <div className="pricing-card popular animate-on-scroll" style={{ transform: 'scale(1.04)', zIndex: 2 }}>
            <div className="popular-badge">Choisi par 87% des pros</div>
            <div className="pricing-name">Pro</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginRight: '6px' }}>{isAnnual ? '1188 EUR' : '149 EUR'}</span>
              <span>EUR</span> {isAnnual ? Math.round(99 * 12 * 0.8) : 99}<span>/{isAnnual ? 'an' : 'mois'}</span>
            </div>
            <div className="pricing-period" style={{ color: '#34c759', fontWeight: 600, fontSize: '13px' }}>Sans engagement — resiliable en 1 clic</div>
            <div style={{ fontSize: '16px', color: '#34c759', marginTop: '8px', marginBottom: '16px', fontWeight: 700, background: '#d4f4e7', padding: '12px', borderRadius: '6px' }}>
              ✓ Mise en service OFFERTE
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> <strong>Alertes illimitées</strong></li>
              <li><CheckIcon /> <strong>Scan en temps reel</strong> ({'<'} 30 sec)</li>
              <li><CheckIcon /> <strong>Plusieurs canaux au choix</strong></li>
              <li><CheckIcon /> WhatsApp + Email</li>
              <li><CheckIcon /> Filtres avances (km, 1ere main, CT...)</li>
              <li><CheckIcon /> Historique des prix</li>
              <li><CheckIcon /> Support prioritaire WhatsApp</li>
              <li><CheckIcon /> Nouvelles sources en avant-premiere</li>
            </ul>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px', lineHeight: 1.4, background: '#f0f7ff', borderRadius: '8px', padding: '10px 12px' }}>
              Soit <strong>{isAnnual ? (Math.round(99 * 12 * 0.8) / 365).toFixed(2) : '3,30'} EUR/jour</strong> — rentabilise des le 1er deal. En moyenne, nos utilisateurs Pro trouvent leur premier deal rentable en 4 jours.
            </div>
            <button
              className="pricing-btn primary"
              onClick={() => checkout('pro', isAnnual ? 'annual' : 'monthly')}
              disabled={loadingPlan === (isAnnual ? 'pro_annual' : 'pro_monthly')}
              style={{ fontSize: '1.05rem', padding: '14px 24px' }}
            >
              {loadingPlan?.startsWith('pro') ? 'Chargement...' : 'Passer Pro — Activation en 24h'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
