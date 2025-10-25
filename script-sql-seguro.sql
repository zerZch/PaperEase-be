-- ============================================
-- SCRIPT SQL SEGURO - VERIFICA SI YA EXISTEN LOS CAMPOS
-- PaperEase - Universidad Tecnológica de Panamá
-- ============================================
--
-- Este script PRIMERO elimina las columnas si existen
-- y luego las agrega de nuevo. Es SEGURO ejecutarlo múltiples veces.
--
-- ============================================

USE paperease;

-- ============================================
-- PASO 1: ELIMINAR COLUMNAS SI YA EXISTEN
-- ============================================

-- Eliminar Estado si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'paperease'
AND TABLE_NAME = 'formulario_estudiante'
AND COLUMN_NAME = 'Estado');

SET @sqlstmt := IF(@exist > 0,
    'ALTER TABLE formulario_estudiante DROP COLUMN Estado',
    'SELECT "Column Estado does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Eliminar Prioridad si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'paperease'
AND TABLE_NAME = 'formulario_estudiante'
AND COLUMN_NAME = 'Prioridad');

SET @sqlstmt := IF(@exist > 0,
    'ALTER TABLE formulario_estudiante DROP COLUMN Prioridad',
    'SELECT "Column Prioridad does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Eliminar FechaCreacion si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'paperease'
AND TABLE_NAME = 'formulario_estudiante'
AND COLUMN_NAME = 'FechaCreacion');

SET @sqlstmt := IF(@exist > 0,
    'ALTER TABLE formulario_estudiante DROP COLUMN FechaCreacion',
    'SELECT "Column FechaCreacion does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Eliminar FechaModificacion si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'paperease'
AND TABLE_NAME = 'formulario_estudiante'
AND COLUMN_NAME = 'FechaModificacion');

SET @sqlstmt := IF(@exist > 0,
    'ALTER TABLE formulario_estudiante DROP COLUMN FechaModificacion',
    'SELECT "Column FechaModificacion does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Eliminar NotasTrabajador si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'paperease'
AND TABLE_NAME = 'formulario_estudiante'
AND COLUMN_NAME = 'NotasTrabajador');

SET @sqlstmt := IF(@exist > 0,
    'ALTER TABLE formulario_estudiante DROP COLUMN NotasTrabajador',
    'SELECT "Column NotasTrabajador does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Eliminar IdTrabajadorAsignado si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'paperease'
AND TABLE_NAME = 'formulario_estudiante'
AND COLUMN_NAME = 'IdTrabajadorAsignado');

SET @sqlstmt := IF(@exist > 0,
    'ALTER TABLE formulario_estudiante DROP COLUMN IdTrabajadorAsignado',
    'SELECT "Column IdTrabajadorAsignado does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- ============================================
-- PASO 2: AGREGAR COLUMNAS NUEVAS
-- ============================================

-- Estado (pendiente, aprobada, rechazada)
ALTER TABLE formulario_estudiante
ADD COLUMN Estado ENUM('pendiente', 'aprobada', 'rechazada')
DEFAULT 'pendiente'
COMMENT 'Estado de la solicitud'
AFTER Archivo;

-- Prioridad (baja, media, alta)
ALTER TABLE formulario_estudiante
ADD COLUMN Prioridad ENUM('baja', 'media', 'alta')
DEFAULT 'media'
COMMENT 'Prioridad de la solicitud'
AFTER Estado;

-- Fecha de creación
ALTER TABLE formulario_estudiante
ADD COLUMN FechaCreacion TIMESTAMP
DEFAULT CURRENT_TIMESTAMP
COMMENT 'Fecha de creación de la solicitud'
AFTER Prioridad;

-- Fecha de modificación
ALTER TABLE formulario_estudiante
ADD COLUMN FechaModificacion TIMESTAMP
DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP
COMMENT 'Fecha de última modificación'
AFTER FechaCreacion;

-- Notas del trabajador social
ALTER TABLE formulario_estudiante
ADD COLUMN NotasTrabajador TEXT
DEFAULT NULL
COMMENT 'Notas del trabajador social sobre la solicitud'
AFTER FechaModificacion;

-- ID del trabajador social asignado
ALTER TABLE formulario_estudiante
ADD COLUMN IdTrabajadorAsignado INT
DEFAULT NULL
COMMENT 'ID del trabajador social que gestionó la solicitud'
AFTER NotasTrabajador;

-- ============================================
-- PASO 3: ELIMINAR ÍNDICES SI EXISTEN
-- ============================================

-- Eliminar índices si existen (sin error)
ALTER TABLE formulario_estudiante
DROP INDEX IF EXISTS idx_estado;

ALTER TABLE formulario_estudiante
DROP INDEX IF EXISTS idx_prioridad;

ALTER TABLE formulario_estudiante
DROP INDEX IF EXISTS idx_fecha_creacion;

ALTER TABLE formulario_estudiante
DROP INDEX IF EXISTS idx_trabajador_asignado;

-- ============================================
-- PASO 4: AGREGAR ÍNDICES NUEVOS
-- ============================================

-- Índice para Estado
ALTER TABLE formulario_estudiante
ADD INDEX idx_estado (Estado);

-- Índice para Prioridad
ALTER TABLE formulario_estudiante
ADD INDEX idx_prioridad (Prioridad);

-- Índice para Fecha de Creación
ALTER TABLE formulario_estudiante
ADD INDEX idx_fecha_creacion (FechaCreacion);

-- Índice para Trabajador Asignado
ALTER TABLE formulario_estudiante
ADD INDEX idx_trabajador_asignado (IdTrabajadorAsignado);

-- ============================================
-- PASO 5: ACTUALIZAR REGISTROS EXISTENTES
-- ============================================

UPDATE formulario_estudiante
SET
    Estado = 'pendiente',
    Prioridad = 'media',
    FechaCreacion = NOW(),
    FechaModificacion = NOW()
WHERE Estado IS NULL OR Estado = '';

-- ============================================
-- PASO 6: VERIFICACIÓN FINAL
-- ============================================

SELECT 'Verificando estructura de la tabla...' as Paso;
DESCRIBE formulario_estudiante;

SELECT 'Verificando registros actualizados...' as Paso;
SELECT
    COUNT(*) as TotalSolicitudes,
    SUM(CASE WHEN Estado = 'pendiente' THEN 1 ELSE 0 END) as Pendientes,
    SUM(CASE WHEN Estado = 'aprobada' THEN 1 ELSE 0 END) as Aprobadas,
    SUM(CASE WHEN Estado = 'rechazada' THEN 1 ELSE 0 END) as Rechazadas
FROM formulario_estudiante;

SELECT '✅ SCRIPT EJECUTADO EXITOSAMENTE' as Estado;
