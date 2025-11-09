-- Script SQL para crear la tabla de notificaciones en PaperEase
-- Este script crea la tabla necesaria para el sistema de notificaciones en tiempo real

CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  IdEstudiante INT NOT NULL,
  id_formulario VARCHAR(100),
  tipo ENUM('aprobada', 'rechazada', 'info') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP NULL,

  INDEX idx_estudiante (IdEstudiante),
  INDEX idx_leida (leida),
  INDEX idx_fecha (fecha_creacion),

  FOREIGN KEY (IdEstudiante) REFERENCES estudiante(IdEstudiante) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice compuesto para mejorar el rendimiento de consultas frecuentes
CREATE INDEX idx_estudiante_leida ON notificaciones(IdEstudiante, leida);
