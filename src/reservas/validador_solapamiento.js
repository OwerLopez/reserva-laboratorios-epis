'use strict';

/**
 * Validador del criterio de aceptación del proyecto «Reserva de Laboratorios».
 *
 * Criterio (OpenProject WP #50 — "Registro de reserva con validación de solapamiento"):
 *   Una reserva válida no debe superponerse con otra reserva confirmada
 *   del mismo laboratorio en el mismo horario.
 *
 * Trazabilidad: OP#50 — proyecto `reserva-laboratorios`.
 */

/** Estados que ocupan efectivamente la sala. */
const ESTADOS_QUE_OCUPAN = Object.freeze(['CONFIRMADA']);

/**
 * Convierte "HH:MM" a minutos desde medianoche.
 * @param {string} hhmm
 * @returns {number}
 */
function aMinutos(hhmm) {
  if (typeof hhmm !== 'string' || !/^\d{2}:\d{2}$/.test(hhmm)) {
    throw new TypeError(`Hora inválida: ${hhmm}. Formato esperado HH:MM.`);
  }
  const [h, m] = hhmm.split(':').map(Number);
  if (h > 23 || m > 59) {
    throw new RangeError(`Hora fuera de rango: ${hhmm}.`);
  }
  return h * 60 + m;
}

/**
 * Valida la coherencia interna de una reserva.
 * @param {object} r
 */
function validarFranja(r) {
  const inicio = aMinutos(r.horaInicio);
  const fin = aMinutos(r.horaFin);
  if (fin <= inicio) {
    throw new RangeError(
      `La hora de fin (${r.horaFin}) debe ser posterior a la de inicio (${r.horaInicio}).`
    );
  }
  return { inicio, fin };
}

/**
 * Determina si dos franjas horarias se traslapan.
 *
 * Se usa intervalo semiabierto [inicio, fin): dos bloques contiguos —uno que
 * termina 10:00 y otro que empieza 10:00— NO se consideran solapados, que es
 * el comportamiento esperado para turnos consecutivos de laboratorio.
 *
 * @returns {boolean}
 */
function seTraslapan(aIni, aFin, bIni, bFin) {
  return aIni < bFin && bIni < aFin;
}

/**
 * Comprueba si una reserva solicitada choca con las reservas ya existentes.
 *
 * @param {object} solicitada           Reserva a registrar.
 * @param {string} solicitada.laboratorio
 * @param {string} solicitada.fecha     YYYY-MM-DD
 * @param {string} solicitada.horaInicio HH:MM
 * @param {string} solicitada.horaFin    HH:MM
 * @param {Array<object>} existentes    Reservas ya registradas.
 * @returns {{valida: boolean, conflictos: Array<object>, motivo: string}}
 */
function validarReserva(solicitada, existentes = []) {
  const { inicio, fin } = validarFranja(solicitada);

  const conflictos = existentes.filter((r) => {
    if (r.laboratorio !== solicitada.laboratorio) return false;
    if (r.fecha !== solicitada.fecha) return false;
    if (!ESTADOS_QUE_OCUPAN.includes(r.estado)) return false;
    if (r.id !== undefined && r.id === solicitada.id) return false; // edición de sí misma

    const { inicio: rIni, fin: rFin } = validarFranja(r);
    return seTraslapan(inicio, fin, rIni, rFin);
  });

  return {
    valida: conflictos.length === 0,
    conflictos,
    motivo:
      conflictos.length === 0
        ? 'La franja solicitada está libre.'
        : `El laboratorio ${solicitada.laboratorio} ya tiene ${conflictos.length} ` +
          `reserva(s) confirmada(s) que se superponen con ${solicitada.horaInicio}-${solicitada.horaFin}.`,
  };
}

module.exports = {
  validarReserva,
  seTraslapan,
  aMinutos,
  ESTADOS_QUE_OCUPAN,
};
