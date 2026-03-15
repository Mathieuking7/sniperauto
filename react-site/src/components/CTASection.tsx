import { useEffect, useRef } from 'react'

export default function CTASection() {
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
    <section className="cta-section" ref={sectionRef}>
      <div className="container">
        <div className="cta-card animate-on-scroll">
          <h2>Ne ratez plus aucun deal</h2>
          <p>Chaque minute compte. Commencez à recevoir les meilleures affaires Auto1 directement sur WhatsApp.</p>
          <a href="#pricing" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '16px', padding: '16px 32px', marginTop: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            Voir les offres
          </a>
        </div>
      </div>
    </section>
  )
}
