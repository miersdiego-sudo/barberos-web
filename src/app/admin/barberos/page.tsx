'use client'

import { useEffect, useState } from 'react'
import { getBarberos, crearBarbero, eliminarBarbero } from '@/lib/supabaseClient'

type Barbero = { id?: number; nombre: string }

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [nombre, setNombre] = useState('')

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

  const eliminar = async (id: number) => {
    try {
      await eliminarBarbero(id)
      setBarberos(barberos.filter(b => b.id !== id))
    } catch (e) {
      console.error(e)
      alert('Error al eliminar barbero')
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
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{b.nombre}</p>
                <button onClick={() => b.id && eliminar(b.id)}
                  style={{ padding: '6px 14px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
