import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const result = await signUp(name, email, password)
      if (result.approved) {
        setSuccess('¡Cuenta creada! Redirigiendo...')
        setTimeout(() => navigate('/'), 1200)
      } else {
        setSuccess('Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52 }}>🔧</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a8a', marginTop: 8 }}>AutoCuidado</h1>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Crear cuenta</h2>
          {error && <div className="error-msg">{error}</div>}
          {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10, fontSize: 13, color: '#16a34a', marginBottom: 12, textAlign: 'center' }}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Roberto Alvarez" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading || !!success}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2d4faa', fontWeight: 500 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
