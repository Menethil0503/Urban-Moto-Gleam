import { formatoFechaISO, type EstadoReserva } from "./reservas";

/** Representación plana de una reserva para enviar al cliente por JSON. */
export type ReservaJSON = {
  id: string;
  codigo: string;
  nombre: string;
  cedula: string;
  celular: string;
  email: string;
  placa: string;
  marca: string;
  modelo: string;
  servicio: string;
  fecha: string; // YYYY-MM-DD
  hora: string;
  observaciones: string;
  estado: EstadoReserva;
  whatsappEnviado: boolean;
  creadaEn: string;
};

type ReservaOrigen = {
  _id: { toString(): string };
  codigo: string;
  nombre: string;
  cedula: string;
  celular: string;
  email?: string | null;
  placa: string;
  marca: string;
  modelo: string;
  servicio: string;
  fecha: Date;
  hora: string;
  observaciones?: string | null;
  estado: string;
  whatsappEnviado?: boolean | null;
  createdAt?: Date | null;
};

/** Convierte un documento de Mongoose (o un objeto `lean`) a `ReservaJSON`. */
export function serializarReserva(reserva: ReservaOrigen): ReservaJSON {
  return {
    id: reserva._id.toString(),
    codigo: reserva.codigo,
    nombre: reserva.nombre,
    cedula: reserva.cedula,
    celular: reserva.celular,
    email: reserva.email ?? "",
    placa: reserva.placa,
    marca: reserva.marca,
    modelo: reserva.modelo,
    servicio: reserva.servicio,
    fecha: formatoFechaISO(reserva.fecha),
    hora: reserva.hora,
    observaciones: reserva.observaciones ?? "",
    estado: reserva.estado as EstadoReserva,
    whatsappEnviado: Boolean(reserva.whatsappEnviado),
    creadaEn: (reserva.createdAt ?? new Date()).toISOString(),
  };
}
