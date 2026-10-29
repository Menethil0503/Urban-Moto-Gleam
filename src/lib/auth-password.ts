import { scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Verifica una contraseña contra un hash con formato `scrypt:<saltHex>:<hashHex>`.
 *
 * - La contraseña NUNCA se guarda en texto plano; en `.env.local` solo vive el hash.
 * - `scryptSync` es deliberadamente lento, lo que dificulta la fuerza bruta.
 * - `timingSafeEqual` evita filtrar información por el tiempo de comparación.
 */
export function verificarContrasena(contrasena: string, hashAlmacenado: string): boolean {
  const partes = hashAlmacenado.trim().split(":");

  if (partes.length !== 3 || partes[0] !== "scrypt") {
    return false;
  }

  const [, saltHex, hashHex] = partes;

  try {
    const sal = Buffer.from(saltHex, "hex");
    const esperado = Buffer.from(hashHex, "hex");

    if (sal.length === 0 || esperado.length === 0) {
      return false;
    }

    const calculado = scryptSync(contrasena, sal, esperado.length);
    return timingSafeEqual(calculado, esperado);
  } catch {
    return false;
  }
}

/** Comparación en tiempo constante para el nombre de usuario. */
export function usuariosIguales(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}
