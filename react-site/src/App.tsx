import { useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marketplaces from './components/Marketplaces'
import HowItWorks from './components/HowItWorks'
import PourQui from './components/PourQui'
import DealsRates from './components/DealsRates'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

function FloatingBg() {
  return (
    <div className="floating-bg">
      <svg className="floating-shape" width="80" height="40" viewBox="0 0 80 40" fill="none"><path d="M10 30 Q20 10 40 15 Q60 5 70 20 Q75 28 70 30 Z" fill="#007AFF" /></svg>
      <svg className="floating-shape" width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M8 24 Q15 8 30 12 Q45 4 52 16 Q56 22 52 24 Z" fill="#5856d6" /></svg>
      <svg className="floating-shape" width="70" height="35" viewBox="0 0 70 35" fill="none"><path d="M9 28 Q18 9 35 13 Q52 4 62 18 Q66 25 62 28 Z" fill="#007AFF" /></svg>
      <svg className="floating-shape" width="50" height="25" viewBox="0 0 50 25" fill="none"><path d="M6 20 Q12 6 25 10 Q38 3 44 14 Q47 19 44 20 Z" fill="#5856d6" /></svg>
      <svg className="floating-shape" width="90" height="45" viewBox="0 0 90 45" fill="none"><path d="M12 36 Q24 12 45 18 Q66 6 78 24 Q84 33 78 36 Z" fill="#007AFF" /></svg>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const handleScroll = () => {
      const s = window.scrollY
      document.querySelectorAll('.floating-shape').forEach((el, i) => {
        ;(el as HTMLElement).style.transform = `translateY(${s * (0.02 + i * 0.01)}px)`
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <FloatingBg />
      <Nav />
      <Hero />
      <Marketplaces />
      <HowItWorks />
      <PourQui />
      <DealsRates />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </>
  )
}
