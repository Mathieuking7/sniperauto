import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMobile = () => setMenuOpen(false)

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#007AFF" strokeWidth="2" fill="none" style={{ animation: 'target-pulse 2.5s ease-in-out infinite' }} />
              <circle cx="14" cy="14" r="7" stroke="#007AFF" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2.5" fill="#007AFF" />
              <line x1="14" y1="0" x2="14" y2="8" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="20" x2="14" y2="28" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="14" x2="8" y2="14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="14" x2="28" y2="14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            SniperAuto
          </a>
          <ul className="nav-links">
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#how">Comment ça marche</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#pricing" className="nav-cta">Commencer</a></li>
          </ul>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#features" onClick={closeMobile}>Fonctionnalités</a>
        <a href="#how" onClick={closeMobile}>Comment ça marche</a>
        <a href="#pricing" onClick={closeMobile}>Tarifs</a>
        <a href="#faq" onClick={closeMobile}>FAQ</a>
        <a href="#pricing" onClick={closeMobile} className="btn-primary">Commencer</a>
      </div>
    </>
  )
}
