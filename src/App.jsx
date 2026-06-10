import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import NewCar from './pages/NewCar'
import EditCar from './pages/EditCar'
import Registrar from './pages/Registrar'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Cargando...</div>
  if (!user?.admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/"         element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/cars"     element={<PrivateRoute><Cars /></PrivateRoute>} />
      <Route path="/cars/new" element={<PrivateRoute><NewCar /></PrivateRoute>} />
      <Route path="/cars/:id" element={<PrivateRoute><CarDetail /></PrivateRoute>} />
      <Route path="/cars/:id/edit" element={<PrivateRoute><EditCar /></PrivateRoute>} />
      <Route path="/registrar" element={<PrivateRoute><Registrar /></PrivateRoute>} />
      <Route path="/admin"    element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  )
}
