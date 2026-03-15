import { useEffect, useRef, useState } from 'react'

const faqs = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    question: "Comment fonctionne la surveillance d'Auto1 ?",
    answer: "Notre algorithme scanne Auto1 en continu, analysant chaque nouvelle annonce dès sa publication. Quand un véhicule correspond à vos critères, vous recevez une alerte WhatsApp en quelques secondes.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    question: "Puis-je configurer plusieurs alertes ?",
    answer: "Oui, selon votre plan. Le plan Essentiel inclut 3 alertes et le plan Pro 10 alertes. Chaque alerte peut avoir ses propres critères de recherche.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    question: "Quand les autres marketplaces seront-elles disponibles ?",
    answer: "Le Bon Coin et La Centrale sont prévus pour le T2 2026. ParuVendu et Facebook Marketplace suivront au T3. Commencez maintenant pour être informé en priorité.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    question: "Puis-je annuler mon abonnement ?",
    answer: "Oui, vous pouvez annuler à tout moment sans aucuns frais. Votre abonnement reste actif jusqu'à la fin de la période en cours.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    question: "Comment recevrai-je les alertes ?",
    answer: "Les alertes sont envoyées directement sur WhatsApp via notre bot vérifié. Le plan Pro inclut également des notifications par email. Aucune application supplémentaire à installer.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    question: "SniperAuto est-il adapté aux particuliers ?",
    answer: "SniperAuto est conçu principalement pour les professionnels de l'automobile (garagistes, négociants, mandataires), mais le plan Essentiel convient parfaitement aux particuliers à la recherche d'une bonne affaire.",
  },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const toggle = (i: number) => {
    setOpenIdx(openIdx === i ? null : i)
  }

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
    <section className="faq" id="faq" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title animate-on-scroll">Questions fréquentes</h2>
        <p className="section-subtitle animate-on-scroll">Tout ce que vous devez savoir sur SniperAuto.</p>
        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-card animate-on-scroll${openIdx === i ? ' open' : ''}`}
              onClick={() => toggle(i)}
            >
              <div className="faq-card-header">
                <div className="faq-card-icon">{faq.icon}</div>
                <div className="faq-card-question">{faq.question}</div>
              </div>
              <div className="faq-card-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
