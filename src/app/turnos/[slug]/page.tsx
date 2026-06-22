import { getLocalBySlug } from '@/lib/supabaseClient'
import { TurnosApp } from '../page'

export default async function SlugTurnos(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const local = await getLocalBySlug(params.slug)
  if (!local) return <div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Local no encontrado</div>
  return <TurnosApp localId={local.id} localNombre={local.nombre} />
}
