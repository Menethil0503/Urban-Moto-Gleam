import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const redSocialSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const imagenesSchema = new Schema(
  {
    hero: { type: String, default: "" },
    beforeAfter: {
      before: { type: String, default: "" },
      after: { type: String, default: "" },
    },
    galeria: { type: [String], default: [] },
  },
  { _id: false },
);

/**
 * `company` — documento único (patrón config singleton) con la información
 * institucional. Incluye beneficios e imágenes porque son contenido estático
 * que siempre se lee junto con la configuración.
 */
const companySchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    slogan: { type: String, default: "" },
    descripcion: { type: String, default: "" },
    mision: { type: String, default: "" },
    vision: { type: String, default: "" },
    certificaciones: { type: [String], default: [] },
    ubicacion: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    telefono: { type: String, default: "" },
    horario: { type: String, default: "" },
    redesSociales: { type: [redSocialSchema], default: [] },
    beneficios: { type: [String], default: [] },
    imagenes: { type: imagenesSchema, default: () => ({}) },
  },
  { timestamps: true, collection: "company" },
);

export type CompanyDoc = InferSchemaType<typeof companySchema>;

export const Company: Model<CompanyDoc> =
  (models.Company as Model<CompanyDoc>) ?? model<CompanyDoc>("Company", companySchema);
