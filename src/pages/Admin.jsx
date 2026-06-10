import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function approve(id) {
    await supabase.from('users').update({ approved: true }).eq('id', id)
    loadUsers()
  }

  async function remove(id, name) {
    if (!confirm(`¿Eliminar usuario ${name}?`)) return
    await supabase.from('users').delete().eq('id', id)
    loadUsers()
  }

  const pending = users.filter(u => !u.approved)
  const approved = users.filter(u => u.approved)

  return (
    <div className="app-shell">
      <Header title="👑 Panel Admin" showBack />
      <div className="main-content">
        {loading && <div className="loading">Cargando...</div>}

        {pending.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 10 }}>
              Pendientes de aprobación ({pending.length})
            </div>
            {pending.map(u => (
              <div key={u.id} className="card" style={{ cursor: 'default' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 10px' }}>{u.email}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-green btn-sm" onClick={() => approve(u.id)}>✓ Aprobar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(u.id, u.name)}>✕ Rechazar</button>
                </div>
              </div>
            ))}
          </>
        )}

        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 10, marginTop: pending.length > 0 ? 16 : 0 }}>
          Usuarios aprobados ({approved.length})
        </div>
        {approved.map(u => (
          <div key={u.id} className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                  {u.name} {u.admin && <span className="badge badge-ok" style={{ fontSize: 10 }}>Admin</span>}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{u.email}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Desde {new Date(u.created_at).toLocaleDateString('es-CL')}</div>
              </div>
              {!u.admin && <button className="btn btn-danger btn-sm" onClick={() => remove(u.id, u.name)}>🗑️</button>}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
