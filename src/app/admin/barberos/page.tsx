'use client'

import { useEffect, useState } from 'react'
import { getBarberos, crearBarbero, eliminarBarbero, actualizarBarbero, supabase } from '@/lib/supabaseClient'

type Barbero = { id?: number; nombre: string; foto?: string | null }

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [nombre, setNombre] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')

  useEffect(() => {
    getBarberos().then(setBarberos).catch(console.error)
  }, [])

  const agregar = async () => {
    if (!nombre.trim()) return
    try {
      const data = await crearBarbero(nombre.trim())
      setBarberos([...barberos, ...data])
      setNombre('')
    } catch (e: any) {
      alert(e.message || 'Error al agregar barbero')
    }
  }

  const eliminar = async (id?: number) => {
    if (!id) return
    try {
      await eliminarBarbero(id)
      setBarberos(barberos.filter(b => b.id !== id))
    } catch (e) {
      console.error(e)
      alert('Error al eliminar barbero')
    }
  }

  const subirFoto = async (id: number, file: File) => {
    try {
      const ext = file.name.split('.').pop()
      const path = `barbero-${id}.${ext}`
      const { data: existing } = await supabase.storage.from('barberos').list('', { search: `barbero-${id}` })
      if (existing) {
        for (const f of existing) {
          if (f.name.startsWith(`barbero-${id}`)) {
            await supabase.storage.from('barberos').remove([f.name])
          }
        }
      }
      const { error: uploadError } = await supabase.storage.from('barberos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('barberos').getPublicUrl(path)
      const foto = urlData.publicUrl
      // force cache bust
      const fotoFinal = `${foto}?v=${Date.now()}`
      await actualizarBarbero(id, { foto: fotoFinal })
      setBarberos(barberos.map(b => b.id === id ? { ...b, foto: fotoFinal } : b))
    } catch (e) {
      console.error(e)
      alert('Error al subir foto')
    }
  }

  const guardarNombre = async (id: number) => {
    if (!editNombre.trim()) return
    try {
      await actualizarBarbero(id, { nombre: editNombre.trim() })
      setBarberos(barberos.map(b => b.id === id ? { ...b, nombre: editNombre.trim() } : b))
      setEditandoId(null)
      setEditNombre('')
    } catch (e) {
      console.error(e)
      alert('Error al cambiar nombre')
    }
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
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Barberos</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Barbería DI LOPEZ</p>
          </div>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" placeholder="Nombre del barbero" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ flex: 1, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <button onClick={agregar} disabled={!nombre.trim()}
              style={{ padding: '10px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: !nombre.trim() ? 0.5 : 1 }}>
              Agregar
            </button>
          </div>
        </div>

        {barberos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>No hay barberos registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {barberos.map(b => (
              <div key={b.id ?? b.nombre} style={{
                background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {b.foto ? (
                    <img src={b.foto} alt={b.nombre}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#888' }}>
                      ?
                    </div>
                  )}
                  {editandoId === b.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)}
                        style={{ padding: 6, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, width: 140 }} />
                      <button onClick={() => b.id && guardarNombre(b.id)}
                        style={{ padding: '6px 10px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        Guardar
                      </button>
                      <button onClick={() => { setEditandoId(null); setEditNombre('') }}
                        style={{ padding: '6px 10px', background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                        X
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{b.nombre}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditandoId(b.id ?? null); setEditNombre(b.nombre) }}
                    style={{ padding: '6px 10px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Nombre
                  </button>
                  <label style={{ padding: '6px 10px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Foto
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f && b.id) subirFoto(b.id, f) }} />
                  </label>
                  <button onClick={() => b.id && eliminar(b.id)}
                    style={{ padding: '6px 14px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
