import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * `conversaciones` — chats del `FaqChatbot`.
 * Los mensajes van EMBEBIDOS (patrón 1-few): siempre se leen y escriben juntos.
 */
const mensajeChatSchema = new Schema(
  {
    rol: { type: String, enum: ["usuario", "bot"], required: true },
    texto: { type: String, required: true, trim: true },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversacionSchema = new Schema(
  {
    sesionId: { type: String, required: true, unique: true, trim: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "User" },
    mensajes: { type: [mensajeChatSchema], default: [] },
    tema: { type: String, default: "general" },
    ultimoMensajeEn: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "conversaciones" },
);

export type ConversacionDoc = InferSchemaType<typeof conversacionSchema>;

export const Conversacion: Model<ConversacionDoc> =
  (models.Conversacion as Model<ConversacionDoc>) ??
  model<ConversacionDoc>("Conversacion", conversacionSchema);
