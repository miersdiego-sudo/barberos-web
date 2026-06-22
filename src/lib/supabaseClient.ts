import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type TurnoDB = {
  id?: number
  barbero: string
  servicio: string
  fecha: string
  inicio: number
  fin: number
  nombre: string
  telefono: string
  precio: number
  created_at?: string
}

export type PromoDB = {
  id?: number
  nombre: string
  porcentaje: number
  inicio: string
  fin: string
  created_at?: string
}

export async function getTurnos() {
  const { data, error } = await supabase.from('turnos').select('*').order('fecha', { ascending: true }).order('inicio', { ascending: true })
  if (error) throw error
  return data as TurnoDB[]
}

export async function crearTurno(t: TurnoDB) {
  const { data, error } = await supabase.from('turnos').insert(t).select()
  if (error) throw error
  return data as TurnoDB[]
}

export async function getPromos() {
  const { data, error } = await supabase.from('promociones').select('*').order('inicio', { ascending: false })
  if (error) throw error
  return data as PromoDB[]
}

export async function crearPromo(p: Omit<PromoDB, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('promociones').insert(p).select()
  if (error) throw error
  return data as PromoDB[]
}

export async function eliminarPromo(id: number) {
  const { error } = await supabase.from('promociones').delete().eq('id', id)
  if (error) throw error
}
