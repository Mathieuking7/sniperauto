import { useEffect, useRef, useState } from 'react'

const DURATION = 4000
const colors = ['#007AFF', '#5856D6', '#25D366']

export default function HowItWorks() {
  const [current, setCurrent] = useState(0)
  const [exitIdx, setExitIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number>(0)
  const sectionRef = useRef<HTMLElement>(null)

  const goTo = (idx: number) => {
    setExitIdx(current)
    setTimeout(() => setExitIdx(null), 650)
    setCurrent(idx)
    startTimeRef.current = Date.now()
    setProgress(0)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => {
        setExitIdx(c)
        setTimeout(() => setExitIdx(null), 650)
        startTimeRef.current = Date.now()
        setProgress(0)
        return (c + 1) % 3
      })
    }, DURATION)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    function updateBar() {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      rafRef.current = requestAnimationFrame(updateBar)
    }
    rafRef.current = requestAnimationFrame(updateBar)
    return () => cancelAnimationFrame(rafRef.current)
  }, [current])

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

  const slides = [
    {
      title: 'Configurez vos critères',
      text: "Budget de 500 à 50 000 EUR, marque, kilométrage... Modifiez tout à n'importe quel moment. Votre recherche, vos règles.",
      tag: 'Étape 1',
      step: 1,
    },
    {
      title: 'Tri intelligent par descriptif',
      text: "Excluez les voitures avec voyant moteur, défauts à l'essai routier, ou tout autre critère. SniperAuto fait le tri et vous fait gagner des heures de recherche.",
      tag: 'Étape 2',
      step: 2,
    },
    {
      title: 'Alerte WhatsApp instantanée',
      text: "Photo, prix, lien direct. Seules les annonces qui matchent exactement vos critères. Vous achetez avant tout le monde.",
      tag: 'Étape 3',
      step: 3,
    },
  ]

  return (
    <section className="how-it-works" id="how" ref={sectionRef}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="how-tagline animate-on-scroll">Simple. Rapide. Efficace.</div>
        <h2 className="section-title animate-on-scroll">Comment ça marche</h2>
        <p className="section-subtitle animate-on-scroll">2 minutes pour configurer. Le reste est automatique.</p>
        <div className="how-carousel">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`how-slide${i === current ? ' active' : ''}${i === exitIdx ? ' exit-left' : ''}`}
            >
              <div className="how-slide-step">{slide.step}</div>
              <span className="how-slide-tag">{slide.tag}</span>
              <h3>{slide.title}</h3>
              <p>{slide.text}</p>
              <div className="how-progress">
                <div
                  className="how-progress-bar"
                  style={{
                    width: i === current ? `${progress}%` : '0%',
                    background: colors[current],
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="how-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`how-dot${i === current ? ' active' : ''}`}
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current)
                goTo(i)
                intervalRef.current = setInterval(() => {
                  setCurrent((c) => {
                    setExitIdx(c)
                    setTimeout(() => setExitIdx(null), 650)
                    startTimeRef.current = Date.now()
                    setProgress(0)
                    return (c + 1) % 3
                  })
                }, DURATION)
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
