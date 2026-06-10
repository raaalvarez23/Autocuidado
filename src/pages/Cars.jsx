import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { calcAllStatuses } from '../lib/intervals'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function Cars() {
  const { user } = useAuth()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCars() }, [user])

  async function loadCars() {
    if (!user) return
    const { data } = await supabase.from('cars').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (!data) return setLoading(false)

    const withStatus = await Promise.all(data.map(async car => {
      const { data: records } = await supabase.from('maintenance_records').select('*').eq('car_id', car.id)
      const statuses = calcAllStatuses(car.km, records || [])
      return { ...car, vencidas: statuses.filter(s => s.status === 'danger').length, proximas: statuses.filter(s => s.status === 'warn').length }
    }))
    setCars(withStatus)
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <Header title="Mis Autos" />
      <div className="main-content">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Todos tus autos</div>

        {loading && <div className="loading">Cargando...</div>}
        {!loading && cars.length === 0 && <div className="empty-state"><div style={{ fontSize: 40 }}>🚗</div><p>Aún no tienes autos</p></div>}

        {cars.map(car => (
          <Link key={car.id} to={`/cars/${car.id}`} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{car.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{car.brand} {car.model} · {car.year} · {car.plate}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{car.engine} · {car.transmission} · {car.fuel}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2d4faa' }}>{car.km.toLocaleString('es-CL')} km</div>
                {car.vencidas > 0 && <span className="badge badge-danger" style={{ marginTop: 4 }}>{car.vencidas} vencida{car.vencidas > 1 ? 's' : ''}</span>}
                {car.vencidas === 0 && car.proximas > 0 && <span className="badge badge-warn" style={{ marginTop: 4 }}>{car.proximas} próxima{car.proximas > 1 ? 's' : ''}</span>}
              </div>
            </div>
          </Link>
        ))}

        <Link to="/cars/new"><button className="btn btn-primary" style={{ marginTop: 4 }}>+ Agregar Auto</button></Link>
      </div>
      <BottomNav />
    </div>
  )
}
