-- Ejecutar la configuración de la tabla de encuesta
-- Este script verifica que la tabla esté creada correctamente

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'survey_responses' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar que las políticas RLS estén activas
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'survey_responses';

-- Mostrar las políticas existentes
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'survey_responses';
