import { useEffect, useRef, useState } from 'react'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export default function VideoDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [mobile] = useState(() => isMobile())

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
    if (containerRef.current) {
      containerRef.current.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
    }
    return () => observer.disconnect()
  }, [])

  const handlePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.play()
    setIsPlaying(true)
    setShowOverlay(false)
  }

  const handleVideoClick = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    } else if ((video as any).webkitRequestFullscreen) {
      ;(video as any).webkitRequestFullscreen()
    }
  }

  return (
    <section className="video-demo-section" ref={containerRef}>
      <div className="container">
        <div className="video-demo-header animate-on-scroll">
          <span className="video-demo-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Vidéo de présentation
          </span>
          <h2 className="video-demo-title">Découvrez SniperAuto en 30 secondes</h2>
          <p className="video-demo-subtitle">
            Voyez comment nos clients trouvent les meilleures affaires avant tout le monde
          </p>
        </div>

        <div className="video-demo-player animate-on-scroll">
          {mobile ? (
            /* Mobile: native iOS/Android player with controls */
            <div className="video-demo-wrapper">
              <video
                ref={videoRef}
                src="/demo-sniperauto.mp4"
                controls
                playsInline
                preload="metadata"
                poster=""
              />
            </div>
          ) : (
            /* Desktop: custom player */
            <>
              <div className="video-demo-wrapper" onClick={showOverlay ? handlePlay : handleVideoClick}>
                <video
                  ref={videoRef}
                  src="/demo-sniperauto.mp4"
                  playsInline
                  preload="metadata"
                  muted
                  onEnded={() => { setIsPlaying(false); setShowOverlay(true) }}
                />

                {showOverlay && (
                  <div className="video-demo-overlay">
                    <button className="video-demo-play-btn" onClick={handlePlay}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                    </button>
                    <span className="video-demo-play-text">Regarder la démo</span>
                  </div>
                )}

                {!showOverlay && !isPlaying && (
                  <div className="video-demo-pause-indicator">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  </div>
                )}
              </div>

              <div className="video-demo-controls">
                <button className="video-demo-control-btn" onClick={handleFullscreen} title="Plein écran">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                  Plein écran
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
