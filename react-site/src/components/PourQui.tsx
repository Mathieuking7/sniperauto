import { useEffect, useRef } from 'react'

export default function PourQui() {
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
    <section className="pour-qui" id="pour-qui" ref={sectionRef}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="section-title animate-on-scroll">Pour qui ?</h2>
        <p className="section-subtitle animate-on-scroll">Peu importe votre métier ou votre budget. Si vous achetez des véhicules, c'est fait pour vous.</p>
        <div className="pq-grid">
          <div className="pq-card animate-on-scroll">
            <div className="pq-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="pq-name">Mandataire</div>
            <div className="pq-desc">Les meilleures affaires pour vos clients</div>
          </div>
          <div className="pq-card animate-on-scroll">
            <div className="pq-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 00-8 0v2" />
              </svg>
            </div>
            <div className="pq-name">Agent automobile</div>
            <div className="pq-desc">Sourcez plus vite, vendez plus</div>
          </div>
          <div className="pq-card animate-on-scroll">
            <div className="pq-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div className="pq-name">Garagiste</div>
            <div className="pq-desc">Alimentez votre parc à prix imbattable</div>
          </div>
          <div className="pq-card animate-on-scroll">
            <div className="pq-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="pq-name">Négociant</div>
            <div className="pq-desc">Accédez aux deals avant la concurrence</div>
          </div>
          <div className="pq-card animate-on-scroll">
            <div className="pq-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="pq-name">Marchand VO</div>
            <div className="pq-desc">Recevez les pépites sans les chercher</div>
          </div>
          <div className="pq-card animate-on-scroll">
            <div className="pq-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="pq-name">Préparateur</div>
            <div className="pq-desc">Trouvez la bonne base à transformer</div>
          </div>
          <div className="pq-more animate-on-scroll">
            <span>Et aussi :
              <span className="pq-more-chip">Carrossier</span>
              <span className="pq-more-chip">Export</span>
              <span className="pq-more-chip">Loueur</span>
              <span className="pq-more-chip">Concessionnaire</span>
              <span className="pq-more-chip">Investisseur auto</span>
              <span className="pq-more-chip">Particulier malin</span>
            </span>
          </div>
        </div>
        <div className="pq-banner animate-on-scroll">
          <div className="pq-banner-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div className="pq-banner-text" style={{ textAlign: 'left' }}>
            <div className="pq-banner-title">500 EUR ou 50 000 EUR, 1 voiture ou 10 par semaine</div>
            <div className="pq-banner-sub">SniperAuto s'adapte à votre budget et votre volume. Changez vos critères à tout moment, sans engagement.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
