'use client'

import { useEffect, useState } from 'react'
import { getTurnos, actualizarTurno, getBarberos, type BarberoDB } from '@/lib/supabaseClient'

type Turno = {
  id?: number
  barbero: string
  servicio: string
  fecha: string
  inicio: number
  fin: number
  nombre: string
  cedula: string
  telefono: string
  precio: number
  estado?: string
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
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nuevoBarbero, setNuevoBarbero] = useState('')
  const [barberos, setBarberos] = useState<BarberoDB[]>([])
  const hoy = new Date()
  const [mes, setMes] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`)

  const cargar = () => {
    getTurnos().then(setTurnos).catch(console.error)
    getBarberos().then(setBarberos).catch(console.error)
  }

  useEffect(cargar, [])

  const [year, month] = mes.split('-').map(Number)

  const turnosDelMes = turnos.filter(t => {
    const [y, m] = t.fecha.split('-').map(Number)
    return y === year && m === month
  })

  const filtered = turnosDelMes.filter(t => {
    if (filtroBarbero && t.barbero !== filtroBarbero) return false
    return true
  })

  const barberosFiltro = [...new Set(turnos.map(t => t.barbero))]
  const totalRecaudado = filtered.reduce((sum, t) => sum + t.precio, 0)
  const dias = diasEnMes(year, month)

  const fotoDeBarbero = (nombre: string) => barberos.find(b => b.nombre === nombre)?.foto

  const turnosPorDia: Record<string, Turno[]> = {}
  for (let d = 1; d <= dias; d++) {
    const fecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const delDia = filtered.filter(t => t.fecha === fecha)
    if (delDia.length > 0) turnosPorDia[fecha] = delDia
  }

  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      await actualizarTurno(id, { estado })
      cargar()
    } catch (e) {
      console.error(e)
      alert('Error al actualizar estado')
    }
  }

  const cambiarBarbero = async (id: number) => {
    if (!nuevoBarbero) return
    try {
      await actualizarTurno(id, { barbero: nuevoBarbero })
      setEditandoId(null)
      setNuevoBarbero('')
      cargar()
    } catch (e) {
      console.error(e)
      alert('Error al cambiar barbero')
    }
  }

  const badge = (estado?: string) => {
    if (estado === 'finalizado') return { text: '✅ Finalizado', color: '#27ae60' }
    if (estado === 'cancelado') return { text: '❌ Cancelado', color: '#e74c3c' }
    return { text: '⏳ Pendiente', color: '#D9A441' }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Panel de reservas</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Barbería DI LOPEZ</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/admin/barberos" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>Barberos</a>
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
            {barberosFiltro.map(b => <option key={b} value={b}>{b}</option>)}
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
            {Object.entries(turnosPorDia).sort().map(([fecha, dia]) => {
              const esPasado = fecha < hoyStr
              const esHoy = fecha === hoyStr
              return (
                <div key={fecha}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: esHoy ? '#C8862B' : esPasado ? '#888' : '#F2EFE9' }}>
                      {fecha} {esHoy && <span style={{ fontSize: 12, color: '#D9A441' }}>(hoy)</span>}
                    </p>
                    <p style={{ fontSize: 13, color: '#888' }}>{dia.length} turno(s) — {formatearPrecio(dia.reduce((s, t) => s + t.precio, 0))}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dia.map(t => {
                      const b = badge(t.estado)
                      return (
                        <div key={t.id} style={{
                          background: '#2B2B2B', borderRadius: 8, padding: 14,
                          border: `1px solid ${t.estado === 'cancelado' ? '#e74c3c' : esHoy ? '#C8862B' : '#3a3a3a'}`,
                          opacity: t.estado === 'cancelado' ? 0.6 : 1,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 15 }}>{t.nombre}</p>
                              <p style={{ color: '#888', fontSize: 13 }}>{t.telefono} · C.I. {t.cedula}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 14, color: '#C8862B' }}>{aHora(t.inicio)} — {aHora(t.fin)}</p>
                              <p style={{ fontWeight: 700, color: '#C8862B', fontSize: 16 }}>{formatearPrecio(t.precio)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {(() => {
                                  const foto = fotoDeBarbero(t.barbero)
                                  return foto ? (
                                    <img src={foto} alt={t.barbero} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#666' }}>{t.barbero[0]}</div>
                                  )
                                })()}
                                <p style={{ fontSize: 14 }}>{t.servicio} · <span style={{ color: '#888' }}>{t.barbero}</span></p>
                              <span style={{ fontSize: 12, color: b.color }}>{b.text}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {editandoId === t.id ? (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <select value={nuevoBarbero} onChange={e => setNuevoBarbero(e.target.value)}
                                    style={{ padding: 6, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 13 }}>
                                    {barberos.map(b => <option key={b.id ?? b.nombre} value={b.nombre}>{b.nombre}</option>)}
                                  </select>
                                  <button onClick={() => t.id && cambiarBarbero(t.id)}
                                    style={{ padding: '6px 10px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                    OK
                                  </button>
                                  <button onClick={() => setEditandoId(null)}
                                    style={{ padding: '6px 10px', background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                                    X
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {t.estado !== 'cancelado' && t.estado !== 'finalizado' && (
                                    <>
                                      <button onClick={() => { setEditandoId(t.id ?? null); setNuevoBarbero(t.barbero) }}
                                        style={{ padding: '6px 10px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                                        Cambiar barbero
                                      </button>
                                      <button onClick={() => t.id && cambiarEstado(t.id, 'finalizado')}
                                        style={{ padding: '6px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                                        ✅ Finalizar
                                      </button>
                                      <button onClick={() => t.id && cambiarEstado(t.id, 'cancelado')}
                                        style={{ padding: '6px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                                        ❌ Cancelar
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
