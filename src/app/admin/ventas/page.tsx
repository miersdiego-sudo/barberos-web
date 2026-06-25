'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserInfo, logout } from '@/lib/auth'
import { getProductos, actualizarProducto, crearCredito, getTurnos, getVentas, crearVenta, type ProductoDB, type VentaDB } from '@/lib/supabaseClient'

export default function VentasPage() {
  const [productos, setProductos] = useState<ProductoDB[]>([])
  const [turnos, setTurnos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cliente, setCliente] = useState<{ nombre: string; cedula: string } | null>(null)
  const [nuevoCliente, setNuevoCliente] = useState(false)
  const [cliNombre, setCliNombre] = useState('')
  const [cliCedula, setCliCedula] = useState('')
  const [prodSel, setProdSel] = useState<ProductoDB | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [cantInput, setCantInput] = useState('1')
  const [mensaje, setMensaje] = useState('')
  const [localId, setLocalId] = useState<number | null>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [ventas, setVentas] = useState<VentaDB[]>([])
  const [verHistorial, setVerHistorial] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getUserInfo().then(info => {
      if (!info) { router.push('/login'); return }
      setLocalId(info.local_id)
      setEsAdmin(info.is_super_admin)
    })
  }, [])

  useEffect(() => {
    if (localId !== null) {
      getProductos(localId ?? undefined).then(setProductos).catch(console.error)
      getTurnos(localId ?? undefined).then(setTurnos).catch(console.error)
      getVentas(localId ?? undefined).then(setVentas).catch(console.error)
    }
  }, [localId])

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
      await crearVenta({
        producto_id: prodSel.id!, producto_nombre: prodSel.nombre,
        cliente_nombre: cliente.nombre, cliente_cedula: cliente.cedula,
        cantidad, precio_unitario: prodSel.venta, total: prodSel.venta * cantidad,
        local_id: localId ?? undefined,
      })
      if (prodSel.descuento_corte && prodSel.descuento_activo !== false) {
        const venc = new Date()
        venc.setDate(venc.getDate() + (prodSel.dias_validez || 30))
        const credito: any = { cedula: cliente.cedula, nombre: cliente.nombre, descuento: prodSel.descuento_corte, vencimiento: venc.toISOString().split('T')[0], usado: false }
        if (localId) credito.local_id = localId
        await crearCredito(credito)
      }
      setMensaje(`✅ Venta registrada. ${prodSel.descuento_corte && prodSel.descuento_activo !== false ? `${prodSel.descuento_corte}% OFF asignado a ${cliente.nombre}.` : ''}`)
      setCliente(null); setProdSel(null); setCantidad(1); setCantInput('1'); setBusqueda(''); setNuevoCliente(false); setCliNombre(''); setCliCedula('')
      getProductos(localId ?? undefined).then(setProductos)
    } catch (e: any) { console.error(e); setMensaje(`❌ Error: ${e.message || e}`) }
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
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
              {esAdmin && <a href="/admin/locales" style={{ color: '#e74c3c', textDecoration: 'none', fontSize: 14 }}>Locales</a>}
              <button onClick={async () => { await logout(); router.push('/login') }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Salir</button>
            </div>
          </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, border: '1px solid #3a3a3a', marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#888' }}>Cliente</label>
          <input type="text" placeholder="Buscar por nombre o cédula..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, marginBottom: 8 }} />
          {busqueda && filtrados.length > 0 && !cliente && !nuevoCliente && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {filtrados.map(c => (
                <button key={c.cedula} onClick={() => { setCliente(c); setBusqueda(''); setNuevoCliente(false) }}
                  style={{ padding: '8px 12px', background: '#1A1A1A', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', color: '#F2EFE9', fontSize: 13, textAlign: 'left' }}>
                  {c.nombre} — C.I. {c.cedula}
                </button>
              ))}
            </div>
          )}
          {!cliente && !nuevoCliente && (
            <button onClick={() => setNuevoCliente(true)} style={{ padding: '8px 12px', background: 'transparent', color: '#C8862B', border: '1px dashed #C8862B', borderRadius: 4, cursor: 'pointer', fontSize: 13, width: '100%' }}>
              + Cliente nuevo
            </button>
          )}
          {nuevoCliente && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="text" placeholder="Nombre" value={cliNombre} onChange={e => setCliNombre(e.target.value)}
                style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
              <input type="text" placeholder="Cédula" value={cliCedula} onChange={e => setCliCedula(e.target.value)}
                style={{ padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
              <button onClick={() => { if (cliNombre.trim() && cliCedula.trim()) { setCliente({ nombre: cliNombre.trim(), cedula: cliCedula.trim() }); setNuevoCliente(false) } }}
                style={{ padding: '8px 12px', background: '#C8862B', color: '#1A1A1A', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Agregar</button>
            </div>
          )}
          {cliente && (
            <div style={{ padding: '8px 12px', background: '#1A1A1A', borderRadius: 4, border: '1px solid #C8862B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13 }}>✅ <strong>{cliente.nombre}</strong> — {cliente.cedula}</span>
              <button onClick={() => { setCliente(null); setNuevoCliente(false) }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 14 }}>X</button>
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
                <span>Gs. {p.venta.toLocaleString('es-AR')} · Costo: Gs. {p.costo.toLocaleString('es-AR')} · Stock: {p.stock}{p.descuento_corte && p.descuento_activo !== false ? ` · 🎯${p.descuento_corte}% OFF` : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {cliente && prodSel && (
          <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 16, border: '1px solid #3a3a3a', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}><strong>{prodSel.nombre}</strong> — Gs. {prodSel.venta.toLocaleString('es-AR')}/u</span>
              <span style={{ fontSize: 13, color: '#888' }}>Stock: {prodSel.stock}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#888' }}>Cantidad:</label>
              <input type="number" min={1} max={prodSel.stock} value={cantInput} onChange={e => {
                const raw = e.target.value
                setCantInput(raw)
                const num = Number(raw)
                if (raw !== '' && num >= 1 && num <= prodSel.stock) setCantidad(num)
              }}
                style={{ width: 60, padding: 8, border: '1px solid #3a3a3a', borderRadius: 4, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14, textAlign: 'center' }} />
              <span style={{ fontSize: 14, color: '#C8862B', fontWeight: 700 }}>= Gs. {(prodSel.venta * cantidad).toLocaleString('es-AR')}</span>
            </div>
            <button onClick={registrar}
              style={{ width: '100%', padding: '12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
              Registrar venta
            </button>
          </div>
        )}

        <button onClick={() => setVerHistorial(!verHistorial)}
          style={{ width: '100%', padding: 10, background: verHistorial ? '#C8862B' : 'transparent', color: verHistorial ? '#1A1A1A' : '#888', border: '1px solid #3a3a3a', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginTop: 16, marginBottom: 8 }}>
          📋 Historial de ventas ({ventas.length})
        </button>

        {verHistorial && (
          <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 16, border: '1px solid #3a3a3a', marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>
            {ventas.length === 0 ? <p style={{ color: '#888', fontSize: 13 }}>Sin ventas registradas</p> : ventas.map(v => (
              <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #2a2a2a', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{v.producto_nombre}</strong> x{v.cantidad} · <span style={{ color: '#888' }}>{v.cliente_nombre}</span>
                </div>
                <div style={{ color: '#C8862B', fontWeight: 700 }}>Gs. {(v.total || 0).toLocaleString('es-AR')}</div>
              </div>
            ))}
          </div>
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
