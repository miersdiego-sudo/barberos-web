'use client'

import { useEffect, useState } from 'react'
import { getPromos, crearPromo, eliminarPromo } from '@/lib/supabaseClient'

type Promo = {
  id?: number
  nombre: string
  porcentaje: number
  inicio: string
  fin: string
}

export default function PromocionesPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [nombre, setNombre] = useState('')
  const [porcentaje, setPorcentaje] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')

  useEffect(() => {
    getPromos().then(setPromos).catch(console.error)
  }, [])

  const agregar = async () => {
    if (!nombre || !porcentaje || !inicio || !fin) return
    try {
      const data = await crearPromo({ nombre, porcentaje: Number(porcentaje), inicio, fin })
      setPromos([...promos, ...data])
      setNombre('')
      setPorcentaje('')
      setInicio('')
      setFin('')
    } catch (e) {
      console.error(e)
      alert('Error al guardar la promoción')
    }
  }

  const eliminar = async (id: number) => {
    try {
      await eliminarPromo(id)
      setPromos(promos.filter(p => p.id !== id))
    } catch (e) {
      console.error(e)
      alert('Error al eliminar la promoción')
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
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Promociones</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Barbería DI LOPEZ</p>
          </div>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16, color: '#ccc' }}>Nueva promoción</h2>
          <input type="text" placeholder="Nombre (ej: Martes de Barbería)" value={nombre} onChange={e => setNombre(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
          <input type="number" placeholder="% descuento" value={porcentaje} onChange={e => setPorcentaje(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Desde</label>
              <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Hasta</label>
              <input type="date" value={fin} onChange={e => setFin(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            </div>
          </div>
          <button onClick={agregar} disabled={!nombre || !porcentaje || !inicio || !fin}
            style={{ padding: '10px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: (!nombre || !porcentaje || !inicio || !fin) ? 0.5 : 1 }}>
            Agregar promoción
          </button>
        </div>

        {promos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>No hay promociones creadas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {promos.map((p, i) => (
              <div key={p.id ?? i} style={{
                background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{p.nombre}</p>
                  <p style={{ color: '#D9A441', fontSize: 13 }}>{p.porcentaje}% OFF</p>
                  <p style={{ color: '#888', fontSize: 12 }}>{p.inicio} → {p.fin}</p>
                </div>
                <button onClick={() => p.id && eliminar(p.id)}
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
