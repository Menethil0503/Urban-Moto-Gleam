import data from "@/data.json";
import { connectDB } from "./mongodb";
import { Company } from "./models/Company";
import { Faq } from "./models/Faq";
import { Paquete } from "./models/Paquete";
import { ProcesoPaso } from "./models/ProcesoPaso";
import { Testimonio } from "./models/Testimonio";

export type ResultadoSeed = {
  company: number;
  paquetes: number;
  faqs: number;
  proceso: number;
  testimonios: number;
};

/** "COP $55.000" -> 55000 · "COP $320.000 / mes" -> 320000 */
function parsearPrecio(valor: string): number {
  const soloDigitos = valor.replace(/[^\d]/g, "");
  return soloDigitos ? Number(soloDigitos) : 0;
}

/** "COP $320.000 / mes" -> "/ mes" · "COP $55.000" -> "" */
function extraerNotaPrecio(valor: string): string {
  const coincidencia = /\d[\d.,]*\s*(.*)$/.exec(valor);
  return coincidencia ? coincidencia[1].trim() : "";
}

function inferirCategoria(titulo: string): string {
  const texto = titulo.toLowerCase();
  if (texto.includes("suscrip")) return "suscripcion";
  if (texto.includes("motor")) return "motor";
  if (texto.includes("detailing")) return "detailing";
  return "lavado";
}

/**
 * Carga el contenido de `data.json` en las colecciones de MongoDB.
 * Es idempotente: se puede ejecutar varias veces sin duplicar documentos.
 */
export async function sembrarContenido(): Promise<ResultadoSeed> {
  await connectDB();

  // ── company (config singleton) ────────────────────────────────
  await Company.findOneAndUpdate(
    {},
    {
      nombre: data.company.name,
      slogan: data.company.slogan,
      descripcion: data.company.description,
      mision: data.company.mission,
      vision: data.company.vision,
      certificaciones: data.company.certifications,
      ubicacion: data.company.location,
      whatsapp: data.company.whatsapp,
      email: data.company.email,
      telefono: data.company.phone,
      horario: data.company.hours,
      redesSociales: data.company.social.map((red) => ({ nombre: red.name, url: red.url })),
      beneficios: data.benefits,
      imagenes: {
        hero: data.images.hero,
        beforeAfter: { before: data.images.beforeAfter.before, after: data.images.beforeAfter.after },
        galeria: data.images.gallery,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // ── paquetes ──────────────────────────────────────────────────
  for (const [indice, paquete] of data.packages.entries()) {
    await Paquete.findOneAndUpdate(
      { titulo: paquete.title },
      {
        titulo: paquete.title,
        descripcion: paquete.description,
        precio: parsearPrecio(paquete.price),
        moneda: "COP",
        notaPrecio: extraerNotaPrecio(paquete.price),
        duracion: paquete.duration,
        categoria: inferirCategoria(paquete.title),
        caracteristicas: paquete.features,
        icono: paquete.icon,
        orden: indice,
        activo: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // ── faqs ──────────────────────────────────────────────────────
  for (const [indice, faq] of data.faq.entries()) {
    await Faq.findOneAndUpdate(
      { pregunta: faq.question },
      { pregunta: faq.question, respuesta: faq.answer, orden: indice, activo: true },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // ── proceso_lavado ────────────────────────────────────────────
  for (const paso of data.processSteps) {
    await ProcesoPaso.findOneAndUpdate(
      { paso: paso.step },
      { paso: paso.step, titulo: paso.title, descripcion: paso.desc },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // ── testimonios ───────────────────────────────────────────────
  for (const testimonio of data.testimonials) {
    await Testimonio.findOneAndUpdate(
      { nombre: testimonio.name, texto: testimonio.text },
      { nombre: testimonio.name, texto: testimonio.text, rating: testimonio.rating, aprobado: true },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  return {
    company: await Company.countDocuments(),
    paquetes: await Paquete.countDocuments(),
    faqs: await Faq.countDocuments(),
    proceso: await ProcesoPaso.countDocuments(),
    testimonios: await Testimonio.countDocuments(),
  };
}
