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

export default function EstadisticasPage() {
  const [turnos, setTurnos] = useState<any[]>([])
  const [localId, setLocalId] = useState<number | null>(null)
  const [filtroBarbero, setFiltroBarbero] = useState('')
  const [filtroServicio, setFiltroServicio] = useState('')
  const router = useRouter()
  const hoy = new Date()
  const [mes, setMes] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`)

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info) { router.push('/login'); return }
      setLocalId(info.local_id)
    })
  }, [])

  useEffect(() => {
    if (localId !== null) {
      getTurnos(localId ?? undefined).then(setTurnos).catch(console.error)
    }
  }, [localId])

  const [year, month] = mes.split('-').map(Number)

  const delMes = turnos.filter(t => {
    const [y, m] = t.fecha.split('-').map(Number)
    return y === year && m === month
  })

  const filtered = delMes.filter(t => {
    if (filtroBarbero && t.barbero !== filtroBarbero) return false
    if (filtroServicio && t.servicio !== filtroServicio) return false
    return true
  })

  const finalizados = filtered.filter(t => t.estado === 'finalizado').length
  const cancelados = filtered.filter(t => t.estado === 'cancelado').length
  const pendientes = filtered.filter(t => !t.estado || t.estado === 'pendiente').length

  const barberoCount: Record<string, number> = {}
  const servicioCount: Record<string, number> = {}
  for (const t of filtered) {
    barberoCount[t.barbero] = (barberoCount[t.barbero] || 0) + 1
    servicioCount[t.servicio] = (servicioCount[t.servicio] || 0) + 1
  }
  const topBarbero = Object.entries(barberoCount).sort((a, b) => b[1] - a[1])[0]
  const topServicio = Object.entries(servicioCount).sort((a, b) => b[1] - a[1])[0]

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
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
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
            const a = document.createElement('a'); a.href = url; a.download = `turnos_${mes}.csv`; a.click()
            URL.revokeObjectURL(url)
          }} style={{ padding: '8px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Exportar CSV
          </button>
          <button onClick={() => {
            const headers = ['Fecha','Barbero','Servicio','Inicio','Fin','Cliente','Cedula','WhatsApp','Precio','Estado'].join(',')
            const rows = filtered.map((t: any) => `${t.fecha},"${t.barbero}","${t.servicio}","${aHora(t.inicio)}","${aHora(t.fin)}","${t.nombre}","${t.cedula}","${t.telefono}",${t.precio},"${t.estado||'pendiente'}"`).join('\n')
            const blob = new Blob(['\uFEFF' + headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `turnos_${mes}.xls`; a.click()
            URL.revokeObjectURL(url)
          }} style={{ padding: '8px 14px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Exportar Excel
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            ✅ Finalizados: <strong style={{ color: '#27ae60' }}>{finalizados}</strong>
          </div>
          <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            ❌ Cancelados: <strong style={{ color: '#e74c3c' }}>{cancelados}</strong>
          </div>
          <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            ⏳ Pendientes: <strong style={{ color: '#D9A441' }}>{pendientes}</strong>
          </div>
          {topBarbero && <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            💇 Barbero top: <strong style={{ color: '#C8862B' }}>{topBarbero[0]}</strong> ({topBarbero[1]})
          </div>}
          {topServicio && <div style={{ padding: '10px 16px', background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
            ✂️ Servicio top: <strong style={{ color: '#C8862B' }}>{topServicio[0]}</strong> ({topServicio[1]})
          </div>}
        </div>

        <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Filtros activos: {filtroBarbero || 'Todos los barberos'} · {filtroServicio || 'Todos los servicios'} · {filtered.length} turnos</p>

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
