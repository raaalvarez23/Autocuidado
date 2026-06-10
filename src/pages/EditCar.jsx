import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CarForm } from './NewCar'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function EditCar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('cars').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({ ...data, year: String(data.year), km: String(data.km) })
    })
  }, [id])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.from('cars').update({ ...form, year: Number(form.year), km: Number(form.km) }).eq('id', id)
    if (err) { setError(err.message); setLoading(false); return }
    navigate(`/cars/${id}`)
  }

  if (!form) return <div className="app-shell"><Header title="Editar Auto" showBack /><div className="loading">Cargando...</div></div>

  return (
    <div className="app-shell">
      <Header title="Editar Auto" showBack />
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}
        <CarForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} label="Guardar cambios" />
      </div>
      <BottomNav />
    </div>
  )
}
