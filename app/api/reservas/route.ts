import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { Reserva } from "@/src/lib/models/Reserva";
import { Trabajador } from "@/src/lib/models/Trabajador";
import { exigirSesion } from "@/src/lib/auth-servidor";
import {
  HORAS_DISPONIBLES,
  generarCodigoReserva,
  normalizarCelular,
  normalizarPlaca,
  normalizarTexto,
  parseFechaISO,
} from "@/src/lib/reservas";
import { serializarReserva } from "@/src/lib/reservas-json";
import { enviarWhatsAppReserva } from "@/src/lib/whatsapp";

export const dynamic = "force-dynamic";

type CuerpoReserva = {
  nombre?: string;
  cedula?: string;
  celular?: string;
  email?: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  servicio?: string;
  fecha?: string;
  hora?: string;
  observaciones?: string;
};

type DatosCreacionReserva = {
  nombre: string;
  cedula: string;
  celular: string;
  email: string;
  placa: string;
  marca: string;
  modelo: string;
  servicio: string;
  fecha: Date;
  hora: string;
  observaciones: string;
};

let indiceCuposPreparado: Promise<void> | null = null;

async function prepararIndiceCupos() {
  indiceCuposPreparado ??= (async () => {
    try {
      await Reserva.collection.dropIndex("cupo_unico_activo");
    } catch (error) {
      const codigo = (error as { code?: number }).code;
      if (codigo !== 27 && codigo !== 26) throw error;
    }
    await Reserva.collection.createIndex(
      { fecha: 1, hora: 1, trabajadorId: 1 },
      {
        unique: true,
        partialFilterExpression: { activa: true, trabajadorId: { $exists: true } },
        name: "cupo_trabajador_activo",
      },
    );
  })();
  await indiceCuposPreparado;
}

async function buscarTrabajadorDisponible(fecha: Date, hora: string) {
  const trabajadores = await Trabajador.find({ activo: true }).sort({ createdAt: 1 }).lean();
  if (trabajadores.length === 0) return null;

  const reservas = await Reserva.find({ fecha, hora, activa: true }, { trabajadorId: 1 }).lean();
  const asignados = new Set(reservas.map((reserva) => reserva.trabajadorId?.toString()).filter(Boolean));
  const reservasSinAsignar = reservas.filter((reserva) => !reserva.trabajadorId).length;
  const libres = trabajadores.filter((trabajador) => !asignados.has(trabajador._id.toString()));
  const trabajador = libres.length > reservasSinAsignar ? libres[reservasSinAsignar] : null;

  return trabajador
    ? { id: trabajador._id, nombre: trabajador.nombre }
    : null;
}

/**
 * Crea la reserva generando un código único. Reintenta si el código aleatorio
 * colisiona y distingue el caso en que el cupo fue tomado en paralelo.
 */
async function crearReservaConCodigoUnico(datos: DatosCreacionReserva) {
  for (let intento = 0; intento < 10; intento += 1) {
    const trabajador = await buscarTrabajadorDisponible(datos.fecha, datos.hora);
    if (!trabajador) return { reserva: null, cupoTomado: true };

    try {
      const reserva = await Reserva.create({
        ...datos,
        trabajadorId: trabajador.id,
        trabajadorNombre: trabajador.nombre,
        codigo: generarCodigoReserva(),
        estado: "pendiente",
        activa: true,
      });

      return { reserva, cupoTomado: false };
    } catch (error) {
      // 11000 = clave duplicada: código repetido o cupo ya tomado en carrera.
      if ((error as { code?: number }).code !== 11000) {
        throw error;
      }

    }
  }

  return { reserva: null, cupoTomado: true };
}

