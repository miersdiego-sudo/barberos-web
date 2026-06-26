import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { user_id, new_email } = await req.json()
  if (!user_id || !new_email) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Cambiar email en Auth
  const { error: errAuth } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    email: new_email,
  })
  if (errAuth) return NextResponse.json({ error: errAuth.message }, { status: 500 })

  // Actualizar también en la tabla locales
  const { error: errLocal } = await supabaseAdmin.from('locales').update({ email: new_email }).eq('user_id', user_id)
  if (errLocal) console.error('Error al actualizar email en locales:', errLocal)

  return NextResponse.json({ ok: true })
}