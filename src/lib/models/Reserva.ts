import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ESTADOS_RESERVA } from "../reservas";

/**
 * `reservas` — colección transaccional principal.
 *
 * El proyecto no tiene login, así que los datos del cliente se denormalizan
 * (nombre, cédula, celular) en lugar de referenciar `users`. El campo `paqueteId`
 * sí apunta a la colección `paquetes` cuando el servicio existe en catálogo.
 */
const reservaSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true, uppercase: true },

    // ── Datos del cliente ─────────────────────────────────────
    nombre: { type: String, required: true, trim: true },
    cedula: { type: String, required: true, trim: true },
    celular: { type: String, required: true, trim: true }, // formato internacional, solo dígitos
    email: { type: String, trim: true, lowercase: true, default: "" },

    // ── Datos de la moto ──────────────────────────────────────
    placa: { type: String, required: true, trim: true, uppercase: true, index: true },
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },

    // ── Cita ──────────────────────────────────────────────────
    servicio: { type: String, required: true, trim: true },
    paqueteId: { type: Schema.Types.ObjectId, ref: "Paquete" },
    fecha: { type: Date, required: true, index: true }, // medianoche UTC del día reservado
    hora: { type: String, required: true, trim: true }, // "08:00"
    trabajadorId: { type: Schema.Types.ObjectId, ref: "Trabajador" },
    trabajadorNombre: { type: String, trim: true, default: "" },

    observaciones: { type: String, trim: true, default: "" },

    estado: { type: String, enum: ESTADOS_RESERVA, default: "pendiente", index: true },
    // `activa` es un campo técnico que permite el índice único parcial del bloque horario:
    // solo se bloquea el cupo mientras la reserva no esté cancelada.
    activa: { type: Boolean, default: true },

    // ── Notificación por WhatsApp ─────────────────────────────
    whatsappEnviado: { type: Boolean, default: false },
    whatsappError: { type: String, default: "" },
  },
  { timestamps: true, collection: "reservas" },
);

// Cada trabajador puede atender una sola moto por bloque horario.
reservaSchema.index(
  { fecha: 1, hora: 1, trabajadorId: 1 },
  {
    unique: true,
    partialFilterExpression: { activa: true, trabajadorId: { $exists: true } },
    name: "cupo_trabajador_activo",
  },
);

// Consultas frecuentes del panel de administración.
reservaSchema.index({ estado: 1, fecha: 1 });
reservaSchema.index({ createdAt: -1 });

reservaSchema.pre("save", function syncActiva() {
  this.activa = this.estado !== "cancelada";
});

export type ReservaDoc = InferSchemaType<typeof reservaSchema>;

export const Reserva: Model<ReservaDoc> =
  (models.Reserva as Model<ReservaDoc>) ?? model<ReservaDoc>("Reserva", reservaSchema);