/** GET /api/reservas — listado para el panel de administración. */
export async function GET(request: Request) {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  try {
    await connectDB();
    await prepararIndiceCupos();

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const busqueda = searchParams.get("q")?.trim();
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const filtro: Record<string, unknown> = {};
    if (estado && estado !== "todas") {
      filtro.estado = estado;
    }

    // Rango por día de la cita (inclusive en ambos extremos).
    const rangoFecha: Record<string, Date> = {};
    const fechaDesde = desde ? parseFechaISO(desde) : null;
    const fechaHasta = hasta ? parseFechaISO(hasta) : null;

    if (fechaDesde || fechaHasta) {
      if (fechaDesde) rangoFecha.$gte = fechaDesde;
      if (fechaHasta) rangoFecha.$lte = fechaHasta;
      filtro.fecha = rangoFecha;
    }

    if (busqueda) {
      const patron = new RegExp(busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filtro.$or = [
        { codigo: patron },
        { nombre: patron },
        { placa: patron },
        { cedula: patron },
        { celular: patron },
      ];
    }

    const reservas = await Reserva.find(filtro).sort({ fecha: 1, hora: 1, createdAt: -1 }).limit(500).lean();

    return NextResponse.json({ total: reservas.length, reservas: reservas.map(serializarReserva) });
  } catch (error) {
    console.error("[api/reservas] GET", error);
    return NextResponse.json(
      { error: "No se pudieron consultar las reservas. ¿Está MongoDB encendido?" },
      { status: 503 },
    );
  }
}

/** POST /api/reservas — crea una reserva y notifica por WhatsApp. */
export async function POST(request: Request) {
  let cuerpo: CuerpoReserva;

  try {
    cuerpo = (await request.json()) as CuerpoReserva;
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  // ── Normalización ────────────────────────────────────────────
  const nombre = normalizarTexto(cuerpo.nombre ?? "");
  const cedula = normalizarCelular(cuerpo.cedula ?? "");
  const celular = normalizarCelular(cuerpo.celular ?? "");
  const email = (cuerpo.email ?? "").trim().toLowerCase();
  const placa = normalizarPlaca(cuerpo.placa ?? "");
  const marca = normalizarTexto(cuerpo.marca ?? "");
  const modelo = normalizarTexto(cuerpo.modelo ?? "");
  const servicio = normalizarTexto(cuerpo.servicio ?? "");
  const hora = (cuerpo.hora ?? "").trim();
  const observaciones = (cuerpo.observaciones ?? "").trim();

  // ── Validación ───────────────────────────────────────────────
  const errores: string[] = [];
  if (nombre.length < 3) errores.push("El nombre es obligatorio.");
  // La cédula se limita por arriba (10 dígitos); las cédulas antiguas pueden tener menos.
  if (!cedula) {
    errores.push("La cédula es obligatoria.");
  } else if (cedula.length > 10) {
    errores.push(`La cédula admite máximo 10 dígitos y llegaron ${cedula.length}.`);
  }
  if (celular.length < 7) errores.push("El celular es obligatorio (incluye el indicativo, ej. 57...).");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.push("El correo no es válido.");
  if (placa.length < 5) errores.push("La placa es obligatoria.");
  if (!marca) errores.push("La marca es obligatoria.");
  if (!modelo) errores.push("El modelo es obligatorio.");
  if (!servicio) errores.push("Debes seleccionar un servicio.");
  if (!(HORAS_DISPONIBLES as readonly string[]).includes(hora)) errores.push("La hora seleccionada no es válida.");

  const fecha = parseFechaISO(cuerpo.fecha ?? "");
  if (!fecha) {
    errores.push("La fecha no es válida.");
  } else {
    const hoy = new Date();
    const medianocheHoy = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
    if (fecha < medianocheHoy) {
      errores.push("No se pueden reservar fechas pasadas.");
    }
  }

  if (errores.length > 0 || !fecha) {
    return NextResponse.json({ error: errores.join(" "), errores }, { status: 400 });
  }

  try {
    await connectDB();
    await prepararIndiceCupos();

    // ── Capacidad por trabajador en tiempo real ────────────────
    const capacidad = await Trabajador.countDocuments({ activo: true });
    if (capacidad === 0) {
      return NextResponse.json(
        { error: "El taller aún no tiene trabajadores activos para recibir reservas." },
        { status: 503 },
      );
    }

    // ── Creación (reintenta si el código aleatorio colisiona) ──
    const { reserva, cupoTomado } = await crearReservaConCodigoUnico({
      nombre,
      cedula,
      celular,
      email,
      placa,
      marca,
      modelo,
      servicio,
      fecha,
      hora,
      observaciones,
    });

    if (cupoTomado) {
      return NextResponse.json(
        { error: "Ese horario acaba de ser reservado. Elige otro, por favor." },
        { status: 409 },
      );
    }

    if (!reserva) {
      return NextResponse.json({ error: "No se pudo generar un código de reserva único." }, { status: 500 });
    }

    // ── Notificación al cliente por WhatsApp Web ───────────────
    const whatsapp = await enviarWhatsAppReserva({
      codigo: reserva.codigo,
      nombre: reserva.nombre,
      cedula: reserva.cedula,
      celular: reserva.celular,
      placa: reserva.placa,
      marca: reserva.marca,
      modelo: reserva.modelo,
      servicio: reserva.servicio,
      fecha: reserva.fecha,
      hora: reserva.hora,
      observaciones: reserva.observaciones,
    });

    reserva.whatsappEnviado = whatsapp.enviado;
    reserva.whatsappError = whatsapp.error ?? "";
    await reserva.save();

    return NextResponse.json(
      {
        mensaje: "Reserva creada correctamente.",
        reserva: serializarReserva(reserva),
        whatsapp,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/reservas] POST", error);
    return NextResponse.json(
      { error: "No se pudo guardar la reserva. ¿Está MongoDB encendido?" },
      { status: 503 },
    );
  }
}
