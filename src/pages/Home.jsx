import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { calcAllStatuses } from '../lib/intervals'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import ReferenciaModal from '../components/ReferenciaModal'

export default function Home() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRef, setShowRef] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => { loadCars() }, [user])

  async function loadCars() {
    if (!user) return
    const { data: carsData } = await supabase.from('cars').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (!carsData) return setLoading(false)

    const withStatus = await Promise.all(carsData.map(async car => {
      const { data: records } = await supabase.from('maintenance_records').select('*').eq('car_id', car.id)
      const statuses = calcAllStatuses(car.km, records || [])
      return {
        ...car,
        records: records || [],
        vencidas: statuses.filter(s => s.status === 'danger').length,
        proximas: statuses.filter(s => s.status === 'warn').length,
        statuses,
      }
    }))
    setCars(withStatus)
    setLoading(false)
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const carsConVencidas = cars.filter(c => c.vencidas > 0)
  const criticalCar = carsConVencidas[0]
  const criticalStatus = criticalCar?.statuses?.find(s => s.status === 'danger')

  return (
    <div className="app-shell">
      <Header title="AutoCuidado" right={
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, padding: '5px 10px', cursor: 'pointer', marginLeft: 8 }}>
          🚪 Salir
        </button>
      } />

      {showRef && <ReferenciaModal onClose={() => setShowRef(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>¡Hola, {user?.name}! 👋</h2>
            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Mantén tus autos en perfecto estado</p>
          </div>
        </div>

        {carsConVencidas.length > 0 && (
          <div className="alert-banner alert-danger">
            <span>⚠️</span>
            <span><strong>{carsConVencidas.length} auto{carsConVencidas.length > 1 ? 's' : ''}</strong> con mantenciones vencidas</span>
          </div>
        )}

        {criticalCar && criticalStatus && (
          <Link to={`/cars/${criticalCar.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{criticalStatus.partName}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  {criticalCar.name} · Te pasaste por <strong style={{ color: '#1e293b' }}>{Math.abs(criticalStatus.remaining).toLocaleString('es-CL')} km</strong>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Próxima a los {criticalStatus.nextKm?.toLocaleString('es-CL')} km</div>
                <div style={{ height: 3, background: '#ef4444', borderRadius: 2, marginTop: 6 }} />
              </div>
              <div style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>100%</div>
            </div>
          </Link>
        )}

        <Link to="/cars/new" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2d4faa)', borderRadius: 10, padding: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚗</div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Agregar un auto nuevo</div>
              <div style={{ color: '#93c5fd', fontSize: 11, marginTop: 2 }}>Registra tu auto y empieza a cuidarlo</div>
            </div>
          </div>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: user?.admin ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setShowRef(true)} style={{ background: 'linear-gradient(135deg,#1e3a8a,#2d4faa)', border: 'none', borderRadius: 8, padding: '10px 8px', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            📋 Referencia
          </button>
          <button onClick={() => setShowImport(true)} style={{ background: 'linear-gradient(135deg,#1e3a8a,#2d4faa)', border: 'none', borderRadius: 8, padding: '10px 8px', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            📥 Importar
          </button>
          {user?.admin && (
            <Link to="/admin" style={{ background: 'linear-gradient(135deg,#1e3a8a,#2d4faa)', border: 'none', borderRadius: 8, padding: '10px 8px', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              👑 Admin
            </Link>
          )}
        </div>

        <div className="section-header">
          <span className="section-title">Tus Autos</span>
          <Link to="/cars" className="section-link">Ver todos</Link>
        </div>

        {loading && <div className="loading">Cargando...</div>}

        {!loading && cars.length === 0 && (
          <div className="empty-state"><div style={{ fontSize: 40 }}>🚗</div><p>Aún no tienes autos registrados</p></div>
        )}

        {cars.slice(0, 3).map(car => (
          <Link key={car.id} to={`/cars/${car.id}`} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{car.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{car.brand} {car.model} · {car.plate}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{car.engine} · {car.transmission} · {car.fuel}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2d4faa' }}>{car.km.toLocaleString('es-CL')} km</div>
                {car.vencidas > 0 && <span className="badge badge-danger" style={{ marginTop: 4 }}>{car.vencidas} vencida{car.vencidas > 1 ? 's' : ''}</span>}
              </div>
            </div>
            {car.vencidas > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                {car.statuses.filter(s => s.status === 'danger').slice(0, 2).map(s => (
                  <div key={s.partName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#374151' }}>{s.partName}</span>
                    <span className="badge badge-danger">⚠ Vencida</span>
                  </div>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}

function ImportModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📥 Importar Historial</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
          Recibir datos de un auto — Escanea el QR del dueño anterior, pega el texto o sube el archivo.
        </p>
        <button className="btn btn-primary">📷 Escanear QR</button>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 6px' }}>✏️ O pega el texto manualmente</p>
        <textarea className="form-input" placeholder="Pega aquí el historial..." />
        <button className="btn btn-green">Ver historial e importar</button>
        <button className="btn btn-outline" onClick={onClose}>← Volver al inicio</button>
      </div>
    </div>
  )
}
