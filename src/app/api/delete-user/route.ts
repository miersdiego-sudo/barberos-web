import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { local_id, user_id, email } = await req.json()
  if (!local_id) {
    return NextResponse.json({ error: 'Falta local_id' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Eliminar datos relacionados al local
  const tablas = ['turnos', 'barberos', 'servicios', 'productos', 'promociones', 'horarios', 'ventas']
  for (const t of tablas) {
    const { error } = await supabaseAdmin.from(t).delete().eq('local_id', local_id)
    if (error) console.error(`Error deleting ${t}:`, error)
  }

  // Eliminar el local
  const { error: errLocal } = await supabaseAdmin.from('locales').delete().eq('id', local_id)
  if (errLocal) return NextResponse.json({ error: errLocal.message }, { status: 500 })

  // Cambiar el email del usuario a uno ficticio para liberar el original
  if (user_id) {
    const dummyEmail = `deleted-${Date.now()}@deleted.local`
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      email: dummyEmail,
      user_metadata: { deleted_email: email },
    })
    if (error) {
      // Si no puede cambiar el email, intentar soft-delete
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user_id, true)
      if (delErr) console.error('No se pudo desactivar el usuario:', delErr)
    }
  }

  return NextResponse.json({ ok: true })
}