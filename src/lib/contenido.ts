import data from "@/data.json";
import type { LandingData } from "@/src/components/sections/types";
import { connectDB } from "./mongodb";
import { Company } from "./models/Company";
import { Faq } from "./models/Faq";
import { Paquete } from "./models/Paquete";
import { ProcesoPaso } from "./models/ProcesoPaso";
import { Testimonio } from "./models/Testimonio";

/**
 * Contenido de respaldo: si MongoDB no está disponible o aún no se ha sembrado,
 * la landing se sigue mostrando con `data.json` en lugar de romperse.
 */
const RESPALDO = data as unknown as LandingData;

function formatearPrecio(moneda: string, precio: number, nota: string): string {
  const base = `${moneda} $${precio.toLocaleString("es-CO")}`;
  return nota ? `${base} ${nota}` : base;
}

/**
 * Lee el contenido de la landing desde MongoDB (colecciones `company`,
 * `paquetes`, `faqs`, `proceso_lavado`, `testimonios`) y lo adapta al
 * contrato `LandingData` que consume el frontend.
 */
export async function obtenerContenido(): Promise<LandingData> {
  try {
    await connectDB();

    const [company, paquetes, faqs, proceso, testimonios] = await Promise.all([
      Company.findOne().lean(),
      Paquete.find({ activo: true }).sort({ orden: 1 }).lean(),
      Faq.find({ activo: true }).sort({ orden: 1 }).lean(),
      ProcesoPaso.find().sort({ paso: 1 }).lean(),
      Testimonio.find({ aprobado: true }).sort({ createdAt: 1 }).lean(),
    ]);

    // Sin contenido sembrado todavía: usamos el respaldo.
    if (!company || paquetes.length === 0) {
      return RESPALDO;
    }

    return {
      company: {
        name: company.nombre,
        slogan: company.slogan,
        description: company.descripcion,
        mission: company.mision,
        vision: company.vision,
        certifications: company.certificaciones ?? [],
        location: company.ubicacion,
        whatsapp: company.whatsapp,
        email: company.email,
        phone: company.telefono,
        hours: company.horario,
        social: (company.redesSociales ?? []).map((red) => ({ name: red.nombre, url: red.url })),
      },
      packages: paquetes.map((paquete) => ({
        title: paquete.titulo,
        description: paquete.descripcion,
        price: formatearPrecio(paquete.moneda, paquete.precio, paquete.notaPrecio ?? ""),
        duration: paquete.duracion,
        features: paquete.caracteristicas ?? [],
        icon: paquete.icono,
      })),
      benefits: company.beneficios ?? [],
      processSteps: proceso.map((paso) => ({
        step: paso.paso,
        title: paso.titulo,
        desc: paso.descripcion,
      })),
      testimonials: testimonios.map((testimonio) => ({
        name: testimonio.nombre,
        text: testimonio.texto,
        rating: testimonio.rating,
      })),
      faq: faqs.map((faq) => ({ question: faq.pregunta, answer: faq.respuesta })),
      gallery: company.imagenes?.galeria ?? [],
      images: {
        hero: company.imagenes?.hero ?? RESPALDO.images.hero,
        beforeAfter: {
          before: company.imagenes?.beforeAfter?.before ?? RESPALDO.images.beforeAfter.before,
          after: company.imagenes?.beforeAfter?.after ?? RESPALDO.images.beforeAfter.after,
        },
        gallery: company.imagenes?.galeria ?? RESPALDO.images.gallery,
      },
    };
  } catch (error) {
    console.error("[contenido] No se pudo leer MongoDB, se usa data.json:", error);
    return RESPALDO;
  }
}
