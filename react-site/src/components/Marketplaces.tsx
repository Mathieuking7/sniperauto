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

        <div className="mp-coming-row">
          <div className="mp-coming-card animate-on-scroll">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/leboncoin.png" alt="Le Bon Coin logo" />
            </div>
            <div>
              <div className="mp-name">Le Bon Coin</div>
              <div className="mp-offline"><span className="dot"></span> Bientôt disponible</div>
            </div>
          </div>
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
          <div className="mp-coming-card animate-on-scroll">
            <div className="mp-logo" style={{ background: '#fff' }}>
              <img src="/logos/facebook.png" alt="Facebook Marketplace logo" />
            </div>
            <div>
              <div className="mp-name">FB Marketplace</div>
              <div className="mp-offline"><span className="dot"></span> Bientôt disponible</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
