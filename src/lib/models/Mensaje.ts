import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** `mensajes` — entradas del formulario de contacto. */
const mensajeSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, trim: true, default: "" },
    mensaje: { type: String, required: true, trim: true },
    leido: { type: Boolean, default: false, index: true },
    atendidoPor: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "mensajes" },
);

export type MensajeDoc = InferSchemaType<typeof mensajeSchema>;

export const Mensaje: Model<MensajeDoc> =
  (models.Mensaje as Model<MensajeDoc>) ?? model<MensajeDoc>("Mensaje", mensajeSchema);
