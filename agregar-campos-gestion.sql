-- ============================================
-- SCRIPT PARA AGREGAR CAMPOS DE GESTIÓN
-- ============================================
-- Este script agrega campos para gestionar solicitudes:
-- - Estado (pendiente, aprobada, rechazada)
-- - Prioridad (baja, media, alta)
-- - Fecha de creación y modificación
-- - Notas del trabajador social
-- ============================================

USE paperease;

-- Agregar campos a la tabla formulario_estudiante
ALTER TABLE formulario_estudiante
ADD COLUMN Estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente' COMMENT 'Estado de la solicitud',
ADD COLUMN Prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media' COMMENT 'Prioridad de la solicitud',
ADD COLUMN FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la solicitud',
ADD COLUMN FechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
ADD COLUMN NotasTrabajador TEXT DEFAULT NULL COMMENT 'Notas del trabajador social sobre la solicitud',
ADD COLUMN IdTrabajadorAsignado INT DEFAULT NULL COMMENT 'ID del trabajador social que gestionó la solicitud',
ADD INDEX idx_estado (Estado),
ADD INDEX idx_prioridad (Prioridad),
ADD INDEX idx_fecha_creacion (FechaCreacion);

-- Verificar que se agregaron correctamente
DESCRIBE formulario_estudiante;

-- Mostrar un mensaje de confirmación
SELECT
    'Campos agregados exitosamente' as Mensaje,
    COUNT(*) as TotalSolicitudes
FROM formulario_estudiante;
