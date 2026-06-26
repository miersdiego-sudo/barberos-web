import { supabase } from './supabaseClient'

export type UserInfo = {
  id: string
  email: string
  local_id: number | null
  is_super_admin: boolean
  activo: boolean | null
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function getActivoStatus(userId: string): Promise<boolean | null> {
  const { data } = await supabase.from('locales').select('activo').eq('user_id', userId).maybeSingle()
  if (!data) return null
  return data.activo
}

export async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.user
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/recuperar`,
  })
  if (error) throw error
}

export async function getUserInfo(): Promise<UserInfo | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: local } = await supabase.from('locales').select('id, activo').eq('user_id', user.id).maybeSingle()
  return {
    id: user.id,
    email: user.email ?? '',
    local_id: local?.id ?? null,
    is_super_admin: user.email === 'miersdiego@gmail.com',
    activo: local?.activo ?? null,
  }
}
