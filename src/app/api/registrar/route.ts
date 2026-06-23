import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password, nombre_local } = await req.json()
  if (!email || !password || !nombre_local) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: user, error: errUser } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (errUser) return NextResponse.json({ error: errUser.message }, { status: 400 })

  const slug = nombre_local.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const { error: errLocal } = await supabaseAdmin.from('locales').insert({
    nombre: nombre_local.trim(),
    slug: slug || 'local-' + Date.now(),
    user_id: user.user.id,
    activo: false,
  })
  if (errLocal) return NextResponse.json({ error: errLocal.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
