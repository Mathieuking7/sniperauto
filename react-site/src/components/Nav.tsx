import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMobile = () => setMenuOpen(false)

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ overflow: 'visible' }}>
              <defs>
                {/* Dégradé pour le sweep radar */}
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                </radialGradient>
                {/* Masque pour l'arc du sweep */}
                <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Cercle extérieur pulsant */}
              <circle cx="14" cy="14" r="12" stroke="#007AFF" strokeWidth="1.5" fill="none"
                style={{ animation: 'logo-outer-pulse 3s ease-in-out infinite' }} />

              {/* Ring de scan qui s'expand et disparaît */}
              <circle cx="14" cy="14" r="12" stroke="#007AFF" strokeWidth="1" fill="none" opacity="0"
                style={{ animation: 'logo-scan-ring 3s ease-out infinite' }} />

              {/* Cercle intérieur */}
              <circle cx="14" cy="14" r="7" stroke="#007AFF" strokeWidth="1.2" fill="none" opacity="0.6" />

              {/* Sweep radar qui tourne */}
              <g style={{ transformOrigin: '14px 14px', animation: 'logo-sweep 2.5s linear infinite' }}>
                <path
                  d="M14 14 L14 2"
                  stroke="#007AFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                {/* Traîne lumineuse derrière le sweep */}
                <path
                  d="M14 14 L19.5 3.5"
                  stroke="#007AFF"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <path
                  d="M14 14 L23 7"
                  stroke="#007AFF"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.15"
                />
              </g>

              {/* Croix des réticules */}
              <line x1="14" y1="1" x2="14" y2="6" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="14" y1="22" x2="14" y2="27" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="1" y1="14" x2="6" y2="14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="22" y1="14" x2="27" y2="14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

              {/* Point central pulsant */}
              <circle cx="14" cy="14" r="2.5" fill="#007AFF"
                style={{ animation: 'logo-dot-pulse 2.5s ease-in-out infinite' }} />
              {/* Halo autour du point */}
              <circle cx="14" cy="14" r="2.5" fill="#007AFF" opacity="0"
                style={{ animation: 'logo-dot-halo 2.5s ease-out infinite' }} />
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
