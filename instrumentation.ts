/**
 * Se ejecuta una vez al arrancar el servidor de Next.js.
 * Arrancamos aquí el cliente de WhatsApp Web para que el código QR aparezca
 * en la terminal desde el inicio y no en medio de una petición.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { iniciarWhatsApp } = await import("./src/lib/whatsapp");
    iniciarWhatsApp();
  }
}
