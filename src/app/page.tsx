'use client'

import { useEffect, useState } from 'react'
import { getLocales, type LocalDB } from '@/lib/supabaseClient'

export default function Home() {
  const [locales, setLocales] = useState<LocalDB[]>([])

  useEffect(() => {
    getLocales().then(setLocales).catch(console.error)
  }, [])

  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  const localesActivos = locales.filter(l => l.activo !== false)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/bg.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
        <h1 style={{
          fontSize: '52px',
          fontWeight: 700,
          marginBottom: '12px',
          fontFamily: 'Georgia, serif',
          color: '#F2EFE9',
          letterSpacing: '1px',
        }}>
          Barberos
        </h1>

        <p style={{
          color: '#b0a8a0',
          maxWidth: '440px',
          margin: '0 auto 36px',
          fontSize: '16px',
          lineHeight: 1.6,
        }}>
          Elegí tu barbería y reservá tu turno con el barbero que prefieras.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {localesActivos.map(l => (
            <a key={l.id} href={`/turnos/${l.slug}`} style={{
              display: 'block',
              width: '100%',
              maxWidth: 360,
              padding: '16px 24px',
              background: 'rgba(43,43,43,0.85)',
              border: '1px solid #3a3a3a',
              borderRadius: 8,
              color: '#F2EFE9',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              transition: '0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8862B'; e.currentTarget.style.background = 'rgba(200,134,43,0.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.background = 'rgba(43,43,43,0.85)' }}
            >
              {l.nombre} →
            </a>
          ))}
        </div>

        <p style={{ marginTop: 40 }}>
          <a href="/login" style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>
            Admin
          </a>
        </p>
      </div>
    </div>
  )
}
