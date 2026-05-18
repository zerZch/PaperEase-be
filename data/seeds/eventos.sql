-- ================================
-- NUEVOS EVENTOS PARA NOVEDADES
-- ================================
-- Script para agregar eventos de salud y promoción social
-- Ejecutar en phpMyAdmin o MySQL Workbench

-- Eventos de Promoción Social (Noviembre - Diciembre 2025)
INSERT INTO `eventos` (`Titulo`, `Descripcion`, `HoraInicio`, `HoraFin`, `Lugar`, `Imagen`, `Dia`, `Mes`, `Categoria`, `year`, `Programa`) VALUES
('Taller de Liderazgo Estudiantil', 'Desarrollo de habilidades de liderazgo para representantes estudiantiles y líderes comunitarios.', '09:00:00', '13:00:00', 'Auditorio Central', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 5, 11, 'Promoción Social', 2025, 'Promoción Social'),

('Feria de Emprendimiento UTP', 'Exhibición de proyectos emprendedores desarrollados por estudiantes de todas las facultades.', '08:00:00', '17:00:00', 'Plaza Universitaria', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', 12, 11, 'Promoción Social', 2025, 'Promoción Social'),

('Jornada de Integración Cultural', 'Celebración de la diversidad cultural con presentaciones artísticas y gastronómicas de diferentes regiones.', '10:00:00', '16:00:00', 'Parque Central UTP', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', 18, 11, 'Promoción Social', 2025, 'Promoción Social'),

('Campaña de Voluntariado Navideño', 'Actividades de voluntariado para apoyar a comunidades vulnerables durante la temporada navideña.', '08:00:00', '14:00:00', 'Cafetería Principal', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800', 25, 11, 'Promoción Social', 2025, 'Promoción Social'),

('Taller de Gestión Emocional', 'Sesión práctica sobre manejo del estrés y desarrollo de inteligencia emocional para estudiantes.', '14:00:00', '17:00:00', 'Sala de Conferencias B', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 2, 12, 'Promoción Social', 2025, 'Promoción Social'),

('Charla sobre Inclusión y Diversidad', 'Conversatorio sobre la importancia de la inclusión en el ambiente universitario.', '10:00:00', '12:00:00', 'Auditorio Principal', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', 10, 12, 'Promoción Social', 2025, 'Promoción Social'),

-- Eventos de Programa de Salud (Noviembre - Diciembre 2025)
('Jornada de Vacunación', 'Vacunación gratuita contra influenza y otras enfermedades estacionales para estudiantes y personal.', '08:00:00', '15:00:00', 'Centro de Salud UTP', 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800', 8, 11, 'Programa de Salud', 2025, 'Salud'),

('Taller de Primeros Auxilios', 'Capacitación básica en técnicas de primeros auxilios y RCP para la comunidad universitaria.', '09:00:00', '13:00:00', 'Gimnasio Universitario', 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=800', 15, 11, 'Programa de Salud', 2025, 'Salud'),

('Campaña de Salud Mental', 'Sesiones informativas sobre salud mental y bienestar emocional con profesionales de la psicología.', '10:00:00', '14:00:00', 'Edificio de Servicios Estudiantiles', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 20, 11, 'Programa de Salud', 2025, 'Salud'),

('Feria de Nutrición Saludable', 'Exhibición de opciones de alimentación saludable con degustaciones y consultas nutricionales gratuitas.', '09:00:00', '16:00:00', 'Cafetería Central', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800', 27, 11, 'Programa de Salud', 2025, 'Salud'),

('Jornada de Exámenes Médicos', 'Chequeos médicos gratuitos: presión arterial, glucosa, colesterol y evaluaciones básicas de salud.', '08:00:00', '17:00:00', 'Centro de Salud UTP', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800', 4, 12, 'Programa de Salud', 2025, 'Salud'),

('Taller de Actividad Física', 'Sesión de ejercicios y actividad física dirigida por profesionales para promover vida saludable.', '07:00:00', '09:00:00', 'Estadio Universitario', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', 11, 12, 'Programa de Salud', 2025, 'Salud'),

('Charla sobre Prevención de Enfermedades', 'Conferencia sobre prevención de enfermedades crónicas y hábitos de vida saludable.', '14:00:00', '16:00:00', 'Auditorio Central', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', 18, 12, 'Programa de Salud', 2025, 'Salud'),

-- Eventos Deportivos (Noviembre - Diciembre 2025)
('Torneo de Fútbol Interfacultades', 'Competencia de fútbol entre equipos representativos de cada facultad de la universidad.', '08:00:00', '18:00:00', 'Estadio Universitario', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', 9, 11, 'Deportivo', 2025, 'Promoción Social'),

('Maratón UTP 5K', 'Carrera de 5 kilómetros abierta a estudiantes, docentes y personal administrativo.', '06:00:00', '10:00:00', 'Campus Principal', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800', 16, 11, 'Deportivo', 2025, 'Promoción Social'),

('Torneo de Baloncesto Estudiantil', 'Campeonato de baloncesto con la participación de equipos de diferentes carreras.', '09:00:00', '17:00:00', 'Gimnasio Universitario', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 23, 11, 'Deportivo', 2025, 'Promoción Social'),

('Clase de Yoga al Aire Libre', 'Sesión de yoga grupal para estudiantes y personal, enfocada en relajación y bienestar.', '07:00:00', '08:30:00', 'Parque Central', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 1, 12, 'Deportivo', 2025, 'Promoción Social'),

-- Eventos Académicos (Noviembre - Diciembre 2025)
('Simposio de Innovación Tecnológica', 'Presentación de proyectos innovadores en tecnología desarrollados por estudiantes e investigadores.', '09:00:00', '16:00:00', 'Centro de Convenciones UTP', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 14, 11, 'Académico', 2025, 'Promoción Social'),

('Conferencia sobre Inteligencia Artificial', 'Expertos nacionales e internacionales comparten tendencias en IA y machine learning.', '10:00:00', '13:00:00', 'Auditorio Principal', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', 21, 11, 'Académico', 2025, 'Promoción Social'),

('Taller de Desarrollo de Software', 'Capacitación práctica en metodologías ágiles y frameworks modernos de desarrollo.', '09:00:00', '17:00:00', 'Laboratorio de Computación', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 28, 11, 'Académico', 2025, 'Promoción Social'),

('Expo Ciencias UTP 2025', 'Feria científica con experimentos, demostraciones y proyectos de investigación estudiantil.', '08:00:00', '18:00:00', 'Edificio de Ciencias', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', 5, 12, 'Académico', 2025, 'Promoción Social'),

('Seminario de Emprendimiento Digital', 'Estrategias para iniciar y hacer crecer negocios digitales en la era moderna.', '14:00:00', '18:00:00', 'Sala de Conferencias A', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 12, 12, 'Académico', 2025, 'Promoción Social'),

-- Ferias (Noviembre - Diciembre 2025)
('Feria del Libro Universitario', 'Exhibición y venta de libros académicos, literarios y científicos con descuentos especiales.', '09:00:00', '18:00:00', 'Plaza Central', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', 6, 11, 'Feria', 2025, 'Promoción Social'),

('Feria de Organizaciones Estudiantiles', 'Muestra de las diferentes organizaciones y clubes estudiantiles disponibles en la UTP.', '10:00:00', '15:00:00', 'Entrada Principal', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', 13, 11, 'Feria', 2025, 'Promoción Social'),

('Feria Navideña UTP', 'Celebración navideña con artesanías, comida típica y actividades culturales para toda la comunidad.', '10:00:00', '20:00:00', 'Plaza Universitaria', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800', 19, 12, 'Feria', 2025, 'Promoción Social');
