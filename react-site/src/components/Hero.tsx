import { useEffect, useRef, useState } from 'react'

interface Deal {
  name: string
  price: string
  details: string
  link: string
  time: string
  img: string
}

const deals: Deal[] = [
  { name: 'Citroen C5 2.0 HDi Millenium', price: '1 582', details: '05/2011 | 232 638 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/MN87802', time: '09:14', img: 'https://img-pa.auto1.com/img11/c7/11c7d4b9cf96451a8f26af7e909ed5c0/pa/max-MN87802_584a6e5db7f993d7ec0234563871c692.jpg' },
  { name: 'Peugeot 208 1.0 VTi Like', price: '3 196', details: '04/2015 | 34 605 km\nEssence\nFR', link: 'auto1.com/fr/app/merchant/car/SJ12186', time: '09:15', img: 'https://img-pa.auto1.com/img63/ec/63ec189cb50dad2676587503f00a116f/pa/max-SJ12186_4cd1cffe7d072d67732a02157c4c6625.jpg' },
  { name: 'Citroen C8 2.0 HDi Millenium', price: '3 464', details: '07/2012 | 161 091 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/VG69945', time: '09:16', img: 'https://img-pa.auto1.com/imgb6/58/b65886f81bb9b3f36b4987e216545bc0/pa/max-VG69945_35835ea6fcdf1969002d2cc65355e23b.jpg' },
  { name: 'Dacia Duster 1.5 dCi Prestige 4x4', price: '5 416', details: '10/2013 | 187 643 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/GA81486', time: '09:17', img: 'https://img-pa.auto1.com/img10/2c/102cbecb235045b8cbc6dadee85add1b/pa/max-GA81486_a747e55380e6ad226a306ecc98c93d9a.jpg' },
  { name: 'Peugeot Partner 1.6 Blue-HDi Outdoor', price: '6 044', details: '04/2016 | 162 555 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/WM37094', time: '09:18', img: 'https://img-pa.auto1.com/imga5/e6/a5e6b7c80c782f67ff3d9495e92d90bd/pa/max-WM37094_3e965d79d538ae3a0f3af9c8076e0b37.jpg' },
  { name: 'Renault Kadjar 1.6 dCi Energy Intens', price: '6 319', details: '05/2016 | 218 681 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/RV03632', time: '09:19', img: 'https://img-pa.auto1.com/imge6/80/e6806fcaec8b4df3249304b0798adf9d/pa/max-RV03632_912dde2459f7eda68a430aaeb305a9fb.jpg' },
  { name: 'Citroen C4 Grand Spacetourer 1.5 Blue-HDi', price: '6 448', details: '11/2019 | 162 089 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/PK17829', time: '09:20', img: 'https://img-pa.auto1.com/img15/36/15362a156936a7cf07ea2c5cc911e72b/pa/max-PK17829_e00a0fd2029044b5ebf849f07196f047.jpg' },
  { name: 'Mitsubishi ASX 1.6 Challenge 2WD', price: '6 524', details: '01/2015 | 110 351 km\nEssence\nFR', link: 'auto1.com/fr/app/merchant/car/SM21552', time: '09:21', img: 'https://img-pa.auto1.com/img6f/9c/6f9cee4e6093c808d1315e229328ce2f/pa/max-SM21552_58150f2db5fdd782350b79a37722f55b.jpg' },
  { name: 'Audi TT 2.0 TFSI Roadster', price: '7 046', details: '04/2013 | 181 162 km\nEssence\nFR', link: 'auto1.com/fr/app/merchant/car/FH05112', time: '09:22', img: 'https://img-pa.auto1.com/imgf5/e6/f5e62ae13f69f6276ab839c7142a5cd6/pa/max-FH05112_b6bda7d1b0950517ab44ff85e0791a8d.jpg' },
  { name: 'Mercedes E 200 CDI BlueEfficiency', price: '8 317', details: '11/2013 | 394 275 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/NN81936', time: '09:23', img: 'https://img-pa.auto1.com/imge2/15/e2158ab5dbcc13c5ba9f2bdd5b280276/pa/max-NN81936_5590948a97c4a70e10fef052f1bca6e1.jpg' },
  { name: 'Hyundai Kona 1.0 TGDI Klass 2WD', price: '9 680', details: '08/2018 | 139 022 km\nEssence\nFR', link: 'auto1.com/fr/app/merchant/car/TY10266', time: '09:24', img: 'https://img-pa.auto1.com/img11/47/11474941a9ff0ecf188857c66d9a6cac/pa/max-TY10266_731881b98c6c88c2979a884687eee158.jpg' },
  { name: 'Ford Transit 2.2 TDCi 310 L2 Limited', price: '10 349', details: '04/2014 | 279 211 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/WA34447', time: '09:25', img: 'https://img-pa.auto1.com/img95/a3/95a3936a65381c09466b6a91dfd4c962/pa/max-WA34447_8bd45c35efaf43cb8a5155481fcc5597.jpg' },
  { name: 'Audi A3 Sportback 35 TDI S line', price: '14 967', details: '12/2018 | 169 578 km\nDiesel\nFR', link: 'auto1.com/fr/app/merchant/car/LH80416', time: '09:26', img: 'https://img-pa.auto1.com/img05/46/05465cf0652f78b4a59d8e79385b2b1f/pa/max-LH80416_110282b0e5de694cc4346d59599dd77a.jpg' },
  { name: 'Audi Q2 1.4 TFSI ACT Sport', price: '16 985', details: '06/2018 | 94 498 km\nEssence\nFR', link: 'auto1.com/fr/app/merchant/car/RL90711', time: '09:27', img: 'https://img-pa.auto1.com/img01/83/018350fb6b15516fa590552099340718/pa/max-RL90711_ef5856d8a2e957de9c6699b3d56af275.jpg' },
  { name: 'Hyundai i30 2.0 TGDI N Performance', price: '19 015', details: '12/2019 | 96 325 km\nEssence\nFR', link: 'auto1.com/fr/app/merchant/car/EY76517', time: '09:28', img: 'https://img-pa.auto1.com/imge3/70/e3705a0ee270d49549869c1d7c220106/pa/max-EY76517_e430779f8c912f07365270190ee6c8fd.jpg' },
]

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

