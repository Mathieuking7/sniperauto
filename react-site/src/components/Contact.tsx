import { useRef, useState } from 'react'

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        alert('Erreur lors de l\'envoi. Veuillez réessayer.')
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact" id="contact" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">Vous avez des questions ?</h2>
        <p className="section-subtitle">Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les 24h.</p>

        <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '3rem' }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="name" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                Votre nom
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom complet"
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                Votre email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="message" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                Votre message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Décrivez votre demande..."
                rows={5}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {submitted && (
              <div style={{
                padding: '1rem',
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '12px',
                color: '#155724',
                textAlign: 'center',
                fontSize: '0.95rem',
              }}>
                ✓ Merci ! Votre message a été envoyé. Nous vous répondrons sous 24h.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || submitted}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading || submitted ? '#ccc' : '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading || submitted ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Envoi en cours...' : submitted ? 'Envoyé !' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
