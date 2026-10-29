/**
 * Constantes y utilidades compartidas entre el cliente y el servidor
 * para todo lo relacionado con las reservas de citas.
 */

/** Horarios de atención (bloques de una hora). Debe coincidir con el <Select> del modal. */
export const HORAS_DISPONIBLES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

export type HoraDisponible = (typeof HORAS_DISPONIBLES)[number];

/** Cupos que ofrece el taller por día (una moto por bloque horario). */
export const CUPOS_POR_DIA = HORAS_DISPONIBLES.length;

export const ESTADOS_RESERVA = [
  "pendiente",
  "confirmada",
  "en_proceso",
  "completada",
  "cancelada",
] as const;

export type EstadoReserva = (typeof ESTADOS_RESERVA)[number];

export const ETIQUETAS_ESTADO: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_proceso: "En proceso",
  completada: "Completada",
  cancelada: "Cancelada",
};

/** Texto "YYYY-MM-DD" -> Date en medianoche UTC (evita corrimientos por zona horaria). */
export function parseFechaISO(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) {
    return null;
  }

  const [, anio, mes, dia] = match;
  const fecha = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));

  // Rechaza fechas inexistentes como 2026-02-31.
  if (fecha.getUTCMonth() !== Number(mes) - 1 || fecha.getUTCDate() !== Number(dia)) {
    return null;
  }

  return fecha;
}

/** Date -> "YYYY-MM-DD" usando siempre UTC. */
export function formatoFechaISO(fecha: Date | string): string {
  const valor = typeof fecha === "string" ? new Date(fecha) : fecha;
  return valor.toISOString().slice(0, 10);
}

/** Date -> "03/10/2026" para mostrar en la interfaz. */
export function formatoFechaHumano(fecha: Date | string): string {
  const valor = typeof fecha === "string" ? new Date(fecha) : fecha;
  const [anio, mes, dia] = formatoFechaISO(valor).split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Rango [inicio, fin) en UTC para un mes "YYYY-MM". */
export function rangoMes(mes: string): { inicio: Date; fin: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(mes.trim());
  if (!match) {
    return null;
  }

  const anio = Number(match[1]);
  const numeroMes = Number(match[2]);
  if (numeroMes < 1 || numeroMes > 12) {
    return null;
  }

  return {
    inicio: new Date(Date.UTC(anio, numeroMes - 1, 1)),
    fin: new Date(Date.UTC(anio, numeroMes, 1)),
  };
}

/** Deja solo dígitos (WhatsApp Cloud API exige formato internacional sin "+"). */
export function normalizarCelular(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Normaliza una placa a mayúsculas y sin espacios. */
export function normalizarTexto(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

/** Normaliza una placa a mayúsculas y sin espacios. */
export function normalizarPlaca(valor: string): string {
  return valor.trim().toUpperCase().replace(/\s+/g, "");
}

/** Genera un código de reserva legible: UMG-4F2K9. */
export function generarCodigoReserva(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let sufijo = "";
  for (let i = 0; i < 5; i += 1) {
    sufijo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `UMG-${sufijo}`;
}
