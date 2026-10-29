import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** `paquetes` — servicios y precios del taller. */
const paqueteSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    // Se guarda como número para poder filtrar/ordenar por precio.
    precio: { type: Number, default: 0, min: 0 },
    moneda: { type: String, default: "COP" },
    // Texto adicional del precio, ej. "/ mes" en la suscripción.
    notaPrecio: { type: String, default: "" },
    duracion: { type: String, default: "" },
    categoria: { type: String, default: "lavado", index: true },
    caracteristicas: { type: [String], default: [] },
    icono: { type: String, default: "" },
    // Conserva el orden en que se muestran en la landing.
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "paquetes" },
);

export type PaqueteDoc = InferSchemaType<typeof paqueteSchema>;

export const Paquete: Model<PaqueteDoc> =
  (models.Paquete as Model<PaqueteDoc>) ?? model<PaqueteDoc>("Paquete", paqueteSchema);
