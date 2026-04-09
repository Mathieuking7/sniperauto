import { useState, useEffect } from 'react'

interface Props {
  plan: string
  billing: string
  planLabel: string
  price: string
  onClose: () => void
}

export default function CheckoutModal({ plan, billing, planLabel, price, onClose }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing, ...form }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Une erreur est survenue. Veuillez réessayer.')
        setLoading(false)
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px 36px',
        width: '100%', maxWidth: '480px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
              Démarrer avec {planLabel}
            </h2>
            <p style={{ fontSize: '14px', color: '#007AFF', fontWeight: 600, margin: '4px 0 0' }}>
              {price} · {billing === 'annual' ? 'Facturation annuelle' : 'Sans engagement'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row: Prénom + Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Prénom <span style={{ color: '#e53e3e' }}>*</span></label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jean" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Nom <span style={{ color: '#e53e3e' }}>*</span></label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dupont" style={inputStyle} required />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Adresse email <span style={{ color: '#e53e3e' }}>*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jean.dupont@entreprise.fr" style={inputStyle} required />
          </div>

          {/* Téléphone */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>
              Numéro de téléphone (WhatsApp) <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+33 6 00 00 00 00" style={inputStyle} required />
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Utilisé pour recevoir vos alertes WhatsApp</p>
          </div>

          {/* Entreprise */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Nom de l'entreprise</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Mon Garage SARL" style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '12px 14px', color: '#c53030', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px', background: loading ? '#a0c4ff' : '#007AFF',
              color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Redirection vers le paiement...' : 'Continuer vers le paiement →'}
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
  display: 'block', fontSize: '13px', fontWeight: 600,
  color: '#333', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e0e0e0',
  borderRadius: '10px', fontSize: '15px', color: '#1a1a1a',
  outline: 'none', background: '#fafafa', boxSizing: 'border-box',
}
