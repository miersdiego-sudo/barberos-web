'use client'

import { useEffect, useState } from 'react'
import { getProductos, actualizarProducto, crearCredito, getTurnos, type ProductoDB } from '@/lib/supabaseClient'

export default function VentasPage() {
  const [productos, setProductos] = useState<ProductoDB[]>([])
  const [turnos, setTurnos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cliente, setCliente] = useState<{ nombre: string; cedula: string } | null>(null)
  const [prodSel, setProdSel] = useState<ProductoDB | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    getProductos().then(setProductos).catch(console.error)
    getTurnos().then(setTurnos).catch(console.error)
  }, [])

  const clientes = turnos.reduce((acc: any[], t: any) => {
    if (t.cedula && !acc.find(c => c.cedula === t.cedula)) acc.push({ nombre: t.nombre, cedula: t.cedula })
    return acc
  }, [] as { nombre: string; cedula: string }[])

  const filtrados = busqueda ? clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.cedula.includes(busqueda)) : []

  const registrar = async () => {
    if (!cliente || !prodSel) return
    try {
      const nuevoStock = prodSel.stock - cantidad
      if (nuevoStock < 0) { setMensaje('Stock insuficiente'); return }
      await actualizarProducto(prodSel.id!, { stock: nuevoStock })
      if (prodSel.descuento_corte && prodSel.descuento_activo !== false) {
        const venc = new Date()
        venc.setDate(venc.getDate() + (prodSel.dias_validez || 30))
        await crearCredito({ cedula: cliente.cedula, nombre: cliente.nombre, descuento: prodSel.descuento_corte, vencimiento: venc.toISOString().split('T')[0] })
      }
      setMensaje(`✅ Venta registrada. ${prodSel.descuento_corte && prodSel.descuento_activo !== false ? `${prodSel.descuento_corte}% OFF asignado a ${cliente.nombre}.` : ''}`)
      setCliente(null); setProdSel(null); setCantidad(1); setBusqueda('')
      getProductos().then(setProductos)
    } catch (e) { setMensaje('Error al registrar venta') }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Registrar venta</h1>
            <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
          </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#888' }}>Cliente</label>
          <input type="text" placeholder="Buscar por nombre o cédula..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, marginBottom: 8 }} />
          {busqueda && filtrados.length > 0 && !cliente && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {filtrados.map(c => (
                <button key={c.cedula} onClick={() => { setCliente(c); setBusqueda('') }}
                  style={{ padding: '8px 12px', background: '#1A1A1A', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', color: '#F2EFE9', fontSize: 13, textAlign: 'left' }}>
                  {c.nombre} — C.I. {c.cedula}
                </button>
              ))}
            </div>
          )}
          {cliente && (
            <div style={{ padding: '8px 12px', background: '#1A1A1A', borderRadius: 4, border: '1px solid #C8862B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13 }}>✅ <strong>{cliente.nombre}</strong> — {cliente.cedula}</span>
              <button onClick={() => setCliente(null)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 14 }}>X</button>
            </div>
          )}
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#888' }}>Producto</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {productos.filter(p => p.stock > 0).map(p => (
              <button key={p.id} onClick={() => setProdSel(p)}
                style={{ padding: '10px 14px', background: prodSel?.id === p.id ? '#C8862B' : '#1A1A1A', color: prodSel?.id === p.id ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{p.nombre}</strong></span>
                <span>Gs. {p.precio.toLocaleString('es-AR')} · Stock: {p.stock}{p.descuento_corte && p.descuento_activo !== false ? ` · 🎯${p.descuento_corte}% OFF` : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {cliente && prodSel && (
          <button onClick={registrar}
            style={{ width: '100%', padding: '14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
            Registrar venta — Gs. {(prodSel.precio * cantidad).toLocaleString('es-AR')}
          </button>
        )}

        {mensaje && (
          <div style={{ marginTop: 16, padding: 12, background: '#1A1A1A', borderRadius: 6, border: '1px solid #27ae60', fontSize: 13, color: '#27ae60' }}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  )
}
