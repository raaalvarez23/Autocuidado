import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id)
      else { setUser(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    if (data) {
      setUser(data)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single()
    
    if (!profile) {
      await supabase.auth.signOut()
      throw new Error('Usuario no encontrado. Contacta al administrador.')
    }
    
    if (!profile.approved) {
      await supabase.auth.signOut()
      if (!profile) { await supabase.auth.signOut(); throw new Error('Usuario no encontrado.') }
      throw new Error('Tu cuenta está pendiente de aprobación')
    }
    
    return data
  }

  async function signUp(name, email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // Check if first user
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const isFirst = count === 0

    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      name,
      email,
      admin: isFirst,
      approved: isFirst,
    })

    if (insertError) console.error('Insert error:', insertError)

    if (!isFirst) {
      await supabase.auth.signOut()
    }

    return { approved: isFirst }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
