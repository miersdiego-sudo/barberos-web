'use client'

import { useEffect, useState } from 'react'
import { getPromos } from '@/lib/supabaseClient'
import { config } from '@/lib/config'

export default function Home() {
  const [promos, setPromos] = useState<{ nombre: string; porcentaje: number; inicio: string; fin: string }[]>([])

  useEffect(() => {
    getPromos().then(setPromos).catch(console.error)
  }, [])

  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const activa = promos.find(p => hoyStr >= p.inicio && hoyStr <= p.fin)
  const proximas = promos.filter(p => p.inicio > hoyStr).slice(0, 3)

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
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          color: '#C8862B',
          letterSpacing: '4px',
          fontSize: '13px',
          marginBottom: '8px',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Bienvenido a
        </p>

        <h1 style={{
          fontSize: '52px',
          fontWeight: 700,
          marginBottom: '12px',
          fontFamily: 'Georgia, serif',
          color: '#F2EFE9',
          letterSpacing: '1px',
        }}>
          {config.nombre}
        </h1>

        <p style={{
          color: '#b0a8a0',
          maxWidth: '440px',
          marginBottom: '36px',
          fontSize: '16px',
          lineHeight: 1.6,
        }}>
          Cortes modernos, barba impecable y cuidado masculino.
          Reservá tu turno con el barbero que prefieras.
        </p>

        <a
          href="/turnos"
          style={{
            backgroundColor: '#C8862B',
            color: '#1A1A1A',
            padding: '14px 40px',
            borderRadius: '8px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '16px',
            display: 'inline-block',
            transition: '0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Reservar turno
        </a>

        {activa && (
          <div style={{
            marginTop: '60px',
            backgroundColor: 'rgba(43,43,43,0.85)',
            border: '1px solid #D9A441',
            borderRadius: '8px',
            padding: '16px 24px',
            maxWidth: '420px',
          }}>
            <p style={{ color: '#D9A441', fontWeight: 700, marginBottom: '4px' }}>
              🎯 ¡{activa.nombre}!
            </p>
            <p style={{ color: '#cfcfcf', fontSize: '14px' }}>
              {activa.porcentaje}% OFF · válido del {activa.inicio} al {activa.fin}
            </p>
          </div>
        )}
        {proximas.length > 0 && (
          <div style={{
            marginTop: '20px',
            backgroundColor: 'rgba(43,43,43,0.7)',
            border: '1px solid #3a3a3a',
            borderRadius: '8px',
            padding: '14px 20px',
            maxWidth: '420px',
          }}>
            <p style={{ color: '#888', fontWeight: 600, fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Próximas promos</p>
            {proximas.map((p, i) => (
              <p key={i} style={{ color: '#bbb', fontSize: 13, marginBottom: 4 }}>
                🗓️ {p.nombre} — {p.porcentaje}% OFF · desde {p.inicio}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
