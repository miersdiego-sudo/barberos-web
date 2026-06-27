'use client'

import { useRouter } from 'next/navigation'

export default function ManualPage() {
  const router = useRouter()
  const linkStyle = { color: '#C8862B', textDecoration: 'none', fontWeight: 600 }
  return (
    <div style={{
      minHeight: '100vh', backgroundImage: 'url(/bg.webp)', backgroundSize: 'cover',
      backgroundPosition: 'center', position: 'relative', color: '#F2EFE9',
      fontFamily: 'sans-serif', padding: '40px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📖 Manual de uso</h1>
          <a href="/dashboard" style={{ color: '#C8862B', textDecoration: 'none', fontSize: 14 }}>← Panel</a>
        </div>

        <div style={{ background: '#2B2B2B', borderRadius: 8, padding: 24, border: '1px solid #3a3a3a', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>1. Barberos</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Agregá los barberos de tu local. Cada barbero puede tener una foto (subila desde el formulario).
              Podés <strong>activar</strong> o <strong>inactivar</strong> barberos con el botón verde/rojo — los inactivos no aparecerán en la página de reserva.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>2. Servicios</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Creá los servicios que ofrecés (corte, barba, etc.). Cada servicio tiene:
              nombre, duración (minutos), precio y código auto-generado.
              Podés <strong>inactivar</strong> un servicio y dejará de mostrarse en la reserva.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>3. Horarios</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Configurá los horarios de atención para cada día de la semana.
              Podés definir horario de <strong>mañana</strong> y <strong>tarde</strong>, o desactivar el día completo.
              Los domingos vienen desactivados por defecto.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>4. Promociones</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Creá promociones con % de descuento, fecha de vigencia y servicios seleccionados (Ctrl+clic para varios).
              Si no seleccionás ningún servicio, la promo aplica a <strong>todos</strong> los servicios.
              Las promos vigentes se muestran automáticamente al cliente durante la reserva.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>5. Productos</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Administrá tu inventario: costo, precio de venta, stock y % de descuento para el próximo corte.
              Si activás un descuento, podés elegir a qué servicios aplica.
              Cuando vendés un producto desde <a href="/admin/ventas" style={linkStyle}>Ventas</a>, se descuenta del stock automáticamente
              y se genera un <strong>crédito</strong> con el % OFF para el cliente.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>6. Ventas</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Registrá ventas de productos a clientes. Seleccioná el producto, la cantidad y el cliente
              (desde un turno existente o como "Cliente nuevo"). Al guardar:
            </p>
            <ul style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, paddingLeft: 20 }}>
              <li>Se descuenta el stock del producto</li>
              <li>Se crea un <strong>crédito</strong> con el % de descuento (si el producto tiene)</li>
              <li>El crédito se aplicará automáticamente en la próxima reserva del cliente</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>7. Cómo reserva un cliente</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              Compartí el <strong>enlace de reserva</strong> desde el Panel (botón "🔗 Compartir enlace").
              El cliente:
            </p>
            <ol style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, paddingLeft: 20 }}>
              <li>Elige barbero</li>
              <li>Elige servicio</li>
              <li>Selecciona fecha y horario disponible</li>
              <li>Ingresa sus datos (cédula → se auto-completa si ya reservó antes)</li>
              <li>Si tiene un crédito disponible, se aplica automáticamente</li>
              <li>Confirma la reserva</li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>8. Panel de reservas</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              En el panel principal ves todos los turnos del mes. Podés:
            </p>
            <ul style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, paddingLeft: 20 }}>
              <li>Filtrar por barbero, servicio o estado (clic en los badges de la fecha)</li>
              <li>Cambiar el estado del turno (Finalizado / Cancelado / Pendiente)</li>
              <li>Reasignar el barbero de un turno</li>
              <li>Navegar entre meses</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: '#C8862B', marginBottom: 8 }}>9. Estadísticas</h2>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
              En <a href="/dashboard/estadisticas" style={linkStyle}>Estadísticas</a> ves:
            </p>
            <ul style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, paddingLeft: 20 }}>
              <li>Filtros por mes, barbero y servicio</li>
              <li>Barbero top y servicio top del mes</li>
              <li>Clientes únicos</li>
              <li>Clientes con más visitas y clientes inactivos</li>
              <li>Gráfico de tendencia mensual (todos los meses) o diario (del mes seleccionado)</li>
              <li>Exportar a Excel los datos filtrados</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
