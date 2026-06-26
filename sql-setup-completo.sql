-- ============================================================
-- SCRIPT COMPLETO BARBEROS WEB - Configuración única
-- Pegá TODO esto en UNA sola pestaña del SQL Editor y ejecutalo
-- ============================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNCIÓN para auto-crear horarios al activar un local
CREATE OR REPLACE FUNCTION public.init_horarios()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activo = true THEN
    FOR d IN 0..6 LOOP
      INSERT INTO public.horarios (dia_semana, activo, inicio_manana, fin_manana, inicio_tarde, fin_tarde, local_id)
      VALUES (d, CASE WHEN d = 0 THEN false ELSE true END, '08:00', '12:00', '15:00', '20:00', NEW.id)
      ON CONFLICT (local_id, dia_semana) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER: cuando se aprueba un local, se crean horarios automáticamente
DROP TRIGGER IF EXISTS trg_init_horarios ON public.locales;
CREATE TRIGGER trg_init_horarios
  AFTER UPDATE OF activo ON public.locales
  FOR EACH ROW
  WHEN (NEW.activo = true AND (OLD.activo = false OR OLD.activo IS NULL))
  EXECUTE FUNCTION public.init_horarios();

-- 4. GARANTIZAR CONSTRAINTS ÚNICAS por local
-- (para evitar duplicados dentro de cada barbería)
ALTER TABLE public.barberos DROP CONSTRAINT IF EXISTS barberos_nombre_local_key;
ALTER TABLE public.barberos ADD CONSTRAINT barberos_nombre_local_key UNIQUE (nombre, local_id);

ALTER TABLE public.servicios DROP CONSTRAINT IF EXISTS servicios_nombre_local_key;
ALTER TABLE public.servicios ADD CONSTRAINT servicios_nombre_local_key UNIQUE (nombre, local_id);

ALTER TABLE public.servicios DROP CONSTRAINT IF EXISTS servicios_codigo_local_key;
ALTER TABLE public.servicios ADD CONSTRAINT servicios_codigo_local_key UNIQUE (codigo, local_id);

ALTER TABLE public.productos DROP CONSTRAINT IF EXISTS productos_nombre_local_key;
ALTER TABLE public.productos ADD CONSTRAINT productos_nombre_local_key UNIQUE (nombre, local_id);

ALTER TABLE public.productos DROP CONSTRAINT IF EXISTS productos_codigo_local_key;
ALTER TABLE public.productos ADD CONSTRAINT productos_codigo_local_key UNIQUE (codigo, local_id);

ALTER TABLE public.horarios DROP CONSTRAINT IF EXISTS horarios_local_dia_key;
ALTER TABLE public.horarios ADD CONSTRAINT horarios_local_dia_key UNIQUE (local_id, dia_semana);

-- 5. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditos ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS
-- 6a. locales: super admin ve todo; dueño ve su propio local; anónimos ven activos
DROP POLICY IF EXISTS locales_select ON public.locales;
CREATE POLICY locales_select ON public.locales FOR SELECT USING (
  auth.role() = 'anon' AND activo = true
  OR auth.role() = 'authenticated' AND (
    user_id = auth.uid()
    OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
  )
);

