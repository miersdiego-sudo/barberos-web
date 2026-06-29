'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTurnos, getBarberos } from '@/lib/supabaseClient'
import { getUserInfo } from '@/lib/auth'

function aHora(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatearPrecio(n: number) {
  return 'Gs. ' + n.toLocaleString('es-AR')
}

export default function EstadisticasPage() {
  const [turnos, setTurnos] = useState<any[]>([])
  const [localId, setLocalId] = useState<number | null>(null)
  const [filtroBarbero, setFiltroBarbero] = useState('')
  const [filtroServicio, setFiltroServicio] = useState('')
  const [verGrafico, setVerGrafico] = useState(false)
  const [vistaGrafico, setVistaGrafico] = useState<'mensual' | 'diario' | 'demo-diario' | 'demo-mensual'>('mensual')
  const [verClientes, setVerClientes] = useState(false)
  const [verInactivos, setVerInactivos] = useState(false)
  const [diasInactivo, setDiasInactivo] = useState(30)
  const [esAdmin, setEsAdmin] = useState(false)
  const router = useRouter()
  const hoy = new Date()
  const [fechaDesde, setFechaDesde] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`)
  const [fechaHasta, setFechaHasta] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`)

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info) { router.push('/login'); return }
      if (info.activo === false) { router.push('/pendiente'); return }
      setLocalId(info.local_id)
      setEsAdmin(info.is_super_admin)
    })
  }, [])

  useEffect(() => {
    if (localId !== null) {
      getTurnos(localId ?? undefined).then(setTurnos).catch(console.error)
    }
  }, [localId])

  const filtered = turnos.filter(t => {
    if (t.fecha < fechaDesde || t.fecha > fechaHasta) return false
    if (filtroBarbero && t.barbero !== filtroBarbero) return false
    if (filtroServicio && t.servicio !== filtroServicio) return false
    return true
  })

  const barberoCount: Record<string, number> = {}
  const servicioCount: Record<string, number> = {}
  const clientes: Record<string, { nombre: string; cedula: string; telefono: string; total: number; ultima: string }> = {}
  for (const t of filtered) {
    barberoCount[t.barbero] = (barberoCount[t.barbero] || 0) + 1
    servicioCount[t.servicio] = (servicioCount[t.servicio] || 0) + 1
    if (t.cedula) {
      if (!clientes[t.cedula] || t.fecha > clientes[t.cedula].ultima) {
        clientes[t.cedula] = { nombre: t.nombre, cedula: t.cedula, telefono: t.telefono, total: (clientes[t.cedula]?.total || 0) + 1, ultima: t.fecha }
      } else {
        clientes[t.cedula].total++
      }
    }
  }
  const topBarbero = Object.entries(barberoCount).sort((a, b) => b[1] - a[1])[0]
  const topServicio = Object.entries(servicioCount).sort((a, b) => b[1] - a[1])[0]
  const clientesTop = Object.values(clientes).sort((a, b) => b.total - a.total).slice(0, 10)
  const hoyDate = new Date()
  const clientesInactivos = Object.values(clientes).filter(c => {
    const diff = Math.floor((hoyDate.getTime() - new Date(c.ultima + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
    return diff > diasInactivo
  }).sort((a, b) => a.ultima.localeCompare(b.ultima))

  const barberos = [...new Set(turnos.map(t => t.barbero))].sort()
  const servicios = [...new Set(turnos.map(t => t.servicio))].sort()

  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', color: '#F2EFE9', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>📊 Estadísticas</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
            style={{ padding: 8, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }} />
          <span style={{ color: '#888' }}>→</span>
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
            style={{ padding: 8, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }} />
          <select value={filtroBarbero} onChange={e => setFiltroBarbero(e.target.value)}
            style={{ padding: 8, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }}>
            <option value="">Todos los barberos</option>
            {barberos.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filtroServicio} onChange={e => setFiltroServicio(e.target.value)}
            style={{ padding: 8, border: '1px solid #3a3a3a', borderRadius: 6, background: '#2B2B2B', color: '#F2EFE9', fontSize: 14 }}>
            <option value="">Todos los servicios</option>
            {servicios.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => {
            const headers = ['Fecha','Barbero','Servicio','Inicio','Fin','Cliente','Cedula','WhatsApp','Precio','Estado'].join(',')
            const rows = filtered.map((t: any) => `${t.fecha},"${t.barbero}","${t.servicio}","${aHora(t.inicio)}","${aHora(t.fin)}","${t.nombre}","${t.cedula}","${t.telefono}",${t.precio},"${t.estado||'pendiente'}"`).join('\n')
            const blob = new Blob(['\uFEFF' + headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `turnos_${fechaDesde}_${fechaHasta}.xls`; a.click()
            URL.revokeObjectURL(url)
          }} style={{ padding: '8px 14px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Exportar Excel
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {topBarbero && <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            💇 Barbero top: <strong style={{ color: '#C8862B' }}>{topBarbero[0]}</strong> ({topBarbero[1]})
          </div>}
          {topServicio && <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            ✂️ Servicio top: <strong style={{ color: '#C8862B' }}>{topServicio[0]}</strong> ({topServicio[1]})
          </div>}
          <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            👥 Clientes únicos: <strong style={{ color: '#C8862B' }}>{Object.keys(clientes).length}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => setVerClientes(!verClientes)}
            style={{ padding: '8px 14px', background: verClientes ? '#C8862B' : '#2B2B2B', color: verClientes ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            🏆 Clientes top
          </button>
          <button onClick={() => setVerInactivos(!verInactivos)}
            style={{ padding: '8px 14px', background: verInactivos ? '#e74c3c' : '#2B2B2B', color: verInactivos ? '#fff' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            ⏰ Clientes inactivos (+{diasInactivo}d)
          </button>
          {verInactivos && (
            <select value={diasInactivo} onChange={e => setDiasInactivo(Number(e.target.value))}
              style={{ padding: '8px', background: '#2B2B2B', color: '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 13 }}>
              <option value={15}>+15 días</option>
              <option value={30}>+30 días</option>
              <option value={60}>+60 días</option>
              <option value={90}>+90 días</option>
            </select>
          )}
          <button onClick={() => setVerGrafico(!verGrafico)}
            style={{ padding: '8px 14px', background: verGrafico ? '#C8862B' : '#2B2B2B', color: verGrafico ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            📈 Tendencia
          </button>
          {verGrafico && <>
            <button onClick={() => setVistaGrafico(v => v === 'mensual' ? 'diario' : 'mensual')}
              style={{ padding: '8px 14px', background: '#2B2B2B', color: '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
              {vistaGrafico === 'mensual' ? '📅 Ver diario' : '📆 Ver mensual'}
            </button>
            {esAdmin && <button onClick={() => setVistaGrafico(v => v === 'diario' ? 'demo-diario' : v === 'demo-diario' ? 'demo-mensual' : 'diario')}
              style={{ padding: '8px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
              {vistaGrafico === 'demo-diario' ? '🎲 Demo mensual' : vistaGrafico === 'demo-mensual' ? '📊 Volver' : '🎲 Demo'}
            </button>}
          </>}
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
            <h3 style={{ fontSize: 16, marginBottom: 12, color: '#e74c3c' }}>⏰ Clientes que no reservan hace +{diasInactivo} días</h3>
            {clientesInactivos.length === 0 ? (
              <p style={{ color: '#888', fontSize: 13 }}>Todos los clientes reservaron en los últimos {diasInactivo} días.</p>
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

        {verGrafico && (() => {
          const datos: { label: string; total: number; turnos?: number }[] = []
          const nombreDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
          const esDemo = vistaGrafico === 'demo-diario' || vistaGrafico === 'demo-mensual'

          if (vistaGrafico === 'demo-diario') {
            const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
            const vals = [240000, 300000, 270000, 360000, 450000, 660000, 0]
            const turnosDemo = [8, 10, 9, 12, 15, 22, 0]
            dias.forEach((d, i) => datos.push({ label: d, total: vals[i], turnos: turnosDemo[i] }))
          } else if (vistaGrafico === 'demo-mensual') {
            const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            const vals = [320000, 280000, 410000, 380000, 450000, 520000, 600000, 580000, 490000, 510000, 460000, 550000]
            const turnosDemo = [45, 40, 55, 50, 62, 70, 82, 78, 66, 70, 63, 75]
            labels.forEach((l, i) => datos.push({ label: l, total: vals[i], turnos: turnosDemo[i] }))
          } else if (vistaGrafico === 'mensual') {
            const fechas = turnos.filter(t => {
              if (t.estado !== 'finalizado') return false
              if (filtroBarbero && t.barbero !== filtroBarbero) return false
              if (filtroServicio && t.servicio !== filtroServicio) return false
              return true
            }).map(t => t.fecha).filter(Boolean).sort() as string[]
            if (fechas.length > 0) {
              const min = new Date(fechas[0] + 'T12:00:00')
              const max = new Date(fechas[fechas.length - 1] + 'T12:00:00')
              let d = new Date(min.getFullYear(), min.getMonth(), 1)
              while (d <= max) {
                const label = d.toLocaleDateString('es', { month: 'short', year: '2-digit' })
                const delMes = turnos.filter(t => {
                  const [y, m] = t.fecha.split('-').map(Number)
                  if (y !== d.getFullYear() || m !== d.getMonth() + 1) return false
                  if (t.estado !== 'finalizado') return false
                  if (filtroBarbero && t.barbero !== filtroBarbero) return false
                  if (filtroServicio && t.servicio !== filtroServicio) return false
                  return true
                })
                datos.push({ label, total: delMes.reduce((s, t) => s + t.precio, 0) })
                d.setMonth(d.getMonth() + 1)
              }
            }
          } else {
            const inicio = new Date(fechaDesde + 'T12:00:00')
            const fin = new Date(fechaHasta + 'T12:00:00')
            for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
              const ds = d.toISOString().split('T')[0]
              const fechaObj = new Date(ds + 'T12:00:00')
              const nombre = nombreDias[fechaObj.getDay()]
              const label = `${nombre} ${d}`
              const delDia = turnos.filter(t => {
                if (t.fecha !== ds) return false
                if (t.estado !== 'finalizado') return false
                if (filtroBarbero && t.barbero !== filtroBarbero) return false
                if (filtroServicio && t.servicio !== filtroServicio) return false
                return true
              })
              datos.push({ label, total: delDia.reduce((s, t) => s + t.precio, 0) })
            }
          }

          const max = Math.max(...datos.map(m => m.total), 1)
          const w = vistaGrafico === 'mensual' ? 480 : Math.max(600, datos.length * 30)
          const h = 220, pad = { top: 20, right: 20, bottom: 40, left: 60 }
          const gw = w - pad.left - pad.right, gh = h - pad.top - pad.bottom
          const stepX = gw / (datos.length - 1 || 1)
          const puntos = datos.map((m, i) => ({ x: pad.left + i * stepX, y: pad.top + gh - (m.total / max) * gh, total: m.total }))
          const puntosNoZero = puntos.filter(p => p.total > 0)
          const linePath = puntosNoZero.length > 1 ? puntosNoZero.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') : ''
          return (
            <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 16, border: '1px solid #3a3a3a', marginBottom: 24, overflowX: 'auto' }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>
                📈 {esDemo ? (vistaGrafico === 'demo-diario' ? 'Ejemplo — semana típica' : 'Ejemplo — año típico') : `Ventas ${vistaGrafico === 'mensual' ? 'mensuales' : 'diarias'} (${fechaDesde} → ${fechaHasta})`} — finalizados
              </h3>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w, height: 'auto' }}>
                <line x1={pad.left} y1={pad.top} x2={pad.left} y2={h - pad.bottom} stroke="#3a3a3a" />
                <line x1={pad.left} y1={h - pad.bottom} x2={w - pad.right} y2={h - pad.bottom} stroke="#3a3a3a" />
                {puntos.map((p, i) => (
                  <g key={i}>
                    <line x1={p.x} y1={pad.top} x2={p.x} y2={h - pad.bottom} stroke="#2a2a2a" strokeDasharray="3,3" />
                    <text x={p.x} y={h - pad.bottom + 18} textAnchor="middle" fill="#888" fontSize={esDemo ? 9 : vistaGrafico === 'diario' ? 7 : 10}>{datos[i].label}</text>
                  </g>
                ))}
                {[0, 0.25, 0.5, 0.75, 1].map(r => {
                  const y = pad.top + gh * (1 - r)
                  return <text key={r} x={pad.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize={10}>{Math.round(max * r).toLocaleString('es-AR')}</text>
                })}
                {puntosNoZero.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={4} fill={esDemo ? '#27ae60' : '#C8862B'} />
                ))}
                {linePath && <path d={linePath} stroke={esDemo ? '#27ae60' : '#C8862B'} strokeWidth={2} fill="none" />}
                {puntosNoZero.map((p, i) => (
                  <text key={i} x={p.x} y={p.y - 10} textAnchor="middle" fill="#F2EFE9" fontSize={10} fontWeight={700}>
                    {p.total.toLocaleString('es-AR')}
                  </text>
                ))}
                {esDemo && datos.map((d, i) => d.turnos != null && d.total > 0 ? (
                  <text key={'t' + i} x={puntos[i].x} y={puntos[i].y - 24} textAnchor="middle" fill="#D9A441" fontSize={9}>
                    {d.turnos} turnos
                  </text>
                ) : null)}
              </svg>
            </div>
          )
        })()}

        <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{fechaDesde} → {fechaHasta} · {filtroBarbero || 'Todos los barberos'} · {filtroServicio || 'Todos los servicios'} · {filtered.length} turnos</p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3a3a3a', color: '#888' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Barbero</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Servicio</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Horario</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Cliente</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Precio</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '8px 6px' }}>{t.fecha}</td>
                  <td style={{ padding: '8px 6px' }}>{t.barbero}</td>
                  <td style={{ padding: '8px 6px' }}>{t.servicio}</td>
                  <td style={{ padding: '8px 6px' }}>{aHora(t.inicio)}</td>
                  <td style={{ padding: '8px 6px' }}>{t.nombre}</td>
                  <td style={{ padding: '8px 6px' }}>Gs. {t.precio?.toLocaleString('es-AR')}</td>
                  <td style={{ padding: '8px 6px', color: t.estado === 'finalizado' ? '#27ae60' : t.estado === 'cancelado' ? '#e74c3c' : '#D9A441' }}>
                    {t.estado || 'pendiente'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}
