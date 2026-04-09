import { useEffect, useRef } from 'react'

export default function Marketplaces() {
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

  return (
    <section className="marketplaces" id="features" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title animate-on-scroll">Sources surveillées</h2>
        <p className="section-subtitle animate-on-scroll">Nous scannons les plus grandes plateformes pour détecter les meilleures affaires.</p>

        <div className="mp-featured animate-on-scroll">
          <div className="mp-status-wrap">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/auto1.png" alt="Auto1 logo" />
            </div>
            <div className="mp-signal">
              <div className="mp-signal-dot"></div>
              <div className="mp-signal-ring"></div>
            </div>
          </div>
          <div className="mp-info">
            <div className="mp-name">Auto1.com</div>
            <div className="mp-status-label"><span className="dot"></span> En ligne — Surveillance active</div>
            <div className="mp-desc">Scan en temps réel 24h/24. Chaque nouvelle annonce est analysée en quelques secondes.</div>
          </div>
        </div>

        <div className="mp-featured animate-on-scroll" style={{ marginTop: '1.5rem' }}>
          <div className="mp-status-wrap">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/aramis.svg" alt="Aramis Auto Pro logo" style={{ height: '28px' }} />
            </div>
            <div className="mp-signal">
              <div className="mp-signal-dot"></div>
              <div className="mp-signal-ring"></div>
            </div>
          </div>
          <div className="mp-info">
            <div className="mp-name">Aramis Auto Pro</div>
            <div className="mp-status-label"><span className="dot"></span> En ligne — Surveillance active</div>
            <div className="mp-desc">Accès aux ventes pro Aramis : preview des annonces à venir, points forts et avis expert envoyés directement sur WhatsApp.</div>
          </div>
        </div>

        <div className="mp-featured animate-on-scroll" style={{ marginTop: '1.5rem' }}>
          <div className="mp-status-wrap">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/leboncoin.png" alt="Le Bon Coin logo" />
            </div>
            <div className="mp-signal">
              <div className="mp-signal-dot"></div>
              <div className="mp-signal-ring"></div>
            </div>
          </div>
          <div className="mp-info">
            <div className="mp-name">Le Bon Coin</div>
            <div className="mp-status-label"><span className="dot"></span> En ligne — Surveillance active</div>
            <div className="mp-desc">Scan des annonces auto Le Bon Coin en continu. Détection instantanée des bonnes affaires près de chez vous.</div>
          </div>
        </div>

        <div className="mp-featured animate-on-scroll" style={{ marginTop: '1.5rem' }}>
          <div className="mp-status-wrap">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/facebook.png" alt="Facebook Marketplace logo" />
            </div>
            <div className="mp-signal">
              <div className="mp-signal-dot"></div>
              <div className="mp-signal-ring"></div>
            </div>
          </div>
          <div className="mp-info">
            <div className="mp-name">Facebook Marketplace</div>
            <div className="mp-status-label"><span className="dot"></span> En ligne — Surveillance active</div>
            <div className="mp-desc">Surveillance des annonces véhicules sur Facebook Marketplace. Alertes WhatsApp dès qu'un deal apparaît.</div>
          </div>
        </div>

        <div className="mp-coming-row">
          <div className="mp-coming-card animate-on-scroll">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/lacentrale.png" alt="La Centrale logo" />
            </div>
            <div>
              <div className="mp-name">La Centrale</div>
              <div className="mp-offline"><span className="dot"></span> Bientôt disponible</div>
            </div>
          </div>
          <div className="mp-coming-card animate-on-scroll">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/paruvendu.png" alt="ParuVendu logo" />
            </div>
            <div>
              <div className="mp-name">ParuVendu</div>
              <div className="mp-offline"><span className="dot"></span> Bientôt disponible</div>
            </div>
          </div>
        </div>

        <div className="mp-custom-request animate-on-scroll" style={{ marginTop: '2.5rem', textAlign: 'center', padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)', borderRadius: '16px', border: '1px dashed #007AFF' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Une autre plateforme en tête ?</div>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>Vous souhaitez surveiller une plateforme qui n'est pas dans la liste ? Contactez-nous — tout est possible.</p>
          <a href="#contact" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', padding: '0.7rem 1.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  )
}
