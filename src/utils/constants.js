const ROLES = { ESTUDIANTE: 1, TRABAJADOR_SOCIAL: 2 };

const ROL_LABELS = { [ROLES.ESTUDIANTE]: 'estudiante', [ROLES.TRABAJADOR_SOCIAL]: 'trabajadora' };

const ESTADOS_SOLICITUD = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
};

const PRIORIDADES = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
};

const PRIORIDADES_LIST = [PRIORIDADES.BAJA, PRIORIDADES.MEDIA, PRIORIDADES.ALTA];

const TIPO_NOTIFICACION = {
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  INFO: 'info',
};

const CATEGORIAS_EVENTO = [
  'Programa de Salud',
  'Promoción Social',
  'Deportivo',
  'Académico',
  'Feria',
];

const GENEROS = {
  FEMENINO: 1,
  MASCULINO: 2,
  OTRO: 3,
};

const ACCIONES_AUDITORIA = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTRO: 'registro',
};

module.exports = {
  ROLES,
  ROL_LABELS,
  ESTADOS_SOLICITUD,
  PRIORIDADES,
  PRIORIDADES_LIST,
  TIPO_NOTIFICACION,
  CATEGORIAS_EVENTO,
  GENEROS,
  ACCIONES_AUDITORIA,
};