export default function Hero() {
  const chatRef = useRef<HTMLDivElement>(null)
  const waTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const counterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (counterRef.current) {
      setTimeout(() => animateCount(counterRef.current!, 2847, 2000), 800)
    }
  }, [])

  useEffect(() => {
    const chat = chatRef.current
    if (!chat) return

    function scrollToBottom() {
      chat!.scrollTo({ top: chat!.scrollHeight, behavior: 'smooth' })
    }

    function createTyping(): HTMLDivElement {
      const t = document.createElement('div')
      t.className = 'wa-typing'
      t.innerHTML = '<span></span><span></span><span></span>'
      return t
    }

    function createMessage(deal: Deal): HTMLDivElement {
      const m = document.createElement('div')
      m.className = 'wa-message'
      m.innerHTML = `
        <div class="car-img" style="background-image:url('${deal.img}')"></div>
        <div class="msg-body">
          <div class="wa-alert">🚨 Nouveau deal disponible</div>
          <div class="car-name">${deal.name}</div>
          <div class="car-price-line"><span class="car-price-label">Prix: </span><span class="car-price">${deal.price}\u20AC</span></div>
          <div class="car-details">${deal.details.replace(/\n/g, '<br>')}</div>
          <div class="car-link">https://www.${deal.link}</div>
        </div>
        <div class="wa-meta">
          <span class="wa-time">${deal.time}</span>
          <span class="wa-ticks"><svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M1.5 5.5l3 3L11.5 1.5" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 5.5l3 3L15.5 1.5" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </div>
      `
      return m
    }

    function runWaAnimation() {
      if (waTimeoutRef.current) clearTimeout(waTimeoutRef.current)
      while (chat!.firstChild) chat!.removeChild(chat!.firstChild)
      chat!.scrollTop = 0
      chat!.style.transition = 'none'
      chat!.style.opacity = '1'

      let step = 0
      const totalDeals = deals.length

      function next() {
        if (step >= totalDeals) {
          waTimeoutRef.current = setTimeout(() => {
            chat!.style.transition = 'opacity 0.5s'
            chat!.style.opacity = '0'
            waTimeoutRef.current = setTimeout(() => {
              chat!.style.transition = 'none'
              chat!.style.opacity = '1'
              runWaAnimation()
            }, 600)
          }, 3500)
          return
        }

        const typing = createTyping()
        chat!.appendChild(typing)
        requestAnimationFrame(() => {
          typing.classList.add('show')
          scrollToBottom()
        })

        waTimeoutRef.current = setTimeout(() => {
          if (typing.parentNode) typing.parentNode.removeChild(typing)
          const msg = createMessage(deals[step])
          chat!.appendChild(msg)
          requestAnimationFrame(() => {
            msg.classList.add('show')
            setTimeout(scrollToBottom, 50)
            setTimeout(scrollToBottom, 350)
          })
          step++
          waTimeoutRef.current = setTimeout(next, 2000)
        }, 1200)
      }

      waTimeoutRef.current = setTimeout(next, 800)
    }

    runWaAnimation()

    return () => {
      if (waTimeoutRef.current) clearTimeout(waTimeoutRef.current)
    }
  }, [])

  return (
    <section className="hero">
      <div className="radar-bg">
        <div className="sweep"></div>
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="ring"></div>
      </div>
      <div className="container">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="hero-badge"><span className="dot"></span> Surveillance en temps réel</div>
            <h1>Trouvez les <span className="gradient">meilleures affaires</span> avant tout le monde.</h1>
            <p className="tagline">SniperAuto surveille Auto1 24h/24 et vous alerte instantanément sur WhatsApp dès que la perle rare apparaît.</p>

            <div className="loss-counter">
              <div className="big-number" ref={counterRef}>0</div>
              <div className="label">deals détectés cette semaine</div>
              <div className="missed">Combien en avez-vous <span className="red">raté</span> ?</div>
            </div>

            <div className="hero-ctas">
              <a href="#pricing" className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
                Commencer
              </a>
              <a href="#how" className="btn-secondary">Découvrir</a>
            </div>
          </div>

          <div className="phone-wrapper">
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="phone-statusbar">
                  <span style={{ fontWeight: 700 }}>14:37</span>
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <svg width="14" height="10" viewBox="0 0 17 10" fill="#1a1a1a"><rect x="0" y="6" width="3" height="4" rx="0.5" /><rect x="4.5" y="4" width="3" height="6" rx="0.5" /><rect x="9" y="2" width="3" height="8" rx="0.5" /><rect x="13.5" y="0" width="3" height="10" rx="0.5" opacity="0.3" /></svg>
                    <svg width="13" height="10" viewBox="0 0 24 18" fill="#1a1a1a"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 00-6 0zm-4-4l2 2a7.07 7.07 0 0110 0l2-2C15.68 9.68 8.32 9.68 5 13z" /></svg>
                    <svg width="18" height="10" viewBox="0 0 28 13" fill="#1a1a1a"><rect x="0" y="1" width="22" height="11" rx="2.5" stroke="#1a1a1a" strokeWidth="1" fill="none" /><rect x="1.5" y="2.5" width="17" height="8" rx="1.5" /><path d="M24 4.5v4a1.5 1.5 0 001.5-1.5v-1a1.5 1.5 0 00-1.5-1.5z" /></svg>
                  </span>
                </div>
                <div className="wa-header">
                  <div className="wa-back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    <span className="wa-back-count">1</span>
                  </div>
                  <div className="wa-avatar" style={{ background: '#e8e8ed' }}>
                    <svg viewBox="0 0 24 24" fill="#8e8e93" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                  </div>
                  <div className="wa-header-info">
                    <div className="wa-header-name">SniperAuto 🎯</div>
                    <div className="wa-header-status">SniperAuto, Vous</div>
                  </div>
                  <div className="wa-header-icons">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="15" height="12" rx="2" /><path d="M17 8l4-2v10l-4-2" /></svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                </div>
                <div className="wa-chat" ref={chatRef}></div>
                <div className="wa-input-bar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  <div className="wa-input-wrap">
                    <div className="wa-input-field"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                  </div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
