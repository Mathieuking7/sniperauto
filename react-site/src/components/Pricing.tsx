import { useEffect, useRef, useState } from 'react'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l4 4 6-7" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
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
    const billing = isAnnual ? 'annual' : 'monthly'
    setLoadingPlan(plan)
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
        <h2 className="section-title animate-on-scroll">1 seul deal suffit à rentabiliser 10x votre abonnement annuel.</h2>
        <p className="section-subtitle animate-on-scroll">Le reste, c'est du bonus.</p>
        <div className="toggle-wrap animate-on-scroll">
          <span className={`toggle-label${!isAnnual ? ' active' : ''}`}>Mensuel</span>
          <button
            className={`toggle-switch${isAnnual ? ' active' : ''}`}
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label="Changer la facturation"
          ></button>
          <span className={`toggle-label${isAnnual ? ' active' : ''}`}>
            Annuel <span style={{ color: 'var(--green)', fontSize: '12px' }}>-20%</span>
          </span>
        </div>
        <div className="pricing-grid pricing-grid-2">
          {/* Essentiel */}
          <div className="pricing-card animate-on-scroll">
            <div className="pricing-name">Essentiel</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span>EUR</span> {isAnnual ? '23' : '29'}<span>/mois</span>
            </div>
            <div className="pricing-period" style={{ display: isAnnual ? 'none' : '' }}>Facturé mensuellement</div>
            <div className="pricing-period" style={{ display: isAnnual ? '' : 'none' }}>Facturé annuellement</div>
            <div className={`savings-badge${isAnnual ? ' show' : ''}`}>Économisez 72 EUR/an</div>
            <div className="pricing-setup" style={{ fontSize: '12px', marginTop: '4px', marginBottom: '12px' }}>
              Frais de mise en service : 50 EUR
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> 1 alerte active</li>
              <li><CheckIcon /> Scan toutes les 30 min</li>
              <li><CheckIcon /> Surveillance Auto1</li>
              <li><CheckIcon /> Alertes WhatsApp</li>
              <li><CheckIcon /> Support par email</li>
            </ul>
            <button
              className="pricing-btn secondary"
              onClick={() => checkout('essentiel')}
              disabled={loadingPlan === 'essentiel'}
            >
              {loadingPlan === 'essentiel' ? 'Chargement...' : "S'abonner"}
            </button>
          </div>
          {/* Pro */}
          <div className="pricing-card popular animate-on-scroll">
            <div className="popular-badge">Recommandé</div>
            <div className="pricing-name">Pro</div>
            <div className="pricing-price" style={{ opacity: 1 }}>
              <span>EUR</span> {isAnnual ? '39' : '49'}<span>/mois</span>
            </div>
            <div className="pricing-period" style={{ display: isAnnual ? 'none' : '' }}>Facturé mensuellement</div>
            <div className="pricing-period" style={{ display: isAnnual ? '' : 'none' }}>Facturé annuellement</div>
            <div className={`savings-badge${isAnnual ? ' show' : ''}`}>Économisez 120 EUR/an</div>
            <div className="pricing-setup" style={{ fontSize: '12px', marginTop: '4px', marginBottom: '12px' }}>
              Frais de mise en service : 20 EUR
            </div>
            <ul className="pricing-features">
              <li><CheckIcon /> Jusqu'à 10 alertes différentes</li>
              <li><CheckIcon /> Scan en direct (temps réel)</li>
              <li><CheckIcon /> Surveillance Auto1</li>
              <li><CheckIcon /> WhatsApp + Email</li>
              <li><CheckIcon /> Nouvelles sources en avant-première (Le Bon Coin, La Centrale...)</li>
              <li><CheckIcon /> Historique des prix</li>
              <li><CheckIcon /> Support prioritaire</li>
            </ul>
            <button
              className="pricing-btn primary"
              onClick={() => checkout('pro')}
              disabled={loadingPlan === 'pro'}
            >
              {loadingPlan === 'pro' ? 'Chargement...' : "S'abonner"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
