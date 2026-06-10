import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { INTERVALS, getNextKm } from '../lib/intervals'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function Registrar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [cars, setCars] = useState([])
  const [carId, setCarId] = useState(searchParams.get('car') || '')
  const [partName, setPartName] = useState('')
  const [km, setKm] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('cars').select('*').eq('user_id', user.id).then(({ data }) => {
      if (!data) return
      setCars(data)
      if (!carId && data.length > 0) { setCarId(data[0].id); setKm(String(data[0].km)) }
      if (carId) { const c = data.find(x => x.id === carId); if (c) setKm(String(c.km)) }
    })
  }, [user])

  function handleCarChange(id) {
    setCarId(id)
    const car = cars.find(c => c.id === id)
    if (car) setKm(String(car.km))
  }

  const nextKm = partName && km ? getNextKm(partName, Number(km)) : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!carId || !partName) { setError('Selecciona un auto y el componente'); return }
    setError('')
    setLoading(true)
    const next_km = getNextKm(partName, Number(km))
    const { error: err } = await supabase.from('maintenance_records').insert({ car_id: carId, part_name: partName, km_at_service: Number(km), next_km, date, notes })
    if (err) { setError(err.message); setLoading(false); return }
    // Update car km if higher
    const car = cars.find(c => c.id === carId)
    if (car && Number(km) > car.km) await supabase.from('cars').update({ km: Number(km) }).eq('id', carId)
    setSuccess(true)
    setTimeout(() => navigate(`/cars/${carId}`), 1200)
  }

  return (
    <div className="app-shell">
      <Header title="Registrar Mantención" showBack />
      <div className="main-content">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Registrar Mantención</h3>
        <div className="hint-box">
          <span>🔧</span>
          <span>Selecciona qué hiciste y el kilometraje. AutoCuidado calcula automáticamente cuándo será la próxima.</span>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, fontSize: 13, color: '#16a34a', textAlign: 'center', marginBottom: 12 }}>✓ Mantención registrada</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Auto</label>
            <select className="form-input" value={carId} onChange={e => handleCarChange(e.target.value)} required>
              <option value="">-- Selecciona --</option>
              {cars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plate})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">¿Qué le hiciste al auto?</label>
            <select className="form-input" value={partName} onChange={e => setPartName(e.target.value)} required>
              <option value="">-- Selecciona --</option>
              {INTERVALS.map(i => <option key={i.name} value={i.name}>{i.icon} {i.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kilometraje actual del auto</label>
            <input className="form-input" type="number" value={km} onChange={e => setKm(e.target.value)} placeholder="48500" required />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Aceite 5W30, marca Bosch, tienda X, ..." />
          </div>
          {nextKm && (
            <div className="next-preview">
              <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>📅 Próximo servicio calculado</div>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 3 }}>{partName} → a los {nextKm.toLocaleString('es-CL')} km</div>
            </div>
          )}
          <button className="btn btn-green" type="submit" disabled={loading || success}>
            {loading ? 'Guardando...' : 'Guardar Mantención'}
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  )
}
