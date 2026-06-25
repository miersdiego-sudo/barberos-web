'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [nombreLocal, setNombreLocal] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [error, setError] = useState('')
  const [verPass, setVerPass] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (registrando) {
        const res = await fetch('/api/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass, nombre_local: nombreLocal }),
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
        alert('Registrado. El administrador va a revisar y activar tu local.')
      } else {
        await login(email, pass)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ background: '#2B2B2B', padding: 32, borderRadius: 8, border: '1px solid #3a3a3a', width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F2EFE9', marginBottom: 24, textAlign: 'center' }}>
          {registrando ? 'Registrar tu barbería' : 'Iniciar sesión'}
        </h1>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
        <div style={{ position: 'relative', marginBottom: registrando ? 12 : 16 }}>
          <input type={verPass ? 'text' : 'password'} placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} required
            style={{ display: 'block', width: '100%', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, boxSizing: 'border-box' }} />
          <button type="button" onClick={() => setVerPass(!verPass)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, padding: 2 }}>
            {verPass ? '🙈' : '👁️'}
          </button>
        </div>
        {registrando && (
          <input type="text" placeholder="Nombre de tu barbería/peluquería" value={nombreLocal} onChange={e => setNombreLocal(e.target.value)} required
            style={{ display: 'block', width: '100%', padding: 10, marginBottom: 16, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
        )}
        {error && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 12, background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          {registrando ? 'Registrarse' : 'Ingresar'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
          <button type="button" onClick={() => setRegistrando(!registrando)} style={{ background: 'none', border: 'none', color: '#C8862B', cursor: 'pointer', fontSize: 13 }}>
            {registrando ? 'Ya tengo cuenta' : 'Crear cuenta'}
          </button>
        </p>
      </form>
    </div>
  )
}
