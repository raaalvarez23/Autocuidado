import { NavLink, useNavigate } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span>Inicio</span>
      </NavLink>

      <NavLink to="/registrar" className="nav-fab">
        <div className="nav-fab-circle">+</div>
        <span className="nav-fab-label">Registrar</span>
      </NavLink>

      <NavLink to="/cars" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🚗</span>
        <span>Mis Autos</span>
      </NavLink>
    </nav>
  )
}
