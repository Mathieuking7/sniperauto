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
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistMessage, setWaitlistMessage] = useState('')
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
    <>
      <section className="pricing" id="pricing" ref={sectionRef}>
        <div className="container">
          <h2 className="section-title animate-on-scroll">Liste d'attente SniperAuto</h2>
          <p className="section-subtitle animate-on-scroll">Nous avons beaucoup de clients en attente. Rejoignez la liste et nous vous recontacterons pour intégrer SniperAuto dès qu’une place se libère.</p>

          <div className="pricing-grid pricing-grid-1">
            <div className="pricing-card animate-on-scroll" style={{ gridColumn: '1 / -1', maxWidth: '720px', margin: '0 auto' }}>
              <div className="pricing-name">Rejoindre la liste d'attente</div>
              <p style={{ color: '#444', fontSize: '15px', lineHeight: 1.6, margin: '12px 0 18px' }}>
                Nous avons beaucoup de clients en attente. Rejoignez la liste et nous vous recontacterons pour intégrer SniperAuto dès qu’une place se libère.
              </p>
              <ul className="pricing-features">
                <li><CheckIcon /> Priorité de recontact</li>
                <li><CheckIcon /> Intégration dès qu’une place se libère</li>
                <li><CheckIcon /> Accompagnement par notre équipe</li>
              </ul>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setWaitlistMessage('')
                  if (!waitlistEmail) {
                    setWaitlistMessage('Entrez votre email pour rejoindre la liste d’attente.')
                    return
                  }
                  setWaitlistLoading(true)
                  try {
                    const res = await fetch('/api/waitlist', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: waitlistEmail }),
                    })
                    const data = await res.json()
                    if (data.ok) {
                      setWaitlistMessage('Vous êtes bien inscrit à la liste d’attente.')
                      setWaitlistEmail('')
                    } else {
                      setWaitlistMessage('Impossible d’ajouter votre email pour le moment.')
                    }
                  } catch {
                    setWaitlistMessage('Erreur de connexion, réessayez.')
                  } finally {
                    setWaitlistLoading(false)
                  }
                }}
              >
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '12px', fontSize: '15px' }}
                />
                <button className="pricing-btn primary" type="submit" disabled={waitlistLoading}>
                  {waitlistLoading ? 'Inscription...' : "Rejoindre la liste d'attente"}
                </button>
                {waitlistMessage && (
                  <p style={{ marginTop: '12px', fontSize: '14px', color: '#555' }}>{waitlistMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
