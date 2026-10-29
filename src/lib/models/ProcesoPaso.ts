import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** `proceso_lavado` — pasos del servicio mostrados en la sección de proceso. */
const procesoPasoSchema = new Schema(
  {
    paso: { type: Number, required: true, unique: true, min: 1 },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
  },
  { timestamps: true, collection: "proceso_lavado" },
);

export type ProcesoPasoDoc = InferSchemaType<typeof procesoPasoSchema>;

export const ProcesoPaso: Model<ProcesoPasoDoc> =
  (models.ProcesoPaso as Model<ProcesoPasoDoc>) ??
  model<ProcesoPasoDoc>("ProcesoPaso", procesoPasoSchema);
