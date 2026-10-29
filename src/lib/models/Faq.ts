import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** `faqs` — preguntas frecuentes mostradas en la landing y usadas por el chatbot. */
const faqSchema = new Schema(
  {
    pregunta: { type: String, required: true, trim: true },
    respuesta: { type: String, required: true, trim: true },
    categoria: { type: String, default: "general", index: true },
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "faqs" },
);

export type FaqDoc = InferSchemaType<typeof faqSchema>;

export const Faq: Model<FaqDoc> =
  (models.Faq as Model<FaqDoc>) ?? model<FaqDoc>("Faq", faqSchema);