DROP POLICY IF EXISTS locales_insert ON public.locales;
CREATE POLICY locales_insert ON public.locales FOR INSERT WITH CHECK (
  auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS locales_update ON public.locales;
CREATE POLICY locales_update ON public.locales FOR UPDATE USING (
  auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS locales_delete ON public.locales;
CREATE POLICY locales_delete ON public.locales FOR DELETE USING (
  auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6b. turnos: dueño ve todos, anónimo solo inserta
DROP POLICY IF EXISTS turnos_select ON public.turnos;
CREATE POLICY turnos_select ON public.turnos FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS turnos_insert ON public.turnos;
CREATE POLICY turnos_insert ON public.turnos FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE activo = true)
);

DROP POLICY IF EXISTS turnos_update ON public.turnos;
CREATE POLICY turnos_update ON public.turnos FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS turnos_delete ON public.turnos;
CREATE POLICY turnos_delete ON public.turnos FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6c. barberos: dueño CRUD, anónimo solo lectura (para booking)
DROP POLICY IF EXISTS barberos_select ON public.barberos;
CREATE POLICY barberos_select ON public.barberos FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE activo = true OR user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS barberos_insert ON public.barberos;
CREATE POLICY barberos_insert ON public.barberos FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS barberos_update ON public.barberos;
CREATE POLICY barberos_update ON public.barberos FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS barberos_delete ON public.barberos;
CREATE POLICY barberos_delete ON public.barberos FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6d. servicios: igual que barberos
DROP POLICY IF EXISTS servicios_select ON public.servicios;
CREATE POLICY servicios_select ON public.servicios FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE activo = true OR user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS servicios_insert ON public.servicios;
CREATE POLICY servicios_insert ON public.servicios FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS servicios_update ON public.servicios;
CREATE POLICY servicios_update ON public.servicios FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS servicios_delete ON public.servicios;
CREATE POLICY servicios_delete ON public.servicios FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6e. productos
DROP POLICY IF EXISTS productos_select ON public.productos;
CREATE POLICY productos_select ON public.productos FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE activo = true OR user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS productos_insert ON public.productos;
CREATE POLICY productos_insert ON public.productos FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS productos_update ON public.productos;
CREATE POLICY productos_update ON public.productos FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS productos_delete ON public.productos;
CREATE POLICY productos_delete ON public.productos FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6f. promociones
DROP POLICY IF EXISTS promociones_select ON public.promociones;
CREATE POLICY promociones_select ON public.promociones FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE activo = true OR user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS promociones_insert ON public.promociones;
CREATE POLICY promociones_insert ON public.promociones FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS promociones_update ON public.promociones;
CREATE POLICY promociones_update ON public.promociones FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS promociones_delete ON public.promociones;
CREATE POLICY promociones_delete ON public.promociones FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6g. horarios: lectura anónima para booking, escritura solo dueño
DROP POLICY IF EXISTS horarios_select ON public.horarios;
CREATE POLICY horarios_select ON public.horarios FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE activo = true OR user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS horarios_insert ON public.horarios;
CREATE POLICY horarios_insert ON public.horarios FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS horarios_update ON public.horarios;
CREATE POLICY horarios_update ON public.horarios FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS horarios_delete ON public.horarios;
CREATE POLICY horarios_delete ON public.horarios FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6h. ventas: solo dueño
DROP POLICY IF EXISTS ventas_select ON public.ventas;
CREATE POLICY ventas_select ON public.ventas FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS ventas_insert ON public.ventas;
CREATE POLICY ventas_insert ON public.ventas FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS ventas_update ON public.ventas;
CREATE POLICY ventas_update ON public.ventas FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS ventas_delete ON public.ventas;
CREATE POLICY ventas_delete ON public.ventas FOR DELETE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 6i. creditos: solo dueño
DROP POLICY IF EXISTS creditos_select ON public.creditos;
CREATE POLICY creditos_select ON public.creditos FOR SELECT USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS creditos_insert ON public.creditos;
CREATE POLICY creditos_insert ON public.creditos FOR INSERT WITH CHECK (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

DROP POLICY IF EXISTS creditos_update ON public.creditos;
CREATE POLICY creditos_update ON public.creditos FOR UPDATE USING (
  local_id IN (SELECT id FROM public.locales WHERE user_id = auth.uid())
  OR auth.jwt()->>'email' = 'miersdiego@gmail.com'
);

-- 7. ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_turnos_local_fecha ON public.turnos (local_id, fecha);
CREATE INDEX IF NOT EXISTS idx_barberos_local ON public.barberos (local_id);
CREATE INDEX IF NOT EXISTS idx_servicios_local ON public.servicios (local_id);
CREATE INDEX IF NOT EXISTS idx_productos_local ON public.productos (local_id);
CREATE INDEX IF NOT EXISTS idx_promociones_local ON public.promociones (local_id);
CREATE INDEX IF NOT EXISTS idx_horarios_local ON public.horarios (local_id);
CREATE INDEX IF NOT EXISTS idx_ventas_local ON public.ventas (local_id);
CREATE INDEX IF NOT EXISTS idx_creditos_local ON public.creditos (local_id);
CREATE INDEX IF NOT EXISTS idx_locales_user ON public.locales (user_id);
CREATE INDEX IF NOT EXISTS idx_locales_slug ON public.locales (slug);

-- 8. VERIFICACIÓN: mostrar resumen
SELECT '✅ CONFIGURACIÓN COMPLETA' AS resultado;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;
