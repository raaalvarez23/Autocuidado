import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcAllStatuses, INTERVALS } from '../lib/intervals'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function CarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [records, setRecords] = useState([])
  const [statuses, setStatuses] = useState([])
  const [tab, setTab] = useState('proximas')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    const { data: carData } = await supabase.from('cars').select('*').eq('id', id).single()
    if (!carData) { navigate('/cars'); return }
    const { data: recs } = await supabase.from('maintenance_records').select('*').eq('car_id', id).order('km_at_service', { ascending: false })
    setCar(carData)
    setRecords(recs || [])
    setStatuses(calcAllStatuses(carData.km, recs || []))
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este auto y todo su historial?')) return
    await supabase.from('maintenance_records').delete().eq('car_id', id)
    await supabase.from('cars').delete().eq('id', id)
    navigate('/cars')
  }

  if (loading) return <div className="app-shell"><Header title="Detalle del Auto" showBack /><div className="loading">Cargando...</div></div>
  if (!car) return null

  const sorted = [...statuses].sort((a, b) => {
    const o = { danger: 0, warn: 1, 'no-record': 2, ok: 3 }
    return o[a.status] - o[b.status]
  })

  return (
    <div className="app-shell">
      <Header title="Detalle del Auto" showBack />
      <div className="main-content">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{car.name}</h2>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{car.brand} {car.model} · {car.year} · {car.plate}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{car.engine} · {car.transmission} · {car.fuel}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#2d4faa', marginTop: 8 }}>{car.km.toLocaleString('es-CL')} km</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>Kilometraje actual</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <Link to={`/cars/${id}/edit`}><button className="btn btn-outline btn-sm" style={{ width: '100%' }}>✏️ Editar</button></Link>
          <button className="btn btn-outline btn-sm">🔗 Compartir</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Eliminar</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 12, gap: 4 }}>
          {[['proximas', '⚠️ Próximas mantenciones'], ['historial', '📋 Historial']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', padding: '8px 10px', fontSize: 12, cursor: 'pointer', color: tab === t ? '#2d4faa' : '#9ca3af', fontWeight: tab === t ? 600 : 400, borderBottom: tab === t ? '2px solid #2d4faa' : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'proximas' && sorted.map(s => (
          <div key={s.partName} className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{s.partName}</div>
              {s.status === 'danger'    && <span className="badge badge-danger">⚠️ Vencida</span>}
              {s.status === 'warn'      && <span className="badge badge-warn">⏰ Pronto</span>}
              {s.status === 'ok'        && <span className="badge badge-ok">✅ Bien</span>}
              {s.status === 'no-record' && <span className="badge badge-norecord">❓ Sin registro</span>}
            </div>

            {s.status === 'no-record' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                  <span>Sin registro previo</span>
                  <span>Intervalo: cada {s.interval.toLocaleString('es-CL')} km</span>
                </div>
                <div className="progress-wrap"><div style={{ width: '0%', height: '100%' }} /></div>
                <div style={{ fontSize: 11, color: '#f97316', marginTop: 4 }}>⚡ Debes registrar la primera mantención</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                  <span>Último cambio: {s.lastKm?.toLocaleString('es-CL')} km</span>
                  <span>Cada {s.interval.toLocaleString('es-CL')} km</span>
                </div>
                <div className="progress-wrap">
                  <div className={`progress-fill progress-${s.status === 'danger' ? 'danger' : s.status === 'warn' ? 'warn' : 'ok'}`} style={{ width: `${Math.min(100, s.percentUsed)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280' }}>
                  <span>{s.percentUsed}% usado</span>
                  {s.remaining > 0
                    ? <span>{s.remaining.toLocaleString('es-CL')} km restantes</span>
                    : <span style={{ color: '#ef4444' }}>Te pasaste por {Math.abs(s.remaining).toLocaleString('es-CL')} km</span>
                  }
                </div>
              </>
            )}
          </div>
        ))}

        {tab === 'historial' && (
          records.length === 0
            ? <div className="empty-state"><div style={{ fontSize: 32 }}>📋</div><p>Sin mantenciones registradas</p></div>
            : records.map(r => (
              <div key={r.id} className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{r.part_name}</div>
                  <span className="badge badge-ok">{new Date(r.date + 'T00:00:00').toLocaleDateString('es-CL')}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  A los {r.km_at_service.toLocaleString('es-CL')} km · próximo: {r.next_km.toLocaleString('es-CL')} km
                </div>
                {r.notes && <div style={{ fontSize: 12, color: '#374151', marginTop: 4, fontStyle: 'italic' }}>{r.notes}</div>}
              </div>
            ))
        )}
      </div>
      <BottomNav />
    </div>
  )
}
