-- ============================================
-- SCRIPT SQL COMPLETO PARA FUNCIONALIDADES DE GESTIÓN
-- PaperEase - Universidad Tecnológica de Panamá
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Abre phpMyAdmin
-- 2. Selecciona la base de datos "paperease"
-- 3. Ve a la pestaña "SQL"
-- 4. Copia y pega TODO este script
-- 5. Haz clic en "Continuar"
--
-- ============================================

USE paperease;

-- ============================================
-- PASO 1: Verificar que la tabla existe
-- ============================================
SELECT 'Verificando tabla formulario_estudiante...' as Paso;

-- ============================================
-- PASO 2: Agregar nuevos campos
-- ============================================
SELECT 'Agregando campos nuevos...' as Paso;

-- Campo: Estado (pendiente, aprobada, rechazada)
ALTER TABLE formulario_estudiante
ADD COLUMN Estado ENUM('pendiente', 'aprobada', 'rechazada')
DEFAULT 'pendiente'
COMMENT 'Estado de la solicitud'
AFTER Archivo;

-- Campo: Prioridad (baja, media, alta)
ALTER TABLE formulario_estudiante
ADD COLUMN Prioridad ENUM('baja', 'media', 'alta')
DEFAULT 'media'
COMMENT 'Prioridad de la solicitud'
AFTER Estado;

-- Campo: Fecha de creación
ALTER TABLE formulario_estudiante
ADD COLUMN FechaCreacion TIMESTAMP
DEFAULT CURRENT_TIMESTAMP
COMMENT 'Fecha de creación de la solicitud'
AFTER Prioridad;

-- Campo: Fecha de modificación
ALTER TABLE formulario_estudiante
ADD COLUMN FechaModificacion TIMESTAMP
DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP
COMMENT 'Fecha de última modificación'
AFTER FechaCreacion;

-- Campo: Notas del trabajador social
ALTER TABLE formulario_estudiante
ADD COLUMN NotasTrabajador TEXT
DEFAULT NULL
COMMENT 'Notas del trabajador social sobre la solicitud'
AFTER FechaModificacion;

-- Campo: ID del trabajador social asignado
ALTER TABLE formulario_estudiante
ADD COLUMN IdTrabajadorAsignado INT
DEFAULT NULL
COMMENT 'ID del trabajador social que gestionó la solicitud'
AFTER NotasTrabajador;

-- ============================================
-- PASO 3: Agregar índices para mejor rendimiento
-- ============================================
SELECT 'Agregando índices...' as Paso;

-- Índice para Estado (acelera filtros por estado)
ALTER TABLE formulario_estudiante
ADD INDEX idx_estado (Estado);

-- Índice para Prioridad (acelera filtros por prioridad)
ALTER TABLE formulario_estudiante
ADD INDEX idx_prioridad (Prioridad);

-- Índice para Fecha de Creación (acelera ordenamiento por fecha)
ALTER TABLE formulario_estudiante
ADD INDEX idx_fecha_creacion (FechaCreacion);

-- Índice para Trabajador Asignado (acelera búsquedas por trabajador)
ALTER TABLE formulario_estudiante
ADD INDEX idx_trabajador_asignado (IdTrabajadorAsignado);

-- ============================================
-- PASO 4: Actualizar registros existentes
-- ============================================
SELECT 'Actualizando registros existentes...' as Paso;

-- Poner todos los registros existentes como "pendiente" con prioridad "media"
UPDATE formulario_estudiante
SET
    Estado = 'pendiente',
    Prioridad = 'media',
    FechaCreacion = NOW(),
    FechaModificacion = NOW()
WHERE Estado IS NULL;

-- ============================================
-- PASO 5: Verificación final
-- ============================================
SELECT 'Verificando cambios...' as Paso;

-- Ver estructura de la tabla actualizada
DESCRIBE formulario_estudiante;

-- ============================================
-- PASO 6: Mostrar resumen
-- ============================================
SELECT '=== RESUMEN DE CAMBIOS ===' as Titulo;

-- Contar total de solicitudes
SELECT
    'Total de solicitudes' as Metrica,
    COUNT(*) as Cantidad
FROM formulario_estudiante

UNION ALL

-- Contar por estado
SELECT
    CONCAT('Estado: ', Estado) as Metrica,
    COUNT(*) as Cantidad
FROM formulario_estudiante
GROUP BY Estado

UNION ALL

-- Contar por prioridad
SELECT
    CONCAT('Prioridad: ', Prioridad) as Metrica,
    COUNT(*) as Cantidad
FROM formulario_estudiante
GROUP BY Prioridad;

-- ============================================
-- PASO 7: Mensaje de confirmación
-- ============================================
SELECT
    '✅ CAMBIOS APLICADOS EXITOSAMENTE' as Estado,
    'La tabla formulario_estudiante ha sido actualizada' as Mensaje,
    NOW() as Fecha;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
--
-- CAMPOS AGREGADOS:
-- ✅ Estado (pendiente, aprobada, rechazada)
-- ✅ Prioridad (baja, media, alta)
-- ✅ FechaCreacion (timestamp automático)
-- ✅ FechaModificacion (timestamp que se actualiza automáticamente)
-- ✅ NotasTrabajador (texto libre)
-- ✅ IdTrabajadorAsignado (para futuras funcionalidades)
--
-- ÍNDICES AGREGADOS:
-- ✅ idx_estado
-- ✅ idx_prioridad
-- ✅ idx_fecha_creacion
-- ✅ idx_trabajador_asignado
--
-- AHORA PUEDES:
-- 1. Aprobar/Rechazar solicitudes
-- 2. Cambiar prioridad (Alta/Media/Baja)
-- 3. Agregar notas del trabajador social
-- 4. Generar PDFs con toda la información
-- 5. Filtrar por estado y prioridad
-- 6. Ver estadísticas en tiempo real
--
-- ============================================
