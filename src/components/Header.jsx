import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Header({ title, showBack, right }) {
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('ac_dark') === '1')

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('ac_dark', dark ? '1' : '0')
  }, [dark])

  return (
    <div className="header">
      <span style={{ fontSize: 18 }}>🔧</span>
      {showBack && (
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#93c5fd', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>
          ←
        </button>
      )}
      <span className="header-title">{title}</span>
      <button onClick={() => setDark(d => !d)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>
        {dark ? '☀️' : '🌙'}
      </button>
      {right}
    </div>
  )
}
