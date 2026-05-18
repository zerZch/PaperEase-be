const db = require('../database/connection');
const serverConfig = require('../../config/server');

exports.list = (req, res) => {
  db.query('SELECT * FROM eventos ORDER BY year DESC, Mes DESC, Dia DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.getById = (req, res) => {
  db.query('SELECT * FROM eventos WHERE Id_Eventos = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(result[0]);
  });
};

exports.create = (req, res) => {
  const {
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa
  } = req.body;

  if (!Titulo || !Titulo.trim()) {
    return res.status(400).json({ error: 'El título del evento es obligatorio' });
  }
  if (!Dia || !Mes || !year) {
    return res.status(400).json({ error: 'La fecha del evento es obligatoria' });
  }

  const diaNum = parseInt(Dia);
  const mesNum = parseInt(Mes);
  const yearNum = parseInt(year);
  if (isNaN(diaNum) || isNaN(mesNum) || isNaN(yearNum)) {
    return res.status(400).json({ error: 'La fecha contiene valores inválidos' });
  }

  const fechaEvento = new Date(yearNum, mesNum - 1, diaNum);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaEvento.setHours(0, 0, 0, 0);
  if (fechaEvento < hoy) {
    return res.status(400).json({ error: 'No puedes crear eventos en una fecha pasada' });
  }

  if (HoraInicio && HoraFin && HoraFin <= HoraInicio) {
    return res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio' });
  }

  const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `INSERT INTO eventos
    (Titulo, Descripcion, Lugar, HoraInicio, HoraFin, Categoria, Dia, Mes, year, Facultad, Programa, Imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    Titulo, Descripcion || null, Lugar || null, HoraInicio || null, HoraFin || null,
    Categoria || null, diaNum, mesNum, yearNum,
    Facultad || null, Programa || null, imagenUrl
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al insertar evento:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId, imagen: imagenUrl });
  });
};

exports.update = (req, res) => {
  const {
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa
  } = req.body;

  if (!Titulo || !Titulo.trim()) {
    return res.status(400).json({ error: 'El título del evento es obligatorio' });
  }

  if (Dia && Mes && year) {
    const diaNum = parseInt(Dia);
    const mesNum = parseInt(Mes);
    const yearNum = parseInt(year);
    if (!isNaN(diaNum) && !isNaN(mesNum) && !isNaN(yearNum)) {
      if (HoraInicio && HoraFin && HoraFin <= HoraInicio) {
        return res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio' });
      }
    }
  }

  let query, values;

  if (req.file) {
    const imagenUrl = `/uploads/${req.file.filename}`;
    query = `UPDATE eventos SET
      Titulo = ?, Descripcion = ?, Lugar = ?, HoraInicio = ?, HoraFin = ?, Categoria = ?,
      Dia = ?, Mes = ?, year = ?, Facultad = ?, Programa = ?, Imagen = ?
      WHERE Id_Eventos = ?`;
    values = [
      Titulo, Descripcion || null, Lugar || null, HoraInicio || null, HoraFin || null,
      Categoria || null, parseInt(Dia), parseInt(Mes), parseInt(year),
      Facultad || null, Programa || null, imagenUrl, req.params.id
    ];
  } else {
    query = `UPDATE eventos SET
      Titulo = ?, Descripcion = ?, Lugar = ?, HoraInicio = ?, HoraFin = ?, Categoria = ?,
      Dia = ?, Mes = ?, year = ?, Facultad = ?, Programa = ?
      WHERE Id_Eventos = ?`;
    values = [
      Titulo, Descripcion || null, Lugar || null, HoraInicio || null, HoraFin || null,
      Categoria || null, parseInt(Dia), parseInt(Mes), parseInt(year),
      Facultad || null, Programa || null, req.params.id
    ];
  }

  db.query(query, values, (err) => {
    if (err) {
      console.error('Error al actualizar evento:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
};

exports.remove = (req, res) => {
  db.query('DELETE FROM eventos WHERE Id_Eventos = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.apply = (req, res) => {
  const idEvento = parseInt(req.params.id);
  const idUsuario = req.usuario.id;

  if (isNaN(idEvento)) {
    return res.status(400).json({ error: 'ID de evento inválido' });
  }

  db.query('SELECT Cedula FROM estudiante WHERE IdEstudiante = ? AND Activo = 1', [idUsuario], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });

    const cedula = rows[0].Cedula;
    db.query('SELECT Id_Eventos, year, Mes, Dia FROM eventos WHERE Id_Eventos = ?', [idEvento], (err, eventos) => {
      if (err) return res.status(500).json({ error: err.message });
      if (eventos.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });

      const ev = eventos[0];
      const fechaEvento = new Date(ev.year, ev.Mes - 1, ev.Dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaEvento.setHours(0, 0, 0, 0);
      if (fechaEvento < hoy) {
        return res.status(400).json({ error: 'No puedes aplicar a un evento que ya pasó' });
      }

      db.query(
        'SELECT IdInscripcion FROM evento_estudiante WHERE IdEvento = ? AND Cedula = ?',
        [idEvento, cedula],
        (err, inscripciones) => {
          if (err) return res.status(500).json({ error: err.message });
          if (inscripciones.length > 0) {
            return res.status(409).json({ error: 'Ya estás inscrito en este evento' });
          }
          db.query(
            'INSERT INTO evento_estudiante (IdEvento, Cedula) VALUES (?, ?)',
            [idEvento, cedula],
            (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ success: true, message: 'Inscripción exitosa al evento', id: result.insertId });
            }
          );
        }
      );
    });
  });
};

exports.getInscripciones = (req, res) => {
  const { cedula } = req.params;
  db.query(
    `SELECT e.*, ee.FechaInscripcion, ee.Asistio, ee.IdInscripcion
     FROM evento_estudiante ee
     JOIN eventos e ON ee.IdEvento = e.Id_Eventos
     WHERE ee.Cedula = ?
     ORDER BY e.year DESC, e.Mes DESC, e.Dia DESC`,
    [cedula],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

exports.checkInscrito = (req, res) => {
  const idEvento = parseInt(req.params.id);
  const idUsuario = req.usuario.id;

  db.query('SELECT Cedula FROM estudiante WHERE IdEstudiante = ? AND Activo = 1', [idUsuario], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });

    const cedula = rows[0].Cedula;
    db.query(
      'SELECT IdInscripcion FROM evento_estudiante WHERE IdEvento = ? AND Cedula = ?',
      [idEvento, cedula],
      (err, inscripciones) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ inscrito: inscripciones.length > 0 });
      }
    );
  });
};
