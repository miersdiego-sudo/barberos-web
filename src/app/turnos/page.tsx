'use client'

import { useEffect, useState } from 'react'
import { getTurnos, getPromos, getBarberos, getServicios, getHorarios, crearTurno, actualizarTurno, getCreditos, usarCredito, getClienteByCedula, type ServicioDB, type HorarioDB, type CreditoDB } from '@/lib/supabaseClient'
import { config } from '@/lib/config'

const limpieza = 10

function formatearPrecio(n: number) {
  return 'Gs. ' + n.toLocaleString('es-AR')
}

function textoPromo(promo: { porcentaje: number; nombre: string }, parcial: number | null) {
  return `${promo.porcentaje}% OFF (${promo.nombre})${parcial ? ' · parcial' : ''}`
}

type Turno = {
  barbero: string
  fecha: string
  inicio: number
  fin: number
}

function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function aHora(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function generarSlots(fecha: string, servicio: { duracion: number }, turnos: Turno[], barbero: string, horarios: HorarioDB[]) {
  const dia = new Date(fecha + 'T12:00:00').getDay()
  const h = horarios.find(h => h.dia_semana === dia)
  if (!h || !h.activo) return []

  const manianaInicio = aMinutos(h.inicio_manana)
  const manianaFin = aMinutos(h.fin_manana)
  const tardeInicio = aMinutos(h.inicio_tarde)
  const tardeFin = aMinutos(h.fin_tarde)

  const ocupado = turnos.filter(t => t.barbero === barbero && t.fecha === fecha)

  function libre(inicio: number, duracion: number) {
    const fin = inicio + duracion + limpieza
    if (fin > manianaFin && inicio < tardeInicio) return false
    if (fin > tardeFin) return false
    for (const t of ocupado) {
      if (inicio < t.fin && fin > t.inicio) return false
    }
    return true
  }

  const slots: string[] = []
  for (let m = manianaInicio; m <= manianaFin - servicio.duracion - limpieza; m += 10) {
    if (libre(m, servicio.duracion)) slots.push(aHora(m))
  }
  for (let m = tardeInicio; m <= tardeFin - servicio.duracion - limpieza; m += 10) {
    if (libre(m, servicio.duracion)) slots.push(aHora(m))
  }
  return slots
}

export default function TurnosPage() {
  const [paso, setPaso] = useState(1)
  const [barbero, setBarbero] = useState('')
  const [servicio, setServicio] = useState<ServicioDB | null>(null)
  const [fecha, setFecha] = useState('')
  const [horario, setHorario] = useState('')
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [confirmado, setConfirmado] = useState(false)
  const [promos, setPromos] = useState<{ nombre: string; porcentaje: number; inicio: string; fin: string; servicio?: string | null }[]>([])
  const [barberos, setBarberos] = useState<{ nombre: string; foto?: string | null }[]>([])
  const [servicios, setServicios] = useState<ServicioDB[]>([])
  const [horarios, setHorarios] = useState<HorarioDB[]>([])
  const [cancelando, setCancelando] = useState(false)
  const [cedulaCancel, setCedulaCancel] = useState('')
  const [misTurnos, setMisTurnos] = useState<any[]>([])
  const [creditos, setCreditos] = useState<CreditoDB[]>([])
  const [creditoSel, setCreditoSel] = useState<CreditoDB | null>(null)
  const [clienteExistente, setClienteExistente] = useState(false)

  useEffect(() => {
    getTurnos().then(setTurnos).catch(console.error)
    getPromos().then(setPromos).catch(console.error)
    getBarberos().then(b => setBarberos(b.filter(x => x.activo !== false).map(x => ({ nombre: x.nombre, foto: x.foto })))).catch(console.error)
    getServicios().then(setServicios).catch(console.error)
    getHorarios().then(setHorarios).catch(console.error)
  }, [])

  const promoActiva = fecha
    ? promos.find(p => {
        if (!(fecha >= p.inicio && fecha <= p.fin)) return false
        if (!p.servicio) return true
        if (p.servicio === servicio?.nombre) return true
        if (servicio?.componentes && servicios.length > 0) {
          return servicios.some(s => servicio.componentes?.includes(s.id!) && s.nombre === p.servicio)
        }
        return false
      })
    : null

  const descuentoProporcional = (() => {
    if (!promoActiva || !promoActiva.servicio || !servicio || !servicio.componentes || servicios.length === 0) return null
    if (promoActiva.servicio === servicio.nombre) return null
    const comp = servicios.find(s => servicio.componentes?.includes(s.id!) && s.nombre === promoActiva.servicio)
    return comp ? comp.precio / servicio.precio : null
  })()

  const slotsDisponibles = fecha && servicio
    ? generarSlots(fecha, servicio, turnos, barbero, horarios)
    : []

  const creditosDisponibles = cedula && paso >= 4
    ? creditos.filter(c => {
        if (c.usado) return false
        if (c.cedula !== cedula.trim()) return false
        if (c.vencimiento && c.vencimiento < new Date().toISOString().split('T')[0]) return false
        return true
      })
    : []

  const precioFinal = (() => {
    let base = servicio?.precio ?? 0
    if (promoActiva) {
      if (descuentoProporcional) {
        base = Math.round(base - base * descuentoProporcional * promoActiva.porcentaje / 100)
      } else {
        base = Math.round(base * (1 - promoActiva.porcentaje / 100))
      }
    }
    if (creditoSel) base = Math.round(base * (1 - creditoSel.descuento / 100))
    return base
  })()

  const confirmar = async () => {
    const nuevo = {
      barbero,
      fecha,
      inicio: aMinutos(horario),
      fin: aMinutos(horario) + servicio!.duracion,
      servicio: servicio!.nombre,
      nombre,
      cedula,
      telefono,
      precio: precioFinal,
      observaciones: observaciones.trim() || null,
    }
    try {
      await crearTurno(nuevo)
      if (creditoSel?.id) await usarCredito(creditoSel.id)
      setTurnos([...turnos, nuevo])
      setConfirmado(true)
    } catch (e) {
      console.error(e)
      alert('Error al guardar el turno. Intentá de nuevo.')
    }
  }

  const reiniciar = () => {
    setPaso(1)
    setBarbero('')
    setServicio(null)
    setFecha('')
    setHorario('')
    setNombre('')
    setCedula('')
    setTelefono('')
    setObservaciones('')
    setCreditoSel(null)
    setCreditos([])
    setClienteExistente(false)
    setConfirmado(false)
  }

  const buscarMisTurnos = async () => {
    if (!cedulaCancel.trim()) return
    try {
      const todos = await getTurnos()
      setMisTurnos(todos.filter((t: any) => t.cedula === cedulaCancel.trim() && t.estado !== 'cancelado'))
    } catch (e) {
      alert('Error al buscar turnos')
    }
  }

  const cancelarTurno = async (id: number) => {
    try {
      await actualizarTurno(id, { estado: 'cancelado' })
      setCedulaCancel('')
      setMisTurnos([])
      alert('Turno cancelado')
    } catch (e) {
      alert('Error al cancelar turno')
    }
  }

  if (confirmado) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1A1A1A', color: '#F2EFE9',
        fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Turno confirmado</h1>
          <p style={{ color: '#aaa', marginBottom: 24 }}>Te esperamos en {config.nombre}</p>
          <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Barbero:</strong> {barbero}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Servicio:</strong> {servicio?.nombre}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Fecha:</strong> {fecha}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Horario:</strong> {horario} — {aHora(aMinutos(horario) + servicio!.duracion)}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Precio:</strong> {formatearPrecio(precioFinal)}</p>
            {promoActiva && <p style={{ color: '#D9A441', fontSize: 13 }}>{textoPromo(promoActiva, descuentoProporcional)} aplicado ✅</p>}
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Cliente:</strong> {nombre}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Cédula:</strong> {cedula}</p>
            <p><strong style={{ color: '#C8862B' }}>WhatsApp:</strong> {telefono}</p>
          </div>
          <button onClick={reiniciar} style={{
            padding: '12px 32px', background: '#C8862B', color: '#1A1A1A', border: 'none',
            borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16,
          }}>
            Reservar otro turno
          </button>
        </div>
      </div>
    )
  }

  const btnBase = {
    display: 'block' as const, width: '100%', padding: '14px 20px', margin: '8px 0',
    textAlign: 'left' as const, cursor: 'pointer', border: '1px solid #3a3a3a',
    borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9',
  }

  const btnSel = { ...btnBase, background: '#C8862B', color: '#1A1A1A', border: '1px solid #C8862B', fontWeight: 700 }

  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {[1, 2, 3, 4, 5].map(p => (
            <div key={p} style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, background: paso >= p ? '#C8862B' : '#333', color: paso >= p ? '#1A1A1A' : '#666',
            }}>{p}</div>
          ))}
        </div>
        {(() => {
          const hoy = new Date()
          const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
          const activas = promos.filter(p => hoyStr >= p.inicio && hoyStr <= p.fin)
          if (activas.length === 0) return null
          return (
            <div style={{ marginBottom: 20, padding: 12, background: 'rgba(217,164,65,0.1)', borderRadius: 8, border: '1px solid #D9A441', fontSize: 13 }}>
              {activas.map((p, i) => (
                <p key={i} style={{ color: '#D9A441', marginBottom: i < activas.length - 1 ? 4 : 0 }}>🎯 {p.nombre} — {p.porcentaje}% OFF · válido del {p.inicio} al {p.fin}</p>
              ))}
            </div>
          )
        })()}

        <h1 style={{ textAlign: 'center', fontSize: 22, marginBottom: 32 }}>Reservá tu turno</h1>

        {paso === 1 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Elegí tu barbero</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {barberos.map(b => (
                <button key={b.nombre} onClick={() => { setBarbero(b.nombre); setPaso(2) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0,
                    padding: 0, cursor: 'pointer', border: `2px solid ${barbero === b.nombre ? '#C8862B' : '#3a3a3a'}`,
                    borderRadius: 10, fontSize: 15, background: '#1E1E1E', color: '#F2EFE9', overflow: 'hidden',
                  }}>
                  {b.foto ? (
                    <img src={b.foto} alt={b.nombre} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#666' }}>
                      {b.nombre[0]}
                    </div>
                  )}
                  <span style={{
                    padding: '10px 0', textAlign: 'center', fontWeight: barbero === b.nombre ? 700 : 400,
                    background: barbero === b.nombre ? '#C8862B' : '#2B2B2B', color: barbero === b.nombre ? '#1A1A1A' : '#eee',
                    borderTop: `1px solid ${barbero === b.nombre ? '#C8862B' : '#3a3a3a'}`,
                  }}>{b.nombre}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Elegí el servicio</h2>
            {servicios.length === 0 ? <p style={{ color: '#666' }}>Cargando servicios...</p> : (
            servicios.map(s => {
              const selected = servicio?.nombre === s.nombre
              return (
                <button key={s.nombre} onClick={() => { setServicio(s); setPaso(3) }}
                  style={selected ? btnSel : btnBase}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{s.nombre}</span>
                    <span style={{ fontSize: 14, opacity: selected ? 0.8 : 0.5 }}>
                      {s.duracion} min · {formatearPrecio(s.precio)}
                    </span>
                  </div>
                </button>
              )
            }))}
            <button onClick={() => setPaso(1)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#C8862B', cursor: 'pointer', fontSize: 14 }}>← Volver</button>
          </>
        )}

        {paso === 3 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Elegí fecha y horario</h2>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#888' }}>Fecha</label>
            <input type="date" value={fecha} onChange={e => { setFecha(e.target.value); setHorario('') }}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
            {promoActiva && (
              <p style={{ color: '#D9A441', fontSize: 13, marginBottom: 12 }}>{textoPromo(promoActiva, descuentoProporcional)}</p>
            )}
            {fecha && (
              <>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#888' }}>Horario disponible</label>
                {slotsDisponibles.length === 0 ? (
                  <p style={{ color: '#666', fontSize: 14 }}>No hay horarios disponibles para esta fecha.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {slotsDisponibles.map(h => (
                      <button key={h} onClick={() => setHorario(h)}
                        style={{
                          padding: '10px 0', cursor: 'pointer', border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 13,
                          background: horario === h ? '#C8862B' : '#2B2B2B', color: horario === h ? '#1A1A1A' : '#F2EFE9',
                          textAlign: 'center',
                        }}>{h}</button>
                    ))}
                  </div>
                )}
                {horario && (
                  <div style={{ marginTop: 20, padding: 12, background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a' }}>
                    <p style={{ fontSize: 14, color: '#ccc' }}>
                      <strong style={{ color: '#C8862B' }}>Resumen:</strong> {servicio?.nombre} ({servicio?.duracion} min)
                    </p>
                    <p style={{ fontSize: 14, color: '#ccc' }}>{horario} → {aHora(aMinutos(horario) + servicio!.duracion)}</p>
                    <p style={{ fontSize: 16, color: '#F2EFE9', marginTop: 4 }}>
                      <strong>Total:</strong> {formatearPrecio(precioFinal)}
                      {promoActiva && <span style={{ color: '#D9A441', fontSize: 13, marginLeft: 8 }}>({textoPromo(promoActiva, descuentoProporcional)})</span>}
                    </p>
                  </div>
                )}
                {horario && (
                  <button onClick={() => setPaso(4)} style={{
                    marginTop: 20, padding: '12px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none',
                    borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, width: '100%',
                  }}>
                    Siguiente →
                  </button>
                )}
              </>
            )}
            <button onClick={() => setPaso(2)} style={{ display: 'block', marginTop: 16, background: 'none', border: 'none', color: '#C8862B', cursor: 'pointer', fontSize: 14 }}>← Volver</button>
          </>
        )}

        {paso === 4 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Tus datos</h2>
            <div style={{ marginBottom: 20, padding: 16, background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Barbero:</strong> {barbero}</p>
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Servicio:</strong> {servicio?.nombre} ({servicio?.duracion} min)</p>
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Fecha:</strong> {fecha}</p>
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Horario:</strong> {horario} — {aHora(aMinutos(horario) + servicio!.duracion)}</p>
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Precio:</strong> {formatearPrecio(precioFinal)}</p>
                {promoActiva && <p style={{ color: '#D9A441', fontSize: 13 }}>{textoPromo(promoActiva, descuentoProporcional)} ✅</p>}
              {creditoSel && <p style={{ color: '#D9A441', fontSize: 13 }}>🎯 {creditoSel.descuento}% OFF por compra de producto ✅</p>}
            </div>
            <input type="text" placeholder="Nombre y Apellido" value={nombre} onChange={e => setNombre(e.target.value)} readOnly={clienteExistente}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 4, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: clienteExistente ? '#1e1e1e' : '#2B2B2B', color: '#F2EFE9', cursor: clienteExistente ? 'not-allowed' : 'text' }} />
            {clienteExistente && <p style={{ color: '#888', fontSize: 11, marginBottom: 12, marginTop: 0 }}>Nombre cargado automáticamente. Solo se puede modificar el teléfono.</p>}
            <input type="text" placeholder="Nro. de Cédula" value={cedula} onChange={async e => {
              const v = e.target.value; setCedula(v); setCreditoSel(null); setClienteExistente(false)
              getCreditos().then(setCreditos).catch(() => {})
              if (v.trim().length >= 3) {
                try {
                  const c = await getClienteByCedula(v.trim())
                  if (c) { setNombre(c.nombre); setTelefono(c.telefono); setClienteExistente(true) }
                } catch {}
              }
            }}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
            <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
              Tu cédula se usa para promociones, sorteos de vales y cortes de pelo.
            </p>
            <input type="tel" placeholder="WhatsApp" value={telefono} onChange={e => setTelefono(e.target.value)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
            <input type="text" placeholder="Observaciones (opcional)" value={observaciones} onChange={e => setObservaciones(e.target.value)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
            {creditosDisponibles.length > 0 && (
              <div style={{ marginBottom: 20, padding: 14, background: '#1A1A1A', borderRadius: 6, border: '1px solid #D9A441' }}>
                <p style={{ fontSize: 13, color: '#D9A441', marginBottom: 8 }}>🎯 Tenés descuentos disponibles</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {creditosDisponibles.map(c => (
                    <button key={c.id} onClick={() => setCreditoSel(creditoSel?.id === c.id ? null : c)}
                      style={{ padding: '8px 12px', background: creditoSel?.id === c.id ? '#C8862B' : '#2B2B2B', color: creditoSel?.id === c.id ? '#1A1A1A' : '#F2EFE9', border: '1px solid #3a3a3a', borderRadius: 4, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>
                      {creditoSel?.id === c.id ? '✅ ' : ''}{c.descuento}% OFF en tu corte{c.vencimiento ? ` · vence ${c.vencimiento}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setPaso(5)} disabled={!nombre || !cedula || !telefono}
              style={{
                padding: '12px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none',
                borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, width: '100%',
                opacity: (!nombre || !cedula || !telefono) ? 0.5 : 1,
              }}>
              Revisar y confirmar
            </button>
            <button onClick={() => setPaso(3)} style={{ display: 'block', marginTop: 16, background: 'none', border: 'none', color: '#C8862B', cursor: 'pointer', fontSize: 14 }}>← Volver</button>
          </>
        )}

          {paso === 5 && (
            <>
              <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Confirmar turno</h2>
              <div style={{ marginBottom: 20, padding: 16, background: '#2B2B2B', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 14 }}>
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Barbero:</strong> {barbero}</p>
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Servicio:</strong> {servicio?.nombre} ({servicio?.duracion} min)</p>
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Fecha:</strong> {fecha}</p>
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Horario:</strong> {horario} — {aHora(aMinutos(horario) + servicio!.duracion)}</p>
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Precio:</strong> {formatearPrecio(precioFinal)}</p>
              {promoActiva && <p style={{ color: '#D9A441', fontSize: 13 }}>{textoPromo(promoActiva, descuentoProporcional)} ✅</p>}
                {creditoSel && <p style={{ color: '#D9A441', fontSize: 13 }}>🎯 {creditoSel.descuento}% OFF por compra de producto ✅</p>}
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Cliente:</strong> {nombre}</p>
                <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Cédula:</strong> {cedula}</p>
            <p><strong style={{ color: '#C8862B' }}>WhatsApp:</strong> {telefono}</p>
            {observaciones && <p style={{ marginTop: 6, color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>"{observaciones}"</p>}
              </div>
              <button onClick={confirmar}
                style={{
                  padding: '12px 24px', background: '#C8862B', color: '#1A1A1A', border: 'none',
                  borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, width: '100%',
                }}>
                Confirmar turno
              </button>
              <button onClick={() => setPaso(4)} style={{ display: 'block', marginTop: 16, background: 'none', border: 'none', color: '#C8862B', cursor: 'pointer', fontSize: 14 }}>← Volver</button>
            </>
          )}

          {!cancelando ? (
            <p style={{ textAlign: 'center', marginTop: 40 }}>
              <button onClick={() => setCancelando(true)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
                ¿Cancelar un turno?
              </button>
            </p>
          ) : (
            <div style={{ marginTop: 40, padding: 20, background: '#2B2B2B', borderRadius: 8, border: '1px solid #3a3a3a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, color: '#e74c3c', margin: 0 }}>Cancelar turno</h3>
                <button onClick={() => { setCancelando(false); setCedulaCancel(''); setMisTurnos([]) }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14 }}>X</button>
              </div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#888' }}>Ingresá tu número de cédula</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="Nro. de Cédula" value={cedulaCancel} onChange={e => setCedulaCancel(e.target.value)}
                  style={{ flex: 1, padding: 10, border: '1px solid #3a3a3a', borderRadius: 6, background: '#1A1A1A', color: '#F2EFE9', fontSize: 14 }} />
                <button onClick={buscarMisTurnos} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Buscar
                </button>
              </div>
              {misTurnos.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {misTurnos.map((t: any) => (
                    <div key={t.id} style={{ padding: 12, background: '#1A1A1A', borderRadius: 6, border: '1px solid #3a3a3a', fontSize: 13 }}>
                      <p><strong style={{ color: '#C8862B' }}>{t.servicio}</strong> · {t.barbero}</p>
                      <p style={{ color: '#aaa' }}>{t.fecha} — {aHora(t.inicio)} a {aHora(t.fin)}</p>
                      <button onClick={() => t.id && cancelarTurno(t.id)} style={{ marginTop: 8, padding: '6px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                        Cancelar este turno
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {misTurnos.length === 0 && cedulaCancel && (
                <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>No se encontraron turnos pendientes con esa cédula.</p>
              )}
            </div>
          )}
      </div>
      </div>
    </div>
  )
}
