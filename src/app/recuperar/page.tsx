'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RecuperarPage() {
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [verPass, setVerPass] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCargando(false)
      }
    })
    // Check if already in recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setCargando(false)
      } else {
        setError('Enlace inválido o expirado. Solicitá un nuevo correo de recuperación.')
        setCargando(false)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    if (pass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (pass !== confirm) { setError('Las contraseñas no coinciden'); return }
    try {
      const { error } = await supabase.auth.updateUser({ password: pass })
      if (error) throw error
      setMensaje('✅ Contraseña actualizada correctamente.')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar')
    }
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888', fontSize: 14 }}>Verificando enlace...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ background: '#2B2B2B', padding: 32, borderRadius: 8, border: '1px solid #3a3a3a', width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F2EFE9', marginBottom: 24, textAlign: 'center' }}>Nueva contraseña</h1>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type={verPass ? 'text' : 'password'} placeholder="Nueva contraseña" value={pass} onChange={e => setPass(e.target.value)} required minLength={6}
            style={{ display: 'block', width: '100%', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, boxSizing: 'border-box' }} />
          <button type="button" onClick={() => setVerPass(!verPass)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, padding: 2 }}>
            {verPass ? '🙈' : '👁️'}
          </button>
        </div>
        <input type="password" placeholder="Confirmar contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6}
          style={{ display: 'block', width: '100%', padding: 10, marginBottom: 16, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {mensaje && <p style={{ color: '#27ae60', fontSize: 13, marginBottom: 12 }}>{mensaje}</p>}
        <button type="submit" style={{ width: '100%', padding: 12, background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
          Cambiar contraseña
        </button>
      </form>
    </div>
  )
}