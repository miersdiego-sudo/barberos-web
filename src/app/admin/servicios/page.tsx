'use client'

import { useEffect, useState } from 'react'
import { getServicios, crearServicio, actualizarServicio, eliminarServicio, type ServicioDB } from '@/lib/supabaseClient'

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioDB[]>([])
  const [nombre, setNombre] = useState('')
  const [duracion, setDuracion] = useState('')
  const [precio, setPrecio] = useState('')
  const [editId, setEditId] = useState<number | null>(null)

  useEffect(() => { getServicios().then(setServicios).catch(console.error) }, [])

  const guardar = async () => {
    if (!nombre.trim() || !duracion || !precio) return
    try {
      const data = editId
        ? await actualizarServicio(editId, { nombre: nombre.trim(), duracion: Number(duracion), precio: Number(precio) })
        : await crearServicio({ nombre: nombre.trim(), duracion: Number(duracion), precio: Number(precio) })
      if (data) setServicios(servicios.map(s => s.id === editId ? data[0] : s).concat(editId ? [] : data))
      setNombre(''); setDuracion(''); setPrecio(''); setEditId(null)
    } catch (e) { alert('Error al guardar servicio') }
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
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Servicios</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ flex: '1 1 140px', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Minutos" value={duracion} onChange={e => setDuracion(e.target.value)}
              style={{ width: 90, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Precio Gs." value={precio} onChange={e => setPrecio(e.target.value)}
              style={{ width: 120, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <button onClick={guardar}
              style={{ padding: '10px 20px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              {editId ? 'Actualizar' : 'Agregar'}
            </button>
            {editId && <button onClick={() => { setEditId(null); setNombre(''); setDuracion(''); setPrecio('') }}
              style={{ padding: '10px 14px', background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>X</button>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {servicios.map(s => (
            <div key={s.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{s.nombre}</p>
                <p style={{ color: '#888', fontSize: 13 }}>{s.duracion} min · Gs. {s.precio.toLocaleString('es-AR')}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditId(s.id ?? null); setNombre(s.nombre); setDuracion(String(s.duracion)); setPrecio(String(s.precio)) }}
                  style={{ padding: '6px 12px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Editar</button>
                <button onClick={async () => { if (s.id) { await eliminarServicio(s.id); setServicios(servicios.filter(x => x.id !== s.id)) } }}
                  style={{ padding: '6px 12px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
