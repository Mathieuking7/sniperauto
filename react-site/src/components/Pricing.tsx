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

  const checkout = async (plan: string) => {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing: 'monthly' }),
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
        <p className="section-subtitle animate-on-scroll">Pendant que vous comparez, un abonne Pro vient de recevoir une alerte.</p>

        <div className="pricing-grid pricing-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1.08fr 1fr', gap: '1.5rem', maxWidth: '1100px', margin: '3rem auto 0' }}>

          {/* Essentiel — Decoy */}
          <div className="pricing-card animate-on-scroll" style={{ opacity: 0.85 }}>
            <div className="pricing-name" style={{ color: '#888' }}>Essentiel</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span>EUR</span> 39<span>/mois</span>
            </div>
            <div className="pricing-period" style={{ color: '#e53e3e', fontWeight: 600, fontSize: '13px' }}>Engagement 6 mois minimum</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
              Soit 234 EUR minimum
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> 1 alerte active</li>
              <li><CheckIcon /> Scan toutes les 60 min</li>
              <li><CheckIcon /> Surveillance Auto1 uniquement</li>
              <li><CheckIcon /> Alertes WhatsApp</li>
              <li><CheckIcon /> Support par email</li>
              <li style={{ color: '#bbb' }}><CrossIcon /> <s>Facebook Marketplace</s></li>
              <li style={{ color: '#bbb' }}><CrossIcon /> <s>Le Bon Coin</s></li>
              <li style={{ color: '#bbb' }}><CrossIcon /> <s>Aramis Auto Pro</s></li>
              <li style={{ color: '#bbb' }}><CrossIcon /> <s>Alertes instantanees</s></li>
              <li style={{ color: '#bbb' }}><CrossIcon /> <s>Historique des prix</s></li>
            </ul>
            <div style={{ fontSize: '11px', color: '#e53e3e', marginBottom: '12px', lineHeight: 1.4 }}>
              Avec un scan toutes les 60 min, les meilleures affaires sont deja prises par les abonnes Pro.
            </div>
            <button
              className="pricing-btn secondary"
              onClick={() => checkout('essentiel')}
              disabled={loadingPlan === 'essentiel'}
            >
              {loadingPlan === 'essentiel' ? 'Chargement...' : "Demarrer avec l'Essentiel"}
            </button>
          </div>

          {/* Pro — Target */}
          <div className="pricing-card popular animate-on-scroll" style={{ transform: 'scale(1.04)', zIndex: 2 }}>
            <div className="popular-badge">Choisi par 87% des pros</div>
            <div className="pricing-name">Pro</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginRight: '6px' }}>149 EUR</span>
              <span>EUR</span> 99<span>/mois</span>
            </div>
            <div className="pricing-period" style={{ color: '#34c759', fontWeight: 600, fontSize: '13px' }}>Sans engagement — resiliable en 1 clic</div>
            <div style={{ fontSize: '12px', color: '#007AFF', marginTop: '4px', marginBottom: '16px', fontWeight: 600 }}>
              Mise en service OFFERTE
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> <strong>25 alertes differentes</strong></li>
              <li><CheckIcon /> <strong>Scan en temps reel</strong> ({'<'} 30 sec)</li>
              <li><CheckIcon /> <strong>4 sources :</strong> Auto1 + LBC + FB + Aramis</li>
              <li><CheckIcon /> WhatsApp + Email</li>
              <li><CheckIcon /> Filtres avances (km, 1ere main, CT...)</li>
              <li><CheckIcon /> Historique des prix</li>
              <li><CheckIcon /> Support prioritaire WhatsApp</li>
              <li><CheckIcon /> Nouvelles sources en avant-premiere</li>
            </ul>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px', lineHeight: 1.4, background: '#f0f7ff', borderRadius: '8px', padding: '10px 12px' }}>
              Soit <strong>3,30 EUR/jour</strong> — rentabilise des le 1er deal. En moyenne, nos utilisateurs Pro trouvent leur premier deal rentable en 4 jours.
            </div>
            <button
              className="pricing-btn primary"
              onClick={() => checkout('pro')}
              disabled={loadingPlan === 'pro'}
              style={{ fontSize: '1.05rem', padding: '14px 24px' }}
            >
              {loadingPlan === 'pro' ? 'Chargement...' : 'Passer Pro — Activation en 24h'}
            </button>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
              Satisfait ou rembourse 14 jours — sans condition
            </div>
          </div>

          {/* Sur-Mesure — Anchor */}
          <div className="pricing-card animate-on-scroll" style={{ opacity: 0.85 }}>
            <div className="pricing-name" style={{ color: '#888' }}>Sur-Mesure</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span>A partir de</span> 249<span>EUR/mois</span>
            </div>
            <div className="pricing-period">Pour les structures a gros volumes</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
              Mise en service offerte
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> Tout le plan Pro inclus</li>
              <li><CheckIcon /> Volume d'alertes personnalise</li>
              <li><CheckIcon /> Criteres de recherche sur-mesure</li>
              <li><CheckIcon /> Integration avec vos outils (DMS, CRM)</li>
              <li><CheckIcon /> Account manager dedie</li>
              <li><CheckIcon /> Onboarding personnalise</li>
              <li><CheckIcon /> SLA garanti</li>
            </ul>
            <a
              href="#contact"
              className="pricing-btn secondary"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
