/**
 * Sesión firmada del panel de administración.
 *
 * Usa HMAC-SHA256 con la Web Crypto API, disponible tanto en el runtime
 * de Node como en el de Proxy, así el mismo código sirve en ambos.
 *
 * El token NO guarda la contraseña: solo el usuario y la fecha de expiración,
 * protegidos con una firma que impide que se alteren.
 */

export const COOKIE_SESION = "umg_admin_session";
/** Duración de la sesión: 8 horas. */
export const DURACION_SESION_SEGUNDOS = 8 * 60 * 60;

export type SesionAdmin = {
  usuario: string;
  /** Expiración en segundos UNIX. */
  exp: number;
};

function aBase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (const byte of bytes) {
    binario += String.fromCharCode(byte);
  }
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function desdeBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const normalizado = texto.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = normalizado + "=".repeat((4 - (normalizado.length % 4)) % 4);
  const binario = atob(relleno);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

async function claveHmac(): Promise<CryptoKey> {
  const secreto = process.env.AUTH_SECRET?.trim();

  if (!secreto || secreto.length < 32) {
    throw new Error(
      "AUTH_SECRET no está configurado (mínimo 32 caracteres). Revisa .env.local.",
    );
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Crea un token firmado para el usuario indicado. */
export async function firmarSesion(usuario: string): Promise<string> {
  const payload: SesionAdmin = {
    usuario,
    exp: Math.floor(Date.now() / 1000) + DURACION_SESION_SEGUNDOS,
  };

  const cuerpo = aBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const clave = await claveHmac();
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(cuerpo));

  return `${cuerpo}.${aBase64Url(new Uint8Array(firma))}`;
}

/** Verifica la firma y la expiración del token. Devuelve null si no es válido. */
export async function verificarSesion(token: string | undefined | null): Promise<SesionAdmin | null> {
  if (!token) {
    return null;
  }

  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) {
    return null;
  }

  try {
    const clave = await claveHmac();
    const firmaValida = await crypto.subtle.verify(
      "HMAC",
      clave,
      desdeBase64Url(firma),
      new TextEncoder().encode(cuerpo),
    );

    if (!firmaValida) {
      return null;
    }

    const payload = JSON.parse(new TextDecoder().decode(desdeBase64Url(cuerpo))) as SesionAdmin;

    if (!payload?.usuario || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/** Opciones de la cookie de sesión. */
export const opcionesCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  // `Secure` evita que la cookie viaje por HTTP. En producción se activa solo,
  // salvo que se desactive explícitamente (útil para demos por LAN sin HTTPS).
  secure: process.env.NODE_ENV === "production" && process.env.AUTH_COOKIE_SECURE !== "false",
  path: "/",
  maxAge: DURACION_SESION_SEGUNDOS,
};
