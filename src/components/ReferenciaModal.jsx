import { INTERVALS } from '../lib/intervals'

export default function ReferenciaModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Tabla de Referencia</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
          Intervalos recomendados generales. Revisa siempre el manual de tu auto para valores exactos.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '6px 0', color: '#374151', fontWeight: 600 }}>Componente</th>
              <th style={{ textAlign: 'right', padding: '6px 0', color: '#374151', fontWeight: 600 }}>Intervalo (km)</th>
            </tr>
          </thead>
          <tbody>
            {INTERVALS.map(i => (
              <tr key={i.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '7px 0', color: '#1e293b' }}>{i.icon} {i.name}</td>
                <td style={{ padding: '7px 0', color: '#374151', textAlign: 'right' }}>{i.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
