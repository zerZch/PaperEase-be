-- ============================================
-- SCRIPT SIMPLE - SOLUCIÓN AL ERROR #1060
-- ============================================
--
-- Si recibes el error "Nombre de columna duplicado"
-- significa que las columnas YA EXISTEN.
--
-- OPCIÓN 1: Ejecuta este script para ELIMINAR y volver a CREAR
-- OPCIÓN 2: Si las columnas ya existen, NO NECESITAS hacer nada
--
-- ============================================

USE paperease;

-- ============================================
-- ELIMINAR COLUMNAS (Si ya existen)
-- ============================================

-- IMPORTANTE: Si alguna de estas líneas da error "columna no existe",
-- simplemente ignora el error y continúa con las siguientes

ALTER TABLE formulario_estudiante DROP COLUMN Estado;
ALTER TABLE formulario_estudiante DROP COLUMN Prioridad;
ALTER TABLE formulario_estudiante DROP COLUMN FechaCreacion;
ALTER TABLE formulario_estudiante DROP COLUMN FechaModificacion;
ALTER TABLE formulario_estudiante DROP COLUMN NotasTrabajador;
ALTER TABLE formulario_estudiante DROP COLUMN IdTrabajadorAsignado;

-- ============================================
-- AGREGAR COLUMNAS (Ahora sin error)
-- ============================================

ALTER TABLE formulario_estudiante
ADD COLUMN Estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente' AFTER Archivo,
ADD COLUMN Prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media' AFTER Estado,
ADD COLUMN FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER Prioridad,
ADD COLUMN FechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER FechaCreacion,
ADD COLUMN NotasTrabajador TEXT DEFAULT NULL AFTER FechaModificacion,
ADD COLUMN IdTrabajadorAsignado INT DEFAULT NULL AFTER NotasTrabajador;

-- ============================================
-- AGREGAR ÍNDICES
-- ============================================

ALTER TABLE formulario_estudiante
ADD INDEX idx_estado (Estado),
ADD INDEX idx_prioridad (Prioridad),
ADD INDEX idx_fecha_creacion (FechaCreacion),
ADD INDEX idx_trabajador_asignado (IdTrabajadorAsignado);

-- ============================================
-- ACTUALIZAR REGISTROS EXISTENTES
-- ============================================

UPDATE formulario_estudiante
SET Estado = 'pendiente', Prioridad = 'media', FechaCreacion = NOW(), FechaModificacion = NOW()
WHERE Estado IS NULL;

-- ============================================
-- VERIFICACIÓN
-- ============================================

DESCRIBE formulario_estudiante;
