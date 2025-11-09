-- Script SQL para crear la tabla de notificaciones en PaperEase
-- Este script crea la tabla necesaria para el sistema de notificaciones en tiempo real
-- CAMBIO: Ahora usa Cedula en vez de IdEstudiante como referencia

CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  Cedula VARCHAR(50) NOT NULL,
  id_formulario VARCHAR(100),
  tipo ENUM('aprobada', 'rechazada', 'info') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP NULL,

  INDEX idx_cedula (Cedula),
  INDEX idx_leida (leida),
  INDEX idx_fecha (fecha_creacion),

  FOREIGN KEY (Cedula) REFERENCES estudiante(Cedula) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice compuesto para mejorar el rendimiento de consultas frecuentes
CREATE INDEX idx_cedula_leida ON notificaciones(Cedula, leida);
