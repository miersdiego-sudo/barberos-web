import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const turno = await req.json()
  if (!turno.local_id || !turno.barbero || !turno.fecha || turno.inicio == null) {
    return NextResponse.json({ error: 'Faltan datos del turno' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar si ya existe un turno en el mismo local, barbero, fecha y horario (no cancelado)
  const { data: existentes } = await supabaseAdmin
    .from('turnos')
    .select('id, inicio, fin')
    .eq('local_id', turno.local_id)
    .eq('barbero', turno.barbero)
    .eq('fecha', turno.fecha)
    .neq('estado', 'Cancelado')

  if (existentes) {
    for (const t of existentes) {
      // El turno nuevo (inicio, fin) se superpone con uno existente?
      if (turno.inicio < t.fin && turno.fin > t.inicio) {
        return NextResponse.json({ error: 'Ese horario ya está reservado para ese barbero' }, { status: 409 })
      }
    }
  }

  const { data, error } = await supabaseAdmin.from('turnos').insert(turno).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ turno: data?.[0] || null })
}