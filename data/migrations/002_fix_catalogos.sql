SET NAMES utf8mb4;

-- Fix tipoprograma: reemplazar valores académicos por categorías funcionales
DELETE FROM programa;
DELETE FROM tipoprograma;

INSERT IGNORE INTO tipoprograma (IdTipoP, TipoPrograma) VALUES
  (1, 'Promoción Social'),
  (2, 'Salud');

INSERT IGNORE INTO programa (IdPrograma, Programa, IdTipoP) VALUES
  (1, 'Canasta Navideña', 1),
  (2, 'Campaña de Fortalecimiento de Valores', 1),
  (3, 'Campaña de Concienciación de Instalaciones', 1),
  (4, 'Feria de Empleo', 1),
  (5, 'Consejería Personal', 2),
  (6, 'Banco de Sangre', 2),
  (7, 'Ayuda en Gastos Médicos', 2),
  (8, 'Feria de Salud', 2),
  (9, 'Compra de Lentes', 2),
  (10, 'Apoyo en Medicamentos', 2),
  (11, 'Póliza de Salud', 2),
  (12, 'Matrícula', 2),
  (13, 'Apoyo en Casos de Siniestros', 1);