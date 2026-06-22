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
  observaciones?: string | null
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
  const [filtroServicio, setFiltroServicio] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nuevoBarbero, setNuevoBarbero] = useState('')
  const [barberos, setBarberos] = useState<BarberoDB[]>([])
  const [verClientes, setVerClientes] = useState(false)
  const [verInactivos, setVerInactivos] = useState(false)
  const [verGrafico, setVerGrafico] = useState(false)
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
    if (filtroServicio && t.servicio !== filtroServicio) return false
    return true
  })

  const barberosFiltro = [...new Set(turnos.map(t => t.barbero))]
  const totalRecaudado = filtered.filter(t => t.estado === 'finalizado').reduce((sum, t) => sum + t.precio, 0)
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
            <a href="/admin/servicios" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>Servicios</a>
            <a href="/admin/productos" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>Productos</a>
            <a href="/admin/horarios" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>Horarios</a>
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
            <select value={filtroServicio} onChange={e => setFiltroServicio(e.target.value)}
              style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }}>
              <option value="">Todos los servicios</option>
              {[...new Set(turnos.map(t => t.servicio))].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
              💰 Total: <strong style={{ color: '#C8862B' }}>{formatearPrecio(totalRecaudado)}</strong>
            </div>
            <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
              📋 Turnos: <strong style={{ color: '#C8862B' }}>{filtered.length}</strong>
            </div>
            <button onClick={() => {
              const headers = ['Fecha','Barbero','Servicio','Inicio','Fin','Cliente','Cedula','WhatsApp','Precio','Estado'].join(',')
              const rows = filtered.map(t => `${t.fecha},"${t.barbero}","${t.servicio}","${aHora(t.inicio)}","${aHora(t.fin)}","${t.nombre}","${t.cedula}","${t.telefono}",${t.precio},"${t.estado||'pendiente'}"`).join('\n')
              const blob = new Blob(['\uFEFF' + headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `turnos_${mes}.csv`; a.click()
              URL.revokeObjectURL(url)
            }} style={{ padding: '10px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              Exportar CSV
            </button>
          </div>

          {(() => {
            const finalizados = filtered.filter(t => t.estado === 'finalizado').length
            const cancelados = filtered.filter(t => t.estado === 'cancelado').length
            const pendientes = filtered.filter(t => !t.estado || t.estado === 'pendiente').length
            const barberoCount: Record<string, number> = {}
            const servicioCount: Record<string, number> = {}
            const clientes: Record<string, { nombre: string; cedula: string; telefono: string; total: number; ultima: string }> = {}
            turnos.forEach(t => {
              barberoCount[t.barbero] = (barberoCount[t.barbero] || 0) + 1
              servicioCount[t.servicio] = (servicioCount[t.servicio] || 0) + 1
              if (t.cedula) {
                if (!clientes[t.cedula] || t.fecha > clientes[t.cedula].ultima) {
                  clientes[t.cedula] = { nombre: t.nombre, cedula: t.cedula, telefono: t.telefono, total: (clientes[t.cedula]?.total || 0) + 1, ultima: t.fecha }
                } else {
                  clientes[t.cedula].total++
                }
              }
            })
            const topBarbero = Object.entries(barberoCount).sort((a, b) => b[1] - a[1])[0]
            const topServicio = Object.entries(servicioCount).sort((a, b) => b[1] - a[1])[0]
            const clientesTop = Object.values(clientes).sort((a, b) => b.total - a.total).slice(0, 10)
            const hoyDate = new Date()
            const clientesInactivos = Object.values(clientes).filter(c => {
              const diff = Math.floor((hoyDate.getTime() - new Date(c.ultima + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
              return diff > 30
            }).sort((a, b) => a.ultima.localeCompare(b.ultima))
            return (
              <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ padding: '8px 14px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 12 }}>
                  ✅ Finalizados: <strong style={{ color: '#27ae60' }}>{finalizados}</strong>
                </div>
                <div style={{ padding: '8px 14px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 12 }}>
                  ❌ Cancelados: <strong style={{ color: '#e74c3c' }}>{cancelados}</strong>
                </div>
                <div style={{ padding: '8px 14px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 12 }}>
                  ⏳ Pendientes: <strong style={{ color: '#D9A441' }}>{pendientes}</strong>
                </div>
                {topBarbero && <div style={{ padding: '8px 14px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 12 }}>
                  💇 Barbero top: <strong style={{ color: '#C8862B' }}>{topBarbero[0]}</strong> ({topBarbero[1]})
                </div>}
                {topServicio && <div style={{ padding: '8px 14px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 12 }}>
                  ✂️ Servicio top: <strong style={{ color: '#C8862B' }}>{topServicio[0]}</strong> ({topServicio[1]})
                </div>}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button onClick={() => setVerClientes(!verClientes)}
                  style={{ padding: '8px 14px', background: verClientes ? '#C8862B' : '#2B2B2B', color: verClientes ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  🏆 Clientes top
                </button>
                <button onClick={() => setVerInactivos(!verInactivos)}
                  style={{ padding: '8px 14px', background: verInactivos ? '#e74c3c' : '#2B2B2B', color: verInactivos ? '#fff' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  ⏰ Inactivos (+30 días)
                </button>
              </div>

              {verClientes && (
                <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 16, border: '1px solid #3a3a3a', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12 }}>🏆 Clientes con más visitas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {clientesTop.map((c, i) => (
                      <div key={c.cedula} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#1A1A1A', borderRadius: 6, fontSize: 13 }}>
                        <div>
                          <span style={{ color: '#C8862B', fontWeight: 700, marginRight: 8 }}>#{i + 1}</span>
                          <strong>{c.nombre}</strong>
                          <span style={{ color: '#888', marginLeft: 8 }}>C.I. {c.cedula}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#C8862B', fontWeight: 700 }}>{c.total} turnos</span>
                          <span style={{ color: '#888', marginLeft: 8 }}>Último: {c.ultima}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {verInactivos && (
                <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 16, border: '1px solid #e74c3c', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12, color: '#e74c3c' }}>⏰ Clientes que no reservan hace +30 días</h3>
                  {clientesInactivos.length === 0 ? (
                    <p style={{ color: '#888', fontSize: 13 }}>Todos los clientes reservaron en los últimos 30 días.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {clientesInactivos.map(c => {
                        const diff = Math.floor((hoyDate.getTime() - new Date(c.ultima + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
                        return (
                          <div key={c.cedula} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#1A1A1A', borderRadius: 6, fontSize: 13 }}>
                            <div>
                              <strong>{c.nombre}</strong>
                              <span style={{ color: '#888', marginLeft: 8 }}>C.I. {c.cedula}</span>
                              <span style={{ color: '#888', marginLeft: 8 }}>📞 {c.telefono}</span>
                            </div>
                            <div>
                              <span style={{ color: '#e74c3c', fontWeight: 700 }}>{diff} días sin venir</span>
                              <span style={{ color: '#888', marginLeft: 8 }}>Último: {c.ultima}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button onClick={() => setVerGrafico(!verGrafico)}
                  style={{ padding: '8px 14px', background: verGrafico ? '#C8862B' : '#2B2B2B', color: verGrafico ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  📈 Tendencia mensual
                </button>
              </div>

              {verGrafico && (() => {
                const meses: { label: string; total: number; count: number }[] = []
                const ahora = new Date()
                for (let i = 11; i >= 0; i--) {
                  const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                  const label = d.toLocaleDateString('es', { month: 'short', year: '2-digit' })
                  const delMes = turnos.filter(t => {
                    const [y, m] = t.fecha.split('-').map(Number)
                    if (y !== d.getFullYear() || m !== d.getMonth() + 1) return false
                    if (t.estado !== 'finalizado') return false
                    if (filtroBarbero && t.barbero !== filtroBarbero) return false
                    if (filtroServicio && t.servicio !== filtroServicio) return false
                    return true
                  })
                  meses.push({ label, total: delMes.reduce((s, t) => s + t.precio, 0), count: delMes.length })
                }
                const max = Math.max(...meses.map(m => m.total), 1)
                const w = 480, h = 220, pad = { top: 20, right: 20, bottom: 40, left: 60 }
                const gw = w - pad.left - pad.right, gh = h - pad.top - pad.bottom
                const stepX = gw / (meses.length - 1 || 1)
                const puntos = meses.map((m, i) => ({ x: pad.left + i * stepX, y: pad.top + gh - (m.total / max) * gh }))
                const linePath = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                return (
                  <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 16, border: '1px solid #3a3a3a', marginBottom: 24, overflowX: 'auto' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>📈 Ventas mensuales (finalizados)</h3>
                    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w, height: 'auto' }}>
                      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={h - pad.bottom} stroke="#3a3a3a" />
                      <line x1={pad.left} y1={h - pad.bottom} x2={w - pad.right} y2={h - pad.bottom} stroke="#3a3a3a" />
                      {puntos.map((p, i) => (
                        <g key={i}>
                          <line x1={p.x} y1={pad.top} x2={p.x} y2={h - pad.bottom} stroke="#2a2a2a" strokeDasharray="3,3" />
                          <text x={p.x} y={h - pad.bottom + 18} textAnchor="middle" fill="#888" fontSize={10}>{meses[i].label}</text>
                        </g>
                      ))}
                      {[0, 0.25, 0.5, 0.75, 1].map(r => {
                        const y = pad.top + gh * (1 - r)
                        return <text key={r} x={pad.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize={10}>{formatearPrecio(Math.round(max * r))}</text>
                      })}
                      {puntos.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#C8862B" />
                      ))}
                      <path d={linePath} stroke="#C8862B" strokeWidth={2} fill="none" />
                      {puntos.map((p, i) => (
                        <text key={i} x={p.x} y={p.y - 10} textAnchor="middle" fill="#F2EFE9" fontSize={10} fontWeight={700}>
                          {formatearPrecio(meses[i].total)}
                        </text>
                      ))}
                    </svg>
                  </div>
                )
              })()}
              </>
            )
          })()}

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
                    <p style={{ fontSize: 13, color: '#888' }}>{dia.length} turno(s) — {formatearPrecio(dia.filter(t => t.estado === 'finalizado').reduce((s, t) => s + t.precio, 0))}</p>
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
                              {t.observaciones && <p style={{ color: '#aaa', fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>📝 {t.observaciones}</p>}
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
                                    <img src={foto} alt={t.barbero} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: 28, height: 28, borderRadius: 4, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#666' }}>{t.barbero[0]}</div>
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
