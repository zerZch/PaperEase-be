SET NAMES utf8mb4;

-- Fix tipoprograma: reemplazar valores académicos por categorías funcionales
-- Asegurar que tipo 1 = Salud y tipo 2 = Promoción Social
DELETE FROM programa;
DELETE FROM tipoprograma;

INSERT IGNORE INTO tipoprograma (IdTipoP, TipoPrograma) VALUES
  (1, 'Salud'),
  (2, 'Promoción Social');

INSERT IGNORE INTO programa (IdPrograma, Programa, IdTipoP) VALUES
  (1, 'Consejería Personal', 1),
  (2, 'Banco de Sangre', 1),
  (3, 'Ayuda en Gastos Médicos', 1),
  (4, 'Feria de Salud', 1),
  (5, 'Compra de Lentes', 1),
  (6, 'Apoyo en Medicamentos', 1),
  (7, 'Póliza de Salud', 1),
  (8, 'Matrícula', 1),
  (9, 'Canasta Navideña', 2),
  (10, 'Campaña de Fortalecimiento de Valores', 2),
  (11, 'Campaña de Concienciación de Instalaciones', 2),
  (12, 'Feria de Empleo', 2),
  (13, 'Apoyo en Casos de Siniestros', 2);
