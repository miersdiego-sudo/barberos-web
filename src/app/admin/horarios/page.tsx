'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserInfo, logout } from '@/lib/auth'
import { actualizarHorario, type HorarioDB } from '@/lib/supabaseClient'

const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioDB[]>([])
  const [localId, setLocalId] = useState<number | null>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [inicializando, setInicializando] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info) { router.push('/login'); return }
      if (info.activo === false) { router.push('/pendiente'); return }
      setLocalId(info.local_id)
      setEsAdmin(info.is_super_admin)
    })
  }, [])

  const cargar = async (lid: number) => {
    const res = await fetch('/api/init-horarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local_id: lid }),
    })
    if (!res.ok) { const err = await res.json(); alert('Error: ' + err.error); return }
    const { horarios: data } = await res.json()
    setInicializando(true)
    setHorarios(data)
    setInicializando(false)
  }

  useEffect(() => { if (localId !== null) cargar(localId).catch(console.error) }, [localId])

  const toggle = async (h: HorarioDB) => {
    try {
      await actualizarHorario(h.id!, { activo: !h.activo })
      setHorarios(horarios.map(x => x.id === h.id ? { ...x, activo: !x.activo } : x))
    } catch (e) { alert('Error al actualizar') }
  }

  const cambiar = async (h: HorarioDB, campo: string, valor: string) => {
    try {
      await actualizarHorario(h.id!, { [campo]: valor })
      setHorarios(horarios.map(x => x.id === h.id ? { ...x, [campo]: valor } : x))
    } catch (e) { alert('Error al actualizar') }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Horarios</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
            {esAdmin && <a href="/admin/locales" style={{ color: '#e74c3c', textDecoration: 'none', fontSize: 14 }}>Locales</a>}
            <button onClick={async () => { await logout(); router.push('/login') }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Salir</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {inicializando ? <p style={{ color: '#888', fontSize: 13 }}>Inicializando horarios...</p> : horarios.length === 0 ? <p style={{ color: '#888', fontSize: 13 }}>No hay horarios.</p> : horarios.map(h => (
            <div key={h.id} style={{
              background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, opacity: h.activo ? 1 : 0.4,
            }}>
              <div style={{ minWidth: 100 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{dias[h.dia_semana]}</p>
              </div>
              {h.activo ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: '#888' }}>Mañana</span>
                  <input type="time" value={h.inicio_manana} onChange={e => cambiar(h, 'inicio_manana', e.target.value)}
                    style={{ padding: 4, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 13, width: 80 }} />
                  <span style={{ fontSize: 13, color: '#888' }}>—</span>
                  <input type="time" value={h.fin_manana} onChange={e => cambiar(h, 'fin_manana', e.target.value)}
                    style={{ padding: 4, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 13, width: 80 }} />
                  <span style={{ fontSize: 13, color: '#888' }}>|</span>
                  <span style={{ fontSize: 13, color: '#888' }}>Tarde</span>
                  <input type="time" value={h.inicio_tarde} onChange={e => cambiar(h, 'inicio_tarde', e.target.value)}
                    style={{ padding: 4, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 13, width: 80 }} />
                  <span style={{ fontSize: 13, color: '#888' }}>—</span>
                  <input type="time" value={h.fin_tarde} onChange={e => cambiar(h, 'fin_tarde', e.target.value)}
                    style={{ padding: 4, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 13, width: 80 }} />
                </div>
              ) : <p style={{ color: '#888', fontSize: 13 }}>Cerrado</p>}
              <button onClick={() => toggle(h)}
                style={{ padding: '6px 14px', background: h.activo ? '#e74c3c' : '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                {h.activo ? 'Cerrar' : 'Abrir'}
              </button>
            </div>
          ))}
        </div>
        <p style={{ color: '#666', fontSize: 12, marginTop: 16 }}>Los cambios se guardan automáticamente al modificar un horario.</p>
      </div>
    </div>
  )
}
