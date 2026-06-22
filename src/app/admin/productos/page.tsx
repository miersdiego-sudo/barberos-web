'use client'

import { useEffect, useState } from 'react'
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, type ProductoDB } from '@/lib/supabaseClient'

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoDB[]>([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [descuento, setDescuento] = useState('')
  const [diasValidez, setDiasValidez] = useState('30')
  const [editId, setEditId] = useState<number | null>(null)
  const [addStock, setAddStock] = useState<{ id: number; qty: string } | null>(null)

  useEffect(() => { getProductos().then(setProductos).catch(console.error) }, [])

  const guardar = async () => {
    if (!nombre.trim() || !precio) return
    try {
      const data = editId
        ? await actualizarProducto(editId, { nombre: nombre.trim(), precio: Number(precio), stock: Number(stock) || 0, descuento_corte: descuento ? Number(descuento) : null, dias_validez: Number(diasValidez) || 30 })
        : await crearProducto({ nombre: nombre.trim(), precio: Number(precio), stock: Number(stock) || 0, descuento_corte: descuento ? Number(descuento) : null, dias_validez: Number(diasValidez) || 30 })
      if (data) setProductos(productos.map(p => p.id === editId ? data[0] : p).concat(editId ? [] : data))
      setNombre(''); setPrecio(''); setStock(''); setDescuento(''); setDiasValidez('30'); setEditId(null)
    } catch (e) { alert('Error al guardar producto') }
  }

  const toggleDescuento = async (p: ProductoDB) => {
    if (!p.id) return
    try {
      await actualizarProducto(p.id, { descuento_activo: !(p.descuento_activo !== false) })
      setProductos(productos.map(x => x.id === p.id ? { ...x, descuento_activo: !(x.descuento_activo !== false) } : x))
    } catch (e) { alert('Error') }
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
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/admin/ventas" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>Ventas</a>
            <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
          </div>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ flex: '1 1 120px', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)}
              style={{ width: 100, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)}
              style={{ width: 70, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="% Dto." value={descuento} onChange={e => setDescuento(e.target.value)}
              style={{ width: 90, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <input type="number" placeholder="Días validez" value={diasValidez} onChange={e => setDiasValidez(e.target.value)}
              style={{ width: 70, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
            <button onClick={guardar}
              style={{ padding: '10px 16px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              {editId ? 'Actualizar' : 'Agregar'}
            </button>
            {editId && <button onClick={() => { setEditId(null); setNombre(''); setPrecio(''); setStock(''); setDescuento(''); setDiasValidez('30') }}
              style={{ padding: '10px 12px', background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>X</button>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {productos.map(p => (
            <div key={p.id} style={{ background: '#2B2B2B', borderRadius: 8, padding: 14, border: '1px solid #3a3a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}><span style={{ color: '#888', fontWeight: 400 }}>#{p.codigo || '--'} </span>{p.nombre}</p>
                <p style={{ color: '#888', fontSize: 13 }}>
                  Gs. {p.precio.toLocaleString('es-AR')} · Stock: <span style={{ color: p.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 700 }}>{p.stock}</span>
                  <button onClick={() => setAddStock({ id: p.id!, qty: '' })} style={{ marginLeft: 6, padding: '1px 7px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>+</button>
                  {addStock?.id === p.id && (
                    <span style={{ marginLeft: 6 }}>
                      <input type="number" value={addStock!.qty} onChange={e => setAddStock({ ...addStock!, qty: e.target.value })} style={{ width: 50, padding: '2px 4px', border: '1px solid #3a3a3a', borderRadius: 3, background: '#1A1A1A', color: '#F2EFE9', fontSize: 12 }} placeholder="0" />
                      <button onClick={async () => {
                        const q = Number(addStock!.qty)
                        if (q > 0) { await actualizarProducto(p.id!, { stock: p.stock + q }); setProductos(productos.map(x => x.id === p.id ? { ...x, stock: p.stock + q } : x)) }
                        setAddStock(null)
                      }} style={{ marginLeft: 4, padding: '2px 8px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11 }}>OK</button>
                    </span>
                  )}
                  {p.descuento_corte && p.descuento_activo !== false && <span style={{ color: '#D9A441', marginLeft: 8 }}>🎯 {p.descuento_corte}% OFF · {p.dias_validez || 30} días</span>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {p.descuento_corte && (
                  <button onClick={() => toggleDescuento(p)}
                    style={{ padding: '6px 10px', background: p.descuento_activo !== false ? '#27ae60' : '#555', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                    {p.descuento_activo !== false ? 'Dto. ON' : 'Dto. OFF'}
                  </button>
                )}
                <button onClick={() => { setEditId(p.id ?? null); setNombre(p.nombre); setPrecio(String(p.precio)); setStock(String(p.stock)); setDescuento(String(p.descuento_corte || '')); setDiasValidez(String(p.dias_validez || 30)) }}
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
