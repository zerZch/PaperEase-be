SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS genero (
  IdGenero INT NOT NULL AUTO_INCREMENT,
  Genero VARCHAR(50) NOT NULL,
  PRIMARY KEY (IdGenero),
  UNIQUE KEY uq_genero (Genero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS facultad (
  IdFacultad INT NOT NULL AUTO_INCREMENT,
  Facultad VARCHAR(150) NOT NULL,
  PRIMARY KEY (IdFacultad),
  UNIQUE KEY uq_facultad (Facultad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tipoprograma (
  IdTipoP INT NOT NULL AUTO_INCREMENT,
  TipoPrograma VARCHAR(100) NOT NULL,
  PRIMARY KEY (IdTipoP),
  UNIQUE KEY uq_tipo_programa (TipoPrograma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programa (
  IdPrograma INT NOT NULL AUTO_INCREMENT,
  Programa VARCHAR(180) NOT NULL,
  IdTipoP INT NOT NULL,
  PRIMARY KEY (IdPrograma),
  KEY idx_programa_tipo (IdTipoP),
  CONSTRAINT fk_programa_tipo FOREIGN KEY (IdTipoP) REFERENCES tipoprograma (IdTipoP)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS estudiante (
  IdEstudiante INT NOT NULL AUTO_INCREMENT,
  Email VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Cedula VARCHAR(20) DEFAULT NULL,
  IdGenero INT DEFAULT NULL,
  IdFacultad INT DEFAULT NULL,
  FechaNacimiento DATE DEFAULT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UltimoAcceso TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (IdEstudiante),
  UNIQUE KEY uq_estudiante_email (Email),
  UNIQUE KEY uq_estudiante_cedula (Cedula),
  KEY idx_estudiante_genero (IdGenero),
  KEY idx_estudiante_facultad (IdFacultad),
  CONSTRAINT fk_estudiante_genero FOREIGN KEY (IdGenero) REFERENCES genero (IdGenero),
  CONSTRAINT fk_estudiante_facultad FOREIGN KEY (IdFacultad) REFERENCES facultad (IdFacultad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trabajador_social (
  IdTrabajadorSocial INT NOT NULL AUTO_INCREMENT,
  Email VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Cedula VARCHAR(20) DEFAULT NULL,
  IdGenero INT DEFAULT NULL,
  Departamento VARCHAR(120) DEFAULT NULL,
  Oficina VARCHAR(120) DEFAULT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UltimoAcceso TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (IdTrabajadorSocial),
  UNIQUE KEY uq_trabajador_email (Email),
  UNIQUE KEY uq_trabajador_cedula (Cedula),
  KEY idx_trabajador_genero (IdGenero),
  CONSTRAINT fk_trabajador_genero FOREIGN KEY (IdGenero) REFERENCES genero (IdGenero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sesiones (
  IdSesion INT NOT NULL AUTO_INCREMENT,
  IdUsuarioRef INT NOT NULL,
  TipoUsuario TINYINT NOT NULL,
  TokenSesion VARCHAR(255) NOT NULL,
  DireccionIP VARCHAR(64) DEFAULT NULL,
  UserAgent TEXT DEFAULT NULL,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FechaExpiracion DATETIME NOT NULL,
  Activa TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (IdSesion),
  UNIQUE KEY uq_token_sesion (TokenSesion),
  KEY idx_sesion_usuario (IdUsuarioRef, TipoUsuario),
  KEY idx_sesion_activa_expira (Activa, FechaExpiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_acceso (
  IdAuditoria INT NOT NULL AUTO_INCREMENT,
  IdUsuarioRef INT DEFAULT NULL,
  TipoUsuario TINYINT DEFAULT NULL,
  Email VARCHAR(255) DEFAULT NULL,
  Accion VARCHAR(80) NOT NULL,
  Descripcion TEXT DEFAULT NULL,
  DireccionIP VARCHAR(64) DEFAULT NULL,
  UserAgent TEXT DEFAULT NULL,
  Exitoso TINYINT(1) NOT NULL DEFAULT 0,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (IdAuditoria),
  KEY idx_auditoria_email (Email),
  KEY idx_auditoria_fecha (FechaCreacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS formulario_estudiante (
  id_formulario VARCHAR(100) NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Cedula VARCHAR(20) NOT NULL,
  IdGenero INT NOT NULL,
  IdFacultad INT NOT NULL,
  IdTipoP INT NOT NULL,
  IdPrograma INT NOT NULL,
  Archivo VARCHAR(255) DEFAULT NULL,
  Estado ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  Prioridad ENUM('baja','media','alta') NOT NULL DEFAULT 'media',
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FechaModificacion TIMESTAMP NULL DEFAULT NULL,
  NotasTrabajador TEXT DEFAULT NULL,
  PRIMARY KEY (id_formulario),
  KEY idx_formulario_cedula (Cedula),
  KEY idx_formulario_estado (Estado),
  KEY idx_formulario_prioridad (Prioridad),
  KEY idx_formulario_fecha (FechaCreacion),
  KEY idx_formulario_genero (IdGenero),
  KEY idx_formulario_facultad (IdFacultad),
  KEY idx_formulario_tipo (IdTipoP),
  KEY idx_formulario_programa (IdPrograma),
  CONSTRAINT fk_formulario_genero FOREIGN KEY (IdGenero) REFERENCES genero (IdGenero),
  CONSTRAINT fk_formulario_facultad FOREIGN KEY (IdFacultad) REFERENCES facultad (IdFacultad),
  CONSTRAINT fk_formulario_tipo FOREIGN KEY (IdTipoP) REFERENCES tipoprograma (IdTipoP),
  CONSTRAINT fk_formulario_programa FOREIGN KEY (IdPrograma) REFERENCES programa (IdPrograma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eventos (
  Id_Eventos INT NOT NULL AUTO_INCREMENT,
  Titulo VARCHAR(255) NOT NULL,
  Descripcion TEXT DEFAULT NULL,
  HoraInicio TIME DEFAULT NULL,
  HoraFin TIME DEFAULT NULL,
  Lugar VARCHAR(255) DEFAULT NULL,
  Imagen VARCHAR(500) DEFAULT NULL,
  Dia INT DEFAULT NULL,
  Mes INT DEFAULT NULL,
  Categoria VARCHAR(100) DEFAULT NULL,
  year INT DEFAULT NULL,
  Facultad VARCHAR(150) DEFAULT NULL,
  Programa VARCHAR(180) DEFAULT NULL,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id_Eventos),
  KEY idx_eventos_fecha (year, Mes, Dia),
  KEY idx_eventos_categoria (Categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evento_estudiante (
  IdInscripcion INT NOT NULL AUTO_INCREMENT,
  IdEvento INT NOT NULL,
  Cedula VARCHAR(20) NOT NULL,
  FechaInscripcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Asistio TINYINT(1) DEFAULT 0,
  PRIMARY KEY (IdInscripcion),
  UNIQUE KEY uq_evento_estudiante (IdEvento, Cedula),
  KEY idx_evento_estudiante_cedula (Cedula),
  CONSTRAINT fk_evento_estudiante_evento FOREIGN KEY (IdEvento) REFERENCES eventos (Id_Eventos) ON DELETE CASCADE,
  CONSTRAINT fk_evento_estudiante_estudiante FOREIGN KEY (Cedula) REFERENCES estudiante (Cedula) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT NOT NULL AUTO_INCREMENT,
  Cedula VARCHAR(20) NOT NULL,
  id_formulario VARCHAR(100) DEFAULT NULL,
  tipo ENUM('aprobada','rechazada','info') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id_notificacion),
  KEY idx_cedula (Cedula),
  KEY idx_leida (leida),
  KEY idx_fecha (fecha_creacion),
  KEY idx_cedula_leida (Cedula, leida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO genero (IdGenero, Genero) VALUES
  (1, 'Femenino'),
  (2, 'Masculino'),
  (3, 'Otro');

INSERT IGNORE INTO facultad (IdFacultad, Facultad) VALUES
  (1, 'Ingenieria Civil'),
  (2, 'Ingenieria Electrica'),
  (3, 'Ingenieria Industrial'),
  (4, 'Ingenieria Mecanica'),
  (5, 'Ingenieria de Sistemas Computacionales'),
  (6, 'Ciencias y Tecnologia');

INSERT IGNORE INTO tipoprograma (IdTipoP, TipoPrograma) VALUES
  (1, 'Salud'),
  (2, 'Promoción Social');

INSERT IGNORE INTO programa (IdPrograma, Programa, IdTipoP) VALUES
  (1, 'Consejería Personal', 1),
  (2, 'Banco de Sangre', 1),
  (3, 'Ayuda en Gastos Médicos', 1),
  (4, 'Feria de Salud', 1),
  (5, 'Compra de Lentes', 1),
  (6, 'Apoyo en Medicamento', 1),
  (7, 'Póliza de Salud', 1),
  (8, 'Matrícula', 1),
  (9, 'Canasta Navideña', 2),
  (10, 'Campaña de Fortalecimiento de Valores', 2),
  (11, 'Campaña de Concienciación de Instalaciones', 2),
  (12, 'Feria de Empleo', 2),
  (13, 'Apoyo en Casos de Siniestros', 2);

UPDATE programa
SET Programa = 'Apoyo en Medicamento'
WHERE IdPrograma = 6 AND IdTipoP = 1;
