'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLocales, supabase, type LocalDB } from '@/lib/supabaseClient'
import { getUserInfo } from '@/lib/auth'

export default function AdminLocalesPage() {
  const [locales, setLocales] = useState<LocalDB[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info || !info.is_super_admin) { router.push('/login'); return }
      setUserId(info.id)
      cargar()
      setLoading(false)
    })
  }, [])

  const cargar = async () => {
    const todos = await getLocales()
    const hoy = new Date()
    for (const l of todos) {
      if (l.activo && l.fecha_pago) {
        const pago = new Date(l.fecha_pago + 'T12:00:00')
        const diff = Math.floor((hoy.getTime() - pago.getTime()) / (1000 * 60 * 60 * 24))
        if (diff > 30) {
          await supabase.from('locales').update({ activo: false }).eq('id', l.id)
        }
      }
    }
    getLocales().then(setLocales)
  }

  const aprobar = async (localId: number) => {
    await supabase.from('locales').update({ activo: true, fecha_pago: new Date().toISOString().split('T')[0] }).eq('id', localId)
    cargar()
  }

  const inactivar = async (localId: number) => {
    if (!confirm('¿Inactivar este local? Dejará de aparecer en la web.')) return
    await supabase.from('locales').update({ activo: false }).eq('id', localId)
    cargar()
  }

  const registrarPago = async (localId: number) => {
    await supabase.from('locales').update({ activo: true, fecha_pago: new Date().toISOString().split('T')[0] }).eq('id', localId)
    cargar()
  }

  const eliminar = async (local: LocalDB) => {
    if (!confirm(`¿Eliminar ${local.nombre}? Se borrarán todos sus datos (turnos, barberos, servicios, etc.).`)) return
    const res = await fetch('/api/delete-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local_id: local.id, user_id: local.user_id, email: local.email }),
    })
    if (!res.ok) { const err = await res.json(); alert('Error: ' + err.error); return }
    alert('Local eliminado. Podés crear uno nuevo con el mismo email.')
    cargar()
  }

  const resetPass = async (userId: string | null | undefined, nombre: string) => {
    if (!userId) return
    const nueva = prompt(`Nueva contraseña para ${nombre}:`, '')
    if (!nueva || nueva.length < 6) { alert('Minimo 6 caracteres'); return }
    if (!confirm(`¿Cambiar contraseña de ${nombre}?`)) return
    const res = await fetch('/api/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, new_password: nueva }),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    alert('✅ Contraseña actualizada')
  }

  const cambiarEmail = async (userId: string | null | undefined, nombre: string, emailActual: string | null | undefined) => {
    if (!userId) return
    const nuevo = prompt(`Nuevo email para ${nombre} (actual: ${emailActual || ''}):`, emailActual || '')
    if (!nuevo || nuevo === emailActual) return
    if (!confirm(`¿Cambiar email de ${nombre} a ${nuevo}?`)) return
    const res = await fetch('/api/update-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, new_email: nuevo }),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    alert('✅ Email actualizado')
    cargar()
  }

  const diasRestantes = (fecha?: string | null) => {
    if (!fecha) return null
    const diff = Math.floor((Date.now() - new Date(fecha + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
    return 30 - diff
  }

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Cargando...</div>

  const q = busqueda.toLowerCase()
  const filtrados = locales.filter(l =>
    l.nombre.toLowerCase().includes(q) ||
    l.slug.toLowerCase().includes(q) ||
    (l.email || '').toLowerCase().includes(q)
  )
  const pendientes = filtrados.filter(l => l.activo === false && !l.fecha_pago)
  const activas = filtrados.filter(l => l.activo === true)
  const vencidas = filtrados.filter(l => l.activo === false && l.fecha_pago)

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', color: '#F2EFE9', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24 }}>Administrar Locales</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <input type="text" placeholder="Buscar por nombre, slug o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 10, marginBottom: 20, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />

        {pendientes.length > 0 && (
          <>
            <h2 style={{ fontSize: 16, color: '#D9A441', marginBottom: 12 }}>Solicitudes pendientes ({pendientes.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {pendientes.map(l => (
                <div key={l.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #D9A441' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{l.nombre}</p>
                      <p style={{ color: '#888', fontSize: 13 }}>/{l.slug} · {l.user_id ? '✅ Dueño asignado' : '⏳ Sin dueño'}</p>
                      {l.email && <p style={{ color: '#aaa', fontSize: 12, marginTop: 1 }}>📧 {l.email}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => aprobar(l.id)} style={{ padding: '8px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Aprobar</button>
                      {l.user_id && <button onClick={() => resetPass(l.user_id, l.nombre)} style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Contraseña</button>}
                      {l.user_id && <button onClick={() => cambiarEmail(l.user_id, l.nombre, l.email)} style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginLeft: 4 }}>Email</button>}
                      <button onClick={() => eliminar(l)} style={{ padding: '8px 10px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginLeft: 6 }}>Eliminar</button>
                      <span style={{ fontSize: 9, color: '#555', marginLeft: 4 }}>uid:{l.user_id || 'vacio'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 style={{ fontSize: 16, color: '#888', marginBottom: 12 }}>Locales activos ({activas.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activas.map(l => {
            const dias = diasRestantes(l.fecha_pago)
            return (
            <div key={l.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{l.nombre}</p>
                  <p style={{ color: '#888', fontSize: 13 }}>/{l.slug} · {l.user_id ? '✅ Dueño asignado' : '⏳ Sin dueño'}</p>
                  {l.email && <p style={{ color: '#aaa', fontSize: 12, marginTop: 1 }}>📧 {l.email}</p>}
                  {l.fecha_pago && <p style={{ fontSize: 12, color: dias !== null && dias <= 3 ? dias < 0 ? '#e74c3c' : '#D9A441' : '#888', marginTop: 2 }}>
                    {dias !== null && dias >= 0 ? `⏳ ${dias}d restantes` : dias !== null && dias < 0 ? `❌ Vencido hace ${Math.abs(dias)}d` : ''} · Último pago: {l.fecha_pago}
                  </p>}
                </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {l.user_id && <button onClick={() => resetPass(l.user_id, l.nombre)} style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Contraseña</button>}
                    {l.user_id && <button onClick={() => cambiarEmail(l.user_id, l.nombre, l.email)} style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginLeft: 4 }}>Email</button>}
                    <button onClick={() => registrarPago(l.id)} style={{ padding: '6px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Registrar pago</button>
                  <button onClick={() => inactivar(l.id)} style={{ padding: '6px 10px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Inactivar</button>
                  <a href={`/turnos/${l.slug}`} target="_blank" style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>Ver</a>
                  <button onClick={() => eliminar(l)} style={{ padding: '6px 10px', background: 'transparent', color: '#888', border: '1px solid #888', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                </div>
              </div>
            </div>
          )})}
        </div>

        {vencidas.length > 0 && (
          <>
            <h2 style={{ fontSize: 16, color: '#e74c3c', marginBottom: 12, marginTop: 24 }}>Vencidos sin pago ({vencidas.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vencidas.map(l => {
                const dias = diasRestantes(l.fecha_pago)
                return (
                <div key={l.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #e74c3c' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{l.nombre}</p>
                      <p style={{ color: '#888', fontSize: 13 }}>/{l.slug}</p>
                      {l.email && <p style={{ color: '#aaa', fontSize: 12, marginTop: 1 }}>📧 {l.email}</p>}
                      {l.fecha_pago && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 2 }}>
                        ❌ Vencido hace {dias !== null ? Math.abs(dias) : '?'}d · Último pago: {l.fecha_pago}
                      </p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {l.user_id && <button onClick={() => resetPass(l.user_id, l.nombre)} style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Contraseña</button>}
                      {l.user_id && <button onClick={() => cambiarEmail(l.user_id, l.nombre, l.email)} style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginLeft: 4 }}>Email</button>}
                      <button onClick={() => registrarPago(l.id)} style={{ padding: '6px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Registrar pago</button>
                      <button onClick={() => eliminar(l)} style={{ padding: '6px 10px', background: 'transparent', color: '#888', border: '1px solid #888', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </>
        )}

        {locales.length === 0 && <p style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>No hay locales registrados</p>}
      </div>
    </div>
  )
}
