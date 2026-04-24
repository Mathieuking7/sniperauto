import { useState, useEffect } from 'react'

interface Props {
  plan: 'essentiel' | 'pro'
  billing: 'monthly' | 'annual'
  slug: string
  email: string
  firstName: string
  onClose: () => void
}

const PLAN_LABELS: Record<string, string> = {
  essentiel: 'Essentiel',
  pro: 'Pro',
}

const PRICES: Record<string, string> = {
  essentiel_monthly: '29 €/mois',
  essentiel_annual: '278 €/an',
  pro_monthly: '49 €/mois',
  pro_annual: '470 €/an',
}

export default function ReservedCheckoutModal({ plan, billing, slug, email, firstName: defaultFirstName, onClose }: Props) {
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const planLabel = PLAN_LABELS[plan]
  const price = PRICES[`${plan}_${billing}`]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing, slug, firstName, email, phone, lastName: '', companyName: '' }),
      })
      if (res.status === 410) {
        setError('Votre réservation a expiré. Rechargez la page.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Une erreur est survenue.')
        setLoading(false)
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px 36px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Finaliser {planLabel}</h2>
            <p style={{ fontSize: '14px', color: '#007AFF', fontWeight: 600, margin: '4px 0 0' }}>{price}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        <div style={{ background: '#f5f5f7', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✉️</span>
          <span style={{ fontSize: '14px', color: '#555', fontWeight: 500, flex: 1 }}>{email}</span>
          <span style={{ fontSize: '11px', background: '#ddd', borderRadius: '6px', padding: '2px 8px', color: '#888', flexShrink: 0 }}>Verrouillé</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Prénom <span style={{ color: '#e53e3e' }}>*</span></label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Guillaume" style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Numéro de téléphone (WhatsApp) <span style={{ color: '#e53e3e' }}>*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" style={inputStyle} required />
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Utilisé pour recevoir vos alertes WhatsApp</p>
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '12px 14px', color: '#c53030', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#a0c4ff' : '#007AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {loading ? 'Redirection...' : 'Continuer vers le paiement →'}
          </button>
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
            🔒 Paiement sécurisé par Stripe. Aucune carte stockée.
          </p>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '10px',
  fontSize: '15px', color: '#1a1a1a', outline: 'none', background: '#fafafa', boxSizing: 'border-box',
}
