import { useState } from 'react'
import ReservedCheckoutModal from './ReservedCheckoutModal'

interface Props {
  slug: string
  email: string
  firstName: string
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l4 4 6-7" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type CrispWindow = Window & { $crisp?: { push: (a: unknown[]) => void } }

export default function ReservedPricing({ slug, email, firstName }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [modal, setModal] = useState<{ plan: 'essentiel' | 'pro'; billing: 'monthly' | 'annual' } | null>(null)

  const essentielPrice = billing === 'annual' ? '278 €/an' : '29 €/mois'
  const proPrice = billing === 'annual' ? '470 €/an' : '49 €/mois'
  const proSuffix = billing === 'annual' ? ' · 2 mois offerts' : ''

  return (
    <div className="reserved-col-right">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Récupérez votre place
        </span>
        <div className="reserved-pricing-toggle">
          <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')}>Mensuel</button>
          <button className={billing === 'annual' ? 'active' : ''} onClick={() => setBilling('annual')}>
            Annuel <span className="reserved-toggle-badge">–17%</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '12px' }}>
        {/* Essentiel */}
        <div className="reserved-card">
          <div className="reserved-card-name">ESSENTIEL</div>
          <div className="reserved-card-price">{essentielPrice}</div>
          <ul className="reserved-card-features">
            <li><CheckIcon /> 1 alerte active</li>
            <li><CheckIcon /> Scan toutes les 30 min</li>
            <li><CheckIcon /> WhatsApp ou mail</li>
            <li><CheckIcon /> Auto1 uniquement</li>
          </ul>
          <button className="reserved-cta-secondary" onClick={() => setModal({ plan: 'essentiel', billing })}>
            Prendre Essentiel
          </button>
        </div>

        {/* Pro */}
        <div className="reserved-card reserved-card--pro">
          <div className="reserved-card-badge">★ RECOMMANDÉ</div>
          <div className="reserved-card-name" style={{ color: '#007AFF' }}>PRO</div>
          <div className="reserved-card-price" style={{ color: '#007AFF' }}>
            {proPrice}
            {proSuffix && <span style={{ fontSize: '11px', color: '#666', fontWeight: 400 }}>{proSuffix}</span>}
          </div>
          <ul className="reserved-card-features">
            <li><CheckIcon /> <strong>10 alertes actives</strong></li>
            <li><CheckIcon /> <strong>Scan en direct</strong></li>
            <li><CheckIcon /> WhatsApp ou mail</li>
            <li><CheckIcon /> <strong>5 sources</strong> (Auto1, LBC, FB…)</li>
            <li><CheckIcon /> Support prioritaire</li>
          </ul>
          <button className="reserved-cta-primary" onClick={() => setModal({ plan: 'pro', billing })}>
            Je récupère ma place →
          </button>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '10px' }}>
        🔒 Paiement sécurisé Stripe · Sans engagement au mensuel
      </p>

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <button
          className="reserved-crisp-link"
          onClick={() => (window as CrispWindow).$crisp?.push(['do', 'chat:open'])}
        >
          💬 Une question ? Discuter avec nous →
        </button>
      </div>

      {modal && (
        <ReservedCheckoutModal
          plan={modal.plan}
          billing={modal.billing}
          slug={slug}
          email={email}
          firstName={firstName}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
