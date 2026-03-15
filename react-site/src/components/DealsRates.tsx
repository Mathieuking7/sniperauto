import { useEffect, useRef } from 'react'

const expDeals = [
  { name: 'Citroen C5 2.0 HDi Millenium', price: '1 582', year: '2011', km: '232 638', fuel: 'Diesel', time: '45min', img: 'https://img-pa.auto1.com/img11/c7/11c7d4b9cf96451a8f26af7e909ed5c0/pa/max-MN87802_584a6e5db7f993d7ec0234563871c692.jpg' },
  { name: 'Peugeot 208 1.0 VTi Like', price: '3 196', year: '2015', km: '34 605', fuel: 'Essence', time: '1h', img: 'https://img-pa.auto1.com/img63/ec/63ec189cb50dad2676587503f00a116f/pa/max-SJ12186_4cd1cffe7d072d67732a02157c4c6625.jpg' },
  { name: 'Citroen C8 2.0 HDi Millenium', price: '3 464', year: '2012', km: '161 091', fuel: 'Diesel', time: '2h10', img: 'https://img-pa.auto1.com/imgb6/58/b65886f81bb9b3f36b4987e216545bc0/pa/max-VG69945_35835ea6fcdf1969002d2cc65355e23b.jpg' },
  { name: 'Dacia Duster 1.5 dCi Prestige', price: '5 416', year: '2013', km: '187 643', fuel: 'Diesel', time: '2h', img: 'https://img-pa.auto1.com/img10/2c/102cbecb235045b8cbc6dadee85add1b/pa/max-GA81486_a747e55380e6ad226a306ecc98c93d9a.jpg' },
  { name: 'Peugeot Partner 1.6 Blue-HDi', price: '6 044', year: '2016', km: '162 555', fuel: 'Diesel', time: '1h', img: 'https://img-pa.auto1.com/imga5/e6/a5e6b7c80c782f67ff3d9495e92d90bd/pa/max-WM37094_3e965d79d538ae3a0f3af9c8076e0b37.jpg' },
  { name: 'Renault Kadjar 1.6 dCi Intens', price: '6 319', year: '2016', km: '218 681', fuel: 'Diesel', time: '2h', img: 'https://img-pa.auto1.com/imge6/80/e6806fcaec8b4df3249304b0798adf9d/pa/max-RV03632_912dde2459f7eda68a430aaeb305a9fb.jpg' },
  { name: 'Citroen C4 Grand Spacetourer', price: '6 448', year: '2019', km: '162 089', fuel: 'Diesel', time: '3h', img: 'https://img-pa.auto1.com/img15/36/15362a156936a7cf07ea2c5cc911e72b/pa/max-PK17829_e00a0fd2029044b5ebf849f07196f047.jpg' },
  { name: 'Mitsubishi ASX 1.6 Challenge', price: '6 524', year: '2015', km: '110 351', fuel: 'Essence', time: '30min', img: 'https://img-pa.auto1.com/img6f/9c/6f9cee4e6093c808d1315e229328ce2f/pa/max-SM21552_58150f2db5fdd782350b79a37722f55b.jpg' },
  { name: 'Audi TT 2.0 TFSI Roadster', price: '7 046', year: '2013', km: '181 162', fuel: 'Essence', time: '15min', img: 'https://img-pa.auto1.com/imgf5/e6/f5e62ae13f69f6276ab839c7142a5cd6/pa/max-FH05112_b6bda7d1b0950517ab44ff85e0791a8d.jpg' },
  { name: 'Mercedes E 200 CDI', price: '8 317', year: '2013', km: '394 275', fuel: 'Diesel', time: '1h30', img: 'https://img-pa.auto1.com/imge2/15/e2158ab5dbcc13c5ba9f2bdd5b280276/pa/max-NN81936_5590948a97c4a70e10fef052f1bca6e1.jpg' },
  { name: 'Hyundai Kona 1.0 TGDI Klass', price: '9 680', year: '2018', km: '139 022', fuel: 'Essence', time: '20min', img: 'https://img-pa.auto1.com/img11/47/11474941a9ff0ecf188857c66d9a6cac/pa/max-TY10266_731881b98c6c88c2979a884687eee158.jpg' },
  { name: 'Ford Transit 2.2 TDCi Limited', price: '10 349', year: '2014', km: '279 211', fuel: 'Diesel', time: '4h', img: 'https://img-pa.auto1.com/img95/a3/95a3936a65381c09466b6a91dfd4c962/pa/max-WA34447_8bd45c35efaf43cb8a5155481fcc5597.jpg' },
  { name: 'Audi A3 Sportback 35 TDI S line', price: '14 967', year: '2018', km: '169 578', fuel: 'Diesel', time: '10min', img: 'https://img-pa.auto1.com/img05/46/05465cf0652f78b4a59d8e79385b2b1f/pa/max-LH80416_110282b0e5de694cc4346d59599dd77a.jpg' },
  { name: 'Audi Q2 1.4 TFSI Sport', price: '16 985', year: '2018', km: '94 498', fuel: 'Essence', time: '35min', img: 'https://img-pa.auto1.com/img01/83/018350fb6b15516fa590552099340718/pa/max-RL90711_ef5856d8a2e957de9c6699b3d56af275.jpg' },
  { name: 'Hyundai i30 2.0 TGDI N Perf', price: '19 015', year: '2019', km: '96 325', fuel: 'Essence', time: '5min', img: 'https://img-pa.auto1.com/imge3/70/e3705a0ee270d49549869c1d7c220106/pa/max-EY76517_e430779f8c912f07365270190ee6c8fd.jpg' },
]

const allDeals = [...expDeals, ...expDeals]

export default function DealsRates() {
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
    <section className="deals-rates" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title animate-on-scroll">Les deals qui vous ont échappé</h2>
        <p className="section-subtitle animate-on-scroll">Ces véhicules ont été vendus en quelques heures. Sans alerte, impossible de réagir à temps.</p>
      </div>
      <div className="expired-ticker-wrap">
        <div className="expired-ticker">
          {allDeals.map((d, i) => (
            <div className="exp-card" key={i}>
              <div className="exp-card-img" style={{ backgroundImage: `url('${d.img}')` }}>
                <span className="exp-badge">Vendu</span>
                <span className="exp-time">il y a {d.time}</span>
              </div>
              <div className="exp-body">
                <div className="exp-name">{d.name}</div>
                <div className="exp-price">{d.price} EUR</div>
                <div className="exp-meta">{d.year} - {d.km} km - {d.fuel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container">
        <div className="warning-msg animate-on-scroll">
          <span className="warning-dot"></span>Sans <strong>SniperAuto</strong>, ces deals vous échappent chaque jour.
        </div>
      </div>
    </section>
  )
}
