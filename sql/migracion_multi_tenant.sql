-- local_id en todas las tablas
ALTER TABLE turnos ADD COLUMN local_id INT REFERENCES locales(id);
ALTER TABLE servicios ADD COLUMN local_id INT REFERENCES locales(id);
ALTER TABLE barberos ADD COLUMN local_id INT REFERENCES locales(id);
ALTER TABLE promociones ADD COLUMN local_id INT REFERENCES locales(id);
ALTER TABLE horarios ADD COLUMN local_id INT REFERENCES locales(id);
ALTER TABLE productos ADD COLUMN local_id INT REFERENCES locales(id);
ALTER TABLE creditos ADD COLUMN local_id INT REFERENCES locales(id);

-- RLS policies (anon acceso total, multi-tenant por local_id)
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE barberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir todo sin restricciones (el filtro es en la app)
CREATE POLICY todo_acceso ON turnos FOR ALL USING (true);
CREATE POLICY todo_acceso ON servicios FOR ALL USING (true);
CREATE POLICY todo_acceso ON barberos FOR ALL USING (true);
CREATE POLICY todo_acceso ON promociones FOR ALL USING (true);
CREATE POLICY todo_acceso ON horarios FOR ALL USING (true);
CREATE POLICY todo_acceso ON productos FOR ALL USING (true);
CREATE POLICY todo_acceso ON creditos FOR ALL USING (true);
CREATE POLICY todo_acceso ON locales FOR ALL USING (true);
