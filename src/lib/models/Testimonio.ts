import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * `testimonios` — opiniones de clientes.
 * `usuarioId` queda opcional: el sitio no tiene login, así que el nombre se
 * denormaliza para poder mostrar la opinión sin depender de una cuenta.
 */
const testimonioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    texto: { type: String, required: true, trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    aprobado: { type: Boolean, default: false, index: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "testimonios" },
);

export type TestimonioDoc = InferSchemaType<typeof testimonioSchema>;

export const Testimonio: Model<TestimonioDoc> =
  (models.Testimonio as Model<TestimonioDoc>) ??
  model<TestimonioDoc>("Testimonio", testimonioSchema);
