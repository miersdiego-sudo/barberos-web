'use client'

import { useEffect, useState } from 'react'
import { getTurnos } from '@/lib/supabaseClient'

type Turno = {
  barbero: string
  servicio: string
  fecha: string
  inicio: number
  fin: number
  nombre: string
  telefono: string
  precio: number
}

function aHora(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatearPrecio(n: number) {
  return 'Gs. ' + n.toLocaleString('es-AR')
}

function diasEnMes(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export default function DashboardPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [filtroBarbero, setFiltroBarbero] = useState('')
  const hoy = new Date()
  const [mes, setMes] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`)

  useEffect(() => {
    getTurnos().then(setTurnos).catch(console.error)
  }, [])

  const [year, month] = mes.split('-').map(Number)

  const turnosDelMes = turnos.filter(t => {
    const [y, m] = t.fecha.split('-').map(Number)
    return y === year && m === month
  })

  const filtered = turnosDelMes.filter(t => {
    if (filtroBarbero && t.barbero !== filtroBarbero) return false
    return true
  })

  const barberos = [...new Set(turnos.map(t => t.barbero))]

  const totalRecaudado = filtered.reduce((sum, t) => sum + t.precio, 0)

  const dias = diasEnMes(year, month)

  const turnosPorDia: Record<string, Turno[]> = {}
  for (let d = 1; d <= dias; d++) {
    const fecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const delDia = filtered.filter(t => t.fecha === fecha)
    if (delDia.length > 0) turnosPorDia[fecha] = delDia
  }

  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Panel de reservas</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Barbería DI LOPEZ</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/admin/promociones" style={{ color: '#D9A441', textDecoration: 'none', fontSize: 14 }}>Promociones</a>
            <a href="/turnos" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Nueva reserva</a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }} />
          <select value={filtroBarbero} onChange={e => setFiltroBarbero(e.target.value)}
            style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }}>
            <option value="">Todos los barberos</option>
            {barberos.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            Total: <strong style={{ color: '#C8862B' }}>{formatearPrecio(totalRecaudado)}</strong>
          </div>
          <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            Turnos: <strong style={{ color: '#C8862B' }}>{filtered.length}</strong>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
            <p style={{ fontSize: 18 }}>No hay reservas en este mes</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Seleccioná otro mes o creá una nueva reserva.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(turnosPorDia).sort().map(([fecha, turnosDelDia]) => {
              const esPasado = fecha < hoyStr
              const esHoy = fecha === hoyStr
              return (
                <div key={fecha}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 8, padding: '0 4px',
                  }}>
                    <p style={{
                      fontSize: 16, fontWeight: 700, color: esHoy ? '#C8862B' : esPasado ? '#888' : '#F2EFE9',
                    }}>
                      {fecha} {esHoy && <span style={{ fontSize: 12, color: '#D9A441' }}>(hoy)</span>}
                      {esPasado && <span style={{ fontSize: 12, color: '#666' }}>(pasado)</span>}
                    </p>
                    <p style={{ fontSize: 13, color: '#888' }}>{turnosDelDia.length} turno(s) — {formatearPrecio(turnosDelDia.reduce((s, t) => s + t.precio, 0))}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {turnosDelDia.map((t, i) => (
                      <div key={i} style={{
                        background: '#2B2B2B', borderRadius: 8, padding: 14,
                        border: `1px solid ${esHoy ? '#C8862B' : '#3a3a3a'}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 10,
                      }}>
                        <div style={{ minWidth: 150 }}>
                          <p style={{ fontWeight: 700, fontSize: 15 }}>{t.nombre}</p>
                          <p style={{ color: '#888', fontSize: 13 }}>{t.telefono}</p>
                        </div>
                        <div style={{ minWidth: 120 }}>
                          <p style={{ fontSize: 14 }}>{t.servicio}</p>
                          <p style={{ color: '#888', fontSize: 13 }}>con {t.barbero}</p>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 120 }}>
                          <p style={{ fontSize: 14, color: '#C8862B' }}>{aHora(t.inicio)} — {aHora(t.fin)}</p>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 100 }}>
                          <p style={{ fontWeight: 700, color: '#C8862B', fontSize: 16 }}>{formatearPrecio(t.precio)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
