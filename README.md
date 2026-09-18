# Reserva de Laboratorios — EPIS UNSA

Prototipo del sistema web de reserva de laboratorios de cómputo de la Escuela Profesional
de Ingeniería de Sistemas de la Universidad Nacional de San Agustín.

Este repositorio implementa el producto planificado en OpenProject para el **Laboratorio 03
del curso Gestión de Proyectos de Software** (Gestión de la Integración, PMBOK).

## Contexto del proyecto

Actualmente las solicitudes de laboratorio se coordinan por mensajería y hojas de cálculo,
lo que genera cruces de horario y desconocimiento de la disponibilidad real de las salas.

**Objetivo:** disponer de un prototipo funcional que permita consultar disponibilidad,
registrar una reserva y visualizar las reservas existentes.

**Criterio de aceptación:** una reserva válida no debe superponerse con otra reserva
confirmada del mismo laboratorio en el mismo horario.

## Entregables planificados

| ID | Entregable | Duración | Predecesora |
|----|------------|----------|-------------|
| E1 | Requisitos priorizados | 2 días | — |
| E2 | Diseño de interfaz | 2 días | E1 |
| E3 | Módulo de disponibilidad | 2 días | E2 |
| E4 | Módulo de reservas | 2 días | E3 |
| E5 | Pruebas y acta de cierre | 2 días | E4 |

Línea base: **10 días hábiles** (21/09/2026 – 02/10/2026).

## Trazabilidad con OpenProject

| OpenProject | GitHub |
|---|---|
| Proyecto `reserva-laboratorios` | Este repositorio |
| Work Package | Rama `feature/OP-<id>-<descripcion>` |
| Work Package | Pull Request que referencia su URL |
| Estado / Actividad | Estado del PR |

**Convención de commits:** `OP#<id> <mensaje>`

## Estructura

```
src/reservas/validador_solapamiento.js   Regla de negocio del criterio de aceptación
test/validador_solapamiento.test.js      Pruebas unitarias
.github/workflows/ci.yml                 Integración continua
```

## Ejecutar las pruebas

```bash
npm test
```

---

**Autor:** Lopez Arela, Ower Frank — CUI 20222083
**Escuela:** Ingeniería de Sistemas, UNSA — VIII ciclo
**Curso:** Gestión de Proyectos de Software
