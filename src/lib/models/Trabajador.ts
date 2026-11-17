import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const trabajadorSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 80 },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "trabajadores" },
);

export type TrabajadorDoc = InferSchemaType<typeof trabajadorSchema>;

export const Trabajador: Model<TrabajadorDoc> =
  (models.Trabajador as Model<TrabajadorDoc>) ?? model<TrabajadorDoc>("Trabajador", trabajadorSchema);