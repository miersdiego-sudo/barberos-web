'use client'

import { useEffect, useState } from 'react'
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, type ProductoDB } from '@/lib/supabaseClient'

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoDB[]>([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [editId, setEditId] = useState<number | null>(null)

  useEffect(() => { getProductos().then(setProductos).catch(console.error) }, [])

  const guardar = async () => {
    if (!nombre.trim() || !precio) return
    try {
      const data = editId
        ? await actualizarProducto(editId, { nombre: nombre.trim(), precio: Number(precio), stock: Number(stock) || 0 })
        : await crearProducto({ nombre: nombre.trim(), precio: Number(precio), stock: Number(stock) || 0 })
      if (data) setProductos(productos.map(p => p.id === editId ? data[0] : p).concat(editId ? [] : data))
      setNombre(''); setPrecio(''); setStock(''); setEditId(null)
    } catch (e) { alert('Error al guardar producto') }
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
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Productos</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ flex: '1 1 140px', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Precio Gs." value={precio} onChange={e => setPrecio(e.target.value)}
              style={{ width: 120, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)}
              style={{ width: 80, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <button onClick={guardar}
              style={{ padding: '10px 20px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              {editId ? 'Actualizar' : 'Agregar'}
            </button>
            {editId && <button onClick={() => { setEditId(null); setNombre(''); setPrecio(''); setStock('') }}
              style={{ padding: '10px 14px', background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>X</button>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {productos.map(p => (
            <div key={p.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{p.nombre}</p>
                <p style={{ color: '#888', fontSize: 13 }}>Gs. {p.precio.toLocaleString('es-AR')} · Stock: <span style={{ color: p.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 700 }}>{p.stock}</span></p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditId(p.id ?? null); setNombre(p.nombre); setPrecio(String(p.precio)); setStock(String(p.stock)) }}
                  style={{ padding: '6px 12px', background: 'transparent', color: '#aaa', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Editar</button>
                <button onClick={async () => { if (p.id) { await eliminarProducto(p.id); setProductos(productos.filter(x => x.id !== p.id)) } }}
                  style={{ padding: '6px 12px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
