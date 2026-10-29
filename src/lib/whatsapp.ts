import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { formatoFechaHumano, normalizarCelular } from "./reservas";

export type DatosReservaWhatsApp = {
  codigo: string;
  nombre: string;
  cedula: string;
  celular: string;
  placa: string;
  marca: string;
  modelo: string;
  servicio: string;
  fecha: Date;
  hora: string;
  observaciones?: string | null;
};

export type ResultadoWhatsApp = {
  /** true cuando WhatsApp Web aceptó y envió el mensaje. */
  enviado: boolean;
  error?: string;
};

type EstadoWhatsApp = {
  cliente: Client | null;
  arrancando: Promise<void> | null;
  conectado: boolean;
};

// Igual que con Mongoose, guardamos el cliente en `globalThis` para que las
// recargas en caliente de Next.js no levanten un Chromium nuevo cada vez.
declare global {
  var __whatsappWeb: EstadoWhatsApp | undefined;
}

const estado: EstadoWhatsApp = global.__whatsappWeb ?? {
  cliente: null,
  arrancando: null,
  conectado: false,
};

global.__whatsappWeb = estado;

/** Arma el texto que recibe el cliente con toda la información de la reserva. */
export function construirMensajeReserva(datos: DatosReservaWhatsApp): string {
  const lineas = [
    "🏍️ *Urban Moto Gleam* — Confirmación de cita",
    "",
    `Código: ${datos.codigo}`,
    `Cliente: ${datos.nombre}`,
    `Cédula: ${datos.cedula}`,
    `Moto: ${datos.marca} ${datos.modelo} (${datos.placa})`,
    `Servicio: ${datos.servicio}`,
    `Fecha: ${formatoFechaHumano(datos.fecha)} a las ${datos.hora}`,
  ];

  if (datos.observaciones) {
    lineas.push(`Observaciones: ${datos.observaciones}`);
  }

  lineas.push("", "¡Te esperamos! Responde este mensaje si necesitas reprogramar.");

  return lineas.join("\n");
}

/** ¿El cliente de WhatsApp Web ya está autenticado y listo para enviar? */
export function whatsappConectado(): boolean {
  // `info` solo existe cuando la sesión quedó vinculada y lista.
  return Boolean(estado.conectado && estado.cliente?.info);
}

function crearCliente(): Client {
  const cliente = new Client({
    authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  cliente.on("qr", (qr) => {
    console.log("\n[WhatsApp] Escanea este código QR (WhatsApp → Dispositivos vinculados):\n");
    qrcode.generate(qr, { small: true });
    console.log("[WhatsApp] Esperando escaneo...\n");
  });

  cliente.on("authenticated", () => console.log("[WhatsApp] Sesión autenticada."));

  cliente.on("ready", () => {
    estado.conectado = true;
    console.log("[WhatsApp] Conectado. Ya se envían las confirmaciones automáticamente.");
  });

  cliente.on("auth_failure", (motivo) => {
    estado.conectado = false;
    console.error("[WhatsApp] Falló la autenticación:", motivo);
  });

  cliente.on("disconnected", (motivo) => {
    estado.conectado = false;
    console.warn("[WhatsApp] Desconectado:", motivo);
  });

  return cliente;
}

/**
 * Arranca el cliente de WhatsApp Web una sola vez.
 * Es idempotente: llamarlo de nuevo no crea otro cliente.
 */
export function iniciarWhatsApp(): void {
  if (estado.cliente || estado.arrancando) {
    return;
  }

  const cliente = crearCliente();
  estado.cliente = cliente;

  estado.arrancando = cliente
    .initialize()
    .catch((error) => {
      estado.conectado = false;
      estado.cliente = null;
      estado.arrancando = null;
      console.error(
        "[WhatsApp] No se pudo iniciar el cliente:",
        error instanceof Error ? error.message : error,
      );
    });
}

/**
 * Envía la confirmación de la reserva al WhatsApp del cliente usando WhatsApp Web.
 * Requiere que el cliente ya esté conectado (haber escaneado el QR una vez).
 */
export async function enviarWhatsAppReserva(
  datos: DatosReservaWhatsApp,
): Promise<ResultadoWhatsApp> {
  const numero = normalizarCelular(datos.celular);

  if (!numero) {
    return { enviado: false, error: "El cliente no tiene un número de celular válido." };
  }

  iniciarWhatsApp();

  if (!whatsappConectado() || !estado.cliente) {
    return {
      enviado: false,
      error: "WhatsApp Web todavía no está conectado. Escanea el QR que aparece en la terminal.",
    };
  }

  try {
    await estado.cliente.sendMessage(`${numero}@c.us`, construirMensajeReserva(datos));
    return { enviado: true };
  } catch (error) {
    return {
      enviado: false,
      error: error instanceof Error ? error.message : "Error desconocido al enviar por WhatsApp.",
    };
  }
}
