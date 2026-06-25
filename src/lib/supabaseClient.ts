import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type LocalDB = {
  id: number
  nombre: string
  slug: string
  user_id?: string | null
  email?: string | null
  activo?: boolean
  created_at?: string
}

export type TurnoDB = {
  id?: number
  local_id?: number
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
  observaciones?: string | null
  created_at?: string
}

export type PromoDB = {
  id?: number
  local_id?: number
  nombre: string
  porcentaje: number
  inicio: string
  fin: string
  servicio?: string | null
  created_at?: string
}

export type BarberoDB = {
  id?: number
  local_id?: number
  nombre: string
  foto?: string | null
  cedula?: string | null
  telefono?: string | null
  activo?: boolean
  created_at?: string
}

export type ServicioDB = {
  id?: number
  local_id?: number
  codigo?: string | null
  nombre: string
  duracion: number
  precio: number
  componentes?: number[] | null
}

export type ProductoDB = {
  id?: number
  local_id?: number
  nombre: string
  costo: number
  venta: number
  stock: number
  codigo?: string | null
  dias_validez?: number | null
  descuento_corte?: number | null
  descuento_activo?: boolean
  created_at?: string
}

export type CreditoDB = {
  id?: number
  local_id?: number
  cedula: string
  nombre: string
  descuento: number
  usado: boolean
  vencimiento?: string | null
  created_at?: string
}

export type HorarioDB = {
  id?: number
  local_id?: number
  dia_semana: number
  activo: boolean
  inicio_manana: string
  fin_manana: string
  inicio_tarde: string
  fin_tarde: string
}

export async function getLocales() {
  const { data, error } = await supabase.from('locales').select('*').order('nombre')
  if (error) throw error
  return data as LocalDB[]
}

export async function getLocalBySlug(slug: string) {
  const { data, error } = await supabase.from('locales').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data as LocalDB | null
}

export async function getTurnos(local_id?: number) {
  let q = supabase.from('turnos').select('*').order('fecha', { ascending: true }).order('inicio', { ascending: true })
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
  if (error) throw error
  return data as TurnoDB[]
}

export async function getClienteByCedula(cedula: string, local_id?: number) {
  let q = supabase.from('turnos').select('nombre, telefono, cedula').eq('cedula', cedula).order('created_at', { ascending: false }).limit(1)
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q.maybeSingle()
  if (error) throw error
  return data as { nombre: string; telefono: string; cedula: string } | null
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

export async function getPromos(local_id?: number) {
  let q = supabase.from('promociones').select('*').order('inicio', { ascending: false })
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
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

export async function getBarberos(local_id?: number) {
  let q = supabase.from('barberos').select('*').order('nombre')
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
  if (error) throw error
  return data as BarberoDB[]
}

export async function crearBarbero(nombre: string, local_id?: number) {
  const { data, error } = await supabase.from('barberos').insert({ nombre, local_id } as any).select()
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

export async function getServicios(local_id?: number) {
  let q = supabase.from('servicios').select('*').order('nombre')
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
  if (error) throw error
  return data as ServicioDB[]
}

export async function crearServicio(s: Omit<ServicioDB, 'id' | 'codigo'>) {
  const { data: existentes } = await supabase.from('servicios').select('codigo').eq('local_id', s.local_id).order('codigo', { ascending: false }).limit(1)
  const ultimo = existentes?.[0]?.codigo ?? '00'
  const proxCodigo = String(Number(ultimo) + 1).padStart(2, '0')
  const { data, error } = await supabase.from('servicios').insert({ ...s, codigo: proxCodigo }).select()
  if (error) throw error
  return data as ServicioDB[]
}

export async function actualizarServicio(id: number, cambios: Partial<ServicioDB>) {
  const { data, error } = await supabase.from('servicios').update(cambios).eq('id', id).select()
  if (error) throw error
  return data as ServicioDB[]
}

export async function eliminarServicio(id: number) {
  const { error } = await supabase.from('servicios').delete().eq('id', id)
  if (error) throw error
}

export async function getProductos(local_id?: number) {
  let q = supabase.from('productos').select('*').order('nombre')
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
  if (error) throw error
  return data as ProductoDB[]
}

export async function crearProducto(p: Omit<ProductoDB, 'id' | 'created_at' | 'codigo'>) {
  const { data: existentes } = await supabase.from('productos').select('codigo').eq('local_id', p.local_id).order('codigo', { ascending: false }).limit(1)
  const ultimo = existentes?.[0]?.codigo ?? '00'
  const proxCodigo = String(Number(ultimo) + 1).padStart(2, '0')
  const { data, error } = await supabase.from('productos').insert({ ...p, codigo: proxCodigo }).select()
  if (error) throw error
  return data as ProductoDB[]
}

export async function actualizarProducto(id: number, cambios: Partial<ProductoDB>) {
  const { data, error } = await supabase.from('productos').update(cambios).eq('id', id).select()
  if (error) throw error
  return data as ProductoDB[]
}

export async function eliminarProducto(id: number) {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw error
}

export async function getCreditos(local_id?: number) {
  let q = supabase.from('creditos').select('*').order('created_at', { ascending: false })
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
  if (error) throw error
  return data as CreditoDB[]
}

export async function crearCredito(c: Omit<CreditoDB, 'id' | 'created_at' | 'usado'> & { vencimiento?: string | null }) {
  const { data, error } = await supabase.from('creditos').insert(c).select()
  if (error) throw error
  return data as CreditoDB[]
}

export async function usarCredito(id: number) {
  const { data, error } = await supabase.from('creditos').update({ usado: true }).eq('id', id).select()
  if (error) throw error
  return data as CreditoDB[]
}

export async function getHorarios(local_id?: number) {
  let q = supabase.from('horarios').select('*').order('dia_semana')
  if (local_id) q = q.eq('local_id', local_id)
  const { data, error } = await q
  if (error) throw error
  return data as HorarioDB[]
}

export async function actualizarHorario(id: number, cambios: Partial<HorarioDB>) {
  const { data, error } = await supabase.from('horarios').update(cambios).eq('id', id).select()
  if (error) throw error
  return data as HorarioDB[]
}

export const serviciosDisponibles = [
  { nombre: 'Corte de Pelo', duracion: 30, precio: 40000 },
  { nombre: 'Barba', duracion: 20, precio: 20000 },
  { nombre: 'Corte de Pelo + Barba', duracion: 50, precio: 60000 },
  { nombre: 'Corte de Pelo + Cejas', duracion: 40, precio: 50000 },
  { nombre: 'Corte de Pelo + Barba + Cejas', duracion: 60, precio: 70000 },
]
