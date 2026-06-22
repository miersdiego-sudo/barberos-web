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
  cedula: string
  telefono: string
  precio: number
  estado?: string
  created_at?: string
}

export type PromoDB = {
  id?: number
  nombre: string
  porcentaje: number
  inicio: string
  fin: string
  servicio?: string | null
  created_at?: string
}

export type BarberoDB = {
  id?: number
  nombre: string
  foto?: string | null
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

export async function actualizarTurno(id: number, cambios: Partial<TurnoDB>) {
  const { data, error } = await supabase.from('turnos').update(cambios).eq('id', id).select()
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

export async function getBarberos() {
  const { data, error } = await supabase.from('barberos').select('*').order('nombre')
  if (error) throw error
  return data as BarberoDB[]
}

export async function crearBarbero(nombre: string) {
  const { data, error } = await supabase.from('barberos').insert({ nombre }).select()
  if (error) throw error
  return data as BarberoDB[]
}

export async function eliminarBarbero(id: number) {
  const { error } = await supabase.from('barberos').delete().eq('id', id)
  if (error) throw error
}

export async function actualizarBarbero(id: number, cambios: Partial<BarberoDB>) {
  const { data, error } = await supabase.from('barberos').update(cambios).eq('id', id).select()
  if (error) throw error
  return data as BarberoDB[]
}

export const serviciosDisponibles = [
  { nombre: 'Corte de Pelo', duracion: 30, precio: 40000 },
  { nombre: 'Barba', duracion: 20, precio: 20000 },
  { nombre: 'Corte de Pelo + Barba', duracion: 50, precio: 60000 },
  { nombre: 'Corte de Pelo + Cejas', duracion: 40, precio: 50000 },
  { nombre: 'Corte de Pelo + Barba + Cejas', duracion: 60, precio: 70000 },
]
