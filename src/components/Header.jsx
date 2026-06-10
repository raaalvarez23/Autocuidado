import { useNavigate } from 'react-router-dom'

export default function Header({ title, showBack, right }) {
  const navigate = useNavigate()
  return (
    <div className="header">
      <span style={{ fontSize: 18 }}>🔧</span>
      {showBack && (
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#93c5fd', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>
          ←
        </button>
      )}
      <span className="header-title">{title}</span>
      <span style={{ fontSize: 20 }}>🌙</span>
      {right}
    </div>
  )
}
