import { useEffect, useRef } from 'react'

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#ff9500">
    <path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.4 3.5 14.7l.9-5L.8 6.2l5-.7z" />
  </svg>
)

function Stars() {
  return (
    <div className="ticker-stars">
      {[0,1,2,3,4].map(i => <StarIcon key={i} />)}
    </div>
  )
}

const testimonials = [
  { initial: 'K', color: '#007AFF', name: 'Karim B.', role: 'Garagiste, Marseille', deal: '+3 deals', text: '"Depuis la bêta, j\'ai acheté 3 véhicules à des prix imbattables. L\'alerte WhatsApp est redoutablement efficace."' },
  { initial: 'S', color: '#34c759', name: 'Sophie M.', role: 'Négociante, Lyon', deal: '-2h/jour', text: '"Je passais 2h par jour à scanner les sites. Maintenant SniperAuto fait le travail et je reçois les pépites."' },
  { initial: 'T', color: '#ff9500', name: 'Thomas R.', role: 'Mandataire, Nantes', deal: '+2 700 EUR', text: '"Golf VII à 4 500 EUR revendue 7 200 EUR en 3 semaines. SniperAuto se rentabilise dès le premier deal."' },
  { initial: 'M', color: '#ff3b30', name: 'Marc D.', role: 'Revendeur, Paris', deal: '+5 deals', text: '"Indispensable. J\'achète exclusivement via les alertes SniperAuto maintenant. Mes concurrents ne comprennent pas."' },
  { initial: 'L', color: '#5856d6', name: 'Laurent P.', role: 'Garagiste, Lille', deal: '+1 800 EUR', text: '"Première semaine, premier deal. Clio IV à 2 100 EUR revendue 3 900 EUR. Le ROI est immédiat."' },
]

const allTestimonials = [...testimonials, ...testimonials]

function animateCount(el: HTMLElement, target: number, duration: number) {
  if ((el as HTMLElement & { dataset: DOMStringMap }).dataset.animated) return
  ;(el as HTMLElement & { dataset: DOMStringMap }).dataset.animated = '1'
  const start = performance.now()
  const fmt = (n: number) => n.toLocaleString('fr-FR')
  function tick(now: number) {
    const p = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3)
    el.textContent = fmt(Math.floor(ease * target))
    if (p < 1) requestAnimationFrame(tick)
    else el.textContent = fmt(target)
  }
  requestAnimationFrame(tick)
}

export default function Testimonials() {
  const bigRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            if (e.target === bigRef.current) {
              animateCount(bigRef.current!, 1248, 1800)
            }
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) {
      sectionRef.current.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
    }
    if (bigRef.current) observer.observe(bigRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="testimonials" id="testimonials" ref={sectionRef}>
      <div className="container">
        <div className="waitlist-count animate-on-scroll">
          <div className="big" ref={bigRef}>0</div>
          <div className="label">professionnels nous font confiance</div>
        </div>
        <h2 className="section-title animate-on-scroll">Ils ont testé, ils racontent</h2>
        <p className="section-subtitle animate-on-scroll">Retours de nos bêta-testeurs.</p>
      </div>
      <div className="testimonial-ticker animate-on-scroll">
        <div className="ticker-track">
          {allTestimonials.map((t, i) => (
            <div className="ticker-card" key={i}>
              <div className="ticker-top">
                <div className="ticker-avatar" style={{ background: t.color }}>{t.initial}</div>
                <div className="ticker-info">
                  <div className="ticker-name">{t.name}</div>
                  <div className="ticker-role">{t.role}</div>
                </div>
                <div className="ticker-deal">{t.deal}</div>
              </div>
              <p>{t.text}</p>
              <Stars />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
