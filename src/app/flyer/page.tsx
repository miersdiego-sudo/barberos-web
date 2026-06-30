'use client'

export default function FlyerPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#1A1A1A', color: '#F2EFE9',
      fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40,
    }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: 0, color: '#C8862B' }}>Barberos</h1>
          <p style={{ fontSize: 18, color: '#888', marginTop: 8 }}>Sistema de gestión y reservas para tu barbería</p>
        </div>

        <div style={{
          background: '#2B2B2B', borderRadius: 16, padding: 40, border: '1px solid #3a3a3a', marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 22, marginTop: 0, color: '#C8862B' }}>Tu barbería en un solo lugar</h2>
          <p style={{ color: '#aaa', lineHeight: 1.7, fontSize: 15 }}>
            Ofrecé a tus clientes la comodidad de reservar online desde cualquier dispositivo.
            Administrá turnos, barberos, servicios, productos, promociones y ventas
            desde un panel simple y moderno.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            { emoji: '📅', title: 'Reservas online', desc: 'Tus clientes reservan desde su celular sin llamar. Enlace personalizado para cada barbería.' },
            { emoji: '💇', title: 'Barberos', desc: 'Activá o desactivá barberos. Controlá horarios y asignación de turnos.' },
            { emoji: '✂️', title: 'Servicios', desc: 'Cortes, tintes, afeitado. Duración, precio y código propio. Activá/inactivá al toque.' },
            { emoji: '🕐', title: 'Horarios', desc: 'Configurá horarios de mañana y tarde para cada día de la semana.' },
            { emoji: '🏷️', title: 'Promociones', desc: 'Creá descuentos por porcentaje y fecha. Seleccioná servicios con Ctrl+clic.' },
            { emoji: '🧴', title: 'Productos', desc: 'Control de stock, precio de costo y venta, ganancia automática, descuento por servicios.' },
            { emoji: '🛒', title: 'Ventas', desc: 'Registrá ventas con o sin turno, descontá stock automático, generá créditos.' },
            { emoji: '💰', title: 'Créditos', desc: 'Descuentos automáticos para clientes frecuentes según servicios comprados.' },
            { emoji: '📊', title: 'Estadísticas', desc: 'Ventas por barbero, servicio, clientes top, inactivos. Exportá a Excel.' },
            { emoji: '📱', title: 'Multi-tenant', desc: 'Cada barbería con su propio enlace y datos. Un solo sistema, muchas barberías.' },
          ].map(f => (
            <div key={f.title} style={{
              background: '#2B2B2B', borderRadius: 12, padding: 20, border: '1px solid #3a3a3a',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.emoji}</div>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#C8862B' }}>{f.title}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: '#2B2B2B', borderRadius: 16, padding: 32, border: '1px solid #3a3a3a', marginBottom: 32, textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 20, color: '#C8862B', marginTop: 0 }}>¿Cómo empezar?</h2>
          <ol style={{ textAlign: 'left', color: '#aaa', lineHeight: 2.2, fontSize: 15, paddingLeft: 20 }}>
            <li><strong style={{ color: '#F2EFE9' }}>Registrate</strong> en la web con tu email y el nombre de tu barbería</li>
            <li><strong style={{ color: '#F2EFE9' }}>Recibí la aprobación</strong> del administrador</li>
            <li><strong style={{ color: '#F2EFE9' }}>Configurá</strong> servicios, barberos y horarios</li>
            <li><strong style={{ color: '#F2EFE9' }}>Compartí el enlace</strong> de reserva con tus clientes</li>
          </ol>
        </div>

        <div style={{
          background: '#C8862B', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 32,
        }}>
          <p style={{ color: '#1A1A1A', fontSize: 18, fontWeight: 700, margin: 0 }}>
            ¿Listo para digitalizar tu barbería?
          </p>
          <p style={{ color: '#1A1A1A', fontSize: 14, margin: '8px 0 0', opacity: 0.8 }}>
            Ingresá a <strong style={{ textDecoration: 'underline' }}>{typeof window !== 'undefined' ? window.location.origin : 'barberos-web'}</strong> y creá tu cuenta gratis
          </p>
        </div>

        <div style={{
          background: '#2B2B2B', borderRadius: 16, padding: 24, border: '1px solid #3a3a3a',
        }}>
          <h2 style={{ fontSize: 18, color: '#C8862B', marginTop: 0, textAlign: 'center' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { q: '¿Necesito conocimientos técnicos?', a: 'No. La web es fácil de usar, configurás todo desde el panel.' },
              { q: '¿Puedo tener mi propio enlace?', a: 'Sí. Cada barbería tiene su enlace personalizado para reservas.' },
              { q: '¿Mis clientes necesitan una app?', a: 'No. Reservan desde el navegador del celular.' },
              { q: '¿Cómo pago?', a: 'El sistema registra los pagos mensuales. El administrador se encarga de la facturación.' },
            ].map(faq => (
              <div key={faq.q}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: '#F2EFE9' }}>{faq.q}</p>
                <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#555', fontSize: 12, marginTop: 40 }}>
          Barberos © {new Date().getFullYear()} — Sistema de gestión para barberías
        </p>
      </div>
    </div>
  )
}
