import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, localId } = await req.json()
  if (!email || !localId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users.find(u => u.email === email)
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const { error } = await supabaseAdmin.from('locales').update({ user_id: user.id }).eq('id', localId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
