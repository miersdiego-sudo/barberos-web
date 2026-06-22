'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLocales, supabase, type LocalDB } from '@/lib/supabaseClient'
import { getUserInfo } from '@/lib/auth'

export default function AdminLocalesPage() {
  const [locales, setLocales] = useState<LocalDB[]>([])
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [emailAsignar, setEmailAsignar] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info || !info.is_super_admin) { router.push('/login'); return }
      setUserId(info.id)
      getLocales().then(setLocales).catch(console.error)
      setLoading(false)
    })
  }, [])

  const crear = async () => {
    if (!nombre.trim() || !slug.trim()) return
    const { error } = await supabase.from('locales').insert({ nombre: nombre.trim(), slug: slug.trim() })
    if (error) { alert('Error: ' + error.message); return }
    setNombre(''); setSlug('')
    getLocales().then(setLocales)
  }

  const asignarUsuario = async (localId: number) => {
    if (!emailAsignar.trim()) return
    const { data: users } = await supabase.rpc('buscar_usuario_por_email', { email_buscar: emailAsignar.trim() })
    if (!users) { alert('Usuario no encontrado. Debe registrarse primero.'); return }
    await supabase.from('locales').update({ user_id: users }).eq('id', localId)
    setEmailAsignar('')
    getLocales().then(setLocales)
  }

  const asignarme = async (localId: number) => {
    if (!userId) return
    await supabase.from('locales').update({ user_id: userId }).eq('id', localId)
    getLocales().then(setLocales)
  }

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Cargando...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', color: '#F2EFE9', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24 }}>Administrar Locales</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Nombre del local" value={nombre} onChange={e => setNombre(e.target.value)}
            style={{ flex: 1, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
          <input type="text" placeholder="Slug (ej: dilopez)" value={slug} onChange={e => setSlug(e.target.value)}
            style={{ width: 120, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
          <button onClick={crear} style={{ padding: '10px 16px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Crear</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {locales.map(l => (
            <div key={l.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{l.nombre}</p>
                  <p style={{ color: '#888', fontSize: 13 }}>/{l.slug} · {l.user_id ? '✅ Dueño asignado' : '⏳ Sin dueño'}{l.activo !== false ? '' : ' · ⛔ Inactivo'}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <a href={`/turnos/${l.slug}`} target="_blank" style={{ padding: '6px 10px', background: 'transparent', color: '#C8862B', border: '1px solid #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>Ver</a>
                </div>
              </div>
              {!l.user_id && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => asignarme(l.id)} style={{ padding: '8px 12px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Asignarme</button>
                  <span style={{ color: '#555', fontSize: 12 }}>ó</span>
                  <input type="email" placeholder="Email del dueño" value={emailAsignar} onChange={e => setEmailAsignar(e.target.value)}
                    style={{ flex: 1, padding: 8, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 13 }} />
                  <button onClick={() => asignarUsuario(l.id)} style={{ padding: '8px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Asignar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
