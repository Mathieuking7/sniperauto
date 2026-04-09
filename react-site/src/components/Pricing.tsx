import { useEffect, useRef, useState } from 'react'
import CheckoutModal from './CheckoutModal'

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
  const [isAnnual, setIsAnnual] = useState(false)
  const [modal, setModal] = useState<{ plan: string; billing: string; planLabel: string; price: string } | null>(null)
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

  const openModal = (plan: string) => {
    const billing = isAnnual ? 'annual' : 'monthly'
    const planLabel = plan === 'pro' ? 'Pro' : 'Essentiel'
    const priceStr = plan === 'pro'
      ? (isAnnual ? '470 € / an' : '49 € / mois')
      : (isAnnual ? '278 € / an' : '29 € / mois')
    setModal({ plan, billing, planLabel, price: priceStr })
  }

  return (
    <>
      {modal && (
        <CheckoutModal
          plan={modal.plan}
          billing={modal.billing}
          planLabel={modal.planLabel}
          price={modal.price}
          onClose={() => setModal(null)}
        />
      )}

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
                  border: 'none', borderRadius: '16px',
                  width: '48px', height: '24px', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.3s',
                }}
              >
                <div style={{
                  position: 'absolute', width: '20px', height: '20px',
                  background: 'white', borderRadius: '50%', top: '2px',
                  left: isAnnual ? '26px' : '2px', transition: 'left 0.3s',
                }} />
              </button>
              <span style={{ color: isAnnual ? '#000' : '#999', fontWeight: isAnnual ? 600 : 400 }}>
                Annuel <span style={{ color: '#34c759', fontWeight: 700 }}>-20%</span>
              </span>
            </div>
          </div>

          <div className="pricing-grid pricing-grid-2">

            {/* Essentiel */}
            <div className="pricing-card animate-on-scroll">
              <div className="pricing-name">Essentiel</div>
              <div className="pricing-price" style={{ opacity: 1 }}>
                <span>EUR</span> {isAnnual ? 278 : 29}<span>/{isAnnual ? 'an' : 'mois'}</span>
              </div>
              <div className="pricing-period" style={{ color: '#666', fontWeight: 600, fontSize: '13px' }}>Sans engagement</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                + Frais de mise en service : 50 EUR
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
                onClick={() => openModal('essentiel')}
              >
                Démarrer avec l'Essentiel
              </button>
            </div>

            {/* Pro */}
            <div className="pricing-card popular animate-on-scroll" style={{ transform: 'scale(1.04)', zIndex: 2 }}>
              <div className="popular-badge">Choisi par 87% des pros</div>
              <div className="pricing-name">Pro</div>
              <div className="pricing-price" style={{ opacity: 1 }}>
                <span>EUR</span> {isAnnual ? 470 : 49}<span>/{isAnnual ? 'an' : 'mois'}</span>
              </div>
              <div className="pricing-period" style={{ color: '#34c759', fontWeight: 600, fontSize: '13px' }}>Sans engagement — résiliable en 1 clic</div>
              <div style={{ fontSize: '16px', color: '#34c759', marginTop: '8px', marginBottom: '16px', fontWeight: 700, background: '#d4f4e7', padding: '12px', borderRadius: '6px' }}>
                ✓ Mise en service OFFERTE
              </div>
              <ul className="pricing-features">
                <li><CheckIcon /> <strong>Alertes illimitées</strong></li>
                <li><CheckIcon /> <strong>Scan en temps réel</strong> ({'<'} 30 sec)</li>
                <li><CheckIcon /> <strong>Plusieurs canaux au choix</strong></li>
                <li><CheckIcon /> WhatsApp + Email</li>
                <li><CheckIcon /> Filtres avancés (km, 1ère main, CT...)</li>
                <li><CheckIcon /> Historique des prix</li>
                <li><CheckIcon /> Support prioritaire WhatsApp</li>
                <li><CheckIcon /> Nouvelles sources en avant-première</li>
              </ul>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px', lineHeight: 1.4, background: '#f0f7ff', borderRadius: '8px', padding: '10px 12px' }}>
                Soit <strong>{isAnnual ? (470 / 365).toFixed(2) : '1,63'} EUR/jour</strong> — rentabilisé dès le 1er deal.
              </div>
              <button
                className="pricing-btn primary"
                onClick={() => openModal('pro')}
                style={{ fontSize: '1.05rem', padding: '14px 24px' }}
              >
                Passer Pro — Activation en 24h
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
