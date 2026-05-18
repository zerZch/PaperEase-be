const {
  ROLES, ROL_LABELS, ESTADOS_SOLICITUD, PRIORIDADES,
  PRIORIDADES_LIST, TIPO_NOTIFICACION, CATEGORIAS_EVENTO, GENEROS, ACCIONES_AUDITORIA
} = require('../../src/utils/constants');

describe('constants', () => {
  describe('ROLES', () => {
    it('debe tener ESTUDIANTE = 1 y TRABAJADOR_SOCIAL = 2', () => {
      expect(ROLES.ESTUDIANTE).toBe(1);
      expect(ROLES.TRABAJADOR_SOCIAL).toBe(2);
    });
  });

  describe('ROL_LABELS', () => {
    it('debe mapear IDs a strings', () => {
      expect(ROL_LABELS[ROLES.ESTUDIANTE]).toBe('estudiante');
      expect(ROL_LABELS[ROLES.TRABAJADOR_SOCIAL]).toBe('trabajadora');
    });
  });

  describe('ESTADOS_SOLICITUD', () => {
    it('debe tener los 3 estados', () => {
      expect(ESTADOS_SOLICITUD.PENDIENTE).toBe('pendiente');
      expect(ESTADOS_SOLICITUD.APROBADA).toBe('aprobada');
      expect(ESTADOS_SOLICITUD.RECHAZADA).toBe('rechazada');
    });
  });

  describe('PRIORIDADES', () => {
    it('debe tener lista y valores', () => {
      expect(PRIORIDADES.BAJA).toBe('baja');
      expect(PRIORIDADES.MEDIA).toBe('media');
      expect(PRIORIDADES.ALTA).toBe('alta');
      expect(PRIORIDADES_LIST).toEqual(['baja', 'media', 'alta']);
    });
  });

  describe('TIPO_NOTIFICACION', () => {
    it('debe tener los tipos definidos', () => {
      expect(TIPO_NOTIFICACION.APROBADA).toBe('aprobada');
      expect(TIPO_NOTIFICACION.RECHAZADA).toBe('rechazada');
      expect(TIPO_NOTIFICACION.INFO).toBe('info');
    });
  });

  describe('CATEGORIAS_EVENTO', () => {
    it('debe tener 5 categorías', () => {
      expect(CATEGORIAS_EVENTO).toHaveLength(5);
    });
  });

  describe('ACCIONES_AUDITORIA', () => {
    it('debe tener login, logout y registro', () => {
      expect(ACCIONES_AUDITORIA.LOGIN).toBe('login');
      expect(ACCIONES_AUDITORIA.LOGOUT).toBe('logout');
      expect(ACCIONES_AUDITORIA.REGISTRO).toBe('registro');
    });
  });
});
