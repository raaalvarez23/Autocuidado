import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcAllStatuses } from '../lib/intervals'
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
  const [showShare, setShowShare] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const [shareCode, setShareCode] = useState('')

  async function load() {
    const { data: carData } = await supabase.from('cars').select('*').eq('id', id).single()
    if (!carData) { navigate('/cars'); return }
    const { data: recs } = await supabase.from('maintenance_records').select('*').eq('car_id', id).order('km_at_service', { ascending: false })
    setCar(carData)
    setRecords(recs || [])
    setStatuses(calcAllStatuses(carData.km, recs || []))
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleDeleteCar() {
    if (!confirm('¿Eliminar este auto y todo su historial?')) return
    await supabase.from('maintenance_records').delete().eq('car_id', id)
    await supabase.from('cars').delete().eq('id', id)
    navigate('/cars')
  }

  async function handleDeleteRecord(recordId, partName) {
    if (!confirm(`¿Eliminar el registro de "${partName}"?`)) return
    await supabase.from('maintenance_records').delete().eq('id', recordId)
    load()
  }

  function handleShare() {
    const payload = {
      car: { name: car.name, brand: car.brand, model: car.model, year: car.year, plate: car.plate, engine: car.engine, transmission: car.transmission, fuel: car.fuel, km: car.km },
      records: records.map(r => ({ part_name: r.part_name, km_at_service: r.km_at_service, next_km: r.next_km, date: r.date, notes: r.notes }))
    }
    const code = btoa(JSON.stringify(payload))
    setShareCode(code)
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`)
    setShowShare(true)
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

      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🔗 Compartir historial</span>
              <button className="modal-close" onClick={() => setShowShare(false)}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 16 }}>
              El otro usuario escanea este QR o copia el código para importar el historial de <strong>{car.name}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <img src={qrUrl} alt="QR historial" style={{ borderRadius: 8, border: '1px solid var(--border)' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 8, textAlign: 'center' }}>O copia el código y pásalo manualmente:</p>
            <textarea readOnly value={shareCode} style={{ width: '100%', height: 60, fontSize: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, resize: 'none', wordBreak: 'break-all', color: 'var(--text-sec)' }} />
            <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(shareCode); alert('¡Código copiado!') }}>
              📋 Copiar código
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{car.name}</h2>
        <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 2 }}>{car.brand} {car.model} · {car.year} · {car.plate}</div>
        <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{car.engine} · {car.transmission} · {car.fuel}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--blue)', marginTop: 8 }}>{car.km.toLocaleString('es-CL')} km</div>
        <div style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 14 }}>Kilometraje actual</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <Link to={`/cars/${id}/edit`}><button className="btn btn-outline btn-sm" style={{ width: '100%' }}>✏️ Editar</button></Link>
          <button className="btn btn-outline btn-sm" onClick={handleShare}>🔗 Compartir</button>
          <button className="btn btn-danger btn-sm" onClick={handleDeleteCar}>🗑️ Eliminar</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12, gap: 4 }}>
          {[['proximas', '⚠️ Próximas'], ['historial', '📋 Historial']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: 12, cursor: 'pointer', color: tab === t ? '#2d4faa' : 'var(--text-sec)', fontWeight: tab === t ? 600 : 400, borderBottom: tab === t ? '2px solid #2d4faa' : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'proximas' && sorted.map(s => (
          <div key={s.partName} className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.partName}</div>
              {s.status === 'danger'    && <span className="badge badge-danger">⚠️ Vencida</span>}
              {s.status === 'warn'      && <span className="badge badge-warn">⏰ Pronto</span>}
              {s.status === 'ok'        && <span className="badge badge-ok">✅ Bien</span>}
              {s.status === 'no-record' && <span className="badge badge-norecord">❓ Sin registro</span>}
            </div>
            {s.status === 'no-record' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-sec)' }}>
                  <span>Sin registro previo</span>
                  <span>Intervalo: cada {s.interval.toLocaleString('es-CL')} km</span>
                </div>
                <div className="progress-wrap"><div style={{ width: '0%', height: '100%' }} /></div>
                <div style={{ fontSize: 11, color: '#f97316', marginTop: 4 }}>⚡ Debes registrar la primera mantención</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-sec)' }}>
                  <span>Último cambio: {s.lastKm?.toLocaleString('es-CL')} km</span>
                  <span>Cada {s.interval.toLocaleString('es-CL')} km</span>
                </div>
                <div className="progress-wrap">
                  <div className={`progress-fill progress-${s.status === 'danger' ? 'danger' : s.status === 'warn' ? 'warn' : 'ok'}`} style={{ width: `${Math.min(100, s.percentUsed)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sec)' }}>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.part_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge badge-ok">{new Date(r.date + 'T00:00:00').toLocaleDateString('es-CL')}</span>
                    <button onClick={() => handleDeleteRecord(r.id, r.part_name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ef4444', padding: '0 2px' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>
                  A los {r.km_at_service.toLocaleString('es-CL')} km · próximo: {r.next_km.toLocaleString('es-CL')} km
                </div>
                {r.notes && <div style={{ fontSize: 12, color: 'var(--text-third)', marginTop: 4, fontStyle: 'italic' }}>{r.notes}</div>}
              </div>
            ))
        )}
      </div>
      <BottomNav />
    </div>
  )
}
