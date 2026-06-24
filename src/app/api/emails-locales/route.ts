import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: locales } = await supabaseAdmin.from('locales').select('id, user_id')
  if (!locales) return NextResponse.json({})

  const uids = locales.filter(l => l.user_id).map(l => l.user_id).filter(Boolean) as string[]
  if (uids.length === 0) return NextResponse.json({})

  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const map: Record<string, string> = {}
  for (const u of (users?.users || [])) {
    if (u.email) map[u.id] = u.email
  }

  const result: Record<number, string> = {}
  for (const l of locales) {
    if (l.user_id && map[l.user_id]) result[l.id] = map[l.user_id]
  }

  return NextResponse.json(result)
}
