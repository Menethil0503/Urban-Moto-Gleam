import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { Reserva } from "@/src/lib/models/Reserva";
import { Trabajador } from "@/src/lib/models/Trabajador";
import {
  HORAS_DISPONIBLES,
  formatoFechaISO,
  parseFechaISO,
  rangoMes,
} from "@/src/lib/reservas";

export const dynamic = "force-dynamic";

/**
 * GET /api/disponibilidad?mes=YYYY-MM&fecha=YYYY-MM-DD
 *
 * Devuelve la ocupación real de la agenda:
 * - `conteoPorDia`: reservas activas por cada día del mes.
 * - `diasCompletos`: días sin cupos disponibles (para deshabilitar en el calendario).
 * - `horasOcupadas`: bloques tomados del día consultado.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");
  const fechaParam = searchParams.get("fecha");

  const conteoPorDia: Record<string, number> = {};
  const diasCompletos: string[] = [];
  let horasOcupadas: string[] = [];
  let trabajadoresActivos = 0;

  try {
    await connectDB();
    trabajadoresActivos = await Trabajador.countDocuments({ activo: true });

    // ── Ocupación del mes ──────────────────────────────────────
    if (mes) {
      const rango = rangoMes(mes);
      if (!rango) {
        return NextResponse.json({ error: "El parámetro «mes» debe tener el formato YYYY-MM." }, { status: 400 });
      }

      const reservasDelMes = (await Reserva.find(
        { fecha: { $gte: rango.inicio, $lt: rango.fin }, activa: true },
        { fecha: 1 },
      ).lean()) as unknown as { fecha: Date }[];

      for (const reserva of reservasDelMes) {
        const clave = formatoFechaISO(reserva.fecha);
        conteoPorDia[clave] = (conteoPorDia[clave] ?? 0) + 1;
      }

      for (const [clave, total] of Object.entries(conteoPorDia)) {
        if (total >= HORAS_DISPONIBLES.length * trabajadoresActivos) {
          diasCompletos.push(clave);
        }
      }

      if (trabajadoresActivos === 0) {
        const [anio, numeroMes] = mes.split("-").map(Number);
        const cantidadDias = new Date(Date.UTC(anio, numeroMes, 0)).getUTCDate();
        for (let dia = 1; dia <= cantidadDias; dia += 1) {
          const clave = `${mes}-${String(dia).padStart(2, "0")}`;
          if (!diasCompletos.includes(clave)) diasCompletos.push(clave);
        }
      }
    }

    // ── Ocupación de un día concreto ───────────────────────────
    if (fechaParam) {
      const fecha = parseFechaISO(fechaParam);
      if (!fecha) {
        return NextResponse.json({ error: "El parámetro «fecha» debe tener el formato YYYY-MM-DD." }, { status: 400 });
      }

      const reservasDelDia = (await Reserva.find({ fecha, activa: true }, { hora: 1, trabajadorId: 1 }).lean()) as unknown as {
        hora: string;
        trabajadorId?: { toString(): string } | null;
      }[];
      const conteoPorHora = new Map<string, { total: number; asignados: Set<string>; sinAsignar: number }>();
      for (const reserva of reservasDelDia) {
        const conteo = conteoPorHora.get(reserva.hora) ?? { total: 0, asignados: new Set<string>(), sinAsignar: 0 };
        conteo.total += 1;
        if (reserva.trabajadorId) conteo.asignados.add(reserva.trabajadorId.toString());
        else conteo.sinAsignar += 1;
        conteoPorHora.set(reserva.hora, conteo);
      }
      horasOcupadas = HORAS_DISPONIBLES.filter(
        (hora) => {
          const conteo = conteoPorHora.get(hora);
          if (!conteo) return trabajadoresActivos === 0;
          const capacidadLibre = trabajadoresActivos - conteo.asignados.size;
          return conteo.sinAsignar > 0
            ? capacidadLibre <= conteo.sinAsignar
            : conteo.total >= trabajadoresActivos;
        },
      );
    }

    return NextResponse.json({
      horas: HORAS_DISPONIBLES,
      cuposPorDia: HORAS_DISPONIBLES.length * trabajadoresActivos,
      trabajadoresActivos,
      conteoPorDia,
      diasCompletos,
      horasOcupadas,
    });
  } catch (error) {
    console.error("[api/disponibilidad] GET", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disponibilidad. ¿Está MongoDB encendido?" },
      { status: 503 },
    );
  }
}
