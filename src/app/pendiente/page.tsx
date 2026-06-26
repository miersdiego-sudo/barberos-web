'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserInfo, logout } from '@/lib/auth'

export default function PendientePage() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info) { router.push('/login'); return }
      if (info.activo === true || info.activo === null) { router.push('/dashboard'); return }
      setEmail(info.email)
    })
  }, [])

  const salir = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#2B2B2B', padding: 32, borderRadius: 8, border: '1px solid #3a3a3a', width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F2EFE9', marginBottom: 16 }}>Cuenta pendiente</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
          Tu cuenta <strong style={{ color: '#C8862B' }}>{email}</strong> está pendiente de aprobación por el administrador.
        </p>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>Te avisaremos cuando esté activa.</p>
        <button onClick={salir} style={{ padding: '10px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}