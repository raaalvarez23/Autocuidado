import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

const emptyForm = { name: '', brand: '', model: '', year: new Date().getFullYear(), plate: '', engine: '', transmission: 'Automática', fuel: 'Gasolina', km: '' }

export default function NewCar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.from('cars').insert({
      ...form, year: Number(form.year), km: Number(form.km) || 0,
      plate: form.plate.toUpperCase(), user_id: user.id
    })
    if (err) { setError(err.message); setLoading(false); return }
    navigate('/cars')
  }

  return (
    <div className="app-shell">
      <Header title="Agregar Auto" showBack />
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}
        <CarForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} label="Guardar Auto" />
      </div>
      <BottomNav />
    </div>
  )
}

export function CarForm({ form, onChange, onSubmit, loading, label }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label className="form-label">Nombre del auto *</label>
        <input className="form-input" name="name" value={form.name} onChange={onChange} placeholder="Ej: Mi Auto, Camioneta" required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group">
          <label className="form-label">Marca *</label>
          <input className="form-input" name="brand" value={form.brand} onChange={onChange} placeholder="Toyota" required />
        </div>
        <div className="form-group">
          <label className="form-label">Modelo *</label>
          <input className="form-input" name="model" value={form.model} onChange={onChange} placeholder="Corolla" required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group">
          <label className="form-label">Año *</label>
          <input className="form-input" name="year" type="number" value={form.year} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Patente *</label>
          <input className="form-input" name="plate" value={form.plate} onChange={onChange} placeholder="ABCD12" required />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Motor</label>
        <input className="form-input" name="engine" value={form.engine} onChange={onChange} placeholder="1.8L" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group">
          <label className="form-label">Transmisión</label>
          <select className="form-input" name="transmission" value={form.transmission} onChange={onChange}>
            <option>Automática</option><option>Manual</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Combustible</label>
          <select className="form-input" name="fuel" value={form.fuel} onChange={onChange}>
            <option>Gasolina</option><option>Diesel</option><option>Híbrido</option><option>Eléctrico</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Kilometraje actual</label>
        <input className="form-input" name="km" type="number" value={form.km} onChange={onChange} placeholder="48500" />
      </div>
      <button className="btn btn-green" type="submit" disabled={loading}>
        {loading ? 'Guardando...' : `✓ ${label}`}
      </button>
    </form>
  )
}
