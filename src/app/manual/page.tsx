'use client'

import { useRouter } from 'next/navigation'

export default function ManualPage() {
  const router = useRouter()
  const linkStyle = { color: '#C8862B', textDecoration: 'none', fontWeight: 600 }
  const lbl = { fontSize: 11, color: '#D9A441', display: 'block', marginBottom: 2, marginTop: 8 }
  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📖 Manual de uso</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 24, border: '1px solid #3a3a3a', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>1. Barberos 💇</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Acá administrás quiénes trabajan en tu local y attienden turnos.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Campo "Nombre"</span>
              Nombre completo del barbero. Se muestra al cliente al elegir con quién reservar.
              <span style={lbl}>Campo "Cédula" (opcional)</span>
              Número de documento del barbero, solo para registro interno.
              <span style={lbl}>Campo "Teléfono" (opcional)</span>
              Teléfono de contacto del barbero.
              <span style={lbl}>Campo "Foto" (opcional)</span>
              Subí una foto del barbero. Aparecerá en la pantalla de reserva para que el cliente lo reconozca.
              <span style={lbl}>Botón "Activo / Inactivo" (🟢 / 🔴)</span>
              Si inactivás un barbero, <strong>desaparece de la pantalla de reserva</strong> pero sus turnos pasados se conservan.
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>2. Servicios ✂️</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Cada servicio que ofrecés (corte de cabello, barba, corte + barba, etc.).
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Campo "Nombre"</span>
              Ej: "Corte moderno", "Barba completa", "Corte + Barba".
              <span style={lbl}>Campo "Duración (min)"</span>
              Cuántos minutos dura el servicio. El sistema usa esto para calcular los horarios disponibles. Ej: 30 para un corte.
              <span style={lbl}>Campo "Precio (Gs.)"</span>
              Precio en guaraníes. Se muestra en la reserva y en las estadísticas.
              <span style={lbl}>Código</span>
              Se genera automáticamente (01, 02, 03...). Solo para identificación interna.
              <span style={lbl}>Botón "Activo / Inactivo"</span>
              Si inactivás un servicio, <strong>no aparece</strong> en la pantalla de reserva.
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>3. Horarios 🕐</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Definí en qué horarios atiende tu local cada día de la semana.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Campo "Mañana — Desde / Hasta"</span>
              Horario de apertura de la mañana. Ej: "08:00" a "12:00". Dejá ambos vacíos si no abrís a la mañana.
              <span style={lbl}>Campo "Tarde — Desde / Hasta"</span>
              Horario de apertura de la tarde. Ej: "15:00" a "20:00". Dejá ambos vacíos si no abrís a la tarde.
              <span style={lbl}>Checkbox "Activo"</span>
              Desmarcá este día si el local <strong>cierra</strong> (ej: domingo).
              <span style={lbl}>Intervalo mínimo entre turnos</span>
              El sistema deja 10 minutos de limpieza entre cada turno automáticamente.
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>4. Promociones 🏷️</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Las promociones aplican <strong>descuentos porcentuales</strong> sobre el precio del servicio durante un período de tiempo.
              Cuando un cliente reserva y hay una promo activa para el servicio elegido, el descuento se aplica <strong>automáticamente</strong> en la pantalla de confirmación.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Campo "Nombre"</span>
              Un nombre para identificar la promo. Ej: "Martes de Barbería", "Promo Julio", "Lanzamiento".
              <span style={lbl}>Campo "% descuento"</span>
              El porcentaje a descontar. Ej: 20 = 20% OFF. Se descuenta del precio del servicio.
              <span style={lbl}>Campo "Desde" / "Hasta" (fechas)</span>
              Período de vigencia. La promo solo aplica si la fecha de la reserva cae dentro de este rango.
              Si "Desde" y "Hasta" son el mismo día, la promo es válida solo ese día.
              <span style={lbl}>Campo "Servicios" (lista múltiple)</span>
              Elegí a qué servicios aplica esta promo. Usá <strong>Ctrl+clic</strong> para seleccionar varios.
              Si no seleccionás ninguno, la promo aplica a <strong>todos los servicios</strong>.
            </div>
            <p style={{ color: '#D9A441', fontSize: 13, marginTop: 8 }}>
              💡 Ejemplo: creás una promo "Martes 20% OFF" con 20%, vigente los martes de junio, y seleccionás solo "Corte de cabello".
              Los clientes que reserven un corte un martes de junio verán el precio con 20% de descuento automáticamente.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>5. Productos 🧴 (inventario y descuentos)</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Administrá los productos que vendés en tu local. Cada producto puede tener <strong>stock</strong> y un <strong>descuento</strong>
              que se le regala al cliente para su próximo corte.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Campo "Nombre"</span>
              Nombre del producto. Ej: "Shampoo profesional 500ml", "Crema para peinar".
              <span style={lbl}>Campo "Costo"</span>
              Lo que te costó comprarlo. Se usa para calcular la ganancia automáticamente.
              <span style={lbl}>Campo "Venta"</span>
              El precio al que lo vendés al cliente. Al escribir este número, el sistema calcula y muestra:
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li><strong>Ganancia:</strong> Venta — Costo (en guaraníes y porcentaje)</li>
              </ul>
              <span style={lbl}>Campo "Stock"</span>
              Cuántas unidades tenés. Si llega a 0, en Ventas te va a avisar que no hay stock.
              <span style={lbl}>Campo "% Dto. corte"</span>
              <strong style={{ color: '#D9A441' }}>✅ Acá está el descuento para el cliente.</strong> Si ponés un número (ej: 20),
              cuando vendás este producto desde el módulo <a href="/admin/ventas" style={linkStyle}>Ventas</a>,
              el sistema va a <strong>crear automáticamente un crédito</strong> con ese % de descuento para el cliente.
              Ese crédito se aplicará solo en su próxima reserva.
              <span style={lbl}>Campo "Aplicar descuento a" (lista múltiple)</span>
              Elegí a qué servicios aplica ese crédito. Usá <strong>Ctrl+clic</strong> para seleccionar varios.
              Si no seleccionás ninguno, el crédito aplica a <strong>cualquier servicio</strong>.
              <span style={lbl}>Campo "Válido (días)"</span>
              Cuántos días tiene el cliente para usar el crédito antes de que venza. Ej: 30 días.
              <span style={lbl}>Botón "Dto. ON / OFF"</span>
              Desactivá temporalmente el descuento sin borrar el %. El descuento dejará de generarse al vender.
              <span style={lbl}>Botón "+" (al lado del stock)</span>
              Para aumentar el stock rápidamente sin editar todo el producto.
            </div>
            <p style={{ color: '#D9A441', fontSize: 13, marginTop: 8 }}>
              💡 Ejemplo: vendés un shampoo de Gs. 50.000 con 15% OFF para corte. Cuando registrás la venta,
              se descuenta 1 del stock y se crea un crédito de 15% para ese cliente.
              En su próxima reserva, si eligió un servicio que coincide, el descuento se aplica solo.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>6. Ventas 🛒</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Registrá la venta de un producto a un cliente. Este módulo está conectado con el inventario y los créditos.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Campo "Producto"</span>
              Seleccioná el producto del listado. Solo aparecen los que tienen stock disponible.
              <span style={lbl}>Campo "Cantidad"</span>
              Cuántas unidades vende. Se descuenta del stock.
              <span style={lbl}>Sección "Cliente"</span>
              Podés elegir entre:
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li><strong>De un turno:</strong> seleccionás un turno existente y se auto-completa la cédula y nombre del cliente.</li>
                <li><strong>Cliente nuevo:</strong> ingresás manualmente la cédula y nombre.</li>
              </ul>
              <span style={lbl}>Al hacer clic en "Registrar venta"</span>
              El sistema hace todo esto automáticamente:
              <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Resta la cantidad del stock del producto.</li>
                <li>Si el producto tiene "% Dto. corte", <strong>crea un crédito</strong> para el cliente con:</li>
                <ul style={{ margin: '2px 0 0 16px', padding: 0 }}>
                  <li>El % de descuento</li>
                  <li>Los servicios seleccionados (si tiene)</li>
                  <li>La fecha de vencimiento (según "Válido (días)")</li>
                  <li>Estado "no usado"</li>
                </ul>
                <li>Guarda la venta en el historial.</li>
              </ol>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>7. Créditos 🎯 (descuentos automáticos)</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Los créditos son descuentos personales que se generan <strong>automáticamente</strong> al vender un producto con "% Dto. corte".
              No hay que crearlos manualmente.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>¿Cómo se aplica un crédito?</span>
              Cuando un cliente ingresa su cédula en la pantalla de reserva (paso 4), el sistema busca si tiene créditos disponibles.
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Si encuentra uno que coincida con el servicio elegido, lo aplica <strong>automáticamente</strong> (sin que el cliente haga nada).</li>
                <li>Si el crédito no tiene servicios específicos, aplica a cualquier servicio.</li>
                <li>Si el crédito tiene servicios asignados, solo aplica si el servicio reservado coincide.</li>
              </ul>
              <span style={lbl}>Vencimiento</span>
              Cada crédito tiene una fecha de vencimiento. Si el cliente no reserva antes de esa fecha, el crédito expira y no se aplica.
              <span style={lbl}>Un solo uso</span>
              Una vez que el crédito se usa en una reserva, queda marcado como "usado" y no se puede reutilizar.
            </div>
            <p style={{ color: '#D9A441', fontSize: 13, marginTop: 8 }}>
              💡 Ejemplo: vendés un producto con 10% OFF para "Corte de cabello". Se crea un crédito de 10% para ese cliente.
              Cuando el cliente reserva un corte, el sistema descuenta el 10% automáticamente. No tiene que presentar nada.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>8. Cómo reserva un cliente 📅</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Compartí el <strong>enlace de reserva</strong> desde el Panel principal (botón "🔗 Compartir enlace de reserva").
              El cliente solo necesita el enlace — no necesita registrarse ni tener cuenta.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Paso 1 — Elige barbero</span>
              Ve la foto y nombre de cada barbero activo y selecciona uno.
              <span style={lbl}>Paso 2 — Elige servicio</span>
              Se muestran los servicios activos con su precio y duración. También se muestran las promociones vigentes del día.
              <span style={lbl}>Paso 3 — Fecha y horario</span>
              Selecciona un día disponible. El sistema muestra solo los horarios libres según la duración del servicio y los turnos ya ocupados.
              <span style={lbl}>Paso 4 — Datos personales</span>
              <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Ingresa su <strong>cédula</strong> — si ya reservó antes, el sistema auto-completa nombre y teléfono.</li>
                <li>Si tiene un <strong>crédito</strong> disponible, se aplica automáticamente.</li>
                <li>Si hay una <strong>promoción</strong> activa, se muestra el descuento.</li>
                <li>Ingresa observaciones si quiere (opcional).</li>
                <li>Confirma la reserva.</li>
              </ol>
              <span style={lbl}>Confirmación</span>
              Ve un resumen con todos los datos: barbero, servicio, fecha, horario, precio final (con descuentos aplicados), y sus datos.
              Puede reservar otro turno si quiere.
              <span style={lbl}>Cancelar un turno</span>
              Al final de la página de reserva hay un enlace "¿Cancelar un turno?".
              Ingresa su cédula, ve sus turnos pendientes y puede cancelar el que quiera.
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>9. Panel de reservas (dashboard) 📋</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              El panel principal muestra todos los turnos del mes organizados por día. Es el centro de operaciones diarias.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Filtros (barbero / servicio)</span>
              Filtran los turnos visibles en el panel y también afectan las estadísticas del mes.
              <span style={lbl}>Badges de estado por fecha</span>
              Cada día muestra: ✅ Finalizados / ❌ Cancelados / ⏳ Pendientes. Hacé clic en uno para filtrar solo ese estado.
              <span style={lbl}>Cada turno muestra</span>
              Horario, barbero, servicio, nombre del cliente, precio y estado.
              <span style={lbl}>Cambiar estado</span>
              Hacé clic en el badge del turno para cambiarlo entre Finalizado / Cancelado / Pendiente.
              <span style={lbl}>Cambiar barbero</span>
              Hacé clic en "Editar" para reasignar el barbero de un turno.
              <span style={lbl}>Navegar entre meses</span>
              Usá el selector de mes en la parte superior.
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>10. Estadísticas 📊</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Todas las métricas de tu negocio en un solo lugar.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 14, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>
              <span style={lbl}>Filtros (mes / barbero / servicio)</span>
              Seleccioná el mes, barbero o servicio para ver datos específicos. Todos los números y gráficos se actualizan según los filtros.
              <span style={lbl}>Barbero top / Servicio top</span>
              El barbero con más turnos y el servicio más vendido del período filtrado.
              <span style={lbl}>Clientes únicos</span>
              Cantidad de clientes distintos que reservaron en el período.
              <span style={lbl}>🏆 Clientes top</span>
              Los 10 clientes con más visitas (turnos) ordenados de mayor a menor.
              <span style={lbl}>⏰ Clientes inactivos</span>
              Clientes que no reservan hace más de X días (podés elegir 15, 30, 60 o 90 días). Útil para campañas de recuperación.
              <span style={lbl}>📈 Tendencia (gráfico)</span>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li><strong>Mensual:</strong> muestra todos los meses desde el primer turno registrado. Las barras con valor 0 no se dibujan.</li>
                <li><strong>Diario:</strong> muestra cada día del mes seleccionado en los filtros.</li>
                <li>Pasá de una vista a otra con el botón "📅 Ver diario / 📆 Ver mensual".</li>
              </ul>
              <span style={lbl}>Exportar Excel</span>
              Descargá los datos filtrados en formato Excel para analizarlos en tu computadora.
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>📈 Ejemplo — tendencia semanal típica</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Así se ve una semana normal en una barbería con 3 barberos. Este gráfico es ilustrativo (no usa datos reales).
              Los sábados son el día pico y los domingos se cierra.
            </p>
            <div style={{ background: '#1A1A1A', borderRadius: 6, padding: 20 }}>
              {(() => {
                const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                const turnos = [8, 10, 9, 12, 15, 22, 0]
                const recaudacion = [240, 300, 270, 360, 450, 660, 0]
                const max = Math.max(...recaudacion, 1)
                const w = 420, h = 200, pad = { top: 20, right: 20, bottom: 36, left: 52 }
                const gw = w - pad.left - pad.right, gh = h - pad.top - pad.bottom
                const barW = gw / dias.length * 0.6
                const gap = gw / dias.length * 0.4
                return (
                  <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w, height: 'auto' }}>
                    <line x1={pad.left} y1={pad.top} x2={pad.left} y2={h - pad.bottom} stroke="#3a3a3a" />
                    <line x1={pad.left} y1={h - pad.bottom} x2={w - pad.right} y2={h - pad.bottom} stroke="#3a3a3a" />
                    {dias.map((d, i) => {
                      const x = pad.left + i * (barW + gap) + gap / 2
                      const barH = (recaudacion[i] / max) * gh
                      const y = pad.top + gh - barH
                      return (
                        <g key={i}>
                          <line x1={pad.left + (i + 0.5) * (barW + gap)} y1={pad.top} x2={pad.left + (i + 0.5) * (barW + gap)} y2={h - pad.bottom} stroke="#2a2a2a" strokeDasharray="3,3" />
                          <rect x={x} y={y} width={barW} height={barH || 1} rx={3} fill={recaudacion[i] === 0 ? '#555' : '#C8862B'} />
                          {recaudacion[i] > 0 && <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#F2EFE9" fontSize={10} fontWeight={700}>{recaudacion[i].toLocaleString('es-AR')}</text>}
                          {recaudacion[i] > 0 && <text x={x + barW / 2} y={y - 18} textAnchor="middle" fill="#D9A441" fontSize={9}>{turnos[i]} turnos</text>}
                          <text x={x + barW / 2} y={h - pad.bottom + 16} textAnchor="middle" fill="#888" fontSize={11}>{d}</text>
                        </g>
                      )
                    })}
                    {[0, 0.25, 0.5, 0.75, 1].map(r => {
                      const y = pad.top + gh * (1 - r)
                      return <text key={r} x={pad.left - 6} y={y + 4} textAnchor="end" fill="#888" fontSize={9}>{'Gs. ' + Math.round(max * r).toLocaleString('es-AR')}</text>
                    })}
                  </svg>
                )
              })()}
              <p style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
                Ejemplo: recaudación diaria estimada (Gs.) y cantidad de turnos en una semana típica
              </p>
            </div>
          </section>

          <p style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
            ¿Alguna duda? Contactá al administrador del sistema.
          </p>

        </div>
      </div>
    </div>
  )
}
