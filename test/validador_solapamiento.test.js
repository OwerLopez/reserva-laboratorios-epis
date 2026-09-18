'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {
  validarReserva,
  seTraslapan,
  aMinutos,
} = require('../src/reservas/validador_solapamiento');

/** Reservas ya confirmadas en el sistema (datos reales de la EPIS). */
const EXISTENTES = [
  { id: 1, laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '08:00', horaFin: '10:00', estado: 'CONFIRMADA' },
  { id: 2, laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '14:00', horaFin: '16:00', estado: 'CONFIRMADA' },
  { id: 3, laboratorio: 'Lab 102', fecha: '2026-09-28', horaInicio: '08:00', horaFin: '10:00', estado: 'CONFIRMADA' },
  { id: 4, laboratorio: 'Lab 103', fecha: '2026-09-28', horaInicio: '10:00', horaFin: '12:00', estado: 'CANCELADA' },
];

test('aMinutos convierte correctamente', () => {
  assert.strictEqual(aMinutos('00:00'), 0);
  assert.strictEqual(aMinutos('08:30'), 510);
  assert.strictEqual(aMinutos('23:59'), 1439);
});

test('aMinutos rechaza formatos inválidos', () => {
  assert.throws(() => aMinutos('8:00'), TypeError);
  assert.throws(() => aMinutos('25:00'), RangeError);
});

test('seTraslapan usa intervalo semiabierto: turnos contiguos no chocan', () => {
  assert.strictEqual(seTraslapan(480, 600, 600, 720), false); // 08-10 vs 10-12
  assert.strictEqual(seTraslapan(480, 600, 540, 660), true); // 08-10 vs 09-11
});

test('acepta una reserva en franja libre', () => {
  const r = validarReserva(
    { laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '10:00', horaFin: '12:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, true);
  assert.strictEqual(r.conflictos.length, 0);
});

test('rechaza superposición exacta con una reserva confirmada', () => {
  const r = validarReserva(
    { laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '08:00', horaFin: '10:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, false);
  assert.strictEqual(r.conflictos.length, 1);
  assert.strictEqual(r.conflictos[0].id, 1);
});

test('rechaza superposición parcial', () => {
  const r = validarReserva(
    { laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '09:00', horaFin: '11:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, false);
});

test('rechaza una reserva que engloba a otra existente', () => {
  const r = validarReserva(
    { laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '07:00', horaFin: '18:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, false);
  assert.strictEqual(r.conflictos.length, 2); // choca con la de 08-10 y la de 14-16
});

test('no hay conflicto entre laboratorios distintos', () => {
  const r = validarReserva(
    { laboratorio: 'Centro de Computo', fecha: '2026-09-28', horaInicio: '08:00', horaFin: '10:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, true);
});

test('no hay conflicto en fechas distintas', () => {
  const r = validarReserva(
    { laboratorio: 'Lab 101', fecha: '2026-09-29', horaInicio: '08:00', horaFin: '10:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, true);
});

test('una reserva CANCELADA no bloquea la sala', () => {
  const r = validarReserva(
    { laboratorio: 'Lab 103', fecha: '2026-09-28', horaInicio: '10:00', horaFin: '12:00' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, true);
});

test('editar una reserva no choca consigo misma', () => {
  const r = validarReserva(
    { id: 1, laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '08:00', horaFin: '09:30' },
    EXISTENTES
  );
  assert.strictEqual(r.valida, true);
});

test('rechaza una franja con fin anterior al inicio', () => {
  assert.throws(
    () =>
      validarReserva(
        { laboratorio: 'Lab 101', fecha: '2026-09-28', horaInicio: '16:00', horaFin: '14:00' },
        EXISTENTES
      ),
    RangeError
  );
});
