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
      {showImport && <ImportModal onClose={() => { setShowImport(false); loadCars() }} user={user} cars={cars} />}

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
        {!loading && cars.length === 0 && <div className="empty-state"><div style={{ fontSize: 40 }}>🚗</div><p>Aún no tienes autos registrados</p></div>}

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

function ImportModal({ onClose, user, cars }) {
  const [step, setStep] = useState('inicio') // inicio | preview
  const [code, setCode] = useState('')
  const [parsed, setParsed] = useState(null)
  const [selectedCar, setSelectedCar] = useState('')
  const [createNew, setCreateNew] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleParse() {
    try {
      const data = JSON.parse(atob(code.trim()))
      if (!data.car || !data.records) throw new Error('Código inválido')
      setParsed(data)
      setStep('preview')
      setError('')
    } catch {
      setError('Código inválido. Asegúrate de pegar el código completo.')
    }
  }

  async function handleImport() {
    setLoading(true)
    try {
      let carId = selectedCar

      if (createNew) {
        const { data: newCar, error: carErr } = await supabase.from('cars').insert({
          ...parsed.car,
          user_id: user.id,
          name: parsed.car.name + ' (importado)',
        }).select().single()
        if (carErr) throw carErr
        carId = newCar.id
      }

      for (const r of parsed.records) {
        await supabase.from('maintenance_records').insert({ ...r, car_id: carId })
      }

      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📥 Importar Historial</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, fontSize: 13, color: '#16a34a', textAlign: 'center' }}>✓ Historial importado correctamente</div>}

        {!success && step === 'inicio' && (
          <>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
              Pide al dueño anterior que vaya al detalle de su auto → Compartir, y te dé el código QR o el texto.
            </p>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label className="form-label">Pega el código aquí</label>
              <textarea className="form-input" value={code} onChange={e => setCode(e.target.value)} placeholder="Pega el código del historial..." style={{ minHeight: 80 }} />
            </div>
            <button className="btn btn-primary" onClick={handleParse} disabled={!code.trim()}>
              Ver historial e importar →
            </button>
            <button className="btn btn-outline" onClick={onClose}>← Volver</button>
          </>
        )}

        {!success && step === 'preview' && parsed && (
          <>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{parsed.car.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{parsed.car.brand} {parsed.car.model} · {parsed.car.plate}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{parsed.records.length} registros de mantención</div>
            </div>

            <div className="form-group">
              <label className="form-label">¿Dónde importar?</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button onClick={() => setCreateNew(true)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${createNew ? '#2d4faa' : '#e5e7eb'}`, background: createNew ? '#eff6ff' : '#fff', color: createNew ? '#2d4faa' : '#374151', fontSize: 12, cursor: 'pointer', fontWeight: createNew ? 600 : 400 }}>
                  ➕ Crear auto nuevo
                </button>
                <button onClick={() => setCreateNew(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${!createNew ? '#2d4faa' : '#e5e7eb'}`, background: !createNew ? '#eff6ff' : '#fff', color: !createNew ? '#2d4faa' : '#374151', fontSize: 12, cursor: 'pointer', fontWeight: !createNew ? 600 : 400 }}>
                  🚗 Auto existente
                </button>
              </div>
              {!createNew && (
                <select className="form-input" value={selectedCar} onChange={e => setSelectedCar(e.target.value)}>
                  <option value="">-- Selecciona un auto --</option>
                  {cars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plate})</option>)}
                </select>
              )}
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 12 }}>
              {parsed.records.map((r, i) => (
                <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid #f1f5f9', color: '#374151' }}>
                  <strong>{r.part_name}</strong> — {r.km_at_service.toLocaleString('es-CL')} km · {r.date}
                </div>
              ))}
            </div>

            <button className="btn btn-green" onClick={handleImport} disabled={loading || (!createNew && !selectedCar)}>
              {loading ? 'Importando...' : '✓ Importar historial'}
            </button>
            <button className="btn btn-outline" onClick={() => setStep('inicio')}>← Volver</button>
          </>
        )}
      </div>
    </div>
  )
}
