'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLocales, supabase, type LocalDB } from '@/lib/supabaseClient'
import { getUserInfo } from '@/lib/auth'

export default function AdminLocalesPage() {
  const [locales, setLocales] = useState<LocalDB[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [emails, setEmails] = useState<Record<number, string>>({})
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info || !info.is_super_admin) { router.push('/login'); return }
      setUserId(info.id)
      getLocales().then(setLocales).catch(console.error)
      fetch('/api/emails-locales').then(r => r.json()).then(setEmails).catch(() => {})
      setLoading(false)
    })
  }, [])

  const aprobar = async (localId: number) => {
    await supabase.from('locales').update({ activo: true }).eq('id', localId)
    getLocales().then(setLocales)
  }

  const eliminar = async (localId: number) => {
    if (!confirm('¿Eliminar este local? Se borrarán todos sus datos.')) return
    await supabase.from('locales').delete().eq('id', localId)
    getLocales().then(setLocales)
  }

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Cargando...</div>

  const pendientes = locales.filter(l => l.activo === false)
  const activas = locales.filter(l => l.activo !== false)

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', color: '#F2EFE9', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24 }}>Administrar Locales</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        {pendientes.length > 0 && (
          <>
            <h2 style={{ fontSize: 16, color: '#D9A441', marginBottom: 12 }}>Solicitudes pendientes ({pendientes.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {pendientes.map(l => (
                <div key={l.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #D9A441' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{l.nombre}</p>
                      <p style={{ color: '#888', fontSize: 13 }}>/{l.slug} · {l.user_id ? `Dueño registrado (${emails[l.id] || '...'})` : '⏳ Sin dueño'}</p>
                    </div>
                    <button onClick={() => aprobar(l.id)} style={{ padding: '8px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Aprobar</button>
                    <button onClick={() => eliminar(l.id)} style={{ padding: '8px 10px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginLeft: 6 }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 style={{ fontSize: 16, color: '#888', marginBottom: 12 }}>Locales activos ({activas.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activas.map(l => (
            <div key={l.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{l.nombre}</p>
                  <p style={{ color: '#888', fontSize: 13 }}>/{l.slug} · {l.user_id ? `✅ ${emails[l.id] || 'Dueño asignado'}` : '⏳ Sin dueño'}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <a href={`/turnos/${l.slug}`} target="_blank" style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>Ver</a>
                  <button onClick={() => eliminar(l.id)} style={{ padding: '6px 10px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {locales.length === 0 && <p style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>No hay locales registrados</p>}
      </div>
    </div>
  )
}
