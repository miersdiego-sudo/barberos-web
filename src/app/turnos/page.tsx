'use client'

import { useEffect, useState } from 'react'
import { getTurnos, getPromos, getBarberos, crearTurno, serviciosDisponibles } from '@/lib/supabaseClient'

const limpieza = 10

function formatearPrecio(n: number) {
  return 'Gs. ' + n.toLocaleString('es-AR')
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

function generarSlots(fecha: string, servicio: { duracion: number }, turnos: Turno[], barbero: string) {
  const manianaInicio = aMinutos('09:00')
  const manianaFin = aMinutos('13:00')
  const tardeInicio = aMinutos('14:00')
  const tardeFin = aMinutos('19:00')

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
  const [servicio, setServicio] = useState<typeof serviciosDisponibles[number] | null>(null)
  const [fecha, setFecha] = useState('')
  const [horario, setHorario] = useState('')
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [confirmado, setConfirmado] = useState(false)
  const [promos, setPromos] = useState<{ nombre: string; porcentaje: number; inicio: string; fin: string; servicio?: string | null }[]>([])
  const [barberos, setBarberos] = useState<string[]>([])

  useEffect(() => {
    getTurnos().then(setTurnos).catch(console.error)
    getPromos().then(setPromos).catch(console.error)
    getBarberos().then(b => setBarberos(b.map(x => x.nombre))).catch(console.error)
  }, [])

  const promoActiva = fecha
    ? promos.find(p => fecha >= p.inicio && fecha <= p.fin && (!p.servicio || p.servicio === servicio?.nombre))
    : null

  const slotsDisponibles = fecha && servicio
    ? generarSlots(fecha, servicio, turnos, barbero)
    : []

  const precioFinal = servicio && promoActiva
    ? Math.round(servicio.precio * (1 - promoActiva.porcentaje / 100))
    : servicio?.precio ?? 0

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
    }
    try {
      await crearTurno(nuevo)
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
    setConfirmado(false)
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
          <p style={{ color: '#aaa', marginBottom: 24 }}>Te esperamos en Barbería DI LOPEZ</p>
          <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Barbero:</strong> {barbero}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Servicio:</strong> {servicio?.nombre}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Fecha:</strong> {fecha}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Horario:</strong> {horario} — {aHora(aMinutos(horario) + servicio!.duracion)}</p>
            <p style={{ marginBottom: 6 }}><strong style={{ color: '#C8862B' }}>Precio:</strong> {formatearPrecio(precioFinal)}</p>
            {promoActiva && <p style={{ color: '#D9A441', fontSize: 13 }}>{promoActiva.porcentaje}% OFF ({promoActiva.nombre}) aplicado ✅</p>}
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

        <h1 style={{ textAlign: 'center', fontSize: 22, marginBottom: 32 }}>Reservá tu turno</h1>

        {paso === 1 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Elegí tu barbero</h2>
            {barberos.map(b => (
              <button key={b} onClick={() => { setBarbero(b); setPaso(2) }}
                style={barbero === b ? btnSel : btnBase}>{b}
              </button>
            ))}
          </>
        )}

        {paso === 2 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#ccc' }}>Elegí el servicio</h2>
            {serviciosDisponibles.map(s => {
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
            })}
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
              <p style={{ color: '#D9A441', fontSize: 13, marginBottom: 12 }}>🎉 {promoActiva.nombre} — {promoActiva.porcentaje}% OFF</p>
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
                      {promoActiva && <span style={{ color: '#D9A441', fontSize: 13, marginLeft: 8 }}>({promoActiva.porcentaje}% OFF)</span>}
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
              {promoActiva && <p style={{ color: '#D9A441', fontSize: 13 }}>{promoActiva.porcentaje}% OFF ({promoActiva.nombre}) ✅</p>}
            </div>
            <input type="text" placeholder="Nombre y Apellido" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
            <input type="text" placeholder="Nro. de Cédula" value={cedula} onChange={e => setCedula(e.target.value)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
            <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
              Tu cédula se usa para promociones, sorteos de vales y cortes de pelo.
            </p>
            <input type="tel" placeholder="WhatsApp" value={telefono} onChange={e => setTelefono(e.target.value)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 20, border: '1px solid #3a3a3a', borderRadius: 6, fontSize: 16, background: '#2B2B2B', color: '#F2EFE9' }} />
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
              {promoActiva && <p style={{ color: '#D9A441', fontSize: 13 }}>{promoActiva.porcentaje}% OFF ({promoActiva.nombre}) ✅</p>}
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Cliente:</strong> {nombre}</p>
              <p style={{ marginBottom: 4 }}><strong style={{ color: '#C8862B' }}>Cédula:</strong> {cedula}</p>
              <p><strong style={{ color: '#C8862B' }}>WhatsApp:</strong> {telefono}</p>
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
      </div>
      </div>
    </div>
  )
}
