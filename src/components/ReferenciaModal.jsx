import { INTERVALS } from '../lib/intervals'

export default function ReferenciaModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Tabla de Referencia</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 16 }}>
          Intervalos recomendados generales. Revisa siempre el manual de tu auto para valores exactos.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text)', fontWeight: 600 }}>Componente</th>
              <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text)', fontWeight: 600 }}>Intervalo (km)</th>
            </tr>
          </thead>
          <tbody>
            {INTERVALS.map(i => (
              <tr key={i.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '7px 0', color: 'var(--text)' }}>{i.icon} {i.name}</td>
                <td style={{ padding: '7px 0', color: 'var(--text-sec)', textAlign: 'right' }}>{i.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
