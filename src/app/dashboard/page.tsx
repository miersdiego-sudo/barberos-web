'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTurnos, actualizarTurno, getBarberos, getLocales, type BarberoDB } from '@/lib/supabaseClient'
import { getUserInfo, logout } from '@/lib/auth'

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

export default function DashboardPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [filtroBarbero, setFiltroBarbero] = useState('')
  const [filtroServicio, setFiltroServicio] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nuevoBarbero, setNuevoBarbero] = useState('')
  const [barberos, setBarberos] = useState<BarberoDB[]>([])
  const [menuAdmin, setMenuAdmin] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
  const hoy = new Date()
  const [localId, setLocalId] = useState<number | null>(null)
  const [fechaDesde, setFechaDesde] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`)
  const [fechaHasta, setFechaHasta] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`)
  const [esAdmin, setEsAdmin] = useState(false)
  const [nombreLocal, setNombreLocal] = useState('')
  const [slugLocal, setSlugLocal] = useState('')
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info) { router.push('/login'); return }
      if (info.activo === false) { router.push('/pendiente'); return }
      setLocalId(info.local_id)
      setEsAdmin(info.is_super_admin)
      if (info.local_id) getLocales().then(locales => {
        const l = locales.find(x => x.id === info.local_id)
        if (l) { setNombreLocal(l.nombre); setSlugLocal(l.slug) }
      })
    })
  }, [])

  const cargar = () => {
    getTurnos(localId ?? undefined).then(setTurnos).catch(console.error)
    getBarberos(localId ?? undefined).then(setBarberos).catch(console.error)
  }

  useEffect(() => { if (localId !== null) cargar() }, [localId])

  const filtered = turnos.filter(t => {
    if (t.fecha < fechaDesde || t.fecha > fechaHasta) return false
    if (filtroBarbero && t.barbero !== filtroBarbero) return false
    if (filtroServicio && t.servicio !== filtroServicio) return false
    if (filtroEstado === 'finalizado' && t.estado !== 'finalizado') return false
    if (filtroEstado === 'cancelado' && t.estado !== 'cancelado') return false
    if (filtroEstado === 'pendiente' && t.estado && t.estado !== 'pendiente') return false
    if (filtroEstado === 'pendiente' && !t.estado) return true
    return true
  })

  const barberosFiltro = [...new Set(turnos.map(t => t.barbero))]
  const totalRecaudado = filtered.filter(t => t.estado === 'finalizado').reduce((sum, t) => sum + t.precio, 0)

  const fotoDeBarbero = (nombre: string) => barberos.find(b => b.nombre === nombre)?.foto

  const turnosPorDia: Record<string, Turno[]> = {}
  const inicio = new Date(fechaDesde + 'T12:00:00')
  const fin = new Date(fechaHasta + 'T12:00:00')
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const fecha = d.toISOString().split('T')[0]
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
      fontFamily: 'sans-serif', padding: '16px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button onClick={() => setMenuAdmin(!menuAdmin)}
                style={{ background: menuAdmin ? '#C8862B' : '#2B2B2B', color: menuAdmin ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 18, padding: '6px 12px', lineHeight: 1 }}>
                ☰
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Panel de reservas</h1>
            </div>
            {nombreLocal && <p style={{ color: '#888', fontSize: 14, marginTop: 4, marginLeft: 44 }}>{nombreLocal}</p>}
            {slugLocal && (
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/turnos/${slugLocal}`); alert('✅ Enlace copiado: ' + `${window.location.origin}/turnos/${slugLocal}`) }}
                style={{ marginLeft: 44, marginTop: 4, padding: '6px 12px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                🔗 Compartir enlace de reserva
              </button>
            )}
            {menuAdmin && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
                <a href={`/turnos/${slugLocal}`} style={{ padding: '10px 14px', color: '#C8862B', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #C8862B' }}>📅 Nueva reserva</a>
                <div style={{ height: 1, background: '#3a3a3a', margin: '4px 0' }} />
                <a href="/admin/barberos" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>💇 Barberos</a>
                <a href="/admin/servicios" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>✂️ Servicios</a>
                <a href="/admin/productos" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>🧴 Productos</a>
                <a href="/admin/horarios" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>🕐 Horarios</a>
                <a href="/admin/promociones" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>🏷️ Promociones</a>
                <a href="/admin/ventas" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #27ae60' }}>🛒 Ventas</a>
                <a href="/dashboard/estadisticas" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>📊 Estadísticas</a>
                <a href="/manual" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #3a3a3a' }}>📖 Manual de uso</a>
                {esAdmin && <a href="/admin/locales" style={{ padding: '10px 14px', color: '#F2EFE9', textDecoration: 'none', fontSize: 13, borderRadius: 6, background: '#2B2B2B', border: '1px solid #e74c3c' }}>🌐 Locales</a>}
                <div style={{ height: 1, background: '#3a3a3a', margin: '4px 0' }} />
                <button onClick={async () => { await logout(); router.push('/login') }} style={{ padding: '10px 14px', background: 'transparent', color: '#e74c3c', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>🚪 Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }} />
            <span style={{ color: '#888' }}>→</span>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
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
            return (
              <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button onClick={() => setFiltroEstado(filtroEstado === 'finalizado' ? '' : 'finalizado')}
                  style={{ padding: '8px 14px', background: filtroEstado === 'finalizado' ? '#27ae60' : '#2B2B2B', color: '#F2EFE9', border: '1px solid #27ae60', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  ✅ Finalizados: <strong>{finalizados}</strong>
                </button>
                <button onClick={() => setFiltroEstado(filtroEstado === 'cancelado' ? '' : 'cancelado')}
                  style={{ padding: '8px 14px', background: filtroEstado === 'cancelado' ? '#e74c3c' : '#2B2B2B', color: '#F2EFE9', border: '1px solid #e74c3c', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  ❌ Cancelados: <strong>{cancelados}</strong>
                </button>
                <button onClick={() => setFiltroEstado(filtroEstado === 'pendiente' ? '' : 'pendiente')}
                  style={{ padding: '8px 14px', background: filtroEstado === 'pendiente' ? '#D9A441' : '#2B2B2B', color: filtroEstado === 'pendiente' ? '#1A1A1A' : '#F2EFE9', border: '1px solid #D9A441', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  ⏳ Pendientes: <strong>{pendientes}</strong>
                </button>
              </div>
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
