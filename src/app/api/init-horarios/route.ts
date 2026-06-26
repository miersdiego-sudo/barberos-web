import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { local_id } = await req.json()
  if (!local_id) {
    return NextResponse.json({ error: 'Falta local_id' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Eliminar horarios huérfanos
  await supabaseAdmin.from('horarios').delete().is('local_id', null)

  // Obtener horarios existentes para este local
  const { data: existentes } = await supabaseAdmin.from('horarios').select('*').eq('local_id', local_id)
  const exists = (existentes || []).map(h => h.dia_semana)

  const crear = []
  for (let d = 0; d < 7; d++) {
    if (exists.includes(d)) continue
    crear.push({
      dia_semana: d,
      activo: d === 0 ? false : true,
      inicio_manana: '08:00',
      fin_manana: '12:00',
      inicio_tarde: '15:00',
      fin_tarde: '20:00',
      local_id,
    })
  }

  if (crear.length > 0) {
    const { error } = await supabaseAdmin.from('horarios').insert(crear)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Devolver todos los horarios
  const { data: todos } = await supabaseAdmin.from('horarios').select('*').eq('local_id', local_id).order('dia_semana')
  return NextResponse.json({ horarios: todos || [] })
}