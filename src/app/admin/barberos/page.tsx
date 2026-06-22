'use client'

import { useEffect, useState } from 'react'
import { getBarberos, crearBarbero, actualizarBarbero, supabase, type BarberoDB } from '@/lib/supabaseClient'
import { config } from '@/lib/config'

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<BarberoDB[]>([])
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')

  useEffect(() => {
    getBarberos().then(setBarberos).catch(console.error)
  }, [])

  const agregar = async () => {
    if (!nombre.trim()) return
    try {
      const data = await crearBarbero(nombre.trim())
      if (data.length > 0) {
        const id = data[0].id!
        await actualizarBarbero(id, { cedula: cedula.trim() || null, telefono: telefono.trim() || null })
        getBarberos().then(setBarberos)
      }
      setNombre(''); setCedula(''); setTelefono('')
    } catch (e) {
      alert('Error al agregar barbero')
    }
  }

  const toggleActivo = async (b: BarberoDB) => {
    if (!b.id) return
    try {
      await actualizarBarbero(b.id, { activo: !b.activo })
      setBarberos(barberos.map(x => x.id === b.id ? { ...x, activo: !x.activo } : x))
    } catch (e) {
      alert('Error al cambiar estado')
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
      const fotoFinal = `${urlData.publicUrl}?v=${Date.now()}`
      await actualizarBarbero(id, { foto: fotoFinal })
      setBarberos(barberos.map(b => b.id === id ? { ...b, foto: fotoFinal } : b))
    } catch (e) {
      alert('Error al subir foto')
    }
  }

  const activos = barberos.filter(b => b.activo !== false)
  const inactivos = barberos.filter(b => b.activo === false)

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
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{config.nombre}</p>
          </div>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="text" placeholder="Nombre del barbero" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="text" placeholder="Cédula (opcional)" value={cedula} onChange={e => setCedula(e.target.value)}
              style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="text" placeholder="Teléfono (opcional)" value={telefono} onChange={e => setTelefono(e.target.value)}
              style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <button onClick={agregar} disabled={!nombre.trim()}
              style={{ padding: '10px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: !nombre.trim() ? 0.5 : 1 }}>
              Agregar barbero
            </button>
          </div>
        </div>

        {activos.length > 0 && (
          <>
            <h3 style={{ fontSize: 15, marginBottom: 8, color: '#27ae60' }}>🟢 Activos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {activos.map(b => (
                <BarberoCard key={b.id} barbero={b} onToggle={toggleActivo} onFoto={subirFoto} onUpdate={b2 => setBarberos(barberos.map(x => x.id === b2.id ? b2 : x))} />
              ))}
            </div>
          </>
        )}

        {inactivos.length > 0 && (
          <>
            <h3 style={{ fontSize: 15, marginBottom: 8, color: '#888' }}>🔴 Inactivos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {inactivos.map(b => (
                <BarberoCard key={b.id} barbero={b} onToggle={toggleActivo} onFoto={subirFoto} onUpdate={b2 => setBarberos(barberos.map(x => x.id === b2.id ? b2 : x))} />
              ))}
            </div>
          </>
        )}

        {barberos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>No hay barberos registrados.</p>
        )}
      </div>
    </div>
  )
}

function BarberoCard({ barbero, onToggle, onFoto, onUpdate }: {
  barbero: BarberoDB
  onToggle: (b: BarberoDB) => void
  onFoto: (id: number, file: File) => void
  onUpdate: (b: BarberoDB) => void
}) {
  const [editando, setEditando] = useState(false)
  const [editNombre, setEditNombre] = useState(barbero.nombre)
  const [editCedula, setEditCedula] = useState(barbero.cedula || '')
  const [editTelefono, setEditTelefono] = useState(barbero.telefono || '')

  const guardar = async () => {
    if (!editNombre.trim() || !barbero.id) return
    try {
      await actualizarBarbero(barbero.id, {
        nombre: editNombre.trim(),
        cedula: editCedula.trim() || null,
        telefono: editTelefono.trim() || null,
      })
      onUpdate({ ...barbero, nombre: editNombre.trim(), cedula: editCedula.trim() || null, telefono: editTelefono.trim() || null })
      setEditando(false)
    } catch (e) {
      alert('Error al guardar')
    }
  }

  const b = barbero
  return (
    <div style={{
      background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {b.foto ? (
          <img src={b.foto} alt={b.nombre} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 6, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#888' }}>?</div>
        )}
        {editando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)}
              style={{ padding: 6, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, width: 140 }} />
            <input type="text" placeholder="Cédula" value={editCedula} onChange={e => setEditCedula(e.target.value)}
              style={{ padding: 6, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 12, width: 140 }} />
            <input type="text" placeholder="Teléfono" value={editTelefono} onChange={e => setEditTelefono(e.target.value)}
              style={{ padding: 6, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 12, width: 140 }} />
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={guardar} style={{ padding: '4px 10px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Guardar</button>
              <button onClick={() => setEditando(false)} style={{ padding: '4px 10px', background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>X</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{b.nombre}</p>
            {(b.cedula || b.telefono) && <p style={{ color: '#888', fontSize: 12 }}>{b.cedula && `C.I. ${b.cedula}`}{b.cedula && b.telefono && ' · '}{b.telefono && `📞 ${b.telefono}`}</p>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setEditando(!editando)}
          style={{ padding: '6px 10px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          Editar
        </button>
        <label style={{ padding: '6px 10px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          Foto
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f && b.id) onFoto(b.id, f) }} />
        </label>
        <button onClick={() => onToggle(b)}
          style={{ padding: '6px 14px', background: b.activo !== false ? '#e74c3c' : '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          {b.activo !== false ? 'Inactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}
